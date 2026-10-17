import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class ResumeCommand extends Command {
  constructor() {
    super({
      name: "resume",
      description: "Müziğe devam et",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder().setName("resume").setDescription("Müziğe devam et").toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const ok = await client.music.resume(interaction.guild.id);
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
          .setTitle("Devam")
          .setDescription([line(), kv("Parça", q?.current?.title ?? "—"), line()].join("\n")),
      ],
    });
  }
}
