# Sukuna

Saitama-level Discord platform.

Clean. Powerful. Production-ready.  
500+ commands. Zero fluff.

## Stack

- TypeScript (strict)
- discord.js v14
- PostgreSQL + Redis
- BullMQ
- Lavalink
- Multi-AI providers (Grok, Claude, GPT, Gemini)
- Docker ready

## Philosophy

Simple on the surface.  
Overwhelmingly capable underneath.  
No unnecessary complexity.  
No half-finished features.  
Every command works perfectly from day one.

## Getting Started

```bash
cp .env.example .env
# fill in your tokens

npm install
npm run dev
```

## Structure

```
src/
├── client/          # Discord client setup
├── config/          # Configuration & validation
├── structures/      # Base Command, Event, ContextMenu
├── handlers/        # Command & Event loaders
├── commands/        # All 500+ commands (categorized)
├── events/          # Discord events
├── database/        # Prisma / Postgres + Redis
├── queues/          # BullMQ workers
├── music/           # Lavalink manager
├── ai/              # Multi-provider AI layer
├── utils/           # Helpers
└── types/           # Shared types
```

## License

MIT

## Persistence

Runtime data is stored under `data/` (JSON):

| File | Contents |
|------|----------|
| `economy.json` | wallets, bank, XP |
| `cases.json` | moderation cases |
| `guilds.json` | prefix + language |
| `inventory.json` | shop purchases |

Survives restarts on the same host volume.

## AI

Set **one** of these env vars:

```
GROK_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
```

Commands: `/ask` · `/aistatus`

## Music / Lavalink

Queue works without Lavalink. For real search metadata:

```bash
docker compose -f docker-compose.lavalink.yml up -d
```

```
LAVALINK_HOST=127.0.0.1
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
```

`/musicstatus` · `/play` · `/queue`

> Full Discord voice streaming needs a live Lavalink session + voice gateway. Free shared hosts often cannot run both bot + Lavalink; use a VPS or separate node.
