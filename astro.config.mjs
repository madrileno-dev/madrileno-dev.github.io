import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightLinksValidator from "starlight-links-validator";
import { readFileSync } from "node:fs";

const site = process.env.SITE_URL ?? "https://madrileno-dev.github.io";
const sidebar = JSON.parse(readFileSync(new URL("./src/generated/sidebar.json", import.meta.url), "utf8"));

export default defineConfig({
  site,
  base: "/",
  trailingSlash: "always",
  redirects: { "/docs/": "/docs/getting-started/" },
  integrations: [
    starlight({
      title: "madrileño",
      sidebar,
      lastUpdated: false,
      expressiveCode: { shiki: { langAlias: { hocon: "properties" } } },
      plugins: [starlightLinksValidator({ errorOnLocalLinks: false })],
    }),
  ],
});
