import type { SectionProps } from "@/lib/types";
import { str } from "@/lib/types";

export function FeaturesSection({ block }: SectionProps) {
  const c = block.content;
  const title = str(c.title);
  const description = str(c.description);

  const features: { title: string; description: string }[] = [];
  if (Array.isArray(c.items?.fieldValue)) {
    for (const item of c.items.fieldValue as Record<string, unknown>[]) {
      const t = (item.title as { fieldValue?: string })?.fieldValue || (item.title as string) || "";
      const d = (item.description as { fieldValue?: string })?.fieldValue || (item.description as string) || "";
      features.push({ title: t, description: d });
    }
  }

  return (
    <div className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {title && (
          <h2 data-cms-field="title" className="text-3xl font-bold text-center mb-4">
            {title}
          </h2>
        )}
        {description && (
          <p data-cms-field="description" className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            {description}
          </p>
        )}
        <div data-cms-field="items" className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, i) => (
            <div key={i} className="p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-2">{feat.title}</h3>
              <p className="text-gray-600">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
