import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dest = path.join(root, "apps/web/.ajax");

fs.mkdirSync(dest, { recursive: true });
fs.cpSync(path.join(root, "data"), path.join(dest, "data"), { recursive: true });
fs.cpSync(path.join(root, "lib"), path.join(dest, "lib"), { recursive: true });
console.log("Prepared apps/web/.ajax for Vercel");
