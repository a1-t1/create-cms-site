"use client";

import { useState } from "react";
import type { SectionProps, ListItem } from "@/lib/types";
import { str } from "@/lib/types";

export function SliderSection({ block }: SectionProps) {
  const c = block.content;
  const items = (Array.isArray(c.items?.fieldValue) ? c.items.fieldValue : []) as ListItem[];
  const [current, setCurrent] = useState(0);

  if (items.length === 0) return null;

  const item = items[current];
  const title = str(item.title as never);
  const subtitle = str(item.subtitle as never);
  const image = str(item.image as never);
  const linkUrl = str(item.linkUrl as never);
  const linkText = str(item.linkText as never, "Learn more");

  return (
    <div className="relative py-16 px-6" data-cms-field="items">
      <div className="max-w-4xl mx-auto text-center">
        {image && (
          <img
            src={image}
            alt={title}
            className="w-full max-h-96 object-cover rounded-lg mb-6"
          />
        )}
        {title && <h2 className="text-3xl font-bold">{title}</h2>}
        {subtitle && <p className="mt-2 text-lg text-gray-600">{subtitle}</p>}
        {linkUrl && (
          <a
            href={linkUrl}
            className="mt-4 inline-block px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            {linkText}
          </a>
        )}
      </div>

      {items.length > 1 && (
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => setCurrent((c) => (c - 1 + items.length) % items.length)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Previous slide"
          >
            &larr;
          </button>
          <span className="flex items-center text-sm text-gray-500">
            {current + 1} / {items.length}
          </span>
          <button
            onClick={() => setCurrent((c) => (c + 1) % items.length)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Next slide"
          >
            &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
