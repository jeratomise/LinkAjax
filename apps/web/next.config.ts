import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: root,
  serverExternalPackages: ["docx", "pdfkit"],
  output: "standalone",
};

export default nextConfig;
