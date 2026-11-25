const { app, BrowserWindow, ipcMain, clipboard, shell, globalShortcut, screen } = require('electron');
const path = require('path');
const fs = require('fs');

let win;
let calcWin;
const DATA_FILE = () => path.join(app.getPath('userData'), 'mdt-data.json');
const ICON = path.join(__dirname, 'assets', 'icon.ico');
const CALC_KEY = 'CommandOrControl+Shift+M';

function createWindow() {
  win = new BrowserWindow({
    width: 1340,
    height: 860,
    minWidth: 1000,
    minHeight: 640,
    frame: false,
    backgroundColor: '#080c16',
    title: 'LSPD MDT Pomocník',
    icon: ICON,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });
  win.loadFile(path.join(__dirname, 'src', 'index.html'));
  win.once('ready-to-show', () => win.show());
  win.on('maximize', () => win.webContents.send('win:state', { maximized: true }));
  win.on('unmaximize', () => win.webContents.send('win:state', { maximized: false }));
  // Odkazy otevírat v prohlížeči, ne v aplikaci
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
}

// ---------- Aktualizace (jen verze pro kolegy – v package.json je "updateUrl") ----------
// Na GitHubu leží update.json se seznamem souborů a jejich otisky (SHA-256).
// Stáhnou se jen soubory, které se změnily. Data uživatele (%APPDATA%) se nikdy nemění.
const crypto = require('crypto');
const PKG = (() => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')); } catch { return {}; } })();
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const newer = (a, b) => {
  const pa = String(a).split('.').map(Number), pb = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0);
  return false;
};
async function getUrl(url, timeoutMs = 20000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(), { signal: ctrl.signal });
    if (!res.ok) throw new Error(`Server vrátil ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Vypršel čas – GitHub neodpověděl.');
    if (err.cause && /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN/.test(err.cause.code || '')) throw new Error('Nelze se spojit s GitHubem – je připojení k internetu?');
    throw err;
  } finally {
    clearTimeout(t);
  }
}
// Bezpečná cesta uvnitř složky aplikace (žádné ../)
function appFile(rel) {
  const full = path.resolve(__dirname, rel);
  if (!full.startsWith(path.resolve(__dirname) + path.sep)) throw new Error('Neplatná cesta v aktualizaci: ' + rel);
  return full;
}
let lastManifest = null;
ipcMain.handle('update:check', async () => {
  const base = PKG.updateUrl;
  if (!base) return { enabled: false, current: PKG.version };
  try {
    const man = JSON.parse((await getUrl(base.replace(/\/+$/, '') + '/update.json')).toString('utf8'));
    lastManifest = man;
    return { enabled: true, current: PKG.version, latest: man.version, available: newer(man.version, PKG.version), notes: man.notes || [] };
  } catch (err) {
    return { enabled: true, current: PKG.version, error: err.message };
  }
});
ipcMain.handle('update:install', async () => {
  const base = (PKG.updateUrl || '').replace(/\/+$/, '');
  const man = lastManifest;
  if (!base || !man || !Array.isArray(man.files)) return { ok: false, error: 'Nejdřív zkontroluj aktualizace.' };
  try {
    // 1) zjistit, co se změnilo
    const todo = man.files.filter((f) => {
      try { return sha256(fs.readFileSync(appFile(f.path))) !== f.sha256; } catch { return true; }
    });
    // 2) stáhnout vše do paměti a ověřit otisky – když cokoli selže, nic se nepřepíše
    const got = [];
    for (const f of todo) {
      const buf = await getUrl(base + '/' + f.path.split('/').map(encodeURIComponent).join('/'), 60000);
      if (sha256(buf) !== f.sha256) throw new Error(`Soubor ${f.path} se stáhl poškozený, zkus to znovu.`);
      got.push([appFile(f.path), buf]);
    }
    // 3) zapsat (package.json až nakonec – nese číslo verze)
    got.sort((a, b) => (a[0].endsWith('package.json') ? 1 : 0) - (b[0].endsWith('package.json') ? 1 : 0));
    for (const [file, buf] of got) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file + '.new', buf);
      fs.renameSync(file + '.new', file);
    }
    setTimeout(() => { app.isQuitting = true; app.relaunch(); app.exit(0); }, 600);
    return { ok: true, count: got.length };
  } catch (err) {
    const msg = /EPERM|EACCES/.test(err.code || err.message) ? 'Aplikace nemůže zapisovat do své složky. Přesuň ji třeba do Dokumentů a zkus to znovu.' : err.message;
    return { ok: false, error: msg };
  }
});
ipcMain.handle('app:version', () => PKG.version || '');

// ---------- Plovoucí kalkulačka trestu (Ctrl+Shift+M) ----------
function createCalc() {
  const wa = screen.getPrimaryDisplay().workArea;
  const W = 400, H = 600;
  calcWin = new BrowserWindow({
    width: W,
    height: H,
    minWidth: 340,
    minHeight: 420,
    x: wa.x + wa.width - W - 24,
    y: wa.y + 80,
    frame: false,
    show: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    backgroundColor: '#080c16',
    title: 'Kalkulačka trestu',
    icon: ICON,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });
  calcWin.setAlwaysOnTop(true, 'screen-saver'); // i nad hrou v režimu okno bez okrajů
  calcWin.loadFile(path.join(__dirname, 'src', 'calc.html'));
  // Zavření jen schová – obsah kalkulačky zůstane
  calcWin.on('close', (e) => {
    if (!app.isQuitting) { e.preventDefault(); calcWin.hide(); }
  });
}
function toggleCalc(forceShow) {
  if (!calcWin || calcWin.isDestroyed()) createCalc();
  if (!forceShow && calcWin.isVisible() && calcWin.isFocused()) {
    calcWin.hide();
    return;
  }
  const show = () => {
    calcWin.show();
    calcWin.focus();
    calcWin.webContents.send('calc:shown');
  };
  if (calcWin.webContents.isLoading()) calcWin.webContents.once('did-finish-load', show);
  else show();
}
ipcMain.on('calc:toggle', () => toggleCalc(true));
ipcMain.on('calc:hide', () => calcWin && calcWin.hide());
// Přenos přestupků z kalkulačky do rozepsaného hlášení
ipcMain.on('calc:toReport', (_e, ids) => {
  if (!win) return;
  win.webContents.send('calc:toReport', ids);
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
});
ipcMain.handle('calc:key', () => ({ key: 'Ctrl + Shift + M', ok: globalShortcut.isRegistered(CALC_KEY) }));

app.whenReady().then(() => {
  createWindow();
  createCalc();
  win.on('closed', () => {
    win = null;
    app.isQuitting = true;
    app.quit();
  });
  const ok = globalShortcut.register(CALC_KEY, () => toggleCalc(false));
  if (!ok) console.warn('Zkratku', CALC_KEY, 'už používá jiný program.');
});
app.on('before-quit', () => (app.isQuitting = true));
app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => app.quit());

// ---------- Okno ----------
ipcMain.on('win:minimize', () => win && win.minimize());
ipcMain.on('win:maximize', () => {
  if (!win) return;
  win.isMaximized() ? win.unmaximize() : win.maximize();
});
ipcMain.on('win:close', () => win && win.close());
ipcMain.handle('win:pin', (_e, on) => {
  if (!win) return false;
  win.setAlwaysOnTop(!!on, 'screen-saver');
  return win.isAlwaysOnTop();
});

// ---------- Úložiště ----------
ipcMain.handle('store:load', () => {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE(), 'utf8'));
  } catch {
    return null;
  }
});
ipcMain.handle('store:save', (_e, data) => {
  const file = DATA_FILE();
  const tmp = file + '.tmp';
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, file);
  return true;
});
ipcMain.handle('store:path', () => DATA_FILE());
ipcMain.on('store:reveal', () => shell.showItemInFolder(DATA_FILE()));

// ---------- Schránka ----------
ipcMain.handle('clip:write', (_e, text) => {
  clipboard.writeText(String(text ?? ''));
  return true;
});
ipcMain.handle('clip:read', () => clipboard.readText());
ipcMain.handle('clip:image', () => {
  const img = clipboard.readImage();
  if (img.isEmpty()) return null;
  return img.toDataURL();
});

ipcMain.on('open:external', (_e, url) => {
  if (/^https:\/\//.test(url)) shell.openExternal(url);
});
