import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class ShuffleCommand extends Command {
  constructor() {
    super({
      name: "shuffle",
      description: "Kuyruğu karıştır",
      category: "music",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("shuffle")
        .setDescription("Kuyruğu karıştır")
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const n = client.music.shuffle(interaction.guild.id);
    if (n < 2) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Karıştırmak için en az 2 parça lazım.")],
        ephemeral: true,
      });
      return;
    }
    await interaction.reply({
      embeds: [
        baseEmbed(Theme.music)
          .setAuthor({ name: "MUSIC" })
          .setTitle("Karıştırıldı")
          .setDescription([line(), kv("Parça", code(n)), line()].join("\n")),
      ],
    });
  }
}
