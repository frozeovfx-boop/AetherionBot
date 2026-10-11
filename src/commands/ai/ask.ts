import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

export default class AskCommand extends Command {
  constructor() {
    super({
      name: "ask",
      description: "AI'ya soru sor",
      category: "ai",
      cooldown: 10,
      data: new SlashCommandBuilder()
        .setName("ask")
        .setDescription("AI'ya soru sor")
        .addStringOption((o) => o.setName("soru").setDescription("Soru").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString("soru", true);

    const embed = baseEmbed(Theme.info)
      .setAuthor({ name: "AI" })
      .setTitle("Yanıt")
      .setDescription(
        [
          line(),
          `**Soru**\n${question.slice(0, 400)}`,
          "",
          "**Cevap**",
          "AI provider bağlı değil. `GROK_API_KEY` / `OPENAI_API_KEY` eklenince aktif olur.",
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
