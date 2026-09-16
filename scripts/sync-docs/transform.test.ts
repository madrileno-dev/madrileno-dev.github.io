import { describe, expect, it } from "vitest";
import { extractTitle, renderPage } from "./transform.ts";

describe("extractTitle", () => {
  it("takes the first-line H1 as title and drops it from the body", () => {
    const r = extractTitle("# Dev workflow\n\nText.\n", "dev-workflow.md");
    expect(r).toEqual({ title: "Dev workflow", body: "\nText.\n" });
  });

  it("fails when line one is not an H1", () => {
    expect(() => extractTitle("Intro\n# Late\n", "x.md")).toThrow("x.md: first line must be an ATX H1");
  });

  it("ignores H1-looking lines inside fences later in the file", () => {
    const md = "# Deployment\n\n```bash\n# Build the image\n```\n";
    expect(extractTitle(md, "deployment.md").title).toBe("Deployment");
  });
});

describe("renderPage", () => {
  it("emits frontmatter with quoted strings and the body", () => {
    const out = renderPage({
      title: "Feature flags",
      description: "typed variants, targeting rules",
      editUrl: "https://github.com/madrileno-dev/madrileno/edit/main/docs/feature-flags.md",
      body: "\nBody.\n",
    });
    expect(out).toBe(
      [
        "---",
        'title: "Feature flags"',
        'description: "typed variants, targeting rules"',
        'editUrl: "https://github.com/madrileno-dev/madrileno/edit/main/docs/feature-flags.md"',
        "---",
        "",
        "Body.",
        "",
      ].join("\n"),
    );
  });

  it("omits description when absent and escapes double quotes", () => {
    const out = renderPage({ title: 'The "m" mark', editUrl: "u", body: "" });
    expect(out.startsWith('---\ntitle: "The \\"m\\" mark"\neditUrl: "u"\n---\n')).toBe(true);
  });
});

import { rewriteLinks, type LinkContext } from "./transform.ts";

const docs = new Set(["http", "auth", "principles", "scripts", "dev-workflow"]);
const fromDoc: LinkContext = { sourceDir: "docs", ref: "abc123", docExists: (n) => docs.has(n) };
const fromRoot: LinkContext = { sourceDir: ".", ref: "abc123", docExists: (n) => docs.has(n) };

describe("rewriteLinks", () => {
  it("leaves absolute, mailto and pure-anchor links alone", () => {
    const md = "[a](https://x.y/z) [b](http://x.y) [c](mailto:x@y.z) [d](#anchor)";
    expect(rewriteLinks(md, fromDoc)).toBe(md);
  });

  it("maps a sibling doc to its site path, keeping anchors", () => {
    expect(rewriteLinks("[x](http.md)", fromDoc)).toBe("[x](/docs/http/)");
    expect(rewriteLinks("[x](http.md#pagination)", fromDoc)).toBe("[x](/docs/http/#pagination)");
  });

  it("maps docs/<name>.md and docs/README.md from the root README", () => {
    expect(rewriteLinks("[x](docs/auth.md)", fromRoot)).toBe("[x](/docs/auth/)");
    expect(rewriteLinks("[x](docs/README.md)", fromRoot)).toBe("[x](/docs/)");
  });

  it("maps ../README.md from a doc to getting-started, keeping anchors", () => {
    expect(rewriteLinks("[x](../README.md#quick-start)", fromDoc)).toBe("[x](/docs/getting-started/#quick-start)");
  });

  it("maps other relative paths to a blob URL at the ref, resolving ..", () => {
    expect(rewriteLinks("[x](../build.sbt)", fromDoc)).toBe(
      "[x](https://github.com/madrileno-dev/madrileno/blob/abc123/build.sbt)",
    );
    expect(rewriteLinks("[x](../CLAUDE.md)", fromDoc)).toBe(
      "[x](https://github.com/madrileno-dev/madrileno/blob/abc123/CLAUDE.md)",
    );
    expect(rewriteLinks("[x](LICENSE)", fromRoot)).toBe(
      "[x](https://github.com/madrileno-dev/madrileno/blob/abc123/LICENSE)",
    );
    expect(rewriteLinks("[x](scripts/init-project.scala)", fromRoot)).toBe(
      "[x](https://github.com/madrileno-dev/madrileno/blob/abc123/scripts/init-project.scala)",
    );
  });

  it("keeps an optional link title", () => {
    expect(rewriteLinks('[x](auth.md "Auth")', fromDoc)).toBe('[x](/docs/auth/ "Auth")');
  });

  it("does not touch fenced code or inline code", () => {
    const md = "```md\n[not](missing.md)\n```\nSee `[no](missing.md)` and [ok](auth.md)";
    expect(rewriteLinks(md, fromDoc)).toBe(
      "```md\n[not](missing.md)\n```\nSee `[no](missing.md)` and [ok](/docs/auth/)",
    );
  });

  it("fails on a relative .md that is not a known doc", () => {
    expect(() => rewriteLinks("[x](missing.md)", fromDoc)).toThrow("unresolvable link: missing.md");
  });
});
