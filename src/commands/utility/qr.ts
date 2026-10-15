import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

export default class QrCommand extends Command {
  constructor() {
    super({
      name: "qr",
      description: "QR kod oluşturur",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("qr")
        .setDescription("QR kod oluşturur")
        .addStringOption((o) => o.setName("metin").setDescription("İçerik").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString("metin", true);
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(text.slice(0, 500))}`;

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: "QR" })
      .setTitle("Kod")
      .setImage(url)
      .setDescription([line(), text.slice(0, 200), line()].join("\n"));

    await interaction.reply({ embeds: [embed] });
  }
}
