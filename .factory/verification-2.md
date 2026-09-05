# Verify the public tool catalogue

**Verdict: PASS**

Date: 5 September 2026
Live URL: <https://hello-factory.sociobot.in>
Implementation reviewed: `e70d1d3aabacc87487725f51ec5d4f7927448b2e`
Documentation reviewed: `39306eaf5e9f45868ffb2d6e90c25934b750c0db`

Finding count: **0**
Untested public-claim count: **0**

The documentation commit changes only reports and evidence. The deployed product was therefore compared with implementation `e70d1d3…`.

## First screen

Fresh 1366×900 desktop and 390×844 phone browser contexts opened the live landing page before scrolling.

- Job: **Find a small tool for a specific job**.
- Audience: people with a task to finish who need a matching public factory tool.
- First action: **Try it with sample data**.

The headline, audience sentence, and action were visible on both viewports. Neither viewport had horizontal overflow. The phone and desktop captures were visually reviewed.

## Live user paths

- The first-screen sample link opened `/demo/` in one click.
- The persistent **Demo — sample data, nothing is saved** label was visible.
- Six realistic game-night entries appeared. A no-results search showed its empty state. **Reset demo** restored `plan a game night` and all six entries. **Start for real** opened `/catalog/` and removed the demo label.
- The demo context had zero cookies, local-storage entries, session-storage entries, and IndexedDB databases. It did not change real catalogue data.
- Keyboard Tab reached the skip link first and showed its 3 px focus outline. Enter activated the sample link. Reduced-motion coverage, route titles, unavailable catalogue recovery, unknown product recovery, and normal catalogue/product navigation passed in the browser suite.
- `/`, `/catalog/`, `/demo/`, `/privacy/`, `/terms/`, `/404.html`, and `/p/a11y-interaction-trace/` loaded with their expected titles and one H1. An unknown route returned HTTP 404 with the designed 404 page. This deliberate 404 is expected, not a defect.
- The first 80 distinct same-origin links found on the landing page, including legal, catalogue, filter, JSON, and product links, returned HTTP 200. The published `products.json` listed 601 products; every one of its 601 same-origin detail URLs returned HTTP 200.
- Normal browsing made no external resource requests. The optional guide remains the documented explicit Sociobot request after the user selects **Ask the guide**; its no-request-before-action and one-post-after-action behavior passed its recorded-fixture claim test.

## Accessibility, privacy, and delivery

`/opt/fleet/lib/verify-url.sh` reported HTTPS 200, no console errors, `lang="en"`, one H1, one main landmark, zero images without `alt`, and zero unlabeled buttons.

Fresh live axe scans found zero serious or critical WCAG 2/2.1 A/AA issues on `/`, `/catalog/`, `/demo/`, `/privacy/`, `/terms/`, `/404.html`, and `/p/a11y-interaction-trace/`.

The live response includes the declared CSP, `Referrer-Policy`, `X-Content-Type-Options`, and HSTS headers. Privacy and terms routes are present. Offline, accounts, payment, a backend, tenant isolation, restart persistence, and 429 behavior are not public product features, so backend and offline checks do not apply.

Fresh mobile Lighthouse completed with performance **100**, accessibility **100**, best practices **100**, and SEO **100**. Measured LCP was 0.91 s, CLS 0, and TBT 7 ms.

## Clean checkout and claims

A fresh clone at documentation revision `39306ea…` was clean. `npm ci` completed with no vulnerabilities. `npm test` passed all 13 unit tests and all 16 browser tests. `npm run build` passed and produced `dist/`.

Every declared command in `.factory/claims.json` was run separately from that clone:

| Claim | Declared command | Result |
| --- | --- | --- |
| Sample catalogue is filled, resets, and saves nothing | `npm run test:browser -- --grep @claim:demo-sandbox` | PASS |
| Catalogue search stays in the browser | `npm run test:browser -- --grep @claim:local-search` | PASS |
| No account is needed to browse | `npm run test:browser -- --grep @claim:account-free` | PASS |
| Browsing costs £0 | `npm run test:browser -- --grep @claim:free-browse` | PASS |
| No cookies, search history, or analytics | `npm run test:browser -- --grep @claim:privacy-defaults` | PASS |
| Guide sends words only after selection | `npm run test:browser -- --grep @claim:guide-explicit` | PASS |
| QA badges show controller verdicts and dates | `npm run test:browser -- --grep @claim:qa-verdicts` | PASS |
| Catalogue facts match the controller snapshot | `npm run test:browser -- --grep @claim:catalogue-truth` | PASS |
| Snapshot pictures remain local and match rows | `npm run test:unit -- --testNamePattern @claim:snapshot-pictures` | PASS |

The landing page, README, privacy page, and demo copy were cross-checked against `.factory/claims.json`. Public factual promises have matching declared claim coverage; no unlisted public claim was found.

## Earlier findings

The earlier verification report had no defects. The repair report's earlier and minor findings were all retested and remain fixed:

| Earlier finding | Current disposition |
| --- | --- |
| Games shelf and game filter differed | Fixed: the controller-truth claim passed and live game filtering matched the reported 25 entries. |
| Published kinds or categories were missing | Fixed: the controller-truth and snapshot publication tests passed. |
| QA badges implied unsupported success | Fixed: released, verifying, and polishing product pages showed distinct truthful QA states and recorded dates or the honest missing-date text. |
| Just released omitted verifying work | Fixed: the live shelf contains an in-progress QA badge and no changes-required badge. |
| First screen did not state job, audience, and first action | Fixed on fresh desktop and phone contexts before scrolling. |
| Build could omit catalogue data or pictures | Fixed: clean build and snapshot-picture claim passed. |
| No isolated one-click sample | Fixed: live sample flow, reset, exit, and empty-storage checks passed. |
| Legal, route, 404, or accessibility gaps | Fixed: live route, link, headers, focus, axe, and designed-404 checks passed. |
| Earlier minor image/ARIA manual checks | Fixed or not reproduced: the URL verifier found zero missing alts and axe found no serious or critical violations. |

## Evidence

- Fresh-clone test status: `.factory/evidence/test-results/.last-run.json` in the verification clone recorded `passed` with no failed tests.
- Live structure check: `/tmp/hello-factory-verify-url.BjZkie/verify.json`.
- Live desktop and phone captures: `/tmp/hello-factory-desktop.png` and `/tmp/hello-factory-phone.png`.
- Live browser-path and axe data: `/tmp/hello-factory-live-verify.json`.
- Live Lighthouse data: `/tmp/hello-factory-live-lighthouse-final.json`.

No product code was modified during this verification.
