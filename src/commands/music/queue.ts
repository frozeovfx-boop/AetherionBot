import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, code } from "../../utils/embeds.js";

export default class QueueCommand extends Command {
  constructor() {
    super({
      name: "queue",
      description: "Müzik kuyruğunu gösterir",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder().setName("queue").setDescription("Müzik kuyruğunu gösterir").toJSON(),
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

    const now = queue.current ? `▶  **${queue.current.title}**` : "—";
    const list =
      queue.tracks.length === 0
        ? "*Sırada parça yok*"
        : queue.tracks
            .slice(0, 10)
            .map((t, i) => `${code(`${i + 1}.`)}  ${t.title}`)
            .join("\n");

    const embed = baseEmbed(Theme.music)
      .setAuthor({ name: "MUSIC" })
      .setTitle("Kuyruk")
      .setDescription(
        [
          line(),
          "**Şimdi**",
          now,
          "",
          "**Sırada**",
          list,
          line(),
          `Toplam  ${code(queue.tracks.length)}  ·  Loop  ${code(queue.loop)}`,
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
