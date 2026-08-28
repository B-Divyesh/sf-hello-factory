import './style.css';
import { formatProductSummary, products } from './products';

const clock = document.querySelector<HTMLTimeElement>('#factory-clock');
const buildTime = document.querySelector<HTMLTimeElement>('#build-time');
const summary = document.querySelector<HTMLElement>('#product-summary');
const utcClock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'UTC' });
const buildFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short' });

function updateClock(): void {
  if (!clock) return;
  const now = new Date();
  clock.dateTime = now.toISOString();
  clock.textContent = utcClock.format(now);
}

if (buildTime) {
  const builtAt = new Date(__BUILD_TIMESTAMP__);
  buildTime.dateTime = builtAt.toISOString();
  buildTime.textContent = buildFormatter.format(builtAt);
}
if (summary) summary.textContent = formatProductSummary(products);
void renderLedger();
updateClock();
window.setInterval(updateClock, 1000);


/* ---- Landing: the showcase drum and the full picture ledger (data from /products.json + curation + shots) ---- */
import { loadCatalog, card, byInterest, esc, KINDS, type Entry } from './ledger';
import { mountDrum } from './showcase';
import { mountGuide } from './recommend';
async function renderLedger(): Promise<void> {
  const cat = await loadCatalog(); if (!cat) return;
  const all = cat.products;
  if (summary) summary.textContent = `${all.length} tools live on their own addresses.`;
  // showcase: the editor's featured picks with a picture, else the most interesting product-like tools with a picture
  const drumRoot = document.querySelector<HTMLElement>('#drum');
  if (drumRoot) {
    let picks = all.filter((e) => e.featured && e.image).sort(byInterest);
    if (picks.length < 8) picks = picks.concat(all.filter((e) => e.image && !e.featured && (e.kind === 'product' || e.kind === 'game' || e.kind === 'installable')).sort(byInterest)).slice(0, 12);
    mountDrum(drumRoot, picks.slice(0, 12));
  }
  // bottom catalogue: everything, pictures, shelf filters, search, 48 first
  const grid = document.querySelector<HTMLOListElement>('#ledger-grid'); const filters = document.querySelector<HTMLElement>('#ledger-filters');
  const search = document.querySelector<HTMLInputElement>('#ledger-search'); const count = document.querySelector<HTMLElement>('#ledger-count'); const more = document.querySelector<HTMLButtonElement>('#ledger-more');
  if (!grid || !filters || !search || !count) return;
  const cats = new Map<string, string>(); if (cat.categories?.length) for (const c of cat.categories) cats.set(c.id, c.title);
  const curated = cats.size > 0;
  const nCat = new Map<string, number>(); for (const e of all) { let id = e.category ?? e.kind ?? 'product'; if (curated && !cats.has(id)) { id = 'new'; e.category = 'new'; } nCat.set(id, (nCat.get(id) ?? 0) + 1); if (!cats.has(id)) cats.set(id, id === 'new' ? 'New, not yet shelved' : (KINDS[id] ?? id)); }
  let shelf: string | null = null; let showAll = false; const PAGE = 48;
  filters.innerHTML = [...cats.entries()].filter(([id]) => nCat.get(id)).map(([id, t]) => `<button type="button" data-f="${esc(id)}" aria-pressed="false">${esc(t)} <b>${nCat.get(id)}</b></button>`).join('');
  const sorted = [...all].sort((a, b) => (a.state === 'VERIFYING' ? -1 : 0) - (b.state === 'VERIFYING' ? -1 : 0) || byInterest(a, b));
  grid.innerHTML = sorted.map((e) => card(e, { showWhy: true })).join('');
  const items = [...grid.querySelectorAll<HTMLLIElement>('li')];
  const apply = (): void => {
    const q = search.value.trim().toLowerCase(); const filtering = Boolean(q || shelf); let matched = 0, shown = 0;
    for (const li of items) { const ok = (!q || (li.dataset.search ?? '').includes(q)) && (!shelf || li.dataset.cat === shelf); if (ok) matched++; const vis = ok && (filtering || showAll || matched <= PAGE); li.hidden = !vis; if (vis) shown++; }
    count.textContent = shown === all.length ? `${all.length} tools` : `${shown} of ${matched} matching · ${all.length} tools`;
    if (more) { more.hidden = filtering || showAll || matched <= PAGE; more.textContent = `Show all ${matched} tools`; }
    filters.querySelectorAll<HTMLButtonElement>('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.f === shelf)));
  };
  more?.addEventListener('click', () => { showAll = true; apply(); });
  mountGuide(search.closest('form') as HTMLFormElement, search, grid, all);
  search.addEventListener('input', apply);
  filters.addEventListener('click', (ev) => { const b = (ev.target as HTMLElement).closest('button'); if (!b) return; shelf = shelf === b.dataset.f ? null : (b.dataset.f ?? null); apply(); });
  apply();
}
