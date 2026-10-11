import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class MusicstatusCommand extends Command {
  constructor() {
    super({
      name: "musicstatus",
      description: "Lavalink / müzik durumu",
      category: "music",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("musicstatus")
        .setDescription("Lavalink / müzik durumu")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const ready = client.music.lavalinkReady;
    const host = client.config.LAVALINK_HOST;
    const port = client.config.LAVALINK_PORT;

    const embed = baseEmbed(ready ? Theme.success : Theme.warning)
      .setAuthor({ name: "MUSIC" })
      .setTitle("Durum")
      .setDescription(
        [
          line(),
          kv("Lavalink", ready ? "● Online" : "○ Offline"),
          kv("Host", code(`${host}:${port}`)),
          kv("Kuyruklar", code(client.music.queues.size)),
          line(),
          ready
            ? "Arama ve metadata aktif. Ses stream için node + voice session gerekir."
            : "Lavalink kur: Docker `fredboat/lavalink` veya kendi sunucun. Env: LAVALINK_HOST/PORT/PASSWORD",
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
