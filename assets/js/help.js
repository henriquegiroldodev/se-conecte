window.SCHelp = (() => {
  // Provedor local substituível; nenhuma API externa é chamada.
  const answers = {
    continue: ['Não sei como continuar', 'Procure o botão “Continuar” ou “Começar”. Na tela Aprender, escolha um curso. Nas aulas, avance um passo por vez.', 'Ver meus cursos', '#/aprender'],
    lesson: ['Não entendi esta aula', 'Você pode voltar um passo e ler novamente. O Modo Aprender+ mostra explicações mais curtas. O botão Ouvir explicação lê o texto para você.', 'Ativar Aprender+', 'simple'],
    vision: ['Não consigo enxergar direito', 'Podemos aumentar o texto, os botões e o contraste. Essas opções também ficam em Meu Modo.', 'Aumentar texto e contraste', 'vision'],
    audio: ['Não consigo ouvir o conteúdo', 'Todas as explicações estão escritas na tela. Confira o volume do aparelho. Se o navegador não oferecer voz, continue pelo texto; nenhuma atividade exige áudio.', 'Abrir Meu Modo', 'mode'],
    home: ['Como volto para o início?', 'Escolha Início no menu. No celular, toque em Menu para encontrar essa opção. Você também pode usar o botão abaixo.', 'Voltar para o início', '#/inicio']
  };
  let active = null;
  const provider = { answer: key => answers[key] };
  function open() {
    active = null; document.querySelector('#helpAnswer').hidden = true;
    document.querySelector('#helpOptions').hidden = false; document.querySelector('#guidedHelp').showModal();
  }
  function init() {
    document.querySelector('#openHelp').onclick = open;
    document.querySelectorAll('[data-help-topic]').forEach(button => button.onclick = () => {
      active = provider.answer(button.dataset.helpTopic);
      document.querySelector('#helpOptions').hidden = true; document.querySelector('#helpAnswer').hidden = false;
      document.querySelector('#helpAnswerTitle').textContent = active[0]; document.querySelector('#helpAnswerText').textContent = active[1];
      document.querySelector('#helpAction').textContent = active[2]; document.querySelector('#helpAnswerTitle').focus();
    });
    document.querySelector('#helpBack').onclick = () => { document.querySelector('#helpOptions').hidden = false; document.querySelector('#helpAnswer').hidden = true; document.querySelector('[data-help-topic]').focus(); };
    document.querySelector('#helpAction').onclick = () => {
      if (!active) return;
      document.querySelector('#guidedHelp').close();
      if (active[3].startsWith('#')) location.hash = active[3];
      else if (active[3] === 'mode') SCMode.open();
      else {
        SCMode.set(active[3] === 'simple' ? { easy: true } : { font: 'large', contrast: true, targets: true });
        window.toast('Tudo certo! A plataforma foi ajustada para você.');
      }
    };
    document.querySelector('#guidedHelp').addEventListener('close', () => SCSpeech.stop());
  }
  return { init, open, provider };
})();
