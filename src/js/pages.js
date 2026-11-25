// Ostatní stránky: zákoník, zatykač, BOLO, osoby, poznámky, kódy, návody, sbor, nastavení
(function () {
  const M = window.MDT;
  const C = M.core;
  const S = M.S;
  const { icon, esc, $, $$ } = C;

  const head = (ic, eyebrow, title, sub, actions = '', blue = false) => `
    <div class="page-head">
      <div class="ph-icon ${blue ? 'blue' : ''}">${icon(ic)}</div>
      <div class="ph-text"><div class="eyebrow">${eyebrow}</div><h1 class="ph-title">${title}</h1>${sub ? `<div class="ph-sub">${sub}</div>` : ''}</div>
      ${actions ? `<div class="ph-actions">${actions}</div>` : ''}
    </div>`;
  const cardHead = (ic, color, title, sub, right = '') => `
    <div class="card-head"><div class="ci ${color}">${icon(ic)}</div>
    <div class="grow"><div class="card-title">${title}</div>${sub ? `<div class="card-sub">${sub}</div>` : ''}</div>${right}</div>`;
  const catBadge = (cat) => {
    const c = (M.CATEGORIES || {})[cat];
    return `<span class="badge ${c ? c.color : 'violet'}">${esc(cat)}</span>`;
  };
  const meSig = () => {
    const m = C.me();
    return m ? { name: m.name, short: C.shortName(m.name), bn: m.bn || '?' } : { name: '[TVOJE JMÉNO]', short: '[TVOJE JMÉNO]', bn: '?' };
  };
  const FLAGS = [
    ['armed', 'Může být ozbrojen'],
    ['flees', 'Má sklony k útěku'],
    ['aggressive', 'Agresivní / brání se zadržení'],
  ];
  const PRIOS = ['Nízká', 'Střední', 'Vysoká', 'Kritická'];

  // =====================================================================
  // ZÁKONÍK
  // =====================================================================
  function renderLaw(root) {
    const st = M.mem.law;
    root.innerHTML = `<div class="page">
      ${head('book', 'Trestní zákoník', 'Zákoník a pokuty', 'Hledej podle části názvu, paragrafu nebo OFF-ID. Kliknutím na + přidáš přestupek do hlášení.',
        `<button class="btn" id="lawCustom">${icon('plus')}Vlastní paragraf</button>`)}
      <div class="law-layout">
        <div>
          <div class="law-tools">
            <div class="inp-icon big">${icon('search')}<input class="inp big" id="lawQ" placeholder="např. rychlost, drogy, § 74, OFF-2198…" value="${esc(st.q)}" /></div>
          </div>
          <div class="row wrap" style="margin-bottom:14px" id="lawCats"></div>
          <div class="law-head"><span>Kategorie</span><span>ID</span><span>Název</span><span class="r">Pokuta</span><span class="r">Vězení</span><span></span></div>
          <div class="law-list" id="lawList"></div>
        </div>
        <div class="cart"><section class="card accent-blue" id="cart"></section></div>
      </div>
    </div>`;
    const q = $('#lawQ');
    q.focus();
    q.addEventListener('input', () => { st.q = q.value; renderList(); });
    $('#lawCustom').onclick = customOffenseModal;
    renderCats();
    renderList();
    renderCart();

    function renderCats() {
      const cats = ['all', 'CAT-930', 'CAT-469', 'CAT-798'].concat(S.customOffenses.length ? ['custom'] : []);
      const lbl = { all: 'Vše', custom: 'Vlastní' };
      $('#lawCats').innerHTML =
        cats.map((c) => `<button class="chip ${st.cat === c ? 'on' : ''}" data-cat="${c}">${lbl[c] || c}${(M.CATEGORIES[c] || {}).hint ? ` <span class="code">${M.CATEGORIES[c].hint}</span>` : ''}</button>`).join('') +
        `<button class="chip ${st.jailOnly ? 'on red' : ''}" data-jail="1">${icon('gavel')}Jen s vězením</button><span class="law-count" id="lawCount"></span>`;
      $$('[data-cat]', root).forEach((b) => (b.onclick = () => { st.cat = b.dataset.cat; renderCats(); renderList(); }));
      $('[data-jail]', root).onclick = () => { st.jailOnly = !st.jailOnly; renderCats(); renderList(); };
    }

    function renderList() {
      const sel = S.report.offenses;
      const list = C.allOffenses().filter(
        (o) =>
          (st.cat === 'all' || (st.cat === 'custom' ? o.custom : o.cat === st.cat)) &&
          (!st.jailOnly || o.jail > 0) &&
          (!st.q.trim() || C.matchAll(st.q, `${o.id} ${o.name} ${o.cat} ${o.detail || ''}`))
      );
      $('#lawCount').textContent = `${list.length} položek`;
      $('#lawList').innerHTML = list.length
        ? list
            .map((o) => {
              const on = sel.includes(o.id);
              const open = st.open === o.id;
              return `<div class="law-row ${on ? 'sel' : ''}" data-row="${esc(o.id)}">
                <span>${catBadge(o.cat)}</span>
                <span class="lr-id">${esc(o.id)}</span>
                <span class="lr-name">${esc(o.name)}${o.custom ? ' <span class="badge violet">vlastní</span>' : ''}${o.detail ? ` <span class="badge" title="Plné znění">${icon('info')}znění</span>` : ''}</span>
                <span class="lr-fine money">${o.fineMax ? `${C.fmtMoney(o.fine)} – ${C.fmtMoney(o.fineMax)}` : o.fine ? C.fmtMoney(o.fine) : '<span class="lr-none">$0</span>'}</span>
                <span class="lr-jail">${o.jail ? `<span class="months">${o.jail} měs.</span>` : '<span class="lr-none">—</span>'}</span>
                <button class="add" data-add="${esc(o.id)}" title="${on ? 'Odebrat z hlášení' : 'Přidat do hlášení'}">${icon(on ? 'check' : 'plus')}</button>
                ${open ? `<div class="law-detail">${esc(o.detail || 'Plné znění paragrafu tu není – podívej se do poznámek v tabletu nebo do zákona.')}${o.extra ? `\n\nDalší hodnota z tabletu: ${esc(o.extra)}` : ''}${o.custom ? '' : ''}</div>` : ''}
              </div>`;
            })
            .join('')
        : `<div class="empty-state"><div class="es-icon">${icon('search')}</div><div class="es-t">Nic nenalezeno</div><div class="small mt8">Paragraf v tabletu chybí? Přidej ho přes „Vlastní paragraf“.</div></div>`;
      $$('[data-add]', root).forEach(
        (b) =>
          (b.onclick = (e) => {
            e.stopPropagation();
            const id = b.dataset.add;
            const r = S.report;
            r.offenses = r.offenses.includes(id) ? r.offenses.filter((x) => x !== id) : r.offenses.concat(id);
            M.report.autoInvoice(r, false);
            C.save();
            renderList();
            renderCart();
            M.updateBadges();
          })
      );
      $$('[data-row]', root).forEach(
        (row) =>
          (row.onclick = (e) => {
            if (e.target.closest('.law-detail')) return;
            st.open = st.open === row.dataset.row ? null : row.dataset.row;
            renderList();
          })
      );
    }

    function renderCart() {
      const ids = S.report.offenses;
      const t = C.sumOffenses(ids);
      $('#cart').innerHTML = `${cardHead('gavel', 'blue', 'Vybrané přestupky', 'Propisují se rovnou do hlášení')}
        ${ids.length
          ? ids
              .map((id) => {
                const o = C.offenseById(id);
                return o ? `<div class="cart-item"><div class="ci-main">${esc(o.name)}<div class="ci-sub">${esc(o.id)} · <span class="money">${C.fmtMoney(o.fine)}</span>${o.jail ? ` · <span class="months">${o.jail} měs.</span>` : ''}</div></div><button class="icon-btn danger" data-rm="${esc(o.id)}">${icon('x')}</button></div>` : '';
              })
              .join('')
          : '<div class="empty-line">Zatím nic. Klikni na + u přestupku.</div>'}
        <div class="totals" style="grid-template-columns:1fr 1fr"><div class="total-box"><div class="tb-l">Pokuta</div><div class="tb-v money">${C.fmtFine(t)}</div></div><div class="total-box"><div class="tb-l">Vězení</div><div class="tb-v months">${t.jail} měs.</div></div></div>
        <div class="grid g2 mt12">
          <button class="btn" id="cartCopy" ${ids.length ? '' : 'disabled'}>${icon('copy')}OFF-ID</button>
          <button class="btn danger" id="cartClear" ${ids.length ? '' : 'disabled'}>${icon('trash')}Vyprázdnit</button>
        </div>
        <button class="btn blue wide mt8" id="cartGo">${icon('arrow')}Pokračovat v hlášení</button>`;
      $$('[data-rm]', root).forEach((b) => (b.onclick = () => { S.report.offenses = S.report.offenses.filter((x) => x !== b.dataset.rm); C.save(); renderList(); renderCart(); M.updateBadges(); }));
      $('#cartCopy').onclick = () => C.copy(ids.join(', '), 'OFF-ID zkopírována');
      $('#cartClear').onclick = () => { S.report.offenses = []; C.save(); renderList(); renderCart(); M.updateBadges(); };
      $('#cartGo').onclick = () => M.go('report');
    }

    function customOffenseModal() {
      C.modal({
        title: 'Vlastní paragraf',
        sub: 'Pro paragrafy, které v tabletu chybí (podle zákona)',
        iconName: 'plus',
        body: `<div class="grid g2">
          <div class="field span2"><label class="lbl">Název (jak se píše do hlášení)</label><input class="inp" id="cuName" placeholder="§ 00 odst. 1 TZ: Název přestupku" /></div>
          <div class="field"><label class="lbl">Kategorie</label><select class="sel" id="cuCat"><option>CAT-930</option><option>CAT-469</option><option>CAT-798</option><option value="Vlastní">Vlastní</option></select></div>
          <div class="field"><label class="lbl">ID <span class="opt">nepovinné</span></label><input class="inp" id="cuId" placeholder="např. OFF-0000" /></div>
          <div class="field"><label class="lbl">Pokuta ($)</label><input class="inp" id="cuFine" type="number" min="0" value="0" /></div>
          <div class="field"><label class="lbl">Vězení (měsíce)</label><input class="inp" id="cuJail" type="number" min="0" value="0" /></div>
          <div class="field span2"><label class="lbl">Plné znění / poznámka <span class="opt">nepovinné</span></label><textarea class="txt" id="cuDet"></textarea></div>
        </div>`,
        actions: [
          { label: 'Zrušit' },
          {
            label: 'Přidat',
            cls: 'blue',
            icon: 'plus',
            onClick: (m) => {
              const name = $('#cuName', m).value.trim();
              if (!name) { C.toast('Vyplň název.', 'err'); return false; }
              const id = $('#cuId', m).value.trim() || 'VL-' + C.uid().slice(-4).toUpperCase();
              if (C.offenseById(id)) { C.toast('Toto ID už existuje.', 'err'); return false; }
              S.customOffenses.push({ cat: $('#cuCat', m).value, id, name, fine: +$('#cuFine', m).value || 0, jail: +$('#cuJail', m).value || 0, fineMax: null, extra: null, detail: $('#cuDet', m).value.trim() || null, custom: true });
              C.save();
              renderCats();
              renderList();
              C.toast('Paragraf přidán');
            },
          },
        ],
      });
    }
  }

  // =====================================================================
  // ZATYKAČ
  // =====================================================================
  const newWarrant = () => ({ name: '', dob: '', reportId: '', crime: '', evidence: '', flags: [], priority: 'Střední', note: '' });
  if (!S.warrant) S.warrant = newWarrant();

  function warrantOut(w) {
    const sig = meSig();
    const rid = w.reportId.trim().toUpperCase();
    const title = [w.name.trim() || '[JMÉNO]', rid || '[ID HLÁŠENÍ]', w.crime.trim() || '[ČIN]'].join(' - ');
    const flags = FLAGS.filter(([k]) => w.flags.includes(k)).map(([, l]) => l.toLowerCase());
    const lines = [];
    lines.push(`${w.name.trim() || '[JMÉNO]'}${w.dob.trim() ? `, nar. ${C.normDob(w.dob)}` : ''} – ${w.crime.trim() || '[ČIN]'} (${rid || '[ID HLÁŠENÍ]'}).`);
    if (w.evidence.trim()) lines.push(`Důkaz: ${w.evidence.trim().replace(/\.$/, '')}.`);
    if (flags.length) lines.push(`POZOR: ${flags.join(', ')}.`);
    lines.push(`Při kontaktu osobu zadržet a převézt do CPZ, podrobnosti ve spisu ${rid || '[ID HLÁŠENÍ]'}.`);
    if (w.note.trim()) lines.push(w.note.trim());
    lines.push('');
    lines.push(`${S.settings.gender === 'f' ? 'Vydala' : 'Vydal'} ${sig.short}, BN: ${sig.bn}, ${C.czDate()} ${C.hhmm()}`);
    return { title, text: lines.join('\n') };
  }

  function renderWarrant(root) {
    const w = S.warrant;
    root.innerHTML = `<div class="page">
      ${head('gavel', 'Generátor', 'Zatykač', 'Zatykač jen na základě usvědčujících důkazů. Popis krátce a vždy s ID hlášení.', `<button class="btn danger" id="wNew">${icon('refresh')}Vymazat</button>`)}
      <div class="split">
        <div>
          <section class="card accent">${cardHead('user', 'red', 'Osoba a případ', '')}
            <div class="grid g2">
              <div class="field"><label class="lbl">Jméno a příjmení</label><input class="inp" data-bind="warrant.name" value="${esc(w.name)}" placeholder="Rocco Bellini" /></div>
              <div class="field"><label class="lbl">Datum narození</label><input class="inp" data-bind="warrant.dob" value="${esc(w.dob)}" placeholder="13.5.2000" /></div>
              <div class="field"><label class="lbl">ID hlášení</label><input class="inp mono" data-bind="warrant.reportId" value="${esc(w.reportId)}" placeholder="RPT-3345" /></div>
              <div class="field"><label class="lbl">Čin (krátce)</label><input class="inp" data-bind="warrant.crime" value="${esc(w.crime)}" placeholder="přepadení pumpy" /></div>
              <div class="field span2"><label class="lbl">Usvědčující důkaz</label><textarea class="txt" data-bind="warrant.evidence" placeholder="např. shoda otisků z místa přepadení benzinové pumpy">${esc(w.evidence)}</textarea></div>
            </div>
          </section>
          <section class="card">${cardHead('alert', 'amber', 'Upozornění a priorita', 'Ať hlídka ví, s čím počítat')}
            <div class="chips" id="wFlags"></div>
            <label class="lbl mt14">Priorita</label><div class="chips prio" id="wPrio"></div>
            <label class="lbl mt14">Doplňující pokyn <span class="opt">nepovinné</span></label>
            <input class="inp" data-bind="warrant.note" value="${esc(w.note)}" placeholder="např. Pokud bude ve službě E. Rossi, kontaktovat." />
          </section>
          <section class="card">${cardHead('info', 'blue', 'V tabletu nastav', '')}
            <ul class="bullets"><li>Typ: <b>Zatčení</b> · Klasifikace: <b>Restricted</b> · Stav: <b>Aktivní</b></li><li>Sdílení: <b>BCSO, DOJ, SABI</b></li><li>Propojená hlášení: <b>${esc(w.reportId || 'RPT-…')}</b> · Propojení občané: osoba · Přestupky z hlášení</li></ul>
          </section>
        </div>
        <div class="out-col"><section class="card accent-blue gen-out" id="wOut"></section></div>
      </div></div>`;
    C.bindInputs(root, () => out());
    $('#wNew').onclick = () => C.confirmBox('Vymazat zatykač', 'Vymazat vyplněné údaje?', 'Vymazat', () => { S.warrant = newWarrant(); C.save(); M.render(); });
    chipsFlags($('#wFlags'), w, out);
    chipsPrio($('#wPrio'), w, out);
    out();
    function out() {
      const o = warrantOut(w);
      const warn = [];
      if (!/RPT-\d+/i.test(w.reportId)) warn.push(['err', 'Chybí ID hlášení (RPT-…) – musí být v názvu i popisu.']);
      if (!w.evidence.trim()) warn.push(['err', 'Chybí usvědčující důkaz.']);
      if (!w.dob.trim()) warn.push(['warn', 'Chybí datum narození.']);
      if (o.text.length > 450) warn.push(['warn', 'Popis je dlouhý – hlídka musí na první pohled vědět, o co jde.']);
      genOut($('#wOut'), o, warn, `Priorita: ${w.priority}`);
    }
  }

  // =====================================================================
  // BOLO
  // =====================================================================
  const newBolo = () => ({ type: 'Osoba', name: '', dob: '', reason: '', reportId: '', lastSeen: '', description: '', vehicle: '', flags: ['flees'], contact: S.settings.meName || '', priority: 'Střední' });
  if (!S.bolo) S.bolo = newBolo();

  function boloOut(b) {
    const sig = meSig();
    const isVeh = b.type === 'Vozidlo';
    const dobCompact = (C.normDob(b.dob) || '').replace(/\s/g, '');
    const title = isVeh
      ? `${b.vehicle.trim() || '[VOZIDLO]'} - ${b.reason.trim() || '[DŮVOD]'}`
      : `${b.name.trim() || '[JMÉNO]'}${dobCompact ? ' ' + dobCompact : ''} - ${b.reason.trim() || '[DŮVOD]'}`;
    const flags = FLAGS.filter(([k]) => b.flags.includes(k)).map(([, l]) => l.toLowerCase());
    const L = [];
    if (isVeh) L.push(`Pátrání po vozidle ${b.vehicle.trim() || '[VOZIDLO]'} – ${b.reason.trim() || '[DŮVOD]'}${b.reportId.trim() ? ` (${b.reportId.trim().toUpperCase()})` : ''}.`);
    else L.push(`Pátrání po osobě ${b.name.trim() || '[JMÉNO]'}${b.dob.trim() ? `, nar. ${C.normDob(b.dob)}` : ''} – ${b.reason.trim() || '[DŮVOD]'}${b.reportId.trim() ? ` (${b.reportId.trim().toUpperCase()})` : ''}.`);
    if (b.lastSeen.trim()) L.push(`Poslední výskyt: ${b.lastSeen.trim().replace(/\.$/, '')}.`);
    if (b.description.trim()) L.push(`Popis: ${b.description.trim().replace(/\.$/, '')}.`);
    if (!isVeh && b.vehicle.trim()) L.push(`Vozidlo: ${b.vehicle.trim().replace(/\.$/, '')}.`);
    if (flags.length) L.push(`POZOR: ${flags.join(', ')}. Při kontaktu ihned 10-32.`);
    if (b.contact.trim()) {
      const c = C.officerByName(b.contact);
      L.push(`Pokud bude ve službě ${c ? C.shortName(c.name) : b.contact}, prosím kontaktovat.`);
    }
    L.push('');
    L.push(`${S.settings.gender === 'f' ? 'Vyhlásila' : 'Vyhlásil'} ${sig.short}, BN: ${sig.bn}, ${C.hhmm()}`);
    return { title, text: L.join('\n') };
  }

  function renderBolo(root) {
    const b = S.bolo;
    const isVeh = b.type === 'Vozidlo';
    root.innerHTML = `<div class="page">
      ${head('target', 'Generátor', 'Pátrání (BOLO)', 'Co nejpřesnější popis a stručně důvod – ať hlídka ví, s čím u suspecta počítat.', `<button class="btn danger" id="bNew">${icon('refresh')}Vymazat</button>`)}
      <div class="split">
        <div>
          <section class="card accent">${cardHead(isVeh ? 'car' : 'user', 'red', isVeh ? 'Hledané vozidlo' : 'Hledaná osoba', '', `<div class="chips"><button class="chip ${!isVeh ? 'on' : ''}" data-type="Osoba">${icon('user')}Osoba</button><button class="chip ${isVeh ? 'on' : ''}" data-type="Vozidlo">${icon('car')}Vozidlo</button></div>`)}
            <div class="grid g2">
              ${isVeh ? '' : `<div class="field"><label class="lbl">Jméno a příjmení</label><input class="inp" data-bind="bolo.name" value="${esc(b.name)}" placeholder="Joakim Eriksson" /></div>
              <div class="field"><label class="lbl">Datum narození</label><input class="inp" data-bind="bolo.dob" value="${esc(b.dob)}" placeholder="11.7.2002" /></div>`}
              <div class="field ${isVeh ? 'span2' : ''}"><label class="lbl">Důvod pátrání</label><input class="inp" data-bind="bolo.reason" value="${esc(b.reason)}" placeholder="Předvedení osoby k výslechu" /></div>
              <div class="field"><label class="lbl">ID případu <span class="opt">nepovinné</span></label><input class="inp mono" data-bind="bolo.reportId" value="${esc(b.reportId)}" placeholder="RPT-6489" /></div>
              <div class="field span2"><label class="lbl">Poslední výskyt</label><input class="inp" data-bind="bolo.lastSeen" value="${esc(b.lastSeen)}" placeholder="14. 9. 2026 ve 14:50–15:00 u Fleeca banky" /></div>
              <div class="field span2"><label class="lbl">Popis ${isVeh ? 'vozidla' : 'osoby'}</label><textarea class="txt" data-bind="bolo.description" placeholder="${isVeh ? 'barva, poškození, poznávací znaky…' : 'oblečení, tetování, výška, vlasy…'}">${esc(b.description)}</textarea></div>
              <div class="field span2"><label class="lbl">${isVeh ? 'Vozidlo (model + SPZ)' : 'Vozidlo'} <span class="opt">${isVeh ? '' : 'nepovinné'}</span></label><input class="inp" data-bind="bolo.vehicle" value="${esc(b.vehicle)}" placeholder="černý Sultan RS, SPZ 12ABC345" /></div>
            </div>
          </section>
          <section class="card">${cardHead('alert', 'amber', 'Upozornění, priorita a kontakt', '')}
            <div class="chips" id="bFlags"></div>
            <label class="lbl mt14">Priorita</label><div class="chips prio" id="bPrio"></div>
            <label class="lbl mt14">Koho kontaktovat</label>
            <select class="sel" data-bind="bolo.contact"><option value="">— nikoho —</option>${S.officers.map((o) => `<option ${b.contact === o.name ? 'selected' : ''}>${esc(o.name)}</option>`).join('')}</select>
          </section>
          <section class="card" style="border-color:rgba(226,59,76,.3)">${cardHead('radio', 'red', 'Narazil jsem na osobu z BOLO', 'Postup podle CoP. Rossi')}
            <ol class="steps"><li>Okamžitě požádat o asistenci kódem <b>10-32</b> – ať neví, že voláš posily.</li><li>Pokud kód zná a reaguje – výmluva, že jsou zavedené jiné kódy.</li><li>Nedat nic najevo, počkat na posily. Počítej s útěkem nebo odporem.</li><li>Zadržet → převézt do CPZ → teprve pak číst spis.</li></ol>
          </section>
        </div>
        <div class="out-col"><section class="card accent-blue gen-out" id="bOut"></section></div>
      </div></div>`;
    C.bindInputs(root, () => out());
    $('#bNew').onclick = () => C.confirmBox('Vymazat pátrání', 'Vymazat vyplněné údaje?', 'Vymazat', () => { S.bolo = newBolo(); C.save(); M.render(); });
    $$('[data-type]', root).forEach((x) => (x.onclick = () => { b.type = x.dataset.type; C.save(); M.render(); }));
    chipsFlags($('#bFlags'), b, out);
    chipsPrio($('#bPrio'), b, out);
    out();
    function out() {
      const o = boloOut(b);
      const warn = [];
      if (!isVeh && !b.dob.trim()) warn.push(['warn', 'Chybí datum narození.']);
      if (!b.reason.trim()) warn.push(['err', 'Chybí důvod pátrání.']);
      if (!b.description.trim()) warn.push(['warn', 'Chybí popis – ideálně přidej i fotografii v tabletu.']);
      genOut($('#bOut'), o, warn, `Typ: ${b.type} · Klasifikace: Restricted · Priorita: ${b.priority}`);
    }
  }

  function chipsFlags(el, obj, cb) {
    const r = () => {
      el.innerHTML = FLAGS.map(([k, l]) => `<button class="chip ${obj.flags.includes(k) ? 'on amber' : ''}" data-f="${k}">${icon('alert')}${l}</button>`).join('');
      $$('[data-f]', el).forEach((b) => (b.onclick = () => { const k = b.dataset.f; obj.flags = obj.flags.includes(k) ? obj.flags.filter((x) => x !== k) : obj.flags.concat(k); C.save(); r(); cb(); }));
    };
    r();
  }
  function chipsPrio(el, obj, cb) {
    const r = () => {
      el.innerHTML = PRIOS.map((p) => `<button class="chip ${obj.priority === p ? 'on' : ''}" data-v="${p}">${p}</button>`).join('');
      $$('[data-v]', el).forEach((b) => (b.onclick = () => { obj.priority = b.dataset.v; C.save(); r(); cb(); }));
    };
    r();
  }
  function genOut(el, o, warn, meta) {
    el.innerHTML = `${cardHead('copy', 'blue', 'Hotovo ke zkopírování', meta)}
      <label class="lbl">Název</label>
      <div class="out-line"><div class="val">${esc(o.title)}</div><button class="btn" data-c="t">${icon('copy')}</button></div>
      <label class="lbl">Popis</label>
      <textarea class="out-text" style="min-height:220px" readonly>${esc(o.text)}</textarea>
      <div class="out-bar"><span class="meta">${o.text.length} znaků</span><button class="btn red" data-c="d">${icon('copy')}Kopírovat popis</button></div>
      <div class="checks">${warn.length ? warn.map(([l, m]) => `<div class="check-item ${l}">${icon(l === 'err' ? 'alert' : 'info')}<span>${esc(m)}</span></div>`).join('') : `<div class="check-item ok">${icon('check')}<span>Vše vyplněno.</span></div>`}</div>`;
    $('[data-c="t"]', el).onclick = () => C.copy(o.title, 'Název zkopírován');
    $('[data-c="d"]', el).onclick = () => C.copy(o.text, 'Popis zkopírován');
  }

  // =====================================================================
  // OSOBY (evidence)
  // =====================================================================
  const FP_RE = /^[0-9A-F]{16}$/i;
  const DNA_RE = /^[ACGT]{16}$/i;
  function renderPersons(root) {
    root.innerHTML = `<div class="page">
      ${head('users', 'Evidence', 'Osoby', 'Vlastní záznamy o lidech – rychle je přepíšeš do tabletu nebo vložíš do hlášení.', `<button class="btn blue" id="pNew">${icon('plus')}Nová osoba</button>`, true)}
      <div class="two-pane">
        <section class="card">
          <div class="inp-icon">${icon('search')}<input class="inp" id="pQ" placeholder="Jméno, otisk, DNA, telefon…" /></div>
          <div class="p-list" id="pList"></div>
        </section>
        <div id="pDetail"></div>
      </div></div>`;
    const q = $('#pQ');
    q.addEventListener('input', list);
    $('#pNew').onclick = () => {
      const p = { id: C.uid(), name: '', dob: '', gender: '', job: '', phone: '', fingerprint: '', dna: '', tags: [], notes: '', photo: false, jobDone: false, bio: false, gov: false };
      S.persons.unshift(p);
      M.mem.personSel = p.id;
      C.save();
      list();
      detail();
      $('#pdName') && $('#pdName').focus();
    };
    list();
    detail();

    function list() {
      const items = S.persons.filter((p) => !q.value.trim() || C.matchAll(q.value, `${p.name} ${p.dob} ${p.phone} ${p.fingerprint} ${p.dna} ${p.job} ${(p.tags || []).join(' ')}`));
      $('#pList').innerHTML = items.length
        ? items
            .map((p) => `<div class="p-item ${M.mem.personSel === p.id ? 'on' : ''}" data-id="${p.id}"><div class="avatar">${C.initials(p.name)}</div><div class="pi-main"><div class="pi-name">${esc(p.name || 'Bez jména')}</div><div class="pi-sub">${esc(p.dob || 'bez data narození')}${p.job ? ' · ' + esc(p.job) : ''}</div></div></div>`)
            .join('')
        : `<div class="empty-state" style="padding:24px 10px"><div class="es-icon">${icon('users')}</div><div class="es-t">${S.persons.length ? 'Nic nenalezeno' : 'Evidence je prázdná'}</div></div>`;
      $$('[data-id]', $('#pList')).forEach((el) => (el.onclick = () => { M.mem.personSel = el.dataset.id; list(); detail(); }));
    }

    function detail() {
      const p = S.persons.find((x) => x.id === M.mem.personSel);
      const el = $('#pDetail');
      if (!p) {
        el.innerHTML = `<section class="card"><div class="empty-state"><div class="es-icon">${icon('user')}</div><div class="es-t">Vyber osobu nebo přidej novou</div><div class="small mt8">Tip: u každého, koho osobně lustruješ, pořiď fotku a zjisti zaměstnání.</div></div></section>`;
        return;
      }
      const i = S.persons.indexOf(p);
      const b = (k) => `persons.${i}.${k}`;
      el.innerHTML = `<section class="card accent-blue">
          <div class="profile-top">
            <div class="avatar lg">${C.initials(p.name)}</div>
            <div class="grow grid g2">
              <div class="field span2"><label class="lbl">Jméno a příjmení</label><input class="inp" id="pdName" data-bind="${b('name')}" value="${esc(p.name)}" /></div>
              <div class="field"><label class="lbl">Datum narození</label><input class="inp" data-bind="${b('dob')}" value="${esc(p.dob)}" placeholder="6. 10. 2001" /></div>
              <div class="field"><label class="lbl">Pohlaví</label><select class="sel" data-bind="${b('gender')}"><option value="">—</option><option ${p.gender === 'Muž' ? 'selected' : ''}>Muž</option><option ${p.gender === 'Žena' ? 'selected' : ''}>Žena</option></select></div>
              <div class="field"><label class="lbl">Zaměstnání</label><input class="inp" data-bind="${b('job')}" value="${esc(p.job)}" placeholder="zjistit a uložit" /></div>
              <div class="field"><label class="lbl">Telefon</label><input class="inp mono" data-bind="${b('phone')}" value="${esc(p.phone)}" /></div>
            </div>
          </div>
          <div class="divider"></div>
          <label class="lbl">Biometrické údaje</label>
          <div class="grid g2">
            <div class="field"><input class="inp mono" id="pdFp" data-bind="${b('fingerprint')}" value="${esc(p.fingerprint)}" placeholder="Otisk prstu – 16 znaků (0-9, A-F)" maxlength="16" /><div class="hint" id="pdFpH"></div></div>
            <div class="field"><input class="inp mono" id="pdDna" data-bind="${b('dna')}" value="${esc(p.dna)}" placeholder="DNA – 16 písmen (A, C, G, T)" maxlength="16" /><div class="hint" id="pdDnaH"></div></div>
          </div>
          <label class="lbl mt14">Poznámky pro kolegy</label>
          <textarea class="txt" data-bind="${b('notes')}" placeholder="opakovaná agrese, opilost, telefonní číslo…">${esc(p.notes)}</textarea>
          <label class="lbl mt14">Štítky</label>
          <div class="row wrap"><div class="chips" id="pdTags"></div><input class="inp" id="pdTag" style="max-width:220px;height:32px" placeholder="Nový štítek + Enter" /></div>
          <label class="lbl mt14">Checklist</label>
          <div class="chips" id="pdChk"></div>
          <div class="divider"></div>
          <div class="row wrap">
            <button class="btn" data-to="suspect">${icon('file')}Do hlášení jako podezřelý</button>
            <button class="btn" data-to="civilian">${icon('file')}Jako civilista</button>
            <button class="btn" id="pdBolo">${icon('target')}Vytvořit BOLO</button>
            <span class="grow"></span>
            <button class="btn danger" id="pdDel">${icon('trash')}Smazat</button>
          </div>
        </section>`;
      const validate = () => {
        const fp = $('#pdFp'), dna = $('#pdDna');
        const f = (inp, h, re, okT, badT) => {
          const v = inp.value.trim();
          inp.classList.toggle('ok', !!v && re.test(v));
          inp.classList.toggle('bad', !!v && !re.test(v));
          h.className = 'hint ' + (v ? (re.test(v) ? 'ok' : 'bad') : '');
          h.textContent = v ? (re.test(v) ? okT : badT(v)) : '';
        };
        f(fp, $('#pdFpH'), FP_RE, 'Formát otisku je v pořádku', (v) => `Otisk má mít 16 znaků 0–9 / A–F (teď ${v.length})`);
        f(dna, $('#pdDnaH'), DNA_RE, 'Formát DNA je v pořádku', (v) => (/[^ACGT]/i.test(v) ? 'DNA smí obsahovat jen A, C, G, T' : `DNA má mít 16 písmen (teď ${v.length})`));
      };
      validate();
      const tags = () => {
        $('#pdTags').innerHTML = (p.tags || []).map((t, j) => `<span class="chip on">${esc(t)}<button data-tj="${j}" style="display:grid">${icon('x')}</button></span>`).join('');
        $$('[data-tj]', el).forEach((x) => (x.onclick = () => { p.tags.splice(+x.dataset.tj, 1); C.save(); tags(); }));
      };
      tags();
      $('#pdTag').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) { p.tags = (p.tags || []).concat(e.target.value.trim()); e.target.value = ''; C.save(); tags(); }
      });
      const chk = () => {
        const items = [['photo', 'Fotka pořízena'], ['jobDone', 'Zaměstnání zjištěno'], ['gov', 'Státní složka'], ...(p.gov ? [['bio', 'Biometrie odebrána']] : [])];
        $('#pdChk').innerHTML = items.map(([k, l]) => `<button class="chip sq ${p[k] ? 'on green' : ''}" data-k="${k}"><span class="check">${icon('check')}</span>${l}</button>`).join('');
        $$('[data-k]', $('#pdChk')).forEach((x) => (x.onclick = () => { p[x.dataset.k] = !p[x.dataset.k]; C.save(); chk(); }));
      };
      chk();
      $$('[data-to]', el).forEach(
        (x) =>
          (x.onclick = () => {
            S.report.persons.push({ name: p.name, dob: p.dob || '', role: x.dataset.to, note: '' });
            C.save();
            C.toast(`${p.name || 'Osoba'} přidána do hlášení`, 'ok', { action: 'Otevřít', onAction: () => M.go('report') });
          })
      );
      $('#pdBolo').onclick = () => {
        S.bolo = Object.assign(newBolo(), { name: p.name, dob: p.dob, description: '' });
        C.save();
        M.go('bolo');
      };
      $('#pdDel').onclick = () =>
        C.confirmBox('Smazat osobu', `Opravdu smazat záznam „${p.name || 'bez jména'}“?`, 'Smazat', () => {
          S.persons = S.persons.filter((x) => x.id !== p.id);
          M.mem.personSel = null;
          C.save();
          list();
          detail();
        });
    }
    C.bindInputs(root, (path, v, el) => {
      if (/fingerprint|dna/.test(path)) {
        const up = el.value.toUpperCase();
        if (up !== el.value) { el.value = up; C.setPath(path, up); }
        const fp = $('#pdFp'); fp && fp.dispatchEvent(new Event('validate'));
      }
      if (/\.(name|dob|job|fingerprint|dna)$/.test(path)) {
        const p = S.persons.find((x) => x.id === M.mem.personSel);
        const item = $(`.p-item[data-id="${M.mem.personSel}"]`);
        if (item && p) item.innerHTML = `<div class="avatar">${C.initials(p.name)}</div><div class="pi-main"><div class="pi-name">${esc(p.name || 'Bez jména')}</div><div class="pi-sub">${esc(p.dob || 'bez data narození')}${p.job ? ' · ' + esc(p.job) : ''}</div></div>`;
        if (/fingerprint|dna/.test(path)) {
          const reFp = $('#pdFp'), reD = $('#pdDna');
          [[reFp, FP_RE, '#pdFpH', 'Formát otisku je v pořádku', (x) => `Otisk má mít 16 znaků 0–9 / A–F (teď ${x.length})`], [reD, DNA_RE, '#pdDnaH', 'Formát DNA je v pořádku', (x) => (/[^ACGT]/i.test(x) ? 'DNA smí obsahovat jen A, C, G, T' : `DNA má mít 16 písmen (teď ${x.length})`)]].forEach(([inp, re, h, okT, badT]) => {
            const x = inp.value.trim();
            inp.classList.toggle('ok', !!x && re.test(x));
            inp.classList.toggle('bad', !!x && !re.test(x));
            $(h).className = 'hint ' + (x ? (re.test(x) ? 'ok' : 'bad') : '');
            $(h).textContent = x ? (re.test(x) ? okT : badT(x)) : '';
          });
        }
      }
    });
    root.addEventListener('focusout', (e) => {
      const bnd = e.target.dataset && e.target.dataset.bind;
      if (bnd && /^persons\.\d+\.dob$/.test(bnd)) {
        const v = C.normDob(e.target.value);
        e.target.value = v;
        C.setPath(bnd, v);
        C.save();
      }
    });
  }

  // =====================================================================
  // POZNÁMKY ZE SLUŽBY
  // =====================================================================
  const QUICK = [
    ['10-8', 'Ve službě'], ['10-41', 'Zahájení patroly'], ['10-11', 'Traffic stop'], ['10-23', 'Dorazil na místo'],
    ['10-95', 'Suspect zadržen'], ['10-15', 'Převoz vězně na PD'], ['10-5', 'Přestávka'], ['10-42', 'Ukončení patroly'], ['10-7', 'Mimo službu'],
  ];
  function renderNotes(root) {
    root.innerHTML = `<div class="page">
      ${head('note', 'Služba', 'Poznámky ze služby', 'Log událostí s časem a rychlý zápisník – vše se ukládá samo.', `<button class="btn" id="nCopy">${icon('copy')}Kopírovat log</button><button class="btn danger" id="nClear">${icon('trash')}Vymazat log</button>`, true)}
      <div class="split" style="grid-template-columns:minmax(0,1.2fr) minmax(340px,.8fr)">
        <section class="card accent-blue">${cardHead('clock', 'blue', 'Log služby', 'Napiš událost a stiskni Enter – čas se doplní sám')}
          <div class="log-input"><input class="inp" id="nIn" placeholder="např. 10-11 Grove Street – James Carter, pokuta $5,500" /><button class="btn blue" id="nAdd">${icon('plus')}Přidat</button></div>
          <div class="quick">${QUICK.map(([c, l]) => `<button class="chip" data-q="${c} ${l}"><span class="code">${c}</span>${l}</button>`).join('')}</div>
          <div class="log" id="nLog"></div>
        </section>
        <div>
          <section class="card">${cardHead('note', 'teal', 'Zápisník', 'Rychlé poznámky – telefonní čísla, SPZ, jména…')}
            <textarea class="txt" style="min-height:360px" data-bind="notes.scratch" placeholder="Piš cokoliv…">${esc(S.notes.scratch)}</textarea>
          </section>
        </div>
      </div></div>`;
    C.bindInputs(root);
    const inp = $('#nIn');
    const add = (text) => {
      if (!text.trim()) return;
      S.notes.log.unshift({ t: new Date().toISOString(), text: text.trim() });
      C.save();
      inp.value = '';
      log();
    };
    $('#nAdd').onclick = () => add(inp.value);
    inp.addEventListener('keydown', (e) => e.key === 'Enter' && add(inp.value));
    $$('[data-q]', root).forEach((b) => (b.onclick = () => add(b.dataset.q)));
    $('#nCopy').onclick = () => C.copy(S.notes.log.slice().reverse().map((x) => `${C.hhmm(new Date(x.t))}  ${x.text}`).join('\n'), 'Log zkopírován');
    $('#nClear').onclick = () => C.confirmBox('Vymazat log', 'Smazat všechny záznamy v logu služby?', 'Vymazat', () => { S.notes.log = []; C.save(); log(); });
    log();
    function log() {
      let lastDay = '';
      $('#nLog').innerHTML = S.notes.log.length
        ? S.notes.log
            .map((x, i) => {
              const d = new Date(x.t);
              const day = C.czDate(d);
              const dh = day !== lastDay ? `<div class="log-day">${day}</div>` : '';
              lastDay = day;
              return `${dh}<div class="log-item"><span class="time">${C.hhmm(d)}</span><span class="lt">${esc(x.text)}</span><button class="icon-btn danger" data-del="${i}">${icon('x')}</button></div>`;
            })
            .join('')
        : `<div class="empty-state"><div class="es-icon">${icon('clock')}</div><div class="es-t">Log je prázdný</div><div class="small mt8">Zapni službu v levém panelu nebo přidej první záznam.</div></div>`;
      $$('[data-del]', root).forEach((b) => (b.onclick = () => { S.notes.log.splice(+b.dataset.del, 1); C.save(); log(); }));
    }
  }
  M.addLog = (text) => {
    S.notes.log.unshift({ t: new Date().toISOString(), text });
    C.save();
  };

  // =====================================================================
  // KÓDY
  // =====================================================================
  function renderCodes(root) {
    const all = M.CODES.flatMap((g) => g.items);
    const hot = M.HOT_CODES.map((k) => all.find((x) => x[0] === k)).filter(Boolean);
    root.innerHTML = `<div class="page">
      ${head('radio', 'Vysílačka', 'Kódy a pojmy', 'Klikni na kód a zkopíruje se.', '', true)}
      <div class="inp-icon big" style="margin-bottom:16px">${icon('search')}<input class="inp big" id="cQ" placeholder="Hledat kód nebo význam… (např. asistence, 10-32, nehoda)" value="${esc(M.mem.codesQ)}" /></div>
      <div class="hot" id="cHot">${hot.map(([c, d]) => `<div class="hot-item" data-c="${esc(c)}"><div class="hc">${esc(c)}</div><div class="hd">${esc(d)}</div></div>`).join('')}</div>
      <div class="code-cols" id="cCols"></div></div>`;
    const q = $('#cQ');
    q.focus();
    q.addEventListener('input', () => { M.mem.codesQ = q.value; cols(); });
    $$('[data-c]', $('#cHot')).forEach((b) => (b.onclick = () => C.copy(b.dataset.c, `Zkopírováno: ${b.dataset.c}`)));
    cols();
    function cols() {
      const qq = M.mem.codesQ;
      $('#cHot').style.display = qq.trim() ? 'none' : '';
      const hl = (s) => {
        if (!qq.trim()) return esc(s);
        let out = esc(s);
        C.norm(qq).split(/\s+/).filter(Boolean).forEach((t) => {
          const idx = C.norm(s).indexOf(t);
          if (idx >= 0) out = esc(s.slice(0, idx)) + '<mark>' + esc(s.slice(idx, idx + t.length)) + '</mark>' + esc(s.slice(idx + t.length));
        });
        return out;
      };
      $('#cCols').innerHTML = M.CODES.map((g) => {
        const items = g.items.filter(([c, d]) => !qq.trim() || C.matchAll(qq, `${c} ${d}`));
        return `<section class="card">${cardHead(g.key === 'ten' ? 'radio' : g.key === 'codes' ? 'signal' : 'book', g.key === 'ten' ? 'blue' : g.key === 'codes' ? 'red' : 'teal', g.title, `${items.length} položek`)}
          ${items.length ? items.map(([c, d]) => `<div class="code-item ${M.HOT_CODES.includes(c) ? 'hl' : ''}" data-c="${esc(c)}"><span class="cc">${hl(c)}</span><span class="cd">${hl(d)}</span></div>`).join('') : '<div class="empty-line">Nic</div>'}</section>`;
      }).join('');
      $$('[data-c]', $('#cCols')).forEach((b) => (b.onclick = () => C.copy(b.dataset.c, `Zkopírováno: ${b.dataset.c}`)));
    }
  }

  // =====================================================================
  // NÁVODY
  // =====================================================================
  function renderGuides(root) {
    const g = M.GUIDES.find((x) => x.id === M.mem.guide);
    if (!g) {
      root.innerHTML = `<div class="page">${head('compass', 'Postupy', 'Návody a pravidla', 'Jak pracovat s tabletem a co kam patří – podle CoP. Eliany Rossi.', '', true)}
        <div class="guide-grid">${M.GUIDES.map((x) => `<button class="guide-card" data-g="${x.id}"><div class="gi">${icon(x.icon)}</div><div class="gt">${esc(x.title)}</div><div class="gs">${esc(x.sub)}</div></button>`).join('')}</div></div>`;
      $$('[data-g]', root).forEach((b) => (b.onclick = () => { M.mem.guide = b.dataset.g; renderGuides(root); }));
      return;
    }
    const block = (b) => {
      if (b.t === 'p') return `<p>${esc(b.v)}</p>`;
      if (b.t === 'warn') return `<div class="warnbox">${icon('alert')}<span>${esc(b.v)}</span></div>`;
      if (b.t === 'list') return `<section class="card"><h4>${esc(b.title)}</h4><ul class="bullets">${b.v.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>`;
      if (b.t === 'steps') return `<section class="card"><h4>${esc(b.title)}</h4><ol class="steps">${b.v.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></section>`;
      return '';
    };
    root.innerHTML = `<div class="page">${head(g.icon, 'Návod', esc(g.title), esc(g.sub), `<button class="btn" id="gBack">${icon('back')}Všechny návody</button>`, true)}
      <div class="guide-body">${g.blocks.map(block).join('')}</div></div>`;
    $('#gBack').onclick = () => { M.mem.guide = null; renderGuides(root); };
  }

  // =====================================================================
  // SBOR
  // =====================================================================
  function renderRoster(root) {
    root.innerHTML = `<div class="page">
      ${head('shield', 'LSPD', 'Policejní sbor', 'Do hlášení se píše jméno + BN. Klikni na kolečko u svého jména – budeš podepsaný v hlášeních.',
        `<button class="btn" id="rReset">${icon('refresh')}Výchozí seznam</button><button class="btn blue" id="rAdd">${icon('plus')}Přidat policistu</button>`, true)}
      <section class="card">
        <div class="inp-icon" style="max-width:360px;margin-bottom:6px">${icon('search')}<input class="inp" id="rQ" placeholder="Hledat…" /></div>
        <table class="table"><thead><tr><th style="width:46px">Já</th><th>Jméno</th><th>Hodnost</th><th>Volací znak</th><th style="width:130px">BN</th><th style="width:44px"></th></tr></thead><tbody id="rBody"></tbody></table>
      </section></div>`;
    const q = $('#rQ');
    q.addEventListener('input', body);
    $('#rAdd').onclick = () => { S.officers.push({ name: '', rank: 'Police Officer I', callsign: '', bn: '' }); C.save(); q.value = ''; body(); const ins = $$('#rBody tr'); ins.length && $('input', ins[ins.length - 1]).focus(); };
    $('#rReset').onclick = () => C.confirmBox('Obnovit výchozí seznam', 'Přepsat seznam sboru výchozím seznamem? Tvoje úpravy se ztratí.', 'Obnovit', () => { S.officers = C.clone(M.DEFAULT_OFFICERS); C.save(); body(); M.updateMe(); });
    body();
    C.bindInputs(root, (path, v) => {
      const m = /^officers\.(\d+)\.name$/.exec(path);
      if (m) {
        // Přejmenování „já“
        const tr = $(`#rBody tr[data-i="${m[1]}"]`);
        if (tr && tr.classList.contains('me')) { S.settings.meName = v; }
      }
      M.updateMe();
    });
    function body() {
      const rows = S.officers.map((o, i) => ({ o, i })).filter(({ o }) => !q.value.trim() || C.matchAll(q.value, `${o.name} ${o.rank} ${o.callsign} ${o.bn}`));
      $('#rBody').innerHTML = rows
        .map(({ o, i }) => {
          const isMe = o.name && o.name === S.settings.meName;
          return `<tr data-i="${i}" class="${isMe ? 'me' : ''}">
            <td><span class="radio ${isMe ? 'on' : ''}" data-me="${i}" title="To jsem já"></span></td>
            <td><input class="inp" data-bind="officers.${i}.name" value="${esc(o.name)}" placeholder="Jméno" /></td>
            <td><input class="inp" data-bind="officers.${i}.rank" value="${esc(o.rank)}" placeholder="Hodnost" /></td>
            <td><input class="inp mono" data-bind="officers.${i}.callsign" value="${esc(o.callsign)}" placeholder="—" /></td>
            <td><input class="inp mono ${o.bn ? '' : 'bad'}" data-bind="officers.${i}.bn" value="${esc(o.bn)}" placeholder="chybí" /></td>
            <td><button class="icon-btn danger" data-del="${i}">${icon('trash')}</button></td></tr>`;
        })
        .join('');
      $$('[data-me]', root).forEach((b) => (b.onclick = () => { S.settings.meName = S.officers[+b.dataset.me].name; C.save(); body(); M.updateMe(); C.toast(`Přihlášen jako ${S.settings.meName}`); }));
      $$('[data-del]', root).forEach((b) => (b.onclick = () => { const o = S.officers[+b.dataset.del]; C.confirmBox('Odebrat policistu', `Odebrat ${o.name || 'záznam'} ze sboru?`, 'Odebrat', () => { S.officers.splice(+b.dataset.del, 1); C.save(); body(); M.updateMe(); }); }));
    }
  }

  // =====================================================================
  // NASTAVENÍ
  // =====================================================================
  function renderSettings(root) {
    const st = S.settings;
    root.innerHTML = `<div class="page">
      ${head('settings', 'Aplikace', 'Nastavení', '', '', true)}
      <div class="set-grid">
        <div>
          <section class="card accent">${cardHead('user', 'red', 'Profil', 'Kdo jsi – podle toho se podepisují hlášení')}
            <div class="grid g2">
              <div class="field"><label class="lbl">Já jsem</label><select class="sel" data-bind="settings.meName"><option value="">— vyber se —</option>${S.officers.filter((o) => o.name).map((o) => `<option ${st.meName === o.name ? 'selected' : ''}>${esc(o.name)}</option>`).join('')}</select></div>
              <div class="field"><label class="lbl">Podpis</label><select class="sel" data-bind="settings.gender"><option value="m" ${st.gender === 'm' ? 'selected' : ''}>Sepsal / Vydal</option><option value="f" ${st.gender === 'f' ? 'selected' : ''}>Sepsala / Vydala</option></select></div>
              <div class="field span2"><label class="lbl">Věznice</label><input class="inp" data-bind="settings.prison" value="${esc(st.prison)}" /></div>
            </div>
          </section>
          <section class="card">${cardHead('file', 'blue', 'Hlášení', '')}
            <div class="switch-row"><div class="sr-t"><div class="sr-1">Psát i hodnost policistů</div><div class="sr-2">„Police Officer I Frank Willan (BN 11973)“ místo „Frank Willan (BN 11973)“</div></div><button class="switch ${st.showRank ? 'on' : ''}" data-sw="showRank"></button></div>
            <div class="switch-row"><div class="sr-t"><div class="sr-1">Okno vždy navrchu</div><div class="sr-2">Aplikace zůstane nad hrou (hra musí běžet v okně / bez okrajů)</div></div><button class="switch ${st.pinned ? 'on' : ''}" data-sw="pinned"></button></div>
          </section>
          <section class="card">${cardHead('folder', 'teal', 'Data', 'Všechno se ukládá jen u tebe v počítači')}
            <div class="code-block"><span id="dataPath">…</span><button class="btn sm" id="openData">${icon('folder')}Otevřít</button></div>
            <div class="row mt12"><div class="grow small muted" id="appVer">Verze …</div><button class="btn sm" id="updCheck" style="display:none">${icon('refresh')}Zkontrolovat aktualizace</button></div>
          </section>
        </div>
      </div></div>`;
    C.bindInputs(root, (path) => {
      if (path === 'settings.meName') M.updateMe();
    });
    window.api.store.path().then((p) => ($('#dataPath').textContent = p));
    $('#openData').onclick = () => window.api.store.reveal();
    window.api.update.version().then((v) => { if ($('#appVer')) $('#appVer').textContent = `Verze aplikace ${v}`; });
    window.api.update.check().then((u) => {
      const b = $('#updCheck');
      if (!b || !u.enabled) return;
      b.style.display = '';
      b.onclick = async () => {
        b.disabled = true;
        await M.checkUpdate(true);
        b.disabled = false;
      };
    });
    $$('[data-cp]', root).forEach((b) => (b.onclick = () => C.copy(b.dataset.cp)));
    $$('[data-sw]', root).forEach(
      (b) =>
        (b.onclick = async () => {
          const k = b.dataset.sw;
          st[k] = !st[k];
          b.classList.toggle('on', st[k]);
          C.save();
          if (k === 'pinned') M.applyPin();
          if (k === 'showRank' && S.report) S.report.manualText = S.report.manualText;
        })
    );
  }

  Object.assign(M.pages, {
    law: { title: 'Zákoník', render: renderLaw },
    warrant: { title: 'Zatykač', render: renderWarrant },
    bolo: { title: 'Pátrání', render: renderBolo },
    persons: { title: 'Osoby', render: renderPersons },
    notes: { title: 'Poznámky', render: renderNotes },
    codes: { title: 'Kódy', render: renderCodes },
    guides: { title: 'Návody', render: renderGuides },
    roster: { title: 'Sbor', render: renderRoster },
    settings: { title: 'Nastavení', render: renderSettings },
  });
})();
