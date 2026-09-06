# Hello Factory verification 6 handoff

Date: 6 September 2026
Live URL: <https://hello-factory.sociobot.in>
Implementation reviewed: `7c95ca094e10b5a38fcdcd49d053573f33d132ef`
Documentation reviewed: `7fe82492606ebf295ef6d839dcab09bbaed288b9`

## Current outcome

**PASS — independent QA found zero findings and zero untested claims.**

Fresh-checkout verification passed `npm ci --ignore-scripts`, `npm test` (21
unit and 20 browser/Axe tests), `npm run build`, `npm run catalog:verify`, and
all 11 claim commands separately. The clean and live artifacts agree for the
immutable pin, 527 products/details/routes, and all 707 pictures. Fresh desktop
and phone flows, sample isolation, metadata, guide recovery, privacy, keyboard,
seven Axe scans, headers, and valid mobile Lighthouse 100/100/100/100 passed.

See [`.factory/verification-6.md`](verification-6.md) and
`/work/.evidence/hello-factory-verify-6/` for the full evidence. There are no
known product defects.

## Repair 5 record

**PASS — both Verification 5 findings are fixed, with no known product defect.**

| Finding | Disposition | Outcome evidence |
| --- | --- | --- |
| V5-01: several routes lacked social metadata | Fixed | Home, catalogue, sample, privacy, terms, 404, and a loaded product route expose a description, canonical URL, Open Graph title/description/URL/image, and Twitter large-card values. Product title, description, URL, and canonical values update from the loaded record. The existing 1200×630 Hello Factory image is used throughout. |
| V5-02: a guide network failure showed only “Failed to fetch” | Fixed | A forced connection refusal now says **The guide could not connect. Try again, or search the catalogue instead.** It links to catalogue search, re-enables **Ask the guide**, hides the raw exception, and succeeds on retry. |

Both repairs have browser tests that assert rendered outcomes. The error test forces a failed request, checks the recovery action, then retries against a successful response. The metadata test checks the complete rendered fields, unique route values, the real social image, and dynamic product metadata.

## Preserved catalogue

- Immutable source SHA-256: `a2a1712f4ead38b24a214cf207e65fcfeeb8b74a0a873c5fd4dc1d37d68721f3`
- Generated: `2026-09-05T21:44:42.977830Z`
- 527 products, 527 detail records, and 527 current pictures
- 707 preserved pictures
- 358 released, 20 verifying, and 149 polishing records
- All 527 live details equal the production build, all 527 product routes return 200, and all 707 live picture files equal the production build.

The repair did not refresh the controller pin or change any source product record or picture.

## Verification

From a fresh GitHub checkout of the implementation commit:

```sh
npm ci --ignore-scripts
npm test
npm run build
npm run catalog:verify
```

Results:

- 21 unit tests passed.
- 20 browser/Axe tests passed, including the two new repair regressions.
- All 11 commands in `.factory/claims.json` passed when run separately.
- The clean production build reproduced the immutable pin and verified every picture.
- Production output contains 27,558 bytes of JavaScript and 24,333 bytes of CSS before gzip.
- The fresh checkout stayed clean after every command.

The existing `sf-hello-factory` Static Web App was reused and the `dist/` artifact was deployed to its production slot. Post-deploy checks found:

- HTTPS 200, no console or page errors, `lang="en"`, one H1, one main landmark, complete image alternatives, and named buttons.
- Job, audience, and **Try it with sample data** visible before scrolling at 1366×900 and 390×844, with no horizontal overflow.
- Six released game tools with passed QA in the sample; reset restored the query and rows; cookies, local storage, session storage, and IndexedDB stayed empty.
- Zero Axe violations on home, catalogue, sample, privacy, terms, 404, and product routes.
- A real guide request produced an incremental update and completed with its catalogue fallback still available.
- The unknown route returned the expected HTTP 404 with the designed recovery page.
- CSP, HSTS, `Referrer-Policy`, and `X-Content-Type-Options` headers are present.
- Mobile Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.00 s, CLS 0, TBT 35.5 ms.

Post-deploy evidence is in `/work/.evidence/hello-factory-repair-5/`. It includes the URL verifier report, Lighthouse JSON, and reviewed desktop, phone, and sample screenshots. The required catalogue description is copied to `/work/.evidence/catalog-description.txt`.

## Known dependencies and next steps

The optional guide still depends on `api.sociobot.in`. Catalogue browsing and local search continue to work when that service is unavailable, and the repaired error state gives both retry and non-model search paths. No account, payment, offline mode, product backend, or billing offer is part of Hello Factory, so no billing registration or persistence work applies.

No further product change is required for the Verification 5 findings. A fresh independent verifier can rerun the commands above and exercise the two new named browser tests.
