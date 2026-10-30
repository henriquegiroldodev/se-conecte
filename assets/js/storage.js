/* Adaptador local: substituir read/write por uma implementação autenticada ao integrar a API. */
window.SCStore = (() => {
  const memory = new Map();
  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch { return memory.has(key) ? memory.get(key) : fallback; }
  }
  function write(key, value) {
    memory.set(key, value);
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch {
      document.dispatchEvent(new CustomEvent('sc:storage-unavailable'));
      return false;
    }
  }
  return { read, write };
})();
