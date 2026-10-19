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

const CATEGORIES: { id: string; label: string; blurb: string }[] = [
  { id: "moderation", label: "Moderasyon", blurb: "Ban · warn · case · lock" },
  { id: "server", label: "Sunucu", blurb: "Ticket · log · welcome · ayar" },
  { id: "utility", label: "Araçlar", blurb: "Info · premium · snipe" },
  { id: "economy", label: "Ekonomi", blurb: "Para · work · level" },
  { id: "music", label: "Müzik", blurb: "Play · queue · filter" },
  { id: "ai", label: "AI / Conseil", blurb: "Ask · debate · consult" },
];

const SYSTEMS: { label: string; value: string; cmd: string }[] = [
  { label: "Çekiliş", value: "sys:giveaway", cmd: "/giveaway" },
  { label: "Automod", value: "sys:automod", cmd: "/automod" },
  { label: "Ticket", value: "sys:ticket", cmd: "/ticket-setup" },
  { label: "Log", value: "sys:log", cmd: "/logset" },
  { label: "Self-role", value: "sys:selfrole", cmd: "/selfrole" },
  { label: "Özel oda", value: "sys:tempvoice", cmd: "/ozeloda" },
  { label: "Welcome", value: "sys:welcome", cmd: "/setwelcome" },
  { label: "Stat", value: "sys:stat", cmd: "/stat" },
  { label: "Davet", value: "sys:invite", cmd: "/davet" },
  { label: "Premium", value: "sys:premium", cmd: "/premium" },
  { label: "Conseil", value: "sys:conseil", cmd: "/conseil" },
  { label: "Ayarlar", value: "sys:ayarlar", cmd: "/ayarlar" },
];

const SYS_BODY: Record<string, string> = {
  "sys:giveaway": "**Çekiliş**\n`/giveaway baslat` · `sans-rol` · Şansım butonu",
  "sys:automod": "**Automod**\n`/automod` davet · link · spam · küfür",
  "sys:ticket": "**Ticket**\n`/ticket-setup panel` · buton · destek rolü",
  "sys:log": "**Log**\n`/logset` mesaj · üye · ses · davet",
  "sys:selfrole": "**Self-role**\n`/selfrole panel`",
  "sys:tempvoice": "**Özel oda**\n`/ozeloda` hub",
  "sys:welcome": "**Welcome**\n`/setwelcome`",
  "sys:stat": "**Stat**\n`/stat`",
  "sys:invite": "**Davet**\n`/davet`",
  "sys:premium": `**Premium**\n\`/premium durum\`\nLimit/gün: ask ${FREE_LIMITS.ask} · debate ${FREE_LIMITS.conseil_debate}`,
  "sys:conseil": "**Conseil**\n`/conseil` debate · consult · ozet",
  "sys:ayarlar": "**Ayarlar**\n`/ayarlar` (yetkili)",
};

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

  const catBlock = CATEGORIES.filter((c) => counts.has(c.id))
    .map((c) => {
      const n = counts.get(c.id) ?? 0;
      return `\` ${String(n).padStart(2, " ")} \`  **${c.label}**`;
    })
    .join("\n");

  // two-column-ish systems list
  const sysLeft: string[] = [];
  const sysRight: string[] = [];
  SYSTEMS.forEach((s, i) => {
    const line = `\`${s.cmd}\``;
    if (i % 2 === 0) sysLeft.push(line);
    else sysRight.push(line);
  });
  const sysBlock = SYSTEMS.map((s) => `\`${s.cmd}\` **${s.label}**`).join("\n");

  return baseEmbed(Theme.primary)
    .setAuthor({
      name: "Yuta Komutlar",
      iconURL: client.user?.displayAvatarURL({ size: 128 }) ?? undefined,
    })
    .setDescription(
      [
        "**Kategoriler**",
        catBlock,
        "",
        "**Sistemler**",
        sysBlock,
        "",
        line(),
        `**${total}** komut  ·  ${prem ? "Premium" : "Free"}`,
      ].join("\n")
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
      : commands.map((c) => `\`/${c.name}\`  ${c.description}`).join("\n");

  return baseEmbed(Theme.primary)
    .setAuthor({ name: meta?.label ?? categoryId })
    .setDescription([list.slice(0, 3800)].join("\n"))
    .setFooter({ text: `${commands.length} komut` });
}

function systemEmbed(value: string): EmbedBuilder {
  const title = SYSTEMS.find((s) => s.value === value)?.label ?? "Sistem";
  return baseEmbed(Theme.primary)
    .setAuthor({ name: title })
    .setDescription(SYS_BODY[value] ?? "—");
}


/** Turkish / alias expand for better hits */
const SEARCH_ALIASES: Record<string, string[]> = {
  ban: ["ban", "yasak"],
  kick: ["kick", "at"],
  mute: ["timeout", "mute", "sustur"],
  ticket: ["ticket", "destek", "ticket-setup"],
  cekilis: ["giveaway", "çekiliş", "cekilis"],
  çekiliş: ["giveaway", "çekiliş"],
  giveaway: ["giveaway"],
  muzik: ["play", "music", "queue", "skip", "filter"],
  müzik: ["play", "music", "queue", "skip"],
  para: ["balance", "work", "daily", "economy", "pay"],
  level: ["level", "rank", "xp"],
  ai: ["ask", "conseil", "ai"],
  premium: ["premium"],
  log: ["logset", "log"],
  rol: ["selfrole", "addrole", "role"],
  oda: ["ozeloda", "tempvoice", "voice"],
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

function scoreCommand(
  name: string,
  description: string,
  category: string,
  terms: string[]
): number {
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
  if (terms.length === 0) {
    return baseEmbed(Theme.primary)
      .setAuthor({ name: "Arama" })
      .setDescription("Boş arama.");
  }

  const ranked = publicCommands(client)
    .map((c) => ({
      c,
      score: scoreCommand(c.name, c.description, c.category, terms),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.c.name.localeCompare(b.c.name))
    .slice(0, 20);

  const sysHits = SYSTEMS.filter((s) => {
    const blob = `${s.label} ${s.cmd} ${s.value}`.toLowerCase();
    return terms.some((t) => blob.includes(t));
  }).slice(0, 6);

  if (ranked.length === 0 && sysHits.length === 0) {
    return baseEmbed(Theme.primary)
      .setAuthor({ name: "🔍 Arama" })
      .setDescription(
        [
          line(),
          `**\`${query}\`** · sonuç yok`,
          "",
          "Dene: `ban` · `ticket` · `müzik` · `premium`",
          line(),
        ].join("\n")
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
    for (const s of sysHits) {
      blocks.push(`\`${s.cmd}\` — ${s.label}`);
    }
  }

  let body = blocks.join("\n").trim();
  if (body.length > 3800) body = body.slice(0, 3790) + "\n…";

  return baseEmbed(Theme.primary)
    .setAuthor({ name: "🔍 Arama" })
    .setDescription([line(), body, line()].join("\n"))
    .setFooter({
      text: `${ranked.length} komut · ${sysHits.length} sistem · ${query.slice(0, 32)}`,
    });
}


function buildRows(client: YutaClient): ActionRowBuilder[] {
  const counts = countMap(client);

  const catMenu = new StringSelectMenuBuilder()
    .setCustomId("help_cat")
    .setPlaceholder("Kategoriler")
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel("Ana menü")
        .setDescription("Özet")
        .setValue("home"),
      ...CATEGORIES.filter((c) => counts.has(c.id)).map((c) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(c.label)
          .setDescription(`${counts.get(c.id)} komut · ${c.blurb}`.slice(0, 100))
          .setValue(c.id)
      )
    );

  const sysMenu = new StringSelectMenuBuilder()
    .setCustomId("help_sys")
    .setPlaceholder("Sistemler")
    .addOptions(
      SYSTEMS.map((s) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(s.label)
          .setDescription(s.cmd)
          .setValue(s.value)
      )
    );

  const nav = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("help_search")
      .setLabel("Ara")
      .setEmoji("🔍")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("help_home")
      .setLabel("Ana menü")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("help_premium")
      .setLabel("Premium")
      .setStyle(ButtonStyle.Primary)
  );

  return [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(catMenu),
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(sysMenu),
    nav,
  ];
}

export default class HelpCommand extends Command {
  constructor() {
    super({
      name: "help",
      description: "Komut menüsü",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Komut menüsü")
        .toJSON(),
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
                    .setPlaceholder("ban · ticket · müzik · premium")
                    .setRequired(true)
                    .setMinLength(1)
                    .setMaxLength(48)
                )
              );
            await i.showModal(modal);
            try {
              const sub = await i.awaitModalSubmit({
                time: 120_000,
                filter: (m) => m.customId === modalId && m.user.id === interaction.user.id,
              });
              const q = sub.fields.getTextInputValue("q");
              await sub.update({
                embeds: [searchEmbed(client, q)],
                components: rows,
              });
            } catch {
              /* timeout */
            }
            return;
          }
          if (i.customId === "help_home") {
            await i.update({
              embeds: [homeEmbed(client, interaction.guildId)],
              components: rows,
            });
            return;
          }
          if (i.customId === "help_premium") {
            await i.update({
              embeds: [systemEmbed("sys:premium")],
              components: rows,
            });
            return;
          }
        }
        if (i.isStringSelectMenu()) {
          const v = i.values[0]!;
          if (i.customId === "help_cat") {
            const embed =
              v === "home"
                ? homeEmbed(client, interaction.guildId)
                : categoryEmbed(client, v);
            await i.update({ embeds: [embed], components: rows });
            return;
          }
          if (i.customId === "help_sys") {
            await i.update({ embeds: [systemEmbed(v)], components: rows });
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
