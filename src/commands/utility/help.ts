import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, code, line } from "../../utils/embeds.js";

const CATEGORIES: {
  id: string;
  label: string;
  emoji: string;
  blurb: string;
}[] = [
  { id: "moderation", label: "Moderasyon", emoji: "🛡", blurb: "Ban · warn · timeout · lock" },
  { id: "server", label: "Sunucu", emoji: "⚙", blurb: "Oda · davet · ticket · welcome" },
  { id: "utility", label: "Utility", emoji: "✦", blurb: "Info · tools · snipe · poll" },
  { id: "economy", label: "Economy", emoji: "⬡", blurb: "Para · level · shop" },
  { id: "music", label: "Müzik", emoji: "♪", blurb: "Play · queue · controls" },
  { id: "fun", label: "Eğlence", emoji: "◈", blurb: "Aura · ship · games" },
  { id: "ai", label: "AI Conseil", emoji: "◎", blurb: "Debate · consult · ask" },
  { id: "admin", label: "Admin", emoji: "⚡", blurb: "Owner tools" },
];

function homeEmbed(client: YutaClient): EmbedBuilder {
  const counts = new Map<string, number>();
  for (const c of client.commands.values()) {
    counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
  }

  const body = CATEGORIES.filter((c) => counts.has(c.id))
    .map((c) => {
      const n = counts.get(c.id) ?? 0;
      return `${c.emoji}  **${c.label}**  ·  \`${n}\`\n> ${c.blurb}`;
    })
    .join("\n\n");

  return baseEmbed(Theme.primary)
    .setAuthor({
      name: "YUTA",
      iconURL: client.user?.displayAvatarURL({ size: 128 }) ?? undefined,
    })
    .setTitle("Komutlar")
    .setDescription(
      [
        line(),
        body,
        line(),
        `Toplam **${client.commands.size}** komut  ·  Slash + Prefix`,
        "Menüden kategori seç.",
      ].join("\n")
    )
    .setFooter({ text: "Yuta" });
}

function categoryEmbed(client: YutaClient, categoryId: string): EmbedBuilder {
  const meta = CATEGORIES.find((c) => c.id === categoryId);
  const commands = [...client.commands.values()]
    .filter((c) => c.category === categoryId)
    .sort((a, b) => a.name.localeCompare(b.name));

  const list =
    commands.length === 0
      ? "Boş"
      : commands.map((c) => `\`${c.name}\` — ${c.description}`).join("\n");

  return baseEmbed(Theme.primary)
    .setAuthor({ name: `${meta?.emoji ?? ""}  ${meta?.label ?? categoryId}`.trim() })
    .setDescription([line(), list, line()].join("\n"))
    .setFooter({ text: `${commands.length} komut · Yuta` });
}

function buildSelect(client: YutaClient): ActionRowBuilder<StringSelectMenuBuilder> {
  const counts = new Map<string, number>();
  for (const c of client.commands.values()) {
    counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId("help_category")
    .setPlaceholder("Kategori seç…")
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel("Ana menü")
        .setDescription("Tüm kategoriler")
        .setValue("home")
        .setEmoji("🏠"),
      ...CATEGORIES.filter((c) => counts.has(c.id)).map((c) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(c.label)
          .setDescription(`${counts.get(c.id)} komut`)
          .setValue(c.id)
          .setEmoji(c.emoji)
      )
    );

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
            .setDescription("Direkt kategori")
            .setRequired(false)
            .addChoices(
              { name: "Moderasyon", value: "moderation" },
              { name: "Sunucu", value: "server" },
              { name: "Utility", value: "utility" },
              { name: "Economy", value: "economy" },
              { name: "Müzik", value: "music" },
              { name: "Eğlence", value: "fun" },
              { name: "AI", value: "ai" },
              { name: "Admin", value: "admin" }
            )
        )
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const direct = interaction.options.getString("kategori");
    const row = buildSelect(client);

    const initial =
      direct != null ? categoryEmbed(client, direct) : homeEmbed(client);

    const msg = await interaction.reply({
      embeds: [initial],
      components: [row],
      fetchReply: true,
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 120_000,
      filter: (i) => i.user.id === interaction.user.id && i.customId === "help_category",
    });

    collector.on("collect", async (i) => {
      const value = i.values[0]!;
      const embed = value === "home" ? homeEmbed(client) : categoryEmbed(client, value);
      await i.update({ embeds: [embed], components: [row] });
    });

    collector.on("end", async () => {
      try {
        await msg.edit({ components: [] });
      } catch {
        /* expired */
      }
    });
  }
}
