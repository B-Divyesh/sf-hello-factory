import { byInterest, type Category, type Entry } from './ledger';
/* Pure store logic: which tools go where on the home page. Kept free of DOM so it can be unit-tested. */

const SHOWCASE_KINDS = new Set(['product', 'game', 'installable', 'utility']);

/* Editor's featured picks with a picture, topped up with the most interesting product-like tools that have one. */
export function featuredPicks(all: Entry[], n = 12): Entry[] {
  const picks = all.filter((e) => e.featured && e.image).sort(byInterest);
  if (picks.length >= n) return picks.slice(0, n);
  const seen = new Set(picks.map((e) => e.slug));
  const fill = all.filter((e) => e.image && !seen.has(e.slug) && SHOWCASE_KINDS.has(e.kind ?? '')).sort(byInterest);
  return picks.concat(fill).slice(0, n);
}

/* Newest first releases. `released` is the first release date; tools still in their first verification window come first. */
export function justReleased(all: Entry[], n = 14): Entry[] {
  return [...all].sort((a, b) => Number(b.state === 'VERIFYING') - Number(a.state === 'VERIFYING') || (b.released ?? '').localeCompare(a.released ?? '') || byInterest(a, b)).slice(0, n);
}

/* Tools grouped by curated category, each group sorted by the curator's interest. Unknown categories fall under "new". */
export function byCategory(all: Entry[], cats: Category[]): Map<string, Entry[]> {
  const known = new Set(cats.map((c) => c.id));
  const groups = new Map<string, Entry[]>();
  for (const e of all) {
    const id = e.category && (known.size === 0 || known.has(e.category)) ? e.category : 'new';
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id)!.push(e);
  }
  for (const g of groups.values()) g.sort(byInterest);
  return groups;
}

/* Other tools on the same shelf, best first, never the tool itself. */
export function related(all: Entry[], e: Entry, n = 8): Entry[] {
  return all.filter((x) => x.slug !== e.slug && x.category === e.category).sort(byInterest).slice(0, n);
}

/* /p/<slug> → slug; anything else → null. */
export function slugFromPath(pathname: string, search = ''): string | null {
  const m = /^\/p\/([a-z0-9][a-z0-9-]{0,60})\/?$/.exec(pathname);
  if (m) return m[1];
  const q = new URLSearchParams(search).get('slug');
  return q && /^[a-z0-9][a-z0-9-]{0,60}$/.test(q) ? q : null;
}

export type SortKey = 'best' | 'new' | 'az';
export function sortEntries(items: Entry[], key: SortKey): Entry[] {
  const out = [...items];
  if (key === 'new') out.sort((a, b) => (b.released ?? '').localeCompare(a.released ?? '') || byInterest(a, b));
  else if (key === 'az') out.sort((a, b) => a.title.localeCompare(b.title));
  else out.sort(byInterest);
  return out;
}
