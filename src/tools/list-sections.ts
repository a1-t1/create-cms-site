export interface SectionInfo {
  tag: string;
  aliases: string[];
  component: string;
  description: string;
  fields: FieldInfo[];
}

export interface FieldInfo {
  name: string;
  type: "string" | "list";
  description: string;
  subFields?: { name: string; type: string; description: string }[];
}

export const SECTIONS: SectionInfo[] = [
  {
    tag: "hero",
    aliases: [],
    component: "HeroSection",
    description: "Hero banner with title, description, and optional CTA button",
    fields: [
      { name: "header", type: "string", description: "Hero title" },
      { name: "description", type: "string", description: "Hero description text" },
      { name: "buttonText", type: "string", description: "Button label" },
      { name: "buttonLink", type: "string", description: "Button URL" },
    ],
  },
  {
    tag: "text",
    aliases: [],
    component: "TextSection",
    description: "Flexible text content section with title, subtitle, and rich text body",
    fields: [
      { name: "title", type: "string", description: "Section title" },
      { name: "subtitle", type: "string", description: "Section subtitle" },
      { name: "body", type: "string", description: "HTML content body" },
    ],
  },
  {
    tag: "features",
    aliases: ["feature"],
    component: "FeaturesSection",
    description: "Grid of feature cards with title and description",
    fields: [
      { name: "title", type: "string", description: "Section title" },
      { name: "description", type: "string", description: "Section description" },
      {
        name: "items",
        type: "list",
        description: "Array of feature items",
        subFields: [
          { name: "title", type: "string", description: "Feature title" },
          { name: "description", type: "string", description: "Feature description" },
        ],
      },
    ],
  },
  {
    tag: "faq",
    aliases: [],
    component: "FAQSection",
    description: "Accordion-style FAQ section with collapsible questions and answers",
    fields: [
      { name: "title", type: "string", description: "Section title" },
      {
        name: "items",
        type: "list",
        description: "Array of FAQ items",
        subFields: [
          { name: "question", type: "string", description: "Question text" },
          { name: "answer", type: "string", description: "Answer text" },
        ],
      },
    ],
  },
  {
    tag: "testimonials",
    aliases: ["testimonial"],
    component: "TestimonialsSection",
    description: "Grid of testimonial cards with quotes and author info",
    fields: [
      { name: "title", type: "string", description: "Section title" },
      {
        name: "items",
        type: "list",
        description: "Array of testimonials",
        subFields: [
          { name: "name", type: "string", description: "Author name" },
          { name: "quote", type: "string", description: "Testimonial quote" },
          { name: "role", type: "string", description: "Author role/title" },
        ],
      },
    ],
  },
  {
    tag: "cta",
    aliases: [],
    component: "CTASection",
    description: "Call-to-action section with dark background, title, description, and button",
    fields: [
      { name: "title", type: "string", description: "CTA title" },
      { name: "description", type: "string", description: "CTA description" },
      { name: "buttonText", type: "string", description: "Button label" },
      { name: "buttonLink", type: "string", description: "Button URL" },
    ],
  },
  {
    tag: "slider",
    aliases: ["sliders"],
    component: "SliderSection",
    description: "Carousel/slider with navigation showing one item at a time",
    fields: [
      {
        name: "items",
        type: "list",
        description: "Array of slide items",
        subFields: [
          { name: "title", type: "string", description: "Slide title" },
          { name: "subtitle", type: "string", description: "Slide subtitle" },
          { name: "image", type: "string", description: "Slide image URL" },
          { name: "linkUrl", type: "string", description: "Slide link URL" },
          { name: "linkText", type: "string", description: "Slide link text" },
        ],
      },
    ],
  },
  {
    tag: "gallery",
    aliases: [],
    component: "GallerySection",
    description: "Responsive image grid with optional captions",
    fields: [
      { name: "title", type: "string", description: "Gallery title" },
      {
        name: "items",
        type: "list",
        description: "Array of gallery items",
        subFields: [
          { name: "image", type: "string", description: "Image URL" },
          { name: "caption", type: "string", description: "Image caption" },
        ],
      },
    ],
  },
  {
    tag: "contact",
    aliases: ["form"],
    component: "ContactSection",
    description: "Contact information display with embedded contact form",
    fields: [
      { name: "title", type: "string", description: "Section title" },
      { name: "description", type: "string", description: "Section description" },
      { name: "email", type: "string", description: "Contact email address" },
      { name: "phone", type: "string", description: "Contact phone number" },
      { name: "address", type: "string", description: "Contact physical address" },
    ],
  },
  {
    tag: "generic",
    aliases: [],
    component: "GenericSection",
    description: "Generic fallback section that renders any CMS fields dynamically based on fieldType",
    fields: [],
  },
];
