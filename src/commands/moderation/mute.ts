import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { buildModEmbed } from "../../utils/modlog.js";

export default class MuteCommand extends Command {
  constructor() {
    super({
      name: "mute",
      description: "Timeout ile sustur (dakika)",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
      clientPermissions: [PermissionFlagsBits.ModerateMembers],
      data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Timeout ile sustur")
        .addUserOption((opt) => opt.setName("kullanici").setDescription("Hedef").setRequired(true))
        .addIntegerOption((opt) =>
          opt.setName("dakika").setDescription("Süre").setRequired(true).setMinValue(1).setMaxValue(40320)
        )
        .addStringOption((opt) => opt.setName("sebep").setDescription("Sebep").setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const target = interaction.options.getUser("kullanici", true);
    const minutes = interaction.options.getInteger("dakika", true);
    const reason = interaction.options.getString("sebep") ?? "Mute";
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member?.moderatable) {
      await interaction.reply({ content: "Bu kullanıcı susturulamaz.", ephemeral: true });
      return;
    }
    const duration = minutes * 60 * 1000;
    await member.timeout(duration, `${reason} | ${interaction.user.tag}`);
    const modCase = client.cases.create({
      guildId: interaction.guild.id,
      userId: target.id,
      moderatorId: interaction.user.id,
      type: "mute",
      reason,
      duration,
    });
    await interaction.reply({
      embeds: [buildModEmbed({
        type: "mute",
        userTag: target.tag,
        userId: target.id,
        moderatorTag: interaction.user.tag,
        reason,
        duration: `${minutes} dakika`,
        caseId: modCase.id,
      })],
    });
  }
}
