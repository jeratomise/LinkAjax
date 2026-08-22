#!/usr/bin/env node
/**
 * Smoke-test the Google Flights MCP: initialize + tools/list.
 * Does not call Google (cloud IPs are often blocked).
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const entry = join(root, "mcp", "google-flights", "dist", "index.js");

if (!existsSync(entry)) {
  console.error("Missing dist. Run: npm run setup:flights-mcp");
  process.exit(1);
}

const child = spawn("node", [entry], {
  stdio: ["pipe", "pipe", "inherit"],
});

const rl = createInterface({ input: child.stdout });
const pending = new Map();
let nextId = 1;

const send = (method, params, isNotification = false) => {
  const msg = { jsonrpc: "2.0", method, params };
  if (!isNotification) {
    msg.id = nextId++;
    pending.set(msg.id, method);
  }
  child.stdin.write(`${JSON.stringify(msg)}\n`);
  return msg.id;
};

const expected = [
  "search_flights",
  "search_multi_city",
  "get_price_insights",
  "get_calendar_heatmap",
  "compare_cabin_classes",
  "track_price",
  "get_price_history",
  "list_tracked_routes",
  "lookup_airport",
  "find_nearby_airports",
  "get_flight_url",
  "analyze_layovers",
];

rl.on("line", (line) => {
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return;
  }
  if (msg.id === undefined || !pending.has(msg.id)) return;
  const method = pending.get(msg.id);
  pending.delete(msg.id);

  if (method === "initialize") {
    if (msg.error) {
      console.error("initialize failed", msg.error);
      child.kill();
      process.exit(1);
    }
    console.log(
      `server: ${msg.result?.serverInfo?.name} ${msg.result?.serverInfo?.version}`
    );
    send("notifications/initialized", {}, true);
    send("tools/list", {});
    return;
  }

  if (method === "tools/list") {
    const names = (msg.result?.tools ?? []).map((t) => t.name).sort();
    const missing = expected.filter((n) => !names.includes(n));
    if (missing.length) {
      console.error("Missing tools:", missing.join(", "));
      console.error("Got:", names.join(", "));
      child.kill();
      process.exit(1);
    }
    console.log(`tools (${names.length}): ${names.join(", ")}`);
    console.log("smoke ok");
    child.kill();
    process.exit(0);
  }
});

child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});

setTimeout(() => {
  console.error("Timed out waiting for MCP response");
  child.kill();
  process.exit(1);
}, 15000);

send("initialize", {
  protocolVersion: "2024-11-05",
  capabilities: {},
  clientInfo: { name: "ajax-flights-smoke", version: "0.1.0" },
});
