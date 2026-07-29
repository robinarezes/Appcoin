import { NextResponse, type NextRequest } from "next/server";

/**
 * Pré-filtrage rapide, exécuté sur le runtime Edge : on se contente de
 * constater la présence du cookie de session (impossible d'y interroger la
 * base). La vérification qui fait foi est faite par `utilisateurRequis()`
 * dans le layout applicatif.
 */
const COOKIES_SESSION = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

export function middleware(request: NextRequest) {
  const connecte = COOKIES_SESSION.some((nom) => request.cookies.has(nom));
  const { pathname, search } = request.nextUrl;

  if (!connecte && pathname !== "/login") {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("suite", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (connecte && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
