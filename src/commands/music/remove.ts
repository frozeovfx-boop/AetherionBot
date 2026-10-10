import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class RemoveCommand extends Command {
  constructor() {
    super({
      name: "remove",
      description: "Kuyruktan şarkı siler",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("remove")
        .setDescription("Kuyruktan şarkı siler")
        .addIntegerOption((opt) =>
          opt.setName("sira").setDescription("Sıra numarası (1...)").setRequired(true).setMinValue(1)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const queue = client.music.getQueue(interaction.guild.id);
    const index = interaction.options.getInteger("sira", true) - 1;

    if (!queue || index < 0 || index >= queue.tracks.length) {
      await interaction.reply({ content: "Geçersiz sıra.", ephemeral: true });
      return;
    }

    const removed = queue.tracks.splice(index, 1)[0]!;
    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setDescription(`Kuyruktan silindi: **${removed.title}**`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
