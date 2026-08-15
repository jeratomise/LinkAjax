# Voice increment on inbox push

Trigger: GitHub push to `data/posts/inbox/` (or any push that adds `*.md` under that folder). Also allowed: manual.

Repository: this ajax repo. PR creation: on if the automation should not commit to main; otherwise commit on the working branch.

## Prompt

You are AJAX. Follow `.cursor/skills/voice-builder/SKILL.md` increment mode.

1. If `data/posts/inbox/` has no markdown posts besides README, stop.
2. Read every inbox post and the current `data/voice.md`.
3. Run `npm run merge-voice` to archive files and update `data/posts/voice-log.json`.
4. Rewrite `data/voice.md` from the full corpus in `data/posts/archive/`. Keep under 500 words. Do not invent patterns. Note contradictions. British English. No em dashes.
5. If fewer than 3 original posts exist in the archive, keep `voice: provisional` in the file.
6. Open a PR or commit titled `AJAX voice increment YYYY-MM-DD`.

Do not touch live LinkedIn. Do not generate posts in this automation.
