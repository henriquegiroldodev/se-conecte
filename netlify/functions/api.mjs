import pg from 'pg';
import bcrypt from 'bcryptjs';
import {randomBytes,randomUUID,createHmac,timingSafeEqual} from 'node:crypto';
const {Pool}=pg;
let pool;
const fail=(status,message)=>{throw Object.assign(new Error(message),{status})};
const eq=(a,b)=>typeof a==='string'&&typeof b==='string'&&Buffer.byteLength(a)===Buffer.byteLength(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
const sign=s=>createHmac('sha256',process.env.SESSION_SECRET).update(s).digest('base64url');
const token=()=>randomBytes(32).toString('hex');
function session(event){
 try{const raw=(event.headers.cookie||'').match(/(?:^|;\s*)sc_session=([^;]+)/)?.[1];const [s,h]=raw.split('.');if(eq(sign(s),h)){const v=JSON.parse(Buffer.from(s,'base64url'));if(v.exp>Date.now())return v}}catch{}
 return {id:0,csrf:token(),exp:Date.now()+86400000};
}
function cookie(s){const v=Buffer.from(JSON.stringify(s)).toString('base64url');return 'sc_session='+v+'.'+sign(v)+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400'}
const str=x=>typeof x==='string'?x.trim():'';
export async function handler(event){
 let s,client,transaction=false;
 const reply=(body,status=200)=>({statusCode:status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(s?{'Set-Cookie':cookie(s)}:{})},body:JSON.stringify(body)});
 try{
 if(!process.env.DATABASE_URL||!process.env.SESSION_SECRET||process.env.SESSION_SECRET.length<32)fail(503,'Configure DATABASE_URL e SESSION_SECRET no Netlify.');
 s=session(event);
 pool??=new Pool({connectionString:process.env.DATABASE_URL,max:2,connectionTimeoutMillis:5000});
 client=await pool.connect();
 const q=async(sql,args=[]) => (await client.query(sql,args)).rows;
 const one=async(sql,args=[]) => (await q(sql,args))[0];
 const uid=()=>{if(!s.id)fail(401,'Faça login para continuar.');return s.id};
 const a=event.queryStringParameters?.action||'bootstrap',method=event.httpMethod;
 if(method==='GET'){
 if(a==='bootstrap'){
 const usuario=s.id?await one('SELECT id,nome,email FROM usuarios WHERE id=$1',[s.id]):null;
 if(!usuario)s.id=0;
 return reply({csrf:s.csrf,usuario:usuario||null,cursos:s.id?await q('SELECT c.id,c.slug,c.titulo,c.descricao,c.duracao_minutos,COUNT(DISTINCT a.id)::int total_aulas,COUNT(DISTINCT ac.aula_id)::int aulas_concluidas FROM sc_cursos c LEFT JOIN sc_aulas a ON a.curso_id=c.id LEFT JOIN sc_aulas_concluidas ac ON ac.aula_id=a.id AND ac.usuario_id=$1 WHERE c.ativo GROUP BY c.id ORDER BY c.ordem',[s.id]):[],certificados:s.id?await q('SELECT codigo,curso_id,nome_emitido,titulo_emitido,total_aulas,emitido_em FROM sc_certificados WHERE usuario_id=$1 ORDER BY emitido_em DESC',[s.id]):[]});
 }
 if(a==='course'){const id=uid();const curso=await one('SELECT id,slug,titulo,descricao,duracao_minutos FROM sc_cursos WHERE slug=$1 AND ativo',[event.queryStringParameters?.slug]);if(!curso)fail(404,'Curso não encontrado.');return reply({curso,aulas:await q('SELECT a.id,a.titulo,a.conteudo,a.video_url,a.atividade_pergunta,a.opcao_a,a.opcao_b,a.opcao_c,a.ordem,CASE WHEN ac.aula_id IS NULL THEN 0 ELSE 1 END concluida FROM sc_aulas a LEFT JOIN sc_aulas_concluidas ac ON ac.aula_id=a.id AND ac.usuario_id=$1 WHERE a.curso_id=$2 ORDER BY a.ordem',[id,curso.id])});}
 if(a==='talento')return reply({perfil:await one('SELECT cidade,objetivo,habilidades,disponibilidade,autorizo_contato::int,atualizado_em FROM sc_talentos WHERE usuario_id=$1',[uid()])||null});
 fail(404,'Rota não encontrada.');
 }
 if(method!=='POST')fail(405,'Método não permitido.');
 if(!eq(s.csrf,event.headers['x-csrf-token']))fail(419,'Sessão expirada. Recarregue a página.');
 if((event.body||'').length>20000)fail(413,'Dados muito extensos.');
 let d;try{d=JSON.parse(event.body||'{}')}catch{fail(400,'Dados inválidos.')}
 if(!d||typeof d!=='object')fail(400,'Dados inválidos.');
 if(a==='register'||a==='login'){
 const email=str(d.email).toLowerCase(),nome=str(d.nome).replace(/\s+/g,' '),senha=typeof d.senha==='string'?d.senha:'';
 if(email.length>160||senha.length>128)fail(422,'Dados inválidos.');
 if(a==='register'){
 if(nome.length<3||nome.length>120||!/^\S+@\S+\.\S+$/.test(email)||senha.length<10||Buffer.byteLength(senha)>72)fail(422,'Informe nome, e-mail válido e senha de 10 a 72 bytes.');
 const u=await one('INSERT INTO usuarios(nome,email,senha_hash) VALUES($1,$2,$3) ON CONFLICT(email) DO NOTHING RETURNING id',[nome,email,await bcrypt.hash(senha,12)]);
 if(!u)fail(409,'E-mail já cadastrado.');s.id=u.id;
 }else{const u=await one('SELECT id,senha_hash FROM usuarios WHERE email=$1',[email]);if(!u||!await bcrypt.compare(senha,u.senha_hash.replace(/^\$2y\$/,'$2b$')))fail(401,'E-mail ou senha incorretos.');s.id=u.id;}
 s.exp=Date.now()+86400000;return reply({ok:true});
 }
 if(a==='logout'){s={id:0,csrf:token(),exp:Date.now()+86400000};return reply({ok:true});}
 const id=uid();
 if(a==='talento_salvar'){
 const city=str(d.cidade),obj=str(d.objetivo),skills=str(d.habilidades),mode=str(d.disponibilidade)||'qualquer';
 if(city.length>120||obj.length>180||skills.length>1500||!['presencial','remoto','hibrido','qualquer'].includes(mode))fail(422,'Revise os dados do perfil.');
 await q('INSERT INTO sc_talentos(usuario_id,cidade,objetivo,habilidades,disponibilidade,autorizo_contato) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(usuario_id) DO UPDATE SET cidade=EXCLUDED.cidade,objetivo=EXCLUDED.objetivo,habilidades=EXCLUDED.habilidades,disponibilidade=EXCLUDED.disponibilidade,autorizo_contato=EXCLUDED.autorizo_contato,atualizado_em=NOW()',[id,city,obj,skills,mode,d.autorizo_contato===true]);return reply({ok:true});
 }
 if(a==='lesson'){
 const lid=Number(d.aula_id);if(!Number.isSafeInteger(lid)||lid<=0||!['A','B','C'].includes(d.resposta))fail(422,'Resposta inválida.');
 const lesson=await one('SELECT a.curso_id,a.resposta_correta,c.titulo FROM sc_aulas a JOIN sc_cursos c ON c.id=a.curso_id AND c.ativo WHERE a.id=$1',[lid]);if(!lesson)fail(404,'Aula não encontrada.');
 if(d.resposta!==lesson.resposta_correta)fail(422,'Não foi dessa vez. Revise o conteúdo e tente novamente.');
 await q('BEGIN');transaction=true;
 const u=await one('SELECT nome FROM usuarios WHERE id=$1 FOR UPDATE',[id]);if(!u)fail(401,'Conta não encontrada.');
 await q('INSERT INTO sc_aulas_concluidas(usuario_id,aula_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[id,lid]);
 const {total,done}=await one('SELECT COUNT(a.id)::int total,COUNT(ac.aula_id)::int done FROM sc_aulas a LEFT JOIN sc_aulas_concluidas ac ON ac.aula_id=a.id AND ac.usuario_id=$1 WHERE a.curso_id=$2',[id,lesson.curso_id]);
 let issued=false;if(total>0&&done===total)issued=!!await one('INSERT INTO sc_certificados(codigo,usuario_id,curso_id,nome_emitido,titulo_emitido,total_aulas) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(usuario_id,curso_id) DO NOTHING RETURNING codigo',[randomUUID(),id,lesson.curso_id,u.nome,lesson.titulo,total]);
 await q('COMMIT');transaction=false;return reply({ok:true,correta:true,concluidas:done,total,certificado_emitido:issued});
 }
 fail(404,'Rota não encontrada.');
 }catch(e){if(transaction)await client.query('ROLLBACK').catch(()=>{});if(!e.status)console.error('Se Conecte API:',e.code||e.name);return reply({erro:e.status?e.message:'Confira a configuração e instalação do banco PostgreSQL.'},e.status||500)}finally{client?.release()}
}
