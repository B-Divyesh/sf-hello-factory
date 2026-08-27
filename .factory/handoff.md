# Hello Factory handoff

## Delivered

- Built the single-page Param Factory introduction with Vite and vanilla TypeScript.
- Added the editorial hero, five-stage research → design → build → verify → launch explanation, one-item live product ledger, live UTC clock, fixed build timestamp, and generated-imagery disclosure.
- Created the responsive lighthouse hero with the required factory generator. The original PNG and prompt sidecar live in `assets/src/`; production WebP variants are 18.6 KB (768 px) and 50.4 KB (1280 px).
- Added semantic landmarks, one H1, skip navigation, visible focus states, 44 px targets, responsive 390 px behavior, meaningful alt text, high-contrast tokens, and reduced-motion support.
- Added security/cache headers for Azure Static Web Apps, a favicon, robots file, and sitemap. The site has no analytics, cookies, storage, third-party scripts, or runtime asset requests, so privacy/terms pages are not required.
- Documented the product, visual thesis, asset provenance, local commands, and static deployment path.

## Verification (2026-08-27)

- `npm ci`: passes with 0 vulnerabilities.
- `npm test`: 2 meaningful product-summary tests pass.
- `npm run build`: passes and creates `dist/`.
- Built HTML contains `lang="en"`, `<title>`, `<main>`, exactly one `<h1>`, and meaningful image alt text.
- Production JS: 1.61 KB uncompressed (0.83 KB gzip), below the 60 KB work-order budget.
- Playwright smoke checks at 390×844 and 1440×1000: no console errors or page errors.
- Axe Core WCAG 2 A/AA/2.1 AA at both viewport sizes: 0 violations.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100. LCP 1.2 s, CLS 0, TBT 0 ms.
- Full-page mobile screenshot was reviewed at 390 px; content is readable, complete, and free of horizontal clipping.

## Run

```sh
npm ci
npm test
npm run build
npm run preview
```

## Known gaps / next steps

No known release blockers. The product ledger currently contains the only confirmed live product, Hello Factory; add verified launches to `src/products.ts` as the fleet grows.
