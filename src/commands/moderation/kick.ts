import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { buildModEmbed } from "../../utils/modlog.js";

export default class KickCommand extends Command {
  constructor() {
    super({
      name: "kick",
      description: "Bir kullanıcıyı sunucudan atar",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.KickMembers],
      clientPermissions: [PermissionFlagsBits.KickMembers],
      data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Bir kullanıcıyı sunucudan atar")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Atılacak kullanıcı").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("sebep").setDescription("Sebep").setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const reason = interaction.options.getString("sebep") ?? "Sebep belirtilmedi";

    if (target.id === interaction.user.id || target.id === client.user?.id) {
      await interaction.reply({ content: "Geçersiz hedef.", ephemeral: true });
      return;
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      await interaction.reply({ content: "Kullanıcı sunucuda bulunamadı.", ephemeral: true });
      return;
    }

    if (!member.kickable) {
      await interaction.reply({ content: "Bu kullanıcıyı atamıyorum.", ephemeral: true });
      return;
    }

    if (
      interaction.member &&
      "roles" in interaction.member &&
      member.roles.highest.position >= interaction.member.roles.highest.position &&
      interaction.guild.ownerId !== interaction.user.id
    ) {
      await interaction.reply({ content: "Bu kullanıcı senden yüksek veya eşit role sahip.", ephemeral: true });
      return;
    }

    await member.kick(`${reason} | Yetkili: ${interaction.user.tag}`);

    const modCase = client.cases.create({
      guildId: interaction.guild.id,
      userId: target.id,
      moderatorId: interaction.user.id,
      type: "kick",
      reason,
    });

    const embed = buildModEmbed({
      type: "kick",
      userTag: target.tag,
      userId: target.id,
      moderatorTag: interaction.user.tag,
      reason,
      caseId: modCase.id,
    });

    await interaction.reply({ embeds: [embed] });
  }
}
