import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class VolumeCommand extends Command {
  constructor() {
    super({
      name: "volume",
      description: "Ses seviyesi (1-200)",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("volume")
        .setDescription("Ses seviyesi (1-200)")
        .addIntegerOption((o) =>
          o.setName("seviye").setDescription("seviye").setRequired(true).setMinValue(1).setMaxValue(200)
        )
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const queue = client.music.getQueue(interaction.guild.id);
    if (!queue) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Kuyruk yok.")],
        ephemeral: true,
      });
      return;
    }
    const seviye = interaction.options.getInteger("seviye", true);
    await client.music.setVolume(interaction.guild.id, seviye);
    await interaction.reply({
      embeds: [
        baseEmbed(Theme.music)
          .setAuthor({ name: "MUSIC" })
          .setTitle("Ses")
          .setDescription([line(), kv("Seviye", code(`${queue.volume}%`)), line()].join("\n")),
      ],
    });
  }
}
