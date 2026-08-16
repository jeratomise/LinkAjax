import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

// NEXT_PUBLIC_* vars are replaced at build time by Next.js (both edge and
// Node.js). If the build ran against a cached webpack chunk compiled before
// the vars were set in Vercel, they are undefined even for server components.
// SUPABASE_URL / SUPABASE_ANON_KEY are non-public, runtime-injected by Vercel
// and are immune to the build-cache staleness problem.
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

export async function createClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase env vars are not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel."
    );
  }
  const cookieStore = await cookies();

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export async function getUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getProfile() {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}
