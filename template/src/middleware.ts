import { NextRequest, NextResponse } from "next/server";

const LOCALE_CODES = [
  "en", "es", "fr", "de", "zh", "ja", "ko", "pt", "ar", "ku",
];
const DEFAULT_LOCALE = "en";

function getPreferredLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const parsed = acceptLanguage
    .split(",")
    .map((part) => {
      const [lang, q] = part.trim().split(";q=");
      return { lang: lang.trim().toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of parsed) {
    const code = lang.split("-")[0];
    if (LOCALE_CODES.includes(code)) return code;
  }

  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internal paths and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // static files (images, css, js, etc.)
  ) {
    return NextResponse.next();
  }

  // Check if pathname already has a locale prefix
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && LOCALE_CODES.includes(segments[0])) {
    return NextResponse.next();
  }

  // Detect locale from Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  const locale = getPreferredLocale(acceptLanguage);

  // Redirect to locale-prefixed path
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|favicon\\.ico).*)"],
};
