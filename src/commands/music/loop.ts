import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class LoopCommand extends Command {
  constructor() {
    super({
      name: "loop",
      description: "Döngü modu",
      category: "music",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Döngü modu")
        .addStringOption((o) =>
          o
            .setName("mod")
            .setDescription("Mod")
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

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const queue = client.music.getQueue(interaction.guild.id);
    if (!queue) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Kuyruk yok.")],
        ephemeral: true,
      });
      return;
    }

    const mode = interaction.options.getString("mod", true) as "off" | "track" | "queue";
    queue.loop = mode;

    const embed = baseEmbed(Theme.music)
      .setAuthor({ name: "MUSIC" })
      .setTitle("Loop")
      .setDescription([line(), kv("Mod", code(mode)), line()].join("\n"));

    await interaction.reply({ embeds: [embed] });
  }
}
