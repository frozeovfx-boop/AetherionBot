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
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, code, kv } from "../../utils/embeds.js";
import { FREE_LIMITS, isGuildPremium } from "../../utils/premium.js";

const CATEGORIES: { id: string; label: string; blurb: string }[] = [
  { id: "moderation", label: "Moderasyon", blurb: "Ban · warn · case · lock" },
  { id: "server", label: "Sunucu", blurb: "Ticket · welcome · log · self-role" },
  { id: "utility", label: "Araçlar", blurb: "Info · premium · snipe · poll" },
  { id: "economy", label: "Ekonomi", blurb: "Balance · work · level" },
  { id: "music", label: "Müzik", blurb: "Play · queue · filter" },
  { id: "ai", label: "AI / Conseil", blurb: "Ask · debate · consult · ozet" },
  { id: "admin", label: "Admin", blurb: "Owner · status" },
];

/** Quick systems — core product surface */
const SYSTEMS: { label: string; value: string; hint: string }[] = [
  { label: "Ticket", value: "sys:ticket", hint: "/ticket-setup" },
  { label: "Automod", value: "sys:automod", hint: "/automod" },
  { label: "Log", value: "sys:log", hint: "/logset" },
  { label: "Self-role", value: "sys:selfrole", hint: "/selfrole" },
  { label: "Çekiliş", value: "sys:giveaway", hint: "/giveaway" },
  { label: "Özel oda", value: "sys:tempvoice", hint: "/ozeloda" },
  { label: "Welcome", value: "sys:welcome", hint: "/setwelcome" },
  { label: "Stat", value: "sys:stat", hint: "/stat" },
  { label: "Premium", value: "sys:premium", hint: "/premium durum" },
  { label: "Conseil", value: "sys:conseil", hint: "/conseil" },
];

const SYS_HELP: Record<string, string> = {
  "sys:ticket": [
    "**Ticket**",
    "`/ticket-setup panel` — panel at",
    "`/ticket-setup buton-ekle` — özel buton + renk + destek rolü",
    "`/ticket-setup ayar` — kategori / log / destek",
  ].join("\n"),
  "sys:automod": [
    "**Automod**",
    "`/automod davet|link|spam|kufur` — aç/kapa",
    "`/automod kelime` — yasak kelime",
    "`/automod muaf` — kanal muafiyeti",
  ].join("\n"),
  "sys:log": [
    "**Log**",
    "`/logset mesaj|uye|ses|davet` — kanal bağla",
    "Silinen / düzenlenen mesaj, üye giriş-çıkış, ses.",
  ].join("\n"),
  "sys:selfrole": [
    "**Self-role**",
    "`/selfrole panel` — buton veya menü paneli",
    "Kalıcı; restart sonrası çalışır.",
  ].join("\n"),
  "sys:giveaway": [
    "**Çekiliş**",
    "`/giveaway baslat` — ödül + süre",
    "`/giveaway sans-rol` — şanslı rol",
    "Mesajda **Şansım** butonu.",
  ].join("\n"),
  "sys:tempvoice": [
    "**Özel oda**",
    "`/ozeloda` — hub kanalı ayarla",
    "Hub’a giren kullanıcıya geçici oda.",
  ].join("\n"),
  "sys:welcome": [
    "**Welcome**",
    "`/setwelcome` — kanal + mesaj",
    "Placeholder: `{user}` `{server}`",
  ].join("\n"),
  "sys:stat": [
    "**İstatistik**",
    "`/stat` — mesaj / ses",
    "Kalıcı JSON kayıt.",
  ].join("\n"),
  "sys:premium": [
    "**Premium**",
    "`/premium durum` — limitler",
    "AI / Conseil / filtre günlük kota.",
    `Ücretsiz: ask ${FREE_LIMITS.ask} · debate ${FREE_LIMITS.conseil_debate}/gün`,
  ].join("\n"),
  "sys:conseil": [
    "**Conseil**",
    "`/conseil debate` — 2 turlu tartışma",
    "`/conseil consult` — rapor",
    "`/conseil ozet` — mod özeti (yetkili)",
    "Limitli · premium’da ∞",
  ].join("\n"),
};

function countMap(client: YutaClient): Map<string, number> {
  const counts = new Map<string, number>();
  for (const c of client.commands.values()) {
    counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
  }
  return counts;
}

function homeEmbed(client: YutaClient, guildId: string | null): EmbedBuilder {
  const counts = countMap(client);
  const prem = guildId ? isGuildPremium(client, guildId) : false;

  const catBlock = CATEGORIES.filter((c) => counts.has(c.id))
    .map((c) => {
      const n = counts.get(c.id) ?? 0;
      return `◈  **${c.label}**\n　\`${n}\` komut  ·  ${c.blurb}`;
    })
    .join("\n\n");

  const sysBlock = SYSTEMS.map((s) => `✦  **${s.label}**  ·  \`${s.hint}\``).join("\n");

  return baseEmbed(Theme.hollow)
    .setAuthor({
      name: "Y U T A",
      iconURL: client.user?.displayAvatarURL({ size: 128 }) ?? undefined,
    })
    .setTitle("Hollow Menu")
    .setThumbnail(client.user?.displayAvatarURL({ size: 256 }) ?? null)
    .setDescription(
      [
        line(),
        "```",
        "  COSMIC  ·  HOLLOW PURPLE",
        "```",
        line(),
        "**Kategoriler**",
        catBlock,
        line(),
        "**Sistemler**",
        sysBlock,
        line(),
        kv("Komut", code(client.commands.size)),
        kv("Plan", prem ? "**Premium**" : code("Free")),
        line(),
        "_Kategori veya sistem menüsünden seç._",
      ].join("\n")
    )
    .setFooter({ text: "Yuta · Hollow Purple" });
}

function categoryEmbed(client: YutaClient, categoryId: string): EmbedBuilder {
  const meta = CATEGORIES.find((c) => c.id === categoryId);
  const commands = [...client.commands.values()]
    .filter((c) => c.category === categoryId)
    .sort((a, b) => a.name.localeCompare(b.name));

  let list =
    commands.length === 0
      ? "Boş"
      : commands.map((c) => `\`${c.name}\` — ${c.description}`).join("\n");
  if (list.length > 3200) list = `${list.slice(0, 3180)}\n…`;

  const extra =
    categoryId === "ai"
      ? [
          line(),
          "**Limit (ücretsiz / gün)**",
          kv("ask", code(FREE_LIMITS.ask)),
          kv("debate", code(FREE_LIMITS.conseil_debate)),
          kv("consult", code(FREE_LIMITS.conseil_consult)),
          "Premium: `/premium`",
        ].join("\n")
      : "";

  return baseEmbed(Theme.hollow)
    .setAuthor({ name: meta?.label ?? categoryId })
    .setDescription([line(), list, extra, line()].filter(Boolean).join("\n"))
    .setFooter({ text: `${commands.length} komut · Yuta` });
}

function systemEmbed(value: string): EmbedBuilder {
  const body = SYS_HELP[value] ?? "Bilinmeyen sistem.";
  return baseEmbed(Theme.hollow)
    .setAuthor({ name: "Sistem" })
    .setDescription([line(), body, line()].join("\n"));
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
          .setDescription(s.hint.slice(0, 100))
          .setValue(s.value)
      )
    );

  const links = new ActionRowBuilder<ButtonBuilder>().addComponents(
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
    links,
  ];
}

export default class HelpCommand extends Command {
  constructor() {
    super({
      name: "help",
      description: "Komut ve sistem menüsü",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Komut ve sistem menüsü")
        .addStringOption((o) =>
          o
            .setName("kategori")
            .setDescription("Direkt kategori")
            .setRequired(false)
            .addChoices(
              ...CATEGORIES.map((c) => ({ name: c.label, value: c.id }))
            )
        )
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const direct = interaction.options.getString("kategori");
    const rows = buildRows(client);
    const initial = direct
      ? categoryEmbed(client, direct)
      : homeEmbed(client, interaction.guildId);

    await interaction.reply({ embeds: [initial], components: rows });
    const msg = await interaction.fetchReply();

    const collector = msg.createMessageComponentCollector({
      time: 180_000,
      filter: (i) => i.user.id === interaction.user.id,
    });

    collector.on("collect", async (i) => {
      try {
        if (i.isButton()) {
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
          const value = i.values[0]!;
          if (i.customId === "help_cat") {
            const embed =
              value === "home"
                ? homeEmbed(client, interaction.guildId)
                : categoryEmbed(client, value);
            await i.update({ embeds: [embed], components: rows });
            return;
          }
          if (i.customId === "help_sys") {
            await i.update({ embeds: [systemEmbed(value)], components: rows });
          }
        }
      } catch (err) {
        client.logger.error(err, "help collect");
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
