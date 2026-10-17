import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";
import { FILTERS } from "../../music/filters.js";

export default class NowplayingCommand extends Command {
  constructor() {
    super({
      name: "nowplaying",
      description: "Çalan parça",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("nowplaying")
        .setDescription("Çalan parça")
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const queue = client.music.getQueue(interaction.guild.id);
    if (!queue?.current) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Şu an bir şey çalmıyor.")],
        ephemeral: true,
      });
      return;
    }

    const t = queue.current;
    const filt = FILTERS[queue.filter];
    const embed = baseEmbed(Theme.music)
      .setAuthor({ name: "MUSIC · NOW" })
      .setTitle(t.title)
      .setDescription(
        [
          line(),
          t.author ? kv("Sanatçı", t.author) : null,
          kv("Süre", client.music.formatDuration(t.duration)),
          kv("İsteyen", t.requesterTag),
          kv("Ses", code(`${queue.volume}%`)),
          kv("Loop", code(queue.loop)),
          kv("Filtre", filt.label),
          kv("Kuyruk", code(queue.tracks.length)),
          line(),
        ]
          .filter(Boolean)
          .join("\n")
      );

    if (t.artworkUrl) embed.setThumbnail(t.artworkUrl);
    await interaction.reply({ embeds: [embed] });
  }
}
