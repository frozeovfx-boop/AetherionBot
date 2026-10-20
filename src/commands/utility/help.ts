import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";
import { FREE_LIMITS, isGuildPremium } from "../../utils/premium.js";

const V1 = "Yuta"; // custom emoji optional — raw id breaks if bot cannot use it

const CATEGORIES: { id: string; label: string; blurb: string }[] = [
  { id: "moderation", label: "Moderasyon", blurb: "Ban · warn · timeout · case" },
  { id: "server", label: "Sunucu", blurb: "Ticket · log · welcome · self-role" },
  { id: "utility", label: "Araçlar", blurb: "Help · premium · info" },
  { id: "economy", label: "Ekonomi", blurb: "Balance · work · level" },
  { id: "music", label: "Müzik", blurb: "Play · queue · skip" },
  { id: "ai", label: "AI", blurb: "Ask · Conseil" },
];

/** Setup order — what a new server should do first */
const SETUP_STEPS = [
  { n: "1", cmd: "/ticket-setup", label: "Ticket paneli" },
  { n: "2", cmd: "/logset", label: "Log kanalları" },
  { n: "3", cmd: "/automod", label: "Automod" },
  { n: "4", cmd: "/setwelcome", label: "Karşılama" },
  { n: "5", cmd: "/selfrole", label: "Self-role" },
  { n: "6", cmd: "/ayarlar", label: "Özet kontrol" },
];

const SYSTEMS: { label: string; value: string; cmd: string }[] = [
  { label: "Ticket", value: "sys:ticket", cmd: "/ticket-setup" },
  { label: "Automod", value: "sys:automod", cmd: "/automod" },
  { label: "Log", value: "sys:log", cmd: "/logset" },
  { label: "Self-role", value: "sys:selfrole", cmd: "/selfrole" },
  { label: "Welcome", value: "sys:welcome", cmd: "/setwelcome" },
  { label: "Çekiliş", value: "sys:giveaway", cmd: "/giveaway" },
  { label: "Özel oda", value: "sys:tempvoice", cmd: "/ozeloda" },
  { label: "Premium", value: "sys:premium", cmd: "/premium" },
  { label: "Conseil", value: "sys:conseil", cmd: "/conseil" },
  { label: "Ayarlar", value: "sys:ayarlar", cmd: "/ayarlar" },
];

const SYS_BODY: Record<string, string> = {
  "sys:ticket":
    "**Ticket**\n`/ticket-setup panel` — paneli kanala at\n`/ticket-setup buton-ekle` — özel buton + renk\n`/ticket-setup ayar` — kategori · log · destek rolü",
  "sys:automod":
    "**Automod**\n`/automod davet` · `link` · `spam` · `kufur`\n`/automod kelime` — liste\n`/automod muaf` — kanal muaf",
  "sys:log":
    "**Log**\n`/logset mesaj` · `uye` · `ses` · `davet`\nSilinen mesaj, giriş-çıkış, ses hareketi",
  "sys:selfrole":
    "**Self-role**\n`/selfrole panel` — buton veya menü\nKalıcı; restart sonrası çalışır",
  "sys:welcome":
    "**Welcome**\n`/setwelcome` — kanal + mesaj\n`{user}` `{server}` `{count}` `{inviter}`",
  "sys:giveaway":
    "**Çekiliş**\n`/giveaway baslat` — ödül + süre\n`/giveaway sans-rol` — şans çarpanı\nMesajda **Şansım** butonu",
  "sys:tempvoice":
    "**Özel oda**\n`/ozeloda` — hub ses kanalı\nHub’a girenlere geçici oda",
  "sys:premium": `**Premium**\n\`/premium durum\`\nÜcretsiz/gün · ask **${FREE_LIMITS.ask}** · debate **${FREE_LIMITS.conseil_debate}**\nPremium’da limit kalkar`,
  "sys:conseil":
    "**Conseil**\n`/conseil debate` — 2 turlu tartışma\n`/conseil consult` — rapor\n`/ask` — tek soru",
  "sys:ayarlar":
    "**Ayarlar**\n`/ayarlar` — sunucu özeti (yetkili)\nPrefix · premium · kanallar",
};


/** Step-by-step inside help — buttons show these */
const SETUP_GUIDES: Record<
  string,
  { label: string; steps: { id: string; label: string; body: string }[] }
> = {
  "sys:ticket": {
    label: "Ticket",
    steps: [
      {
        id: "ayar",
        label: "1. Ayar",
        body: [
          "**1 · Ayar**",
          "",
          "`/ticket-setup ayar`",
          "• **kategori** — ticket kanalları buraya açılır",
          "• **destek** — pinglenecek rol",
          "• **log** — kapanış kaydı",
        ].join("
"),
      },
      {
        id: "buton",
        label: "2. Buton",
        body: [
          "**2 · Buton**",
          "",
          "`/ticket-setup buton-ekle`",
          "• **yazi** — Destek, Rapor…",
          "• **renk** — Primary / Success / Danger",
          "• **destek** — türe özel rol (opsiyonel)",
          "",
          "Liste: `/ticket-setup buton-liste`",
        ].join("
"),
      },
      {
        id: "panel",
        label: "3. Panel",
        body: [
          "**3 · Panel**",
          "",
          "`/ticket-setup panel`",
          "• **kanal** — panelin gideceği kanal",
          "• başlık / açıklama isteğe bağlı",
          "",
          "Üyeler butona basınca ticket açılır.",
        ].join("
"),
      },
    ],
  },
  "sys:log": {
    label: "Log",
    steps: [
      {
        id: "mod",
        label: "Mod",
        body: ["**Mod log**", "", "`/logset mod`", "Ban · kick · warn · timeout", "", "Aynı: `/setmodlog`"].join("
"),
      },
      {
        id: "mesaj",
        label: "Mesaj",
        body: ["**Mesaj log**", "", "`/logset mesaj`", "Silinen ve düzenlenen mesajlar"].join("
"),
      },
      {
        id: "uye",
        label: "Üye / ses",
        body: ["**Üye & ses**", "", "`/logset uye`", "`/logset ses`", "", "Özet: `/logset durum`"].join("
"),
      },
    ],
  },
  "sys:automod": {
    label: "Automod",
    steps: [
      {
        id: "temel",
        label: "Temel",
        body: ["**Automod**", "", "`/automod davet` · `link` · `spam` · `kufur`", "Her biri aç / kapa"].join("
"),
      },
      {
        id: "kelime",
        label: "Kelime",
        body: ["**Kelime filtresi**", "", "`/automod kelime`", "`/automod muaf` — kanal muafiyeti"].join("
"),
      },
    ],
  },
  "sys:welcome": {
    label: "Welcome",
    steps: [
      {
        id: "set",
        label: "Kur",
        body: ["**Welcome**", "", "`/setwelcome`", "`{user}` `{server}` `{count}` `{inviter}`"].join("
"),
      },
    ],
  },
  "sys:selfrole": {
    label: "Self-role",
    steps: [
      {
        id: "panel",
        label: "Panel",
        body: ["**Self-role**", "", "`/selfrole panel`", "Buton veya menü · kalıcı"].join("
"),
      },
    ],
  },
  "sys:giveaway": {
    label: "Çekiliş",
    steps: [
      {
        id: "baslat",
        label: "Başlat",
        body: ["**Çekiliş**", "", "`/giveaway baslat`", "`/giveaway sans-rol`", "Mesajda Şansım butonu"].join("
"),
      },
    ],
  },
  "sys:tempvoice": {
    label: "Özel oda",
    steps: [
      {
        id: "hub",
        label: "Hub",
        body: ["**Özel oda**", "", "`/ozeloda`", "Hub ses kanalını seç"].join("
"),
      },
    ],
  },
  "sys:premium": {
    label: "Premium",
    steps: [
      {
        id: "durum",
        label: "Durum",
        body: ["**Premium**", "", "`/premium durum`", "Sahip: `/premium ver`"].join("
"),
      },
    ],
  },
  "sys:conseil": {
    label: "Conseil",
    steps: [
      {
        id: "use",
        label: "Kullan",
        body: ["**Conseil**", "", "`/ask`", "`/conseil debate`", "`/conseil consult`", "Env: `GOOGLE_API_KEY`"].join("
"),
      },
    ],
  },
  "sys:ayarlar": {
    label: "Ayarlar",
    steps: [
      {
        id: "ozet",
        label: "Özet",
        body: ["**Ayarlar**", "", "`/ayarlar`", "Prefix · log · ticket özeti"].join("
"),
      },
    ],
  },
};

function guideEmbed(sysKey: string, stepId?: string): EmbedBuilder {
  const g = SETUP_GUIDES[sysKey];
  if (!g) return systemEmbed(sysKey);
  const step = (stepId && g.steps.find((s) => s.id === stepId)) || g.steps[0]!;
  return baseEmbed(Theme.primary)
    .setAuthor({ name: `${V1} · ${g.label}` })
    .setTitle(step.label)
    .setDescription(step.body)
    .setFooter({ text: "Komutu kopyala · slash ile çalıştır" });
}

function categorySetupKey(categoryId: string): string | null {
  if (categoryId === "server") return "sys:ticket";
  if (categoryId === "moderation") return "sys:log";
  if (categoryId === "ai") return "sys:conseil";
  return null;
}

function publicCommands(client: YutaClient) {
  return [...client.commands.values()].filter((c) => c.category !== "admin" && !c.ownerOnly);
}

function countMap(client: YutaClient): Map<string, number> {
  const m = new Map<string, number>();
  for (const c of publicCommands(client)) {
    m.set(c.category, (m.get(c.category) ?? 0) + 1);
  }
  return m;
}

function homeEmbed(client: YutaClient, guildId: string | null): EmbedBuilder {
  const counts = countMap(client);
  const prem = guildId ? isGuildPremium(client, guildId) : false;
  const total = publicCommands(client).length;

  const setupBlock = SETUP_STEPS.map((s) => `\`${s.n}\` ${s.cmd} — **${s.label}**`).join("
");

  const catBlock = CATEGORIES.filter((c) => counts.has(c.id))
    .map((c) => {
      const n = counts.get(c.id) ?? 0;
      return `**${c.label}** · \`${n}\`\n　${c.blurb}`;
    })
    .join("\n\n");

  const sysBlock = SYSTEMS.map((s) => `• \`${s.cmd}\` **${s.label}**`).join("
");

  return baseEmbed(Theme.primary)
    .setAuthor({
      name: `${V1}  Yuta`,
      iconURL: client.user?.displayAvatarURL({ size: 128 }) ?? undefined,
    })
    .setTitle("Komut merkezi")
    .setThumbnail(client.user?.displayAvatarURL({ size: 256 }) ?? null)
    .setDescription(
      [
        line(),
        "Sunucunu **sırayla** kur, sonra kategoriden komut seç.",
        line(),
      ].join("
")
    )
    .addFields(
      {
        name: "Kurulum",
        value: setupBlock,
        inline: false,
      },
      {
        name: "Kategoriler",
        value: catBlock.slice(0, 1020) || "—",
        inline: true,
      },
      {
        name: "Sistemler",
        value: sysBlock.slice(0, 1020),
        inline: true,
      },
      {
        name: "Durum",
        value: `**${total}** komut · ${prem ? "**Premium**" : "Free"} · \`${Theme.footer}\``.slice(0, 200),
        inline: false,
      }
    );
}

function categoryEmbed(client: YutaClient, categoryId: string): EmbedBuilder {
  const meta = CATEGORIES.find((c) => c.id === categoryId);
  const commands = publicCommands(client)
    .filter((c) => c.category === categoryId)
    .sort((a, b) => a.name.localeCompare(b.name));

  const list =
    commands.length === 0
      ? "—"
      : commands.map((c) => `\`/${c.name}\`\n　${c.description}`).join("\n\n");

  return baseEmbed(Theme.primary)
    .setAuthor({ name: `${V1}  ${meta?.label ?? categoryId}` })
    .setDescription([line(), list.slice(0, 3800), line()].join("
"))
    .setFooter({
      text:
        categoryId === "server"
          ? `${commands.length} komut · altta kurulum butonları`
          : `${commands.length} komut · menüden geri dön`,
    });
}

function systemEmbed(value: string): EmbedBuilder {
  const meta = SYSTEMS.find((s) => s.value === value);
  const hasGuide = Boolean(SETUP_GUIDES[value]);
  return baseEmbed(Theme.primary)
    .setAuthor({ name: `${V1}  ${meta?.label ?? "Sistem"}` })
    .setDescription(
      [
        line(),
        SYS_BODY[value] ?? "—",
        line(),
        hasGuide ? "_Alttaki yeşil butonlarla kurulum adımlarına bak._" : "",
      ]
        .filter(Boolean)
        .join("
")
    )
    .setFooter({ text: meta?.cmd ?? "Yuta" });
}

/** Turkish aliases for search */
const SEARCH_ALIASES: Record<string, string[]> = {
  ban: ["ban", "yasak"],
  kick: ["kick", "at"],
  mute: ["timeout", "mute", "sustur"],
  ticket: ["ticket", "destek", "ticket-setup"],
  cekilis: ["giveaway", "çekiliş"],
  çekiliş: ["giveaway"],
  giveaway: ["giveaway"],
  muzik: ["play", "music", "queue", "skip"],
  müzik: ["play", "queue", "skip"],
  para: ["balance", "work", "daily", "level"],
  ai: ["ask", "conseil"],
  premium: ["premium"],
  log: ["logset", "log"],
  rol: ["selfrole", "addrole"],
  oda: ["ozeloda"],
  kurulum: ["ticket-setup", "logset", "automod", "setwelcome", "selfrole"],
};

function expandQuery(raw: string): string[] {
  const q = raw.trim().toLowerCase();
  if (!q) return [];
  const parts = new Set<string>([q]);
  for (const [key, al] of Object.entries(SEARCH_ALIASES)) {
    if (q.includes(key) || al.some((a) => a.includes(q) || q.includes(a))) {
      al.forEach((a) => parts.add(a));
      parts.add(key);
    }
  }
  return [...parts];
}

function scoreCommand(name: string, description: string, category: string, terms: string[]): number {
  const n = name.toLowerCase();
  const d = description.toLowerCase();
  const c = category.toLowerCase();
  let score = 0;
  for (const t of terms) {
    if (n === t) score += 100;
    else if (n.startsWith(t)) score += 70;
    else if (n.includes(t)) score += 40;
    if (c === t || c.includes(t)) score += 25;
    if (d.includes(t)) score += 15;
  }
  return score;
}

function searchEmbed(client: YutaClient, query: string): EmbedBuilder {
  const terms = expandQuery(query);
  if (!terms.length) {
    return baseEmbed(Theme.primary).setAuthor({ name: `${V1} Arama` }).setDescription("Boş arama.");
  }

  const ranked = publicCommands(client)
    .map((c) => ({
      c,
      score: scoreCommand(c.name, c.description, c.category, terms),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.c.name.localeCompare(b.c.name))
    .slice(0, 18);

  const sysHits = SYSTEMS.filter((s) => {
    const blob = `${s.label} ${s.cmd} ${s.value}`.toLowerCase();
    return terms.some((t) => blob.includes(t));
  }).slice(0, 6);

  if (!ranked.length && !sysHits.length) {
    return baseEmbed(Theme.primary)
      .setAuthor({ name: `${V1} Arama` })
      .setDescription(
        [line(), `**\`${query}\`** · sonuç yok`, "", "Dene: `ticket` · `ban` · `kurulum` · `müzik`", line()].join(
          "\n"
        )
      );
  }

  const byCat = new Map<string, typeof ranked>();
  for (const row of ranked) {
    const list = byCat.get(row.c.category) ?? [];
    list.push(row);
    byCat.set(row.c.category, list);
  }

  const catLabel = (id: string) => CATEGORIES.find((x) => x.id === id)?.label ?? id;
  const blocks: string[] = [];
  for (const [cat, list] of byCat) {
    blocks.push(`**${catLabel(cat)}**`);
    for (const { c } of list) {
      blocks.push(`\`/${c.name}\` — ${c.description}`);
    }
    blocks.push("");
  }
  if (sysHits.length) {
    blocks.push("**Sistem**");
    for (const s of sysHits) blocks.push(`\`${s.cmd}\` — ${s.label}`);
  }

  let body = blocks.join("
").trim();
  if (body.length > 3800) body = `${body.slice(0, 3790)}\n…`;

  return baseEmbed(Theme.primary)
    .setAuthor({ name: `${V1} Arama` })
    .setDescription([line(), body, line()].join("
"))
    .setFooter({ text: `${ranked.length} komut · ${sysHits.length} sistem · ${query.slice(0, 28)}` });
}

function buildRows(client: YutaClient, focusSys?: string | null): ActionRowBuilder[] {
  const counts = countMap(client);

  const catMenu = new StringSelectMenuBuilder()
    .setCustomId("help_cat")
    .setPlaceholder("Kategoriler")
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel("Ana menü").setDescription("Kurulum + özet").setValue("home"),
      ...CATEGORIES.filter((c) => counts.has(c.id)).map((c) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(c.label)
          .setDescription(`${counts.get(c.id)} komut · ${c.blurb}`.slice(0, 100))
          .setValue(c.id)
      )
    );

  const sysMenu = new StringSelectMenuBuilder()
    .setCustomId("help_sys")
    .setPlaceholder("Sistemler — ticket, log, automod…")
    .addOptions(
      SYSTEMS.map((s) =>
        new StringSelectMenuOptionBuilder().setLabel(s.label).setDescription(s.cmd).setValue(s.value)
      )
    );

  const nav = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("help_search").setLabel("Ara").setEmoji("🔍").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("help_home").setLabel("Ana menü").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("help_setup").setLabel("Kurulum").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("help_premium").setLabel("Premium").setStyle(ButtonStyle.Primary)
  );

  const rows: ActionRowBuilder[] = [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(catMenu),
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(sysMenu),
    nav,
  ];

  const guide = focusSys ? SETUP_GUIDES[focusSys] : null;
  if (guide && guide.steps.length > 0) {
    const setupRow = new ActionRowBuilder<ButtonBuilder>();
    for (const s of guide.steps.slice(0, 5)) {
      setupRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`help_guide:${focusSys}:${s.id}`)
          .setLabel(s.label.slice(0, 80))
          .setStyle(ButtonStyle.Success)
      );
    }
    rows.push(setupRow);
  }

  return rows;
}

function setupOnlyEmbed(): EmbedBuilder {
  const setupBlock = SETUP_STEPS.map((s) => `**${s.n}.** \`${s.cmd}\`
${s.label}`).join("

");
  return baseEmbed(Theme.primary)
    .setAuthor({ name: `${V1} · Kurulum` })
    .setTitle("Sırayla yap")
    .setDescription(setupBlock + "

Yetkili hesap gerekli.")
    .setFooter({ text: "Alttan ticket adımlarına geç" });
}

export default class HelpCommand extends Command {
  constructor() {
    super({
      name: "help",
      description: "Komut merkezi",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder().setName("help").setDescription("Komut merkezi").toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const rows = buildRows(client);
    await interaction.reply({
      embeds: [homeEmbed(client, interaction.guildId)],
      components: rows,
    });
    const msg = await interaction.fetchReply();

    const collector = msg.createMessageComponentCollector({
      time: 180_000,
      filter: (i) => i.user.id === interaction.user.id,
    });

    collector.on("collect", async (i) => {
      try {
        if (i.isButton()) {
          if (i.customId === "help_search") {
            const modalId = `help_search_modal:${interaction.id}`;
            const modal = new ModalBuilder()
              .setCustomId(modalId)
              .setTitle("Yuta · Ara")
              .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                  new TextInputBuilder()
                    .setCustomId("q")
                    .setLabel("Ne arıyorsun?")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("ticket · ban · kurulum · müzik")
                    .setRequired(true)
                    .setMaxLength(48)
                )
              );
            await i.showModal(modal);
            try {
              const sub = await i.awaitModalSubmit({
                time: 120_000,
                filter: (m) => m.customId === modalId && m.user.id === interaction.user.id,
              });
              await sub.update({
                embeds: [searchEmbed(client, sub.fields.getTextInputValue("q"))],
                components: buildRows(client, null),
              });
            } catch {
              /* timeout */
            }
            return;
          }
          if (i.customId === "help_home") {
            await i.update({
              embeds: [homeEmbed(client, interaction.guildId)],
              components: buildRows(client, null),
            });
            return;
          }
          if (i.customId === "help_setup") {
            await i.update({
              embeds: [setupOnlyEmbed()],
              components: buildRows(client, "sys:ticket"),
            });
            return;
          }
          if (i.customId === "help_premium") {
            await i.update({
              embeds: [systemEmbed("sys:premium")],
              components: buildRows(client, "sys:premium"),
            });
            return;
          }
          if (i.customId.startsWith("help_guide:")) {
            const parts = i.customId.split(":");
            const sysKey = `${parts[1]}:${parts[2]}`;
            const stepId = parts[3];
            await i.update({
              embeds: [guideEmbed(sysKey, stepId)],
              components: buildRows(client, sysKey),
            });
            return;
          }
        }
        if (i.isStringSelectMenu()) {
          const v = i.values[0]!;
          if (i.customId === "help_cat") {
            if (v === "home") {
              await i.update({
                embeds: [homeEmbed(client, interaction.guildId)],
                components: buildRows(client, null),
              });
              return;
            }
            const focus = categorySetupKey(v);
            await i.update({
              embeds: [categoryEmbed(client, v)],
              components: buildRows(client, focus),
            });
            return;
          }
          if (i.customId === "help_sys") {
            await i.update({
              embeds: [systemEmbed(v)],
              components: buildRows(client, v),
            });
          }
        }
      } catch (err) {
        client.logger.error(err, "help");
      }
    });

    collector.on("end", async () => {
      try {
        await msg.edit({ components: [] });
      } catch {
        /* */
      }
    });
  }
}
