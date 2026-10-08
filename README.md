# Aetherion

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
