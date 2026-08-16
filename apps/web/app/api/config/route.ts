import { NextResponse } from "next/server";

// Runtime config endpoint for public Supabase credentials.
// This bypasses the NEXT_PUBLIC_* build-time baking issue where
// Vercel's webpack cache can inline 'undefined' if env vars were
// not set at build time.
//
// IMPORTANT: This endpoint only returns PUBLIC keys (anon/publishable).
// If only service role exists, it returns 503. The browser client should
// not use service role. Password login uses /api/auth/password instead.

export async function GET() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://rsgexlhkihdothacjhrh.supabase.co";

  // Only use anon/publishable keys for browser client. Never service role.
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // If only service role exists, return 503. Browser client stays broken;
    // password login must use /api/auth/password instead.
    return NextResponse.json(
      { error: "Browser authentication is not configured. Use password login." },
      { status: 503 }
    );
  }

  return NextResponse.json({
    supabaseUrl,
    supabaseAnonKey,
  });
}
