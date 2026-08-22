# Google Flights MCP (LinkAjax)

Free Google Flights MCP for Cursor, vendored from
[andreacappelletti97/google-flights-mcp](https://github.com/andreacappelletti97/google-flights-mcp)
(ISC). No API key. No SerpAPI.

Two ways to connect:

| Mode | Best for |
| --- | --- |
| **Remote on Railway** (recommended) | Same MCP URL from Cloud Agent and desktop Cursor |
| **Local stdio** | Live fare search on home/office Wi‑Fi when Railway is blocked by Google |

---

## Deploy to Railway (always-on remote MCP)

The server runs in **HTTP mode** at `/mcp` with a health check at `/health`.

### 1. Install Railway CLI and sign in

```bash
npm i -g @railway/cli
railway login
```

### 2. Create a new Railway service for the MCP

In the [Railway dashboard](https://railway.com):

1. Open your project (or create one, e.g. `LinkAjax`)
2. **New service → GitHub repo** → select `LinkAjax`
3. Set **Root directory** to `mcp/google-flights`
4. Railway will use `mcp/google-flights/Dockerfile` and `railway.toml`

Or deploy from CLI:

```bash
cd mcp/google-flights
railway link          # pick project, or railway init
npm run deploy:flights-mcp --prefix ../..   # from repo root
```

The deploy script generates `GF_MCP_AUTH_TOKEN` and sets it on the service.

### 3. Add a public domain

```bash
cd mcp/google-flights
railway domain
```

Note the URL, e.g. `https://google-flights-mcp-production.up.railway.app`.

Verify:

```bash
curl https://<your-domain>/health
# {"status":"ok","tools":12,"version":"1.0.0"}
```

### 4. Set environment variables

**On Railway** (service variables):

| Variable | Value |
| --- | --- |
| `GF_MCP_AUTH_TOKEN` | Random secret, e.g. `openssl rand -hex 24` |
| `PORT` | Set automatically by Railway |

**On your machine** (for Cursor):

Add to your shell profile (`~/.bashrc`, `~/.zshrc`) or system env:

```bash
export GF_MCP_URL="https://<your-domain>/mcp"
export GF_MCP_AUTH_TOKEN="<same-token-as-railway>"
```

Restart Cursor after exporting.

### 5. Cursor config (already in repo)

`.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "google-flights": {
      "url": "${env:GF_MCP_URL}",
      "headers": {
        "Authorization": "Bearer ${env:GF_MCP_AUTH_TOKEN}"
      }
    },
    "google-flights-local": {
      "command": "node",
      "args": ["${workspaceFolder}/mcp/google-flights/dist/index.js"]
    }
  }
}
```

- **`google-flights`**: remote Railway (works everywhere once env is set)
- **`google-flights-local`**: local fallback (disable in MCP settings if you only want remote)

Restart Cursor → **Settings → Tools & MCP** → confirm `google-flights` is green.

---

## Local-only setup (stdio)

If you skip Railway:

```bash
npm run setup:flights-mcp
npm run flights-mcp:smoke
```

Copy `.cursor/mcp.local.example.json` over `.cursor/mcp.json` if you want local-only, or enable `google-flights-local` in MCP settings.

---

## Tools (12)

| Tool | Use |
| --- | --- |
| `search_flights` | One-way or round-trip search |
| `search_multi_city` | Multi-leg itineraries |
| `get_price_insights` | Cheapest dates in a range |
| `get_calendar_heatmap` | ~60-day price calendar |
| `compare_cabin_classes` | Economy through first |
| `track_price` / `get_price_history` / `list_tracked_routes` | Price tracking (SQLite on server when remote) |
| `lookup_airport` | City / IATA / name search |
| `find_nearby_airports` | Alternatives within a radius |
| `get_flight_url` | Direct Google Flights booking link |
| `analyze_layovers` | Connection risk |

Example prompts in Agent chat:

- "Find nonstop flights from SIN to KUL on 2026-09-03, OneWorld preferred"
- "Cheapest week to fly SIN to LHR in October"
- "Nearby airports to Singapore within 100 km"

---

## Smoke tests

**Local stdio:**

```bash
npm run flights-mcp:smoke
```

**Remote (after deploy):**

```bash
curl https://<your-domain>/health
```

---

## Important limits

| Topic | Detail |
| --- | --- |
| **Connectivity** | Railway fixes cloud vs desktop MCP connection. One URL, always on. |
| **Google IP blocking** | Google often blocks **datacentre IPs** (Railway, Cloud Agent). Live `search_flights` may fail remotely. |
| **What works remotely** | `lookup_airport`, `find_nearby_airports`, `get_flight_url` (no Google scrape needed) |
| **Live fares from home** | Use `google-flights-local` on home/office Wi‑Fi, or open `get_flight_url` links in your browser |
| **No official API** | Reverse-engineered endpoint; can break if Google changes format |
| **Not a booking system** | Search and links only |

---

## Licence

Upstream: ISC (see `mcp/google-flights/LICENSE`).
