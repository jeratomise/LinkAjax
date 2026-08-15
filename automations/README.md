# Deploy AJAX dashboard

Railway is the better host (writable disk for applications and queue). Vercel works for browsing and in-memory downloads if the filesystem is read-only.

## Environment

- `AJAX_PASSWORD` required
- `AJAX_SESSION_SECRET` required
- `AJAX_DATA_DIR` optional, defaults to repo `data/`

## Railway

From the repo root, after `railway login`:

```bash
railway init
railway variables --set AJAX_PASSWORD=... --set AJAX_SESSION_SECRET=...
railway up
```

Or use the Railway MCP `create_project` + `deploy` against this directory.

## Vercel

```bash
npx vercel --prod
```

Set the same env vars in the Vercel project.

## Cursor Automations

Paste `automations/weekly-research.md` and `automations/voice-increment.md` into https://cursor.com/automations with this GitHub repo attached.
