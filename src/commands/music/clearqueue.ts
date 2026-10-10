import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class ClearqueueCommand extends Command {
  constructor() {
    super({
      name: "clearqueue",
      description: "Kuyruğu temizler (şu an çalan kalır)",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("clearqueue")
        .setDescription("Kuyruğu temizler")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const queue = client.music.getQueue(interaction.guild.id);
    if (!queue) {
      await interaction.reply({ content: "Kuyruk yok.", ephemeral: true });
      return;
    }
    const n = queue.tracks.length;
    queue.tracks = [];
    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setDescription(`Kuyruktan **${n}** şarkı silindi.`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
