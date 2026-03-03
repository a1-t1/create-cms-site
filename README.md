# @estation/create-cms-site

MCP server for [eSTATION CMS](https://estation.io) — scaffold new websites, and read/write CMS content directly from Claude.

## Setup

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "estation-cms": {
      "command": "npx",
      "args": ["-y", "@estation/create-cms-site"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add estation-cms -- npx -y @estation/create-cms-site
```

## Tools

### Authentication

| Tool | Description |
|------|-------------|
| `login` | Log in with email/password for full read/write access |
| `set_api_token` | Set an API token for read-only public access |
| `auth_status` | Check current authentication status |

### Content Blocks

| Tool | Description |
|------|-------------|
| `list_blocks` | List/search/filter content blocks |
| `get_block` | Get a block by UUID with all fields |
| `create_block` | Create a new content block |
| `update_block` | Update an existing block |
| `delete_block` | Delete a block |
| `publish_block` | Publish or unpublish a block |
| `duplicate_block` | Duplicate an existing block |

### Pages

| Tool | Description |
|------|-------------|
| `list_pages` | List/search page compositions |
| `get_page` | Get a page by UUID with all blocks |
| `get_page_by_slug` | Get a published page by URL slug |
| `create_page` | Create a new page composition |
| `update_page` | Update an existing page |
| `delete_page` | Delete a page |
| `publish_page` | Publish or unpublish a page |
| `duplicate_page` | Duplicate an existing page |

### Collections

| Tool | Description |
|------|-------------|
| `list_collections` | List saved content queries |
| `get_collection` | Get a collection's configuration |
| `create_collection` | Create a new collection |
| `update_collection` | Update a collection |
| `delete_collection` | Delete a collection |
| `execute_collection` | Run a collection query and get matching blocks |

### Search

| Tool | Description |
|------|-------------|
| `search_content` | Search across all blocks and pages |

### Website Scaffolding

| Tool | Description |
|------|-------------|
| `scaffold_project` | Create a new Next.js site from the template |
| `list_sections` | List available section components and their fields |
| `validate_config` | Validate a project's CMS configuration |

## Content Structure

eSTATION CMS uses **content blocks** and **page compositions**:

- **Content blocks** are individual pieces of content (hero sections, FAQs, features, etc.) with typed fields
- **Page compositions** define URL routes and contain an ordered list of content blocks
- **Collections** are saved queries that dynamically group blocks by tags or types

### Available Section Types

The website template renders blocks based on their tag:

| Tag | Component | Description |
|-----|-----------|-------------|
| `hero` | HeroSection | Hero banner with title, description, CTA button |
| `text` | TextSection | Rich text with title and subtitle |
| `features` | FeaturesSection | Grid of feature cards |
| `faq` | FAQSection | Accordion Q&A |
| `testimonials` | TestimonialsSection | Testimonial cards |
| `cta` | CTASection | Call-to-action section |
| `slider` | SliderSection | Carousel with navigation |
| `gallery` | GallerySection | Responsive image grid |
| `contact` | ContactSection | Contact info and form |
| `generic` | GenericSection | Dynamic fallback |

Use `list_sections` for detailed field schemas.

## Development

```bash
npm install
npm run build
npm run inspect  # Opens MCP Inspector
```

## License

MIT
