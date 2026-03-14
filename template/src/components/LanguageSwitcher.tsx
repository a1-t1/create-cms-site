"use client";

import { usePathname } from "next/navigation";
import { SUPPORTED_LOCALES, LOCALE_CODES } from "@/lib/types";

interface LanguageSwitcherProps {
  locale: string;
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname();

  // Replace the current locale prefix in the path with the target locale
  function getLocalePath(targetLocale: string) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && LOCALE_CODES.includes(segments[0])) {
      segments[0] = targetLocale;
    } else {
      segments.unshift(targetLocale);
    }
    return `/${segments.join("/")}`;
  }

  return (
    <div className="flex gap-1 text-xs">
      {SUPPORTED_LOCALES.map((l) => (
        <a
          key={l.code}
          href={getLocalePath(l.code)}
          className={`px-2 py-1 rounded transition-colors ${
            l.code === locale
              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
              : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          lang={l.code}
          dir={l.dir}
        >
          {l.code.toUpperCase()}
        </a>
      ))}
    </div>
  );
}
