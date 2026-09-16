import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { buildSidebar, extractTitle, parseDocsIndex, renderPage, rewriteLinks } from "./transform.ts";

const EDIT_BASE = "https://github.com/madrileno-dev/madrileno/edit/main";

type Options = { madrileno: string; brand: string; ref: string };

function parse(): Options {
  const { values } = parseArgs({
    options: {
      madrileno: { type: "string" },
      brand: { type: "string" },
      ref: { type: "string", default: "main" },
    },
  });
  if (!values.madrileno || !values.brand) {
    throw new Error("usage: sync --madrileno <checkout> --brand <checkout> [--ref <ref>]");
  }
  return { madrileno: resolve(values.madrileno), brand: resolve(values.brand), ref: values.ref! };
}

function resetDir(dir: string): void {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

function sync(opts: Options): void {
  const docsDir = join(opts.madrileno, "docs");
  const outDocs = resolve("src/content/docs/docs");
  const outGenerated = resolve("src/generated");
  const outBrand = resolve("public/brand");

  const docNames = readdirSync(docsDir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
  const docExists = (n: string) => docNames.includes(n) || n === "getting-started";

  const index = parseDocsIndex(readFileSync(join(docsDir, "README.md"), "utf8"));
  const descriptions = new Map(
    index.flatMap((g) => g.entries.filter((e) => e.description).map((e) => [e.name, e.description!] as const)),
  );

  resetDir(outDocs);
  const titles = new Map<string, string>();

  for (const name of docNames) {
    const source = `docs/${name}.md`;
    const { title, body } = extractTitle(readFileSync(join(docsDir, `${name}.md`), "utf8"), source);
    titles.set(name, title);
    const rewritten = rewriteLinks(body, { sourceDir: "docs", ref: opts.ref, docExists });
    writeFileSync(
      join(outDocs, `${name}.md`),
      renderPage({ title, description: descriptions.get(name), editUrl: `${EDIT_BASE}/${source}`, body: rewritten }),
    );
  }

  const readme = extractTitle(readFileSync(join(opts.madrileno, "README.md"), "utf8"), "README.md");
  titles.set("getting-started", "Getting started");
  writeFileSync(
    join(outDocs, "getting-started.md"),
    renderPage({
      title: "Getting started",
      description: descriptions.get("getting-started"),
      editUrl: `${EDIT_BASE}/README.md`,
      body: rewriteLinks(readme.body, { sourceDir: ".", ref: opts.ref, docExists }),
    }),
  );

  mkdirSync(outGenerated, { recursive: true });
  writeFileSync(join(outGenerated, "sidebar.json"), `${JSON.stringify(buildSidebar(index, titles), null, 2)}\n`);
  const indexed = new Set(index.flatMap((g) => g.entries.map((e) => e.name)));
  for (const name of titles.keys()) {
    if (!indexed.has(name)) console.warn(`warning: not in sidebar (add it to docs/README.md upstream): ${name}`);
  }

  const brandDir = join(opts.brand, "brand");
  if (!existsSync(join(brandDir, "favicon.svg"))) throw new Error(`no brand pack at ${brandDir}`);
  resetDir(outBrand);
  for (const f of readdirSync(brandDir).filter((f) => f.endsWith(".svg"))) {
    cpSync(join(brandDir, f), join(outBrand, f));
  }
  cpSync(join(brandDir, "favicon.svg"), resolve("public/favicon.svg"));
  const outAssets = resolve("src/assets/brand");
  resetDir(outAssets);
  for (const f of ["logo.svg", "logo-dark.svg"]) cpSync(join(brandDir, f), join(outAssets, f));

  console.log(`synced ${docNames.length + 1} pages, ${index.length} sidebar groups, brand assets, ref ${opts.ref}`);
}

try {
  sync(parse());
} catch (e) {
  console.error(`sync failed: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
}
