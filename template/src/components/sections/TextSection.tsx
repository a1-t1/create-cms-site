import type { SectionProps } from "@/lib/types";
import { str } from "@/lib/types";

export function TextSection({ block }: SectionProps) {
  const c = block.content;
  const title = str(c.title);
  const subtitle = str(c.subtitle);
  const body = str(c.body);

  return (
    <div className="py-16 px-6 max-w-3xl mx-auto">
      {title && (
        <h2 data-cms-field="title" className="text-3xl font-bold mb-4">
          {title}
        </h2>
      )}
      {subtitle && (
        <p data-cms-field="subtitle" className="text-lg text-gray-600 mb-6">
          {subtitle}
        </p>
      )}
      {body && (
        <div
          data-cms-field="body"
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      )}
    </div>
  );
}
