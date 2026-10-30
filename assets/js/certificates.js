window.SCCertificates = (() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const fullName = () => {
    const profile = SCStore.read('sc_profile', {});
    return typeof profile?.fullName === 'string' ? profile.fullName.trim().replace(/\s+/g, ' ') : 'Henrique Giroldo';
  };
  const validName = name => name.length <= 150 && name.split(' ').filter(part => /\p{L}/u.test(part)).length >= 2;
  function records() {
    const saved = SCStore.read('sc_certificates_v1', []);
    return Array.isArray(saved) ? saved.filter(item => item && typeof item.courseId === 'string' && typeof item.name === 'string' && typeof item.code === 'string' && !Number.isNaN(Date.parse(item.issuedAt))) : [];
  }
  function sync() {
    const name = fullName();
    if (!validName(name)) return;
    const list = records(); let changed = false;
    SC.courses.filter(course => course.progress === 100).forEach(course => {
      if (list.some(record => record.courseId === course.id)) return;
      list.push({courseId:course.id, title:course.title, name, lessons:course.lessons.length, issuedAt:new Date().toISOString(), code:'SC-' + (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`).toUpperCase()});
      changed = true;
    });
    if (changed) { SCStore.write('sc_certificates_v1', list); document.dispatchEvent(new CustomEvent('sc:certificate-issued')); }
  }
  const date = value => new Date(value).toLocaleDateString('pt-BR', {timeZone:'America/Sao_Paulo'});
  function view(id) {
    sync();
    const list = records(), item = list.find(record => record.courseId === id);
    if (id && item) return `<div class="main-page"><div class="container"><div class="page-head certificate-controls"><div><h1>Seu certificado</h1><p>Na janela de impressão, escolha “Salvar como PDF” para baixar.</p></div><a class="btn outline" href="#/certificados">← Meus certificados</a></div><article class="certificate-paper" aria-label="Certificado de conclusão"><span class="eyebrow">SE CONECTE · APRENDIZAGEM DIGITAL</span><div class="certificate-seal" aria-hidden="true">✦</div><h2>Certificado de conclusão</h2><p>Certificamos que</p><strong class="certificate-name">${escape(item.name)}</strong><p>concluiu o minicurso</p><h3>${escape(item.title)}</h3><p>com ${escape(item.lessons)} aulas, na plataforma Se Conecte.</p><p>Data de conclusão: <b>${date(item.issuedAt)}</b></p><footer><b>Se Conecte</b><p>Identificação do certificado</p><small>${escape(item.code)}</small></footer></article><div class="lesson-actions certificate-controls"><button class="btn primary" id="printCertificate">Imprimir / Salvar como PDF</button><a class="btn outline" href="#/curso/${escape(item.courseId)}">Revisar curso</a></div></div></div>`;
    return `<div class="main-page"><div class="container"><div class="page-head"><div><span class="eyebrow">SUAS CONQUISTAS</span><h1>Meus certificados</h1><p>Ao concluir 100% de um curso, seu certificado aparece aqui automaticamente.</p></div><a class="btn outline" href="#/perfil">Editar nome completo</a></div><div class="card"><p>Nome para os próximos certificados: <b>${escape(fullName())}</b>.</p><p>Os certificados já emitidos preservam o nome e a data da conclusão. Seus certificados ficam guardados neste navegador.</p>${validName(fullName())?'':'<p role="status">Preencha seu nome completo no perfil para emitir os certificados dos cursos concluídos.</p>'}</div><section class="section grid catalog" aria-label="Certificados emitidos">${list.length ? list.map(record => `<article class="card certificate-card"><span class="pill green">✓ CURSO CONCLUÍDO</span><h2>${escape(record.title)}</h2><p>${escape(record.name)}</p><p>Concluído em ${date(record.issuedAt)}</p><a class="btn primary" href="#/certificados/${escape(record.courseId)}">Ver certificado</a></article>`).join('') : '<div class="card"><h2>Seu primeiro certificado está por vir</h2><p>Conclua todas as aulas de um minicurso para receber seu certificado.</p><a class="btn primary" href="#/aprender">Explorar cursos</a></div>'}</section></div></div>`;
  }
  function bind() {
    document.querySelector('#printCertificate')?.addEventListener('click', () => window.print());
    const form = document.querySelector('#profileForm');
    if (form) {
      const input = document.querySelector('#profileFullName'); input.value = fullName();
      input.oninput = () => input.setCustomValidity('');
      form.onsubmit = event => {
        event.preventDefault(); const name = input.value.trim().replace(/\s+/g,' ');
        if (!validName(name)) { input.setCustomValidity('Informe seu nome e sobrenome.'); input.reportValidity(); return; }
        SCStore.write('sc_profile', {fullName:name}); SC.user.name = name.split(' ')[0]; sync();
        document.querySelector('#profileSaved').textContent = 'Nome completo salvo. Novos certificados usarão esse nome.';
      };
    }
    if (SC.courses.some(course => course.progress === 100) && !document.querySelector('#main [href="#/certificados"]')) {
      const link = document.createElement('a'); link.className='btn outline certificate-controls'; link.href='#/certificados'; link.textContent='✦ Ver meus certificados';
      document.querySelector('#main .container')?.append(link);
    }
  }
  document.addEventListener('sc:progress', sync);
  return {view, bind, sync, fullName, escape};
})();
