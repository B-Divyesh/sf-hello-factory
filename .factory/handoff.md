# Hello Factory repair 3 handoff

Date: 5 September 2026

Live URL: <https://hello-factory.sociobot.in>

Implementation deployed: `baf5a314c4c9241ea008bd353269cf5f4f553aca`

Documentation report commit: `4e215f188af45635756dae57c5e8c043faaa7b25`

## Outcome

**PASS — V3-01 and V3-02 fixed.** The live catalogue, its retained source, and
the documented build all identify the same complete controller snapshot.

## Published controller source

- Raw SHA-256: `a2a1712f4ead38b24a214cf207e65fcfeeb8b74a0a873c5fd4dc1d37d68721f3`
- Generated: `2026-09-05T21:44:42.977830Z`
- Products and details: 527 each
- Current pictures: 527; preserved pictures: 707
- States: 358 `RELEASED`, 20 `VERIFYING`, 149 `POLISHING`
- Pin: `.factory/input/catalog-pin.json`
- Exact raw input: `.factory/input/snapshots/a2a1712f4ead38b24a214cf207e65fcfeeb8b74a0a873c5fd4dc1d37d68721f3.json`

The local `latest-catalog.json` is the controller pointer captured during the
explicit refresh. It has the same raw SHA as the pinned retained source. The
normal build and verifier resolve only the pin; they do not fetch that moving
pointer.

## Repairs

| Finding | Disposition | Evidence |
| --- | --- | --- |
| V3-01: live source differed from the documented source | Fixed | Live `/catalog-build.json`, `products.json`, all 527 details and physical routes, sitemap, and all 707 local WebPs match the pinned source SHA above. |
| V3-02: ordinary clean builds fetched changing inputs | Fixed | `npm run build` now runs Vite, then publishes and verifies the tracked immutable pin. Only `npm run catalog:refresh` or `npm run catalog:fetch` contacts the controller pointer. |
| Incomplete controller input could move a release | Fixed | Refresh validates every current picture before writing the pin. The regression keeps the old pin when a current product lacks a picture. |
| Earlier catalogue, QA, sample, privacy, route, target-size, keyboard, legal, 404, and accessibility findings | Still fixed | The clean suite and current live checks cover their normal, invalid, boundary, and recovery paths. |

The publisher still rejects a source that lacks a current picture. It does not
invent a picture or publish a placeholder. The controller source selected for
this deployment has no missing current pictures.

## How to run and verify

From a clean checkout with Node.js 20 or newer:

```sh
npm ci --ignore-scripts
npm test
npm run build
npm run catalog:verify
```

`npm run build` needs internet access and the authorized Azure session only for
controller-selected private picture inputs. It does not fetch a new controller
catalogue source. To intentionally select the next complete source, run:

```sh
npm run catalog:refresh
```

That command fetches the authorized latest pointer, validates all current
pictures, verifies the controller's immutable `snapshots/<SHA-256>.json` copy,
atomically moves the tracked pin, and publishes the selected source.

## Verification performed

- A fresh clone of implementation `baf5a31…` completed `npm ci --ignore-scripts`, all 18 unit tests, all 16 browser/Axe tests, a full `npm run build`, and `npm run catalog:verify`.
- All ten commands in `.factory/claims.json` passed separately from that clean clone. The new `@claim:pinned-snapshot` regression proves that a moved controller pointer cannot alter normal build output until explicit refresh.
- An explicit `npm run catalog:refresh` completed against the current controller input before deployment. It retained and pinned the source recorded above. A following ordinary build and verifier produced the same source SHA, counts, states, details, routes, sitemap, and 707 WebPs.
- The deployed artifact was checked over HTTPS. Its `catalog-build.json` has the pinned SHA, 527 products/details/current pictures, 707 preserved pictures, and the state totals above. A live comparison fetched every product JSON, physical product route, and preserved picture: 527 details, 527 routes, and 707 decodable WebPs passed. The sitemap has 532 expected locations. The designed unknown route returned HTTP 404 and its recovery page.
- Fresh 1366×900 desktop and 390×844 phone contexts showed the job **Find a small tool for a specific job**, the audience sentence for people with a task to finish, and **Try it with sample data** before scrolling. The sample opened in one click, showed six real game entries, kept its persistent label, handled no results, reset to six, exited to the real catalogue, stored nothing, and made only same-origin requests.
- Live keyboard, 44 px touch-target, 200% text, reduced-motion, and missing-product recovery checks passed. Normal load had no console errors. `/opt/fleet/lib/verify-url.sh` passed HTTPS, title, language, one H1, main landmark, image alternatives, and button names. Playwright Axe scans on landing, catalogue, sample, privacy, terms, 404, and product routes found no serious or critical WCAG A/AA violations.
- Mobile Lighthouse repeat: performance 98, accessibility 100, best practices 100, SEO 100; LCP 1.45 s, CLS 0, TBT 130 ms.

Evidence is retained under `/work/.evidence/hello-factory-repair3-live/`, including the fresh browser report, live source comparison, screenshots, URL verifier output, and Lighthouse JSON. `/work/.evidence/catalog-description.txt` is the required copy of the 94-character verb-first catalogue description.

## Remaining notes

There are no known product defects from this repair. Normal catalogue browsing remains account-free, local-first, and without analytics. The optional guide is the only external runtime dependency and sends text only after its explicit action. Offline installation, payment, accounts, and a product backend are not public features of this static catalogue. Full image publication depends on the existing authorized Azure session for controller-selected private image blobs; the source itself is tracked and reproducible without fetching a newer controller snapshot.

For the next catalogue update, use the explicit refresh command, inspect the new pin and full artifact, deploy that artifact, and update this handoff with its actual source SHA. Do not use an ordinary build as a refresh operation.
