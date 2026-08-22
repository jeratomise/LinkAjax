#!/usr/bin/env node
/**
 * Deploy Google Flights MCP to Railway (HTTP / streamable MCP at /mcp).
 *
 * Prerequisites:
 *   npm i -g @railway/cli
 *   railway login
 *
 * Usage:
 *   node scripts/deploy-flights-mcp-railway.mjs
 *   node scripts/deploy-flights-mcp-railway.mjs --token "$(openssl rand -hex 24)"
 */
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const serviceDir = join(root, "mcp", "google-flights");

const arg = (flag) => {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : null;
};

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const hasRailway = spawnSync("railway", ["--version"], {
  encoding: "utf8",
  shell: process.platform === "win32",
}).status === 0;

if (!hasRailway) {
  console.error("Railway CLI not found. Install:");
  console.error("  npm i -g @railway/cli");
  console.error("  railway login");
  process.exit(1);
}

const authToken = arg("--token") ?? randomBytes(24).toString("hex");
console.log("\nDeploying from:", serviceDir);
console.log("Auth token (save for Cursor):", authToken);
console.log("\nSet on Railway service:");
console.log(`  GF_MCP_AUTH_TOKEN=${authToken}`);
console.log("\nAfter deploy, set locally for Cursor:");
console.log(`  GF_MCP_URL=https://<your-service>.up.railway.app/mcp`);
console.log(`  GF_MCP_AUTH_TOKEN=${authToken}\n`);

run("railway", ["variables", "--set", `GF_MCP_AUTH_TOKEN=${authToken}`], {
  cwd: serviceDir,
});

run("railway", ["up", "--detach"], { cwd: serviceDir });

console.log("\nNext:");
console.log("1. railway domain  (in mcp/google-flights) to get a public URL");
console.log("2. Export GF_MCP_URL=<url>/mcp and GF_MCP_AUTH_TOKEN in your shell");
console.log("3. Restart Cursor so .cursor/mcp.json picks up the remote server");
console.log("4. curl https://<url>/health  (should return status ok)");
