# Verify the live tool catalogue

**Verdict: FAIL**

Date: 5 September 2026  
Live URL: <https://hello-factory.sociobot.in>  
Implementation reviewed: `baf5a314c4c9241ea008bd353269cf5f4f553aca`  
Documentation reviewed: `4e215f188af45635756dae57c5e8c043faaa7b25`  
Branch tip received: `45187e8d2e921ffc270a33355a6f2a307cf00a4a`

Finding count: **5** (5 minor)  
Untested public-claim count: **1**

The two commits after the implementation change only `.factory/handoff.md`. The
live home document is byte-for-byte identical to the clean build at the branch
tip, so the deployed product was compared with implementation `baf5a314…`.

## Findings

### V4-01 — Minor — The documented sample QA-state mix is false and has no claim test

`.factory/demo.md` says the six sample entries include passed and in-progress
QA states. The live sample contains Dawn Run, Finite Foundry, Kitchen Table,
Mirror Orchard, Room Code Mystery, and Wordlist Arcade. All six are `RELEASED`,
show **QA passed**, and have `strict_zero_review: true` in the pinned source.

The `@claim:demo-sandbox` test checks six game rows, reset, exit, storage, and
request origins. It does not assert the documented QA-state variety. This is
one false public documentation claim and the report's one untested claim.
Either include a current `VERIFYING` sample and test the mix, or remove the
statement from `.factory/demo.md`.

### V4-02 — Minor — Some product-route metadata exceeds the required limits

Product pages set the document title to the complete controller title plus
` — Hello Factory`. In the pinned 527-row catalogue, 31 resulting titles are
longer than the 60-character site contract. The live `/p/how-it-runs/` title is
138 characters. Two live product meta descriptions are 160 characters, above
the 155-character limit: `/p/voice-riff-loop/` and `/p/scan-count-pad/`.

Generate bounded route titles and descriptions without changing the preserved
controller records.

### V4-03 — Minor — Route footers omit the required product one-liner

The shared footer contract requires a product one-liner on every route. The
landing, catalogue, sample, product, privacy, terms, and 404 footers contain
navigation and build/version text, but none says what Hello Factory does.

Add one consistent plain sentence, such as the approved catalogue description,
to every footer.

### V4-04 — Minor — The model-backed guide does not stream its result

The guide clearly shows what it sends, waits for an explicit action, can be
closed, fails softly, and leaves normal search available. Its live endpoint
returned HTTP 200 and a useful response. However, the client waits for a whole
JSON body with `await res.json()` and then paints the result. It does not stream
output as required by the attached AI-features contract.

Use a streaming gateway response with an incremental status/result, or remove
the model-backed action.

### V4-05 — Minor — The required copy audit contains a stale quantitative statement

`.factory/copy-audit.md` says the current catalogue has 525 supplied `why`
lines. The pinned source has 507 non-empty `why` lines. All 507 remain within
the stated 20-word limit, but the recorded count does not describe the reviewed
artifact. Regenerate the audit when the catalogue pin changes.

## First screen and sample

Fresh 1366×900 desktop and 390×844 phone contexts opened the live landing page
without scrolling.

- Job: **Find a small tool for a specific job**.
- Audience: people with a task to finish who need a matching public catalogue tool.
- First action: **Try it with sample data**.

All three were visible in both viewports. There was no horizontal overflow or
console error. The sample opened in one click, showed six populated game cards,
kept **Demo — sample data, nothing is saved** visible after scrolling, showed a
useful no-result state, reset to `plan a game night` and six rows, and left for
the real catalogue. Cookies, local storage, session storage, IndexedDB, and
service-worker registrations remained empty. `products.json` was identical
before and after the sample flow, and every request in the flow was same-origin.
The QA-state documentation mismatch is V4-01.

## Clean checkout and declared claims

A fresh GitHub checkout at `45187e8…` was clean before and after verification.
Only `.factory/handoff.md` differs between that revision and implementation
`baf5a314…`.

- `npm ci --ignore-scripts`: passed; 61 packages, 0 vulnerabilities.
- `npm test`: passed; 18 unit tests and 16 browser/Axe tests.
- `npm run build`: passed and produced `dist/` from the immutable pin.
- `npm run catalog:verify`: passed with 527 products, 527 details, 527 current
  pictures, 707 preserved pictures, and `imagesVerified: true`.

Every declared claim command was then run on its own:

| Claim | Declared command | Result |
| --- | --- | --- |
| Sample fills, resets, exits, and saves nothing | `npm run test:browser -- --grep @claim:demo-sandbox` | PASS |
| Search words stay in the browser | `npm run test:browser -- --grep @claim:local-search` | PASS |
| Browsing needs no account | `npm run test:browser -- --grep @claim:account-free` | PASS |
| Browsing costs £0 | `npm run test:browser -- --grep @claim:free-browse` | PASS |
| No cookies, search history, or analytics | `npm run test:browser -- --grep @claim:privacy-defaults` | PASS |
| Guide sends words only after the action | `npm run test:browser -- --grep @claim:guide-explicit` | PASS |
| QA badges show controller verdicts and dates | `npm run test:browser -- --grep @claim:qa-verdicts` | PASS |
| Catalogue facts match the snapshot | `npm run test:browser -- --grep @claim:catalogue-truth` | PASS |
| Ordinary builds keep the immutable pin | `npm run test:unit -- --testNamePattern @claim:pinned-snapshot` | PASS |
| Current rows preserve pictures and records | `npm run test:unit -- --testNamePattern @claim:snapshot-pictures` | PASS |

The landing, sample, privacy, terms, README, claim manifest, copy audit, and
demo record were cross-checked. V4-01 is the only public statement without a
matching declared claim test.

## Live source and implementation comparison

The live artifact matches the repaired pin:

- Source SHA-256: `a2a1712f4ead38b24a214cf207e65fcfeeb8b74a0a873c5fd4dc1d37d68721f3`
- Generated: `2026-09-05T21:44:42.977830Z`
- Products/details/current pictures: 527 each
- Preserved pictures: 707
- States: 358 released, 20 verifying, 149 polishing
- Sitemap locations: 532

All 527 live detail JSON files matched the normalized pinned records. All 527
physical product routes returned 200. All 707 picture endpoints returned a
decodable WebP with positive dimensions. The live landing HTML exactly matched
the clean implementation build, including its hashed JavaScript and CSS paths.
This proves V3-01 and V3-02 remain fixed.

## Normal, invalid, boundary, and recovery paths

- Catalogue search returned the expected single row and sent no query text.
- Empty catalogue and sample searches showed specific recovery text.
- An aborted catalogue request showed **The catalogue could not be loaded. Try again in a minute.**
- An unknown product showed **No tool at this address.** with a catalogue link.
- An unknown route deliberately returned HTTP 404 with the designed recovery
  page. That expected 404 is not a defect.
- Keyboard focus began at the skip link. The 3 px focus ring was visible, the
  sample link was reachable and operable, and the showcase responded to arrow
  keys with an announced item change.
- At 200% text and 390 px width, the first action remained usable with no
  horizontal overflow. No visible control on the seven checked routes was
  smaller than 44×44 CSS pixels.
- Reduced motion stopped the showcase's idle rotation. No flashing or autoplay
  media was present.
- The privacy request mail link was present. Normal browsing made no external
  requests and created no browser state. The guide made one matching POST only
  after its action. A separate live request returned HTTP 200 and an honest
  no-match result.
- Offline use and update installation are not promised. There is no web app
  manifest or service worker. Payment, accounts, tenant isolation, restart
  persistence, health, and product-owned 429 behavior do not apply to this
  static product. The optional guide is an external Sociobot dependency.

The crawl checked 551 distinct same-origin links with no failure. It did not
open 528 external product or repository destinations because this work order
forbids connecting to other products. Those links had an external-site notice
or `rel="noopener"`.

## Accessibility, security, and performance

`/opt/fleet/lib/verify-url.sh` passed HTTPS, console, title, language, one H1,
main landmark, image-alternative, and button-name checks. Fresh Axe WCAG 2/2.1
A/AA scans reported zero violations of any severity on the landing, catalogue,
sample, privacy, terms, 404, and product routes. Heading order, labels, target
sizes, keyboard use, focus, reduced motion, and 200% text checks passed.

The live response sends CSP, HSTS, `Referrer-Policy`, and
`X-Content-Type-Options`. Normal pages use only same-origin resources. The
production build emits 24.25 KB CSS and about 25 KB JavaScript before gzip, with
no remote font or script.

Fresh mobile Lighthouse: performance **100**, accessibility **100**, best
practices **100**, SEO **100**; LCP 0.99 s, CLS 0, and TBT 49.5 ms.

## Earlier finding disposition

| Earlier finding or check | Current disposition |
| --- | --- |
| V3-01: live source differed from the documented source | Fixed: manifest, all rows/details/routes, sitemap, and all pictures match `a2a171…`. |
| V3-02: normal clean builds fetched changing input and could fail | Fixed: the clean build reproduced the pin; the pinned-snapshot regression passed. |
| Games shelf and game filter differed | Fixed: both use the 27 source-backed game entries; catalogue-truth passed. |
| Missing kinds or categories were published | Fixed: defaults are present and tested; no published omission was found. |
| QA badges overstated a result or date | Fixed: released, verifying, and polishing records render distinct controller states and dates. |
| Just released omitted verifying work | Fixed: the claim test includes active QA and excludes changes-required entries. |
| First screen omitted job, audience, or first action | Fixed on fresh desktop and phone contexts before scrolling. |
| Build could omit catalogue data or pictures | Fixed: full build and verifier passed; every live detail, route, and picture was checked. |
| No isolated one-click sample | Fixed for entry, reset, exit, storage, and real-data isolation. V4-01 is a new documentation/coverage issue about state variety. |
| Stale tracked data could be reused or silently changed | Fixed: ordinary builds use the immutable pin and only explicit refresh moves it. |
| Public catalogue had stale rows or missing pictures | Fixed: 527 current rows have 527 pictures and the preserved set has 707. |
| Private Hello Factory picture inputs were rejected | Fixed by the build and regression coverage; no out-of-scope source was accessed. |
| Totals, details, routes, or sitemap could drift | Fixed: all live counts and records match the retained source. |
| Creative tools were inferred as games | Fixed: live game membership matches the normalized source rules. |
| A changing catalogue could reduce the six-entry sample | Fixed: six populated rows loaded and reset. |
| Some phone targets were smaller than 44 px | Fixed: no undersized target was found on the checked phone routes. |
| Legal, 404, keyboard, focus, image-alt, or ARIA gaps | Fixed: all related live checks passed. |
| Original small-JavaScript and same-origin checks | Still pass. |
| Original inconclusive label/decorative-arrow Axe checks | Not reproduced; current scans report zero violations. |

## Evidence

- `/work/.evidence/hello-factory-verify-4/live-browser-report.json`
- `/work/.evidence/hello-factory-verify-4/live-catalog-report.json`
- `/work/.evidence/hello-factory-verify-4/verify.json`
- `/work/.evidence/hello-factory-verify-4/lighthouse.json`
- `/work/.evidence/hello-factory-verify-4/desktop-first-screen.png`
- `/work/.evidence/hello-factory-verify-4/phone-first-screen.png`
- `/work/.evidence/hello-factory-verify-4/phone-demo.png`

No product code was modified during this verification.
