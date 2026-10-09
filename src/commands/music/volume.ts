import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class VolumeCommand extends Command {
  constructor() {
    super({
      name: "volume",
      description: "Ses seviyesini ayarlar",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("volume")
        .setDescription("Ses seviyesini ayarlar")
        .addIntegerOption((opt) =>
          opt.setName("seviye").setDescription("0-200").setRequired(true).setMinValue(0).setMaxValue(200)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const queue = client.music.getQueue(interaction.guild.id);
    if (!queue) {
      await interaction.reply({ content: "Aktif kuyruk yok.", ephemeral: true });
      return;
    }

    const volume = interaction.options.getInteger("seviye", true);
    queue.volume = volume;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setDescription(`Ses seviyesi **${volume}%** olarak ayarlandı.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
