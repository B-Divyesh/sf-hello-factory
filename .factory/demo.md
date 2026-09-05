# Hello Factory demo

- URL: `https://hello-factory.sociobot.in/demo/`
- Entry: choose **Try it with sample data** on the first screen.
- Sample: six real game-night catalogue entries. Each pinned sample entry is released with a passed QA state.
- Reset: change the sample search, then choose **Reset demo** to restore `plan a game night` and all six entries.
- Exit: choose **Start for real** to open the full catalogue.
- Isolation: the demo is read-only. It uses in-memory filtering and no cookies, localStorage, sessionStorage, IndexedDB, or service worker state.
- Regression: `npm run test:browser -- --grep @claim:demo-sandbox` starts a fresh phone context. It checks all six QA results, changes and resets the sample, exits, and verifies storage and request origins.
