import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

export default class StopCommand extends Command {
  constructor() {
    super({
      name: "stop",
      description: "Müziği durdur ve kuyruğu temizle",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Müziği durdur ve kuyruğu temizle")
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    await client.music.stop(interaction.guild.id);
    await interaction.reply({
      embeds: [
        baseEmbed(Theme.music)
          .setAuthor({ name: "MUSIC" })
          .setTitle("Durduruldu")
          .setDescription([line(), "Kuyruk temizlendi · ses bağlantısı kapatıldı.", line()].join("\n")),
      ],
    });
  }
}
