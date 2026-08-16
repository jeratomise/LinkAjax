import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Resolve Supabase URL with fallbacks, including hardcoded project URL as last resort
function getSupabaseUrl(): string | undefined {
  return (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://rsgexlhkihdothacjhrh.supabase.co"
  );
}

// Resolve Supabase key with fallbacks.
// Service role is used as last resort because Vercel webpack cache may have
// baked undefined values for NEXT_PUBLIC_* at build time, and SUPABASE_ANON_KEY
// may not be set. This is safe for auth operations (signInWithPassword, getUser).
function getSupabaseKey(): string | undefined {
  return (
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabaseUrl = getSupabaseUrl();
    const supabaseKey = getSupabaseKey();

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Authentication service is not configured" },
        { status: 503 }
      );
    }

    // Collect cookies as they're set, then apply to final response
    const cookiesToSet: Array<{
      name: string;
      value: string;
      options: CookieOptions;
    }> = [];

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookiesToSet.push(...cookies);
        },
      },
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data.session) {
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    // Create response and apply all collected session cookies
    const response = NextResponse.json({ ok: true });
    for (const { name, value, options } of cookiesToSet) {
      response.cookies.set(name, value, options);
    }

    return response;
  } catch (err) {
    console.error("Password login error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
