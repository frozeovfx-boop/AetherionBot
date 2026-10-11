import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class VolumeCommand extends Command {
  constructor() {
    super({
      name: "volume",
      description: "Ses seviyesi",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("volume")
        .setDescription("Ses seviyesi")
        .addIntegerOption((o) =>
          o.setName("seviye").setDescription("0-200").setRequired(true).setMinValue(0).setMaxValue(200)
        )
        .toJSON(),
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

    const vol = interaction.options.getInteger("seviye", true);
    queue.volume = vol;

    const embed = baseEmbed(Theme.music)
      .setAuthor({ name: "MUSIC" })
      .setTitle("Ses")
      .setDescription([line(), kv("Seviye", code(`${vol}%`)), line()].join("\n"));

    await interaction.reply({ embeds: [embed] });
  }
}
