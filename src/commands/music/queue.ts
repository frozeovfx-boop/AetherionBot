import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class QueueCommand extends Command {
  constructor() {
    super({
      name: "queue",
      description: "Müzik kuyruğunu gösterir",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Müzik kuyruğunu gösterir")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const queue = client.music.getQueue(interaction.guild.id);
    if (!queue || (!queue.current && queue.tracks.length === 0)) {
      await interaction.reply({ content: "Kuyruk boş.", ephemeral: true });
      return;
    }

    const lines: string[] = [];
    if (queue.current) {
      lines.push(`**Çalıyor:** ${queue.current.title} — ${queue.current.requesterTag}`);
    }
    queue.tracks.slice(0, 15).forEach((t, i) => {
      lines.push(`\`${i + 1}.\` ${t.title} — ${t.requesterTag}`);
    });

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🎵 Kuyruk")
      .setDescription(lines.join("\n") || "Boş")
      .setFooter({ text: `Toplam: ${(queue.current ? 1 : 0) + queue.tracks.length} şarkı` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
