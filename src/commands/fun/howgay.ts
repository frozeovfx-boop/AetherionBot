import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class HowGayCommand extends Command {
  constructor() {
    super({
      name: "howgay",
      description: "Gay metre (eğlence amaçlı)",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("howgay")
        .setDescription("Gay metre (eğlence amaçlı)")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef kullanıcı").setRequired(false)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    // Deterministic based on user id for consistency
    const percent = Number(BigInt(user.id) % 101n);

    const embed = new EmbedBuilder()
      .setColor(0xeb459e)
      .setTitle("🏳️‍🌈 Gay Metre")
      .setDescription(`**${user.tag}** %${percent} gay.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
