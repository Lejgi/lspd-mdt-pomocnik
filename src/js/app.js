// Start aplikace: navigace, titulní lišta, služba, zkratky
(function () {
  const M = window.MDT;
  const C = M.core;
  const S = M.S;
  const { icon, esc, $, $$ } = C;

  const NAV = [
    { group: 'Služba' },
    { k: 'report', label: 'Hlášení', icon: 'file' },
    { k: 'law', label: 'Zákoník', icon: 'book' },
    { k: 'warrant', label: 'Zatykač', icon: 'gavel' },
    { k: 'bolo', label: 'Pátrání (BOLO)', icon: 'target' },
    { group: 'Evidence' },
    { k: 'persons', label: 'Osoby', icon: 'users' },
    { k: 'notes', label: 'Poznámky', icon: 'note' },
    { group: 'Reference' },
    { k: 'codes', label: 'Kódy', icon: 'radio' },
    { k: 'guides', label: 'Návody', icon: 'compass' },
    { spacer: true },
    { k: 'roster', label: 'Sbor', icon: 'shield' },
    { k: 'settings', label: 'Nastavení', icon: 'settings' },
  ];
  const ORDER = NAV.filter((n) => n.k).map((n) => n.k);

  function renderSidebar() {
    $('#sidebar').innerHTML =
      NAV.map((n) => {
        if (n.group) return `<div class="nav-group">${n.group}</div>`;
        if (n.spacer) return `<div class="nav-spacer"></div>`;
        const i = ORDER.indexOf(n.k) + 1;
        return `<button class="nav-item ${S.ui.page === n.k ? 'active' : ''}" data-nav="${n.k}">${icon(n.icon)}<span>${n.label}</span>
          ${n.k === 'law' ? `<span class="badge" id="nb-law"></span>` : i <= 9 ? `<span class="kbd">Ctrl ${i}</span>` : ''}</button>`;
      }).join('') + `<div class="duty" id="duty"></div>`;
    $$('[data-nav]').forEach((b) => (b.onclick = () => go(b.dataset.nav)));
    updateBadges();
    renderDuty();
  }

  function updateBadges() {
    const b = $('#nb-law');
    if (!b) return;
    const n = S.report ? S.report.offenses.length : 0;
    b.textContent = n || '';
    b.style.display = n ? '' : 'none';
  }

  function go(page) {
    if (!M.pages[page]) page = 'report';
    S.ui.page = page;
    C.save();
    $$('[data-nav]').forEach((b) => b.classList.toggle('active', b.dataset.nav === page));
    render();
  }

  function render() {
    const view = $('#view');
    view.innerHTML = '';
    const host = document.createElement('div');
    view.appendChild(host);
    view.scrollTop = 0;
    M.pages[S.ui.page].render(host);
    updateBadges();
  }

  // ---------- Titulní lišta ----------
  function updateMe() {
    const el = $('#tbMe');
    const m = C.me();
    if (m) {
      el.className = 'tb-me';
      el.innerHTML = `<span class="av">${esc(C.initials(m.name))}</span><span>${esc(m.name)}</span><span class="bn">BN ${esc(m.bn || '?')}</span>`;
    } else {
      el.className = 'tb-me warn';
      el.innerHTML = `${icon('alert')}<span>Nastav, kdo jsi</span>`;
      el.querySelector('svg').style.cssText = 'width:15px;height:15px;margin-left:6px';
    }
  }
  async function applyPin() {
    const on = await window.api.win.pin(!!S.settings.pinned);
    $('#tbPin').classList.toggle('on', on);
  }

  // ---------- Služba ----------
  function renderDuty() {
    const d = $('#duty');
    if (!d) return;
    const on = S.duty.on;
    let t2 = '10-7';
    if (on && S.duty.since) {
      const min = Math.floor((Date.now() - new Date(S.duty.since)) / 60000);
      t2 = `${Math.floor(min / 60)} h ${C.pad(min % 60)} min`;
    }
    d.className = 'duty ' + (on ? 'on' : '');
    d.innerHTML = `<span class="lamp"></span><div class="dtxt"><div class="t1">${on ? '10-8 · Ve službě' : 'Mimo službu'}</div><div class="t2">${t2}</div></div>
      <button id="dutyBtn">${on ? 'UKONČIT' : 'ZAHÁJIT'}</button>`;
    $('#dutyBtn').onclick = () => {
      if (S.duty.on) {
        const min = Math.floor((Date.now() - new Date(S.duty.since)) / 60000);
        M.addLog(`10-7 Mimo službu (služba ${Math.floor(min / 60)} h ${C.pad(min % 60)} min)`);
        S.duty = { on: false, since: null };
      } else {
        S.duty = { on: true, since: new Date().toISOString() };
        M.addLog('10-8 Ve službě');
      }
      C.save();
      renderDuty();
      if (S.ui.page === 'notes') render();
    };
  }

  // ---------- Aktualizace ----------
  let updBusy = false;
  async function checkUpdate(manual) {
    const r = await window.api.update.check();
    M.mem.update = r;
    const bar = $('#updBar');
    if (!r.enabled) return r;
    if (r.error) {
      if (manual) C.toast('Aktualizace: ' + r.error, 'err', { ms: 6000 });
      return r;
    }
    if (!r.available) {
      bar.classList.remove('on');
      if (manual) C.toast(`Máš nejnovější verzi (${r.current})`, 'info');
      return r;
    }
    bar.innerHTML = `${icon('bolt')}<div class="ub-t"><b>Je tu nová verze ${esc(r.latest)}</b><span>Máš ${esc(r.current)} · tvoje hlášení a nastavení zůstanou</span></div>
      ${r.notes.length ? `<button class="btn sm" id="updNotes">${icon('info')}Co je nového</button>` : ''}
      <button class="btn sm blue" id="updGo">${icon('refresh')}Aktualizovat</button>`;
    bar.classList.add('on');
    const notes = $('#updNotes');
    if (notes) notes.onclick = () => C.modal({
      title: `Co je nového ve verzi ${r.latest}`,
      iconName: 'bolt',
      body: `<ul class="upd-notes">${r.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>`,
      actions: [{ label: 'Zavřít' }, { label: 'Aktualizovat', cls: 'blue', icon: 'refresh', onClick: () => { installUpdate(); } }],
    });
    $('#updGo').onclick = installUpdate;
    return r;
  }
  async function installUpdate() {
    if (updBusy) return;
    updBusy = true;
    const btn = $('#updGo');
    if (btn) { btn.disabled = true; btn.innerHTML = `<span class="spinner"></span>Stahuji…`; }
    await C.saveNow();
    const res = await window.api.update.install();
    if (res.ok) {
      C.toast('Aktualizace hotová – aplikace se restartuje…', 'ok', { ms: 5000 });
    } else {
      updBusy = false;
      if (btn) { btn.disabled = false; btn.innerHTML = `${icon('refresh')}Aktualizovat`; }
      C.toast('Aktualizace se nepovedla: ' + res.error, 'err', { ms: 8000 });
    }
  }
  M.checkUpdate = checkUpdate;

  // ---------- Start ----------
  async function init() {
    $$('[data-icon]').forEach((el) => (el.innerHTML = icon(el.dataset.icon)));
    await C.load();
    if (!S.report) S.report = M.newReport();
    $('#tbMin').onclick = () => window.api.win.minimize();
    $('#tbMax').onclick = () => window.api.win.maximize();
    $('#tbClose').onclick = async () => { await C.saveNow(); window.api.win.close(); };
    $('#tbPin').onclick = () => { S.settings.pinned = !S.settings.pinned; C.save(); applyPin(); C.toast(S.settings.pinned ? 'Okno je vždy navrchu' : 'Okno už není navrchu', 'info'); };
    $('#tbMe').onclick = () => go('roster');
    $('#tbCalc').onclick = () => window.api.calc.toggle();
    // Přestupky poslané z plovoucí kalkulačky → do rozepsaného hlášení
    window.api.calc.onToReport((ids) => {
      const r = S.report;
      let added = 0;
      (ids || []).forEach((id) => {
        if (C.offenseById(id) && !r.offenses.includes(id)) { r.offenses.push(id); added++; }
      });
      M.report && M.report.autoInvoice(r, false);
      C.save();
      if (S.ui.page === 'report') render(); else go('report');
      C.toast(added ? `Přestupky z kalkulačky jsou v hlášení (+${added})` : 'Tyhle přestupky už v hlášení jsou', added ? 'ok' : 'info');
    });
    window.api.win.onState((s) => { $('#tbMax').innerHTML = icon(s.maximized ? 'copy' : 'square'); });

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && !e.shiftKey && !e.altKey && /^[1-9]$/.test(e.key)) {
        const p = ORDER[+e.key - 1];
        if (p) { go(p); e.preventDefault(); }
      }
      if (e.key === 'Escape' && $('#modalRoot').innerHTML) $('#modalRoot').innerHTML = '';
    });
    window.addEventListener('beforeunload', () => C.saveNow());

    renderSidebar();
    updateMe();
    applyPin();
    render();
    setInterval(renderDuty, 30000);
    setTimeout(() => checkUpdate(false), 2500);
    setInterval(() => checkUpdate(false), 3 * 60 * 60 * 1000);

    if (!S.settings.meName) {
      setTimeout(() => C.toast('Nejdřív si v sekci Sbor označ, kdo jsi – kvůli podpisu v hlášeních.', 'info', { action: 'Sbor', onAction: () => go('roster'), ms: 9000 }), 600);
    }
  }

  Object.assign(M, { go, render, updateMe, updateBadges, applyPin });
  init();
})();
