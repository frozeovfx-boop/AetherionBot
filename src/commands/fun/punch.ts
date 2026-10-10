import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class PunchCommand extends Command {
  constructor() {
    super({
      name: "punch",
      description: "Birine yumruk at",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("punch")
        .setDescription("Birine yumruk at")
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
      .setDescription(`👊 **${interaction.user.username}}**, **${target.username}}** kullanıcısına yumruk attı!`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
