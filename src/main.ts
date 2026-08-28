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


/* ---- Landing: recommended picks, shelves, latest releases (data from /products.json + curation) ---- */
import { loadCatalog, card, byInterest, esc, KINDS, type Entry } from './ledger';
async function renderLedger(): Promise<void> {
  const featuredGrid = document.querySelector<HTMLOListElement>('#featured-grid');
  const shelves = document.querySelector<HTMLElement>('#shelves');
  const latestGrid = document.querySelector<HTMLOListElement>('#latest-grid');
  const count = document.querySelector<HTMLElement>('#ledger-count');
  const lede = document.querySelector<HTMLElement>('#ledger-lede');
  const cat = await loadCatalog();
  if (!cat || !featuredGrid || !shelves || !latestGrid) return;
  const all = cat.products;
  if (summary) summary.textContent = `${all.length} tools live on their own addresses.`;
  if (count) count.textContent = `· ${all.length} tools`;
  let featured = all.filter((e) => e.featured).sort(byInterest);
  if (featured.length === 0) {
    if (lede) lede.textContent = 'The editor has not rated this batch yet, so here are the most recent product-like releases. The full catalogue has everything.';
    featured = all.filter((e) => e.kind === 'product' || e.kind === 'game').sort((a, b) => (b.released ?? '').localeCompare(a.released ?? '')).slice(0, 12);
  }
  featuredGrid.innerHTML = featured.slice(0, 12).map((e) => card(e, { showWhy: true })).join('');
  const groups = new Map<string, { title: string; blurb?: string; n: number }>();
  if (cat.categories?.length) for (const c of cat.categories) groups.set(c.id, { title: c.title, blurb: c.blurb, n: 0 });
  for (const e of all) { const id = e.category ?? e.kind ?? 'product'; if (!groups.has(id)) groups.set(id, { title: KINDS[id] ?? id, n: 0 }); groups.get(id)!.n++; }
  shelves.innerHTML = [...groups.entries()].filter(([, g]) => g.n > 0).map(([id, g]) => `<a class="shelf" href="/catalog/?cat=${encodeURIComponent(id)}"><span class="shelf-count">${g.n}</span><strong>${esc(g.title)}</strong>${g.blurb ? `<span>${esc(g.blurb)}</span>` : ''}</a>`).join('');
  const featuredSlugs = new Set(featured.map((e) => e.slug));
  const latest: Entry[] = all.filter((e) => !featuredSlugs.has(e.slug) && (e.kind === 'product' || e.kind === 'game' || e.kind === 'installable')).sort((a, b) => (b.released ?? '').localeCompare(a.released ?? '') || byInterest(a, b)).slice(0, 6);
  latestGrid.innerHTML = latest.map((e) => card(e, { showWhy: true })).join('');
}
