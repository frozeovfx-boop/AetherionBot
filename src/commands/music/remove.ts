import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class RemoveCommand extends Command {
  constructor() {
    super({
      name: "remove",
      description: "Kuyruktan parça siler",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("remove")
        .setDescription("Kuyruktan parça siler")
        .addIntegerOption((o) =>
          o.setName("sira").setDescription("Sıra numarası").setRequired(true).setMinValue(1)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const queue = client.music.getQueue(interaction.guild.id);
    const index = interaction.options.getInteger("sira", true) - 1;

    if (!queue || index < 0 || index >= queue.tracks.length) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Geçersiz sıra.")],
        ephemeral: true,
      });
      return;
    }

    const [removed] = queue.tracks.splice(index, 1);

    const embed = baseEmbed(Theme.music)
      .setAuthor({ name: "MUSIC" })
      .setTitle("Kaldırıldı")
      .setDescription(
        [
          line(),
          kv("Parça", removed?.title ?? "—"),
          kv("Kalan", code(queue.tracks.length)),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
