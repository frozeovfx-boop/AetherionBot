import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class NowplayingCommand extends Command {
  constructor() {
    super({
      name: "nowplaying",
      description: "Şu an çalan parçayı gösterir",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("nowplaying")
        .setDescription("Şu an çalan parçayı gösterir")
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const queue = client.music.getQueue(interaction.guild.id);
    if (!queue?.current) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Çalan parça yok.")],
        ephemeral: true,
      });
      return;
    }

    const t = queue.current;
    const embed = baseEmbed(Theme.music)
      .setAuthor({ name: "MUSIC" })
      .setTitle("Şimdi Çalıyor")
      .setDescription(
        [
          line(),
          kv("Parça", t.title),
          t.author ? kv("Sanatçı", t.author) : null,
          kv("Süre", client.music.formatDuration(t.duration)),
          kv("Durum", queue.playing ? "▶ Çalıyor" : "⏸ Duraklatıldı"),
          kv("Ses", code(`${queue.volume}%`)),
          kv("Loop", code(queue.loop)),
          kv("Lavalink", client.music.lavalinkReady ? "● Online" : "○ Offline"),
          line(),
        ]
          .filter(Boolean)
          .join("\n")
      )
      .setFooter({ text: t.requesterTag });

    if (t.artworkUrl) embed.setThumbnail(t.artworkUrl);

    await interaction.reply({ embeds: [embed] });
  }
}
