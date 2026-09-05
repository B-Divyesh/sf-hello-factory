# Hello Factory verification 3 handoff

Date: 5 September 2026

Live URL: <https://hello-factory.sociobot.in>

Implementation reviewed: `7ed5fe327bfe16c7b40f0285fdc7d7215eafb537`

Documentation reviewed: `cc8a791f7a709c072f1979161737d3dea22238a9`

## Outcome

**FAIL — 2 major findings, 0 untested public claims.**

The live browsing experience, sample, privacy behavior, accessibility, routes, pictures, and performance pass. The release cannot be accepted because production no longer matches the snapshot documented by the repair handoff, and a clean production build fails against the current authorized controller input.

Full evidence and finding disposition are in [`.factory/verification-3.md`](verification-3.md).

## Findings

1. The handoff names a 542-product source snapshot with SHA-256 `7354a22219e65acb56dcfd78c7a978b2dfb6aa656611189f0f5d1389a59fdb11`. Live serves a later, undocumented 539-product snapshot with SHA-256 `621866e80d424b05775788e6e5860feffadfdf95f0128a1959c514ea05062479`. The live artifact is internally complete, but the retained evidence does not describe it.
2. In a fresh clone, `npm run build` failed twice after fetching changing authorized inputs. The latest observed input had 538 products and lacked picture mappings for `beat-postcard`, `one-screen-sprint`, and `relay-logic`. `npm run catalog:verify` also failed. The fixture-based refresh and picture claim tests still pass, so they do not cover this current input failure.

## Passing evidence

- `npm ci --ignore-scripts` passed with zero vulnerabilities.
- `npm test` passed 17 unit and 16 browser tests.
- All ten declared claim commands passed when run separately.
- Fresh desktop and 390×844 phone browsers showed the job, audience, and **Try it with sample data** action before scrolling.
- The live sample showed six real game entries, kept its label visible, handled no results, reset to six, exited cleanly, used no browser storage, and did not change the catalogue.
- All 539 live details, 539 physical routes, 539 current pictures, 544 sitemap locations, and 667 known preserved pictures passed.
- Route titles, legal pages, privacy contact, keyboard access, focus, reduced motion, 200% text, recovery states, and the designed HTTP 404 passed.
- The URL verifier found no normal-load console errors. Axe found no WCAG A/AA violations on seven representative routes.
- Mobile Lighthouse scored 100 in performance, accessibility, best practices, and SEO. LCP was 0.93 s, CLS 0, and TBT 47.5 ms.

## How to verify

From a clean checkout with Node.js 20 or newer and the authorized factory session:

```sh
npm ci --ignore-scripts
npm test
npm run build
npm run catalog:verify
```

Run each command in `.factory/claims.json` separately. For live checks, open `/` in fresh desktop and phone contexts, then use `/demo/`, `/catalog/`, `/privacy/`, `/terms/`, a product route, and an unknown route.

## Next steps

Restore picture mappings for every current controller product. Run a clean production build and artifact verification, deploy that exact artifact, retain its exact source snapshot, and update the handoff to the live source SHA and totals. Then repeat independent verification.

No product code was changed in this verification. Offline, accounts, payments, tenant persistence, health endpoints, and product-owned rate limiting do not apply to this static catalogue. The optional Sociobot guide remains the only external runtime dependency.
