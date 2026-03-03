import type { ContentBlock, SectionProps } from "@/lib/types";
import { HeroSection } from "./sections/HeroSection";
import { TextSection } from "./sections/TextSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { FAQSection } from "./sections/FAQSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { CTASection } from "./sections/CTASection";
import { SliderSection } from "./sections/SliderSection";
import { GallerySection } from "./sections/GallerySection";
import { ContactSection } from "./sections/ContactSection";
import { GenericSection } from "./sections/GenericSection";

const SECTION_MAP: Record<string, React.FC<SectionProps>> = {
  hero: HeroSection,
  text: TextSection,
  features: FeaturesSection,
  feature: FeaturesSection,
  faq: FAQSection,
  testimonials: TestimonialsSection,
  testimonial: TestimonialsSection,
  cta: CTASection,
  slider: SliderSection,
  sliders: SliderSection,
  gallery: GallerySection,
  contact: ContactSection,
  form: ContactSection,
};

export function SectionRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((block) => {
        const tag = block.tags?.[0] || block.type;
        const Component = SECTION_MAP[tag] || GenericSection;
        return (
          <section key={block.uuid} data-cms-block={tag}>
            <Component block={block} />
          </section>
        );
      })}
    </>
  );
}
