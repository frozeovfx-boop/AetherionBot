import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

export default class RandomCommand extends Command {
  constructor() {
    super({
      name: "random",
      description: "Rastgele sayı",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("random")
        .setDescription("Rastgele sayı")
        .addIntegerOption((o) => o.setName("min").setDescription("Min").setRequired(false))
        .addIntegerOption((o) => o.setName("max").setDescription("Max").setRequired(false))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    let min = interaction.options.getInteger("min") ?? 1;
    let max = interaction.options.getInteger("max") ?? 100;
    if (min > max) [min, max] = [max, min];
    const n = Math.floor(Math.random() * (max - min + 1)) + min;

    const embed = baseEmbed(Theme.fun)
      .setAuthor({ name: "RANDOM" })
      .setDescription([line(), `**${n}**\n\`${min} – ${max}\``, line()].join("\n"));

    await interaction.reply({ embeds: [embed] });
  }
}
