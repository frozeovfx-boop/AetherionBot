import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
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

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const queue = client.music.getQueue(interaction.guild.id);
    if (!queue?.current) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Çalan parça yok.")],
        ephemeral: true,
      });
      return;
    }

    const embed = baseEmbed(Theme.music)
      .setAuthor({ name: "MUSIC" })
      .setTitle("Şimdi Çalıyor")
      .setDescription(
        [
          line(),
          kv("Parça", queue.current.title),
          kv("Durum", queue.playing ? "▶ Çalıyor" : "⏸ Duraklatıldı"),
          kv("Ses", code(`${queue.volume}%`)),
          kv("Loop", code(queue.loop)),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
