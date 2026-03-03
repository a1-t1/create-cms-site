import type { Metadata } from "next";
import { CMSPreviewListener } from "@/components/cms-preview-listener";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Website",
  description: "Powered by CMS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navigation />
        <main>{children}</main>
        <Footer />
        <CMSPreviewListener />
      </body>
    </html>
  );
}
