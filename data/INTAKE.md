# Intake

AJAX is seeded from Jerome's public LinkedIn page and master CV.

## Completed

1. ~~LinkedIn **Save to PDF**~~ Master CV ingested from resume PDF on 16/08/2026.
   - Source: `data/applications/_master/cv.md` (text extracted from PDF)
   - Backup: `data/applications/_master/resume.pdf` (original file)
   - Cover letter sample: `data/applications/_master/cover-letter-sample.md`
2. ~~Master CV~~ Now the primary fact base. Includes full experience details, metrics, and dates.

## Still needed

1. At least 3 of **your** LinkedIn posts (not shares of other people's posts). Drop each as a `.md` file in `data/posts/inbox/`. Then run `npm run merge-voice` or ask AJAX to merge voice.
2. Slack for the Sunday pack: say yes in chat, or leave it. Cloud Agent automations can Slack you if the Slack tool is enabled.

## How to update your resume

1. Go to the Apply page in the web app
2. Use the "Replace resume" button to upload a new PDF or DOCX
3. Text will be extracted automatically into `cv.md`
4. The original file is kept in `data/applications/_master/`

Note: On Vercel serverless, uploads are stored in temporary storage. For permanent updates, commit the files to the repository.

## Already decided

- Goal: job opportunities
- Live LinkedIn is never edited
- Posts are drafted for your approval only
- Master CV is the source of truth for tailored applications
