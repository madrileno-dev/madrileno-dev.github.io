export const links = {
  repo: "https://github.com/madrileno-dev/madrileno",
  frontendRepo: "https://github.com/madrileno-dev/madrileno-frontend",
  mobileRepo: "https://github.com/madrileno-dev/madrileno-mobile",
  org: "https://github.com/madrileno-dev",
  iterators: "https://www.iteratorshq.com/",
  iteratorsContact: "https://www.iteratorshq.com/contact/",
};

export type NavLink = { label: string; href: string; external?: boolean; icon?: "github" };

export function navLinks(): NavLink[] {
  return [
    { label: "Docs", href: "/docs/getting-started/" },
    { label: "Manifesto", href: "/manifesto/" },
    { label: "Support", href: "/support/" },
    { label: "GitHub", href: links.repo, external: true, icon: "github" },
  ];
}
