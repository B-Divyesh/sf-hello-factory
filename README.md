# Hello Factory

Hello Factory helps people find a focused Param Factory tool for a specific job. Visitors can search the public catalogue, compare each product’s current QA state, and open the product at its own address.

Live site: <https://hello-factory.sociobot.in>

## Run and verify

Use Node.js 20 or newer. Tests run from the tracked snapshot without cloud credentials. A production build also needs an internet connection and the worker’s authorized Azure session.

```sh
npm ci
npm test
npm run build
npm run preview
```

`npm test` runs unit, catalogue-publication, claim, browser, and axe checks. `npm run build` compiles the UI, fetches the current authorized controller snapshot, and then overwrites the catalogue data in `dist/`. The artifact includes product JSON, detail routes, sitemap entries, and every preserved picture.

For a single local command, run `npm run dev`. It builds the catalogue first, then starts the preview server.

The one-click sample is at <https://hello-factory.sociobot.in/demo/>. It uses six read-only catalogue rows, writes no browser storage, and provides **Reset demo** and **Start for real** actions.

## Catalogue input

The tracked `.factory/input/latest-catalog.json` makes tests reproducible. Every production build replaces it from the one authorized controller blob before publishing data. An authorized factory worker can refresh only that input with:

```sh
npm run catalog:fetch
```

The publisher validates exact catalogue, detail, state, and kind totals. It stops when any current product lacks a picture. It supplies conservative `kind` and `category` defaults, writes every product route, rebuilds the sitemap, and downloads the complete image map from this product or an exact Hello Factory work-order input selected by the controller. `npm run catalog:verify` checks the completed artifact against the fetched file, including every WebP header and dimension.

## Privacy and deployment

Normal catalogue browsing has no account, cookies, analytics, or stored search history. Local search does not send the search words. The optional guide sends a query to `api.sociobot.in` only after **Ask the guide** is chosen. Details are on the `/privacy/` route.

Deploy the generated `dist/` directory as an Azure Static Web Apps artifact. `public/staticwebapp.config.json` supplies the product’s security, caching, and 404 behavior. The factory owns deployment; this repository does not change DNS, billing, or shared services.

## Project records

- Visual direction and asset provenance: [`.factory/design.md`](.factory/design.md)
- Public claim tests: [`.factory/claims.json`](.factory/claims.json)
- Demo contract: [`.factory/demo.md`](.factory/demo.md)
- Latest handoff: [`.factory/handoff.md`](.factory/handoff.md)
- License: [MIT](LICENSE)
