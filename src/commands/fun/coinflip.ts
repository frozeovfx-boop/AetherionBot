import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

export default class CoinflipCommand extends Command {
  constructor() {
    super({
      name: "coinflip",
      description: "Yazı tura",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder().setName("coinflip").setDescription("Yazı tura").toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const result = Math.random() < 0.5 ? "Yazı" : "Tura";
    const embed = baseEmbed(Theme.fun)
      .setAuthor({ name: "COINFLIP" })
      .setDescription([line(), `**${result}**`, line()].join("\n"));
    await interaction.reply({ embeds: [embed] });
  }
}
