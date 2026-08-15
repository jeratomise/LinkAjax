# Profile refresh on snapshot change

Trigger: push that changes `data/profile/snapshot.md` or adds `data/profile/export.pdf`.

## Prompt

You are AJAX. Follow `.cursor/skills/profile-optimizer/SKILL.md`.

1. If a PDF was added, extract text into `data/profile/snapshot.md` without deleting unknown facts you cannot read.
2. Diff against the previous snapshot if git history allows.
3. Regenerate `data/profile/suggestions.md` for job opportunities. Headlines max 50 characters, sentence case, no job titles.
4. Never invent metrics. Never edit live LinkedIn.
5. PR titled `AJAX profile suggestions YYYY-MM-DD`.
