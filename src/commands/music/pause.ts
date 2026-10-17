import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class PauseCommand extends Command {
  constructor() {
    super({
      name: "pause",
      description: "Müziği duraklat",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder().setName("pause").setDescription("Müziği duraklat").toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const ok = await client.music.pause(interaction.guild.id);
    if (!ok) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Çalan parça yok.")],
        ephemeral: true,
      });
      return;
    }
    const q = client.music.getQueue(interaction.guild.id);
    await interaction.reply({
      embeds: [
        baseEmbed(Theme.music)
          .setAuthor({ name: "MUSIC" })
          .setTitle("Duraklatıldı")
          .setDescription([line(), kv("Parça", q?.current?.title ?? "—"), line()].join("\n")),
      ],
    });
  }
}
