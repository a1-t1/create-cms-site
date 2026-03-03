import { getBlocksByTags, getAllPages } from "@/lib/cms-api";
import { str, SUPPORTED_LOCALES } from "@/lib/types";
import type { ListItem } from "@/lib/types";

interface NavLink {
  label: string;
  href: string;
}

interface NavigationProps {
  locale?: string;
}

export async function Navigation({ locale = "en" }: NavigationProps) {
  let links: NavLink[] = [];

  try {
    const navBlocks = await getBlocksByTags(["navigation"], locale);
    if (navBlocks.length > 0) {
      const block = navBlocks[0];
      const items = Array.isArray(block.content.items?.fieldValue)
        ? (block.content.items.fieldValue as ListItem[])
        : [];
      links = items
        .map((item) => {
          const label = str(item.label as never);
          const rawHref = str(item.href as never, "/");
          // Prefix hrefs with locale if they start with / and don't already have a locale
          const href = rawHref.startsWith("/") ? `/${locale}${rawHref === "/" ? "" : rawHref}` : rawHref;
          return { label, href };
        })
        .filter((l) => l.label);
    }
  } catch {
    // navigation tag not available
  }

  if (links.length === 0) {
    try {
      const pages = await getAllPages();
      links = pages
        .filter((p) => p.is_published)
        .map((p) => ({
          label: p.title || p.slug,
          href:
            p.slug === "index" || p.slug === ""
              ? `/${locale}`
              : `/${locale}/${p.slug}`,
        }));
    } catch {
      // fallback if no pages
    }
  }

  return (
    <nav className="border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href={`/${locale}`} className="text-xl font-bold">
          Home
        </a>
        <div className="flex items-center gap-6">
          {links.length > 0 && (
            <ul className="flex gap-6 text-sm">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:underline text-gray-700">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-1 text-xs">
            {SUPPORTED_LOCALES.map((l) => (
              <a
                key={l.code}
                href={`/${l.code}`}
                className={`px-2 py-1 rounded ${
                  l.code === locale
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {l.code.toUpperCase()}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
