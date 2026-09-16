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
