import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class ReportCommand extends Command {
  constructor() {
    super({
      name: "report",
      description: "Bir kullanıcıyı şikayet et",
      category: "moderation",
      cooldown: 30,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("report")
        .setDescription("Bir kullanıcıyı şikayet et")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Şikayet edilen").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("sebep").setDescription("Sebep").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const reason = interaction.options.getString("sebep", true);

    if (target.id === interaction.user.id) {
      await interaction.reply({ content: "Kendini şikayet edemezsin.", ephemeral: true });
      return;
    }

    const modCase = client.cases.create({
      guildId: interaction.guild.id,
      userId: target.id,
      moderatorId: interaction.user.id,
      type: "other",
      reason: `REPORT: ${reason}`,
    });

    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle("Şikayet Alındı")
      .addFields(
        { name: "Kullanıcı", value: `${target.tag} (\`${target.id}\`)`, inline: true },
        { name: "Şikayetçi", value: interaction.user.tag, inline: true },
        { name: "Sebep", value: reason },
        { name: "Case", value: `#${modCase.id}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
