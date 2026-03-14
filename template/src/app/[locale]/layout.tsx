import { CMSPreviewListener } from "@/components/cms-preview-listener";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { HreflangTags } from "@/components/HreflangTags";
import { getLocaleDir, isValidLocale } from "@/lib/types";
import { notFound } from "next/navigation";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const dir = getLocaleDir(locale);

  return (
    <html lang={locale} dir={dir}>
      <head>
        <HreflangTags />
      </head>
      <body className="antialiased">
        <Navigation locale={locale} />
        <main>{children}</main>
        <Footer />
        <CMSPreviewListener />
      </body>
    </html>
  );
}
