// Generátor hlášení
(function () {
  const M = window.MDT;
  const C = M.core;
  const S = M.S;
  const { icon, esc, $, $$ } = C;

  const SCENARIOS = [
    { k: 'traffic', label: 'Traffic stop', code: '10-11', tablet: 'Doprava', icon: 'car', source: 'patrol', actions: ['lustrace', 'doklady', 'vuz'] },
    { k: 'accident', label: 'Dopravní nehoda', code: '10-50', tablet: 'Doprava', icon: 'alert', source: 'dispatch', actions: ['lustrace', 'doklady', 'foto'] },
    { k: 'theft', label: 'Krádež', code: '10-16', tablet: 'Krádež', icon: 'hand', source: 'dispatch', actions: ['lustrace', 'foto'] },
    { k: 'burglary', label: 'Vloupání', code: '10-69', tablet: 'Vloupání', icon: 'home', source: 'dispatch', actions: ['ohledani', 'foto'] },
    { k: 'assault', label: 'Napadení', code: '10-10', tablet: 'Napadení', icon: 'bolt', source: 'dispatch', actions: ['lustrace', 'foto'] },
    { k: 'vandal', label: 'Vandalismus', code: '', tablet: 'Vandalismus', icon: 'spray', source: 'dispatch', actions: ['foto'] },
    { k: 'chase', label: 'Pronásledování', code: '10-80', tablet: 'Ostatní', icon: 'flame', source: 'patrol', actions: ['pouta', 'prava', 'prevoz'] },
    { k: 'robbery', label: 'Ozbrojená loupež', code: '10-68', tablet: 'Ostatní', icon: 'target', source: 'dispatch', actions: ['pouta', 'prava', 'prevoz', 'dukazy'] },
    { k: 'drugs', label: 'Drogy', code: '10-14', tablet: 'Ostatní', icon: 'pill', source: 'patrol', actions: ['prohlOsoby', 'zabaveni', 'foto'] },
    { k: 'other', label: 'Ostatní', code: '', tablet: 'Ostatní', icon: 'dots', source: 'dispatch', actions: [] },
  ];
  const SOURCES = [
    { k: 'patrol', label: 'Hlídková činnost' },
    { k: 'dispatch', label: 'Dispatch' },
    { k: 'citizen', label: 'Oznámení občana' },
    { k: 'bolo', label: 'Osoba z BOLO' },
    { k: 'other', label: 'Jiné' },
  ];
  const ACTIONS = [
    ['lustrace', 'Lustrace osoby'],
    ['doklady', 'Kontrola dokladů'],
    ['vuz', 'Kontrola vozidla'],
    ['prohlOsoby', 'Prohlídka osoby'],
    ['prohlVozu', 'Prohlídka vozidla'],
    ['foto', 'Fotodokumentace'],
    ['ohledani', 'Ohledání místa činu'],
    ['dukazy', 'Zajištění důkazů'],
    ['otisky', 'Odběr otisků / DNA'],
    ['zabaveni', 'Zabavení věcí'],
    ['dech', 'Dechová zkouška'],
    ['drogtest', 'Test na návykové látky'],
    ['pouta', 'Zadržení osoby'],
    ['prava', 'Poučení o právech'],
    ['vyslech', 'Výslech'],
    ['prevoz', 'Převoz na PD (CPZ)'],
    ['odtah', 'Odtah vozidla'],
    ['ems', 'Přivolání EMS'],
    ['pomoc', 'První pomoc'],
  ];
  const ACTION_LABEL = Object.fromEntries(ACTIONS);
  const ROLES = { suspect: 'podezřelý', victim: 'poškozený', witness: 'svědek', civilian: 'civilista' };
  const RESOLUTIONS = [
    { k: 'invoice', label: 'Pokuta na fakturu', icon: 'file' },
    { k: 'paid', label: 'Pokuta uhrazena', icon: 'check' },
    { k: 'jail', label: 'Vězení', icon: 'gavel' },
    { k: 'warning', label: 'Domluva', icon: 'radio' },
    { k: 'released', label: 'Propuštěn', icon: 'arrow' },
    { k: 'open', label: 'Další šetření', icon: 'search' },
  ];
  const TABLET_TYPES = ['Doprava', 'Krádež', 'Vloupání', 'Napadení', 'Vandalismus', 'Ostatní'];
  const scen = (k) => SCENARIOS.find((s) => s.k === k) || SCENARIOS[SCENARIOS.length - 1];

  function newReport() {
    const sc = SCENARIOS[0];
    return {
      scenario: sc.k,
      tabletType: sc.tablet,
      source: sc.source,
      sourceNote: '',
      location: '',
      date: C.isoDate(),
      time: C.hhmm(),
      officers: S.settings.meName ? [S.settings.meName] : [],
      persons: [],
      vehicle: { plate: '', model: '', color: '' },
      narrative: '',
      investigation: '',
      actions: sc.actions.slice(),
      actionsExtra: '',
      offenses: [],
      resolution: '',
      resolutionNote: '',
      manualText: null,
      checks: { photos: false, shared: false, tags: false, tow: false },
    };
  }
  M.newReport = newReport;
  if (!S.report) S.report = newReport();

  // ---------- Text hlášení ----------
  const endDot = (s) => {
    s = String(s || '').trim();
    return s && !/[.!?…]$/.test(s) ? s + '.' : s;
  };
  const suspects = (r) => r.persons.filter((p) => p.role === 'suspect' && p.name.trim());

  function generate(r) {
    const sc = scen(r.scenario);
    const t = C.sumOffenses(r.offenses);
    const loc = r.location.trim() || '[DOPLŇ MÍSTO]';
    const when = `Dne ${C.czFromIso(r.date)}${r.time ? ` v cca ${r.time} hod.` : ''}`;
    const L = [];

    const srcSentence = {
      patrol:
        r.scenario === 'traffic'
          ? `${when} hlídka LSPD při hlídkové činnosti zastavila vozidlo (10-11) v lokaci ${loc}.`
          : `${when} hlídka LSPD při hlídkové činnosti zaznamenala incident v lokaci ${loc}.`,
      dispatch: `${when} hlídka LSPD obdržela dispatch${sc.code ? ` (${sc.code})` : ''} a vyjela na místo: ${loc}.`,
      citizen: `${when} byla hlídka LSPD kontaktována občanem a vyjela na místo: ${loc}.`,
      bolo: `${when} hlídka LSPD při hlídkové činnosti narazila na osobu z vyhlášeného pátrání (BOLO) v lokaci ${loc}.`,
      other: `${when} se hlídka LSPD o incidentu dozvěděla následovně: ${(r.sourceNote || '[DOPLŇ]').trim().replace(/\.$/, '')}. Místo: ${loc}.`,
    }[r.source] || `${when} hlídka LSPD vyjela na místo: ${loc}.`;
    L.push(srcSentence);
    if (r.sourceNote.trim() && r.source !== 'other') L.push(endDot(r.sourceNote));

    L.push('');
    L.push(`Zasahující policisté: ${r.officers.length ? r.officers.map(C.fmtOfficer).join(', ') : '[DOPLŇ POLICISTY]'}.`);

    const persons = r.persons.filter((p) => p.name.trim());
    if (persons.length) {
      L.push('');
      L.push('Osoby na místě:');
      persons.forEach((p) => {
        const dob = p.dob.trim() ? `nar. ${C.normDob(p.dob)}` : 'datum narození neuvedeno';
        L.push(`– ${p.name.trim()}, ${dob} – ${ROLES[p.role] || p.role}${p.note.trim() ? ` (${p.note.trim()})` : ''}`);
      });
    }

    const v = r.vehicle;
    if (v.plate.trim() || v.model.trim()) {
      const parts = [v.model.trim(), v.plate.trim() && `SPZ ${v.plate.trim().toUpperCase()}`, v.color.trim() && `barva ${v.color.trim()}`].filter(Boolean);
      L.push('');
      L.push(`Vozidlo: ${parts.join(', ')}.`);
    }

    L.push('');
    L.push(`Průběh: ${endDot(r.narrative) || '[DOPLŇ PRŮBĚH]'}`);

    if (r.investigation.trim()) {
      L.push('');
      L.push(`Postup vyšetřování: ${endDot(r.investigation)}`);
    }

    const acts = r.actions.map((k) => ACTION_LABEL[k]).filter(Boolean);
    if (r.actionsExtra.trim()) acts.push(r.actionsExtra.trim().replace(/\.$/, ''));
    if (acts.length) {
      L.push('');
      L.push(`Provedené úkony: ${acts.join(', ').toLowerCase().replace(/^./, (c) => c.toUpperCase()).replace(/\bpd\b/gi, 'PD').replace(/\bcpz\b/gi, 'CPZ').replace(/\bdna\b/gi, 'DNA').replace(/\bems\b/gi, 'EMS')}.`);
    }

    const sus = suspects(r);
    const who = sus.length ? sus[0].name.trim() : '';
    if (r.offenses.length) {
      L.push('');
      L.push(`Zjištěné přestupky${who ? ` (${who})` : ''}:`);
      r.offenses.forEach((id) => {
        const o = C.offenseById(id);
        if (!o) return;
        const vals = [o.fineMax ? `${C.fmtMoney(o.fine)} – ${C.fmtMoney(o.fineMax)}` : C.fmtMoney(o.fine), o.jail ? `${o.jail} měs.` : ''].filter(Boolean).join(', ');
        L.push(`– ${o.name} (${o.id}) – ${vals}`);
      });
      L.push(`Celkem: pokuta ${C.fmtFine(t)}, trest odnětí svobody ${t.jail} měs.`);
    }

    const fine = C.fmtFine(t);
    const osoba = who ? `Osoba ${who}` : 'Osoba';
    const res = {
      paid: `${osoba} uhradila na místě pokutu ve výši ${fine}.`,
      invoice: `Za uvedené přestupky byla ${who ? `osobě ${who}` : 'osobě'} vystavena pokuta formou faktury ve výši ${fine}.`,
      jail: `${osoba} byla zadržena, převezena na PD a odeslána do výkonu trestu odnětí svobody v délce ${t.jail} měs. (${S.settings.prison || 'Bolingbroke Prison'})${t.fine > 0 ? `; zároveň jí byla vystavena pokuta formou faktury ve výši ${fine}` : ''}.`,
      warning: `${osoba} byla poučena a věc byla vyřešena domluvou.`,
      released: `${osoba} byla po provedení úkonů propuštěna.`,
      open: 'Věc byla předána k dalšímu šetření, případ zůstává otevřený.',
    }[r.resolution];
    if (res || r.resolutionNote.trim()) {
      L.push('');
      L.push(`Řešení: ${[res, endDot(r.resolutionNote)].filter(Boolean).join(' ')}`);
    }

    L.push('');
    const m = C.me();
    const sig = m
      ? `${S.settings.showRank && m.rank ? m.rank + ' ' : ''}${m.name}, BN ${m.bn || '?'}`
      : '[NASTAV SVÉ JMÉNO V NASTAVENÍ]';
    L.push(`${S.settings.gender === 'f' ? 'Sepsala' : 'Sepsal'} ${sig}, dne ${C.czDate()} v ${C.hhmm()}.`);
    return L.join('\n');
  }
  M.generateReport = generate;

  const CALLSIGN_RE = /\b(lincoln|lincorn|tom|charlie|charles|nora|adam|mary)\s*[-–]?\s*\d{1,3}\b|\bL-\d{1,3}\b/i;

  function checks(r, text) {
    const out = [];
    const t = C.sumOffenses(r.offenses);
    const err = (m) => out.push({ lvl: 'err', m });
    const warn = (m) => out.push({ lvl: 'warn', m });
    if (!C.me()) err('Nemáš nastavené, kdo jsi – chybí podpis (Nastavení → Profil).');
    if (!r.location.trim()) err('Chybí místo incidentu.');
    if (!r.officers.length) err('Nejsou vybraní zasahující policisté.');
    r.officers.forEach((n) => {
      const o = C.officerByName(n);
      if (!o || !o.bn) warn(`${n} nemá vyplněné BN (doplň v sekci Sbor).`);
    });
    if (!r.narrative.trim()) err('Chybí průběh – co se stalo.');
    if (!r.persons.length) warn('Nejsou uvedené žádné osoby.');
    r.persons.forEach((p) => {
      if (!p.name.trim()) warn('Jedna z osob nemá jméno.');
      else if (!p.dob.trim()) warn(`${p.name.trim()}: chybí datum narození.`);
    });
    if (r.offenses.length && !suspects(r).length) warn('Jsou vybrané přestupky, ale chybí podezřelý (role osoby).');
    if (!r.resolution && !r.resolutionNote.trim()) warn('Není vybrané řešení.');
    if (t.jail > 0 && r.resolution && !['jail', 'open'].includes(r.resolution)) warn(`Přestupky mají ${t.jail} měs. vězení, ale řešení není „Vězení“.`);
    if (r.resolution === 'jail' && t.jail === 0) warn('Řešení je vězení, ale vybrané přestupky nemají trest odnětí svobody.');
    if (r.scenario === 'traffic' && !r.vehicle.plate.trim()) warn('Traffic stop bez SPZ vozidla.');
    if (CALLSIGN_RE.test(text)) warn('V textu je nejspíš volací znak – do hlášení patří jméno a BN.');
    if (/\[DOPLŇ|\[NASTAV/.test(text)) err('V textu zůstalo [DOPLŇ …] – něco chybí.');
    return out;
  }

  // Když jsou přestupky s pokutou, řešení = pokuta na fakturu.
  // force = přepíše i „uhrazena“/„domluva“; jinak jen když řešení ještě není vybrané.
  function autoInvoice(r, force) {
    const t = C.sumOffenses(r.offenses);
    if (t.fine <= 0) return;
    if (t.jail > 0) {
      if (!r.resolution || (force && !['open'].includes(r.resolution))) r.resolution = 'jail';
      return;
    }
    if (!r.resolution || (force && ['paid', 'warning', 'released'].includes(r.resolution))) r.resolution = 'invoice';
  }

  // ---------- Vykreslení ----------
  const card = (step, ic, color, title, sub, body, extra = '') => `
    <section class="card ${extra}">
      <div class="card-head">
        <div class="ci ${color}">${icon(ic)}</div>
        <div class="grow"><div class="card-title">${title}</div>${sub ? `<div class="card-sub">${sub}</div>` : ''}</div>
        ${step ? `<span class="step">${step}</span>` : ''}
      </div>${body}
    </section>`;

  function render(root) {
    const r = S.report;
    // Sebe vždy přidat mezi zasahující, pokud ještě nikdo není
    if (S.settings.meName && !r.officers.length) r.officers.push(S.settings.meName);
    root.innerHTML = `<div class="page">
      <div class="page-head">
        <div class="ph-icon">${icon('file')}</div>
        <div class="ph-text"><div class="eyebrow">Generátor hlášení</div><h1 class="ph-title">Hlášení</h1>
          <div class="ph-sub">Vyplň pár údajů – popis i tahák do tabletu se napíšou samy.</div></div>
        <div class="ph-actions">
          <button class="btn" data-act="archive">${icon('archive')}Archiv · ${S.archive.length}</button>
          <button class="btn danger" data-act="new">${icon('refresh')}Nové hlášení</button>
        </div>
      </div>
      <div class="split">
        <div class="form-col">
          ${card('1', 'radio', 'red', 'Incident', 'Typ zákroku, jak jste se o něm dozvěděli a kde', `
            <div class="scen" id="scen"></div>
            <div class="grid mt14" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr) 110px">
              <div class="field"><label class="lbl">Jak jsme se dozvěděli</label>
                <select class="sel" data-bind="report.source">${SOURCES.map((s) => `<option value="${s.k}" ${r.source === s.k ? 'selected' : ''}>${s.label}</option>`).join('')}</select></div>
              <div class="field"><label class="lbl">Typ v tabletu</label>
                <select class="sel" data-bind="report.tabletType">${TABLET_TYPES.map((t) => `<option ${r.tabletType === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
              <div class="field"><label class="lbl">Datum</label><input class="inp" type="date" data-bind="report.date" value="${esc(r.date)}" /></div>
              <div class="field"><label class="lbl">Čas</label><input class="inp" type="time" data-bind="report.time" value="${esc(r.time)}" /></div>
            </div>
            <div class="grid g2 mt12">
              <div class="field"><label class="lbl">Místo</label>
                <div class="inp-icon">${icon('map')}<input class="inp" data-bind="report.location" value="${esc(r.location)}" placeholder="např. Legion Square, Grove Street…" /></div></div>
              <div class="field"><label class="lbl">Upřesnění zdroje <span class="opt">nepovinné</span></label>
                <input class="inp" data-bind="report.sourceNote" value="${esc(r.sourceNote)}" placeholder="např. dispatch hlásil podezřelou osobu u ATM" /></div>
            </div>`, 'accent')}

          ${card('2', 'shield', 'blue', 'Zapojení policisté', 'Propíšou se do popisu (jméno + BN) i do taháku pro tablet', `
            <div class="chips" id="offc"></div>
            <div class="mt12" id="offcPick"></div>`)}

          ${card('3', 'users', 'amber', 'Osoby', 'Podezřelí, poškození a svědci – vždy s datem narození', `
            <div id="persons"></div>
            <div class="row mt12">
              <button class="btn" data-act="addPerson">${icon('plus')}Přidat osobu</button>
              <div class="grow" id="personPick" style="max-width:340px"></div>
            </div>
            <div class="divider"></div>
            <label class="lbl">Vozidlo <span class="opt">nepovinné</span></label>
            <div class="grid g3">
              <input class="inp" data-bind="report.vehicle.plate" value="${esc(r.vehicle.plate)}" placeholder="SPZ" />
              <input class="inp" data-bind="report.vehicle.model" value="${esc(r.vehicle.model)}" placeholder="Model (např. Sultan RS)" />
              <input class="inp" data-bind="report.vehicle.color" value="${esc(r.vehicle.color)}" placeholder="Barva" />
            </div>`)}

          ${card('4', 'note', 'teal', 'Průběh', 'Co se stalo a co jste na místě našli', `
            <textarea class="txt" style="min-height:120px" data-bind="report.narrative" placeholder="např.: Řidič vozidla překročil nejvyšší povolenou rychlost o 15 mph a dvakrát projel křižovatku na červenou. Po zastavení spolupracoval, předložil doklady…">${esc(r.narrative)}</textarea>
            <label class="lbl mt12">Postup vyšetřování <span class="opt">nepovinné</span></label>
            <textarea class="txt" style="min-height:70px" data-bind="report.investigation" placeholder="např.: Otisky z místa činu byly porovnány s databází…">${esc(r.investigation)}</textarea>`)}

          ${card('5', 'check', 'green', 'Provedené úkony', 'Klikni na vše, co LSPD na místě provedlo', `
            <div class="chips" id="acts"></div>
            <input class="inp mt12" data-bind="report.actionsExtra" value="${esc(r.actionsExtra)}" placeholder="Další úkony vlastními slovy (nepovinné)" />`)}

          ${card('6', 'gavel', 'red', 'Přestupky', 'Hledej podle názvu, paragrafu nebo OFF-ID', `
            <div id="offPick"></div>
            <div class="mt12" id="offList"></div>
            <div class="totals" id="offTotals"></div>`)}

          ${card('7', 'flame', 'blue', 'Řešení', 'Jak incident skončil', `
            <div class="chips" id="resol"></div>
            <input class="inp mt12" data-bind="report.resolutionNote" value="${esc(r.resolutionNote)}" placeholder="Doplnění řešení (nepovinné) – např. vozidlo odtaženo na odtahovku" />`)}
        </div>
        <div class="out-col" id="outCol"></div>
      </div>
    </div>`;

    C.bindInputs(root, (path, val, el) => {
      if (path === 'report.source' || path === 'report.tabletType') {}
      if (/^report\.persons\.\d+\.dob$/.test(path)) {} // normalizace až při blur
      S.report.manualText = S.report.manualText; // ruční text zůstává
      updateOutput();
    });
    root.addEventListener('focusout', (e) => {
      const el = e.target;
      if (el.dataset && /^report\.persons\.\d+\.dob$/.test(el.dataset.bind || '')) {
        const v = C.normDob(el.value);
        if (v !== el.value) {
          el.value = v;
          C.setPath(el.dataset.bind, v);
          C.save();
          updateOutput();
        }
      }
    });
    root.addEventListener('click', onClick);
    renderScen();
    renderOfficers();
    renderPersons();
    renderActs();
    renderOffenses();
    renderResol();
    setupPickers();
    updateOutput();
  }

  function onClick(e) {
    const a = e.target.closest('[data-act]');
    if (!a) return;
    const r = S.report;
    const act = a.dataset.act;
    if (act === 'new') {
      C.confirmBox('Nové hlášení', 'Vymazat rozepsané hlášení a začít znovu? (Uložená hlášení v archivu zůstanou.)', 'Vymazat', () => {
        S.report = newReport();
        C.save();
        M.render();
      });
    } else if (act === 'archive') openArchive();
    else if (act === 'scen') {
      const sc = scen(a.dataset.k);
      r.scenario = sc.k;
      r.tabletType = sc.tablet;
      r.source = sc.source;
      sc.actions.forEach((x) => !r.actions.includes(x) && r.actions.push(x));
      C.save();
      renderScen();
      renderActs();
      const ss = $('[data-bind="report.source"]');
      if (ss) ss.value = r.source;
      const tt = $('[data-bind="report.tabletType"]');
      if (tt) tt.value = r.tabletType;
      updateOutput();
    } else if (act === 'rmOfficer') {
      r.officers = r.officers.filter((n) => n !== a.dataset.n);
      C.save();
      renderOfficers();
      updateOutput();
    } else if (act === 'addPerson') {
      r.persons.push({ name: '', dob: '', role: r.persons.some((p) => p.role === 'suspect') ? 'civilian' : 'suspect', note: '' });
      C.save();
      renderPersons();
      const rows = $$('#persons .person-row');
      rows.length && $('input', rows[rows.length - 1]).focus();
    } else if (act === 'rmPerson') {
      r.persons.splice(+a.dataset.i, 1);
      C.save();
      renderPersons();
      updateOutput();
    } else if (act === 'act') {
      const k = a.dataset.k;
      r.actions = r.actions.includes(k) ? r.actions.filter((x) => x !== k) : r.actions.concat(k);
      C.save();
      renderActs();
      updateOutput();
    } else if (act === 'rmOff') {
      r.offenses = r.offenses.filter((x) => x !== a.dataset.id);
      C.save();
      renderOffenses();
      updateOutput();
    } else if (act === 'res') {
      r.resolution = r.resolution === a.dataset.k ? '' : a.dataset.k;
      C.save();
      renderResol();
      updateOutput();
    } else if (act === 'goSettings') M.go('settings');
  }

  function renderScen() {
    const r = S.report;
    $('#scen').innerHTML = SCENARIOS.map(
      (s) => `<button class="scen-btn ${r.scenario === s.k ? 'on' : ''}" data-act="scen" data-k="${s.k}">
        ${icon(s.icon)}<span class="sb-t">${s.label}</span><span class="sb-c">${s.code || '&nbsp;'}</span></button>`
    ).join('');
  }

  function renderOfficers() {
    const r = S.report;
    const el = $('#offc');
    el.innerHTML = r.officers.length
      ? r.officers
          .map((n) => {
            const o = C.officerByName(n);
            const isMe = n === S.settings.meName;
            return `<span class="pill-tag ${isMe ? 'me' : ''} ${!o || !o.bn ? 'warn' : ''}"><span><div class="pt-main">${esc(n)}${isMe ? ' <span class="badge blue" style="height:17px;margin-left:4px">já</span>' : ''}</div><div class="pt-sub">BN ${esc((o && o.bn) || '?')}${o && o.callsign ? ' · ' + esc(o.callsign) : ''}</div></span>
              <button class="icon-btn" data-act="rmOfficer" data-n="${esc(n)}">${icon('x')}</button></span>`;
          })
          .join('')
      : `<div class="empty-line">Zatím nikdo – vyber policisty níže.</div>`;
  }

  function renderPersons() {
    const r = S.report;
    const el = $('#persons');
    el.innerHTML = r.persons.length
      ? r.persons
          .map(
            (p, i) => `<div class="person-row">
            <select class="sel" data-bind="report.persons.${i}.role">${Object.entries(ROLES).map(([k, v]) => `<option value="${k}" ${p.role === k ? 'selected' : ''}>${v[0].toUpperCase() + v.slice(1)}</option>`).join('')}</select>
            <input class="inp" data-bind="report.persons.${i}.name" value="${esc(p.name)}" placeholder="Jméno a příjmení" />
            <input class="inp" data-bind="report.persons.${i}.dob" value="${esc(p.dob)}" placeholder="Datum nar. (13.5.2000)" />
            <input class="inp" data-bind="report.persons.${i}.note" value="${esc(p.note)}" placeholder="Poznámka (řidič, majitel…)" />
            <button class="icon-btn danger" data-act="rmPerson" data-i="${i}">${icon('trash')}</button></div>`
          )
          .join('')
      : `<div class="empty-line">Zatím žádné osoby.</div>`;
  }

  function renderActs() {
    const r = S.report;
    $('#acts').innerHTML = ACTIONS.map(
      ([k, l]) => `<button class="chip sq ${r.actions.includes(k) ? 'on green' : ''}" data-act="act" data-k="${k}"><span class="check">${icon('check')}</span>${l}</button>`
    ).join('');
  }

  function renderOffenses() {
    const r = S.report;
    $('#offList').innerHTML = r.offenses.length
      ? r.offenses
          .map((id) => {
            const o = C.offenseById(id);
            if (!o) return '';
            return `<div class="off-row"><div class="or-main"><div class="or-name">${esc(o.name)}</div><div class="or-sub">${esc(o.id)} · ${esc(o.cat)}</div></div>
              <div class="or-vals"><div class="money">${o.fineMax ? `${C.fmtMoney(o.fine)} – ${C.fmtMoney(o.fineMax)}` : C.fmtMoney(o.fine)}</div>${o.jail ? `<div class="months">${o.jail} měs.</div>` : ''}</div>
              <button class="icon-btn danger" data-act="rmOff" data-id="${esc(o.id)}">${icon('x')}</button></div>`;
          })
          .join('')
      : `<div class="empty-line">Žádné přestupky.</div>`;
    const t = C.sumOffenses(r.offenses);
    M.updateBadges && M.updateBadges();
    $('#offTotals').innerHTML = `
      <div class="total-box"><div class="tb-l">Celková pokuta</div><div class="tb-v money">${C.fmtFine(t)}</div></div>
      <div class="total-box"><div class="tb-l">Trest vězení</div><div class="tb-v months">${t.jail} měs.</div></div>
      <div class="total-box"><div class="tb-l">Počet</div><div class="tb-v">${r.offenses.length}</div></div>`;
  }

  function renderResol() {
    const r = S.report;
    $('#resol').innerHTML = RESOLUTIONS.map(
      (x) => `<button class="chip lg ${r.resolution === x.k ? 'on' : ''}" data-act="res" data-k="${x.k}">${icon(x.icon)}${x.label}</button>`
    ).join('');
  }

  function setupPickers() {
    const r = S.report;
    C.picker($('#offcPick'), {
      placeholder: 'Přidat policistu – jméno, BN nebo volací znak…',
      iconName: 'plus',
      items: (q) =>
        S.officers
          .filter((o) => !r.officers.includes(o.name) && C.matchAll(q, `${o.name} ${o.bn} ${o.callsign} ${o.rank}`))
          .map((o) => ({ key: o.name, main: esc(o.name), sub: `${o.rank ? esc(o.rank) + ' · ' : ''}${o.callsign ? esc(o.callsign) : ''}`, right: o.bn ? `BN ${esc(o.bn)}` : '<span class="dim">bez BN</span>' })),
      onPick: (name) => {
        r.officers.push(name);
        C.save();
        renderOfficers();
        updateOutput();
      },
    });
    C.picker($('#personPick'), {
      placeholder: 'Z evidence osob…',
      iconName: 'users',
      emptyText: 'V evidenci nic není (sekce Osoby)',
      items: (q) =>
        S.persons
          .filter((p) => C.matchAll(q, `${p.name} ${p.dob} ${p.phone || ''} ${p.fingerprint || ''} ${p.dna || ''}`))
          .map((p) => ({ key: p.id, main: esc(p.name), sub: esc(p.dob || 'bez data narození') })),
      onPick: (id) => {
        const p = S.persons.find((x) => x.id === id);
        if (!p) return;
        r.persons.push({ name: p.name, dob: p.dob || '', role: 'suspect', note: '' });
        C.save();
        renderPersons();
        updateOutput();
      },
    });
    C.picker($('#offPick'), {
      placeholder: 'Hledat přestupek – např. „rychlost“, „§ 55“, „OFF-6228“…',
      items: (q) =>
        C.allOffenses()
          .filter((o) => !r.offenses.includes(o.id) && (!q.trim() || C.matchAll(q, `${o.id} ${o.name} ${o.cat}`)))
          .map((o) => ({
            key: o.id,
            main: esc(o.name),
            sub: `${esc(o.id)} · ${esc(o.cat)}`,
            right: `<div class="money">${o.fineMax ? `${C.fmtMoney(o.fine)}+` : C.fmtMoney(o.fine)}</div>${o.jail ? `<div class="months">${o.jail} měs.</div>` : ''}`,
          })),
      onPick: (id) => {
        r.offenses.push(id);
        autoInvoice(r, false);
        C.save();
        renderOffenses();
        renderResol();
        updateOutput();
      },
    });
  }

  // ---------- Výstupní panel ----------
  function updateOutput() {
    const col = $('#outCol');
    if (!col) return;
    const r = S.report;
    const auto = generate(r);
    const text = r.manualText != null ? r.manualText : auto;
    const ch = checks(r, text);
    const errs = ch.filter((c) => c.lvl === 'err').length;
    const tab = M.mem.outTab;

    // Neruš uživatele při psaní do výstupu
    const ta = $('#outText');
    if (ta && document.activeElement === ta) return;

    col.innerHTML = `<section class="card out-card accent-blue">
      <div class="tabs">
        <button class="tab ${tab === 'text' ? 'on' : ''}" data-tab="text">${icon('file')}Popis hlášení${errs ? `<span class="n">${errs}</span>` : ''}</button>
        <button class="tab ${tab === 'tablet' ? 'on' : ''}" data-tab="tablet">${icon('tablet')}Do tabletu</button>
      </div>
      <div class="out-body">${tab === 'text' ? textTab(r, text, ch) : tabletTab(r)}</div>
    </section>`;

    $$('.tab', col).forEach((b) => (b.onclick = () => { M.mem.outTab = b.dataset.tab; updateOutput(); }));
    if (tab === 'text') {
      const t = $('#outText');
      t.addEventListener('input', () => {
        r.manualText = t.value;
        C.save();
        const flag = $('#manualFlag');
        if (flag) flag.style.display = '';
        $('#outMeta').textContent = `${t.value.length} znaků`;
      });
      $('#copyText').onclick = () => {
        C.copy($('#outText').value, 'Popis zkopírován – vlož ho do tabletu (Ctrl+V)');
      };
      $('#saveArch').onclick = () => saveToArchive($('#outText').value);
      $('#resetText').onclick = () => {
        r.manualText = null;
        C.save();
        updateOutput();
      };
    } else {
      $$('[data-copy]', col).forEach((b) => (b.onclick = () => C.copy(b.dataset.copy, `Zkopírováno: ${b.dataset.copy}`)));
      $$('[data-chk]', col).forEach(
        (b) =>
          (b.onclick = () => {
            r.checks[b.dataset.chk] = !r.checks[b.dataset.chk];
            C.save();
            updateOutput();
          })
      );
      const all = $('#copyAllIds');
      if (all) all.onclick = () => C.copy(r.offenses.join(', '), 'OFF-ID zkopírována');
    }
  }

  function textTab(r, text, ch) {
    const manual = r.manualText != null;
    return `
      <div class="manual-flag" id="manualFlag" style="${manual ? '' : 'display:none'}">${icon('note')}Text je upravený ručně – změny ve formuláři se už nepropisují.
        <button class="btn sm" id="resetText">${icon('refresh')}Obnovit</button></div>
      <textarea class="out-text" id="outText" spellcheck="false">${esc(text)}</textarea>
      <div class="out-bar">
        <span class="meta" id="outMeta">${text.length} znaků</span>
        <button class="btn" id="saveArch">${icon('save')}Uložit</button>
        <button class="btn red" id="copyText">${icon('copy')}Kopírovat popis</button>
      </div>
      <div class="checks">${
        ch.length
          ? ch.map((c) => `<div class="check-item ${c.lvl}">${icon(c.lvl === 'err' ? 'alert' : 'info')}<span>${esc(c.m)}</span></div>`).join('')
          : `<div class="check-item ok">${icon('check')}<span>Hlášení vypadá kompletně.</span></div>`
      }</div>`;
  }

  function tabletTab(r) {
    const copyBtn = (v) => `<button class="icon-btn" data-copy="${esc(v)}" title="Kopírovat">${icon('copy')}</button>`;
    const sec = (title, cnt, body) => `<div class="tt-sec"><div class="tt-head"><span class="lbl">${title}</span>${cnt != null ? `<span class="cnt">${cnt}</span>` : ''}</div>${body}</div>`;
    const sus = r.persons.filter((p) => p.role === 'suspect' && p.name.trim());
    const civ = r.persons.filter((p) => p.role !== 'suspect' && p.name.trim());
    const pRow = (p) => `<div class="tt-row"><div class="tr-main">${esc(p.name)} <span class="tr-sub">· ${esc(C.normDob(p.dob) || 'bez data nar.')} · ${ROLES[p.role]}</span></div>${copyBtn(p.name)}</div>`;
    const t = C.sumOffenses(r.offenses);
    const chk = (k, label) => `<div class="tt-check ${r.checks[k] ? 'on' : ''}" data-chk="${k}"><span class="box">${icon('check')}</span><span class="t">${label}</span></div>`;
    return `
      ${sec('Typ hlášení · klasifikace', null, `<div class="tt-row"><div class="tr-main">${esc(r.tabletType)} <span class="tr-sub">· SC-1 | Interní · ID se doplní samo</span></div>${copyBtn(r.tabletType)}</div>`)}
      ${sec('Zapojení policisté', r.officers.length, r.officers.length ? r.officers.map((n) => { const o = C.officerByName(n); return `<div class="tt-row"><div class="tr-main">${esc(n)} <span class="tr-sub">· BN ${esc((o && o.bn) || '?')}</span></div>${copyBtn(n)}</div>`; }).join('') : '<div class="tt-empty">Nikdo nevybrán</div>')}
      ${sec('Zapojení podezřelí', sus.length, sus.length ? sus.map(pRow).join('') : '<div class="tt-empty">Žádní</div>')}
      ${sec('Zapojení civilisté', civ.length, civ.length ? civ.map(pRow).join('') : '<div class="tt-empty">Žádní</div>')}
      ${sec(
        'Přestupky a trest',
        r.offenses.length,
        (r.offenses.length
          ? r.offenses
              .map((id) => {
                const o = C.offenseById(id);
                return o ? `<div class="tt-row"><span class="tr-id">${esc(o.id)}</span><div class="tr-main" style="font-weight:500">${esc(o.name)}</div>${copyBtn(o.id)}</div>` : '';
              })
              .join('') +
            `<div class="totals"><div class="total-box"><div class="tb-l">Pokuta</div><div class="tb-v money" style="font-size:16px">${C.fmtFine(t)}</div></div><div class="total-box"><div class="tb-l">Vězení</div><div class="tb-v months" style="font-size:16px">${t.jail} měs.</div></div><div class="total-box"><div class="tb-l">Trestaná osoba</div><div class="tb-v" style="font-size:13px;line-height:1.3;margin-top:5px">${esc(sus[0] ? sus[0].name : '—')}</div></div></div>
             <button class="btn sm mt8" id="copyAllIds">${icon('copy')}Kopírovat všechna OFF-ID</button>`
          : '<div class="tt-empty">Žádné přestupky</div>')
      )}
      ${sec('Kontrola před uložením', null, `
        ${chk('photos', 'Důkazy vyfoceny (ještě před sebráním) a přiloženy do Obrázků')}
        ${r.actions.includes('odtah') ? chk('tow', 'Odtah vozidla vyfocen') : ''}
        ${chk('shared', 'Sdíleno s BCSO, DoJ i SABI')}
        ${chk('tags', 'Štítky: stav (v procesu / vyřešeno) + heslovité shrnutí')}`)}`;
  }

  // ---------- Archiv ----------
  function saveToArchive(text) {
    const r = S.report;
    const sus = suspects(r)[0];
    S.archive.unshift({
      id: C.uid(),
      at: new Date().toISOString(),
      title: `${scen(r.scenario).label}${sus ? ' – ' + sus.name : ''}${r.location ? ' · ' + r.location : ''}`,
      text,
      report: C.clone(r),
    });
    S.archive = S.archive.slice(0, 100);
    C.save();
    C.toast('Hlášení uloženo do archivu');
    const b = $('[data-act="archive"]');
    if (b) b.innerHTML = `${icon('archive')}Archiv · ${S.archive.length}`;
  }

  function openArchive() {
    const list = () =>
      S.archive.length
        ? S.archive
            .map((a) => {
              const d = new Date(a.at);
              return `<div class="tt-row" style="align-items:flex-start"><div class="tr-main">${esc(a.title)}<div class="tr-sub">${C.czDate(d)} ${C.hhmm(d)}</div></div>
              <button class="btn sm" data-c="${a.id}">${icon('copy')}Kopírovat</button>
              <button class="btn sm" data-l="${a.id}">${icon('upload')}Načíst</button>
              <button class="icon-btn danger" data-d="${a.id}">${icon('trash')}</button></div>`;
            })
            .join('')
        : `<div class="empty-state"><div class="es-icon">${icon('archive')}</div><div class="es-t">Archiv je prázdný</div><div class="small mt8">Hlášení uložíš tlačítkem „Uložit“ u popisu.</div></div>`;
    C.modal({
      title: 'Archiv hlášení',
      sub: 'Posledních 100 uložených hlášení',
      iconName: 'archive',
      wide: true,
      body: `<div id="archList" style="max-height:60vh;overflow-y:auto">${list()}</div>`,
      onMount: (m, close) => {
        m.addEventListener('click', (e) => {
          const b = e.target.closest('button');
          if (!b) return;
          const id = b.dataset.c || b.dataset.l || b.dataset.d;
          const a = S.archive.find((x) => x.id === id);
          if (!a) return;
          if (b.dataset.c) C.copy(a.text, 'Hlášení zkopírováno');
          if (b.dataset.l) {
            S.report = Object.assign(newReport(), C.clone(a.report));
            C.save();
            close();
            M.render();
            C.toast('Hlášení načteno z archivu');
          }
          if (b.dataset.d) {
            S.archive = S.archive.filter((x) => x.id !== id);
            C.save();
            $('#archList', m).innerHTML = list();
          }
        });
      },
    });
  }

  M.pages.report = { title: 'Hlášení', render };
  M.report = { SCENARIOS, ROLES, updateOutput, autoInvoice };
})();
