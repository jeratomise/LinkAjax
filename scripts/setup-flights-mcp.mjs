#!/usr/bin/env node
/**
 * Install and build the vendored Google Flights MCP server.
 * Run once after clone: npm run setup:flights-mcp
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mcpDir = join(root, "mcp", "google-flights");

if (!existsSync(join(mcpDir, "package.json"))) {
  console.error("Missing mcp/google-flights. Expected vendored package.");
  process.exit(1);
}

const major = Number(process.versions.node.split(".")[0]);
if (major < 22) {
  console.error(
    `google-flights-mcp needs Node.js 22+. Current: ${process.version}`
  );
  process.exit(1);
}

const run = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: mcpDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

console.log("Installing Google Flights MCP dependencies...");
run("npm", ["install", "--engine-strict=false"]);
console.log("Building Google Flights MCP...");
run("npm", ["run", "build"]);

const entry = join(mcpDir, "dist", "index.js");
if (!existsSync(entry)) {
  console.error("Build finished but dist/index.js is missing.");
  process.exit(1);
}

console.log(`Ready: ${entry}`);
console.log("Cursor config: .cursor/mcp.json (server name: google-flights)");
console.log("Restart Cursor (or reload MCP) to pick up the tools.");
