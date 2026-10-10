import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class WaveCommand extends Command {
  constructor() {
    super({
      name: "wave",
      description: "Birine el salla",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("wave")
        .setDescription("Birine el salla")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser("kullanici", true);
    const embed = new EmbedBuilder()
      .setColor(0xeb459e)
      .setDescription(`👋 **${{interaction.user.username}}**, **${{target.username}}** kullanıcısına el salladı!`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
