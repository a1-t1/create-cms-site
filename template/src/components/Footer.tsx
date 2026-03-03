import { getBlocksByTags } from "@/lib/cms-api";
import { str } from "@/lib/types";
import type { ListItem } from "@/lib/types";

export async function Footer() {
  let copyright = `© ${new Date().getFullYear()} All rights reserved.`;
  let links: { label: string; href: string }[] = [];

  try {
    const footerBlocks = await getBlocksByTags(["footer"]);
    if (footerBlocks.length > 0) {
      const block = footerBlocks[0];
      const c = block.content;
      if (str(c.copyright)) copyright = str(c.copyright);
      const items = Array.isArray(c.links?.fieldValue)
        ? (c.links.fieldValue as ListItem[])
        : [];
      links = items
        .map((item) => ({
          label: str(item.label as never),
          href: str(item.href as never, "#"),
        }))
        .filter((l) => l.label);
    }
  } catch {
    // footer tag not available
  }

  return (
    <footer className="border-t mt-16">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">{copyright}</p>
        {links.length > 0 && (
          <ul className="flex gap-6 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-gray-500 hover:underline">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
