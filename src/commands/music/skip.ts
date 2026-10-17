import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class SkipCommand extends Command {
  constructor() {
    super({
      name: "skip",
      description: "Sıradaki parçaya geç",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder().setName("skip").setDescription("Sıradaki parçaya geç").toJSON(),
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

    const skipped = await client.music.skip(interaction.guild.id);
    const q = client.music.getQueue(interaction.guild.id);

    await interaction.reply({
      embeds: [
        baseEmbed(Theme.music)
          .setAuthor({ name: "MUSIC" })
          .setTitle("Atlandı")
          .setDescription(
            [
              line(),
              kv("Atlanan", skipped?.title ?? "—"),
              kv("Şimdi", q?.current?.title ?? "—"),
              kv("Kuyruk", `**${q?.tracks.length ?? 0}** parça`),
              line(),
            ].join("\n")
          ),
      ],
    });
  }
}
