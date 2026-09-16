export type PageInput = { title: string; description?: string; editUrl: string; body: string };

export function extractTitle(markdown: string, sourceName: string): { title: string; body: string } {
  const nl = markdown.indexOf("\n");
  const first = nl === -1 ? markdown : markdown.slice(0, nl);
  const m = /^# (.+?)\s*#*\s*$/.exec(first);
  if (!m) {
    throw new Error(`${sourceName}: first line must be an ATX H1`);
  }
  return { title: m[1], body: nl === -1 ? "" : markdown.slice(nl + 1) };
}

function yamlString(s: string): string {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export function renderPage(p: PageInput): string {
  const lines = ["---", `title: ${yamlString(p.title)}`];
  if (p.description !== undefined) {
    lines.push(`description: ${yamlString(p.description)}`);
  }
  lines.push(`editUrl: ${yamlString(p.editUrl)}`, "---");
  return `${lines.join("\n")}\n${p.body}`;
}

export const REPO_BLOB = "https://github.com/madrileno-dev/madrileno/blob";

export type LinkContext = {
  sourceDir: "docs" | ".";
  ref: string;
  docExists: (name: string) => boolean;
};

const LINK_RE = /\[([^\]]*)\]\(([^)\s]+)(\s+"[^"]*")?\)/g;

function normalizePath(parts: string[]): string {
  const out: string[] = [];
  for (const p of parts) {
    if (p === "" || p === ".") continue;
    if (p === "..") out.pop();
    else out.push(p);
  }
  return out.join("/");
}

function rewriteTarget(target: string, ctx: LinkContext): string {
  if (/^(https?:|mailto:|tel:|#)/.test(target)) return target;
  const hashAt = target.indexOf("#");
  const path = hashAt === -1 ? target : target.slice(0, hashAt);
  const hash = hashAt === -1 ? "" : target.slice(hashAt);
  const repoPath = normalizePath([...(ctx.sourceDir === "docs" ? ["docs"] : []), ...path.split("/")]);

  if (repoPath === "README.md") return `/docs/getting-started/${hash}`;
  if (repoPath === "docs/README.md") return `/docs/${hash}`;
  const doc = /^docs\/([^/]+)\.md$/.exec(repoPath);
  if (doc) {
    if (!ctx.docExists(doc[1])) throw new Error(`unresolvable link: ${target}`);
    return `/docs/${doc[1]}/${hash}`;
  }
  if (repoPath.endsWith(".md") && repoPath.startsWith("docs/")) {
    throw new Error(`unresolvable link: ${target}`);
  }
  return `${REPO_BLOB}/${ctx.ref}/${repoPath}${hash}`;
}

function rewriteProse(text: string, ctx: LinkContext): string {
  const spans = text.split(/(`[^`]*`)/);
  return spans
    .map((span, i) =>
      i % 2 === 1
        ? span
        : span.replace(LINK_RE, (_m, label, target, title) => `[${label}](${rewriteTarget(target, ctx)}${title ?? ""})`),
    )
    .join("");
}

export function rewriteLinks(markdown: string, ctx: LinkContext): string {
  const lines = markdown.split("\n");
  let inFence = false;
  const out: string[] = [];
  let buffer: string[] = [];
  const flush = () => {
    if (buffer.length) {
      out.push(rewriteProse(buffer.join("\n"), ctx));
      buffer = [];
    }
  };
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      if (!inFence) flush();
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) out.push(line);
    else buffer.push(line);
  }
  flush();
  return out.join("\n");
}

export type IndexEntry = { name: string; description?: string };
export type IndexGroup = { label: string; entries: IndexEntry[] };
export type SidebarGroup = { label: string; items: { label: string; slug: string }[] };

const BULLET_RE = /^\s*[-*]\s+\[[^\]]*\]\(([^)\s#]+\.md)(?:#[^)]*)?\)\s*(?:—\s*(.*))?$/;

export function parseDocsIndex(markdown: string): IndexGroup[] {
  const groups: IndexGroup[] = [];
  let current: IndexGroup | undefined;
  for (const line of markdown.split("\n")) {
    const h = /^## (.+?)\s*$/.exec(line);
    if (h) {
      current = { label: h[1], entries: [] };
      groups.push(current);
      continue;
    }
    const b = BULLET_RE.exec(line);
    if (b && current) {
      const target = b[1];
      const name = target === "../README.md" ? "getting-started" : target.replace(/^.*\//, "").replace(/\.md$/, "");
      const description = b[2]?.trim();
      current.entries.push(description ? { name, description } : { name });
    }
  }
  return groups.filter((g) => g.entries.length > 0);
}

export function buildSidebar(groups: IndexGroup[], titles: Map<string, string>): SidebarGroup[] {
  return groups.map((g) => ({
    label: g.label,
    items: g.entries.map((e) => {
      const title = titles.get(e.name);
      if (title === undefined) throw new Error(`index links unrendered page: ${e.name}`);
      return { label: title, slug: `docs/${e.name}` };
    }),
  }));
}
