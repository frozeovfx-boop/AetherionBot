import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, code, divider } from "../../utils/embeds.js";

const CATEGORY_META: Record<string, { label: string; emoji: string }> = {
  moderation: { label: "Moderasyon", emoji: "🛡" },
  utility: { label: "Utility", emoji: "◈" },
  economy: { label: "Economy", emoji: "⬡" },
  music: { label: "Müzik", emoji: "♪" },
  server: { label: "Sunucu", emoji: "⬡" },
  fun: { label: "Eğlence", emoji: "✦" },
  ai: { label: "AI", emoji: "◎" },
  admin: { label: "Admin", emoji: "⚙" },
};

export default class HelpCommand extends Command {
  constructor() {
    super({
      name: "help",
      description: "Komut listesi ve yardım",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Komut listesi ve yardım")
        .addStringOption((opt) =>
          opt
            .setName("kategori")
            .setDescription("Kategori seç")
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
    const category = interaction.options.getString("kategori");

    if (category) {
      const commands = [...client.commands.values()].filter((c) => c.category === category);
      const meta = CATEGORY_META[category] ?? { label: category, emoji: "•" };

      if (commands.length === 0) {
        await interaction.reply({ content: "Bu kategoride komut yok.", ephemeral: true });
        return;
      }

      const list = commands
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((c) => `${code(`/${c.name}`)}  ${c.description}`)
        .join("\n");

      const embed = baseEmbed(Theme.primary)
        .setTitle(`${meta.emoji}  ${meta.label}`)
        .setDescription(`${divider()}\n${list}\n${divider()}`)
        .setFooter({ text: `${commands.length} komut · Aetherion` });

      await interaction.reply({ embeds: [embed] });
      return;
    }

    const counts = new Map<string, number>();
    for (const c of client.commands.values()) {
      counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
    }

    const lines = Object.entries(CATEGORY_META)
      .filter(([key]) => counts.has(key))
      .map(([key, meta]) => `${meta.emoji}  **${meta.label}**  —  ${code(counts.get(key) ?? 0)} komut`);

    const embed = baseEmbed(Theme.primary)
      .setTitle("Aetherion")
      .setDescription(
        [
          "*Temiz. Güçlü. Gereksiz süs yok.*",
          "",
          divider(),
          lines.join("\n"),
          divider(),
          "",
          `Toplam ${code(client.commands.size)} komut`,
          `Detay için  ${code("/help kategori:")}`,
        ].join("\n")
      )
      .setThumbnail(client.user?.displayAvatarURL({ size: 256 }) ?? null);

    await interaction.reply({ embeds: [embed] });
  }
}
