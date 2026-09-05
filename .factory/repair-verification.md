# Repair verification

Date: 5 September 2026

Implementation: `e70d1d3aabacc87487725f51ec5d4f7927448b2e`

Target: <https://hello-factory.sociobot.in>

## Current work-order findings

| Finding | Disposition | Outcome evidence |
| --- | --- | --- |
| Games shelf differed from the game filter | Fixed | Both derive from normalized `kind === "game"`; the live shelf and filter report the same 25 entries. The 22 explicit snapshot games plus three deterministic missing-kind defaults produce that total. |
| Missing `kind` defaults | Fixed | All 48 source omissions resolve by artifact class or territory: 19 product, 9 devtool, 14 installable, 3 extension, and 3 game. Published omissions: zero. |
| Missing category defaults | Fixed | All 48 missing or unknown categories publish as `new`, visibly named **Not yet shelved**. Published omissions: zero. |
| QA badges implied unsupported success | Fixed | Passed appears only for `RELEASED` with `strict_zero_review`; `VERIFYING` says in progress and `POLISHING` says changes required. Dates come directly from `reviewed_at`, with an explicit no-date state. |
| Just released omitted `VERIFYING` | Fixed | The shelf includes only `RELEASED` and `VERIFYING`, puts checking work first, and excludes changes-required entries. |
| First screen did not plainly state the job, audience, and first action | Fixed | The live H1 is **Find a small tool for a specific job**. The following sentence names people with a task to finish. The primary action is **Try it with sample data**, visible without scrolling on desktop and phone. |
| A build could drop catalogue data or pictures | Fixed | `npm run build` runs the publisher after Vite, validates snapshot count/details, writes data/routes/sitemap, and preserves every supplied picture. |
| No isolated one-click sample | Fixed | `/demo/` is one click from the first screen, has six real entries, a persistent label, reset/exit actions, and no storage. |
| Route/legal/404/accessibility contract gaps | Fixed | Privacy and terms are linked on every page; physical detail routes and a designed HTTP 404 work; title, landmarks, focus, mobile, reduced motion, and axe checks pass. |

## Earlier verification history

The complete earlier repository record is `.factory/verification.md`, dated 27 August 2026 at revision `e50e9de`. It reported no defects. Its claims were rechecked against the repaired product:

| Earlier check | Current disposition |
| --- | --- |
| HTTPS, title, language, one H1, one main, image alternatives | Pass in the final live `verify-url.sh` report. |
| Desktop and 390 px phone without runtime errors | Pass in fresh final live contexts; no console or page errors and no horizontal overflow. |
| Complete keyboard order and visible 3 px focus | Pass in the browser regression suite, including keyboard entry into the sample. |
| Small first-load JavaScript | Pass: Lighthouse transferred 7,275 bytes, far below the 200 KB product budget. |
| No third-party requests on normal browsing | Pass in fresh live desktop and phone contexts. The optional guide is the documented explicit exception. |
| Clean install, tests, and build | Pass on the final implementation revision. |
| Axe WCAG A/AA scan | Pass: zero serious or critical issues on every required final route. |

## Paths checked

Normal paths covered landing, catalogue, game filtering, sample, product detail, privacy, terms, and every controller count/state. Invalid and recovery paths covered no-result search, reset, aborted catalogue loading, an unknown product, and the designed HTTP 404. Boundary checks covered 390 px layout, keyboard-only use, reduced motion, empty storage, and missing snapshot metadata.

The expected unknown-route HTTP 404 is a passing result, not a defect. Offline operation, payment, accounts, and a product backend are not public features, so their backend-specific checks do not apply.

## Evidence files

- `live-final/verify.json`: cold HTTPS structure and console check
- `live-final/browser-report.json`: fresh desktop, phone, sample, storage, 404, and axe outcomes
- `live-final/lighthouse.json`: final mobile Lighthouse result
- `live-final/desktop-first-screen.png`, `phone-first-screen.png`, and `phone-demo.png`: final visual evidence
