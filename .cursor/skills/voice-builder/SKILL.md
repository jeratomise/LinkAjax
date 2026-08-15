---
name: voice-builder
description: >
  Build or increment Jerome's voice profile. First run writes data/about-me.md and data/voice.md. Later runs merge every markdown file in data/posts/inbox/ into voice.md and archive the files. Trigger on "build my voice", "merge voice", or new files in data/posts/inbox/.
---

# Voice Builder (AJAX)

Incremental. British English. No em dashes. Goal stays job opportunities unless about-me.md says otherwise.

## First run

If `data/voice.md` is missing or still "seed only" and inbox has fewer than 3 original posts, ask for more posts. Do not pretend the voice is complete.

If the user has not filled about-me.md, keep the existing job-first about-me.md from the snapshot. Do not overwrite audience to "founders" unless they say so.

Write `data/voice.md` from actual samples only. Keep under 500 words. Keep about-me.md under 300 words.

## Increment (default)

1. List `data/posts/inbox/*.md` excluding README.md.
2. If none, stop.
3. Read current `data/voice.md` and all inbox posts plus `data/posts/archive/` if needed for patterns.
4. Update every section of voice.md from the full corpus, not only the new posts.
5. Add `Last merged: YYYY-MM-DD` and raise corpus count.
6. Move each inbox post to `data/posts/archive/` with the same filename.
7. Update `data/posts/voice-log.json`.
8. Run `npm run merge-voice` if you want the script to do the file moves; still rewrite voice.md yourself from the samples.

## Analysis

Extract voice, structure, topic, and absence signals across all samples. If samples contradict, say so in voice.md. Never invent patterns.

## Output path

- Identity: `data/about-me.md`
- Voice: `data/voice.md`
- Log: `data/posts/voice-log.json`
