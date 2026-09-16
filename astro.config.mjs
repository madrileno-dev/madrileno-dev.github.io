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
      favicon: "/favicon.svg",
      customCss: ["./src/styles/starlight.css"],
      components: {
        SiteTitle: "./src/components/StarlightSiteTitle.astro",
        SocialIcons: "./src/components/StarlightSocialIcons.astro",
        ThemeSelect: "./src/components/StarlightThemeSelect.astro",
      },
      head: [
        { tag: "link", attrs: { rel: "preconnect", href: "https://fonts.googleapis.com" } },
        { tag: "link", attrs: { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: true } },
        { tag: "link", attrs: { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Manrope:wght@600;700&display=swap" } },
        { tag: "meta", attrs: { property: "og:image", content: "https://raw.githubusercontent.com/madrileno-dev/.github/main/brand/png/social-backend.png" } },
      ],
      sidebar,
      lastUpdated: false,
      expressiveCode: {
        shiki: { langAlias: { hocon: "properties" } },
      },
      plugins: [starlightLinksValidator({ errorOnLocalLinks: false })],
    }),
  ],
});
