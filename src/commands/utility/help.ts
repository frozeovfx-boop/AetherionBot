import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, code, kv } from "../../utils/embeds.js";
import { FREE_LIMITS } from "../../utils/premium.js";

/** Production categories only — no fun filler */
const CATEGORIES: { id: string; label: string; blurb: string; premium?: boolean }[] = [
  { id: "moderation", label: "Moderasyon", blurb: "Ban · warn · case · lock · automod" },
  { id: "server", label: "Sunucu", blurb: "Ticket · welcome · log · self-role · ayarlar" },
  { id: "utility", label: "Araçlar", blurb: "Info · help · premium · snipe · poll" },
  { id: "economy", label: "Ekonomi", blurb: "Balance · work · level · shop" },
  { id: "music", label: "Müzik", blurb: "Play · queue · filter · volume" },
  { id: "ai", label: "AI / Conseil", blurb: "Ask · debate · consult · ozet", premium: true },
  { id: "admin", label: "Admin", blurb: "Owner · status · eval" },
];

function homeEmbed(client: YutaClient): EmbedBuilder {
  const counts = new Map<string, number>();
  for (const c of client.commands.values()) {
    counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
  }

  const rows = CATEGORIES.filter((c) => counts.has(c.id)).map((c) => {
    const n = counts.get(c.id) ?? 0;
    const tag = c.premium ? " · limitli" : "";
    return `**${c.label}** \`${n}\`${tag}\n${c.blurb}`;
  });

  return baseEmbed(Theme.primary)
    .setAuthor({
      name: "YUTA",
      iconURL: client.user?.displayAvatarURL({ size: 64 }) ?? undefined,
    })
    .setTitle("Komutlar")
    .setDescription(
      [
        line(),
        rows.join("\n\n"),
        line(),
        kv("Toplam", code(client.commands.size)),
        "Alttan kategori seç.",
        line(),
      ].join("\n")
    );
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

  if (list.length > 3500) list = list.slice(0, 3490) + "\n…";

  const premiumNote =
    categoryId === "ai"
      ? [
          line(),
          "**Ücretsiz günlük limit**",
          kv("ask", code(FREE_LIMITS.ask)),
          kv("debate", code(FREE_LIMITS.conseil_debate)),
          kv("consult", code(FREE_LIMITS.conseil_consult)),
          "Premium: `/premium durum`",
        ].join("\n")
      : "";

  return baseEmbed(Theme.primary)
    .setAuthor({ name: meta?.label ?? categoryId })
    .setDescription([line(), list, premiumNote, line()].filter(Boolean).join("\n"))
    .setFooter({ text: `${commands.length} komut · Yuta` });
}

function buildSelect(client: YutaClient): ActionRowBuilder<StringSelectMenuBuilder> {
  const counts = new Map<string, number>();
  for (const c of client.commands.values()) {
    counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
  }

  const options = [
    new StringSelectMenuOptionBuilder()
      .setLabel("Ana menü")
      .setDescription("Tüm kategoriler")
      .setValue("home"),
    ...CATEGORIES.filter((c) => counts.has(c.id)).map((c) =>
      new StringSelectMenuOptionBuilder()
        .setLabel(c.premium ? `${c.label} (limit)` : c.label)
        .setDescription(c.blurb.slice(0, 100))
        .setValue(c.id)
    ),
  ];

  const menu = new StringSelectMenuBuilder()
    .setCustomId("help_category")
    .setPlaceholder("Kategori seç")
    .addOptions(options);

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}

export default class HelpCommand extends Command {
  constructor() {
    super({
      name: "help",
      description: "Komut listesi",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Komut listesi")
        .addStringOption((opt) =>
          opt
            .setName("kategori")
            .setDescription("Kategori")
            .setRequired(false)
            .addChoices(
              { name: "Moderasyon", value: "moderation" },
              { name: "Sunucu", value: "server" },
              { name: "Araçlar", value: "utility" },
              { name: "Ekonomi", value: "economy" },
              { name: "Müzik", value: "music" },
              { name: "AI / Conseil", value: "ai" },
              { name: "Admin", value: "admin" }
            )
        )
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const direct = interaction.options.getString("kategori");
    const row = buildSelect(client);
    const initial = direct ? categoryEmbed(client, direct) : homeEmbed(client);

    await interaction.reply({
      embeds: [initial],
      components: [row],
    });

    const msg = await interaction.fetchReply();

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 120_000,
      filter: (i) => i.user.id === interaction.user.id && i.customId === "help_category",
    });

    collector.on("collect", async (i) => {
      try {
        const value = i.values[0]!;
        const embed = value === "home" ? homeEmbed(client) : categoryEmbed(client, value);
        await i.update({ embeds: [embed], components: [row] });
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
