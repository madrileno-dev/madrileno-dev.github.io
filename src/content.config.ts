import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  site: defineCollection({
    loader: glob({ pattern: "*.md", base: "./src/content/site" }),
    schema: z.object({ title: z.string() }),
  }),
};
