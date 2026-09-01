import { esc, KIND, type Entry } from './ledger';
/* A drum of real first screens — a film-canister carousel. Idle: slow spin. Hover: pointer position flicks through
   the drum. Drag / arrow keys / focus also rotate. Click: open that product in the catalogue. Reduced motion:
   no idle spin, arrows only. Narrow screens: a horizontal scroll strip instead of 3D. */
export function mountDrum(root: HTMLElement, items: Entry[]): void {
  const n = items.length; if (n < 3) { root.hidden = true; return; }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.innerHTML = `<div class="drum-stage" tabindex="0" aria-roledescription="carousel" aria-label="Showcase of ${n} tools">
      <ul class="drum">${items.map((e, i) => `<li class="drum-card" style="--i:${i}"><a href="/p/${encodeURIComponent(e.slug)}" aria-label="${esc(e.title)} — open its page">
        ${e.image ? `<img src="${esc(e.image)}" alt="" width="683" height="427" loading="${i < 6 ? 'eager' : 'lazy'}" decoding="async">` : `<span class="shot-empty"><b>${esc(e.title.slice(0, 1))}</b></span>`}
        <span class="drum-cap"><strong>${esc(e.title)}</strong><span>${esc(e.why || KIND[e.class] || '')}</span></span></a></li>`).join('')}</ul>
    </div>
    <div class="drum-nav"><button type="button" class="drum-btn" data-dir="-1" aria-label="Previous">←</button><span class="drum-count" aria-live="polite"></span><button type="button" class="drum-btn" data-dir="1" aria-label="Next">→</button></div>`;
  const stage = root.querySelector<HTMLElement>('.drum-stage')!; const drum = root.querySelector<HTMLElement>('.drum')!;
  const cards = [...root.querySelectorAll<HTMLElement>('.drum-card')]; const count = root.querySelector<HTMLElement>('.drum-count')!;
  const step = 360 / n; let radius = 0;
  const layout = (): void => { const w = cards[0].offsetWidth || 340; radius = Math.round(w / 2 / Math.tan(Math.PI / n)) + 28; cards.forEach((c, i) => { c.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`; }); };
  let angle = 0, target = 0, hover = false, dragging = false, dragX = 0, dragStart = 0, last = performance.now(), idle = reduce ? 0 : 5.5; // deg/s
  const front = (): number => ((Math.round(-angle / step) % n) + n) % n;
  const paint = (): void => {
    drum.style.transform = `translateZ(${-radius}px) rotateY(${angle}deg)`;
    cards.forEach((c, i) => { const rel = ((i * step + angle) % 360 + 540) % 360 - 180; const k = Math.cos(rel * Math.PI / 180); c.style.opacity = String(0.25 + 0.75 * Math.max(0, (k + 0.25) / 1.25)); c.style.zIndex = String(Math.round(100 + k * 100)); c.classList.toggle('is-front', Math.abs(rel) < step / 2); });
    const f = front(); count.textContent = `${f + 1} / ${n} · ${items[f].title}`;
  };
  const tick = (now: number): void => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!hover && !dragging) target -= idle * dt;
    angle += (target - angle) * (dragging ? 0.5 : 0.12);
    paint(); requestAnimationFrame(tick);
  };
  stage.addEventListener('pointerenter', () => { hover = true; });
  stage.addEventListener('pointerleave', () => { hover = false; dragging = false; });
  stage.addEventListener('pointermove', (ev) => {
    const r = stage.getBoundingClientRect();
    if (dragging) { target = dragStart + (ev.clientX - dragX) * 0.35; return; }
    // flick-through: the pointer's position across the stage scrubs the drum by up to ±1.5 cards
    const x = (ev.clientX - r.left) / r.width - 0.5; target = Math.round(angle / step) * step + (-x) * step * 3;
  });
  stage.addEventListener('pointerdown', (ev) => { dragging = true; dragX = ev.clientX; dragStart = target; stage.setPointerCapture(ev.pointerId); });
  stage.addEventListener('pointerup', (ev) => { if (dragging && Math.abs(ev.clientX - dragX) > 6) { ev.preventDefault(); } dragging = false; target = Math.round(target / step) * step; });
  root.addEventListener('click', (ev) => { if (Math.abs((ev as MouseEvent).clientX - dragX) > 6 && (ev.target as HTMLElement).closest('.drum-card')) ev.preventDefault(); });
  root.querySelectorAll<HTMLButtonElement>('.drum-btn').forEach((b) => b.addEventListener('click', () => { target = Math.round(target / step) * step - Number(b.dataset.dir) * step; }));
  stage.addEventListener('keydown', (ev) => { if (ev.key === 'ArrowLeft') { target = Math.round(target / step) * step + step; ev.preventDefault(); } if (ev.key === 'ArrowRight') { target = Math.round(target / step) * step - step; ev.preventDefault(); } });
  cards.forEach((c, i) => c.querySelector('a')!.addEventListener('focus', () => { target = -i * step; }));
  addEventListener('resize', layout); layout(); paint(); requestAnimationFrame(tick);
}
