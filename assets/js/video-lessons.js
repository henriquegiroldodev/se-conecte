// Catálogo editorial: vídeos externos incorporados, sem download ou reprodução automática.
window.SCVideoLessons = (() => {
  const basic = [
    {title:'Conhecendo o computador', video:'JdSTF0iYYhI', source:'Informática Básica — O que é um computador?', text:'O computador recebe informações, processa tarefas e apresenta resultados. Monitor, teclado e mouse ajudam você a interagir com os programas.', steps:['Identifique o monitor, o teclado e o mouse ou touchpad.', 'Abra um programa pelo menu do seu computador.', 'Digite uma frase e use a tecla de apagar para corrigir.'], question:'Qual equipamento ajuda a digitar um texto?', options:['Monitor','Teclado','Caixa de som'], correct:1},
    {title:'Organizando arquivos e pastas', video:'7DH3CHCuYSI', source:'Informática Básica: Windows — Arquivos e Pastas', text:'Arquivos guardam conteúdos, como fotos e documentos. Pastas ajudam a organizar esses arquivos. Use nomes claros para encontrar seu trabalho depois.', steps:['Abra o explorador de arquivos do computador.', 'Crie uma pasta chamada Meus estudos.', 'Salve um documento de teste nessa pasta e tente abri-lo novamente.'], question:'Para que serve uma pasta?', options:['Organizar arquivos','Aumentar a velocidade da internet','Proteger automaticamente todas as senhas'], correct:0}
  ];
  const security = [
    {title:'Primeiros cuidados na internet', video:'KvPtIl-Gz2E', source:'Curso em Vídeo — Segurança da Informação, Módulo 0', text:'Na internet, proteja suas contas e seus dados. Desconfie de pedidos urgentes, mantenha seus aplicativos atualizados e confirme mensagens por um canal conhecido.', steps:['Leia a mensagem antes de agir.', 'Não informe senhas nem códigos recebidos por mensagem.', 'Confirme pedidos de dinheiro por outro canal que você já conhece.'], question:'Uma mensagem pede sua senha com urgência. O que fazer?', options:['Enviar a senha','Confirmar por um canal oficial conhecido, sem fornecer a senha','Encaminhar a senha para um amigo'], correct:1},
    {title:'Criando senhas mais seguras', video:'whSgBpNyr2c', source:'Curso em Vídeo — Cuidados com as Senhas', text:'Use senhas longas e diferentes para cada conta. Um gerenciador de senhas pode ajudar. Ative a verificação em duas etapas sempre que estiver disponível.', steps:['Evite nomes, aniversários e sequências como 123456.', 'Use uma senha diferente em cada serviço.', 'Procure a opção de verificação em duas etapas nas configurações da conta.'], question:'Qual hábito protege melhor suas contas?', options:['Repetir a mesma senha em todos os sites','Usar a data de nascimento','Usar senhas longas e diferentes e ativar duas etapas'], correct:2},
    {title:'Usando suas senhas com cuidado', video:'8goOO4f6ffs', source:'Curso em Vídeo — Como usar sua senha corretamente', text:'Não compartilhe senhas nem códigos de acesso. Antes de entrar em uma conta, confira o endereço do site. Em computadores compartilhados, encerre a sessão ao terminar.', steps:['Abra o serviço pelo aplicativo oficial ou endereço conhecido.', 'Nunca forneça códigos de acesso para quem entrar em contato com você.', 'Saia da conta ao usar um computador compartilhado.'], question:'Ao terminar de usar seu e-mail em um computador compartilhado, você deve:', options:['Deixar a conta aberta','Encerrar a sessão','Salvar a senha no navegador'], correct:1}
  ];
  const catalog = { 'informatica-basica':basic, seguranca:security };
  SC.courses.push({id:'informatica-basica',icon:'💻',title:'Informática básica: primeiros passos',cat:'Primeiros passos',catId:'basico',desc:'Conheça o computador e aprenda a organizar arquivos com videoaulas e prática.',duration:'2 videoaulas + prática',xp:100,progress:0,color:'blue',lessons:basic.map(x=>x.title)});
  const course = SC.courses.find(c=>c.id==='seguranca');
  course.lessons=security.map(x=>x.title); course.duration='3 videoaulas + prática';
  function completed(id) { const saved=SCStore.read('sc_video_lessons',{}); return Array.isArray(saved?.[id])?saved[id]:[]; }
  function player(item) {
    return `<section class="lesson-video" aria-label="Vídeo da aula"><div class="video-frame"><button type="button" class="btn primary" data-load-video="${item.video}">▶ Carregar vídeo da aula</button></div><p><b>${item.source}</b></p><p>O vídeo usa o YouTube e precisa de internet. Ative as legendas no player, quando disponíveis.</p><a class="link" href="https://www.youtube.com/watch?v=${item.video}" target="_blank" rel="noopener noreferrer">Assistir no YouTube (abre nova aba)</a><p class="muted">Se o vídeo não abrir, use o link acima ou continue pelo resumo e pela prática abaixo.</p></section>`;
  }
  function view(id, raw) {
    const items=catalog[id]; if(!items)return null;
    const number=Number(raw), index=Number.isFinite(number)?Math.max(0,Math.min(items.length-1,Math.trunc(number)-1)):0;
    const item=items[index];
    return `<div class="main-page"><div class="container"><nav class="meta" aria-label="Caminho da página"><a href="#/curso/${id}">Voltar ao curso</a><span>› Aula ${index+1}</span></nav><div class="page-head"><div><span class="eyebrow">VIDEOAULA · NO SEU RITMO</span><h1>${item.title}</h1></div></div><div class="lesson-layout"><article class="card lesson-content">${player(item)}<section><h2>Resumo da aula</h2><p>${item.text}</p><h2>Pratique no seu ritmo</h2><ol>${item.steps.map(s=>`<li>${s}</li>`).join('')}</ol></section><fieldset class="practice-question"><legend>${item.question}</legend>${item.options.map((option,i)=>`<button type="button" class="answer-option" data-video-answer="${i}" aria-pressed="false">${option}</button>`).join('')}</fieldset><p id="videoFeedback" role="status"></p><div class="lesson-actions"><a class="btn outline" href="${index?`#/aula/${id}/${index}`:`#/curso/${id}`}">← Voltar</a><button class="btn primary" id="completeVideoLesson" disabled>Concluir aula</button></div><p id="videoSaved" role="status">${completed(id).includes(index)?'Você já concluiu esta aula. Pode revisar quando quiser.':''}</p></article><aside class="card lesson-side"><h2>Aulas deste curso</h2><div class="lesson-list">${items.map((x,i)=>`<a class="lesson" href="#/aula/${id}/${i+1}" ${index===i?'aria-current="page"':''}>${completed(id).includes(i)?'✓':i+1} · ${x.title}</a>`).join('')}</div><button class="btn outline full" data-speak=".lesson-content">🔊 Ouvir conteúdo escrito</button><p>Leia ou assista, pratique e responda para concluir. O progresso fica salvo neste navegador.</p></aside></div></div></div>`;
  }
  function bind() {
    document.querySelectorAll('[data-load-video]').forEach(button=>button.onclick=()=>{
      const frame=document.createElement('iframe'); frame.src=`https://www.youtube-nocookie.com/embed/${button.dataset.loadVideo}?rel=0&cc_load_policy=1&cc_lang_pref=pt`;
      frame.title='Vídeo da aula'; frame.allow='encrypted-media; picture-in-picture; fullscreen'; frame.allowFullscreen=true; frame.referrerPolicy='strict-origin-when-cross-origin'; button.parentElement.replaceChildren(frame);
    });
    const [, ,id,raw]=location.hash.split('/'), items=catalog[id];
    if(!items||!document.querySelector('#completeVideoLesson'))return;
    const index=Math.max(0,Math.min(items.length-1,(Math.trunc(Number(raw))||1)-1)), item=items[index];
    document.querySelectorAll('[data-video-answer]').forEach(button=>button.onclick=()=>{
      document.querySelectorAll('[data-video-answer]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      const correct=Number(button.dataset.videoAnswer)===item.correct;
      document.querySelector('#videoFeedback').textContent=correct?'✓ Boa escolha! Você pode concluir a aula.':'Vamos tentar de novo. Releia o resumo e escolha outra resposta.';
      document.querySelector('#completeVideoLesson').disabled=!correct;
    });
    document.querySelector('#completeVideoLesson').onclick=()=>{
      const saved=SCStore.read('sc_video_lessons',{}), data=saved&&typeof saved==='object'&&!Array.isArray(saved)?saved:{};
      data[id]=[...new Set([...completed(id),index])]; SCStore.write('sc_video_lessons',data);
      const progress=Math.round(data[id].length/items.length*100); state.progress[id]=progress; SC.courses.find(c=>c.id===id).progress=progress; SCStore.write('sc_progress',state.progress);
      SCCertificates.sync();
      if(progress===100){location.hash='#/certificados/'+id;return;}
      location.hash=index+1<items.length?`#/aula/${id}/${index+2}`:`#/curso/${id}`;
    };
  }
  return {view,bind};
})();
