window.SCSpeech = (() => {
  let current = null, status = 'idle';
  const supported = () => typeof window.speechSynthesis?.speak === 'function' && typeof window.SpeechSynthesisUtterance === 'function';
  function update(next, message) {
    status = next;
    const panel = document.querySelector('#speechPanel');
    if (!panel) return;
    panel.hidden = next === 'idle';
    document.querySelector('#speechStatus').textContent = message || ({ speaking: 'Lendo conteúdo', paused: 'Leitura pausada' }[next] || 'Leitura encerrada');
    document.querySelector('#speechPause').hidden = next !== 'speaking';
    document.querySelector('#speechResume').hidden = next !== 'paused';
  }
  function stop() {
    current = null;
    if (supported()) window.speechSynthesis.cancel();
    update('idle');
  }
  function speak(text) {
    if (!supported()) { window.toast('Este navegador não oferece leitura em voz alta. O conteúdo continua disponível em texto.'); return false; }
    if (window.SCMode && !SCMode.get().voice) { window.toast('Ative a leitura em voz alta em Meu Modo.'); return false; }
    stop();
    const modal = document.querySelector('dialog[open]');
    (modal?.querySelector('.modal') || document.body).append(document.querySelector('#speechPanel'));
    current = new SpeechSynthesisUtterance(String(text).replace(/\s+/g, ' ').trim().slice(0, 12000));
    current.lang = 'pt-BR'; current.rate = .9;
    const utterance = current;
    current.onend = () => { if (current === utterance) { current = null; update('idle'); } };
    current.onerror = event => {
      if (current !== utterance) return;
      current = null; update('idle');
      if (!['canceled', 'interrupted'].includes(event.error)) window.toast('Não foi possível ouvir agora. Você pode ler o texto na tela.');
    };
    update('speaking');
    window.speechSynthesis.speak(current);
    return true;
  }
  function init() {
    document.querySelector('#speechPause').onclick = () => { if (status === 'speaking') { speechSynthesis.pause(); update('paused'); } };
    document.querySelector('#speechResume').onclick = () => { if (status === 'paused') { speechSynthesis.resume(); update('speaking'); } };
    document.querySelector('#speechStop').onclick = stop;
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-speak]');
      if (!button) return;
      const target = document.querySelector(button.dataset.speak);
      if (target) speak(target.innerText);
    });
  }
  return { init, speak, stop, supported, getStatus: () => status };
})();
