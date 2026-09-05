# Hello Factory verification 4 handoff

Date: 5 September 2026

Live URL: <https://hello-factory.sociobot.in>

Implementation reviewed: `baf5a314c4c9241ea008bd353269cf5f4f553aca`

Documentation reviewed: `4e215f188af45635756dae57c5e8c043faaa7b25`

Branch tip received: `45187e8d2e921ffc270a33355a6f2a307cf00a4a`

## Outcome

**FAIL — 5 minor findings and 1 untested public claim.**

V3-01 and V3-02 remain fixed. The live artifact and a clean normal build both
use source `a2a1712f4ead38b24a214cf207e65fcfeeb8b74a0a873c5fd4dc1d37d68721f3`:
527 products, 527 details, 527 current pictures, 707 preserved pictures, and
532 sitemap locations. All live records, product routes, and pictures passed.

The new findings are:

1. `.factory/demo.md` promises passed and in-progress QA states, but all six
   live sample rows are released/passed; that statement has no tagged test.
2. Thirty-one product document titles exceed 60 characters, and two product
   meta descriptions exceed 155 characters.
3. Standard route footers omit the required product one-liner.
4. The model-backed guide returns a complete JSON result rather than streaming.
5. `.factory/copy-audit.md` says there are 525 supplied `why` lines; the pin has
   507.

Full evidence and remediation details are in
[`.factory/verification-4.md`](verification-4.md).

## Verification completed

- Fresh checkout: `npm ci --ignore-scripts`, `npm test`, `npm run build`, and
  `npm run catalog:verify` passed.
- All ten declared commands in `.factory/claims.json` passed separately.
- Fresh desktop and phone first-screen and sample flows passed, except for the
  false documented QA-state mix.
- Normal, empty, invalid, aborted-load, unknown-product, and designed-404 paths
  passed.
- Keyboard, arrow-key carousel use, focus, 44 px targets, 200% text, reduced
  motion, privacy storage, request-origin, route-title, and legal checks ran.
- The URL verifier passed. Axe found zero violations on seven representative
  routes.
- Fresh mobile Lighthouse scored 100 in performance, accessibility, best
  practices, and SEO. LCP was 0.99 s, CLS 0, and TBT 49.5 ms.
- The live optional guide returned HTTP 200 after explicit action. The product
  is static; backend tenant, persistence, health, and 429 checks do not apply.

## How to verify

From a clean checkout with Node.js 20 or newer:

```sh
npm ci --ignore-scripts
npm test
npm run build
npm run catalog:verify
```

Then run each command in `.factory/claims.json` independently. Live evidence is
under `/work/.evidence/hello-factory-verify-4/`.

## Next steps

Resolve all five findings, add a tagged assertion for any retained sample-state
claim, rerun the full clean and live checks, and request another independent
verification. No product code was changed in this verification.
