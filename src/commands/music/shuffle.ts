import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class ShuffleCommand extends Command {
  constructor() {
    super({
      name: "shuffle",
      description: "Kuyruğu karıştırır",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("Kuyruğu karıştırır")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const queue = client.music.getQueue(interaction.guild.id);
    if (!queue || queue.tracks.length < 2) {
      await interaction.reply({ content: "Karıştırılacak yeterli şarkı yok.", ephemeral: true });
      return;
    }

    for (let i = queue.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue.tracks[i], queue.tracks[j]] = [queue.tracks[j]!, queue.tracks[i]!];
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setDescription(`🔀 Kuyruk karıştırıldı (**${queue.tracks.length}** şarkı).`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
