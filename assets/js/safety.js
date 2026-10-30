window.SCSafety = (() => {
  const data = window.SCSafetyData;
  const $ = selector => document.querySelector(selector);
  const clone = id => document.getElementById(id).content.cloneNode(true);
  function bar(target, value) {
    const progress = document.createElement('div'); progress.className = 'progress';
    progress.setAttribute('role', 'progressbar'); progress.setAttribute('aria-label', 'Progresso');
    progress.setAttribute('aria-valuemin', '0'); progress.setAttribute('aria-valuemax', '100'); progress.setAttribute('aria-valuenow', String(value));
    const fill = document.createElement('i'); fill.style.setProperty('--p', `${value}%`); progress.append(fill);
    target.replaceChildren(progress);
  }
  function rules(root = document) {
    root.querySelectorAll('[data-safety-rule]').forEach(target => target.replaceChildren(clone('safetyRuleTemplate')));
  }
  function nextLesson() { return Math.max(0, data.modules.findIndex(module => !SCProgress.lesson(module.id))) + 1; }
  function remainingLink() {
    const lesson = data.modules.findIndex(module => !SCProgress.lesson(module.id));
    if (lesson >= 0) return `#/aula/${data.id}/${lesson + 1}`;
    const scenario = data.scenarios.findIndex(item => !SCProgress.scenario(item.id));
    return scenario >= 0 ? `#/simulador/${scenario + 1}` : '#/passaporte';
  }
  function fillFields(root, item) {
    root.querySelectorAll('[data-field]').forEach(element => element.textContent = item[element.dataset.field] || '');
  }
  function optionButtons(target, question, selected, choose) {
    target.replaceChildren();
    question.options.forEach((text, index) => {
      const fragment = clone('answerOptionTemplate'), button = fragment.querySelector('button');
      button.textContent = text; button.dataset.answer = String(index);
      button.setAttribute('aria-pressed', String(selected === index));
      if (selected !== null) {
        button.disabled = true;
        if (index === question.correct) button.classList.add('correct');
        else if (index === selected) button.classList.add('wrong');
      }
      button.onclick = () => choose(index);
      target.append(fragment);
    });
  }
  function feedbackText(question, answer) {
    return `${answer === question.correct ? '✓ Boa escolha!' : '⚠ Atenção!'} ${question.feedback}`;
  }
  function course() {
    const list = $('#safetyModules');
    data.modules.forEach((module, index) => {
      const link = document.createElement('a'); link.className = 'lesson'; link.href = `#/aula/${data.id}/${index + 1}`;
      const done = !!SCProgress.lesson(module.id); link.classList.toggle('done', done);
      const number = document.createElement('span'); number.className = 'lesson-num'; number.textContent = done ? '✓' : String(index + 1);
      const copy = document.createElement('span'), title = document.createElement('strong'), info = document.createElement('small');
      title.textContent = module.title; info.textContent = done ? 'Concluído · Revisar módulo' : '5 passos · Explicação e prática';
      copy.append(title, info); link.append(number, copy); list.append(link);
    });
    $('#safetyCourseProgress').textContent = `${SCProgress.percent()}% concluído · ${SCProgress.earned()} XP conquistados`;
    bar($('#safetyCourseBar'), SCProgress.percent());
    $('#safetyCourseContinue').href = remainingLink();
    $('#safetyCourseContinue').textContent = SCProgress.percent() === 100 ? 'Ver competência no Passaporte' : SCProgress.percent() ? 'Continuar treinamento →' : 'Começar treinamento →';
    rules();
  }
  function lesson(rawIndex) {
    const index = Math.max(0, Math.min(data.modules.length - 1, (Math.trunc(Number(rawIndex)) || 1) - 1));
    const item = data.modules[index], saved = SCProgress.lesson(item.id);
    let step = 1, answer = saved?.answer ?? null;
    $('#safetyLessonTitle').textContent = item.title;
    $('#safetyModuleLabel').textContent = `Módulo ${index + 1}`;
    $('#safetyLessonPosition').textContent = `Módulo ${index + 1} de ${data.modules.length}`;
    const content = $('#lessonStepContent'), next = $('#lessonNext'), previous = $('#lessonPrevious');
    function show(focus = false) {
      SCSpeech.stop();
      $('#lessonStepLabel').textContent = `Passo ${step} de 5`;
      bar($('#lessonStepBar'), step / 5 * 100);
      const templates = ['learningTextTemplate', 'learningExampleTemplate', 'learningQuestionTemplate', 'learningFeedbackTemplate', 'learningCompleteTemplate'];
      content.replaceChildren(clone(templates[step - 1])); fillFields(content, item);
      if (step === 1) {
        item.simple.forEach(text => { const li = document.createElement('li'); li.textContent = text; content.querySelector('[data-simple-steps]').append(li); });
        const controls = clone('simpleControlsTemplate'); content.append(controls);
        let idea = 0;
        const items = [...content.querySelectorAll('[data-simple-steps] li')];
        function showIdea() {
          items.forEach((li, index) => li.classList.toggle('active', index === idea));
          content.querySelector('[data-simple-position]').textContent = `Ideia ${idea + 1} de ${items.length}`;
          content.querySelector('[data-simple-back]').disabled = idea === 0;
          content.querySelector('[data-simple-next]').disabled = idea === items.length - 1;
        }
        content.querySelector('[data-simple-back]').onclick = () => { if (idea > 0) { idea--; showIdea(); } };
        content.querySelector('[data-simple-next]').onclick = () => { if (idea < items.length - 1) { idea++; showIdea(); } };
        showIdea();
      }
      if (step === 2 && item.addresses) {
        item.addresses.forEach(address => { const example = document.createElement('code'); example.className = 'example-address'; example.textContent = address; content.querySelector('[data-example-addresses]').append(example); });
      }
      if (step === 3) {
        const target = content.querySelector('[data-answer-options]');
        function choose(value) {
          answer = value;
          optionButtons(target, item, answer, choose);
          const feedback = content.querySelector('[data-feedback]'); feedback.hidden = false; feedback.textContent = feedbackText(item, answer);
          next.disabled = false; next.focus();
        }
        optionButtons(target, item, answer, choose);
        if (answer !== null) { const feedback = content.querySelector('[data-feedback]'); feedback.hidden = false; feedback.textContent = feedbackText(item, answer); }
      }
      if (step === 4) content.querySelector('[data-result-heading]').textContent = answer === item.correct ? '✓ Boa escolha!' : '⚠ Agora você sabe como conferir.';
      if (step === 5) item.tips.forEach(text => { const li = document.createElement('li'); li.textContent = text; content.querySelector('[data-tips]').append(li); });
      next.disabled = step === 3 && answer === null;
      next.textContent = step === 5 ? saved ? 'Revisão concluída, continuar →' : 'Concluir aula e prática →' : 'Entendi, continuar →';
      previous.disabled = step === 1;
      rules(content);
      if (focus) content.focus();
    }
    previous.onclick = () => { if (step > 1) { step--; show(true); } };
    next.onclick = () => {
      if (step === 3 && answer === null) return;
      if (step < 5) { step++; show(true); return; }
      const xp = SCProgress.completeLesson(item.id, answer);
      window.toast(xp ? `Aula e prática concluídas! +${xp} XP` : 'Revisão concluída. Seu XP já estava registrado.');
      location.hash = index + 1 < data.modules.length ? `#/aula/${data.id}/${index + 2}` : '#/simulador/1';
    };
    rules(); show();
  }
  function simulator(rawIndex) {
    const index = Math.max(0, Math.min(data.scenarios.length - 1, (Math.trunc(Number(rawIndex)) || 1) - 1)), item = data.scenarios[index];
    let answer = SCProgress.scenario(item.id)?.answer ?? null;
    $('#scenarioPosition').textContent = `Situação ${index + 1} de ${data.scenarios.length}`;
    bar($('#scenarioBar'), (index + 1) / data.scenarios.length * 100);
    $('#scenarioTitle').textContent = item.title; $('#scenarioSender').textContent = item.sender;
    $('#scenarioMessage').textContent = item.message; $('#scenarioQuestion').textContent = item.question;
    function show(record = false) {
      optionButtons($('#scenarioOptions'), item, answer, value => { answer = value; show(true); $('#scenarioNext').focus(); });
      if (answer !== null) {
        $('#scenarioFeedback').hidden = false; $('#scenarioFeedback').textContent = feedbackText(item, answer);
        $('#scenarioNext').disabled = false;
        const xp = record ? SCProgress.completeScenario(item.id, answer) : 0;
        $('#scenarioReward').textContent = xp ? `Prática registrada! +${xp} XP` : 'Situação já registrada. Revisar não repete o XP.';
      }
    }
    $('#scenarioNext').onclick = () => { if (answer !== null) location.hash = index + 1 < data.scenarios.length ? `#/simulador/${index + 2}` : '#/treinamento-concluido'; };
    show(); rules();
  }
  function result() {
    const complete = SCProgress.percent() === 100;
    $('#trainingResultTitle').textContent = complete ? 'Você concluiu a trilha Segurança Digital!' : 'Cada prática ajuda você a avançar';
    $('#trainingResultText').textContent = complete ? 'Sua conquista Guardião Digital e a competência Segurança Digital estão no seu Passaporte. Continue conferindo os pedidos com calma.' : 'Você praticou situações importantes. Conclua os módulos e as simulações restantes para completar a trilha.';
    bar($('#trainingResultBar'), SCProgress.percent());
    $('#trainingResultXP').textContent = `${SCProgress.percent()}% da trilha · ${SCProgress.earned()} XP conquistados`;
    $('#trainingResultNext').href = remainingLink(); rules();
  }
  function decorate() {
    const container = $('#main .container'); if (!container) return;
    const page = $('#main').dataset.page;
    if (page === 'inicio') container.querySelector('.hero').after(clone('safetyDashboardTemplate'));
    if (page === 'progresso') {
      container.append(clone('safetyAchievementsTemplate'));
      SCProgress.achievements().forEach(item => {
        const fragment = clone('safetyAchievementTemplate'), card = fragment.querySelector('article');
        card.classList.toggle('locked', !item.unlocked);
        fragment.querySelector('[data-achievement-icon]').textContent = item.icon;
        fragment.querySelector('[data-achievement-title]').textContent = item.title;
        fragment.querySelector('[data-achievement-status]').textContent = item.unlocked ? 'Conquistada' : 'Ainda não conquistada';
        $('#safetyAchievements').append(fragment);
      });
    }
    if (page === 'passaporte') {
      container.querySelector('.passport').append(clone('safetyPassportTemplate'));
      $('#safetyCompetencyTitle').textContent = 'Segurança Digital';
      $('#safetyCompetencyStatus').textContent = SCProgress.percent() === 100 ? 'Competência adicionada · Trilha concluída · Guardião Digital' : `Em desenvolvimento · ${SCProgress.percent()}% da trilha. Conclua os módulos e as simulações para adicionar a competência.`;
      bar($('#safetyCompetencyBar'), SCProgress.percent());
      // Mantém as demais competências demonstrativas; esta passa a usar evidências reais da nova trilha.
      container.querySelectorAll('.skill').forEach(skill => {
        if (skill.querySelector('.skill-row span')?.textContent.toLowerCase() !== 'segurança digital') return;
        skill.querySelector('.skill-row b').textContent = `${SCProgress.percent()}%`;
        const progress = skill.querySelector('.progress');
        progress.querySelector('i').style.setProperty('--p', `${SCProgress.percent()}%`);
        progress.setAttribute('aria-label', `${SCProgress.percent()}% concluído`);
      });
    }
  }
  function bind() {
    const parts = location.hash.replace(/^#\//, '').split('?')[0].split('/');
    if ($('#safetyModules')) course();
    if ($('#safetyLessonTitle')) lesson(parts[2]);
    if ($('#scenarioTitle')) simulator(parts[1]);
    if ($('#trainingResultTitle')) result();
    decorate();
  }
  const templates = { course: 'safetyCourseTemplate', lesson: 'safetyLessonTemplate', simulator: 'safetySimulatorTemplate', result: 'safetyResultTemplate' };
  return { view: type => document.getElementById(templates[type]).innerHTML, bind, rules, remainingLink, nextLesson };
})();
