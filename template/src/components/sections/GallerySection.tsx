import type { SectionProps, ListItem } from "@/lib/types";
import { str } from "@/lib/types";

export function GallerySection({ block }: SectionProps) {
  const c = block.content;
  const title = str(c.title);
  const items = (Array.isArray(c.items?.fieldValue) ? c.items.fieldValue : []) as ListItem[];

  return (
    <div className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 data-cms-field="title" className="text-3xl font-bold text-center mb-10">
            {title}
          </h2>
        )}
        <div
          data-cms-field="items"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        >
          {items.map((item) => {
            const image = str(item.image as never);
            const caption = str(item.caption as never);
            if (!image) return null;
            return (
              <figure key={item.id} className="group overflow-hidden rounded-lg">
                <img
                  src={image}
                  alt={caption || "Gallery image"}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {caption && (
                  <figcaption className="p-3 text-sm text-gray-600 text-center">
                    {caption}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </div>
    </div>
  );
}
