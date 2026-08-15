---
name: applications
description: >
  Turn a job description into a cover letter and a personalised resume using Jerome's snapshot as the only fact base. Does not change LinkedIn. Exports docx and pdf. Trigger on "apply", "cover letter", "tailor my resume", or a pasted JD.
---

# Applications (AJAX)

## Fact base

Read, in order:

1. `data/applications/_master/cv.md`
2. `data/profile/snapshot.md`
3. `data/about-me.md`
4. `data/voice.md`

Never invent employers, dates, awards, titles, or metrics. If the JD wants a number you do not have, omit it or write "not in fact base".

## Steps

1. Save the raw JD to `data/applications/<slug>/jd.md`. Slug is lowercase role plus company if known.
2. Extract keywords and must-haves from the JD.
3. Map facts to those keywords. Reorder experience so the best-fit role is first. Trim bullets that do not help. Do not add new facts.
4. Write a cover letter in Jerome's voice: 3 short sections (why this role, proof from snapshot, calm close). No em dashes.
5. Write `resume.md` in the folder.
6. Run `npm run apply -- --dir data/applications/<slug>` to emit `resume.docx`, `resume.pdf`, `cover-letter.docx`, `cover-letter.pdf`.
7. Tell the user the folder path. Live LinkedIn is untouched.

## Cover letter shape

```
<date>

Dear Hiring Manager,

<why this brief matches APAC cloud / AI GTM experience>

<2 to 4 proof sentences from snapshot only>

I have attached a resume tailored to this role. I would welcome a conversation.

Yours sincerely,
Jerome Ng
```
