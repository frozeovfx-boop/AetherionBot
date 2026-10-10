import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class ResumeCommand extends Command {
  constructor() {
    super({
      name: "resume",
      description: "Müziği devam ettirir",
      category: "music",
      cooldown: 2,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Müziği devam ettirir")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const queue = client.music.getQueue(interaction.guild.id);
    if (!queue?.current) {
      await interaction.reply({ content: "Kuyruk boş.", ephemeral: true });
      return;
    }

    queue.playing = true;
    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setDescription("▶️ Müzik devam ediyor.")
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
