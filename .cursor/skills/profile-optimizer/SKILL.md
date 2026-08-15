---
name: profile-optimizer
description: >
  Review and rewrite Jerome's LinkedIn profile for job opportunities. Non-destructive: never edits live LinkedIn. Writes data/profile/suggestions.md from data/profile/snapshot.md. Trigger on "optimize my profile", "profile review", new PDF export, or snapshot change.
---

# Profile Optimizer (AJAX)

Job-first. Non-destructive. British English. No em dashes.

## Rules

- Read `data/about-me.md`, `data/voice.md`, and `data/profile/snapshot.md` first.
- Never change live LinkedIn. Never invent employers, dates, awards, or metrics.
- If the snapshot changed since `data/profile/suggestions.md`, regenerate suggestions.
- If a PDF is added at `data/profile/export.pdf`, extract text into the snapshot first, then regenerate.
- Headlines: max 50 characters, sentence case, no job titles.
- About and experience: full sentences, one line break between sentences, double break between sections. No bullet-list experience.
- End after Featured and optional visual prompts. Do not offer a launch post.

## Steps

1. Diff snapshot vs last suggestions. List fact gaps (missing titles, dates, metrics).
2. Write 3 headlines in a code block (Direct, Pain-focused, Differentiator). Recommend one for recruiters.
3. Write About: Hook, empathy with hiring teams, method, authority from snapshot only, CTA to Featured / DM.
4. Rewrite the top 2 roles as stories (Context, Challenge, Action, Result). 8 to 15 sentences each. Flag any invented-looking claim and delete it.
5. Featured: 2 external links max. Item 1 = CV. Item 2 = proof of thinking. No LinkedIn-internal posts.
6. Save the full output to `data/profile/suggestions.md`. Tell the user to copy-paste manually.
