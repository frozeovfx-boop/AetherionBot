import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class LaughCommand extends Command {
  constructor() {
    super({
      name: "laugh",
      description: "Gül",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("laugh")
        .setDescription("Gül")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(0xeb459e)
      .setDescription(`😂 **${{interaction.user.username}}** kahkaha attı!`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
