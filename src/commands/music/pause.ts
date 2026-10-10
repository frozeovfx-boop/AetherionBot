import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class PauseCommand extends Command {
  constructor() {
    super({
      name: "pause",
      description: "Müziği duraklatır",
      category: "music",
      cooldown: 2,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Müziği duraklatır")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const queue = client.music.getQueue(interaction.guild.id);
    if (!queue?.playing) {
      await interaction.reply({ content: "Çalan müzik yok.", ephemeral: true });
      return;
    }

    queue.playing = false;
    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setDescription("⏸️ Müzik duraklatıldı.")
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
