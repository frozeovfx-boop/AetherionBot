import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class LoopCommand extends Command {
  constructor() {
    super({
      name: "loop",
      description: "Döngü modunu ayarlar",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Döngü modunu ayarlar")
        .addStringOption((opt) =>
          opt
            .setName("mod")
            .setDescription("Döngü modu")
            .setRequired(true)
            .addChoices(
              { name: "Kapalı", value: "off" },
              { name: "Şarkı", value: "track" },
              { name: "Kuyruk", value: "queue" }
            )
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const queue = client.music.getQueue(interaction.guild.id);
    if (!queue) {
      await interaction.reply({ content: "Aktif kuyruk yok.", ephemeral: true });
      return;
    }

    const mode = interaction.options.getString("mod", true) as "off" | "track" | "queue";
    queue.loop = mode;

    const labels = { off: "Kapalı", track: "Şarkı", queue: "Kuyruk" };
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setDescription(`Döngü: **${labels[mode]}**`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
