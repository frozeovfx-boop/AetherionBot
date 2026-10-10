import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { buildModEmbed } from "../../utils/modlog.js";

export default class UnmuteCommand extends Command {
  constructor() {
    super({
      name: "unmute",
      description: "Susturmayı kaldır",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
      clientPermissions: [PermissionFlagsBits.ModerateMembers],
      data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Susturmayı kaldır")
        .addUserOption((opt) => opt.setName("kullanici").setDescription("Hedef").setRequired(true))
        .addStringOption((opt) => opt.setName("sebep").setDescription("Sebep").setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const target = interaction.options.getUser("kullanici", true);
    const reason = interaction.options.getString("sebep") ?? "Unmute";
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      await interaction.reply({ content: "Kullanıcı yok.", ephemeral: true });
      return;
    }
    await member.timeout(null, `${reason} | ${interaction.user.tag}`);
    const modCase = client.cases.create({
      guildId: interaction.guild.id,
      userId: target.id,
      moderatorId: interaction.user.id,
      type: "unmute",
      reason,
    });
    await interaction.reply({
      embeds: [buildModEmbed({
        type: "unmute",
        userTag: target.tag,
        userId: target.id,
        moderatorTag: interaction.user.tag,
        reason,
        caseId: modCase.id,
      })],
    });
  }
}
