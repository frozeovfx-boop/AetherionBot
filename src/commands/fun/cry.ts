import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class CryCommand extends Command {
  constructor() {
    super({
      name: "cry",
      description: "Ağla",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("cry")
        .setDescription("Ağla")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(0xeb459e)
      .setDescription(`😢 **${{interaction.user.username}}** ağlıyor...`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
