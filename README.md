# AJAX

LinkedIn AI assistant for Jerome Ng. Profile suggestions, incremental voice, weekly research, and job applications.

AJAX never edits live LinkedIn. AJAX never posts without your approval.

## Use it

| Surface | What it is |
| --- | --- |
| This repo in Cursor | Full assistant. Skills, data, Cloud Agents. |
| `npm run dev` | Mobile-friendly dashboard at http://localhost:3000 |
| Cloud Agent automations | Sunday weekly pack. Voice merge on push to `data/posts/inbox/`. |

## Daily commands

```bash
npm install
npm run dev
npm run apply -- --jd data/applications/_example/jd.md
npm run merge-voice
npm run weekly-pack
```

Password for the dashboard: set `AJAX_PASSWORD` (default in local `.env.example` is for you only).

## Layout

```
data/           facts, voice, queue, applications
.cursor/skills/ agent workflows
scripts/        apply, merge-voice, weekly-pack
automations/    Cloud Agent prompts to paste into cursor.com/automations
apps/web/       Next.js dashboard
```

## Deploy

Railway or Vercel, root of this repo, start command `npm run start`, env:

- `AJAX_PASSWORD`
- `AJAX_SESSION_SECRET`
- `AJAX_DATA_DIR` (optional; defaults to `./data`)
