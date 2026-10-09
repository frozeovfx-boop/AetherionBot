import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class NowPlayingCommand extends Command {
  constructor() {
    super({
      name: "nowplaying",
      description: "Şu an çalan şarkıyı gösterir",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("nowplaying")
        .setDescription("Şu an çalan şarkıyı gösterir")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const queue = client.music.getQueue(interaction.guild.id);
    if (!queue?.current) {
      await interaction.reply({ content: "Çalan müzik yok.", ephemeral: true });
      return;
    }

    const t = queue.current;
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🎵 Şu An Çalıyor")
      .setDescription(`**${t.title}**\nİsteyen: ${t.requesterTag}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
