import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// NEXT_PUBLIC_* vars are baked in at build time for edge middleware, so if the
// build ran before they were set in Vercel the inlined value is undefined.
// SUPABASE_URL / SUPABASE_ANON_KEY are non-public vars, injected at runtime by
// Vercel's edge runtime, so they always reflect the current dashboard values.
// Service role key is used as LAST RESORT when NEXT_PUBLIC vars were baked as
// undefined and SUPABASE_ANON_KEY is not set. This is safe for auth session
// operations (getUser) but should not be used for broader data queries.
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://rsgexlhkihdothacjhrh.supabase.co";
const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function updateSession(request: NextRequest) {
  // If Supabase is not configured, treat every request as unauthenticated.
  // The middleware caller will redirect to /login; no 500.
  if (!supabaseUrl || !supabaseKey) {
    return { user: null, supabaseResponse: NextResponse.next({ request }) };
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, supabaseResponse };
}
