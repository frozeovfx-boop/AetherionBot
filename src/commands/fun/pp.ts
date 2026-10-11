import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

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
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(false))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const size = Number(BigInt(user.id) % 16n);
    const bar = "8" + "=".repeat(size) + "D";

    const embed = baseEmbed(Theme.fun)
      .setAuthor({ name: "PP" })
      .setDescription([line(), `**${user.username}**\n\`${bar}\``, line()].join("\n"));

    await interaction.reply({ embeds: [embed] });
  }
}
