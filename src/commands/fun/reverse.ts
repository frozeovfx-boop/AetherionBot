import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

export default class ReverseCommand extends Command {
  constructor() {
    super({
      name: "reverse",
      description: "Metni ters çevir",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("reverse")
        .setDescription("Metni ters çevir")
        .addStringOption((o) => o.setName("metin").setDescription("Metin").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString("metin", true);
    const reversed = [...text].reverse().join("");

    const embed = baseEmbed(Theme.fun)
      .setAuthor({ name: "REVERSE" })
      .setDescription([line(), reversed.slice(0, 1500), line()].join("\n"));

    await interaction.reply({ embeds: [embed] });
  }
}
