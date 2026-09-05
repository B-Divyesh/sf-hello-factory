# Repair 2 verification

Date: 5 September 2026

Implementation: `7ed5fe327bfe16c7b40f0285fdc7d7215eafb537`

Target: <https://hello-factory.sociobot.in>

## Finding disposition

| Finding | Disposition | Outcome evidence |
| --- | --- | --- |
| The final build reused a stale tracked snapshot | Fixed | `npm run build` now compiles first, fetches the fixed authorised blob, publishes it, and verifies the source hash. A stale-artifact integration test proves replacement. |
| Public data remained at 601 rows with 27 missing pictures | Fixed | Live data is the exact deployed 542-row snapshot. All 542 current rows have pictures. |
| Private picture URLs were not generally accepted | Fixed | The downloader accepts only same-slug public shots or exact same-slug Hello Factory work-order input paths selected by the snapshot. Seven private inputs were used in the deployed build. |
| Published totals could drift from the input | Fixed | The live manifest and full verifier agree on 542 products, 542 details, state totals, source and published kind totals, and source SHA-256. |
| Details and sitemap could disagree | Fixed | All 542 live detail JSON files and routes matched; the sitemap had the five base routes plus 542 product routes. |
| Some Games entries could be creative tools rather than games | Fixed | The broad `games-creative` fallback was removed. All 24 live Games entries have explicit source game evidence. |
| Release badges could overstate QA | Fixed | All 542 live QA records match source. Passed appears only for released strict-zero records; verifying and polishing use distinct labels and source dates. |
| A changing catalogue could reduce the six-entry sample | Fixed | The sample tops up from current source-marked games and showed six entries, reset, and exited without storage or data changes. |
| Some phone interaction targets were below 44 px | Fixed | Rendered checks across all primary routes found zero visible controls below 44×44 px. |

## Exact deployed snapshot

- Generated: `2026-09-05T20:45:15.819647Z`
- SHA-256: `7354a22219e65acb56dcfd78c7a978b2dfb6aa656611189f0f5d1389a59fdb11`
- State totals: 333 `RELEASED`, 15 `VERIFYING`, 194 `POLISHING`
- Published kind totals: 119 `devtool`, 47 `extension`, 24 `game`, 35 `installable`, 24 `library`, 242 `product`, 51 `utility`
- Pictures: 542 current and 666 preserved; all 666 live endpoints returned a valid WebP with non-zero dimensions

## Paths and boundaries checked

Normal paths covered landing, catalogue, every detail and physical product route, Games, sample, privacy, terms, sitemap, and picture delivery. Invalid and recovery paths covered an aborted catalogue request, no-result search, sample reset, missing product, and the designed HTTP 404. Boundary checks covered desktop, 390 px phone, keyboard, visible focus, 44 px targets, 200% text, reduced motion, browser storage, and external request observation.

The expected unknown-route HTTP 404 is a passing result. Offline behavior, payments, accounts, a backend, tenant isolation, persistence, health, and 429 handling are not product features.

## Independent review history

The most recent independent report available is `.factory/verification-2.md`. It recorded PASS with zero findings and zero untested public claims against the previous implementation, while the controller later found that its 601-row data was stale. All of that report's UI, accessibility, privacy, route, and claim findings were rerun; the stale-data issue is fixed by the new build boundary.
