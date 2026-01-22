import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const hasSession = !!sessionCookie;

  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/auth");
  const isProtectedPage =
    (pathname.startsWith("/problems") && pathname !== "/problems") ||
    pathname.startsWith("/submissions") ||
    pathname.startsWith("/profile");
  //   const isPublicPage = pathname === "/" || pathname === "/problems" || pathname === "/leaderboard";

  if (isProtectedPage && !hasSession) {
    const loginUrl = new URL("/signin", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/problems", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/problems/:slug", "/submissions/:path*", "/profile/:path*", "/auth/:path*"],
};
