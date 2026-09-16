import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

const site = process.env.SITE_URL ?? "https://madrileno-dev.github.io";

export default defineConfig({
  site,
  base: "/",
  trailingSlash: "always",
  integrations: [
    starlight({
      title: "madrileño",
      sidebar: [],
    }),
  ],
});
