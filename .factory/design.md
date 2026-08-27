# Hello Factory visual thesis

## Direction

**Surreal editorial: a dawn signal station.** The factory is presented as a lighthouse rather than a robot or assembly line: it finds a real need, maintains a disciplined beam, and releases small navigable objects into the world. Editorial typography and slightly imperfect frames keep it thoughtful and human; the generated hero is explanatory, not filler.

The desktop layout uses a wide editorial split. On phones it drops one secondary navigation link, stacks the art after the promise, and removes non-essential step medallions so the sequence stays calm at 390 px.

## Tokens

- Paper `#F3EEE4` / paper-deep `#E7DECD`: warm dawn haze and primary surfaces.
- Ink `#162D34`: deep blue-green water, all primary text, and the single-mode dark passages.
- Muted ink `#4D6265`: secondary copy (above 4.5:1 on paper).
- Signal coral `#C84F39`, dark variant `#9F3424`: lighthouse signal and focused accents.
- Dawn gold `#EFB95E`: the live-floor band.
- Sea glass `#80A7A5`: restrained atmospheric secondary color.
- White `#FFFAF0`: text on ink.

The thesis is intentionally single-mode: a fixed dawn-to-night narrative would lose meaning if automatically inverted. Every surface is painted explicitly.

## Type and spacing

- Display: system serif (`Georgia`, `Times New Roman`) for an editorial, field-note quality.
- Interface/body: system sans (`Inter` where installed, then `system-ui`) for fast rendering and clarity.
- Technical evidence: system monospace for time, sequence numbers, and artifact labels.
- Type runs from 12 px annotations through a fluid 109 px hero; body copy is 16–20 px with 1.55–1.6 leading.
- Spacing follows a 4/8 px rhythm, with generous 64–168 px section pauses. Reading measures stay below roughly 70 characters.

## Interaction and motion

Links use underlines or structural rules rather than pill buttons. The loop reads as a ledger with evidence moving top to bottom. Content enters once with an 18 px rise and 650 ms opacity/transform transition. `prefers-reduced-motion` removes movement and reveals everything immediately. Focus rings are 3 px signal coral with a 4 px offset. Interactive targets are at least 44 px tall.

## Hero art direction and provenance

- Use case: `stylized-concept`; asset: responsive landing-page hero.
- Subject/world: a solitary lighthouse made from stacked, luminous browser windows, standing in a completely calm sea at dawn.
- Materials: frosted glass, pale stone, subtle metal frames, tactile editorial grain.
- Light/lens: wide 35 mm-like view, low dawn light, long coral reflection, quiet mist, generous air around the tower.
- Palette words: parchment sky, deep teal water, sea-glass mist, signal coral, restrained dawn gold.
- Negative list: no people, boats, birds, readable text, UI labels, logos, brands, watermark, extra towers, dramatic storm, neon cyberpunk treatment.

Final prompt: “Surreal editorial illustration for a sophisticated software studio landing page. A solitary lighthouse made entirely from neatly stacked browser windows and pale stone rises from a glass-still sea at dawn. The browser-window layers glow softly like floors in a beacon, with abstract panes and absolutely no readable interface text. Wide cinematic 3:2 composition, slightly low horizon, quiet negative space, restrained tactile grain, subtle cut-paper and painterly texture, believable reflections, calm and purposeful rather than whimsical. Parchment sky, deep teal water, sea-glass mist, signal-coral beacon, restrained dawn-gold light. No people, boats, birds, words, letters, numbers, logos, brands, watermark, extra towers, storm, or neon cyberpunk styling.”

- Generator: Azure AI Foundry factory image deployment via `/opt/fleet/lib/gen-image.sh`.
- Generated: 2026-08-27; original PNG retained at `assets/src/hero-lighthouse.png` with `hero-lighthouse.prompt.json` sidecar.
- License/provenance: original machine-generated imagery created specifically for Hello Factory; disclosed in the footer. No reference images or copyrighted characters used.
