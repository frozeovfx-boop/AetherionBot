import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class ReverseCommand extends Command {
  constructor() {
    super({
      name: "reverse",
      description: "Metni ters çevirir",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("reverse")
        .setDescription("Metni ters çevirir")
        .addStringOption((opt) => opt.setName("metin").setDescription("Metin").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString("metin", true);
    await interaction.reply({ content: text.split("").reverse().join("") });
  }
}
