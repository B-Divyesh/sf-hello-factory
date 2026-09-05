import { card, esc, type Entry } from './ledger';
/* "Ask the guide": describe a problem → the factory's guide (a model behind api.sociobot.in, rate limited, no keys in the
   browser) returns up to five tools that genuinely fit. Plain search still works without it. */
const API = 'https://api.sociobot.in/api/v1/products/recommend';

export type GuidePick = { slug: string; why: string };
export type GuideReply = { picks: GuidePick[]; note?: string };
export type GuideProgress = { bytesReceived: number; picks: GuidePick[] };

function completePicks(text: string): GuidePick[] {
  const key = text.search(/"picks"\s*:/u);
  const opening = key < 0 ? -1 : text.indexOf('[', key);
  if (opening < 0) return [];
  const picks: GuidePick[] = [];
  let start = -1;
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let index = opening + 1; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') quoted = false;
      continue;
    }
    if (character === '"') { quoted = true; continue; }
    if (character === '{') {
      if (depth === 0) start = index;
      depth += 1;
    } else if (character === '}' && depth > 0) {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        try {
          const candidate = JSON.parse(text.slice(start, index + 1)) as Partial<GuidePick>;
          if (typeof candidate.slug === 'string' && typeof candidate.why === 'string') picks.push({ slug: candidate.slug, why: candidate.why });
        } catch { /* The final parser reports malformed replies. */ }
        start = -1;
      }
    } else if (character === ']' && depth === 0) break;
  }
  return picks;
}

async function letBrowserPaint(): Promise<void> {
  if (typeof requestAnimationFrame === 'function') await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

export async function readRecommendationStream(response: Response, onProgress: (progress: GuideProgress) => void): Promise<GuideReply> {
  if (!response.body) return response.json() as Promise<GuideReply>;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  let bytesReceived = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytesReceived += value.byteLength;
    text += decoder.decode(value, { stream: true });
    onProgress({ bytesReceived, picks: completePicks(text) });
    await letBrowserPaint();
  }
  text += decoder.decode();
  const reply = JSON.parse(text) as GuideReply;
  if (!Array.isArray(reply.picks)) throw new Error('The guide returned an unreadable reply.');
  return reply;
}

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
    panel.setAttribute('aria-busy', 'true');
    panel.dataset.streamUpdates = '0';
    panel.innerHTML = `<p class="kicker">The guide</p><p class="guide-status">Reading ${all.length} tools for “${esc(q)}”…</p>`;
    try {
      const res = await fetch(API, { method: 'POST', headers: { accept: 'application/json', 'content-type': 'application/json' }, body: JSON.stringify({ query: q }) });
      if (res.status === 429) throw new Error('The guide is busy right now — try again in a minute.');
      if (!res.ok) throw new Error('The guide is not available right now.');
      const data = await readRecommendationStream(res, ({ picks }) => {
        panel.dataset.streamUpdates = String(Number(panel.dataset.streamUpdates ?? 0) + 1);
        const received = picks.map((pick) => ({ e: bySlug.get(pick.slug), why: pick.why })).filter((pick) => pick.e) as { e: Entry; why: string }[];
        panel.innerHTML = `<p class="kicker">The guide</p><h3>Receiving tools for “${esc(q)}”</h3>
          <p class="guide-status">${received.length ? `${received.length} matching tool${received.length > 1 ? 's' : ''} received so far.` : 'The reply is arriving…'}</p>
          ${received.length ? `<ol class="ledger-grid pictures guide-grid">${received.map((pick) => card({ ...pick.e, why: pick.why, interest: pick.e.interest }, { showWhy: true })).join('')}</ol>` : ''}`;
      });
      const picks = data.picks.map((p) => ({ e: bySlug.get(p.slug), why: p.why })).filter((p) => p.e) as { e: Entry; why: string }[];
      panel.setAttribute('aria-busy', 'false');
      panel.innerHTML = `<p class="kicker">The guide</p><h3>${picks.length ? `${picks.length} tool${picks.length > 1 ? 's' : ''} for “${esc(q)}”` : 'Nothing in the catalogue fits that well yet'}</h3>
        ${data.note ? `<p class="ledger-lede">${esc(data.note)}</p>` : ''}
        <ol class="ledger-grid pictures guide-grid">${picks.map((p) => card({ ...p.e, why: p.why, interest: p.e.interest }, { showWhy: true })).join('')}</ol>
        <p class="ledger-foot"><button type="button" class="guide-close">Close</button> · picked by a model from the catalogue; it can be wrong. <a href="/catalog/">Browse the whole catalogue</a> for the full list.</p>`;
      panel.querySelector('.guide-close')?.addEventListener('click', () => { panel.hidden = true; });
    } catch (err) {
      panel.setAttribute('aria-busy', 'false');
      panel.innerHTML = `<p class="kicker">The guide</p><p class="guide-status">${esc((err as Error).message)}</p>`;
    } finally { busy = false; btn.disabled = false; }
  };
  btn.addEventListener('click', ask);
  form.addEventListener('submit', (ev) => { ev.preventDefault(); if (input.value.trim().split(/\s+/).length >= 3) void ask(); else input.focus(); });
  input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && input.value.trim().split(/\s+/).length >= 3) { ev.preventDefault(); void ask(); } });
}
