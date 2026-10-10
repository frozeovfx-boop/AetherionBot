import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class FacepalmCommand extends Command {
  constructor() {
    super({
      name: "facepalm",
      description: "Yüzünü kapat",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("facepalm")
        .setDescription("Yüzünü kapat")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(0xeb459e)
      .setDescription(`🤦 **${interaction.user.username}}** yüzünü kapattı.`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
