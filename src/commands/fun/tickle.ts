import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

export default class TickleCommand extends Command {
  constructor() {
    super({
      name: "tickle",
      description: "Birini gıdıkladı",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("tickle")
        .setDescription("Birini gıdıkladı")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser("kullanici", true);
    const embed = baseEmbed(Theme.fun)
      .setAuthor({ name: "FUN" })
      .setDescription(
        [
          line(),
          `😆 **${interaction.user.username}**, **${target.username}** kullanıcısını gıdıkladı!`,
          line(),
        ].join("\n")
      );
    await interaction.reply({ embeds: [embed] });
  }
}
