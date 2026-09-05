# Hello Factory repair 2 handoff

Date: 5 September 2026

Live URL: <https://hello-factory.sociobot.in>

Deployed implementation revision: `7ed5fe327bfe16c7b40f0285fdc7d7215eafb537`

Documentation revision: the repository HEAD containing this handoff. This later evidence-only revision was not redeployed.

## Outcome

Every production build now compiles the UI, fetches the current authorised controller blob, and publishes that exact snapshot afterward. The build stops if a current product lacks a detail or picture, if an image source leaves the allowed Hello Factory paths, or if any downloaded WebP cannot be decoded.

The deployed snapshot is generated `2026-09-05T20:45:15.819647Z` with SHA-256 `7354a22219e65acb56dcfd78c7a978b2dfb6aa656611189f0f5d1389a59fdb11`.

- 542 products, 542 detail records, and 547 sitemap URLs
- 542 current product pictures and 666 preserved pictures in total
- States: 333 released, 15 verifying, and 194 polishing
- Published kinds: 119 developer tools, 47 extensions, 24 games, 35 installable tools, 24 libraries, 242 products, and 51 utilities
- 24 Games entries, all backed by the source's explicit game kind
- 11 missing source kinds and categories resolved with conservative defaults; creative audio tools are no longer inferred to be games
- Source QA objects and dates preserved on every product and detail record

Seven selected pictures came from private URLs in the authorised snapshot. They were downloaded with the existing Blob login without printing or storing a credential. All 666 public image endpoints returned decodable WebP images after deployment.

## Repair details

- Replaced the manual fetch step with an atomic, fixed-blob fetch in `scripts/snapshot-data.mjs`.
- Added `catalog:refresh` after Vite compilation in the production `build` command.
- Added `catalog-build.json` with the exact source hash, generation time, count, state totals, source-kind totals, published-kind totals, and picture counts.
- Added a post-publish verifier for the catalogue, every detail, every physical product route, the sitemap, and every image.
- Added a stale-artifact regression that proves the refresh replaces old JSON, details, routes, sitemap, and summary files.
- Kept browser tests deterministic with `build:test`; production `build` is always the network-backed fresh path.
- Topped the sample back up to six source-marked games after a preferred entry left the catalogue.
- Removed inline event handlers and raised rendered interactive targets to at least 44×44 px.

The established paper, ink, framed-screen visual system and all controller pictures were preserved.

## Verification

From a clean clone of the deployed revision:

```sh
npm ci --ignore-scripts
npm test
```

The unit suite passed 17 tests. The browser suite passed 16 tests. Every command in `.factory/claims.json` was then run separately and passed.

The final production artifact was built with:

```sh
npm run build
npm run catalog:verify
```

The final build fetched the deployed snapshot after compiling the UI, downloaded 666 pictures, and passed the exact artifact verifier. The generated application contains 24.25 KB CSS and 24.83 KB JavaScript before gzip across route chunks.

Cold live verification found:

- HTTPS 200, one H1, one main landmark, valid language and titles, no missing image alternatives, and no console errors
- the job, audience, and **Try it with sample data** action visible before scrolling on 1366×900 desktop and 390×844 phone
- six source-marked game entries in the sample, a persistent sample label, empty-state recovery, reset, exit, no cookies or browser storage, and no catalogue mutation
- zero serious or critical axe findings on landing, catalogue, demo, privacy, terms, 404, and product routes
- zero undersized interactive targets or horizontal overflow on those phone routes; 200% text remained usable without horizontal overflow
- a deliberate unknown URL returned the designed HTTP 404
- all 542 details, 542 physical routes, 547 sitemap locations, and 666 picture endpoints agreed with the exact deployed snapshot
- Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices, and 100 SEO; LCP 1.27 s, CLS 0, TBT 47 ms

Evidence is in `.factory/evidence/repair-2-live/`. Full finding disposition is in `.factory/repair-2-verification.md`.

## Earlier and independent review

The complete earlier reports remain in `.factory/verification.md`, `.factory/repair-verification.md`, and `.factory/verification-2.md`. The latest independent report available before this work order recorded PASS with zero findings against implementation `e70d1d3`, but it verified the now-superseded 601-row snapshot. The controller's later stale-snapshot finding is the reason for this repair and is now fixed at the build boundary.

## Deployment and remaining dependencies

The final `dist/` artifact was uploaded directly to the existing production environment for `sf-hello-factory`. The deployment did not run another build, use a cached snapshot, alter DNS, access a staging slot, or touch another product.

The optional guide still depends on `api.sociobot.in/api/v1/products/recommend`. Search, filters, details, pictures, and the sample work without it. Offline use is not promised. This is a read-only static product, so SQLite, tenant isolation, restart persistence, health endpoints, and backend 429 handling do not apply.
