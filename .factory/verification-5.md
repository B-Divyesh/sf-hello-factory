# Verify the live tool catalogue

**Verdict: FAIL**

Date: 5 September 2026
Live URL: <https://hello-factory.sociobot.in>
Implementation reviewed: `e57b69b709c9de89fd8cd5433e6e4749d1c0d375`
Documentation reviewed: `4c35edafd5d6efe37c2dfaa457c996e34e519a2d`

Finding count: **2** (2 minor)
Untested public-claim count: **0**

The documentation commit changes only `.factory/handoff.md` and repair evidence.
The live landing document is byte-for-byte identical to the clean build at that
revision, so `e57b69b…` is the implementation candidate reviewed.

## Findings

### V5-01 — Minor — Several routes lack required social metadata

The live home and catalogue routes provide Open Graph and Twitter card tags.
The live demo, privacy, terms, and product routes provide none. The product
template also does not create route-specific Open Graph metadata after loading
a product. The designed 404 has no meta description or social metadata.

This does not block browsing, but it fails the attached site-structure contract
for route metadata. Add plain route-specific Open Graph and Twitter values,
using the existing 1200×630 Hello Factory image; update product values when its
record loads. Add a plain description to the 404 page.

### V5-02 — Minor — A guide network failure gives no usable recovery step

The guide succeeds live, streams through the repaired reader, closes cleanly,
and sends nothing before the explicit action. When its request is unavailable,
however, the result panel contains only **Failed to fetch**. It does not explain
that the guide could not connect or tell the visitor to retry or use catalogue
search. This fails the plain-words error-state requirement.

Map network exceptions to a message such as **The guide could not connect. Try
again, or search the catalogue below.** Keep the non-model catalogue link in
the error state.

## First screen and sample

Fresh 1366×900 desktop and 390×844 phone contexts opened the live page without
scrolling.

- Job: **Find a small tool for a specific job**.
- Audience: people with a task to finish who need a matching public catalogue tool.
- First action: **Try it with sample data**.

All three were visible in both viewports. There was no horizontal overflow,
undersized first-screen control, console error, or page error. The screenshots
were visually reviewed.

The sample opened in one click and showed Dawn Run, Finite Foundry, Kitchen
Table, Mirror Orchard, Room Code Mystery, and Wordlist Arcade. All six are game
entries with passed QA, matching the corrected demo statement. The persistent
**Demo — sample data, nothing is saved** label remained visible after scrolling.
An impossible search showed the empty state. **Reset demo** restored `plan a
game night` and six rows. **Start for real** opened the catalogue and removed
the sample label.

The fresh sample context retained no cookies, local storage, session storage,
IndexedDB database, or service worker. All sample requests were same-origin,
and `products.json` was unchanged before and after the flow.

## Clean checkout and declared claims

A fresh GitHub checkout at `4c35eda…` was clean before and after verification.
Only documentation and evidence differ between that revision and the candidate.

- `npm ci --ignore-scripts`: passed; 61 packages, 0 vulnerabilities.
- `npm test`: passed; 21 unit tests and 18 browser/Axe tests.
- `npm run build`: passed and produced `dist/` from the immutable source pin.
- `npm run catalog:verify`: passed with 527 products, 527 details, 527 current
  pictures, 707 preserved pictures, and `imagesVerified: true`.

Every declared claim command was then run separately:

| Claim | Declared command | Result |
| --- | --- | --- |
| Sample shows six passed game tools, resets, and saves nothing | `npm run test:browser -- --grep @claim:demo-sandbox` | PASS |
| Search words stay in the browser | `npm run test:browser -- --grep @claim:local-search` | PASS |
| Browsing needs no account | `npm run test:browser -- --grep @claim:account-free` | PASS |
| Browsing costs £0 | `npm run test:browser -- --grep @claim:free-browse` | PASS |
| No cookies, search history, or analytics | `npm run test:browser -- --grep @claim:privacy-defaults` | PASS |
| Guide sends words only after the action | `npm run test:browser -- --grep @claim:guide-explicit` | PASS |
| Guide exposes complete matches before a chunked response closes | `npm run test:unit -- --testNamePattern @claim:guide-stream` | PASS |
| QA badges show controller verdicts and dates | `npm run test:browser -- --grep @claim:qa-verdicts` | PASS |
| Catalogue facts match the snapshot | `npm run test:browser -- --grep @claim:catalogue-truth` | PASS |
| Ordinary builds keep the immutable pin | `npm run test:unit -- --testNamePattern @claim:pinned-snapshot` | PASS |
| Current rows preserve pictures and records | `npm run test:unit -- --testNamePattern @claim:snapshot-pictures` | PASS |

Each claim ID occurs in exactly one test. The landing, sample, privacy, terms,
README, copy audit, demo record, and claim manifest were cross-checked. No
public claim is missing a test, and no declared command is untested. V5-01 and
V5-02 are contract defects, not untested public claims.

## Live source and implementation comparison

The live artifact retains the required immutable source:

- Source SHA-256: `a2a1712f4ead38b24a214cf207e65fcfeeb8b74a0a873c5fd4dc1d37d68721f3`
- Generated: `2026-09-05T21:44:42.977830Z`
- Products, details, and current pictures: 527 each
- Preserved pictures: 707
- States: 358 released, 20 verifying, 149 polishing
- Sitemap locations: 532

The live catalogue equals the clean build. All 527 live detail JSON files equal
their clean-build files, and all 527 physical product routes return 200. All
707 live picture files are valid WebP responses and byte-for-byte equal their
clean-build files. All 33 product routes previously affected by metadata length
limits were rendered: the longest title is 60 characters, the longest
description is 152, and every visible H1 retains the complete controller title.
The clean source records were not altered.

## Normal, invalid, boundary, and recovery paths

- Catalogue search, filters, sorting, product navigation, and sample navigation work.
- Empty catalogue and sample searches show specific recovery text.
- An aborted catalogue load says to try again in a minute.
- An unknown product says **No tool at this address.**
- An unknown route deliberately returns HTTP 404 with the designed page and a
  catalogue recovery link. This expected 404 is not a defect.
- The skip link receives first keyboard focus with a 3 px visible ring. The
  sample action is reachable and opens with Enter. No keyboard trap was found.
- At 200% text size and 390 px width, content remains usable without horizontal
  overflow. No checked visible control is smaller than 44×44 CSS pixels.
- Reduced motion stops the showcase rotation. There is no flashing or autoplay media.
- The privacy request mail link is present. Normal browsing creates no browser
  state or third-party request. The guide sends one matching POST only after
  the action; an invalid short query sends nothing.
- The successful live guide returned five populated matches and could be
  closed. Its unavailable-network state is V5-02.
- The crawl checked 545 distinct same-origin links with no failure. External
  product destinations were not opened because they are outside this work order.

Offline use and update installation are not promised. No service worker or web
app manifest is installed. Accounts, payments, tenant isolation, restart
persistence, health, and product-owned 429 handling do not apply to this static
product. The optional guide is a documented external Sociobot dependency.

## Accessibility, security, and performance

`/opt/fleet/lib/verify-url.sh` passed HTTPS, console, title, language, one H1,
main landmark, image-alternative, and button-name checks. Fresh live Axe WCAG
2/2.1 A/AA scans reported zero violations of any severity on the landing,
catalogue, sample, privacy, terms, 404, and product routes. Heading order,
labels, landmarks, keyboard use, focus, touch targets, reduced motion, and 200%
text checks passed.

The live response sends CSP, HSTS, `Referrer-Policy`, and
`X-Content-Type-Options`. Normal pages use same-origin resources. The clean
build emits 24.33 KB CSS and about 27 KB JavaScript before gzip; Lighthouse
transferred 7,975 script bytes and 5,966 stylesheet bytes.

Fresh mobile Lighthouse: performance **99**, accessibility **100**, best
practices **100**, SEO **100**; LCP 1.02 s, CLS 0, and TBT 103 ms.

## Earlier finding disposition

| Earlier finding or check | Current disposition |
| --- | --- |
| V4-01: false sample QA-state mix and missing coverage | Fixed: documentation states six released tools with passed QA; the dedicated claim and live flow prove all six badges. |
| V4-02: over-limit product metadata | Fixed: all 33 affected live routes are bounded while source records and H1 text remain complete. V5-01 concerns missing social tags, not these length repairs. |
| V4-03: footer omitted the job sentence | Fixed: all seven representative routes show the exact approved sentence. |
| V4-04: guide waited for the whole JSON response | Fixed: the chunked fixture exposes the first complete pick before close, and the live client uses that reader. V5-02 is a separate network-error copy defect. |
| V4-05: stale copy-audit count | Fixed: the audit and regression match 527 products, 507 non-empty `why` lines, a 20-word maximum, and the retained source hash. |
| V3-01: live source differed from documentation | Fixed: manifest, catalogue, all details/routes, sitemap, and all picture bytes match the retained source build. |
| V3-02: normal clean build depended on changing input | Fixed: two clean production builds reproduced the pin without refreshing it. |
| Games shelf/filter, defaults, QA badges, and recent-release membership | Fixed: source-backed browser and unit claims pass against the retained catalogue. |
| Missing or incomplete one-click sample | Fixed: entry, six populated rows, label, empty state, reset, exit, storage isolation, and real-data preservation pass. |
| Missing catalogue rows, details, routes, sitemap entries, or pictures | Fixed: complete clean-build and live comparisons pass for 527 products and 707 pictures. |
| Phone targets below 44 px | Fixed: no undersized target appears on the checked phone routes. |
| Legal, designed 404, keyboard, focus, image-alt, or ARIA gaps | Fixed for the earlier issues; current semantics and live Axe scans pass. V5-01 records the remaining route metadata gap. |
| Original small-JavaScript and same-origin checks | Still pass. |
| Original inconclusive label and decorative-arrow Axe checks | Not reproduced; current scans report zero violations. |

## Evidence

- `.factory/evidence/verification-5/browser-report.json`
- `.factory/evidence/verification-5/verify.json`
- `.factory/evidence/verification-5/lighthouse.json`
- `.factory/evidence/verification-5/headers.txt`
- `.factory/evidence/verification-5/desktop-first-screen.png`
- `.factory/evidence/verification-5/phone-first-screen.png`
- `.factory/evidence/verification-5/phone-demo.png`

No product code was modified during this verification.
