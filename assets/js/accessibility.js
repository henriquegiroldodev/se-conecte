window.SCMode = (() => {
  const defaults = { font: 'normal', contrast: false, voice: true, easy: false, motion: false, targets: false, highlight: false };
  let preferences = { ...defaults }, pending = null;
  const controls = { contrast: 'contrast', voice: 'voice', easy: 'easy', motion: 'motion', targets: 'largeTargets', highlight: 'highlightActions' };
  function clean(input) {
    const value = { ...defaults };
    if (!input || typeof input !== 'object') return value;
    if (['normal', 'large', 'extra'].includes(input.font)) value.font = input.font;
    Object.keys(controls).forEach(key => { if (typeof input[key] === 'boolean') value[key] = input[key]; });
    return value;
  }
  function apply() {
    // rem é calculado na raiz; mudar apenas a variável no body não aumenta os textos.
    document.documentElement.classList.toggle('font-large', preferences.font === 'large');
    document.documentElement.classList.toggle('font-extra', preferences.font === 'extra');
    const classes = { 'font-large': preferences.font === 'large', 'font-extra': preferences.font === 'extra', 'high-contrast': preferences.contrast, 'easy-mode': preferences.easy, 'reduce-motion': preferences.motion, 'large-targets': preferences.targets, 'highlight-actions': preferences.highlight };
    Object.entries(classes).forEach(([name, enabled]) => document.body.classList.toggle(name, enabled));
    Object.entries(controls).forEach(([key, id]) => {
      const input = document.getElementById(id); input.checked = preferences[key];
      document.querySelector(`[data-setting-status="${key}"]`).textContent = preferences[key] ? 'Ligado' : 'Desligado';
    });
    document.querySelectorAll('[data-font]').forEach(button => {
      const selected = button.dataset.font === preferences.font;
      button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected));
    });
    if (!preferences.voice) SCSpeech.stop();
    document.dispatchEvent(new CustomEvent('sc:preferences', { detail: { ...preferences } }));
  }
  function set(patch) {
    preferences = clean({ ...preferences, ...patch });
    const saved = SCStore.write('sc_a11y', preferences); apply();
    document.querySelector('#preferencesSaved').textContent = saved ? 'Preferências salvas automaticamente.' : 'Preferências ativas nesta sessão. O navegador não permitiu salvar.';
  }
  function open() {
    if (document.querySelector('#welcomeMode').open) return;
    document.querySelector('#a11y').showModal();
  }
  function enhanceLesson() {
    const video = document.querySelector('#main .video');
    if (!video) return;
    const article = video.closest('article'), title = article.querySelector('h1');
    const lessonId = location.hash.split('/')[2];
    const copy = {
      internet: [
        ['Abra um navegador para acessar a internet.', 'O navegador é o aplicativo que mostra sites.'],
        ['Confira o endereço antes de abrir uma página.', 'Se receber um link desconhecido, procure o site por um canal conhecido.'],
        ['Pesquise com palavras do assunto que procura.', 'Por exemplo: horário de atendimento da biblioteca da sua cidade.']
      ],
      seguranca: [
        ['Pare antes de responder a um pedido urgente.', 'Uma mensagem pode usar a pressa para tentar enganar você.'],
        ['Não envie sua senha nem códigos a outras pessoas.', 'Um código pode permitir o acesso à sua conta.'],
        ['Confirme pedidos por outro meio.', 'Ligue para a pessoa pelo número que você já conhecia.']
      ],
      produtividade: [
        ['Dê um nome claro aos seus arquivos.', 'Por exemplo: lista de compras de outubro.'],
        ['Guarde arquivos relacionados na mesma pasta.', 'Você pode separar documentos de estudo e de trabalho.'],
        ['Confira seu trabalho antes de compartilhar.', 'Leia o texto e veja se está enviando o arquivo certo.']
      ],
      comunicacao: [
        ['Diga com clareza o motivo da mensagem.', 'Comece com uma saudação e conte o que precisa.'],
        ['Confira para quem está enviando.', 'Um nome parecido pode ser de outra pessoa.'],
        ['Leia a mensagem antes de enviar.', 'Confira se as informações estão corretas e se há dados pessoais desnecessários.']
      ]
    };
    const ideas = copy[lessonId] || copy.internet;
    [...article.children].forEach(child => { if (child !== title && !child.classList.contains('pill') && !child.classList.contains('lesson-actions')) child.classList.add('legacy-normal'); });
    const fragment = document.getElementById('legacySimpleTemplate').content.cloneNode(true);
    title.after(fragment);
    const section = article.querySelector('.legacy-simple');
    let step = 0;
    function show(focus = false) {
      section.querySelector('[data-legacy-text]').textContent = ideas[step][0];
      section.querySelector('[data-legacy-example]').textContent = ideas[step][1];
      section.querySelector('[data-legacy-position]').textContent = `Passo ${step + 1} de ${ideas.length}`;
      section.querySelector('[data-legacy-back]').disabled = step === 0;
      section.querySelector('[data-legacy-next]').textContent = step === ideas.length - 1 ? 'Vamos praticar →' : 'Entendi, continuar →';
      if (focus) section.querySelector('.legacy-step-copy').focus();
    }
    section.querySelector('[data-legacy-back]').onclick = () => { if (step > 0) { step--; show(true); } };
    section.querySelector('[data-legacy-next]').onclick = () => { if (step < ideas.length - 1) { step++; show(true); } else location.hash = `#/exercicio/${lessonId}`; };
    section.querySelector('[data-legacy-listen]').onclick = () => SCSpeech.speak(section.querySelector('.legacy-step-copy').innerText);
    show();
  }
  function offerWelcome() {
    if (SCStore.read('sc_onboarded', false) || document.querySelector('#welcomeMode').open) return;
    pending = null;
    document.querySelector('#welcomeOptions').hidden = false;
    document.querySelector('#welcomeConfirmation').hidden = true;
    document.querySelector('#welcomeMode').showModal();
  }
  function init() {
    preferences = clean(SCStore.read('sc_a11y', defaults)); apply();
    Object.entries(controls).forEach(([key, id]) => document.getElementById(id).onchange = event => set({ [key]: event.target.checked }));
    document.querySelectorAll('[data-font]').forEach(button => button.onclick = () => set({ font: button.dataset.font }));
    document.querySelector('#resetA11y').onclick = () => { set(defaults); window.toast('Configuração padrão restaurada.'); };
    document.querySelectorAll('[data-mode-open]').forEach(button => button.onclick = open);
    document.querySelectorAll('[data-preset]').forEach(button => button.onclick = () => {
      const presets = { vision: { font: 'large', contrast: true, targets: true }, listen: { voice: true }, simple: { easy: true }, click: { targets: true }, standard: { ...defaults } };
      pending = presets[button.dataset.preset];
      // Primeira escolha já é aplicada, sem iniciar a fala.
      set(pending);
      document.querySelector('#welcomeOptions').hidden = true;
      document.querySelector('#welcomeConfirmation').hidden = false;
      document.querySelector('#startWithMode').focus();
    });
    document.querySelector('#startWithMode').onclick = () => {
      SCStore.write('sc_onboarded', true); document.querySelector('#welcomeMode').close(); document.querySelector('#main').focus();
    };
    document.querySelector('#welcomeMode').addEventListener('cancel', event => { event.preventDefault(); document.querySelector('#welcomeHint').textContent = 'Escolha uma opção. Você poderá mudar depois em Meu Modo.'; });
  }
  return { init, set, apply, open, offerWelcome, enhanceLesson, get: () => ({ ...preferences }), defaults: () => ({ ...defaults }) };
})();
