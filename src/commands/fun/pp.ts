import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class PpCommand extends Command {
  constructor() {
    super({
      name: "pp",
      description: "PP size (eğlence)",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("pp")
        .setDescription("PP size (eğlence)")
        .addUserOption((opt) => opt.setName("kullanici").setDescription("Hedef").setRequired(false))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const size = Number(BigInt(user.id) % 16n) + 1;
    const bar = "=".repeat(size);
    const embed = new EmbedBuilder()
      .setColor(0xeb459e)
      .setDescription(`**${user.username}**\n8${bar}D`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
