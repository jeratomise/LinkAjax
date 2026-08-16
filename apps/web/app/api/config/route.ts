import { NextResponse } from "next/server";

// Runtime config endpoint for public Supabase credentials.
// This bypasses the NEXT_PUBLIC_* build-time baking issue where
// Vercel's webpack cache can inline 'undefined' if env vars were
// not set at build time.

export async function GET() {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 }
    );
  }

  // Only expose public credentials (URL and anon key)
  // Never expose service role key
  return NextResponse.json({
    supabaseUrl,
    supabaseAnonKey,
  });
}
