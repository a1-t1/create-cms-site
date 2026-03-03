import type { SectionProps } from "@/lib/types";
import { str } from "@/lib/types";

export function CTASection({ block }: SectionProps) {
  const c = block.content;
  const description = str(c.description);
  const buttonText = str(c.buttonText);

  return (
    <div className="py-20 px-6 bg-gray-900 text-white text-center">
      <div className="max-w-2xl mx-auto">
        <h2 data-cms-field="title" className="text-3xl font-bold mb-4">
          {str(c.title, "Ready to get started?")}
        </h2>
        {description && (
          <p data-cms-field="description" className="text-lg text-gray-300 mb-8">
            {description}
          </p>
        )}
        {buttonText && (
          <a
            data-cms-field="buttonText"
            href={str(c.buttonLink, "#")}
            className="inline-block px-8 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            {buttonText}
          </a>
        )}
      </div>
    </div>
  );
}
