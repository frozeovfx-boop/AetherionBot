import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class StopCommand extends Command {
  constructor() {
    super({
      name: "stop",
      description: "Müzik: Durduruldu",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder().setName("stop").setDescription("Müzik: Durduruldu").toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const queue = client.music.getQueue(interaction.guild.id);

    if (!queue || (!queue.current && queue.tracks.length === 0)) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Kuyruk boş.")],
        ephemeral: true,
      });
      return;
    }

    const action = "stop";
    if (action === "skip") {
      queue.current = queue.tracks.shift() ?? null;
      queue.playing = !!queue.current;
    } else if (action === "stop") {
      queue.tracks = [];
      queue.current = null;
      queue.playing = false;
    } else if (action === "pause") {
      queue.playing = false;
    } else if (action === "resume") {
      queue.playing = true;
    } else if (action === "shuffle") {
      for (let i = queue.tracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue.tracks[i], queue.tracks[j]] = [queue.tracks[j]!, queue.tracks[i]!];
      }
    }

    const embed = baseEmbed(Theme.music)
      .setAuthor({ name: "MUSIC" })
      .setTitle("Durduruldu")
      .setDescription(
        [
          line(),
          kv("Şimdi", queue.current?.title ?? "—"),
          kv("Kuyruk", `**${queue.tracks.length}** parça`),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
