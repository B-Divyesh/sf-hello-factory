# Independent verification

Date: 2026-08-27  
Target: https://hello-factory.sociobot.in  
Source revision: `e50e9ded9438f484b062c76a3a9c2954c5c8f9fa`

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| HTTPS and document semantics | PASS | `curl` returned HTTP/2 200 over HTTPS. Title: `Hello Factory — Small useful software, shipped`; `<html lang="en">`; exactly 1 `<h1>`; exactly 1 `<main>`; 1 image and it has meaningful alt text. |
| Runtime errors and responsive load | PASS | Playwright loaded desktop 1366×900 and mobile 390×844 with 0 console errors and 0 page errors at both sizes. Screenshots: `verify/desktop.png` and `verify/mobile.png`. |
| Keyboard and focus | PASS | Desktop: all 6 visible interactive elements were reached in order by Tab. Mobile: all 5 visible interactive elements were reached (the desktop-only `How it works` link is hidden and omitted from the mobile tab order). No trap. Every focused element had a visible `3px solid rgb(159, 52, 36)` outline. The skip link is first. |
| JavaScript and origins | PASS | One JS request, `/assets/index-3z3849CA.js`, transferred 796 bytes (0.78 KB), below 60 KB. All 4 initial requests used origin `https://hello-factory.sociobot.in`; no third-party requests. |
| Clean install, tests, build | PASS | `npm ci` passed (55 packages, 0 vulnerabilities); `npm test` passed (1 file, 2 tests); `npm run build` passed and generated `dist/` (JS 1.61 KB / 0.83 KB gzip). |

## Initial request list

| Resource | Type | HTTP | Transferred |
| --- | --- | ---: | ---: |
| `/` | document | 200 | 4,948 bytes |
| `/assets/index-3z3849CA.js` | script | 200 | 796 bytes |
| `/assets/index-D7xMhW5S.css` | stylesheet | 200 | 2,676 bytes |
| `/assets/hero-lighthouse-768.webp` | image | 200 | 18,628 bytes |

The transferred-byte figures were independently measured with `curl --compressed`. Playwright observed the same four-request set in both viewports.

## Additional accessibility evidence

An axe-core 4.13.0 WCAG 2 A/AA and 2.1 A/AA scan at 390×844 reported 0 violations and 19 passed rule groups. Two automated checks were inconclusive and manually reviewed: a label on a non-interactive clock container, and an `aria-hidden` decorative arrow. Neither creates a failure in the requested checks.

## Defects

None.
