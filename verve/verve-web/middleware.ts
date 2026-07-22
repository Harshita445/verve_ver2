import { NextRequest, NextResponse } from "next/server";

const SESSION_HINT_COOKIE = "verve_session_hint";

const PROTECTED_PREFIXES = ["/dashboard", "/onboarding", "/training", "/progress", "/rankings"];

/**
 * Best-effort route protection.
 *
 * The actual refresh token is an httpOnly cookie scoped to the backend
 * API's own origin, so this middleware (running on the frontend origin)
 * cannot read it, and the access token lives only in browser memory on the
 * client. What this checks instead is `verve_session_hint`, a plain cookie
 * the client sets on this origin whenever it successfully authenticates
 * (see lib/auth/AuthProvider.tsx) and clears on logout or failed refresh.
 *
 * That makes this a UX guard, not the security boundary — its job is to
 * skip rendering protected pages for someone who is definitely logged out,
 * avoiding a flash of content that then gets yanked away. It does not
 * itself guarantee a valid session: every real request still goes through
 * the API, which is what actually enforces auth (401s on an invalid/expired
 * access token, refreshed via the client's refresh-on-401 flow). If that
 * flow fails, AuthProvider clears the hint cookie and routes to /login.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasSessionHint = request.cookies.has(SESSION_HINT_COOKIE);

  if (!hasSessionHint) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/training/:path*", "/progress/:path*", "/rankings/:path*"],
};
