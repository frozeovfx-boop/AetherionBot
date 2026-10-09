import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class HelpCommand extends Command {
  constructor() {
    super({
      name: "help",
      description: "Bot komutlarını listeler",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Bot komutlarını listeler")
        .addStringOption((opt) =>
          opt
            .setName("kategori")
            .setDescription("Belirli bir kategori")
            .setRequired(false)
            .addChoices(
              { name: "Moderasyon", value: "moderation" },
              { name: "Utility", value: "utility" },
              { name: "Müzik", value: "music" },
              { name: "Economy", value: "economy" },
              { name: "AI", value: "ai" },
              { name: "Eğlence", value: "fun" },
              { name: "Admin", value: "admin" },
              { name: "Sunucu", value: "server" }
            )
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const category = interaction.options.getString("kategori");

    if (category) {
      const commands = client.commands.filter((c) => c.category === category);
      if (commands.size === 0) {
        await interaction.reply({ content: "Bu kategoride henüz komut yok.", ephemeral: true });
        return;
      }

      const list = commands.map((c) => `\`/${c.name}\` — ${c.description}`).join("\n");

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`${category.charAt(0).toUpperCase() + category.slice(1)} Komutları`)
        .setDescription(list)
        .setFooter({ text: `Toplam ${commands.size} komut` });

      await interaction.reply({ embeds: [embed] });
      return;
    }

    const categories = [...new Set(client.commands.map((c) => c.category))];

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Aetherion — Komut Listesi")
      .setDescription(
        "Kategori seçmek için `/help kategori:` kullan.\n\n" +
          categories.map((cat) => `**${cat}** — ${client.commands.filter((c) => c.category === cat).size} komut`).join("\n")
      )
      .setFooter({ text: `Toplam ${client.commands.size} komut` });

    await interaction.reply({ embeds: [embed] });
  }
}
