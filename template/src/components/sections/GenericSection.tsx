import type { SectionProps } from "@/lib/types";

export function GenericSection({ block }: SectionProps) {
  const c = block.content;
  const entries = Object.entries(c).filter(
    ([, field]) => field?.fieldValue !== undefined && field?.fieldValue !== null && field?.fieldValue !== ""
  );

  return (
    <div className="py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {entries.map(([key, field]) => {
          const value = field.fieldValue;

          if (field.fieldType === "image" && typeof value === "string") {
            return (
              <img
                key={key}
                data-cms-field={key}
                src={value}
                alt={key}
                className="w-full max-w-lg mx-auto rounded-lg mb-4"
              />
            );
          }

          if (field.fieldType === "richtext" && typeof value === "string") {
            return (
              <div
                key={key}
                data-cms-field={key}
                className="prose prose-gray max-w-none mb-4"
                dangerouslySetInnerHTML={{ __html: value }}
              />
            );
          }

          if (Array.isArray(value)) {
            return (
              <ul key={key} data-cms-field={key} className="list-disc pl-6 mb-4 space-y-1">
                {value.map((item, i) => (
                  <li key={i} className="text-gray-700">
                    {typeof item === "string" ? item : JSON.stringify(item)}
                  </li>
                ))}
              </ul>
            );
          }

          if (typeof value === "string") {
            return (
              <p key={key} data-cms-field={key} className="text-gray-700 mb-3">
                {value}
              </p>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
