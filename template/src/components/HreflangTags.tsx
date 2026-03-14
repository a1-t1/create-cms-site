"use client";

import { usePathname } from "next/navigation";
import { SUPPORTED_LOCALES, LOCALE_CODES } from "@/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

export function HreflangTags() {
  const pathname = usePathname();

  if (!SITE_URL) return null;

  // Replace current locale in path with each supported locale
  const segments = pathname.split("/").filter(Boolean);
  const hasLocale = segments.length > 0 && LOCALE_CODES.includes(segments[0]);
  const pathWithoutLocale = hasLocale ? `/${segments.slice(1).join("/")}` : pathname;

  return (
    <>
      {SUPPORTED_LOCALES.map((l) => (
        <link
          key={l.code}
          rel="alternate"
          hrefLang={l.code}
          href={`${SITE_URL}/${l.code}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${SITE_URL}/en${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`}
      />
    </>
  );
}
