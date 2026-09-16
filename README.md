# madrileno-dev.github.io

The madrileño website: landing page and the backend's docs rendered with Astro + Starlight.

Docs are not stored here. `pnpm sync` reads them from a checkout of `madrileno-dev/madrileno` and brand assets from `madrileno-dev/.github`, and writes generated files that are gitignored.

## Local

    nvm use            # Node 24
    pnpm install
    pnpm sync --madrileno ../madrileno --brand ../madrileno-dot-github --ref main
    pnpm dev

`.env.example` lists the optional flags. Search only works in `pnpm build && pnpm preview`.

Feature icons on the landing page are from [Lucide](https://lucide.dev) (ISC).

## Deploy

GitHub Pages, from `.github/workflows/deploy.yml`, on push to `main`, on a `docs-updated` repository dispatch sent by the madrileno repo, or manually.
