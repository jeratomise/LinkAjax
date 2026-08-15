import { NextRequest, NextResponse } from "next/server";
import { cookieName, password, tokenFor } from "./lib/auth";

const PUBLIC = ["/login", "/api/login"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith("/_next") || pathname.startsWith("/favicon"))) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/_next") || pathname.includes(".")) return NextResponse.next();
  const token = req.cookies.get(cookieName())?.value;
  if (token === tokenFor(password())) return NextResponse.next();
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
