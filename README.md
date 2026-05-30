# MCP Demand Engine

![MCP](https://img.shields.io/badge/MCP-Ready-8B5CF6?logo=anthropic&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_15-000000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

An MCP-native demand generation server. Expose LinkedIn signal detection, ICP scoring, contact enrichment, and CRM routing as typed MCP tools that any AI agent can discover and invoke — with a built-in observability dashboard.

**Demo mode works without API keys.** Clone, `npm install`, `npm run dev`, and explore the full dashboard instantly.

## One-Line Install

**Claude Desktop** — paste into `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "demand": {
      "command": "npx",
      "args": ["-y", "ts-node", "src/mcp/server.ts"]
    }
  }
}
```

**Claude Code**:
```bash
claude mcp add demand -- npx -y ts-node src/mcp/server.ts
```

**Cursor** — add to `.cursor/mcp.json`:
```json
{
  "mcpServers": [{
    "name": "demand",
    "command": "npx",
    "args": ["-y", "ts-node", "src/mcp/server.ts"]
  }]
}
```

## Why MCP for Demand Gen?

Demand generation is a chain of fragmented tools: LinkedIn for signals, Apollo for enrichment, Salesforce for routing, Outreach for sequencing. Every SDR ends up copy-pasting between tabs. The Model Context Protocol (MCP) provides a standard way to expose these as **tools** that any AI agent can discover and invoke. This project is a reference implementation — a demand-specific MCP server with a visual trace panel so you can see every tool call the agent makes.

## Quick Start

```bash
# Clone and install
git clone https://github.com/developers-universe-1/agentic-demand-engine.git
cd agentic-demand-engine
npm install

# Zero-config demo mode — works without any API keys
cp .env.example .env
npm run dev
```

Open `http://localhost:3000` and click **Open Dashboard**.

That's it. No LinkedIn API keys, no Apollo subscriptions, no CRM credentials to hunt down.

## MCP Tools

| Tool | Input | What It Returns |
|---|---|---|
| `detect_signals` | `profile_urls[]`, `signal_types[]` | Engagement signals (likes, comments, reposts, profile views) with timestamps |
| `score_icp` | `lead_data` | 0–100 ICP match score with title/industry/company-size breakdown |
| `enrich_contact` | `linkedin_url` or `email` | Verified email, direct dial, company info, tech stack from Apollo/Clearbit |
| `route_to_crm` | `lead_id`, `crm` (salesforce/hubspot) | Routing status, assigned rep, campaign tag |
| `get_watchlist` | — | Monitored profiles with follower counts and qualified-lead attribution |

### Example: Claude Desktop Config

```json
{
  "mcpServers": {
    "demand": {
      "command": "npx",
      "args": ["mcp-demand-engine@latest", "serve"],
      "env": {
        "APOLLO_API_KEY": "your-key"
      }
    }
  }
}
```

Then ask Claude: *"Find everyone who liked our CEO's last 3 LinkedIn posts, score them against our ICP, enrich the top 10, and route the hot leads to Salesforce."*

## What You Get

| Capability | MCP Tool | What It Does |
|---|---|---|
| **Signal Detection** | `detect_signals` | Monitors LinkedIn engagement — likes, comments, reposts, profile views, mentions |
| **ICP Scoring** | `score_icp` | Scores every engager 0–100 against your ICP with configurable filters |
| **Contact Enrichment** | `enrich_contact` | One-click verified email and direct dial via Apollo and Clearbit |
| **CRM Routing** | `route_to_crm` | Ships qualified leads straight to Salesforce or HubSpot with campaign tags |
| **Lead Feed** | `get_lead_feed` | Qualified leads surface automatically — enriched, scored, and ready to outreach |

## Demo Mode

The framework ships with rich mock data so you can validate the architecture instantly:

- **8 qualified leads** with ICP scores, engagement types, enriched contacts, and engagement timelines
- **4 watched LinkedIn profiles** including industry thought leaders
- **Interactive ICP builder** with title, industry, and company size filters
- **Notification rules** with Slack/webhook/email routing simulation
- **Real-time streaming simulation** showing scan → score → enrich pipeline

## Architecture

```
┌─────────────────────────────────────────────┐
│  MCP Client (Claude, Cursor, any MCP host)  │
│         ↓ stdio / SSE                       │
├─────────────────────────────────────────────┤
│  Next.js 15 App Router                      │
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │  MCP Server │  │  Observability UI    │  │
│  │  /api/tools │  │  Dashboard + Traces  │  │
│  │  /api/resources│  │                     │  │
│  └──────┬──────┘  └──────────────────────┘  │
│         ↓                                   │
│  ┌────────────────────────────────────────┐ │
│  │  Integration Tool Servers              │ │
│  │  ├─ linkedin.ts    (Signal detection) │ │
│  │  ├─ apollo.ts      (Enrichment)       │ │
│  │  ├─ clearbit.ts    (Firmographics)    │ │
│  │  ├─ salesforce.ts  (CRM routing)      │ │
│  │  └─ hubspot.ts     (CRM routing)      │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Tech Stack

- **Framework:** Next.js 15 App Router
- **Protocol:** Model Context Protocol (MCP) — stdio / SSE transport ready
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Validation:** Zod (structured LLM output + MCP tool schemas)
- **LLM:** OpenAI GPT-4o / Claude 3.5 Sonnet via streaming completions
- **Testing:** Jest + ts-jest
- **CI/CD:** GitHub Actions
- **Deployment:** Multi-stage Docker build

## Dashboard Views

| View | What It Shows |
|---|---|
| **Overview** | Total leads, enriched count, average ICP score, high-intent leads, watched profiles |
| **Watchlist** | 4 monitored LinkedIn profiles with follower counts, qualified lead attribution, and signal types |
| **Lead Feed** | Scored leads (0–100) with engagement type, company info, enriched email/phone, LinkedIn links, expandable engagement timeline |
| **ICP Builder** | Interactive filters for titles, industries, and company sizes with live summary |
| **Notifications** | Slack/webhook/email routing rules with toggle switches and trigger history |

## Testing

```bash
npm test
```

Covers cache expiration, ICP scoring engine streaming, and error hierarchy.

## Deployment

```bash
docker build -t mcp-demand-engine .
docker run -p 3000:3000 mcp-demand-engine
```

## Quick Validation

See [`QUICK_TEST_QUERIES.md`](./QUICK_TEST_QUERIES.md) for end-to-end test scenarios you can run in under 5 minutes.

## Troubleshooting

See [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) for the most common setup issues and how to fix them.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to add tools, run tests, and submit PRs.

## Roadmap

- [ ] Full MCP stdio transport server implementation
- [ ] MCP `tools/list`, `resources/list`, `prompts/list` capability endpoints
- [ ] Real LinkedIn API integration (currently simulated for zero-config demo)
- [ ] Apollo/Clearbit live enrichment wiring
- [ ] OAuth callback handlers for Salesforce, HubSpot

## License

MIT
