// Armazenamento local do projeto estático: não há servidor ou autenticação.
const SC_DEMO_COURSES=[
 {id:1,slug:'primeiros-passos',titulo:'Uso Básico do Computador',descricao:'Aprenda a utilizar o computador: componentes, mouse, teclado, arquivos, pastas e primeiros passos na internet.',duracao_minutos:90,ordem:1},
 {id:2,slug:'seguranca-digital',titulo:'Segurança na Internet e no Celular',descricao:'Aprenda a navegar com segurança, reconhecer golpes digitais e proteger informações no celular e computador.',duracao_minutos:80,ordem:2}
];
const SC_DEMO_LESSONS=[
 [1,1,'Conhecendo o computador','Um computador possui monitor, teclado, mouse e uma unidade de processamento. O monitor mostra informações; o teclado permite digitar; o mouse ajuda a selecionar itens. Ligue e desligue pelo comando do sistema para evitar perda de dados.','Qual componente permite digitar textos?','Monitor','Teclado','Caixa de som','B','https://www.youtube.com/watch?v=JdSTF0iYYhI'],
 [2,1,'Utilizando o mouse e o teclado','Clique uma vez para selecionar; dê dois cliques para abrir um arquivo; o clique direito apresenta opções. Use Enter para confirmar e Backspace para apagar. Pratique escrevendo seu nome em um editor de texto.','Qual tecla costuma apagar o caractere anterior?','Backspace','Shift','Caps Lock','A',''],
 [3,1,'Arquivos e pastas','Arquivos guardam documentos, imagens e outros conteúdos. Pastas organizam arquivos. Crie uma pasta chamada Estudos, salve um documento e dê um nome fácil de reconhecer.','Para que servem as pastas?','Aumentar a velocidade da internet','Organizar arquivos','Substituir as senhas','B',''],
 [4,1,'Navegando na internet','O navegador abre páginas da internet. Digite o endereço na barra superior e utilize a pesquisa para encontrar informações. Confira o endereço do site e evite baixar arquivos desconhecidos.','Onde digitamos o endereço de um site?','Na barra de endereços','Na lixeira','No relógio','A',''],
 [5,2,'Senhas e autenticação','Use senhas longas e diferentes para cada serviço. Um gerenciador de senhas ajuda a guardá-las. Quando disponível, ative a verificação em duas etapas. Nunca compartilhe códigos de confirmação.','Qual hábito ajuda a proteger suas contas?','Usar a mesma senha em tudo','Compartilhar códigos por mensagem','Ativar verificação em duas etapas','C','https://www.youtube.com/watch?v=KvPtIl-Gz2E'],
 [6,2,'Golpes na internet e no WhatsApp','Golpistas podem enviar links falsos por WhatsApp, SMS, e-mail ou redes sociais. Desconfie de pedidos urgentes de PIX e supostos familiares com número novo. Confirme por ligação em um contato já conhecido.','Alguém pede dinheiro por WhatsApp, dizendo ser familiar. O que fazer?','Confirmar por outro contato já conhecido','Enviar o dinheiro imediatamente','Compartilhar seu código de verificação','A',''],
 [7,2,'Privacidade e proteção do celular','Configure um bloqueio de tela com PIN forte ou biometria, mantenha os aplicativos atualizados e instale-os apenas de lojas confiáveis. Revise permissões de câmera, microfone e localização.','Qual medida ajuda a proteger o celular?','Desativar atualizações','Usar bloqueio de tela e manter aplicativos atualizados','Informar sua senha a desconhecidos','B',''],
 [8,2,'Navegação segura e proteção de contas','Use senhas longas e diferentes, ative a autenticação em duas etapas e faça backups. Desconfie de sites falsos. O cadeado HTTPS protege a conexão, mas não garante que o site seja legítimo.','Qual hábito ajuda a proteger suas contas?','Reutilizar a mesma senha','Compartilhar códigos recebidos por SMS','Ativar autenticação em duas etapas','C','']
].map(([id,curso_id,titulo,conteudo,atividade_pergunta,opcao_a,opcao_b,opcao_c,resposta_correta,video_url],i)=>({id,curso_id,titulo,conteudo,atividade_pergunta,opcao_a,opcao_b,opcao_c,resposta_correta,video_url,ordem:((i%4)+1)}));
const SC_STORE_KEY='seconecte_demo_v1';
// A verificação da senha ocorre no navegador. Isto não oferece autenticação de servidor.
const SC_PASSWORD_ITERATIONS=180000;
function scB64(bytes){return btoa(String.fromCharCode(...bytes));}
function scFromB64(value){return Uint8Array.from(atob(value),ch=>ch.charCodeAt(0));}
async function scPasswordHash(password,salt,iterations=SC_PASSWORD_ITERATIONS){
 if(!globalThis.crypto?.subtle)throw Error('Seu navegador não suporta a proteção de senha local. Utilize uma conexão HTTPS atualizada.');
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:scFromB64(salt),iterations,hash:'SHA-256'},key,256);
 return scB64(new Uint8Array(bits));
}
async function scSetPassword(profile,password){
 if(typeof password!=='string'||password.length<10||password.length>128)throw Error('Crie uma senha entre 10 e 128 caracteres.');
 const salt=new Uint8Array(16);crypto.getRandomValues(salt);
 profile.passwordSalt=scB64(salt);profile.passwordIterations=SC_PASSWORD_ITERATIONS;
 profile.passwordHash=await scPasswordHash(password,profile.passwordSalt,profile.passwordIterations);
}
async function scCheckPassword(profile,password){
 const expected=scFromB64(profile.passwordHash),actual=scFromB64(await scPasswordHash(password,profile.passwordSalt,profile.passwordIterations||SC_PASSWORD_ITERATIONS));
 if(actual.length!==expected.length)return false;
 let mismatch=0;for(let i=0;i<actual.length;i++)mismatch|=actual[i]^expected[i];
 return mismatch===0;
}
function scLoad(){
 try {const v=JSON.parse(localStorage.getItem(SC_STORE_KEY));if(v&&typeof v==='object'&&Array.isArray(v.perfis))return v;}catch{}
 return {perfis:[],ativo:null};
}
function scSave(db){try{localStorage.setItem(SC_STORE_KEY,JSON.stringify(db));}catch{throw Error('Seu navegador bloqueou o armazenamento local. Permita dados do site para salvar o progresso.');}}
function scId(){return globalThis.crypto?.randomUUID?.()||'SC-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);}
function scCurrent(db){return db.perfis.find(p=>p.id===db.ativo)||null;}
function scRequire(p){if(!p)throw Error('Acesse seu perfil para continuar.');return p;}
function scCourses(p){return SC_DEMO_COURSES.map(c=>({...c,total_aulas:4,aulas_concluidas:p?SC_DEMO_LESSONS.filter(a=>a.curso_id===c.id&&p.concluidas.includes(a.id)).length:0}));}
async function scDemoApi(action,data,params=''){
 const db=scLoad(),user=scCurrent(db);
 if(action==='bootstrap')return {csrf:'local',usuario:user?{id:user.id,nome:user.nome,email:user.email}:null,cursos:scCourses(user),certificados:user?.certificados||[]};
 if(action==='register'){
  const nome=String(data?.nome||'').trim().replace(/\s+/g,' '),email=String(data?.email||'').trim().toLowerCase();
  if(nome.length<3||nome.length>120||!/^\S+@\S+\.\S+$/.test(email)||email.length>160)throw Error('Informe nome completo e e-mail válido.');
  if(db.perfis.some(p=>p.email===email))throw Error('Este perfil já existe neste navegador. Use a opção Entrar.');
  const p={id:scId(),nome,email,concluidas:[],certificados:[],talento:null};
  await scSetPassword(p,data?.senha);
  db.perfis.push(p);db.ativo=p.id;scSave(db);return {ok:true};
 }
 if(action==='login'){
  const email=String(data?.email||'').trim().toLowerCase(),senha=data?.senha;
  const p=db.perfis.find(p=>p.email===email);
  if(!p||typeof senha!=='string'||!senha)throw Error('E-mail ou senha incorretos.');
  if(!p.passwordHash){
   // Transição dos perfis criados antes da exigência de senha, apenas no mesmo navegador.
   // A primeira senha escolhida neste dispositivo protege o perfil somente localmente.
   await scSetPassword(p,senha);
  }else if(!await scCheckPassword(p,senha))throw Error('E-mail ou senha incorretos.');
  db.ativo=p.id;scSave(db);return {ok:true};
 }
 if(action==='logout'){db.ativo=null;scSave(db);return {ok:true};}
 const p=scRequire(user);
 if(action==='course'){
  const slug=new URLSearchParams(params.replace(/^&/,'' )).get('slug'),curso=SC_DEMO_COURSES.find(c=>c.slug===slug);
  if(!curso)throw Error('Curso não encontrado.');
  return {curso,aulas:SC_DEMO_LESSONS.filter(a=>a.curso_id===curso.id).map(({resposta_correta,...a})=>({...a,concluida:p.concluidas.includes(a.id)?1:0}))};
 }
 if(action==='talento')return {perfil:p.talento||null};
 if(action==='talento_salvar'){
  const cidade=String(data?.cidade||'').trim(),objetivo=String(data?.objetivo||'').trim(),habilidades=String(data?.habilidades||'').trim();
  const disponibilidade=String(data?.disponibilidade||'qualquer');
  if(cidade.length>120||objetivo.length>180||habilidades.length>1500||!['presencial','remoto','hibrido','qualquer'].includes(disponibilidade))throw Error('Revise os dados informados.');
  p.talento={cidade,objetivo,habilidades,disponibilidade,autorizo_contato:data?.autorizo_contato===true?1:0,atualizado_em:new Date().toISOString()};
  scSave(db);return {ok:true};
 }
 if(action==='lesson'){
  const aula=SC_DEMO_LESSONS.find(l=>l.id===Number(data?.aula_id));
  if(!aula||!['A','B','C'].includes(data?.resposta))throw Error('Resposta inválida.');
  if(aula.resposta_correta!==data.resposta)throw Error('Não foi dessa vez. Revise o conteúdo e tente novamente.');
  if(!p.concluidas.includes(aula.id))p.concluidas.push(aula.id);
  const c=SC_DEMO_COURSES.find(c=>c.id===aula.curso_id);
  const total=SC_DEMO_LESSONS.filter(a=>a.curso_id===c.id).length;
  const concluidas=SC_DEMO_LESSONS.filter(a=>a.curso_id===c.id&&p.concluidas.includes(a.id)).length;
  let certificado_emitido=false;
  if(total===concluidas&&!p.certificados.some(cert=>cert.curso_id===c.id)){
   p.certificados.push({codigo:scId(),curso_id:c.id,nome_emitido:p.nome,titulo_emitido:c.titulo,total_aulas:total,emitido_em:new Date().toISOString()});
   certificado_emitido=true;
  }
  scSave(db);return {ok:true,correta:true,concluidas,total,certificado_emitido};
 }
 throw Error('Ação desconhecida.');
}
