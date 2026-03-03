import type { SectionProps } from "@/lib/types";
import { str } from "@/lib/types";

export function HeroSection({ block }: SectionProps) {
  const c = block.content;
  const buttonText = str(c.buttonText);

  return (
    <div className="py-20 px-6 text-center">
      <h1 data-cms-field="header" className="text-4xl md:text-5xl font-bold tracking-tight">
        {str(c.header, "Hero Title")}
      </h1>
      <p data-cms-field="description" className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
        {str(c.description, "Hero description goes here.")}
      </p>
      {buttonText && (
        <a
          data-cms-field="buttonText"
          href={str(c.buttonLink, "#")}
          className="mt-8 inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          {buttonText}
        </a>
      )}
    </div>
  );
}
