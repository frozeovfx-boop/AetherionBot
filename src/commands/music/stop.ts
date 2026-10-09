import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class StopCommand extends Command {
  constructor() {
    super({
      name: "stop",
      description: "Müziği durdurur ve kuyruğu temizler",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Müziği durdurur ve kuyruğu temizler")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const queue = client.music.getQueue(interaction.guild.id);
    if (!queue || (!queue.current && queue.tracks.length === 0)) {
      await interaction.reply({ content: "Çalan müzik yok.", ephemeral: true });
      return;
    }

    client.music.destroy(interaction.guild.id);

    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setDescription("Müzik durduruldu, kuyruk temizlendi.")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
