# Yuta

Sade, güçlü Discord botu (discord.js v14 · TypeScript).

## Hızlı kurulum

1. [Discord Developer Portal](https://discord.com/developers/applications) → uygulama + bot oluştur  
2. Privileged intents: **Server Members**, **Message Content**, **Presence** (gerekirse)  
3. Repo’yu clone / Railway / host’a bağla  

```bash
cp .env.example .env
npm install
npm start
```

## Zorunlu env

```
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
# opsiyonel: tek sunucu deploy
DISCORD_GUILD_ID=
PREFIX=!
OWNER_IDS=id1,id2
```

## Opsiyonel

```
# AI (en az biri)
GROK_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=

# Müzik
LAVALINK_HOST=
LAVALINK_PORT=
LAVALINK_PASSWORD=
```

## Önemli komutlar

| Alan | Komut |
|------|--------|
| Yardım | `/help` |
| Prefix / dil | `/setprefix` `/setlanguage` |
| Modlog | `/setmodlog` |
| Welcome | `/setwelcome` |
| Self-role | `/selfrole` |
| Log | `/logset` |
| Automod | `/automod` |
| Ticket | `/ticket-setup` |
| Özel oda | `/ozeloda` |
| Davet | `/davet` |
| Çekiliş | `/giveaway` · `/sans` |
| Stat | `/stat` |
| AI | `/ask` `/conseil` |

## Notlar

- Slash limiti ~100; prefix ile ek komutlar çalışır  
- Veri: `data/*.json` (restart’ta kalır)  
- Bot adı Discord’dan **Yuta** yapılabilir; kod footer’ı Yuta  

## Lisans / isim

Fan project. JJK ile resmi bağ yoktur.
