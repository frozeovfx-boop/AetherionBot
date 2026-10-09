import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class SlapCommand extends Command {
  constructor() {
    super({
      name: "slap",
      description: "Birini tokatla",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("slap")
        .setDescription("Birini tokatla")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser("kullanici", true);

    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setDescription(`👋 **${interaction.user.username}**, **${target.username}** kullanıcısını tokatladı!`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
