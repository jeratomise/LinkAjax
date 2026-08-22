# Google Flights MCP (LinkAjax)

Free Google Flights MCP for Cursor, vendored into LinkAjax from
[andreacappelletti97/google-flights-mcp](https://github.com/andreacappelletti97/google-flights-mcp)
(ISC). No API key. No SerpAPI.

## Why this package

| Option | Free? | API key | Stack | Notes |
| --- | --- | --- | --- | --- |
| **andreacappelletti97/google-flights-mcp** (chosen) | Yes | No | Node 22 | 12 tools, npm package, richest free option |
| HaroldLeo/google-flights-mcp | Yes (+ optional SerpAPI) | Optional | Python | Good fallback if you add a SerpAPI key |
| manganate006/google-flights-mcp | Yes | No | Python | 6 tools via fast-flights |
| SerpAPI-based MCPs | Free tier only | Required | Various | Paid after free quota |
| Apify Google Flights actors | Pay-per-use | Apify token | Actors | Not free; not used here |

## Setup (once per clone)

Needs **Node.js 22+**.

```bash
npm run setup:flights-mcp
```

That installs and builds `mcp/google-flights`.

Cursor is already wired via `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "google-flights": {
      "command": "node",
      "args": ["${workspaceFolder}/mcp/google-flights/dist/index.js"]
    }
  }
}
```

Restart Cursor (or reload MCP tools). You should see server `google-flights` with 12 tools.

### npx alternative (no local build)

```json
{
  "mcpServers": {
    "google-flights": {
      "command": "npx",
      "args": ["-y", "google-flights-mcp"]
    }
  }
}
```

## Tools

| Tool | Use |
| --- | --- |
| `search_flights` | One-way or round-trip search |
| `search_multi_city` | Multi-leg itineraries |
| `get_price_insights` | Cheapest dates in a range |
| `get_calendar_heatmap` | ~60-day price calendar |
| `compare_cabin_classes` | Economy through first |
| `track_price` / `get_price_history` / `list_tracked_routes` | Local SQLite price tracking |
| `lookup_airport` | City / IATA / name search |
| `find_nearby_airports` | Alternatives within a radius |
| `get_flight_url` | Direct Google Flights booking link |
| `analyze_layovers` | Connection risk |

Example prompts:

- "Find nonstop flights from SIN to NRT next month"
- "Cheapest week to fly SIN to LHR in October"
- "Compare economy vs business for SIN to SFO on 2026-10-12"
- "Nearby airports to SIN"

## Smoke test

```bash
npm run flights-mcp:smoke
```

Confirms the server starts and lists all 12 tools.

## Limits

- There is no official Google Flights API. This reverse-engineers Google's internal endpoint.
- Google often blocks datacentre / cloud IPs (returns `/travel/flights/unsupported`). Use from your **local Cursor** on a normal home or office network for live fares.
- Airport lookup, nearby airports, and booking URL generation work offline or without Google search.
- Prices are estimates at query time. Not a booking system.

## Licence

Upstream: ISC (see `mcp/google-flights/LICENSE`).
