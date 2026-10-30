window.SCNavigation = (() => {
  const desktop = window.matchMedia('(min-width:980px)');
  const get = id => document.getElementById(id);
  function sync() {
    const opened = get('sidebar').classList.contains('open') && !desktop.matches;
    get('sidebar').inert = !desktop.matches && !opened;
    get('menu').setAttribute('aria-expanded', String(opened));
    ['main','openHelp'].forEach(id => get(id).inert = opened);
    document.querySelector('.topbar').inert = opened;
  }
  function close(restoreFocus = false) {
    get('sidebar').classList.remove('open'); get('backdrop').classList.remove('show'); sync();
    if (restoreFocus && !desktop.matches) get('menu').focus();
  }
  function open() {
    get('sidebar').classList.add('open'); get('backdrop').classList.add('show'); sync();
    get('closeMenu').focus();
  }
  function init() {
    get('menu').onclick = open; get('closeMenu').onclick = () => close(true); get('backdrop').onclick = () => close(true);
    desktop.addEventListener('change', () => close());
    document.addEventListener('keydown', event => {
      if (!get('sidebar').classList.contains('open') || desktop.matches || document.querySelector('dialog[open]')) return;
      if (event.key === 'Escape') { event.preventDefault(); close(true); return; }
      if (event.key !== 'Tab') return;
      const controls = [...get('sidebar').querySelectorAll('a,button')].filter(element => !element.disabled && element.getClientRects().length);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    sync();
  }
  return { init, close, open };
})();
