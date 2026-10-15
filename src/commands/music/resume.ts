import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class ResumeCommand extends Command {
  constructor() {
    super({
      name: "resume",
      description: "Müzik: Devam",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder().setName("resume").setDescription("Müzik: Devam").toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const queue = client.music.getQueue(interaction.guild.id);

    if (!queue || (!queue.current && queue.tracks.length === 0)) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Kuyruk boş.")],
        ephemeral: true,
      });
      return;
    }

    const action = "resume";
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
      .setTitle("Devam")
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
