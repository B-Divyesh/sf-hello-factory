# Hello Factory repair handoff

Date: 5 September 2026

Live URL: <https://hello-factory.sociobot.in>

Implementation revision: `e70d1d3aabacc87487725f51ec5d4f7927448b2e`

Documentation revision: the repository HEAD containing this handoff; it is report-only and was not redeployed.

## Outcome

Hello Factory now publishes the controller snapshot during every build and presents its catalogue states honestly. The first screen tells a visitor that this is a public tool catalogue, who it is for, and to try the filled sample first.

- The Games shelf and `kind=game` filter use the same normalized `kind` field. Both contain 25 entries in the published snapshot.
- Missing kinds receive deterministic artifact defaults. Missing or unknown categories become **Not yet shelved**.
- QA badges distinguish **QA passed**, **QA in progress**, and **QA changes required**. Exact controller dates appear where supplied; missing dates are named as missing.
- **Just released** includes `RELEASED` and `VERIFYING`, prioritizes items still being checked, and excludes `POLISHING`.
- The build publishes `products.json`, 601 detail records, 601 physical product routes, the sitemap, and all 677 supplied pictures.
- The one-click `/demo/` route has six realistic game-night entries, a persistent sample label, reset and exit actions, and no persistent storage.
- Privacy, terms, route metadata, designed 404 handling, keyboard focus, reduced motion, and responsive layouts are complete.

The established paper-and-ink visual identity and existing product pictures were preserved. The social preview is a hand-authored composition described in `.factory/design.md`.

## Controller snapshot

- Source generated: `2026-09-05T19:25:37.810080Z`
- Tracked input: `.factory/input/latest-catalog.json`
- SHA-256: `554aacd5a7f74f12fd791f328ea0023444bd362e6ffa431a818a06ca384da29f`
- Catalogue: 601 products and 601 detail records
- States: 313 `RELEASED`, 75 `VERIFYING`, 213 `POLISHING`
- Supplied pictures: 677; 574 belong to current products and 103 historical pictures remain preserved
- Source omissions: 48 kinds and 48 categories. Build defaults resolve every omission without changing snapshot descriptions.

`scripts/fetch-catalog.sh` fetches only the authorized controller blob. `scripts/catalog-data.mjs` accepts pictures only from this product or the exact `hello-factory-repair-1/input/shots` prefix. Credentials are neither printed nor stored.

## Verification

From a clean clone of the implementation revision:

```sh
npm ci --ignore-scripts
npm test
npm run build
```

- Unit suite: 13 passed.
- Browser suite: 16 passed, including axe checks on landing, catalogue, demo, privacy, terms, 404, and a product route.
- Every one of the nine commands in `.factory/claims.json` passed independently from `/tmp/hello-factory-final-kQLbPF`.
- Clean build published 601 catalogue entries and preserved 677 pictures.
- `dist/` application assets: 24.09 KB CSS and 24.87 KB JavaScript before gzip across all route chunks; each route loads only its needed chunks.

After deploying the implementation revision to the existing `sf-hello-factory` production Static Web App:

- `/opt/fleet/lib/verify-url.sh` returned HTTPS 200, one H1, one main landmark, valid language/title/alt text, and no console errors.
- Fresh desktop and phone contexts showed the job, audience, and **Try it with sample data** before scrolling, with no horizontal overflow or external request.
- The live sample loaded six entries, showed the persistent sample label, recovered from a no-results boundary, reset to six, exited to `/catalog/`, and left cookies, local/session storage, and IndexedDB empty.
- Live axe scans found zero serious or critical issues on all six checked routes.
- The designed unknown route returned the expected HTTP 404 with its correct title and H1.
- Mobile Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.0 s, CLS 0, TBT 30 ms.
- Lighthouse transferred 7,275 bytes of JavaScript, 5,953 bytes of CSS, and 67,600 bytes of images on first load.

Evidence is in `.factory/evidence/live-final/`. Detailed finding disposition is in `.factory/repair-verification.md`.

## Deployment

The generated `dist/` directory was deployed to the existing production environment for `sf-hello-factory`. No DNS, billing, shared service, database, or other product was read or changed. This product is a read-only static catalogue, so SQLite, restart persistence, tenant isolation, and backend 429 behavior do not apply.

## Known dependencies and gaps

- The optional guide depends on the existing `api.sociobot.in/api/v1/products/recommend` endpoint. Catalogue search, browsing, details, and the sample do not depend on it; the UI gives a local fallback when it fails.
- Twenty-seven current products have no supplied picture. They use the existing typographic placeholder; no picture was invented.
- Forty-eight source rows were not assigned a curated shelf. They are shown honestly under **Not yet shelved**.
- Offline use is not promised and no service worker is installed.

## Independent verification 2

Date: 5 September 2026

Implementation reviewed: `e70d1d3aabacc87487725f51ec5d4f7927448b2e`
Documentation reviewed: `39306eaf5e9f45868ffb2d6e90c25934b750c0db`

**PASS — 0 findings and 0 untested public claims.**

An independent verifier used a fresh clone, ran `npm ci`, `npm test`, `npm run build`, and every one of the nine claim commands separately. The unit suite passed 13 tests and the browser suite passed 16 tests.

Fresh live desktop and phone contexts showed the job, audience, and **Try it with sample data** before scrolling. The live demo loaded six sample entries, kept its persistent label, reset, exited to the real catalogue, and left cookies and browser storage empty. The URL verifier found HTTPS 200, no console errors, valid language/title structure, one H1, one main landmark, image alternatives, and labeled buttons. Axe found no serious or critical issues on the landing, catalogue, demo, legal, 404, and product routes. The designed unknown route correctly returned HTTP 404.

Fresh mobile Lighthouse measured 100 performance, 100 accessibility, 100 best practices, and 100 SEO (LCP 0.91 s, CLS 0, TBT 7 ms). Earlier repair findings, including catalogue truth, QA states, first-screen clarity, sample isolation, legal routes, and accessibility, were all verified as fixed. The full report is `.factory/verification-2.md`.
