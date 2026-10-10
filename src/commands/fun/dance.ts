import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class DanceCommand extends Command {
  constructor() {
    super({
      name: "dance",
      description: "Dans et",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("dance")
        .setDescription("Dans et")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(0xeb459e)
      .setDescription(`💃 **${interaction.user.username}}** dans ediyor!`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
