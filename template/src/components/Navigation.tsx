import { getBlocksByTags, getAllPages } from "@/lib/cms-api";
import { str } from "@/lib/types";
import type { ListItem } from "@/lib/types";

interface NavLink {
  label: string;
  href: string;
}

export async function Navigation() {
  let links: NavLink[] = [];

  try {
    const navBlocks = await getBlocksByTags(["navigation"]);
    if (navBlocks.length > 0) {
      const block = navBlocks[0];
      const items = Array.isArray(block.content.items?.fieldValue)
        ? (block.content.items.fieldValue as ListItem[])
        : [];
      links = items
        .map((item) => ({
          label: str(item.label as never),
          href: str(item.href as never, "/"),
        }))
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
          href: p.slug === "index" || p.slug === "" ? "/" : `/${p.slug}`,
        }));
    } catch {
      // fallback if no pages
    }
  }

  return (
    <nav className="border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-bold">
          Home
        </a>
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
      </div>
    </nav>
  );
}
