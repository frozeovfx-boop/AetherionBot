import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class ShrugCommand extends Command {
  constructor() {
    super({
      name: "shrug",
      description: "Omuz silk",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("shrug")
        .setDescription("Omuz silk")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(0xeb459e)
      .setDescription(`🤷 **${{interaction.user.username}}** omuz silkti.`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
