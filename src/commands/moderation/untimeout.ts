import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { buildModEmbed } from "../../utils/modlog.js";

export default class UntimeoutCommand extends Command {
  constructor() {
    super({
      name: "untimeout",
      description: "Bir kullanıcının timeout'unu kaldırır",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
      clientPermissions: [PermissionFlagsBits.ModerateMembers],
      data: new SlashCommandBuilder()
        .setName("untimeout")
        .setDescription("Bir kullanıcının timeout'unu kaldırır")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef kullanıcı").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("sebep").setDescription("Sebep").setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const reason = interaction.options.getString("sebep") ?? "Sebep belirtilmedi";

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      await interaction.reply({ content: "Bu kullanıcı sunucuda değil.", ephemeral: true });
      return;
    }

    if (!member.communicationDisabledUntil) {
      await interaction.reply({ content: "Bu kullanıcının aktif timeout'u yok.", ephemeral: true });
      return;
    }

    await member.timeout(null, `${reason} | Yetkili: ${interaction.user.tag}`);

    const modCase = client.cases.create({
      guildId: interaction.guild.id,
      userId: target.id,
      moderatorId: interaction.user.id,
      type: "untimeout",
      reason,
    });

    const embed = buildModEmbed({
      type: "untimeout",
      userTag: target.tag,
      userId: target.id,
      moderatorTag: interaction.user.tag,
      reason,
      caseId: modCase.id,
    });

    await interaction.reply({ embeds: [embed] });
  }
}
