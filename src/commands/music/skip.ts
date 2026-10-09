import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class SkipCommand extends Command {
  constructor() {
    super({
      name: "skip",
      description: "Şarkıyı atlar",
      category: "music",
      cooldown: 2,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Şarkıyı atlar")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const queue = client.music.getQueue(interaction.guild.id);
    if (!queue?.current) {
      await interaction.reply({ content: "Çalan müzik yok.", ephemeral: true });
      return;
    }

    const skipped = client.music.skip(interaction.guild.id);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setDescription(
        skipped
          ? `Atlandı: **${skipped.title}**${queue.current ? `\nŞimdi: **${queue.current.title}**` : "\nKuyruk bitti."}`
          : "Atlanacak şarkı yok."
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
