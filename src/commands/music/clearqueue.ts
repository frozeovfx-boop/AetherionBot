import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class ClearqueueCommand extends Command {
  constructor() {
    super({
      name: "clearqueue",
      description: "Kuyruğu temizler",
      category: "music",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder().setName("clearqueue").setDescription("Kuyruğu temizler").toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const queue = client.music.getQueue(interaction.guild.id);

    if (!queue) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Kuyruk yok.")],
        ephemeral: true,
      });
      return;
    }

    const count = queue.tracks.length;
    queue.tracks = [];

    const embed = baseEmbed(Theme.music)
      .setAuthor({ name: "MUSIC" })
      .setTitle("Kuyruk Temiz")
      .setDescription([line(), kv("Silinen", code(count)), line()].join("\n"));

    await interaction.reply({ embeds: [embed] });
  }
}
