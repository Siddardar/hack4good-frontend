import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const isAdminRoute = url.pathname.startsWith("/admin");

  if (isAdminRoute) {
    const token = request.cookies.get("token");

    if (!token) {
      url.pathname = "/store"; // Redirect if no token
      return NextResponse.redirect(url);
    }

    // Redirect to /store if the token verification API fails
    const apiUrl = new URL("/api/verify-admin", request.url);
    const apiResponse = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (!apiResponse.ok) {
      url.pathname = "/store";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"], // Apply to admin routes
};