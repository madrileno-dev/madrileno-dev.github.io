import { flags } from "./flags.ts";

export const links = {
  repo: "https://github.com/madrileno-dev/madrileno",
  frontendRepo: "https://github.com/madrileno-dev/madrileno-frontend",
  org: "https://github.com/madrileno-dev",
  iterators: "https://www.iteratorshq.com/",
};

export type NavLink = { label: string; href: string; external?: boolean };

export function navLinks(): NavLink[] {
  return [
    { label: "Docs", href: "/docs/getting-started/" },
    ...(flags.manifesto ? [{ label: "Manifesto", href: "/manifesto/" }] : []),
    ...(flags.support ? [{ label: "Support", href: "/support/" }] : []),
    { label: "GitHub", href: links.repo, external: true },
  ];
}
