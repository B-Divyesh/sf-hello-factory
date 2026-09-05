# Verify the live tool catalogue

**Verdict: FAIL**

Date: 5 September 2026  
Live URL: <https://hello-factory.sociobot.in>  
Implementation reviewed: `7ed5fe327bfe16c7b40f0285fdc7d7215eafb537`  
Documentation reviewed: `cc8a791f7a709c072f1979161737d3dea22238a9`

Finding count: **2** (2 major)  
Untested public-claim count: **0**

The deployed JavaScript and CSS asset names match a clean build of the implementation revision. The live catalogue data does not match the production snapshot named in the handoff.

## Findings

### V3-01 — Major — The live deployment is not the documented production snapshot

The handoff identifies source SHA-256 `7354a22219e65acb56dcfd78c7a978b2dfb6aa656611189f0f5d1389a59fdb11`, generated at `2026-09-05T20:45:15.819647Z`, with 542 products, 24 games, and 666 preserved pictures.

The live `/catalog-build.json` instead identifies source SHA-256 `621866e80d424b05775788e6e5860feffadfdf95f0128a1959c514ea05062479`, generated at `2026-09-05T20:54:46.010400Z`, with 539 products, 25 games, and 667 preserved pictures. The state totals also differ: the handoff says 333 released, 15 verifying, and 194 polishing; live says 339 released, 12 verifying, and 188 polishing.

The live artifact is internally complete: all 539 catalogue rows, details, physical routes, and current pictures passed, as did all 544 sitemap locations and all 667 known preserved picture paths. However, the exact source for the later live snapshot is not retained at the reviewed documentation revision and the controller blob has since changed. The report therefore cannot prove the current live QA records against their exact source. The stated deployed snapshot and its verification evidence do not describe production.

### V3-02 — Major — The documented clean production build fails on the current controller input

From a fresh clone at `cc8a791`, `npm ci --ignore-scripts` passed. `npm run build` then fetched the authorized controller snapshot and failed with `Missing picture for current product one-screen-sprint.` That input had 539 products, 539 details, 667 image mappings, and no mappings for `one-screen-sprint` or `relay-logic`.

The controller changed during verification. A second clean `npm run build` still failed, this time with `Missing picture for current product beat-postcard.` The second input was generated at `2026-09-05T21:17:55.575771Z` with 538 products, 538 details, 667 image mappings, and missing mappings for `beat-postcard`, `one-screen-sprint`, and `relay-logic`. `npm run catalog:verify` also failed on the incomplete fetched input.

Stopping on incomplete data is the correct safety behavior, but the required build gate does not produce `dist/` from the documented clean setup. The `fresh-snapshot` and `snapshot-pictures` claim commands pass because they use controlled or tracked fixtures; they do not detect that the current authorized input cannot be published.

## First screen and sample

Fresh 1366×900 desktop and 390×844 phone contexts were opened without scrolling.

- Job: **Find a small tool for a specific job**.
- Audience: people with a task to finish who need a matching public catalogue tool.
- First action: **Try it with sample data**.

All three were visible before scrolling at both sizes, with no horizontal overflow. The one-click action opened `/demo/` with six realistic game entries. The **Demo — sample data, nothing is saved** label remained visible after scrolling. A no-result query showed an empty state. **Reset demo** restored `plan a game night` and six results. **Start for real** opened the catalogue and removed the sample label.

The fresh sample context had no cookies, local storage, session storage, or IndexedDB databases. Comparing `/products.json` before and after the flow showed no change. The sample made no third-party request.

## Live paths and boundaries

- `/`, `/catalog/`, `/demo/`, `/privacy/`, `/terms/`, `/404.html`, and a product route had the expected distinct titles, `lang="en"`, one H1, one main landmark, image alternatives, no horizontal overflow, and no controls smaller than 44×44 CSS pixels on the phone viewport.
- Every one of the 539 live detail JSON files matched its catalogue row for identity, type, state, QA record, and picture. Every physical product route returned 200. Every current picture was a valid WebP response.
- The sitemap contained exactly the five base routes and 539 product routes. All standard same-origin assets and routes returned 200. The repository's external MIT License link returned 200. Product links were not opened because this work order forbids connecting to other products.
- Keyboard navigation reached the skip link first, the main sample action, form controls, and catalogue links. Focus-visible styling was present. There was no trap. At 200% text size, the first action remained usable and the page had no horizontal overflow.
- Reduced motion stopped the rotating showcase. No flashing or autoplay media was present.
- An impossible search showed the designed empty state. An aborted catalogue request showed `The catalogue could not be loaded. Try again in a minute.` An unknown product showed `No tool at this address.`
- An unknown route deliberately returned HTTP 404 with the designed `This catalogue page does not exist` page. This is expected behavior, not a defect.
- The privacy page provides `privacy@sociobot.in` for requests. Normal browsing made no third-party requests and created no browser storage. The optional guide made no request for invalid input or before submission, then sent one matching POST to Sociobot after **Ask the guide** and returned five populated results.
- Offline use, update installation, payments, accounts, tenant persistence, health endpoints, and product-owned 429 behavior are not promised. Hello Factory is static; the optional guide is an external dependency, not its backend.

## Accessibility, security, and performance

`/opt/fleet/lib/verify-url.sh` passed HTTPS load, title, language, H1, main landmark, image alternative, button-label, and console checks. Fresh axe WCAG 2/2.1 A/AA scans found no violations on the landing, catalogue, sample, privacy, terms, 404, and product routes.

The live response includes CSP, HSTS, `Referrer-Policy`, and `X-Content-Type-Options`. Normal landing and sample browsing loaded only same-origin resources. The responsive screenshots were reviewed; content remained readable and controls did not overlap.

Fresh mobile Lighthouse results were 100 performance, 100 accessibility, 100 best practices, and 100 SEO. LCP was 0.93 seconds, CLS was 0, and TBT was 47.5 milliseconds. The clean UI compile emitted 24.25 KB CSS and about 25 KB JavaScript before gzip, within the product budgets.

## Clean checkout and declared claims

`npm test` passed 17 unit tests and 16 browser tests in the fresh clone. Every command in `.factory/claims.json` was also run separately:

| Claim | Declared command | Result |
| --- | --- | --- |
| Sample fills, resets, and saves nothing | `npm run test:browser -- --grep @claim:demo-sandbox` | PASS |
| Search stays in the browser | `npm run test:browser -- --grep @claim:local-search` | PASS |
| Browsing needs no account | `npm run test:browser -- --grep @claim:account-free` | PASS |
| Browsing costs £0 | `npm run test:browser -- --grep @claim:free-browse` | PASS |
| No cookies, search history, or analytics | `npm run test:browser -- --grep @claim:privacy-defaults` | PASS |
| Guide sends words only after the action | `npm run test:browser -- --grep @claim:guide-explicit` | PASS |
| QA badges show verdicts and dates | `npm run test:browser -- --grep @claim:qa-verdicts` | PASS |
| Catalogue facts match the snapshot | `npm run test:browser -- --grep @claim:catalogue-truth` | PASS |
| Production refresh replaces stale output | `npm run test:unit -- --testNamePattern @claim:fresh-snapshot` | PASS |
| Snapshot rows retain pictures and records | `npm run test:unit -- --testNamePattern @claim:snapshot-pictures` | PASS |

The landing page, README, privacy page, terms page, and sample copy were cross-checked with the claim list. No unlisted public claim was found. The incomplete real-input coverage behind the final two passing commands is finding V3-02, not an untested command.

## Earlier finding disposition

| Earlier finding or check | Current disposition |
| --- | --- |
| Games shelf and game filter differed | Fixed in live output: both contain 25 games, matching the live source-kind total. |
| Missing kinds and categories were published | Fixed: live public rows have no missing kind or category; conservative defaults remain covered by unit tests. |
| QA badges overstated success or dates | Fixed in rendering and tests. Exact source proof for the undocumented live snapshot is unavailable under V3-01. |
| Just released omitted work still being verified | Fixed by the browser claim test and current UI behavior. |
| First screen omitted the job, audience, or first action | Fixed on fresh desktop and phone contexts. |
| Build could omit catalogue data or pictures | Regressed at the input boundary: V3-02 prevents a current production build. |
| One-click sample was absent or not isolated | Fixed; the full live entry, reset, exit, and isolation flow passed. |
| Legal, route, 404, keyboard, focus, image-alt, or ARIA gaps | Fixed; live route, keyboard, URL-verifier, and axe checks passed. |
| Stale tracked data could be reused by production builds | The implementation fetches after compiling, but current input cannot pass its picture gate; see V3-02. |
| Public catalogue had 601 rows and 27 missing pictures | Fixed in the current live artifact: 539 of 539 current pictures passed. |
| Private Hello Factory picture inputs were rejected | Fixed by the implementation tests; no out-of-scope source was accessed. |
| Published totals, details, routes, or sitemap could drift | The current live artifact is internally consistent, but its totals differ from the handoff; see V3-01. |
| Creative tools were inferred as games | Fixed: the live source and published summaries both report 25 games. |
| A changing catalogue could reduce the six-entry sample | Fixed: six populated entries appeared and reset correctly. |
| Some phone targets were smaller than 44 px | Fixed: no undersized visible target was found on the checked phone routes. |
| Earlier small-JavaScript, same-origin, and axe checks | Still pass. The original verification reported no defects beyond later superseded data issues. |

No product code was modified during this verification.
