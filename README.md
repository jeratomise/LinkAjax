# AJAX

LinkedIn AI assistant for Jerome Ng. Profile suggestions, incremental voice, weekly research, and job applications.

AJAX never edits live LinkedIn. AJAX never posts without your approval.

Repo: https://github.com/jeratomise/LinkAjax

## Use it

| Surface | What it is |
| --- | --- |
| Vercel production | Phone and desktop dashboard (this is the live app) |
| This GitHub repo in Cursor | Skills, data, Cloud Agent automations |
| Cloud Agent automations | Sunday weekly pack. Voice merge on push to `data/posts/inbox/` |

Local `npm run dev` is not the production path.

## Commands (from a clone)

```bash
npm install
npm run apply -- --jd data/applications/_example/jd.md
npm run merge-voice
npm run weekly-pack
```

Dashboard password is `AJAX_PASSWORD` on Vercel. Do not commit it.

## Layout

```
data/           facts, voice, queue, applications
.cursor/skills/ agent workflows
scripts/        apply, merge-voice, weekly-pack
automations/    Cloud Agent prompts for cursor.com/automations
apps/web/       Next.js dashboard
```

## Deploy

Vercel, repo root, GitHub connected. Env:

- `AJAX_PASSWORD`
- `AJAX_SESSION_SECRET`
