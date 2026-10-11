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
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, code, divider } from "../../utils/embeds.js";
import { tg } from "../../i18n/index.js";

const CATEGORIES: {
  id: string;
  label: string;
  emoji: string;
  blurb: string;
}[] = [
  { id: "moderation", label: "Moderasyon", emoji: "🛡️", blurb: "Ban, warn, timeout, lock" },
  { id: "utility", label: "Utility", emoji: "◈", blurb: "Ping, info, tools" },
  { id: "economy", label: "Economy", emoji: "⬡", blurb: "Balance, daily, shop" },
  { id: "music", label: "Müzik", emoji: "♪", blurb: "Play, queue, skip" },
  { id: "server", label: "Sunucu", emoji: "⬡", blurb: "Prefix, ticket, language" },
  { id: "fun", label: "Eğlence", emoji: "✦", blurb: "Ship, meme, games" },
  { id: "ai", label: "AI", emoji: "◎", blurb: "Ask, chat" },
  { id: "admin", label: "Admin", emoji: "⚙", blurb: "Eval, status" },
];

function homeEmbed(client: AetherionClient, guildId: string | null): EmbedBuilder {
  const counts = new Map<string, number>();
  for (const c of client.commands.values()) {
    counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
  }

  const rows = CATEGORIES.filter((c) => counts.has(c.id)).map((c) => {
    const n = counts.get(c.id) ?? 0;
    return `${c.emoji}  **${c.label}**\n　　${c.blurb}  ·  ${code(n)}`;
  });

  return baseEmbed(Theme.primary)
    .setAuthor({
      name: "AETHERION",
      iconURL: client.user?.displayAvatarURL({ size: 128 }) ?? undefined,
    })
    .setTitle("Komut Merkezi")
    .setDescription(
      [
        "*Temiz. Güçlü. Tek yumruk.*",
        "",
        divider(),
        rows.join("\n\n"),
        divider(),
        "",
        `${tg(guildId, "help.total", { count: client.commands.size })}`,
        "Aşağıdan kategori seç → komut listesi açılır.",
      ].join("\n")
    )
    .setThumbnail(client.user?.displayAvatarURL({ size: 256 }) ?? null)
    .setFooter({ text: "Aetherion · Select a category" });
}

function categoryEmbed(
  client: AetherionClient,
  categoryId: string,
  guildId: string | null
): EmbedBuilder {
  const meta = CATEGORIES.find((c) => c.id === categoryId);
  const commands = [...client.commands.values()]
    .filter((c) => c.category === categoryId)
    .sort((a, b) => a.name.localeCompare(b.name));

  const list =
    commands.length === 0
      ? tg(guildId, "help.empty_category")
      : commands.map((c) => `\`/${c.name.padEnd(14)}\`  ${c.description}`).join("\n");

  return baseEmbed(Theme.primary)
    .setAuthor({
      name: "AETHERION",
      iconURL: client.user?.displayAvatarURL({ size: 64 }) ?? undefined,
    })
    .setTitle(`${meta?.emoji ?? "•"}  ${meta?.label ?? categoryId}`)
    .setDescription(
      [
        meta?.blurb ? `*${meta.blurb}*` : null,
        "",
        divider(),
        list,
        divider(),
        "",
        tg(guildId, "help.commands_count", { count: commands.length }),
      ]
        .filter((x) => x !== null)
        .join("\n")
    )
    .setFooter({ text: "Aetherion · Menüden başka kategori seçebilirsin" });
}

function buildSelect(client: AetherionClient): ActionRowBuilder<StringSelectMenuBuilder> {
  const counts = new Map<string, number>();
  for (const c of client.commands.values()) {
    counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId("help_category")
    .setPlaceholder("Kategori seç / Select category")
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel("Ana sayfa")
        .setDescription("Tüm kategorilere dönüş")
        .setValue("home")
        .setEmoji("🏠"),
      ...CATEGORIES.filter((c) => counts.has(c.id)).map((c) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(c.label)
          .setDescription(`${c.blurb} · ${counts.get(c.id)} komut`)
          .setValue(c.id)
          .setEmoji(c.emoji === "◈" || c.emoji === "⬡" || c.emoji === "♪" || c.emoji === "✦" || c.emoji === "◎" || c.emoji === "⚙" ? "📁" : c.emoji)
      )
    );

  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}

export default class HelpCommand extends Command {
  constructor() {
    super({
      name: "help",
      description: "Komut listesi — kategori menülü",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Komut listesi — kategori menülü")
        .addStringOption((opt) =>
          opt
            .setName("kategori")
            .setDescription("Direkt kategori")
            .setRequired(false)
            .addChoices(
              { name: "Moderasyon", value: "moderation" },
              { name: "Utility", value: "utility" },
              { name: "Economy", value: "economy" },
              { name: "Müzik", value: "music" },
              { name: "Eğlence", value: "fun" },
              { name: "Sunucu", value: "server" },
              { name: "AI", value: "ai" },
              { name: "Admin", value: "admin" }
            )
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId;
    const direct = interaction.options.getString("kategori");
    const row = buildSelect(client);

    const initial =
      direct != null
        ? categoryEmbed(client, direct, guildId)
        : homeEmbed(client, guildId);

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
      const embed =
        value === "home"
          ? homeEmbed(client, guildId)
          : categoryEmbed(client, value, guildId);

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
