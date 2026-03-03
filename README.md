# @estation/create-cms-site

MCP server that scaffolds new Next.js sites powered by [eSTATION CMS](https://estation.io).

## Usage

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "create-cms-site": {
      "command": "npx",
      "args": ["-y", "@estation/create-cms-site"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add create-cms-site -- npx -y @estation/create-cms-site
```

## Tools

### `scaffold_project`

Scaffold a new Next.js site from the template.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_name` | string | yes | Directory name and package.json name |
| `destination` | string | yes | Parent directory for the project |
| `cms_api_url` | string | yes | CMS API base URL |
| `cms_api_token` | string | yes | Tenant API token |
| `site_url` | string | no | Public URL for sitemap |
| `site_name` | string | no | Display name for metadata |
| `install_deps` | boolean | no | Run `npm install` (default: false) |

### `list_sections`

List all available section components with their tags and expected CMS fields.

### `validate_config`

Validate an existing project's CMS configuration. Checks `.env.local` for required variables and tests API connectivity.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_path` | string | yes | Path to the project directory |

## Available Sections

The template includes 10 section components:

- **HeroSection** (`hero`) — Hero banner with title, description, and CTA button
- **TextSection** (`text`) — Rich text content with title and subtitle
- **FeaturesSection** (`features`) — Grid of feature cards
- **FAQSection** (`faq`) — Accordion-style Q&A
- **TestimonialsSection** (`testimonials`) — Testimonial cards with quotes
- **CTASection** (`cta`) — Call-to-action with dark background
- **SliderSection** (`slider`) — Carousel with navigation
- **GallerySection** (`gallery`) — Responsive image grid
- **ContactSection** (`contact`) — Contact info and form
- **GenericSection** (`generic`) — Dynamic fallback for any fields

## Development

```bash
npm install
npm run build
npm run inspect  # Opens MCP Inspector
```

## License

MIT
