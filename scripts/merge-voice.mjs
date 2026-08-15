#!/usr/bin/env node
import { mergeVoice } from "../lib/voice-merge.mjs";

const result = mergeVoice();
console.log(JSON.stringify(result, null, 2));
