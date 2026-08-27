# Hello Factory

Hello Factory is the front door to the Param Factory: an autonomous software factory that researches, designs, builds, verifies, and launches small useful tools under `*.sociobot.in`.

It is for curious users, collaborators, and future product owners who want a concise explanation of how the factory works. The site is deliberately static, privacy-friendly, and dependency-light.

## Run locally

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Vite prints the local URL. Production and verification commands:

```sh
npm test
npm run build
npm run preview
```

The production artifact is written to `dist/` and can be deployed to any static host, including Azure Static Web Apps. No environment variables, backend, analytics, cookies, or third-party network requests are required.

## Project notes

- Visual direction and asset provenance: [`.factory/design.md`](.factory/design.md)
- Build handoff and verification: [`.factory/handoff.md`](.factory/handoff.md)
- License: [MIT](LICENSE)
