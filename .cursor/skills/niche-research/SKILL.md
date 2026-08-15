---
name: niche-research
description: >
  Weekly 7-day trend brief aligned to Jerome's voice pillars (AI, cloud GTM, APAC tech careers, B2B marketing). Writes data/research/weekly/YYYY-MM-DD.md, suggests 7-10 creators, and 5-7 original posts in data/queue/. Never scrape LinkedIn. Never copy creators.
---

# Niche Research (AJAX)

Today's date matters. Exclude anything older than 7 days. Never invent links, metrics, or dates. British English. DD/MM/YYYY. No em dashes. No LinkedIn scrape.

## Niche

Read `data/about-me.md`. Default niche: APAC cloud and AI infrastructure GTM, B2B marketing, and senior marketing careers.

## Browse

Prefer live search tools (WebSearch, WebFetch, Firecrawl, Chrome). Verify a visible publish date on every item. Order:

1. Niche news, launch, controversy, research, regulation (past week)
2. Reddit niche subreddits if reachable
3. Public X / web discussion if reachable

If a platform cannot be scanned, say so in the brief. Do not fake the scan.

## Output file

Write `data/research/weekly/YYYY-MM-DD.md`:

1. First line: `As of DD/MM/YYYY`
2. Markdown table:

```
| Theme / Emerging Story | Platforms (Reddit, X, News) | Key Communities / Accounts / Sources | Representative Links | Attention Signals | What's Happening or Being Debated | Why It Matters for APAC cloud and AI GTM | Shareable Angle |
```

Target up to 20 themes. Fewer is fine. Do not pad.

3. Then a **Creators to watch** list of 7 to 10 people on LinkedIn or other platforms. For each: name, where they publish, why they are relevant, what not to copy. Public sources only.

4. Then run the post-writer skill in batch mode and write 5 to 7 original queue files. Each post must:
   - Be in `data/voice.md`
   - Use a shareable angle from the table
   - Differ in structure and wording from the source (originality note required)
   - Help recruiter positioning without posting confidential AMD material

After the table in chat, ask which row to turn into an extra post. The Sunday automation skips that question and always writes the queue.
