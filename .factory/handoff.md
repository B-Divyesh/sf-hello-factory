# Hello Factory repair 4 handoff

Date: 5 September 2026

Live URL: <https://hello-factory.sociobot.in>

Implementation: `e57b69b709c9de89fd8cd5433e6e4749d1c0d375`

Documentation and evidence: the commit containing this handoff, after the implementation commit above

Deployed source pin: `a2a1712f4ead38b24a214cf207e65fcfeeb8b74a0a873c5fd4dc1d37d68721f3`

## Outcome

All five Verification 4 findings and its untested sample-state claim are fixed. The production deployment uses the unchanged immutable pin: 527 products, 527 details, 527 current pictures, 707 preserved pictures, and 532 sitemap locations. A full live comparison found no record, route, picture, or sitemap mismatch.

| Finding | Repair and outcome evidence |
| --- | --- |
| V4-01 sample QA statement | `.factory/demo.md` now states the actual pinned sample: six released game tools with passed QA. `@claim:demo-sandbox` checks all six rendered QA badges, as well as entry, reset, exit, storage, and request isolation. The live sample showed six passed badges and no in-progress or changes-required badge. |
| V4-02 long route metadata | Product metadata is shortened at a word boundary while controller titles and descriptions remain unchanged in the published records and visible H1. Unit coverage checks every pinned row. Live checks covered all 33 affected routes; the longest title was 60 characters and the longest description was 152. |
| V4-03 missing footer job sentence | Every standard route now says: “Find a focused tool for a specific job, compare its QA state, and open it at its own address.” A browser regression and live route sweep cover home, catalogue, sample, product, privacy, terms, and 404 pages. |
| V4-04 guide output waited for full JSON | The guide now reads the response body as a stream, parses complete picks as chunks arrive, and updates its live region before the response finishes. `@claim:guide-stream` uses a two-chunk recorded response and proves the first result is exposed before the stream closes. The live action made one explicit request and returned five populated results. |
| V4-05 stale copy count | The audit now records 527 products, 507 non-empty `why` lines, and a 20-word maximum from the pin. A regression compares those numbers and the recorded source hash with the pinned file. |

## User paths checked live

Fresh 1366×900 and 390×844 contexts showed the job, audience, and **Try it with sample data** action before scrolling, without horizontal overflow. The sample opened in one click, retained its **Demo — sample data, nothing is saved** label, showed realistic populated output, recovered from an empty search, reset to six entries, exited to the real catalogue, and left cookies, local storage, session storage, IndexedDB, and real catalogue bytes unchanged.

Normal catalogue search, all affected product metadata routes, all standard footers, privacy, terms, and the designed HTTP 404 were checked. The deliberate unknown-route 404 is expected and is classified separately in the browser report. The live catalogue comparison fetched all 527 details and physical routes plus all 707 preserved WebP pictures.

The live guide sent nothing before its button was chosen, then made one request to the documented Sociobot endpoint. It returned five useful results. Normal browsing and the sample remained same-origin.

## Verification

From a fresh GitHub checkout of `e57b69b` with Node.js 20 or newer:

```sh
npm ci --ignore-scripts
npm test
npm run build
npm run catalog:verify
```

Results:

- Dependency install: 61 packages, 0 vulnerabilities.
- `npm test`: 21 unit tests and 18 browser/Axe tests passed.
- Every one of the 11 commands in `.factory/claims.json` passed independently.
- Production build: 24.33 KB CSS; all emitted JavaScript chunks are small, and Lighthouse measured 7,957 transferred script bytes.
- Catalogue verifier: 527 products/details/current pictures and 707 preserved pictures; source SHA matched; images verified.
- `/opt/fleet/lib/verify-url.sh`: HTTPS 200, no unexpected console errors, correct title/language/landmarks, no missing image alternatives, and no unnamed buttons.
- Live Axe scans: zero WCAG A/AA violations on seven representative routes.
- Mobile Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.03 s, CLS 0, TBT 80.5 ms.
- Security headers include CSP, HSTS, `Referrer-Policy`, and `X-Content-Type-Options`.

## Evidence

- `.factory/evidence/repair-4-live/verify.json`
- `.factory/evidence/repair-4-live/browser-report.json`
- `.factory/evidence/repair-4-live/catalog-report.json`
- `.factory/evidence/repair-4-live/lighthouse.json`
- `.factory/evidence/repair-4-live/desktop-first-screen.png`
- `.factory/evidence/repair-4-live/phone-first-screen.png`
- `.factory/evidence/repair-4-live/phone-demo.png`

## Known limits

Hello Factory does not promise offline use, accounts, payments, or a product backend, so update installation, tenant isolation, restart persistence, health, and product-owned 429 checks do not apply. The optional guide depends on `api.sociobot.in`; catalogue search remains available when it fails. Ordinary builds deliberately remain on the immutable pin until an authorised worker runs the explicit refresh command.
