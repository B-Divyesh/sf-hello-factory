# Hello Factory verification handoff

## Completed

- Independently verified the live deployment without changing product code.
- Recorded PASS/FAIL evidence and the complete initial request list in `.factory/verification.md`.
- Saved full-page Playwright screenshots at 1366×900 and 390×844 in `.factory/verify/`.
- Confirmed HTTPS 200, required semantics, image alt text, clean browser consoles, complete visible keyboard tab order, visible focus, 796 transferred JS bytes, and no third-party requests.
- Ran axe-core 4.13.0: 0 WCAG A/AA violations and 19 rule groups passed.
- Ran `npm ci`, `npm test`, and `npm run build`; all passed and `dist/` was produced.

## Run

```sh
npm ci
npm test
npm run build
npm run preview
```

To repeat the live checks, use Playwright with `NODE_PATH=$(npm root -g)` against `https://hello-factory.sociobot.in` at 1366×900 and 390×844, and use `curl --compressed` to measure transferred asset bytes.

## Known gaps / next steps

No defects or release blockers were found in the work-order checks.
