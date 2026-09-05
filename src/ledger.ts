export type Entry = { slug: string; title: string; url: string; class: string; territory: string; description: string; paid: boolean; state: string; released?: string;
  kind?: string; category?: string; interest?: number; reason?: string; why?: string; featured?: boolean; tags?: string[]; image?: string; updated?: string;
  qa?: { strict_zero_review: boolean; reviewed_at?: string; status: string } };
export type Detail = Entry & { detail?: string; user?: string; distinct?: string; workaround?: string; checks?: { verify_runs: number; reviews_passed: number; last_checked?: string } };
export type Category = { id: string; title: string; blurb?: string };
export type Catalog = { generated: string; count: number; products: Entry[]; categories?: Category[]; curated?: boolean };
export const KIND: Record<string, string> = { 'static-web': 'Web page', 'pwa-offline': 'Works offline', 'web-with-backend': 'Web app with a server', 'library-npm': 'npm package', 'library-pypi': 'Python package', 'library-crate': 'Rust crate', cli: 'Command line', 'browser-extension': 'Browser extension', android: 'Android app', 'desktop-app': 'Desktop app', 'cli-installers': 'Command line, with installers', 'android-apk': 'Android APK', 'ios-ipa': 'iOS (sideload)', 'browser-game': 'Browser game' };
export const KINDS: Record<string, string> = { product: 'Products', game: 'Games', utility: 'Utilities', installable: 'Installable', extension: 'Browser extensions', devtool: 'Developer tools', library: 'Libraries' };
export function esc(s: string): string { return String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch] ?? ch); }
export function detailHref(e: Pick<Entry, 'slug'>): string { return `/p/${encodeURIComponent(e.slug)}/`; }
export async function loadCatalog(): Promise<Catalog | null> {
  try { const res = await fetch('/products.json', { cache: 'no-cache' }); if (!res.ok) return null; const c = (await res.json()) as Catalog; for (const e of c.products) fillDefaults(e); return c; } catch { return null; }
}
export async function loadDetail(slug: string): Promise<Detail | null> {
  if (!/^[a-z0-9][a-z0-9-]{0,60}$/.test(slug)) return null;
  try { const res = await fetch(`/products/${slug}.json`, { cache: 'no-cache' }); if (!res.ok) return null; const d = (await res.json()) as Detail; fillDefaults(d); return d; } catch { return null; }
}
/* Without a curation run, derive a sensible kind/category from the artifact class and territory. */
export function fillDefaults(e: Entry): void {
  if (!e.kind) {
    if (e.class === 'browser-game' || e.territory === 'browser-games') e.kind = 'game';
    else if (['desktop-app', 'cli-installers', 'android-apk', 'ios-ipa', 'android'].includes(e.class)) e.kind = 'installable';
    else if (e.class.startsWith('library-')) e.kind = 'library';
    else if (e.class === 'cli' || e.territory === 'devtools-data') e.kind = 'devtool';
    else if (e.class === 'browser-extension') e.kind = 'extension';
    else e.kind = 'product';
  }
  if (!e.category) e.category = 'new';
}

export type QAVerdict = { label: string; detail: string; date: string; tone: 'pass' | 'active' | 'changes' | 'unknown' };
export function qaVerdict(e: Entry): QAVerdict {
  const status = e.qa?.status || e.state;
  const date = fmtDate(e.qa?.reviewed_at);
  if (status === 'RELEASED' && e.qa?.strict_zero_review) return { label: 'QA passed', detail: date ? `Passed on ${date}.` : 'Passed; no check date was recorded.', date, tone: 'pass' };
  if (status === 'VERIFYING') return { label: 'QA in progress', detail: date ? `In progress; last checked ${date}.` : 'In progress; no check date recorded yet.', date, tone: 'active' };
  if (status === 'POLISHING') return { label: 'QA changes required', detail: date ? `Changes required after the ${date} check.` : 'Changes required; no check date was recorded.', date, tone: 'changes' };
  return { label: 'QA status unavailable', detail: date ? `Status unavailable; last checked ${date}.` : 'No QA verdict or check date was recorded.', date, tone: 'unknown' };
}
export function summary(e: Pick<Entry, 'why' | 'description'>): string {
  const source = String(e.why || e.description || 'Listed in the catalogue.').replace(/\s+/g, ' ').trim();
  const words = source.split(' ');
  if (words.length <= 22) return source;
  const firstSentence = source.match(/^.*?[.!?](?=\s|$)/)?.[0];
  if (firstSentence && firstSentence.split(' ').length <= 22) return firstSentence;
  return `${words.slice(0, 20).join(' ').replace(/[,;:]$/, '')}…`;
}
export function picture(e: Entry, cls = 'shot', eager = false): string {
  return e.image
    ? `<span class="${cls}"><img src="${esc(e.image)}" alt="" width="683" height="427" loading="${eager ? 'eager' : 'lazy'}" decoding="${eager ? 'auto' : 'async'}"></span>`
    : `<span class="${cls} shot-empty" aria-hidden="true"><b>${esc(e.title.slice(0, 1))}</b><i>${esc(KIND[e.class] ?? e.class)}</i></span>`;
}
export function host(e: Pick<Entry, 'url'>): string { return e.url.replace(/^https?:\/\//, '').replace(/\/$/, ''); }
export function chips(e: Entry): string {
  const qa = qaVerdict(e);
  return `<span class="chips"><span class="chip">${esc(KIND[e.class] ?? e.class)}</span>${e.paid ? '<span class="chip chip-paid">Paid tier</span>' : '<span class="chip">Free</span>'}<span class="chip chip-qa-${qa.tone}">${esc(qa.label)}${qa.date ? ` · ${esc(qa.date)}` : ''}</span>${e.featured || (e.interest && e.interest >= 5) ? '<span class="chip chip-pick">Editor’s pick</span>' : ''}</span>`;
}
/* One catalogue card. The card opens the tool's own page; the small "Open" link goes straight to the live address. */
export function card(e: Entry, opts: { showWhy?: boolean; compact?: boolean; eager?: boolean } = {}): string {
  const line = summary(opts.showWhy ? e : { description: e.description });
  return `<li id="p-${esc(e.slug)}" class="card${opts.compact ? ' card-compact' : ''}" data-kind="${esc(e.kind ?? '')}" data-cat="${esc(e.category ?? '')}" data-class="${esc(e.class)}" data-search="${esc((e.title + ' ' + line + ' ' + e.slug + ' ' + (e.tags ?? []).join(' ')).toLowerCase())}">
    <a class="card-link" href="${detailHref(e)}">${picture(e, 'shot', opts.eager)}${chips(e)}<h3>${esc(e.title)}</h3><p>${esc(line)}</p></a>
    <div class="card-foot"><span class="address">${esc(host(e))}</span><a class="open" href="${esc(e.url)}" rel="noopener">Open<span aria-hidden="true"> ↗</span><span class="visually-hidden"> ${esc(e.title)} on its external site</span></a></div>
  </li>`;
}
/* A horizontal shelf of cards with a "See all" link. */
export function rail(id: string, title: string, blurb: string, items: Entry[], seeAll: string, total: number, opts: { showWhy?: boolean } = {}): string {
  if (!items.length) return '';
  return `<section class="rail" aria-labelledby="rail-${esc(id)}">
    <div class="rail-head"><div><h2 id="rail-${esc(id)}">${esc(title)}</h2>${blurb ? `<p>${esc(blurb)}</p>` : ''}</div><div class="rail-nav"><button type="button" class="rail-btn rail-prev" aria-label="Scroll ${esc(title)} back">←</button><button type="button" class="rail-btn rail-next" aria-label="Scroll ${esc(title)} forward">→</button><a class="see-all" href="${esc(seeAll)}">See all ${total}<span aria-hidden="true"> →</span></a></div></div>
    <div class="rail-scroller"><ol class="rail-track">${items.map((e) => card(e, { compact: true, showWhy: opts.showWhy })).join('')}</ol></div>
  </section>`;
}
export function wireRails(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('.rail').forEach((r) => {
    const track = r.querySelector<HTMLElement>('.rail-track'); const prev = r.querySelector<HTMLButtonElement>('.rail-prev'); const next = r.querySelector<HTMLButtonElement>('.rail-next');
    if (!track || !prev || !next) return;
    const update = (): void => { prev.disabled = track.scrollLeft < 8; next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8; };
    prev.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * 0.8, behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: track.clientWidth * 0.8, behavior: 'smooth' }));
    track.addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
  });
}
export function byInterest(a: Entry, b: Entry): number { return (b.interest ?? 0) - (a.interest ?? 0) || a.title.localeCompare(b.title); }
export function fmtDate(iso?: string): string { if (!iso) return ''; const d = new Date(iso); return Number.isNaN(d.getTime()) ? iso : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d); }
