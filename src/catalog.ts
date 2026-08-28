import './style.css';
import { loadCatalog, card, byInterest, esc, KIND, KINDS, type Entry } from './ledger';

const q = new URLSearchParams(location.search);
const state = { cat: q.get('cat'), kind: q.get('kind'), cls: q.get('class'), q: q.get('q') ?? '' };
const focus = q.get('focus');
function sync(): void { const u = new URLSearchParams(); if (state.cat) u.set('cat', state.cat); if (state.kind) u.set('kind', state.kind); if (state.cls) u.set('class', state.cls); if (state.q) u.set('q', state.q); history.replaceState(null, '', u.toString() ? `?${u}` : location.pathname); }
function list(el: HTMLElement, items: [string, string, number][], key: 'cat' | 'kind' | 'cls'): void {
  el.innerHTML = [`<li><button type="button" data-v="" aria-pressed="${state[key] ? 'false' : 'true'}">All</button></li>`, ...items.map(([v, label, n]) => `<li><button type="button" data-v="${esc(v)}" aria-pressed="${state[key] === v}">${esc(label)} <b>${n}</b></button></li>`)].join('');
  el.addEventListener('click', (ev) => { const b = (ev.target as HTMLElement).closest('button'); if (!b) return; state[key] = b.dataset.v || null; render(); });
}
let entries: Entry[] = []; let cats = new Map<string, { title: string; blurb?: string }>();
function render(): void {
  sync();
  const grid = document.querySelector<HTMLOListElement>('#cat-grid')!; const title = document.querySelector<HTMLElement>('#cat-title')!; const blurb = document.querySelector<HTMLElement>('#cat-blurb')!; const count = document.querySelector<HTMLElement>('#cat-count')!; const empty = document.querySelector<HTMLElement>('#cat-empty')!;
  const s = state.q.trim().toLowerCase();
  const shown = entries.filter((e) => (!state.cat || e.category === state.cat) && (!state.kind || e.kind === state.kind) && (!state.cls || e.class === state.cls) && (!s || (e.title + ' ' + (e.why ?? '') + ' ' + e.description + ' ' + e.slug + ' ' + (e.tags ?? []).join(' ')).toLowerCase().includes(s))).sort(byInterest);
  const c = state.cat ? cats.get(state.cat) : null;
  title.textContent = c ? c.title : state.kind ? (KINDS[state.kind] ?? state.kind) : state.cls ? (KIND[state.cls] ?? state.cls) : 'All tools';
  blurb.textContent = c?.blurb ?? '';
  count.textContent = `${shown.length} of ${entries.length} tools${s ? ` · “${state.q}”` : ''}`;
  grid.innerHTML = shown.map((e) => card(e, { showWhy: true })).join(''); empty.hidden = shown.length > 0;
  document.querySelectorAll<HTMLButtonElement>('.catalog-side button').forEach((b) => { const ul = b.closest('ul')!; const key = ul.id === 'side-cats' ? 'cat' : ul.id === 'side-kinds' ? 'kind' : 'cls'; b.setAttribute('aria-pressed', String((state[key] ?? '') === (b.dataset.v ?? ''))); });
  document.title = `${title.textContent} — Catalogue · Hello Factory`;
}
(async () => {
  const cat = await loadCatalog(); if (!cat) return;
  entries = cat.products;
  if (cat.categories?.length) for (const c of cat.categories) cats.set(c.id, c);
  for (const e of entries) if (e.category && !cats.has(e.category)) cats.set(e.category, { title: KINDS[e.category] ?? e.category });
  const cnt = (f: (e: Entry) => string | undefined) => { const m = new Map<string, number>(); for (const e of entries) { const k = f(e); if (k) m.set(k, (m.get(k) ?? 0) + 1); } return m; };
  const byCat = cnt((e) => e.category), byKind = cnt((e) => e.kind), byCls = cnt((e) => e.class);
  list(document.querySelector('#side-cats')!, [...cats.entries()].filter(([id]) => byCat.get(id)).map(([id, c]) => [id, c.title, byCat.get(id) ?? 0] as [string, string, number]), 'cat');
  list(document.querySelector('#side-kinds')!, [...byKind.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => [k, KINDS[k] ?? k, n] as [string, string, number]), 'kind');
  list(document.querySelector('#side-classes')!, [...byCls.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => [k, KIND[k] ?? k, n] as [string, string, number]), 'cls');
  const search = document.querySelector<HTMLInputElement>('#cat-search')!; search.value = state.q; search.addEventListener('input', () => { state.q = search.value; render(); });
  render();
  if (focus) { const li = document.getElementById(`p-${focus}`); if (li) { li.classList.add('is-focus'); li.scrollIntoView({ block: 'center' }); li.querySelector<HTMLAnchorElement>('h3 a')?.focus(); } }
})();
