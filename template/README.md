# CMS Website Template

A full-featured Next.js 15 website template that renders content from the eSTATION CMS. Includes SSR + ISR, real-time live preview, blog, news, events, search, collections, dynamic navigation/footer, SEO metadata, and sitemap generation.

## Quick Start

```bash
cp .env.example .env.local
# Edit .env.local with your CMS credentials

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CMS_API_URL` | CMS API base URL (e.g., `https://cms-gateway.estation.io/api/v1`) |
| `CMS_API_TOKEN` | Your tenant's API token |
| `REVALIDATE_SECRET` | Secret for on-demand ISR revalidation webhook |
| `NEXT_PUBLIC_SITE_URL` | Public site URL for sitemap generation (e.g., `https://your-site.com`) |

## Architecture

```
src/
├── app/
│   ├── page.tsx                    # Homepage (slug: "index")
│   ├── [slug]/page.tsx             # Dynamic CMS pages
│   ├── blog/
│   │   ├── page.tsx                # Blog listing
│   │   └── [slug]/page.tsx         # Blog detail
│   ├── news/
│   │   ├── page.tsx                # News listing
│   │   └── [slug]/page.tsx         # News detail
│   ├── events/
│   │   ├── page.tsx                # Events listing
│   │   └── [slug]/page.tsx         # Event detail
│   ├── search/page.tsx             # Search page
│   ├── collections/[uuid]/page.tsx # Collection results
│   ├── sitemap.ts                  # Dynamic sitemap
│   ├── layout.tsx                  # Root layout (nav + footer)
│   └── api/revalidate/route.ts     # ISR revalidation endpoint
├── components/
│   ├── Navigation.tsx              # Dynamic navigation
│   ├── Footer.tsx                  # Dynamic footer
│   ├── SectionRenderer.tsx         # Block → component mapper
│   ├── cms-preview-listener.tsx    # Live preview handler
│   └── sections/                   # Section components
│       ├── HeroSection.tsx
│       ├── TextSection.tsx
│       ├── FeaturesSection.tsx
│       ├── FAQSection.tsx
│       ├── TestimonialsSection.tsx
│       ├── CTASection.tsx
│       ├── SliderSection.tsx
│       ├── GallerySection.tsx
│       ├── ContactSection.tsx
│       └── GenericSection.tsx
└── lib/
    ├── types.ts                    # TypeScript interfaces
    ├── cms-api.ts                  # CMS API client
    └── content-helpers.ts          # Utility functions
```

## Section Components

| Component | Block Tag(s) | Fields |
|-----------|-------------|--------|
| HeroSection | `hero` | `header`, `description`, `buttonText`, `buttonLink` |
| TextSection | `text` | `title`, `subtitle`, `body` (richtext) |
| FeaturesSection | `features`, `feature` | `title`, `description`, `items` (list) |
| FAQSection | `faq` | `title`, `items` (list: `question`, `answer`) |
| TestimonialsSection | `testimonials`, `testimonial` | `title`, `items` (list: `name`, `quote`, `role`) |
| CTASection | `cta` | `title`, `description`, `buttonText`, `buttonLink` |
| SliderSection | `slider`, `sliders` | `items` (list: `title`, `subtitle`, `image`, `linkUrl`, `linkText`) |
| GallerySection | `gallery` | `title`, `items` (list: `image`, `caption`) |
| ContactSection | `contact`, `form` | `title`, `description`, `email`, `phone`, `address` |
| GenericSection | (fallback) | Renders all fields dynamically |

## Content Types

### Blog Posts

- **CMS tag:** `blogs`
- **Fields:** `slug`, `title`, `author`, `publishDate`, `featuredImage`, `excerpt`, `content` (richtext)
- **Routes:** `/blog` (listing), `/blog/[slug]` (detail)

### News Articles

- **CMS tag:** `news`
- **Fields:** `slug`, `title`, `author`, `category`, `publishDate`, `featuredImage`, `excerpt`, `content` (richtext)
- **Routes:** `/news` (listing), `/news/[slug]` (detail)

### Events

- **CMS tag:** `events`
- **Fields:** `slug`, `title`, `description`, `location`, `startDate`, `endDate`, `organizer`, `content` (richtext)
- **Routes:** `/events` (listing), `/events/[slug]` (detail)

## Routing

| Route | Source |
|-------|--------|
| `/` | Homepage — CMS page with slug `index` |
| `/[slug]` | Dynamic CMS pages |
| `/blog` | Blog listing |
| `/blog/[slug]` | Blog post detail |
| `/news` | News listing |
| `/news/[slug]` | News article detail |
| `/events` | Events listing |
| `/events/[slug]` | Event detail |
| `/search?q=...` | Search results |
| `/collections/[uuid]` | Collection execution results |
| `/sitemap.xml` | Auto-generated sitemap |

## Navigation

The `Navigation` component fetches blocks tagged `navigation` from the CMS. Expected field structure:

- `items` (list): each item has `label` and `href`

If no `navigation` block exists, it auto-generates links from all published CMS pages.

## Footer

The `Footer` component fetches blocks tagged `footer`. Expected field structure:

- `copyright` (text)
- `links` (list): each item has `label` and `href`

Falls back to a default copyright notice if no footer block exists.

## SEO

Every page generates `<title>` and `<meta name="description">` from CMS content:

- Homepage and dynamic pages use the page composition's `title` and `description`
- Blog, news, and event detail pages use the block's `title` and `excerpt`/`description`

## Sitemap

`/sitemap.xml` is dynamically generated from:

- All published CMS pages
- All blog posts, news articles, and events with slugs

Set `NEXT_PUBLIC_SITE_URL` to your production URL for correct sitemap URLs.

## Search

`/search` provides server-side search. Query parameters:

- `q` — search query (required)
- `type` — filter by `block` or `page` (optional)
- `page` — pagination (optional)

Results link to the appropriate content type page.

## Collections

`/collections/[uuid]` executes a CMS collection query and renders the resulting blocks through `SectionRenderer`.

## On-Demand Revalidation

`POST /api/revalidate` with JSON body:

```json
{ "secret": "your-secret", "slug": "about" }
{ "secret": "your-secret", "tag": "tag-hero" }
{ "secret": "your-secret", "type": "blogs" }
{ "secret": "your-secret" }
```

- `slug` — revalidate a specific page
- `tag` — revalidate a specific cache tag
- `type` — revalidate a content type (`blogs`, `news`, `events`)
- No target — revalidates the entire site

## CMS Preview Protocol

When embedded in the CMS admin iframe, the template supports real-time preview via `postMessage`:

- **`cms-preview-update`** — updates field content in-place (text, richtext, image, list)
- **`cms-preview-highlight`** — highlights the targeted field with a blue outline

Elements are targeted via `data-cms-block="{tag}"` and `data-cms-field="{fieldName}"` attributes.

## Customization

1. Add new section components in `src/components/sections/`
2. Register them in `SectionRenderer.tsx`'s `SECTION_MAP` with the block tag as key
3. Each component receives `block: ContentBlock` with `block.content` containing field data
4. Use `str(block.content.fieldName)` to safely extract string field values

## API Reference (`src/lib/cms-api.ts`)

| Function | Description |
|----------|-------------|
| `getPageBySlug(slug)` | Get page composition with resolved blocks |
| `getBlocksByTags(tags)` | Get all blocks matching any of the given tags |
| `getBlocksByTagPaginated(tag, page, size)` | Paginated blocks by tag |
| `getBlockByUUID(uuid)` | Get a single block by UUID |
| `getAllPages()` | Get all published page compositions |
| `executeCollection(uuid)` | Execute a collection query and get results |
| `getCollections()` | List all collections |
| `searchContent(query, type, page, size)` | Search across content |
