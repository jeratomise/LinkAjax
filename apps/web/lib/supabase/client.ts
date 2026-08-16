import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Build-time env vars (may be undefined if Vercel webpack cache was stale)
const BUILD_TIME_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BUILD_TIME_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Runtime config cache
let runtimeConfig: { supabaseUrl: string; supabaseAnonKey: string } | null =
  null;
let configPromise: Promise<typeof runtimeConfig> | null = null;

async function fetchRuntimeConfig() {
  if (runtimeConfig) return runtimeConfig;
  if (configPromise) return configPromise;

  configPromise = fetch("/api/config")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load Supabase config");
      return res.json();
    })
    .then((data) => {
      runtimeConfig = data;
      return data;
    })
    .catch((err) => {
      configPromise = null;
      throw err;
    });

  return configPromise;
}

// Cached client instance
let cachedClient: SupabaseClient<Database> | null = null;

export function createClient(): SupabaseClient<Database> {
  // If build-time vars are available, use them directly
  if (BUILD_TIME_URL && BUILD_TIME_KEY) {
    if (!cachedClient) {
      cachedClient = createBrowserClient<Database>(BUILD_TIME_URL, BUILD_TIME_KEY);
    }
    return cachedClient;
  }

  // If we already have runtime config, use it
  if (runtimeConfig) {
    if (!cachedClient) {
      cachedClient = createBrowserClient<Database>(
        runtimeConfig.supabaseUrl,
        runtimeConfig.supabaseAnonKey
      );
    }
    return cachedClient;
  }

  // Build-time vars are missing and no runtime config yet
  // This will cause issues - throw a clear error
  throw new Error(
    "Supabase configuration not available. Please refresh the page."
  );
}

// Async version that fetches config if needed
export async function getClient(): Promise<SupabaseClient<Database>> {
  // If build-time vars are available, use them
  if (BUILD_TIME_URL && BUILD_TIME_KEY) {
    if (!cachedClient) {
      cachedClient = createBrowserClient<Database>(BUILD_TIME_URL, BUILD_TIME_KEY);
    }
    return cachedClient;
  }

  // Fetch runtime config
  const config = await fetchRuntimeConfig();
  if (!config) {
    throw new Error("Failed to load Supabase configuration");
  }

  if (!cachedClient) {
    cachedClient = createBrowserClient<Database>(
      config.supabaseUrl,
      config.supabaseAnonKey
    );
  }
  return cachedClient;
}
