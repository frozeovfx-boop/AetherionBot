import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class MockCommand extends Command {
  constructor() {
    super({
      name: "mock",
      description: "MoCk MeTiN",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("mock")
        .setDescription("MoCk MeTiN")
        .addStringOption((opt) => opt.setName("metin").setDescription("Metin").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString("metin", true);
    const mocked = [...text].map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join("");
    await interaction.reply({ content: mocked });
  }
}
