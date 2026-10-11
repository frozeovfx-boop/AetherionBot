export const tr = {
  // common
  "common.error": "Bir hata oluştu.",
  "common.no_permission": "Bu komutu kullanmak için yetkin yok.",
  "common.bot_no_permission": "Bu işlem için bende yeterli yetki yok.",
  "common.guild_only": "Bu komut sadece sunucuda kullanılabilir.",
  "common.invalid_target": "Geçersiz hedef.",
  "common.cooldown": "Bu komutu tekrar kullanmak için **{time}** saniye bekle.",
  "common.owner_only": "Bu komutu sadece bot sahibi kullanabilir.",
  "common.done": "Tamam.",
  "common.none": "—",

  // ping
  "ping.measuring": "⋯ ölçülüyor",
  "ping.title": "◈ Bağlantı",
  "ping.latency": "Mesaj",
  "ping.api": "API",
  "ping.uptime": "Uptime",

  // help
  "help.title": "Aetherion",
  "help.tagline": "*Temiz. Güçlü. Gereksiz süs yok.*",
  "help.total": "Toplam {count} komut",
  "help.detail": "Detay için  `/help kategori:`",
  "help.empty_category": "Bu kategoride komut yok.",
  "help.commands_count": "{count} komut",

  // language
  "lang.title": "Dil",
  "lang.set": "Sunucu dili **{lang}** olarak ayarlandı.",
  "lang.current": "Mevcut dil: **{lang}**",
  "lang.invalid": "Geçersiz dil. Kullanılabilir: `tr`, `en`",

  // moderation
  "mod.self": "Kendine işlem uygulayamazsın.",
  "mod.hierarchy": "Bu kullanıcı senden yüksek veya eşit role sahip.",
  "mod.not_bannable": "Bu kullanıcıyı yasaklayamıyorum.",
  "mod.not_kickable": "Bu kullanıcıyı atamıyorum.",
  "mod.not_moderatable": "Bu kullanıcıya işlem uygulayamıyorum.",
  "mod.ban_title": "Yasaklama",
  "mod.kick_title": "Atma",
  "mod.warn_title": "Uyarı",
  "mod.timeout_title": "Timeout",
  "mod.user": "Kullanıcı",
  "mod.moderator": "Yetkili",
  "mod.reason": "Sebep",
  "mod.duration": "Süre",
  "mod.case": "Case #{id}",
  "mod.no_reason": "Sebep belirtilmedi",

  // economy
  "eco.balance_title": "⬡ Bakiye",
  "eco.wallet": "Cüzdan",
  "eco.bank": "Banka",
  "eco.total": "Toplam",
  "eco.level": "Seviye",
  "eco.daily_title": "⬡ Daily Ödül",
  "eco.daily_claim": "**+{amount}** 💵 cüzdanına eklendi",
  "eco.daily_balance": "Yeni bakiye",
  "eco.daily_wait": "Çok erken.\nTekrar: **{time}** sonra",
  "eco.insufficient": "Yeterli paran yok.",
  "eco.work_title": "İş Tamam",
  "eco.work_done": "**{job}** olarak çalıştın ve **{amount}** 💵 kazandın.",

  // music
  "music.no_voice": "Önce bir ses kanalına gir.",
  "music.empty": "Kuyruk boş.",
  "music.not_playing": "Çalan müzik yok.",
  "music.lavalink_hint": "Lavalink bağlı değil — kuyruk aktif, ses yok.",

  // ticket
  "ticket.created": "Ticket oluşturuldu: {channel}",
  "ticket.exists": "Zaten açık bir ticket'ın var: {channel}",
  "ticket.closing": "Ticket 5 saniye içinde kapatılıyor...",
} as const;

export type TranslationKey = keyof typeof tr;
