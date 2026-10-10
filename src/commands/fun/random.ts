import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class RandomCommand extends Command {
  constructor() {
    super({
      name: "random",
      description: "Rastgele sayı üretir",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("random")
        .setDescription("Rastgele sayı üretir")
        .addIntegerOption((opt) => opt.setName("min").setDescription("Min").setRequired(false))
        .addIntegerOption((opt) => opt.setName("max").setDescription("Max").setRequired(false))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const min = interaction.options.getInteger("min") ?? 1;
    const max = interaction.options.getInteger("max") ?? 100;
    if (min >= max) {
      await interaction.reply({ content: "Min, max'tan küçük olmalı.", ephemeral: true });
      return;
    }
    const n = Math.floor(Math.random() * (max - min + 1)) + min;
    await interaction.reply({ content: `🎲 **${n}** (${min}-${max})` });
  }
}
