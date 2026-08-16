import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: root,
  outputFileTracingIncludes: {
    "/*": ["./.ajax/**/*"],
  },
  serverExternalPackages: ["docx", "pdfkit", "pdf-parse", "mammoth"],
  // Re-export so a stale webpack cache cannot leave NEXT_PUBLIC_* as undefined
  // when the same values exist under the non-public names, or as the public URL.
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://rsgexlhkihdothacjhrh.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      "",
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL || "https://linkajax.vercel.app",
  },
};

export default nextConfig;
