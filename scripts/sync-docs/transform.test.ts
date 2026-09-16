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
