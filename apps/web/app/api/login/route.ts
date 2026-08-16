import { NextResponse } from "next/server";

// Legacy login endpoint - redirects to Supabase auth
// This can be removed once migration is complete

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      message: "Password login has been replaced with Supabase auth. Please use the magic link login at /login.",
    },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
}
