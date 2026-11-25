// Plovoucí kalkulačka trestu – rychlý součet pokut a měsíců bez psaní hlášení
(function () {
  const M = window.MDT;
  const C = M.core;
  const S = M.S;
  const { icon, esc, $, $$ } = C;

  let ids = []; // vybrané přestupky (pořadí podle přidání)
  let pick;

  function renderList() {
    const list = $('#cList');
    const offs = ids.map(C.offenseById).filter(Boolean);
    list.innerHTML = offs.length
      ? offs
          .map(
            (o) => `<div class="calc-row">
              <button class="calc-id" data-copy="${esc(o.id)}" title="Zkopírovat ID">${esc(o.id)}</button>
              <div class="calc-rmain"><div class="calc-rname">${esc(o.name)}</div>
                <div class="calc-rvals"><span class="money">${o.fineMax ? `${C.fmtMoney(o.fine)} – ${C.fmtMoney(o.fineMax)}` : C.fmtMoney(o.fine)}</span>${o.jail ? ` · <span class="months">${o.jail} měs.</span>` : ''}</div></div>
              <button class="icon-btn danger" data-rm="${esc(o.id)}" title="Odebrat">${icon('x')}</button>
            </div>`
          )
          .join('')
      : `<div class="calc-empty">${icon('gavel')}<div>Začni psát název přestupku,<br/>paragraf nebo OFF-ID.</div><div class="dim">Šipky + Enter = přidat · Esc = schovat</div></div>`;
    $$('[data-rm]', list).forEach((b) => (b.onclick = () => { ids = ids.filter((x) => x !== b.dataset.rm); render(); pick.input.focus(); }));
    $$('[data-copy]', list).forEach((b) => (b.onclick = () => C.copy(b.dataset.copy, `${b.dataset.copy} zkopírováno`)));
  }

  function renderTotals() {
    const t = C.sumOffenses(ids);
    $('#cTotals').innerHTML = `
      <div class="total-box"><div class="tb-l">Pokuta${t.fine > 0 ? ' · faktura' : ''}</div><div class="tb-v money">${C.fmtFine(t)}</div></div>
      <div class="total-box"><div class="tb-l">Vězení</div><div class="tb-v months">${t.jail} měs.</div></div>`;
    const n = ids.length;
    $('#cCopy').innerHTML = `${icon('copy')}Kopírovat ID${n ? ` (${n})` : ''}`;
    $('#cReport').innerHTML = `${icon('file')}Do hlášení`;
    $('#cCopy').disabled = $('#cReport').disabled = $('#cClear').disabled = !n;
  }

  function render() {
    renderList();
    renderTotals();
    pick && pick.refresh();
  }

  async function init() {
    $$('[data-icon]').forEach((el) => (el.innerHTML = icon(el.dataset.icon)));
    await C.load(); // kvůli vlastním přestupkům uživatele

    pick = C.picker($('#cPick'), {
      placeholder: 'Hledat přestupek…',
      items: (q) =>
        C.allOffenses()
          .filter((o) => !ids.includes(o.id) && (!q.trim() || C.matchAll(q, `${o.id} ${o.name} ${o.cat}`)))
          .map((o) => ({
            key: o.id,
            main: esc(o.name),
            sub: `${esc(o.id)} · ${esc(o.cat)}`,
            right: `<div class="money">${o.fineMax ? `${C.fmtMoney(o.fine)}+` : C.fmtMoney(o.fine)}</div>${o.jail ? `<div class="months">${o.jail} měs.</div>` : ''}`,
          })),
      onPick: (id) => {
        ids.push(id);
        renderList();
        renderTotals();
      },
    });

    $('#cHide').onclick = () => window.api.calc.hide();
    $('#cClear').onclick = () => { ids = []; render(); pick.input.focus(); };
    $('#cCopy').onclick = () => C.copy(ids.join(', '), 'ID přestupků zkopírována');
    $('#cReport').onclick = () => {
      window.api.calc.toReport(ids.slice());
      C.toast('Přestupky poslány do hlášení');
    };
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      // Esc: nejdřív smaže hledání, pak schová okno
      if (pick.input.value) { pick.input.value = ''; pick.refresh(); }
      else window.api.calc.hide();
      e.preventDefault();
    });
    window.api.calc.onShown(async () => {
      await C.load(); // mohl přibýt vlastní přestupek
      render();
      pick.input.focus();
      pick.input.select();
    });

    render();
    pick.input.focus();
  }

  init();
})();
