import type { SectionProps } from "@/lib/types";
import { str } from "@/lib/types";

export function TestimonialsSection({ block }: SectionProps) {
  const c = block.content;
  const title = str(c.title);

  const testimonials: { name: string; quote: string; role?: string }[] = [];
  if (Array.isArray(c.items?.fieldValue)) {
    for (const item of c.items.fieldValue as Record<string, unknown>[]) {
      const name = (item.name as { fieldValue?: string })?.fieldValue || (item.name as string) || "";
      const quote = (item.quote as { fieldValue?: string })?.fieldValue || (item.quote as string) || "";
      const role = (item.role as { fieldValue?: string })?.fieldValue || (item.role as string) || "";
      testimonials.push({ name, quote, role });
    }
  }

  // Fallback: extract numbered testimonials from flat fields
  if (testimonials.length === 0) {
    let i = 1;
    while (str(c[`testimonial-${i}-title`]) || str(c[`testimonial-${i}-description`])) {
      testimonials.push({
        name: str(c[`testimonial-${i}-title`]),
        quote: str(c[`testimonial-${i}-description`]),
      });
      i++;
    }
  }

  return (
    <div className="py-16 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {title && (
          <h2 data-cms-field="title" className="text-3xl font-bold text-center mb-12">
            {title}
          </h2>
        )}
        <div data-cms-field="items" className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <blockquote key={i} className="p-6 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600 italic mb-4">&ldquo;{t.quote}&rdquo;</p>
              <footer className="font-medium">
                {t.name}
                {t.role && <span className="text-gray-500 text-sm block">{t.role}</span>}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </div>
  );
}
