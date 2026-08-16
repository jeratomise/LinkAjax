# AJAX Supabase Authentication Plan

## Overview

Replace the single-password gate (`AJAX_PASSWORD`) with Supabase Auth, Storage, and Postgres. Each user owns their data via RLS. Uploads persist in Supabase Storage rather than vanishing from Vercel `/tmp`.

---

## 1. New Supabase Project

| Item | Value |
|------|-------|
| Name | `linkajax` |
| Project ID | `rsgexlhkihdothacjhrh` |
| URL | `https://rsgexlhkihdothacjhrh.supabase.co` |
| Region | `ap-southeast-1` (Singapore) |
| Organisation | `chwthotmiblqpopocyeg` |
| Cost | $10/month |
| Status | **ACTIVE_HEALTHY** |

### Services Used

- **Auth**: Email magic link (simpler than password for a private tool)
- **Postgres**: User profiles, CV text, application packs, LinkedIn tokens
- **Storage**: Resume PDF/DOCX bucket with RLS

---

## 2. Auth Strategy

### Method
Email magic link. No password to remember. A single click from the inbox signs the user in.

### Bootstrap
Jerome's email (`jerome@…`) is the first user. On first login, a `profiles` row is auto-created via trigger.

### Migration from `AJAX_PASSWORD`
- **Option A (chosen)**: Replace entirely. Remove `AJAX_PASSWORD` middleware once Supabase Auth is wired.
- **Option B (fallback)**: Keep `AJAX_PASSWORD` as an extra gate during migration. Not needed if RLS is correct.

---

## 3. Database Schema

### `public.profiles`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK, references `auth.users(id)` |
| `email` | `text` | From auth, convenience |
| `full_name` | `text` | Optional display name |
| `cv_text` | `text` | Extracted markdown from uploaded resume |
| `cv_source` | `text` | Original filename |
| `cv_updated_at` | `timestamptz` | When CV was last uploaded |
| `created_at` | `timestamptz` | Row creation |

RLS: `auth.uid() = id`

### `public.applications`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → profiles.id |
| `slug` | `text` | URL-safe identifier |
| `role` | `text` | Job title |
| `company` | `text` | Company name |
| `jd_text` | `text` | Original JD |
| `cover_letter_md` | `text` | Generated cover letter |
| `resume_md` | `text` | Generated tailored resume |
| `created_at` | `timestamptz` | |

RLS: `auth.uid() = user_id`

### `public.linkedin_connections`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → profiles.id |
| `linkedin_sub` | `text` | LinkedIn member ID (from `sub` claim) |
| `access_token_enc` | `bytea` | Encrypted via `pgcrypto` |
| `refresh_token_enc` | `bytea` | Encrypted |
| `expires_at` | `timestamptz` | Token expiry |
| `profile_snapshot` | `jsonb` | Last fetched profile data |
| `last_synced_at` | `timestamptz` | |
| `created_at` | `timestamptz` | |

RLS: `auth.uid() = user_id`

**Important**: Tokens are encrypted at rest using a symmetric key stored in `SUPABASE_ENCRYPTION_KEY` env var. Never log tokens. Never return tokens to the client.

---

## 4. Storage Bucket

| Bucket | Path pattern | RLS |
|--------|--------------|-----|
| `resumes` | `{user_id}/resume.{pdf,docx}` | Owner read/write only |

Policy:
```sql
create policy "Users manage own resumes"
on storage.objects for all
using (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 5. API Route Changes

### `/api/upload-resume`
1. Require Supabase session (server-side `getUser()`)
2. Upload PDF/DOCX to Storage bucket `resumes/{user_id}/resume.{ext}`
3. Extract text, convert to markdown
4. Update `profiles.cv_text`, `cv_source`, `cv_updated_at`
5. Return success

### `/api/apply`
1. Require session
2. Load CV from `profiles.cv_text` (fallback: repo `cv.md` for Jerome only during migration)
3. Generate tailored pack
4. Store in `applications` table
5. Return pack data

### `lib/facts.mjs` → `lib/supabase-facts.ts`
New server-side function that reads from Supabase if a session exists, else falls back to repo files.

---

## 6. LinkedIn OAuth (Scaffold Only)

### Scopes Required
- `openid` – Get LinkedIn member ID
- `profile` – Basic profile data (name, headline, picture)
- `email` – Email address

**Cannot** write to headline/About/experience via API. Read-only scan.

### Flow
1. User clicks "Connect LinkedIn" → redirect to LinkedIn OAuth
2. LinkedIn redirects back with `code`
3. Exchange `code` for tokens
4. Encrypt tokens, store in `linkedin_connections`
5. Fetch profile via `GET https://api.linkedin.com/v2/userinfo`
6. Store snapshot in `profile_snapshot`

### Env Vars
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `LINKEDIN_REDIRECT_URI` (e.g. `https://linkajax.vercel.app/api/auth/linkedin/callback`)

### If No Credentials
Scaffold the UI and API routes. Document the gap. Do not fake a scrape.

---

## 7. Env Vars for Vercel

| Variable | Where | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Public/anon key for RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Bypasses RLS, for admin tasks |
| `SUPABASE_ENCRYPTION_KEY` | Server only | 32-byte key for token encryption |
| `LINKEDIN_CLIENT_ID` | Server only | If LinkedIn app exists |
| `LINKEDIN_CLIENT_SECRET` | Server only | If LinkedIn app exists |

Remove `AJAX_PASSWORD` and `AJAX_SESSION_SECRET` once migration is complete.

---

## 8. Security Checklist

- [ ] Anon key only in browser; service role only on server
- [ ] All user tables have `auth.uid() = user_id` RLS
- [ ] Storage bucket has per-user folder RLS
- [ ] LinkedIn tokens encrypted with `pgp_sym_encrypt()`
- [ ] Never log tokens or secrets
- [ ] HTTPS only (Vercel enforces)
- [ ] Supabase Auth handles session cookies; no manual JWT handling needed

---

## 9. Implementation Order

1. **Create Supabase project** (via MCP)
2. **Apply migrations**: tables + RLS + storage bucket
3. **Install `@supabase/ssr`** in `apps/web`
4. **Create auth helpers**: `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/middleware.ts`
5. **Update middleware**: Replace password check with Supabase session check
6. **Build login UI**: Magic link form + callback handler
7. **Update layout**: Show user email, sign-out button
8. **Update upload-resume**: Persist to Storage + profiles.cv_text
9. **Update /api/apply**: Load CV from profiles
10. **Scaffold LinkedIn OAuth**: UI + routes + migration
11. **Generate TypeScript types** from Supabase

---

## 10. What "LinkedIn Scan" Can and Cannot Do

### Can Do (Official API)
- Fetch basic profile: name, headline, profile picture
- Fetch email if `email` scope granted
- Store snapshot for reference in cover letters

### Cannot Do
- Write headline, About, Featured, or Experience (API does not allow)
- Scrape full profile from linkedin.com (violates AJAX rules)
- Post without human approval (posts go to queue)
- Store session cookies or bypass bot detection

### If No LinkedIn App Credentials
- UI shows "Connect LinkedIn" button (disabled/greyed)
- Clicking shows message: "LinkedIn integration requires app credentials. Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in Vercel."
- No scraping fallback

---

## Remaining Gaps After Implementation

1. **LinkedIn credentials**: User must create a LinkedIn app and add env vars
2. **Email allowlist**: Consider restricting sign-ups to specific emails (Supabase Auth settings)
3. **Encryption key rotation**: Manual process if `SUPABASE_ENCRYPTION_KEY` needs rotation
4. **Old application packs**: Existing packs in repo `data/applications/` will not auto-migrate; they remain accessible via filesystem on local dev

---

## Implementation Status

**Completed:**
- [x] Created Supabase project `linkajax` (ID: `rsgexlhkihdothacjhrh`)
- [x] Applied migrations: profiles, applications, linkedin_connections tables
- [x] Applied RLS policies on all tables
- [x] Created `resumes` storage bucket with per-user folder RLS
- [x] Created `upsert_linkedin_connection` function with encrypted token storage
- [x] Fixed all security warnings (revoked public execute on internal functions)
- [x] Installed `@supabase/ssr` and `@supabase/supabase-js`
- [x] Created Supabase client helpers (server.ts, client.ts, middleware.ts, types.ts)
- [x] Replaced password middleware with Supabase session middleware
- [x] Built magic link login page
- [x] Created auth callback and signout routes
- [x] Updated layout with user email and sign out button
- [x] Updated upload-resume to persist to Supabase Storage + profiles.cv_text
- [x] Updated /api/apply to read CV from profiles and store applications in database
- [x] Updated apply.mjs to support cvOverride option
- [x] Scaffolded LinkedIn OAuth routes (works when credentials added)
- [x] Created LinkedIn connection UI component on Profile page
- [x] Generated TypeScript types from database schema
- [x] Created .env.example with all required variables
- [x] Build passes successfully

**To deploy:**
1. Add env vars to Vercel (see .env.example)
2. Get service role key from Supabase dashboard (Settings > API)
3. Generate encryption key: `openssl rand -base64 32`
4. Redeploy
