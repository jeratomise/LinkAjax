import { NextResponse } from "next/server";
import { cookieName, password, tokenFor } from "../../lib/auth";

export async function POST(req: Request) {
  const { password: pw } = await req.json();
  if (pw !== password()) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName(), tokenFor(password()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
