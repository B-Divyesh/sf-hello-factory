import { card, esc, type Entry } from './ledger';
/* "Ask the guide": describe a problem → the factory's guide (a model behind api.sociobot.in, rate limited, no keys in the
   browser) returns up to five tools that genuinely fit. Plain search still works without it. */
const API = 'https://api.sociobot.in/api/v1/products/recommend';
export function mountGuide(form: HTMLFormElement, input: HTMLInputElement, host: HTMLElement, all: Entry[]): void {
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'guide-btn'; btn.textContent = 'Ask the guide';
  btn.title = 'Describe your problem in a sentence; the guide picks up to five tools that fit';
  form.appendChild(btn);
  const panel = document.createElement('section'); panel.className = 'guide-panel'; panel.hidden = true; panel.setAttribute('aria-live', 'polite');
  host.parentElement!.insertBefore(panel, host);
  const bySlug = new Map(all.map((e) => [e.slug, e]));
  let busy = false;
  const ask = async (): Promise<void> => {
    const q = input.value.trim(); if (q.length < 6 || busy) { input.focus(); return; }
    busy = true; btn.disabled = true; panel.hidden = false;
    panel.innerHTML = `<p class="kicker">The guide</p><p class="guide-status">Reading ${all.length} tools for “${esc(q)}”…</p>`;
    try {
      const res = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: q }) });
      if (res.status === 429) throw new Error('The guide is busy right now — try again in a minute.');
      if (!res.ok) throw new Error('The guide is not available right now.');
      const data = (await res.json()) as { picks: { slug: string; why: string }[]; note?: string };
      const picks = data.picks.map((p) => ({ e: bySlug.get(p.slug), why: p.why })).filter((p) => p.e) as { e: Entry; why: string }[];
      panel.innerHTML = `<p class="kicker">The guide</p><h3>${picks.length ? `${picks.length} tool${picks.length > 1 ? 's' : ''} for “${esc(q)}”` : 'Nothing in the catalogue fits that well yet'}</h3>
        ${data.note ? `<p class="ledger-lede">${esc(data.note)}</p>` : ''}
        <ol class="ledger-grid pictures guide-grid">${picks.map((p) => card({ ...p.e, why: p.why, interest: p.e.interest }, { showWhy: true })).join('')}</ol>
        <p class="ledger-foot"><button type="button" class="guide-close">Close</button> · picked by a model from the catalogue; it can be wrong. <a href="/catalog/">Browse the whole catalogue</a> for the full list.</p>`;
      panel.querySelector('.guide-close')?.addEventListener('click', () => { panel.hidden = true; });
    } catch (err) {
      panel.innerHTML = `<p class="kicker">The guide</p><p class="guide-status">${esc((err as Error).message)}</p>`;
    } finally { busy = false; btn.disabled = false; }
  };
  btn.addEventListener('click', ask);
  form.addEventListener('submit', (ev) => { ev.preventDefault(); if (input.value.trim().split(/\s+/).length >= 3) void ask(); else input.focus(); });
  input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && input.value.trim().split(/\s+/).length >= 3) { ev.preventDefault(); void ask(); } });
}
