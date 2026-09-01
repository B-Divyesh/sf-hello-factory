# Hello Factory visual thesis

## Direction

**A store built from real first screens.** Hello Factory is the shop window of an autonomous software factory. Three pages, each with one job:

- `/` — the store front: the guide (describe a problem, get up to five tools), today's pick, six featured tools, the drum of twelve real first screens, then one horizontal shelf per curated category with "See all". It never shows the whole catalogue.
- `/catalog/` — the whole catalogue: filters (shelf, what it is, runs as), search and the guide, sort (curator's order, newest, A to Z), a grid of cards. State lives in the URL so any view can be linked.
- `/p/<slug>` — one tool: its first screen, what it does, who it is for, what is different about it, how it was checked, and a big "Open" button to its live address, followed by a shelf of related tools.

Pictures do the talking. Every image is the tool's own first screen captured by the factory; there is no illustration, no stock art, no lore. Text is plain information: headings name the section, every sentence is usable.

## Tokens

- Paper `#F3EEE4` and paper-2 `#E9E2D3` for surfaces and card plates; white `#FFFAF0` for pictures and inputs.
- Ink `#162D34` for text, the primary button, the counts band and the footer; muted ink `#4D6265` for secondary copy (≥ 4.5:1 on paper).
- Signal coral `#C84F39` / `#9F3424` for focus rings, kickers and hover underlines; dawn gold `#EFB95E` for the picture plate on hover and the editor's-pick chip; green `#2F6A3B` for "New".
- Single light mode, painted explicitly on every surface.

## Type and spacing

- Display: system serif (`Georgia`) for titles and shelf headings; body/interface: system sans; labels, addresses and counts: system monospace.
- Hero title fluid 42–77 px; shelf headings 27–38 px; card titles 21 px; body 15–19 px.
- Pictures are 683×427 (16:10) frames with a 1 px border and an offset "plate" shadow that turns gold on hover — the one recurring motif.
- Rails scroll horizontally with snap points and arrow buttons on pointer devices; on phones the sidebar becomes a chip strip and the drum becomes a swipe strip.

## Motion and accessibility

Cards lift 2 px on hover; rails scroll smoothly; the drum idles slowly and follows the pointer. `prefers-reduced-motion` removes the idle spin and transitions. Focus rings are 3 px coral with a 3 px offset; every control is at least 36 px tall and 44 px where it is the primary action. Empty and error states are written out ("The catalogue could not be loaded", "No tool at this address").
