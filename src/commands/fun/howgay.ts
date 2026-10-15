import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, bar } from "../../utils/embeds.js";

export default class HowgayCommand extends Command {
  constructor() {
    super({
      name: "howgay",
      description: "Gay metre (eğlence)",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("howgay")
        .setDescription("Gay metre (eğlence)")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(false))
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const score = Number(BigInt(user.id) % 101n);

    const embed = baseEmbed(Theme.fun)
      .setAuthor({ name: "HOWGAY" })
      .setTitle(user.username)
      .setDescription(
        [
          line(),
          `**${score}%**`,
          bar(score / 100),
          line(),
        ].join("\n")
      )
      .setThumbnail(user.displayAvatarURL({ size: 256 }));

    await interaction.reply({ embeds: [embed] });
  }
}
