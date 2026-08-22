# MCP servers in LinkAjax

| Server | Path | Transport | Docs |
| --- | --- | --- | --- |
| Google Flights | `mcp/google-flights` | HTTP on Railway (`/mcp`) or local stdio | [docs/mcp-google-flights.md](../docs/mcp-google-flights.md) |

Cursor loads servers from `.cursor/mcp.json`.

```bash
# Remote (Railway)
npm run deploy:flights-mcp

# Local build
npm run setup:flights-mcp
```
