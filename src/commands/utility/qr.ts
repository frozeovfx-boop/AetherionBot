import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class QrCommand extends Command {
  constructor() {
    super({
      name: "qr",
      description: "Metinden QR kod oluşturur",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("qr")
        .setDescription("Metinden QR kod oluşturur")
        .addStringOption((opt) =>
          opt.setName("metin").setDescription("QR içeriği").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString("metin", true);
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("QR Kod")
      .setImage(url)
      .setFooter({ text: text.slice(0, 50) })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
