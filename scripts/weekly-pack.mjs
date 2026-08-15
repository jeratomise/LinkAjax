#!/usr/bin/env node
import fs from "node:fs";
import { writeWeeklyScaffold } from "../lib/weekly.mjs";

const extra = process.argv.includes("--json") ? JSON.parse(fs.readFileSync(process.argv[process.argv.indexOf("--json") + 1], "utf8")) : {};
const result = writeWeeklyScaffold(extra);
console.log(JSON.stringify(result, null, 2));
