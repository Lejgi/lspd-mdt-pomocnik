// Náhradní API, když se stránka otevře mimo Electron (např. v prohlížeči pro náhled).
(function () {
  if (window.api) return;
  const KEY = 'mdt-data';
  window.api = {
    win: { minimize() {}, maximize() {}, close() {}, pin: async (on) => !!on, onState() {} },
    store: {
      load: async () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } },
      save: async (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} return true; },
      path: async () => 'localStorage (náhled v prohlížeči)',
      reveal() {},
    },
    clip: {
      write: async (t) => { try { await navigator.clipboard.writeText(t); } catch {} return true; },
      image: async () => null,
      read: async () => { try { return await navigator.clipboard.readText(); } catch { return ''; } },
    },
    update: {
      check: async () => ({ enabled: false }),
      install: async () => ({ ok: false, error: 'Jen v desktopové aplikaci.' }),
      version: async () => 'náhled',
    },
    calc: {
      toggle: () => window.open('calc.html', 'calc', 'width=400,height=600'),
      hide: () => window.close(),
      toReport: (ids) => { try { window.opener && window.opener.postMessage({ calcToReport: ids }, '*'); } catch {} },
      onToReport: (cb) => window.addEventListener('message', (e) => e.data && e.data.calcToReport && cb(e.data.calcToReport)),
      onShown() {},
      key: async () => ({ key: 'Ctrl + Shift + M', ok: false }),
    },
    openExternal: (u) => window.open(u, '_blank'),
  };
})();
