# Hello Factory strict review 1

**Verdict: PASS**

Date: 6 September 2026  
Live URL: <https://hello-factory.sociobot.in>  
Implementation reviewed: `7c95ca094e10b5a38fcdcd49d053573f33d132ef`  
Documentation reviewed: `acc075226c1722581c9d08370af9c75ee44e46f2`

Finding count: **0**  
Untested public-claim count: **0**

The implementation candidate is `7c95ca0`; later commits through `acc0752`
are report-only. This review did not change product code, the immutable source
pin, source records, or pictures.

## First screen and sample

Fresh desktop (1366×900) and phone (390×844) browsers opened the live landing
page without scrolling. Both showed:

- Job: **Find a small tool for a specific job**.
- Audience: people with a task to finish who need a matching public catalogue
  tool.
- First action: **Try it with sample data**; it opens a filled game-night
  search.

Neither viewport overflowed horizontally or produced console errors. The
one-click sample displayed six game tools, all with **QA passed**, and retained
the persistent **Demo — sample data, nothing is saved** label. An impossible
search showed its recovery state; **Reset demo** restored `plan a game night`
and six cards; **Start for real** removed the label and opened the catalogue.
Cookies, local storage, session storage, and IndexedDB remained empty before
and after the demo. Its requests were same-origin.

The forced guide connection failure said **The guide could not connect. Try
again, or search the catalogue instead.** It offered the catalogue link and
re-enabled **Ask the guide**. It did not expose the raw fetch error.

## Commands and claims

From the clean checkout, `npm ci --ignore-scripts` completed with zero
vulnerabilities. The following passed:

- `npm test`: 21 unit tests and 20 browser/Axe tests.
- `npm run build`: produced the complete pinned `dist/` artifact.
- `npm run catalog:verify`: 527 products and details, 527 current pictures,
  707 preserved pictures, and `imagesVerified: true`.

Each of the 11 commands in `.factory/claims.json` was run separately and
passed: demo sandbox, local search, account-free browsing, free browsing,
privacy defaults, explicit guide sending, streamed guide matches, QA verdicts,
catalogue truth, pinned snapshot, and snapshot pictures. The landing, demo,
privacy, terms, README, and claim manifest were cross-checked; no public claim
lacks a test.

## Live catalogue and routes

The clean build and live site agree on immutable source SHA-256
`a2a1712f4ead38b24a214cf207e65fcfeeb8b74a0a873c5fd4dc1d37d68721f3`,
generated `2026-09-05T21:44:42.977830Z`, with 358 released, 20 verifying, and
149 polishing records.

- All 527 live product JSON records were byte-identical to the clean build.
- All 527 live product routes returned HTTP 200.
- All 707 live picture files were byte-identical WebP responses.
- All 532 sitemap locations returned HTTP 200.
- Home, catalogue, demo, privacy, terms, and 404 have titles, descriptions,
  canonicals, Open Graph data, and Twitter large-card data.
- The longest controller title (`how-it-runs`) keeps its complete visible H1;
  its rendered route title and description are bounded, and its dynamic social
  metadata is route-specific.
- An unknown route deliberately returned HTTP 404 with the designed catalogue
  recovery page. This is expected behavior, not a finding.

## Accessibility, privacy, and recovery

`verify-url.sh` passed HTTPS 200, no console errors, title, `lang="en"`, one
H1, main landmark, complete image alternatives, and named buttons. Fresh Axe
WCAG 2/2.1 A/AA scans had zero violations on home, catalogue, demo, privacy,
terms, 404, and a product route. Keyboard focus began at the skip link with a
3 px outline. The reduced-motion home showcase remained still after more than
one idle interval. Normal browsing made no third-party request and stored no
browsing data; the optional guide is explicit about its Sociobot request.

## Earlier finding disposition

| Finding | Current disposition |
| --- | --- |
| V3 source/pin and reproducible-build findings | Remain fixed: the retained pin builds and every checked live record, route, and picture matches it. |
| V4 sample truth, metadata length, footer, stream, and copy-audit findings | Remain fixed under the sample flow, bounded dynamic metadata, footer checks, stream claim, and current audit regression. |
| V5 social metadata | Fixed on every standard route and the live dynamic product route. |
| V5 guide raw network error | Fixed: clear recovery copy, retry, and catalogue fallback work. |
| Catalogue membership, QA badges, legal, 404, focus, target size, privacy, and picture findings | Remain fixed under the declared claims, full browser suite, live crawl, and fresh accessibility checks. |

## Evidence

- `/work/.evidence/hello-factory-review-1/verify.json`
- `/work/.evidence/hello-factory-review-1/live-browser.json`
- `/work/.evidence/hello-factory-review-1/live-artifact.json`
- `/work/.evidence/hello-factory-review-1/axe-metadata.json`
- `/work/.evidence/hello-factory-review-1/desktop-first-screen.png`
- `/work/.evidence/hello-factory-review-1/phone-first-screen.png`
- `/work/.evidence/hello-factory-review-1/phone-demo.png`

**PASS — zero findings and zero untested public claims.**
