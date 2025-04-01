import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/signup"]; // Define public routes

export async function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;
  const accessToken = cookies.get("accessToken")?.value;
  const refreshToken = cookies.get("refreshToken")?.value;
  // ✅ 1. Allow public routes without authentication
  if (PUBLIC_ROUTES.includes(nextUrl.pathname)) {
    return NextResponse.next();
  }

  // ✅ 2. If access token exists, allow access
  if (accessToken || refreshToken) {
    return NextResponse.next();
  }

  // ❌ 3. If no valid token, redirect to login
  return NextResponse.redirect(new URL("/login", req.url));
}

// ✅ 5. Apply middleware only to protected routes (exclude API routes)
export const config = {
  matcher:
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.jpg|.*\\.png).*)",
};
