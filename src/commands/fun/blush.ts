import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class BlushCommand extends Command {
  constructor() {
    super({
      name: "blush",
      description: "Kızar",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("blush")
        .setDescription("Kızar")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(0xeb459e)
      .setDescription(`😊 **${interaction.user.username}}** kızardı...`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
