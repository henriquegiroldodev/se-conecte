window.SCProgress = (() => {
  const key = 'sc_safety_progress_v1';
  const empty = () => ({ version: 1, lessons: {}, scenarios: {} });
  let records = empty();
  const baseXP = window.SC.user.xp;
  const baseLevel = window.SC.user.level;
  function validRecord(record, question) {
    return record && Number.isInteger(record.answer) && record.answer >= 0 && record.answer < question.options.length && record.completed === true;
  }
  function load() {
    const saved = SCStore.read(key, empty());
    records = empty();
    for (const [group, items] of [['lessons', SCSafetyData.modules], ['scenarios', SCSafetyData.scenarios]]) {
      items.forEach(item => { if (validRecord(saved?.[group]?.[item.id], item)) records[group][item.id] = { ...saved[group][item.id], correct: saved[group][item.id].answer === item.correct }; });
    }
    sync();
  }
  function percent() {
    return Math.round((Object.keys(records.lessons).length + Object.keys(records.scenarios).length) / (SCSafetyData.modules.length + SCSafetyData.scenarios.length) * 100);
  }
  function earned() { return Object.keys(records.lessons).length * 35 + Object.keys(records.scenarios).length * 15; }
  function sync() {
    window.SC.user.xp = baseXP + earned();
    window.SC.user.next = Math.max(1500, (Math.floor(window.SC.user.xp / 1500) + 1) * 1500);
    window.SC.user.level = window.SC.user.xp >= 1500 ? 'Conectado' : baseLevel;
    window.SC.user.nextLevel = window.SC.user.xp >= 1500 ? 'Avançado' : 'Conectado';
    const level = document.querySelector('#profile small');
    if (level) level.textContent = window.SC.user.level;
    window.SC.courses.find(course => course.id === SCSafetyData.id).progress = percent();
    document.dispatchEvent(new CustomEvent('sc:progress', { detail: { percent: percent(), xp: earned() } }));
  }
  function complete(group, id, answer) {
    const item = (group === 'lessons' ? SCSafetyData.modules : SCSafetyData.scenarios).find(item => item.id === id);
    if (!item || !Number.isInteger(answer) || answer < 0 || answer >= item.options.length) return 0;
    if (records[group][id]?.completed) return 0;
    records[group][id] = { completed: true, answer, correct: answer === item.correct, completedAt: new Date().toISOString() };
    SCStore.write(key, records); sync();
    // Aulas: 25 XP por concluir + 10 XP pela prática e revisão. Simulações: 15 XP.
    return group === 'lessons' ? 35 : 15;
  }
  function achievements() {
    return SCSafetyData.achievements.map(item => ({ ...item, unlocked: item.all ? percent() === 100 : !!records.lessons[item.lesson]?.completed }));
  }
  return {
    load, percent, earned, achievements,
    lesson: id => records.lessons[id] || null,
    scenario: id => records.scenarios[id] || null,
    completeLesson: (id, answer) => complete('lessons', id, answer),
    completeScenario: (id, answer) => complete('scenarios', id, answer),
    snapshot: () => JSON.parse(JSON.stringify(records))
  };
})();
