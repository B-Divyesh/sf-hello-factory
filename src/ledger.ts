export type Entry = { slug: string; title: string; url: string; class: string; territory: string; description: string; paid: boolean; state: string; released?: string;
  kind?: string; category?: string; interest?: number; reason?: string; why?: string; featured?: boolean; tags?: string[] };
export type Category = { id: string; title: string; blurb?: string };
export type Catalog = { generated: string; count: number; products: Entry[]; categories?: Category[]; curated?: boolean };
export const KIND: Record<string, string> = { 'static-web': 'web', 'pwa-offline': 'offline app', 'web-with-backend': 'web + backend', 'library-npm': 'npm library', 'library-pypi': 'python library', 'library-crate': 'rust crate', cli: 'cli', 'browser-extension': 'browser extension', android: 'android', 'desktop-app': 'desktop app', 'cli-installers': 'cli installers', 'android-apk': 'android apk', 'ios-ipa': 'ios (sideload)' };
export const KINDS: Record<string, string> = { product: 'Products', game: 'Play', utility: 'Utilities', installable: 'Install on your computer', extension: 'Browser extensions', devtool: 'For developers', library: 'Libraries' };
export function esc(s: string): string { return String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch] ?? ch); }
export async function loadCatalog(): Promise<Catalog | null> {
  try { const res = await fetch('/products.json', { cache: 'no-cache' }); if (!res.ok) return null; const c = (await res.json()) as Catalog; for (const e of c.products) fillDefaults(e); return c; } catch { return null; }
}
/* Without a curation run, derive a sensible kind/category from the artifact class and territory. */
export function fillDefaults(e: Entry): void {
  if (!e.kind) {
    if (['desktop-app', 'cli-installers', 'android-apk', 'ios-ipa', 'android'].includes(e.class)) e.kind = 'installable';
    else if (e.class.startsWith('library-')) e.kind = 'library';
    else if (e.class === 'cli' || e.territory === 'devtools-data') e.kind = 'devtool';
    else if (e.class === 'browser-extension') e.kind = 'extension';
    else if (e.territory === 'games-creative') e.kind = 'game';
    else e.kind = 'product';
  }
  if (!e.category) e.category = e.kind;
}
export function card(e: Entry, opts: { showWhy?: boolean } = {}): string {
  const line = (opts.showWhy && e.why) ? e.why : (e.description || 'Live and ready to try.');
  return `<li data-kind="${esc(e.kind ?? '')}" data-cat="${esc(e.category ?? '')}" data-class="${esc(e.class)}" data-search="${esc((e.title + ' ' + line + ' ' + e.slug + ' ' + (e.tags ?? []).join(' ')).toLowerCase())}">
    <div class="ledger-meta"><span>${esc(KIND[e.class] ?? e.class)}</span>${e.paid ? '<span class="paid">paid tier</span>' : ''}${e.state === 'VERIFYING' ? '<span class="fresh">just shipped</span>' : ''}${e.interest && e.interest >= 5 ? '<span class="star">editor’s pick</span>' : ''}</div>
    <h3><a href="${esc(e.url)}">${esc(e.title)}</a></h3>
    <p>${esc(line)}</p>
    <span class="address">${esc(e.url.replace('https://', ''))}</span>
  </li>`;
}
export function byInterest(a: Entry, b: Entry): number { return (b.interest ?? 0) - (a.interest ?? 0) || a.title.localeCompare(b.title); }
