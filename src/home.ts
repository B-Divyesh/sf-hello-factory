import './style.css';
import { loadCatalog, rail, wireRails, esc, fmtDate, detailHref, host, type Entry, type Category } from './ledger';
import { byCategory, featuredPicks, games as gameEntries, justReleased } from './store';
import { mountDrum } from './showcase';
import { mountGuide } from './recommend';

/* Home: the store front. Recommendations and shelves only — the full catalogue lives at /catalog/. */
function featureCard(e: Entry, big = false, eager = big): string {
  return `<article class="feature${big ? ' feature-big' : ''}">
    <a class="feature-link" href="${detailHref(e)}">${e.image ? `<img src="${esc(e.image)}" alt="" width="683" height="427" loading="${eager ? 'eager' : 'lazy'}" decoding="async">` : `<span class="shot shot-empty"><b>${esc(e.title.slice(0, 1))}</b></span>`}</a>
    <div class="feature-body"><p class="kicker">${esc(e.category ? (catTitle.get(e.category) ?? '') : '')}</p><h3><a href="${detailHref(e)}">${esc(e.title)}</a></h3><p>${esc(e.why || e.description)}</p>
      <p class="feature-actions"><a class="btn btn-primary" href="${esc(e.url)}" rel="noopener">Open ${esc(host(e))}<span aria-hidden="true"> ↗</span></a><a class="btn" href="${detailHref(e)}">Details</a></p></div>
  </article>`;
}
const catTitle = new Map<string, string>();
async function main(): Promise<void> {
  const cat = await loadCatalog();
  if (!cat) { document.querySelector('#hero-count')!.textContent = 'The catalogue could not be loaded. Try again in a minute.'; return; }
  const all = cat.products; const cats: Category[] = cat.categories ?? [];
  for (const c of cats) catTitle.set(c.id, c.title);
  // hero: the live count, the guide, and the single biggest recommendation
  document.querySelector('#hero-count')!.textContent = `${all.length} tools listed, each with its own address and current QA state.`;
  document.querySelector('#updated')!.textContent = `Catalogue updated ${fmtDate(cat.generated)}.`;
  const picks = featuredPicks(all, 13);
  const lead = picks[0]; const heroSlot = document.querySelector<HTMLElement>('#hero-feature');
  if (lead && heroSlot) heroSlot.innerHTML = featureCard(lead, true);
  const form = document.querySelector<HTMLFormElement>('#guide-form')!; const input = document.querySelector<HTMLInputElement>('#guide-input')!;
  mountGuide(form, input, document.querySelector('#guide-results')!, all);
  // featured this week: six editorial cards
  const feat = document.querySelector<HTMLElement>('#featured-grid');
  if (feat) feat.innerHTML = picks.slice(1, 7).map((e, i) => featureCard(e, false, i < 3)).join('');
  // the drum of real first screens
  const drumRoot = document.querySelector<HTMLElement>('#drum'); if (drumRoot) mountDrum(drumRoot, picks.slice(0, 12));
  // shelves
  const shelves = document.querySelector<HTMLElement>('#shelves')!;
  const fresh = justReleased(all, 14);
  const groups = byCategory(all, cats);
  let html = rail('new', 'Just released', 'Verified releases and tools still in their first QA check.', fresh, '/catalog/?release=1&sort=new', justReleased(all, all.length).length);
  const games = gameEntries(all);
  if (games.length) html += rail('games', 'Games', 'Playable in the browser, no account.', games.slice(0, 14), '/catalog/?kind=game', games.length, { showWhy: true });
  for (const c of cats) { const items = groups.get(c.id) ?? []; if (!items.length) continue; html += rail(c.id, c.title, c.blurb ?? '', items.slice(0, 14), `/catalog/?cat=${encodeURIComponent(c.id)}`, items.length, { showWhy: true }); }
  const unshelved = groups.get('new') ?? [];
  if (cats.length && unshelved.length) html += rail('unshelved', 'Not yet shelved', 'Released after the last curation pass.', unshelved.slice(0, 14), '/catalog/?cat=new', unshelved.length);
  shelves.innerHTML = html; wireRails(shelves);
  // counts in the footer band
  const counts = document.querySelector<HTMLElement>('#counts');
  if (counts) counts.innerHTML = [['tools listed', all.length], ['QA passed', all.filter((e) => e.qa?.strict_zero_review).length], ['games', games.length], ['shelves', cats.length || groups.size]].map(([l, n]) => `<div><b>${n}</b><span>${l}</span></div>`).join('');
}
void main();
