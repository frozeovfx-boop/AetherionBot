import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class ModStatsCommand extends Command {
  constructor() {
    super({
      name: "modstats",
      description: "Moderasyon istatistiklerini gösterir (placeholder)",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
      data: new SlashCommandBuilder()
        .setName("modstats")
        .setDescription("Moderasyon istatistiklerini gösterir")
        .addUserOption((opt) =>
          opt.setName("yetkili").setDescription("Belirli bir yetkili (opsiyonel)").setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser("yetkili") ?? interaction.user;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Moderasyon İstatistikleri")
      .setDescription(`**${target.tag}** için istatistikler\n\n*Case sistemi aktif olduğunda gerçek veriler burada görünecek.*`)
      .addFields(
        { name: "Ban", value: "0", inline: true },
        { name: "Kick", value: "0", inline: true },
        { name: "Timeout", value: "0", inline: true },
        { name: "Warn", value: "0", inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
