# Verify Hello Factory live catalogue

**Verdict: PASS**

Date: 6 September 2026
Live URL: <https://hello-factory.sociobot.in>
Implementation reviewed: `7c95ca094e10b5a38fcdcd49d053573f33d132ef`
Documentation reviewed: `7fe82492606ebf295ef6d839dcab09bbaed288b9`

Finding count: **0**
Untested public-claim count: **0**

The documentation commit changes only `.factory/handoff.md`; the implementation candidate is `7c95ca0…`. The fresh live artifact agrees byte-for-byte with a clean build of that candidate's pinned catalogue output.

## First screen and sample

Fresh 1366×900 desktop and 390×844 phone contexts opened the live landing page without scrolling.

- Job: **Find a small tool for a specific job**.
- Audience: people with a task to finish who need a matching public catalogue tool.
- First action: **Try it with sample data**; it opens a filled search for planning a game night.

All three were visible in both screenshots. There was no horizontal overflow. The sample opened in one click, displayed six released game tools with passed QA, retained **Demo — sample data, nothing is saved**, and showed a specific no-result state. Reset restored `plan a game night` and six cards. **Start for real** removed the demo label and opened the actual catalogue.

The fresh demo context retained no cookies, local storage, session storage, IndexedDB database, or service worker. Its requests were same-origin, and no real catalogue data changed.

## Verification commands and public claims

A fresh GitHub checkout at `7fe8249…` was clean before and after verification. `npm ci --ignore-scripts` installed 61 packages with zero vulnerabilities.

- `npm test`: PASS — 21 unit tests and 20 browser/Axe tests.
- `npm run build`: PASS — produced `dist/` from the immutable pin, including all picture files.
- `npm run catalog:verify`: PASS — 527 products, 527 details, 527 current pictures, 707 preserved pictures, and `imagesVerified: true`.

Every declared claim command was rerun independently:

| Claim | Command | Result |
| --- | --- | --- |
| Sample fills, resets, exits, and saves nothing | `npm run test:browser -- --grep @claim:demo-sandbox` | PASS |
| Search words stay in the browser | `npm run test:browser -- --grep @claim:local-search` | PASS |
| Browsing needs no account | `npm run test:browser -- --grep @claim:account-free` | PASS |
| Browsing costs £0 | `npm run test:browser -- --grep @claim:free-browse` | PASS |
| No cookies, search history, or analytics | `npm run test:browser -- --grep @claim:privacy-defaults` | PASS |
| Guide sends words only after the action | `npm run test:browser -- --grep @claim:guide-explicit` | PASS |
| Guide exposes complete matches before stream close | `npm run test:unit -- --testNamePattern @claim:guide-stream` | PASS |
| QA badges show controller verdicts and dates | `npm run test:browser -- --grep @claim:qa-verdicts` | PASS |
| Catalogue facts match the source snapshot | `npm run test:browser -- --grep @claim:catalogue-truth` | PASS |
| Ordinary builds retain the pin | `npm run test:unit -- --testNamePattern @claim:pinned-snapshot` | PASS |
| Current rows preserve pictures and source records | `npm run test:unit -- --testNamePattern @claim:snapshot-pictures` | PASS |

The landing, demo, privacy, terms, README, claim manifest, copy audit, and demo contract were cross-checked. No public claim lacks a declared test.

## Live artifact and route checks

The live source and clean build both report:

- Immutable source SHA-256: `a2a1712f4ead38b24a214cf207e65fcfeeb8b74a0a873c5fd4dc1d37d68721f3`
- Generated: `2026-09-05T21:44:42.977830Z`
- 527 products and detail records; 527 current pictures; 707 preserved pictures
- 358 released, 20 verifying, and 149 polishing records
- 532 sitemap locations

The live `products.json`, `catalog-build.json`, and sitemap are byte-identical to the clean production build. All 527 live detail JSON files and all 707 picture files are byte-identical to their clean-build files. All 527 product routes returned HTTP 200.

The repaired social metadata is present and route-specific on home, catalogue, demo, privacy, terms, 404, and product pages: title, description, canonical, Open Graph title/description/URL/image, and Twitter large-card fields. The social image is the real 1200×630 product image. Every computed product title is at most 60 characters, every computed description is at most 155, and the visible product H1 remains the complete controller title.

Normal search, filters, sorting, product navigation, and legal links worked. An empty search gives a useful next step. A deliberately aborted guide request now says **The guide could not connect. Try again, or search the catalogue instead.** It provides the catalogue link and re-enables retry; the raw exception is not shown. An invalid product reports **No tool at this address.** An unknown route deliberately returns HTTP 404 with the designed recovery page; that expected response is not a finding. The 15 static same-origin links and the 532 sitemap locations returned successfully. External product destinations were not opened because they are outside this product work order.

Offline and update installation are not promised. This static catalogue has no accounts, payments, product backend, tenant state, health endpoint, or product-owned rate-limit path to exercise.

## Accessibility, privacy, security, and performance

`/opt/fleet/lib/verify-url.sh` passed the live home page: HTTPS 200, no console errors, title, `lang="en"`, one H1, main landmark, complete image alternatives, and named buttons. Fresh Axe WCAG 2/2.1 A/AA scans found zero violations on home, catalogue, demo, privacy, terms, 404, and a product route.

Keyboard smoke tests confirmed the first-focus skip link and a 3 px visible focus ring. The sample action is keyboard-operable. At 390 px and at 200% text there was no horizontal overflow; checked controls meet the 44 px target. Reduced motion keeps the showcase still. There is no flashing or autoplay media.

Normal browsing made no third-party request, created no browser storage, and sent no search words. The guide sends one request to Sociobot only after its explicit button. The live response supplies CSP with response-header `frame-ancestors`, HSTS, `Referrer-Policy`, and `X-Content-Type-Options`.

A fresh valid mobile Lighthouse run scored **100 performance, 100 accessibility, 100 best practices, and 100 SEO**. LCP was 0.96 s, CLS was 0, and TBT was 40 ms. The production output contains 27.6 KB JavaScript and 24.3 KB CSS before gzip.

## Earlier finding disposition

| Finding | Current disposition |
| --- | --- |
| V3-01 live deployment did not match the documented snapshot | Fixed: the complete live artifact now matches the immutable pin and clean build. |
| V3-02 normal production build could use changing input | Fixed: the clean build reproduced the pin without a refresh. |
| V4-01 sample QA-state statement and coverage | Fixed: the six sample rows are released games with passed QA, and the claim proves it. |
| V4-02 over-limit route metadata | Fixed: all generated product metadata is bounded while source records and H1s remain complete. |
| V4-03 missing footer job sentence | Fixed on all standard routes. |
| V4-04 non-streaming guide | Fixed: the stream claim passes and live guide output updates incrementally. |
| V4-05 stale copy-audit number | Fixed: the audit regression matches 527 products and 507 non-empty `why` lines. |
| V5-01 missing route social metadata | Fixed on every checked standard route and loaded product route. |
| V5-02 raw guide network error | Fixed: recovery copy, retry, and catalogue fallback work. |
| Earlier catalogue membership, state badges, legal, 404, focus, target-size, privacy, and pin/image findings | Remain fixed under the clean build, claim suite, live route checks, and fresh accessibility checks. |

## Evidence

- `/work/.evidence/hello-factory-verify-6/verify.json`
- `/work/.evidence/hello-factory-verify-6/desktop-first-screen.png`
- `/work/.evidence/hello-factory-verify-6/phone-first-screen.png`
- `/work/.evidence/hello-factory-verify-6/desktop-demo.png`
- `/work/.evidence/hello-factory-verify-6/lighthouse-retry.json`

No product code, source record, pin, or picture was modified during this verification.
