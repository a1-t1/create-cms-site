import type { SectionProps } from "@/lib/types";
import { str } from "@/lib/types";

export function FAQSection({ block }: SectionProps) {
  const c = block.content;
  const title = str(c.title);

  const faqs: { question: string; answer: string }[] = [];
  if (Array.isArray(c.items?.fieldValue)) {
    for (const item of c.items.fieldValue as Record<string, unknown>[]) {
      const question = (item.question as { fieldValue?: string })?.fieldValue || (item.question as string) || "";
      const answer = (item.answer as { fieldValue?: string })?.fieldValue || (item.answer as string) || "";
      faqs.push({ question, answer });
    }
  }

  // Fallback: treat each content key as a question/answer pair
  if (faqs.length === 0) {
    for (const [key, field] of Object.entries(c)) {
      if (key === "title" || key === "description") continue;
      if (field?.fieldValue && typeof field.fieldValue === "string") {
        faqs.push({ question: key, answer: field.fieldValue });
      }
    }
  }

  return (
    <div className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {title && (
          <h2 data-cms-field="title" className="text-3xl font-bold text-center mb-12">
            {title}
          </h2>
        )}
        <div data-cms-field="items" className="space-y-6">
          {faqs.map((faq, i) => (
            <details key={i} className="border border-gray-200 rounded-lg">
              <summary className="px-6 py-4 cursor-pointer font-medium hover:bg-gray-50">
                {faq.question}
              </summary>
              <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
