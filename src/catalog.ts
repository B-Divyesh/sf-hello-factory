import './style.css';
import { loadCatalog, card, esc, KIND, KINDS, type Entry } from './ledger';
import { sortEntries, type SortKey } from './store';
import { mountGuide } from './recommend';

/* /catalog/: the whole catalogue with filters, search, sort and the guide. State lives in the URL. */
const q = new URLSearchParams(location.search);
const state = { cat: q.get('cat'), kind: q.get('kind'), cls: q.get('class'), q: q.get('q') ?? '', sort: ((['best', 'new', 'az'] as SortKey[]).includes(q.get('sort') as SortKey) ? q.get('sort') : 'best') as SortKey };
const focus = q.get('focus');
function sync(): void { const u = new URLSearchParams(); if (state.cat) u.set('cat', state.cat); if (state.kind) u.set('kind', state.kind); if (state.cls) u.set('class', state.cls); if (state.q) u.set('q', state.q); if (state.sort !== 'best') u.set('sort', state.sort); history.replaceState(null, '', u.toString() ? `?${u}` : location.pathname); }
function list(el: HTMLElement, items: [string, string, number][], key: 'cat' | 'kind' | 'cls'): void {
  el.innerHTML = [`<li><button type="button" data-v="" aria-pressed="${state[key] ? 'false' : 'true'}">All</button></li>`, ...items.map(([v, label, n]) => `<li><button type="button" data-v="${esc(v)}" aria-pressed="${state[key] === v}">${esc(label)} <b>${n}</b></button></li>`)].join('');
  el.addEventListener('click', (ev) => { const b = (ev.target as HTMLElement).closest('button'); if (!b) return; state[key] = b.dataset.v || null; render(); document.querySelector<HTMLElement>('#cat-title')?.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
}
let entries: Entry[] = []; const cats = new Map<string, { title: string; blurb?: string }>();
function render(): void {
  sync();
  const grid = document.querySelector<HTMLOListElement>('#cat-grid')!; const title = document.querySelector<HTMLElement>('#cat-title')!; const blurb = document.querySelector<HTMLElement>('#cat-blurb')!; const count = document.querySelector<HTMLElement>('#cat-count')!; const empty = document.querySelector<HTMLElement>('#cat-empty')!;
  const s = state.q.trim().toLowerCase();
  const shown = sortEntries(entries.filter((e) => (!state.cat || e.category === state.cat) && (!state.kind || e.kind === state.kind) && (!state.cls || e.class === state.cls) && (!s || (e.title + ' ' + (e.why ?? '') + ' ' + e.description + ' ' + e.slug + ' ' + (e.tags ?? []).join(' ')).toLowerCase().includes(s))), state.sort);
  const c = state.cat ? cats.get(state.cat) : null;
  title.textContent = c ? c.title : state.kind ? (KINDS[state.kind] ?? state.kind) : state.cls ? (KIND[state.cls] ?? state.cls) : 'All tools';
  blurb.textContent = c?.blurb ?? (state.kind === 'game' ? 'Playable in the browser, no account.' : '');
  count.textContent = `${shown.length} of ${entries.length} tools${s ? ` · “${state.q}”` : ''}`;
  grid.innerHTML = shown.map((e) => card(e, { showWhy: true })).join(''); empty.hidden = shown.length > 0;
  document.querySelectorAll<HTMLButtonElement>('.catalog-side ul button, .shelf-strip button').forEach((b) => { const ul = b.closest('ul'); if (!ul) return; const key = ul.id === 'side-kinds' ? 'kind' : ul.id === 'side-classes' ? 'cls' : 'cat'; b.setAttribute('aria-pressed', String((state[key] ?? '') === (b.dataset.v ?? ''))); });
  const sortSel = document.querySelector<HTMLSelectElement>('#cat-sort'); if (sortSel) sortSel.value = state.sort;
  document.title = `${title.textContent} — Catalogue · Hello Factory`;
}
(async () => {
  const cat = await loadCatalog(); if (!cat) { document.querySelector('#cat-count')!.textContent = 'The catalogue could not be loaded. Try again in a minute.'; return; }
  entries = cat.products;
  if (cat.categories?.length) for (const c of cat.categories) cats.set(c.id, c);
  const curated = cats.size > 0;
  for (const e of entries) { if (curated && e.category && !cats.has(e.category)) e.category = 'new'; if (e.category && !cats.has(e.category)) cats.set(e.category, { title: e.category === 'new' ? 'Not yet shelved' : (KINDS[e.category] ?? e.category) }); }
  const cnt = (f: (e: Entry) => string | undefined) => { const m = new Map<string, number>(); for (const e of entries) { const k = f(e); if (k) m.set(k, (m.get(k) ?? 0) + 1); } return m; };
  const byCat = cnt((e) => e.category), byKind = cnt((e) => e.kind), byCls = cnt((e) => e.class);
  const catItems = [...cats.entries()].filter(([id]) => byCat.get(id)).map(([id, c]) => [id, c.title, byCat.get(id) ?? 0] as [string, string, number]);
  list(document.querySelector('#side-cats')!, catItems, 'cat');
  list(document.querySelector('#strip-cats')!, catItems, 'cat');
  list(document.querySelector('#side-kinds')!, [...byKind.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => [k, KINDS[k] ?? k, n] as [string, string, number]), 'kind');
  list(document.querySelector('#side-classes')!, [...byCls.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => [k, KIND[k] ?? k, n] as [string, string, number]), 'cls');
  const search = document.querySelector<HTMLInputElement>('#cat-search')!; search.value = state.q; search.addEventListener('input', () => { state.q = search.value; render(); });
  const sortSel = document.querySelector<HTMLSelectElement>('#cat-sort')!; sortSel.addEventListener('change', () => { state.sort = sortSel.value as SortKey; render(); });
  mountGuide(search.closest('form') as HTMLFormElement, search, document.querySelector('#cat-grid')!, entries);
  render();
  if (focus) { const li = document.getElementById(`p-${focus}`); if (li) { li.classList.add('is-focus'); li.scrollIntoView({ block: 'center' }); li.querySelector<HTMLAnchorElement>('a')?.focus(); } }
})();
