# Tessera Solutions

The website for Tessera Solutions Ltd at [tesserasolutions.co.uk](https://tesserasolutions.co.uk): a static Astro site served by GitHub Pages.

## Build

pnpm reads its version from `packageManager` and downloads the pinned Node.js from `devEngines.runtime`.

```sh
pnpm install
pnpm dev
pnpm check
```

- `pnpm dev` and `pnpm preview` serve on port 5190.
- `pnpm check` runs the typecheck, strict lint, format check and build, and fails on any warning.
- `pnpm brand` redraws the wordmark from the Geist font and writes the favicon, brand SVGs, `og.png` and `apple-touch-icon.png`. It needs Google Chrome installed. Run it after changing `src/brand/`, then commit the output.
- `pnpm capture <base-url> <output-dir>` saves every page at 360 and 1440 px in light and dark, and fails if a page scrolls sideways.

Company facts live in `src/site.ts`. Page text lives in `src/pages/`.

## Deploy

`.github/workflows/deploy.yml` runs `pnpm check` and publishes `dist` to GitHub Pages on every push to `main`.

Once, in the repository settings: Pages, Source, GitHub Actions; then set the custom domain to `tesserasolutions.co.uk` and turn on Enforce HTTPS once the certificate is issued. `public/CNAME` carries the domain into each deploy.

DNS at the registrar:

| Host  | Type    | Value                 |
| ----- | ------- | --------------------- |
| `@`   | `A`     | `185.199.108.153`     |
| `@`   | `A`     | `185.199.109.153`     |
| `@`   | `A`     | `185.199.110.153`     |
| `@`   | `A`     | `185.199.111.153`     |
| `@`   | `AAAA`  | `2606:50c0:8000::153` |
| `@`   | `AAAA`  | `2606:50c0:8001::153` |
| `@`   | `AAAA`  | `2606:50c0:8002::153` |
| `@`   | `AAAA`  | `2606:50c0:8003::153` |
| `www` | `CNAME` | `maxymax92.github.io` |

Verify the domain under the GitHub account's Pages settings first, so nobody else can claim it.

## Owed

- The registered office. Set `registeredOffice` in `src/site.ts` and the footer shows it.
