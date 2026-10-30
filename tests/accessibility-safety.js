/* Testa os arquivos reais em iframe. Restaura o armazenamento ao terminar. */
(() => {
  const frame = document.getElementById('testApp'), output = document.getElementById('verification');
  const width = Number(new URLSearchParams(location.search).get('width'));
  if (width) frame.style.width = `${width}px`;
  let phase = 0, backup = null, sessionBackup = null;
  const results = [];
  const keys = ['sc_a11y', 'sc_onboarded', 'sc_safety_progress_v1', 'sc_progress', 'sc_certificates_v1', 'sc_profile'];
  function check(value, name) { if (!value) throw new Error(name); results.push(name); }
  function restore(w) {
    if (!backup) return;
    keys.forEach(key => backup[key] === null ? w.localStorage.removeItem(key) : w.localStorage.setItem(key, backup[key]));
    if (sessionBackup === null) w.sessionStorage.removeItem('sc_logged'); else w.sessionStorage.setItem('sc_logged', sessionBackup);
  }
  frame.onload = async () => {
    const w = frame.contentWindow, d = w.document;
    const q = selector => d.querySelector(selector);
    const all = selector => [...d.querySelectorAll(selector)];
    const visible = element => !!element && w.getComputedStyle(element).display !== 'none' && !!element.getClientRects().length;
    const route = path => { w.history.replaceState(null, '', '#/' + path); w.render(); };
    const fits = name => check(d.documentElement.scrollWidth <= w.innerWidth, 'sem overflow: ' + name);
    try {
      check(!!w.SCMode && !!w.SCSafety && !!w.SCProgress, 'módulos carregados');
      if (phase === 1) {
        check(w.SCProgress.percent() === 100, 'progresso persiste após recarregar');
        check(w.SC.user.xp === 1595, 'XP persiste sem duplicação');
        check(w.SCMode.get().easy && w.SCMode.get().font === 'extra', 'preferências persistem após recarregar');
        check(!q('#welcomeMode').open, 'primeiro acesso não reaparece');
        route('treinamento-concluido');
        check(q('#trainingResultTitle').textContent.includes('concluiu'), 'resultado completo persiste');
        if (location.protocol.startsWith('http')) {
          await Promise.race([w.navigator.serviceWorker.ready, new Promise((_, reject) => setTimeout(() => reject(new Error('Service Worker não ficou pronto')), 6000))]);
          const cache = await w.caches.open('se-conecte-v8');
          const assets = ['../index.html', '../manifest.webmanifest', ...[...d.querySelectorAll('script[src]')].map(el => el.src), ...[...d.querySelectorAll('link[rel="stylesheet"]')].map(el => el.href)];
          const hits = await Promise.all(assets.map(path => cache.match(new URL(path, location.href).href)));
          check(hits.every(Boolean), 'PWA armazena todos os arquivos novos e existentes');
        }
        const preview = new URLSearchParams(location.search).get('preview');
        if (preview) {
          w.SCMode.set(w.SCMode.defaults());
          if (preview === 'easy') { w.SCMode.set({ easy: true, targets: true, font: 'large' }); route('aula/seguranca-digital/5'); }
          if (preview === 'course') route('curso/seguranca-digital');
          if (preview === 'welcome') { route('inicio'); w.SCStore.write('sc_onboarded', false); w.SCMode.offerWelcome(); }
          w.scrollTo(0, 0);
          output.hidden = true;
        }
        restore(w); frame.onload = null;
        output.textContent = `PASS (${results.length})\n` + results.join(' | ');
        return;
      }
      backup = Object.fromEntries(keys.map(key => [key, w.localStorage.getItem(key)]));
      sessionBackup = w.sessionStorage.getItem('sc_logged');
      w.SCStore.write('sc_safety_progress_v1', { version: 1, lessons: {}, scenarios: {} }); w.SCProgress.load();
      w.SCMode.set(w.SCMode.defaults());
      w.SCStore.write('sc_onboarded', false); q('#welcomeMode').close(); w.login(false);
      check(visible(q('#auth')) && !visible(q('#app')), 'login isolado');
      w.login(true); check(!visible(q('#auth')) && visible(q('#app')), 'painel sem login');
      check(q('#welcomeMode').open, 'primeiro acesso oferecido');
      q('[data-preset="simple"]').click();
      check(w.SCMode.get().easy && visible(q('#welcomeConfirmation')), 'escolha e confirmação');
      q('#startWithMode').click();
      check(!q('#welcomeMode').open && w.SCStore.read('sc_onboarded', false), 'começar salva primeiro acesso');
      for (const preset of ['vision', 'listen', 'click', 'standard']) {
        w.SCStore.write('sc_onboarded', false); w.SCMode.offerWelcome(); q(`[data-preset="${preset}"]`).click();
        if (preset === 'vision') check(w.SCMode.get().contrast && w.SCMode.get().targets && w.SCMode.get().font === 'large', 'perfil enxergar melhor');
        if (preset === 'listen') check(w.SCMode.get().voice, 'perfil ouvir');
        if (preset === 'click') check(w.SCMode.get().targets, 'perfil clicar');
        if (preset === 'standard') check(!w.SCMode.get().easy && !w.SCMode.get().contrast && w.SCMode.get().font === 'normal', 'perfil padrão');
        q('#startWithMode').click();
      }
      w.SCMode.open();
      check(q('#a11y').scrollWidth <= q('#a11y').clientWidth, 'painel sem overflow');
      for (const id of ['contrast', 'voice', 'easy', 'motion', 'largeTargets', 'highlightActions']) {
        const input = q('#' + id), before = input.checked; input.click();
        check(input.checked !== before, 'controle ' + id);
        check(q('#preferencesSaved').textContent.includes('automaticamente'), 'salvamento automático ' + id);
      }
      q('[data-font="extra"]').click(); check(w.getComputedStyle(d.documentElement).fontSize === '20px', 'texto A++');
      q('#resetA11y').click(); check(w.SCMode.get().font === 'normal' && !w.SCMode.get().targets, 'restaurar padrão'); q('#a11y').close();
      w.SCMode.set({ easy: true, targets: true, font: 'extra', contrast: true, highlight: true, motion: true });
      route('aprender'); const originalHash = w.location.hash; q('.skip').click();
      check(w.location.hash === originalHash && d.activeElement === q('#main'), 'pular conteúdo preserva a rota');
      if (w.innerWidth < 980) {
        check(q('#sidebar').inert, 'menu fechado fora da navegação por teclado');
        q('#menu').click();
        check(d.activeElement === q('#closeMenu') && q('#main').inert, 'menu recebe foco e isola o painel');
        q('#logout').focus();
        d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
        check(d.activeElement === q('#closeMenu'), 'Tab permanece no menu aberto');
        d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        check(q('#sidebar').inert && d.activeElement === q('#menu') && !q('#main').inert, 'Escape fecha menu e devolve foco');
      }
      for (const path of ['inicio', 'aprender', 'progresso', 'passaporte', 'oportunidades']) {
        route(path); check(visible(q('#main .main-page')) && !visible(q('#auth')), 'tela ' + path);
        check(q('[aria-current="page"]').dataset.nav === path, 'menu ' + path); fits(path);
      }
      check(w.getComputedStyle(q('#openHelp')).minHeight === '56px', 'área clicável maior');
      q('#openHelp').click(); check(q('#guidedHelp').open, 'ajuda abre');
      all('[data-help-topic]').forEach(button => {
        button.click(); check(q('#helpAnswerText').textContent.length > 30, 'ajuda ' + button.dataset.helpTopic); q('#helpBack').click();
      });
      q('[data-help-topic="lesson"]').click(); q('#helpAction').click(); check(w.SCMode.get().easy && !q('#guidedHelp').open, 'ajuda ativa Aprender+');
      route('aprender'); q('#searchCourse').value = 'seguranca'; q('#searchCourse').oninput();
      check(all('#catalog .course').length === 3, 'nova trilha na busca sem acentos');
      route('curso/seguranca-digital'); check(all('#safetyModules .lesson').length === 8, 'oito módulos'); fits('trilha');
      route('aula/internet/4'); check(visible(q('.legacy-simple')) && !visible(q('.video')), 'Aprender+ nos cursos existentes');
      q('[data-legacy-next]').click(); check(q('[data-legacy-position]').textContent === 'Passo 2 de 3', 'passos dos cursos existentes');
      w.SCMode.set({ easy: false }); check(visible(q('.video')) && !visible(q('.legacy-simple')), 'modo normal preservado');
      w.SCMode.set({ easy: true });
      for (let i = 0; i < 8; i++) {
        route('aula/seguranca-digital/' + (i + 1));
        const item = w.SCSafetyData.modules[i];
        check(q('#safetyLessonTitle').textContent === item.title, 'conteúdo módulo ' + (i + 1));
        check(all('.simple-explanation li').filter(visible).length === 1, 'uma ideia por vez ' + (i + 1));
        q('[data-simple-next]').click(); check(q('[data-simple-position]').textContent === 'Ideia 2 de 3', 'avanço da ideia ' + (i + 1));
        fits('aula ' + (i + 1));
        q('#lessonNext').click(); q('#lessonNext').click();
        check(q('#lessonNext').disabled, 'prática necessária ' + (i + 1));
        // Inclui uma resposta errada para conferir o feedback educativo.
        const answer = i === 0 ? 0 : item.correct;
        q(`[data-answer="${answer}"]`).click();
        check(visible(q('[data-feedback]')) && q('[data-feedback]').textContent.includes(item.feedback), 'feedback imediato ' + (i + 1));
        q('#lessonNext').click(); q('#lessonNext').click(); q('#lessonNext').click();
        check(!!w.SCProgress.lesson(item.id), 'aula salva ' + (i + 1));
      }
      check(w.SCProgress.earned() === 280, 'XP de aulas e práticas');
      const legacyCourses = w.SC.courses.filter(course => !course.training), legacyProgress = legacyCourses.map(course => course.progress);
      legacyCourses.forEach(course => course.progress = 100); route('aprender');
      check(q('#resumeLink').getAttribute('href') === '#/simulador/1', 'retomada da trilha considera as simulações');
      legacyCourses.forEach((course, index) => course.progress = legacyProgress[index]);
      const before = w.SCProgress.earned();
      route('aula/seguranca-digital/1');
      q('#lessonNext').click(); q('#lessonNext').click(); q('#lessonNext').click(); q('#lessonNext').click(); q('#lessonNext').click();
      check(w.SCProgress.earned() === before, 'revisão não duplica XP');
      for (let i = 0; i < 5; i++) {
        route('simulador/' + (i + 1)); const item = w.SCSafetyData.scenarios[i];
        check(q('#scenarioNext').disabled, 'simulação aguarda escolha ' + (i + 1));
        q(`[data-answer="${item.correct}"]`).click();
        check(q('#scenarioFeedback').textContent.includes('Boa escolha!'), 'feedback simulação ' + (i + 1));
        check(!!w.SCProgress.scenario(item.id), 'simulação salva ' + (i + 1)); fits('simulação ' + (i + 1));
        q('#scenarioNext').click();
      }
      check(w.SCProgress.percent() === 100 && w.SCProgress.earned() === 355, 'trilha completa com 355 XP');
      check(w.SC.user.xp === 1595, 'XP somado ao existente');
      check(w.SC.user.level === 'Conectado', 'nível acompanha o XP');
      route('simulador/1'); check(!q('#scenarioNext').disabled, 'revisão da simulação');
      check(w.SCProgress.earned() === 355, 'simulação não duplica XP');
      route('progresso'); check(all('#safetyAchievements [data-achievement-status]').every(el => el.textContent === 'Conquistada'), 'cinco conquistas');
      route('passaporte'); check(q('#safetyCompetencyStatus').textContent.includes('Competência adicionada'), 'competência no Passaporte');
      route('inicio'); check(visible(q('#safetyInviteTitle')), 'convite no Dashboard');
      // Exercita o controlador de voz sem depender de um dispositivo de áudio.
      const speechCalls = [];
      const original = w.speechSynthesis;
      Object.defineProperty(w, 'speechSynthesis', { configurable: true, value: { cancel: () => speechCalls.push('stop'), speak: utterance => { speechCalls.push('speak'); check(utterance.lang === 'pt-BR', 'voz em português'); }, pause: () => speechCalls.push('pause'), resume: () => speechCalls.push('resume') } });
      check(w.SCSpeech.getStatus() === 'idle', 'voz não inicia automaticamente');
      w.SCSpeech.speak('Teste de leitura'); q('#speechPause').click(); q('#speechResume').click(); q('#speechStop').click();
      check(['speak','pause','resume','stop'].every(action => speechCalls.includes(action)), 'iniciar pausar continuar parar');
      w.SCMode.set({ voice: false }); const count = speechCalls.filter(action => action === 'speak').length;
      w.SCSpeech.speak('Não deve iniciar'); check(speechCalls.filter(action => action === 'speak').length === count, 'respeita leitura desligada');
      Object.defineProperty(w, 'speechSynthesis', { configurable: true, value: undefined });
      w.SCMode.set({ voice: true });
      check(w.SCSpeech.speak('Teste indisponível') === false, 'fallback sem voz');
      Object.defineProperty(w, 'speechSynthesis', { configurable: true, value: original });
      q('#logout').click(); check(visible(q('#auth')) && !visible(q('#app')), 'sair preservado');
      w.login(true); phase = 1; frame.contentWindow.location.reload();
    } catch (error) {
      restore(w); frame.onload = null; output.textContent = `FAIL após ${results.length} verificações: ${error.stack}`;
    }
  };
  frame.src = '../index.html';
})();
