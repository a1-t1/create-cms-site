# CMS Live Preview — Developer Guide

Real-time preview lets content editors see field changes instantly in the website template while editing in the CMS admin. This guide explains how the system works and how to implement it in your own components.

## How It Works

```
CMS Admin                                    Website Template (iframe)
+--------------------------+                 +----------------------------+
| AdminPageCompositionEditor|                | CMSPreviewListener         |
|                          |                 |                            |
| User types in a field    |  postMessage    | Listens for "message"      |
| ───────────────────────> | ─────────────>  | events on window           |
|                          |                 |                            |
| Resolves:                |                 | Finds element by:          |
|  - blockTag (first tag)  |                 |  [data-cms-block="{tag}"]  |
|  - fieldName             |                 |    └─ [data-cms-field="…"] |
|  - fieldType             |                 |                            |
|  - value (string)        |                 | Updates DOM directly:      |
|                          |                 |  text → .textContent       |
|                          |                 |  richtext → .innerHTML     |
|                          |                 |  image → .src              |
|                          |                 |  list → <li> elements      |
+--------------------------+                 +----------------------------+
```

The admin embeds your website in an `<iframe>`. When a content editor changes any field, the admin sends a `postMessage` to the iframe. The `CMSPreviewListener` component (already installed in the root layout) receives the message, finds the matching DOM element via data attributes, and updates it in place — no page reload required.

## Message Protocol

### `cms-preview-update`

Sent when a field value changes.

```typescript
interface PreviewUpdateMessage {
  type: "cms-preview-update";
  blockTag: string;    // First tag of the content block (e.g., "hero", "text", "faq")
  fieldName: string;   // Field key (e.g., "title", "description", "body")
  fieldType: string;   // "text" | "richtext" | "image" | "list"
  value: string;       // New value (string or JSON-stringified for lists)
}
```

### `cms-preview-highlight`

Sent when the editor hovers over or focuses a field in the admin UI.

```typescript
interface PreviewHighlightMessage {
  type: "cms-preview-highlight";
  blockTag: string;    // First tag of the content block
  fieldName: string;   // Field key
  active: boolean;     // true = show highlight, false = remove highlight
}
```

When active, the target element gets a blue outline and is scrolled into view.

## Data Attributes

The preview system relies on two HTML data attributes to locate elements:

| Attribute | Purpose | Applied to |
|-----------|---------|------------|
| `data-cms-block="{tag}"` | Identifies the content block | The wrapping `<section>` element |
| `data-cms-field="{fieldName}"` | Identifies the field within the block | The element rendering the field value |

The listener finds elements using this selector chain:

```
document.querySelector(`[data-cms-block="${blockTag}"]`)
  .querySelector(`[data-cms-field="${fieldName}"]`)
```

### `data-cms-block`

Applied automatically by `SectionRenderer.tsx` — you don't need to add this yourself:

```tsx
// SectionRenderer.tsx — already handled
<section key={block.uuid} data-cms-block={tag}>
  <Component block={block} />
</section>
```

The `tag` value is `block.tags[0]` (the first tag on the content block).

### `data-cms-field`

You must add this to every element in your component whose content comes from a CMS field. The attribute value must match the field key exactly.

## How to Build a Live-Preview-Ready Component

### Step 1: Create the component

```tsx
// src/components/sections/MySection.tsx
import type { SectionProps } from "@/lib/types";
import { str } from "@/lib/types";

export function MySection({ block }: SectionProps) {
  const c = block.content;

  return (
    <div className="py-16 px-6 max-w-3xl mx-auto">
      {/* data-cms-field must match the field key in the CMS */}
      <h2 data-cms-field="title" className="text-3xl font-bold mb-4">
        {str(c.title, "Default Title")}
      </h2>

      <p data-cms-field="subtitle" className="text-gray-600 mb-6">
        {str(c.subtitle)}
      </p>

      {/* Richtext: use dangerouslySetInnerHTML */}
      <div
        data-cms-field="body"
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: str(c.body) }}
      />

      {/* Image: must be on an <img> element */}
      <img
        data-cms-field="heroImage"
        src={str(c.heroImage)}
        alt={str(c.title)}
        className="w-full rounded-lg mt-8"
      />
    </div>
  );
}
```

### Step 2: Register in SectionRenderer

```tsx
// src/components/SectionRenderer.tsx
import { MySection } from "./sections/MySection";

const SECTION_MAP: Record<string, React.FC<SectionProps>> = {
  // ... existing entries
  "my-section": MySection,
};
```

The key in `SECTION_MAP` must match the first tag you'll assign to this block type in the CMS.

### Step 3: Create content in the CMS

1. Create a content block with tag `my-section`
2. Add fields: `title` (text), `subtitle` (text), `body` (richtext), `heroImage` (image)
3. Add the block to a page composition
4. Open the page editor — the preview iframe shows your component with live updates

## Field Type Handling

The preview listener updates DOM elements differently based on `fieldType`:

| `fieldType` | Update method | Element requirement |
|-------------|--------------|---------------------|
| `text` | `el.textContent = value` | Any element (`<h1>`, `<p>`, `<span>`, etc.) |
| `richtext` | `el.innerHTML = value` | Any element (typically a `<div>`) |
| `image` | `el.src = value` | Must be an `<img>` element |
| `list` | Parses JSON, renders `<li>` elements | Typically a `<ul>` or `<div>` |
| *(default)* | `el.textContent = value` | Any element |

### Text fields

```tsx
<h2 data-cms-field="title">{str(c.title)}</h2>
<p data-cms-field="description">{str(c.description)}</p>
```

### Richtext fields

Use `dangerouslySetInnerHTML` so the preview listener can update via `innerHTML`:

```tsx
<div
  data-cms-field="body"
  className="prose max-w-none"
  dangerouslySetInnerHTML={{ __html: str(c.body) }}
/>
```

### Image fields

Must use an `<img>` tag — the listener checks `el instanceof HTMLImageElement` before setting `.src`:

```tsx
<img data-cms-field="featuredImage" src={str(c.featuredImage)} alt="..." />
```

### List fields

The listener receives a JSON string, parses it, and renders `<li>` elements. For basic lists, wrap in a `<ul>`:

```tsx
<ul data-cms-field="items" className="list-disc pl-6">
  {items.map((item, i) => (
    <li key={i}>{item.title}</li>
  ))}
</ul>
```

> **Note:** List preview updates replace the entire inner HTML with simple `<li>` elements. For complex list rendering (cards, grids), the live preview will show a simplified version — the full rendering appears after save + page reload.

## Existing Components Reference

These built-in components are already wired for live preview:

| Component | Tag | Fields with `data-cms-field` |
|-----------|-----|------------------------------|
| HeroSection | `hero` | `header`, `description`, `buttonText` |
| TextSection | `text` | `title`, `subtitle`, `body` |
| FeaturesSection | `features` | `title`, `description`, `items` |
| FAQSection | `faq` | `title`, `items` |
| TestimonialsSection | `testimonials` | `title`, `items` |
| CTASection | `cta` | `title`, `description`, `buttonText` |
| SliderSection | `slider` | `items` |
| GallerySection | `gallery` | `title`, `items` |
| ContactSection | `contact` | `title`, `description`, `email`, `phone`, `address` |

## Highlight Behavior

When the content editor hovers over a field in the admin panel, the preview listener:

1. Injects a CSS style (once) for `.cms-preview-highlight` — a 2px blue outline with 2px offset
2. Finds the matching element via `data-cms-block` + `data-cms-field`
3. Adds the `cms-preview-highlight` class and scrolls the element into view
4. Removes the class when the editor moves away

No extra markup is needed in your components — this works automatically if you add `data-cms-field` attributes.

## Checklist

When building a new section component, verify:

- [ ] Every visible CMS field has `data-cms-field="{fieldKey}"` on the element that displays it
- [ ] The `fieldKey` in the attribute exactly matches the field name in the CMS content block
- [ ] Richtext fields use `dangerouslySetInnerHTML`
- [ ] Image fields are on `<img>` elements
- [ ] The component is registered in `SectionRenderer.tsx` with the block tag as key
- [ ] The block tag in the CMS matches the key in `SECTION_MAP`

## Debugging Preview

If live preview isn't working:

1. **Check the iframe loads** — open your site URL directly, it should render
2. **Inspect data attributes** — in DevTools, verify `data-cms-block` and `data-cms-field` exist on the right elements
3. **Monitor messages** — add to your browser console in the iframe:
   ```js
   window.addEventListener("message", (e) => console.log("CMS message:", e.data));
   ```
4. **Verify the tag** — the `blockTag` in the message must match the `data-cms-block` value. The admin uses `block.tags[0]` as the tag
5. **Check the field name** — the `fieldName` must exactly match the `data-cms-field` value

## Architecture Notes

- **No backend required** — preview is purely client-side via `window.postMessage`
- **No WebSocket/SSE** — the iframe and parent communicate directly
- **Changes are not persisted** — preview updates are DOM-only. The actual save happens when the editor clicks Save in the admin
- **`CMSPreviewListener` is already in the root layout** — you don't need to add it to individual pages
- **Server components work fine** — the preview listener is a client component that runs alongside server-rendered content. It patches the DOM after hydration
- **Sandbox restrictions** — the iframe uses `sandbox="allow-same-origin allow-scripts"` which is sufficient for postMessage communication
