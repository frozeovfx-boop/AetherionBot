import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class CoinFlipCommand extends Command {
  constructor() {
    super({
      name: "coinflip",
      description: "Yazı tura atar",
      category: "fun",
      cooldown: 2,
      data: new SlashCommandBuilder()
        .setName("coinflip")
        .setDescription("Yazı tura atar")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const result = Math.random() < 0.5 ? "Yazı" : "Tura";

    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setTitle("🪙 Yazı Tura")
      .setDescription(`Sonuç: **${result}**`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
