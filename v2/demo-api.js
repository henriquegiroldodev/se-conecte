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
const SC_DEFAULT_JOBS=[
 {id:'base-1',titulo:'Auxiliar Administrativo',empresa:'Empresa Horizonte (fictícia)',local:'Marília · SP',tipo:'Presencial',descricao:'Organização de documentos, planilhas básicas e apoio às rotinas de escritório.',requisitos:'Noções de computador e comunicação.',origem:'exemplo'},
 {id:'base-2',titulo:'Atendente de Suporte Digital',empresa:'Conecta Serviços (fictícia)',local:'Remoto',tipo:'Remoto',descricao:'Orientação inicial sobre aplicativos e registro de solicitações de atendimento.',requisitos:'Conhecimentos de internet e atendimento.',origem:'exemplo'},
 {id:'base-3',titulo:'Assistente de Cadastro',empresa:'Nova Jornada (fictícia)',local:'Marília · SP',tipo:'Híbrido',descricao:'Atualização de registros e conferência de informações em sistemas administrativos.',requisitos:'Atenção aos detalhes e noções de informática.',origem:'exemplo'},
 {id:'base-4',titulo:'Auxiliar de Loja',empresa:'Comércio Integra (fictícia)',local:'Marília · SP',tipo:'Presencial',descricao:'Apoio ao atendimento, consulta de produtos e organização de pedidos.',requisitos:'Comunicação e disposição para aprender.',origem:'exemplo'}
];
function scJobs(db){
 const ocultas=new Set(Array.isArray(db.hiddenJobs)?db.hiddenJobs:[]);
 return [...SC_DEFAULT_JOBS.filter(v=>!ocultas.has(v.id)),...(Array.isArray(db.customJobs)?db.customJobs:[])];
}
function scCatalog(db){
 const courses=[...SC_DEMO_COURSES,...(Array.isArray(db.customCourses)?db.customCourses:[])];
 const lessons=[...SC_DEMO_LESSONS.map(l=>({...l,video_url:Object.hasOwn(db.videoOverrides||{},String(l.id))?db.videoOverrides[l.id]:l.video_url})),...(Array.isArray(db.customLessons)?db.customLessons:[])];
 return {courses,lessons};
}
function scCourses(p,db){
 const cat=scCatalog(db);
 return cat.courses.map(c=>{
  const aulas=cat.lessons.filter(a=>a.curso_id===c.id);
  return {...c,total_aulas:aulas.length,aulas_concluidas:p?aulas.filter(a=>(p.concluidas||[]).includes(a.id)).length:0};
 });
}
function scValidateVideo(value){
 const url=String(value||'').trim();
 if(!url)return '';
 if(url.length>1000)throw Error('O endereço do vídeo é muito longo.');
 let u;try{u=new URL(url);}catch{throw Error('Informe uma URL completa do YouTube iniciada por https://.');}
 if(u.protocol!=='https:'||!['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(u.hostname.toLowerCase()))throw Error('Use um endereço HTTPS do YouTube.');
 const part=u.pathname.match(/^\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})(?:\/|$)/);
 const vid=u.hostname==='youtu.be'?u.pathname.split('/')[1]:(u.searchParams.get('v')||(part&&part[1]));
 if(!/^[a-zA-Z0-9_-]{11}$/.test(vid||''))throw Error('O link do YouTube não contém um vídeo válido.');
 return 'https://www.youtube.com/watch?v='+vid;
}
async function scDemoApi(action,data,params=''){
 const db=scLoad(),user=scCurrent(db);
 if(action==='bootstrap')return {csrf:'local',usuario:user?{id:user.id,nome:user.nome,email:user.email}:null,cursos:scCourses(user,db),certificados:user?.certificados||[]};
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
  // Perfil local de apresentação: não concede permissões de administrador.
  if(email==='admin'){
   if(senha!=='admin')throw Error('E-mail ou senha incorretos.');
   let admin=db.perfis.find(p=>p.id==='sc-local-admin');
   if(!admin){
    admin={id:'sc-local-admin',nome:'Administrador',email:'admin',concluidas:[],certificados:[],talento:null};
    db.perfis.push(admin);
   }
   db.ativo=admin.id;scSave(db);return {ok:true};
  }
  // Conta de aluno para apresentação; os dados permanecem somente neste navegador.
  if(email==='usuario@usuario.com'){
   if(senha!=='usuario123')throw Error('E-mail ou senha incorretos.');
   let aluno=db.perfis.find(p=>p.email===email);
   if(!aluno){
    aluno={id:scId(),nome:'Usuário de Teste',email,concluidas:[],certificados:[],talento:null};
    await scSetPassword(aluno,senha);
    db.perfis.push(aluno);
   }
   db.ativo=aluno.id;scSave(db);return {ok:true};
  }
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
 // Área administrativa local: só gerencia os perfis deste navegador.
 // A condição abaixo é uma conveniência de interface, não uma segurança de servidor.
 if(action.startsWith('admin_')){
  if(user?.id!=='sc-local-admin')throw Error('Acesso restrito ao perfil de administração local.');
  const alunos=db.perfis.filter(p=>p.id!=='sc-local-admin');
  const cat=scCatalog(db);
  if(action==='admin_overview'){
   return {
    alunos:alunos.map(p=>({id:p.id,nome:p.nome,email:p.email,aulas:(p.concluidas||[]).length,certificados:(p.certificados||[]).length,tem_talento:!!p.talento})),
    indicadores:{alunos:alunos.length,aulas_concluidas:alunos.reduce((n,p)=>n+(p.concluidas||[]).length,0),certificados:alunos.reduce((n,p)=>n+(p.certificados||[]).length,0),talentos:alunos.filter(p=>!!p.talento).length},
    cursos:cat.courses.map(c=>({id:c.id,slug:c.slug,titulo:c.titulo,duracao_minutos:c.duracao_minutos,aulas:cat.lessons.filter(a=>a.curso_id===c.id).length})),
    videoaulas:cat.lessons.map(a=>({id:a.id,curso_id:a.curso_id,curso:cat.courses.find(c=>c.id===a.curso_id)?.titulo||'',titulo:a.titulo,video_url:a.video_url||''})),
    vagas:scJobs(db)
   };
  }
  if(action==='admin_update_video'){
   const aula=cat.lessons.find(a=>a.id===Number(data?.aula_id));
   if(!aula)throw Error('Aula não encontrada.');
   const url=scValidateVideo(data?.video_url);
   if(!db.videoOverrides)db.videoOverrides={};
   if(aula.id<=SC_DEMO_LESSONS.length)db.videoOverrides[aula.id]=url;
   else {const custom=(db.customLessons||[]).find(a=>a.id===aula.id);if(!custom)throw Error('Aula não encontrada.');custom.video_url=url;}
   scSave(db);return {ok:true};
  }
  if(action==='admin_add_course'){
   const titulo=String(data?.titulo||'').trim().replace(/\s+/g,' ');
   const descricao=String(data?.descricao||'').trim();
   const aulaTitulo=String(data?.aula_titulo||'Introdução').trim();
   const duracao=Number(data?.duracao_minutos);
   const video=scValidateVideo(data?.video_url);
   if(titulo.length<5||titulo.length>120||descricao.length<12||descricao.length>500||aulaTitulo.length<3||aulaTitulo.length>120||!Number.isInteger(duracao)||duracao<5||duracao>1200)throw Error('Confira o título, a descrição, a aula inicial e a duração do curso.');
   const id=Math.max(0,...cat.courses.map(c=>c.id))+1;
   const aulaId=Math.max(0,...cat.lessons.map(a=>a.id))+1;
   const slug='curso-'+id;
   if(!db.customCourses)db.customCourses=[];
   if(!db.customLessons)db.customLessons=[];
   db.customCourses.push({id,slug,titulo,descricao,duracao_minutos:duracao,ordem:cat.courses.length+1});
   db.customLessons.push({id:aulaId,curso_id:id,titulo:aulaTitulo,ordem:1,
    conteudo:'Assista à videoaula e anote os principais pontos. Depois, responda à atividade para registrar sua conclusão.',
    atividade_pergunta:'Qual atitude ajuda mais a aproveitar esta aula?',
    opcao_a:'Não prestar atenção ao conteúdo',opcao_b:'Assistir, anotar e revisar os pontos principais',opcao_c:'Compartilhar senhas pessoais',
    resposta_correta:'B',video_url:video});
   scSave(db);return {ok:true,curso_id:id};
  }
  if(action==='admin_add_job'){
   const titulo=String(data?.titulo||'').trim().replace(/\s+/g,' ');
   const empresa=String(data?.empresa||'').trim().replace(/\s+/g,' ');
   const local=String(data?.local||'').trim().replace(/\s+/g,' ');
   const tipo=String(data?.tipo||'').trim();
   const descricao=String(data?.descricao||'').trim();
   const requisitos=String(data?.requisitos||'').trim();
   if(titulo.length<4||titulo.length>120||empresa.length<2||empresa.length>120||local.length<2||local.length>120||!['Presencial','Remoto','Híbrido'].includes(tipo)||descricao.length<12||descricao.length>800||requisitos.length<5||requisitos.length>500)throw Error('Preencha todos os campos da vaga com informações válidas.');
   if(!Array.isArray(db.customJobs))db.customJobs=[];
   if(db.customJobs.length>=100)throw Error('Limite de 100 vagas locais atingido.');
   const id=scId();
   db.customJobs.push({id,titulo,empresa,local,tipo,descricao,requisitos,origem:'local'});
   scSave(db);return {ok:true,id};
  }
  if(action==='admin_delete_job'){
   const id=String(data?.id||'');
   if(!scJobs(db).some(v=>v.id===id))throw Error('Vaga não encontrada neste navegador.');
   if(SC_DEFAULT_JOBS.some(v=>v.id===id)){
    if(!Array.isArray(db.hiddenJobs))db.hiddenJobs=[];
    if(!db.hiddenJobs.includes(id))db.hiddenJobs.push(id);
   }else{
    db.customJobs=(db.customJobs||[]).filter(v=>v.id!==id);
   }
   scSave(db);return {ok:true};
  }
  if(action==='admin_reset_progress'){
   const alvo=alunos.find(p=>p.id===data?.id);
   if(!alvo)throw Error('Aluno não encontrado neste navegador.');
   alvo.concluidas=[];alvo.certificados=[];scSave(db);return {ok:true};
  }
  if(action==='admin_delete_profile'){
   const index=db.perfis.findIndex(p=>p.id===data?.id&&p.id!=='sc-local-admin');
   if(index<0)throw Error('Aluno não encontrado neste navegador.');
   db.perfis.splice(index,1);scSave(db);return {ok:true};
  }
  throw Error('Ação administrativa desconhecida.');
 }
 const p=scRequire(user);
 if(action==='course'){
  const slug=new URLSearchParams(params.replace(/^&/,'' )).get('slug'),cat=scCatalog(db),curso=cat.courses.find(c=>c.slug===slug);
  if(!curso)throw Error('Curso não encontrado.');
  return {curso,aulas:cat.lessons.filter(a=>a.curso_id===curso.id).map(({resposta_correta,...a})=>({...a,concluida:(p.concluidas||[]).includes(a.id)?1:0}))};
 }
 if(action==='talento')return {perfil:p.talento||null,vagas:scJobs(db)};
 if(action==='talento_salvar'){
  const cidade=String(data?.cidade||'').trim(),objetivo=String(data?.objetivo||'').trim(),habilidades=String(data?.habilidades||'').trim();
  const disponibilidade=String(data?.disponibilidade||'qualquer');
  if(cidade.length>120||objetivo.length>180||habilidades.length>1500||!['presencial','remoto','hibrido','qualquer'].includes(disponibilidade))throw Error('Revise os dados informados.');
  p.talento={cidade,objetivo,habilidades,disponibilidade,autorizo_contato:data?.autorizo_contato===true?1:0,atualizado_em:new Date().toISOString()};
  scSave(db);return {ok:true};
 }
 if(action==='lesson'){
  const cat=scCatalog(db),aula=cat.lessons.find(l=>l.id===Number(data?.aula_id));
  if(!aula||!['A','B','C'].includes(data?.resposta))throw Error('Resposta inválida.');
  if(aula.resposta_correta!==data.resposta)throw Error('Não foi dessa vez. Revise o conteúdo e tente novamente.');
  if(!p.concluidas.includes(aula.id))p.concluidas.push(aula.id);
  const c=cat.courses.find(c=>c.id===aula.curso_id);
  const total=cat.lessons.filter(a=>a.curso_id===c.id).length;
  const concluidas=cat.lessons.filter(a=>a.curso_id===c.id&&p.concluidas.includes(a.id)).length;
  let certificado_emitido=false;
  if(total===concluidas&&!p.certificados.some(cert=>cert.curso_id===c.id)){
   p.certificados.push({codigo:scId(),curso_id:c.id,nome_emitido:p.nome,titulo_emitido:c.titulo,total_aulas:total,emitido_em:new Date().toISOString()});
   certificado_emitido=true;
  }
  scSave(db);return {ok:true,correta:true,concluidas,total,certificado_emitido};
 }
 throw Error('Ação desconhecida.');
}
