// Jádro: stav, ukládání, pomocné funkce, ikony, toasty, modaly
(function () {
  const M = (window.MDT = window.MDT || {});

  // ---------- Ikony ----------
  const P = {
    search: '<circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    square: '<rect x="5.5" y="5.5" width="13" height="13" rx="1.5"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v5h5M16 13H8M16 17H8M10 9H8"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    gavel: '<path d="m14 13-7.5 7.5a2.1 2.1 0 0 1-3-3L11 10"/><path d="m16 16 6-6M8 8l6-6M9 7l8 8M21 11l-8-8"/>',
    target: '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
    note: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    radio: '<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5M19.1 4.9C23 8.8 23 15.1 19.1 19"/>',
    compass: '<circle cx="12" cy="12" r="9.5"/><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    settings: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 16v-4M12 8h.01"/>',
    pin: '<path d="M12 17v5"/><path d="M9 10.8a2 2 0 0 1-1.1 1.8l-1.8.9A2 2 0 0 0 5 15.2V17h14v-1.8a2 2 0 0 0-1.1-1.8l-1.8-.9a2 2 0 0 1-1.1-1.8V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
    car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.7-3.6A2 2 0 0 0 13.7 6H7.3a2 2 0 0 0-1.6.8L3 10l-.5.1C1.7 10.3 1 11.1 1 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 17h6"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M17 5h4M5 17v4M3 19h4"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.5 2"/>',
    map: '<path d="M14.1 6.3 9.9 4.2a2 2 0 0 0-1.8 0L3.6 6.4a1 1 0 0 0-.6.9v12.1a1 1 0 0 0 1.4.9l3.7-1.9a2 2 0 0 1 1.8 0l4.2 2.1a2 2 0 0 0 1.8 0l4.5-2.2a1 1 0 0 0 .6-.9V5.3a1 1 0 0 0-1.4-.9l-3.7 1.9a2 2 0 0 1-1.8 0z"/><path d="M15 6v15M9 3v15"/>',
    signal: '<path d="M5 12.6a10 10 0 0 1 14 0M8.5 16.1a5 5 0 0 1 7 0M12 20h.01M2 8.8a15 15 0 0 1 20 0"/>',
    id: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M14 10h4M14 14h4M5 16c.5-1.2 1.6-2 3-2s2.5.8 3 2"/>',
    cpu: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
    archive: '<rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9l-.8-1.2A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/>',
    arrow: '<path d="M5 12h14M13 5l7 7-7 7"/>',
    back: '<path d="M19 12H5M11 19l-7-7 7-7"/>',
    tablet: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M12 18h.01"/>',
    flame: '<path d="M12 22c4 0 7-2.7 7-7 0-4-3-6.5-4-9-1 2-2 3-3.5 3.5C11 7 11 4.5 10 2 7 5 5 8.5 5 13c0 5 3 9 7 9z"/>',
    bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    hand: '<path d="M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>',
    home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    spray: '<path d="M3 3h.01M7 5h.01M11 7h.01M3 7h.01M7 9h.01M3 11h.01"/><rect x="15" y="5" width="4" height="4"/><path d="m19 9 2 2v10a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V11l2-2"/>',
    pill: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z"/><path d="m8.5 8.5 7 7"/>',
    dots: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    power: '<path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/>',
    calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v3M8 18h.01M12 18h.01"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    badge: '<path d="M12 2 4 5v6c0 5.5 3.4 9.7 8 11 4.6-1.3 8-5.5 8-11V5z" fill="currentColor" fill-opacity=".14"/><path d="m12 7 1.5 3.1 3.4.5-2.5 2.4.6 3.4-3-1.6-3 1.6.6-3.4-2.5-2.4 3.4-.5z" fill="currentColor" stroke="none"/>',
  };
  const icon = (name, cls = '') =>
    `<svg class="${cls}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${P[name] || P.dots}</svg>`;

  // ---------- Pomocné funkce ----------
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const debounce = (fn, ms) => {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), ms);
    };
  };
  const norm = (s) =>
    String(s ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  const matchAll = (q, hay) => {
    const tokens = norm(q).split(/\s+/).filter(Boolean);
    const h = norm(hay);
    return tokens.every((t) => h.includes(t));
  };
  const fmtMoney = (n) => '$' + Number(n || 0).toLocaleString('en-US');
  const pad = (n) => String(n).padStart(2, '0');
  const isoDate = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const hhmm = (d = new Date()) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const czDate = (d = new Date()) => `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
  const czFromIso = (iso) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? `${+m[3]}. ${+m[2]}. ${m[1]}` : iso || '';
  };
  // „13.5.2000“ → „13. 5. 2000“
  const normDob = (s) => {
    const m = /^\s*(\d{1,2})\s*[.\/-]\s*(\d{1,2})\s*[.\/-]\s*(\d{4})\s*$/.exec(s || '');
    return m ? `${+m[1]}. ${+m[2]}. ${m[3]}` : (s || '').trim();
  };
  const initials = (name) =>
    String(name || '?')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('') || '?';
  const shortName = (name) => {
    const parts = String(name || '').trim().split(/\s+/);
    if (parts.length < 2) return name || '';
    return parts[0][0] + '. ' + parts.slice(1).join(' ');
  };

  // ---------- Stav ----------
  const defaultSettings = () => ({
    meName: '',
    gender: 'm',
    showRank: false,
    pinned: false,
    prison: 'Bolingbroke Prison',
  });

  const S = {
    settings: defaultSettings(),
    officers: clone(M.DEFAULT_OFFICERS || []),
    seenDefaultOfficers: (M.DEFAULT_OFFICERS || []).map((o) => norm(o.name)),
    persons: [],
    notes: { log: [], scratch: '' },
    customOffenses: [],
    report: null,
    archive: [],
    warrant: null,
    bolo: null,
    duty: { on: false, since: null },
    ui: { page: 'report' },
  };
  M.S = S;

  // Po aktualizaci: noví policisté z výchozího seznamu se doplní do Sboru a u stávajících
  // se doplní jen prázdné údaje (např. chybějící BN). Co si kdo sám upravil nebo smazal, zůstane.
  function mergeDefaultOfficers(data) {
    const defs = M.DEFAULT_OFFICERS || [];
    const seen = new Set((data.seenDefaultOfficers || []).map(norm));
    const firstTime = !data.seenDefaultOfficers;
    S.officers = Array.isArray(S.officers) ? S.officers : [];
    defs.forEach((d) => {
      const key = norm(d.name);
      const ex = S.officers.find((o) => norm(o.name) === key);
      if (ex) {
        ['rank', 'callsign', 'bn'].forEach((k) => { if (!ex[k] && d[k]) ex[k] = d[k]; });
      } else if (!seen.has(key) && !firstTime) {
        S.officers.push(clone(d)); // nový kolega z aktualizace
      }
      seen.add(key);
    });
    S.seenDefaultOfficers = Array.from(seen);
  }

  async function load() {
    let data = null;
    try {
      data = await window.api.store.load();
    } catch {}
    if (data && typeof data === 'object') {
      Object.assign(S, data);
      S.settings = Object.assign(defaultSettings(), data.settings || {});
      delete S.settings.ai;
      mergeDefaultOfficers(data);
      S.notes = Object.assign({ log: [], scratch: '' }, data.notes || {});
      S.ui = Object.assign({ page: 'report' }, data.ui || {});
    }
  }
  const saveNow = () => window.api.store.save(S).catch((e) => console.error(e));
  const save = debounce(saveNow, 400);

  // ---------- Data helpery ----------
  const allOffenses = () => (M.OFFENSES || []).concat(S.customOffenses || []);
  const offenseById = (id) => allOffenses().find((o) => o.id === id);
  const officerByName = (name) => S.officers.find((o) => norm(o.name) === norm(name));
  const me = () => (S.settings.meName ? officerByName(S.settings.meName) : null);
  const fmtOfficer = (name) => {
    const o = officerByName(name);
    if (!o) return name;
    const rank = S.settings.showRank && o.rank ? o.rank + ' ' : '';
    return `${rank}${o.name} (BN ${o.bn || '?'})`;
  };
  const sumOffenses = (ids) => {
    let fine = 0,
      fineMax = 0,
      jail = 0,
      range = false;
    ids.forEach((id) => {
      const o = offenseById(id);
      if (!o) return;
      fine += o.fine || 0;
      fineMax += o.fineMax || o.fine || 0;
      if (o.fineMax) range = true;
      jail += o.jail || 0;
    });
    return { fine, fineMax, jail, range };
  };
  const fmtFine = (t) => (t.range ? `${fmtMoney(t.fine)} – ${fmtMoney(t.fineMax)}` : fmtMoney(t.fine));

  // ---------- Vazba formulářů ----------
  // data-bind="report.location" – hodnota se zapíše do S podle cesty
  const getPath = (path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), S);
  const setPath = (path, val) => {
    const keys = path.split('.');
    const last = keys.pop();
    const obj = keys.reduce((o, k) => (o[k] == null ? (o[k] = {}) : o[k]), S);
    obj[last] = val;
  };
  function bindInputs(root, onChange) {
    root.addEventListener('input', (e) => {
      const el = e.target.closest('[data-bind]');
      if (!el) return;
      const v = el.type === 'checkbox' ? el.checked : el.value;
      setPath(el.dataset.bind, v);
      save();
      onChange && onChange(el.dataset.bind, v, el);
    });
    root.addEventListener('change', (e) => {
      const el = e.target.closest('[data-bind]');
      if (!el || el.tagName !== 'SELECT') return;
      setPath(el.dataset.bind, el.value);
      save();
      onChange && onChange(el.dataset.bind, el.value, el);
    });
  }

  // ---------- Toasty ----------
  function toast(msg, type = 'ok', opts = {}) {
    const box = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    const ic = type === 'err' ? 'alert' : type === 'info' ? 'info' : 'check';
    el.innerHTML = `${icon(ic)}<div class="tm">${esc(msg)}</div>${
      opts.action ? `<button class="btn sm">${esc(opts.action)}</button>` : ''
    }`;
    if (opts.action) el.querySelector('button').onclick = () => { opts.onAction(); dismiss(); };
    box.appendChild(el);
    const dismiss = () => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 200);
    };
    setTimeout(dismiss, opts.ms || (opts.action ? 7000 : 2600));
  }

  async function copy(text, label = 'Zkopírováno do schránky') {
    await window.api.clip.write(text);
    toast(label);
  }

  // ---------- Modal ----------
  function modal({ title, sub, iconName = 'info', body, actions = [], wide = false, onMount }) {
    const root = $('#modalRoot');
    root.innerHTML = `<div class="modal-back"><div class="modal ${wide ? 'wide' : ''}">
      <div class="modal-head"><div class="card-head" style="margin:0;flex:1"><div class="ci blue">${icon(iconName)}</div>
      <div class="grow"><div class="card-title">${esc(title)}</div>${sub ? `<div class="card-sub">${esc(sub)}</div>` : ''}</div></div>
      <button class="icon-btn" data-x>${icon('x')}</button></div>
      <div class="modal-body">${body}</div>
      ${actions.length ? `<div class="modal-foot">${actions.map((a, i) => `<button class="btn ${a.cls || ''}" data-a="${i}">${a.icon ? icon(a.icon) : ''}${esc(a.label)}</button>`).join('')}</div>` : ''}
    </div></div>`;
    const close = () => (root.innerHTML = '');
    const back = root.firstElementChild;
    back.addEventListener('mousedown', (e) => { if (e.target === back) close(); });
    root.querySelector('[data-x]').onclick = close;
    actions.forEach((a, i) => {
      root.querySelector(`[data-a="${i}"]`).onclick = () => {
        if (a.onClick && a.onClick(root) === false) return;
        close();
      };
    });
    onMount && onMount(root.querySelector('.modal'), close);
    return close;
  }
  const confirmBox = (title, text, okLabel, onOk) =>
    modal({
      title,
      iconName: 'alert',
      body: `<p class="muted" style="margin:0">${esc(text)}</p>`,
      actions: [{ label: 'Zrušit' }, { label: okLabel, cls: 'red', onClick: onOk }],
    });

  // ---------- Výběrový seznam (picker) ----------
  // items(q) → [{key, main, sub, right}] ; onPick(key)
  function picker(root, { items, onPick, placeholder = 'Hledat…', iconName = 'search', emptyText = 'Nic nenalezeno' }) {
    root.classList.add('picker');
    root.innerHTML = `<div class="inp-icon">${icon(iconName)}<input class="inp" placeholder="${esc(placeholder)}" /></div><div class="picker-list"></div>`;
    const inp = $('input', root);
    const list = $('.picker-list', root);
    let hl = 0,
      cur = [];
    const render = () => {
      cur = items(inp.value).slice(0, 40);
      hl = Math.min(hl, Math.max(0, cur.length - 1));
      list.innerHTML = cur.length
        ? cur
            .map(
              (it, i) => `<div class="pick-item ${i === hl ? 'hl' : ''}" data-i="${i}">
              <div class="pi-main">${it.main}${it.sub ? `<div class="pi-sub">${it.sub}</div>` : ''}</div>
              ${it.right ? `<div class="pi-right">${it.right}</div>` : ''}</div>`
            )
            .join('')
        : `<div class="pick-empty">${esc(emptyText)}</div>`;
    };
    const open = () => { root.classList.add('open'); render(); };
    const closeL = () => root.classList.remove('open');
    const choose = (i) => {
      const it = cur[i];
      if (!it) return;
      onPick(it.key, it);
      inp.value = '';
      hl = 0;
      render();
      inp.focus();
    };
    inp.addEventListener('focus', open);
    inp.addEventListener('input', () => { hl = 0; open(); });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { hl = Math.min(cur.length - 1, hl + 1); render(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { hl = Math.max(0, hl - 1); render(); e.preventDefault(); }
      else if (e.key === 'Enter') { choose(hl); e.preventDefault(); }
      else if (e.key === 'Escape') { closeL(); inp.blur(); }
    });
    list.addEventListener('mousedown', (e) => {
      const el = e.target.closest('.pick-item');
      if (el) { e.preventDefault(); choose(+el.dataset.i); }
    });
    inp.addEventListener('blur', () => setTimeout(closeL, 120));
    return { input: inp, refresh: render };
  }

  // ---------- Obrázky ----------
  // Zmenší obrázek a vrátí dataURL JPEG
  function downscale(dataUrl, max = 1600) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }
  const fileToDataUrl = (file) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });

  M.mem = { images: [], outTab: 'text', law: { q: '', cat: 'all', jailOnly: false, open: null }, guide: null, personSel: null, codesQ: '' };
  M.pages = {};
  M.core = {
    icon, esc, $, $$, clone, uid, debounce, norm, matchAll, fmtMoney, fmtFine, pad, isoDate, hhmm, czDate, czFromIso,
    normDob, initials, shortName, load, save, saveNow, allOffenses, offenseById, officerByName, me, fmtOfficer,
    sumOffenses, getPath, setPath, bindInputs, toast, copy, modal, confirmBox, picker, downscale, fileToDataUrl,
  };
})();
