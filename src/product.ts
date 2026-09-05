import './style.css';
import { loadCatalog, loadDetail, esc, KIND, KINDS, rail, wireRails, fmtDate, host, chips, qaVerdict, type Detail } from './ledger';
import { related, slugFromPath } from './store';

/* /p/<slug>: one tool's page. Everything on it is a fact from the brief, the curator, or the fleet's check ledger. */
function para(s?: string): string { return s ? s.trim().split(/\n{2,}|\n(?=[-•*] )/).filter(Boolean).map((p) => `<p>${esc(p.trim())}</p>`).join('') : ''; }
async function main(): Promise<void> {
  const slug = slugFromPath(location.pathname, location.search);
  const root = document.querySelector<HTMLElement>('#product')!;
  const d: Detail | null = slug ? await loadDetail(slug) : null;
  if (!d) {
    document.title = 'No tool at this address — Hello Factory';
    root.innerHTML = `<div class="product-missing"><p class="kicker">Not found</p><h1>No tool at this address.</h1><p>It may have been renamed or not released yet.</p><p><a class="btn btn-primary" href="/catalog/">Open the catalogue</a></p></div>`;
    return;
  }
  const catTitle = document.querySelector<HTMLElement>('#crumb-cat');
  document.title = `${d.title} — Hello Factory`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', d.why || d.description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `https://hello-factory.sociobot.in/p/${d.slug}`);
  const checks = d.checks; const qa = qaVerdict(d);
  const parts: string[] = [];
  if (checks?.verify_runs) parts.push(`${checks.verify_runs} verifier run${checks.verify_runs === 1 ? '' : 's'}`);
  if (checks?.reviews_passed) parts.push(`${checks.reviews_passed} independent review${checks.reviews_passed === 1 ? '' : 's'} passed`);
  const checksLine = esc([qa.detail, parts.length ? `${parts.join(', ')} recorded.` : ''].filter(Boolean).join(' '));
  root.innerHTML = `
    <div class="product-media"><figure class="product-shot">${d.image ? `<img src="${esc(d.image)}" alt="First screen of ${esc(d.title)}" width="683" height="427" fetchpriority="high" decoding="async">` : `<span class="shot shot-empty"><b>${esc(d.title.slice(0, 1))}</b><i>${esc(KIND[d.class] ?? d.class)}</i></span>`}<figcaption>${d.image ? 'First screen preserved in the catalogue snapshot.' : 'No first-screen picture is available yet.'}</figcaption></figure></div>
    <div class="product-body">
      ${chips(d)}
      <h1>${esc(d.title)}</h1>
      <p class="product-lede">${esc(d.why || d.description)}</p>
      <p class="product-actions"><a class="btn btn-primary btn-lg" href="${esc(d.url)}" rel="noopener">Open ${esc(host(d))}<span aria-hidden="true"> ↗</span><span class="visually-hidden">, external site</span></a></p>
      <dl class="facts">
        <div><dt>Address</dt><dd><a href="${esc(d.url)}" rel="noopener">${esc(host(d))}</a></dd></div>
        ${d.released ? `<div><dt>First published</dt><dd>${esc(fmtDate(d.released))}</dd></div>` : ''}
        <div><dt>Runs as</dt><dd>${esc(KIND[d.class] ?? d.class)}${d.class === 'pwa-offline' ? ' · keeps working without a connection' : ''}</dd></div>
        <div><dt>QA state</dt><dd>${checksLine}</dd></div>
        ${d.updated && d.updated !== d.released ? `<div><dt>Last update</dt><dd>${esc(fmtDate(d.updated))}</dd></div>` : ''}
      </dl>
      ${d.detail ? `<section class="product-text"><h2>What it does</h2>${para(d.detail)}</section>` : ''}
      ${d.user ? `<section class="product-text"><h2>Who it is for</h2>${para(d.user)}</section>` : ''}
      ${d.distinct ? `<section class="product-text"><h2>What is different about it</h2>${para(d.distinct)}</section>` : ''}
      ${d.workaround ? `<section class="product-text"><h2>What people did before</h2>${para(d.workaround)}</section>` : ''}
      ${d.reason && d.reason !== d.why ? `<section class="product-text"><h2>Why it is listed</h2>${para(d.reason)}</section>` : ''}
      ${qa.tone === 'pass' ? '<section class="product-text release-facts"><h2>Recorded QA result</h2><p>This catalogue snapshot records a strict review with no open findings.</p></section>' : ''}
    </div>`;
  const cat = await loadCatalog(); if (!cat) return;
  const cats = new Map((cat.categories ?? []).map((c) => [c.id, c]));
  const c = d.category ? cats.get(d.category) : undefined;
  if (catTitle && c) { catTitle.textContent = c.title; catTitle.setAttribute('href', `/catalog/?cat=${encodeURIComponent(c.id)}`); }
  document.querySelector<HTMLElement>('#crumb-self')!.textContent = d.title;
  const rel = related(cat.products, d, 10);
  const more = document.querySelector<HTMLElement>('#more')!;
  more.innerHTML = rail('more', c ? `More in ${c.title}` : 'More tools', c?.blurb ?? '', rel, c ? `/catalog/?cat=${encodeURIComponent(c.id)}` : '/catalog/', c ? cat.products.filter((x) => x.category === c.id).length : cat.products.length, { showWhy: true });
  wireRails(more);
}
void main();
