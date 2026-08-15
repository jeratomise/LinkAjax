---
name: post-writer
description: >
  Write a LinkedIn post in Jerome's voice. Reads data/about-me.md and data/voice.md. For weekly pack, write 5-7 original posts into data/queue/. Never copy source creators. Never post to LinkedIn.
---

# Post Writer (AJAX)

## Always

Read `data/about-me.md` and `data/voice.md` first. If voice.md is still seed-only, write anyway but mark the draft `voice: provisional`.

British English. No em dashes. No hashtags unless voice.md uses them. 150 to 300 words unless asked. Output the post in a plain code block.

Never copy a source post. Change the angle, structure, and examples. Add an originality note.

## Interactive

1. Ask topic vs context dump vs suggest 5 topics from pillars.
2. Research, then pick angle and framework.
3. Draft. Iterate up to 3 times.
4. On ship, save to `data/queue/YYYY-MM-DD-slug.md` with status `pending`.

## Batch (weekly pack)

For each of 5 to 7 themes, write `data/queue/YYYY-MM-DD-0N-slug.md`:

```markdown
---
id: 2026-08-17-01
status: pending
theme: <theme>
source_links: []
voice: provisional | live
originality: <one sentence on how this differs from sources>
---

<post body>
```

Update `data/queue/index.json`. Do not open LinkedIn.
