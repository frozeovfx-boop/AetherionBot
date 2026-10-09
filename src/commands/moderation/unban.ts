import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { buildModEmbed } from "../../utils/modlog.js";

export default class UnbanCommand extends Command {
  constructor() {
    super({
      name: "unban",
      description: "Bir kullanıcının yasağını kaldırır",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.BanMembers],
      clientPermissions: [PermissionFlagsBits.BanMembers],
      data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Bir kullanıcının yasağını kaldırır")
        .addStringOption((opt) =>
          opt.setName("kullanici_id").setDescription("Kullanıcı ID").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("sebep").setDescription("Sebep").setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const userId = interaction.options.getString("kullanici_id", true);
    const reason = interaction.options.getString("sebep") ?? "Sebep belirtilmedi";

    if (!/^\d{17,20}$/.test(userId)) {
      await interaction.reply({ content: "Geçersiz kullanıcı ID'si.", ephemeral: true });
      return;
    }

    try {
      await interaction.guild.members.unban(userId, `${reason} | Yetkili: ${interaction.user.tag}`);
    } catch {
      await interaction.reply({ content: "Bu kullanıcı yasaklı değil veya ID hatalı.", ephemeral: true });
      return;
    }

    const modCase = client.cases.create({
      guildId: interaction.guild.id,
      userId,
      moderatorId: interaction.user.id,
      type: "unban",
      reason,
    });

    const embed = buildModEmbed({
      type: "unban",
      userTag: userId,
      userId,
      moderatorTag: interaction.user.tag,
      reason,
      caseId: modCase.id,
    });

    await interaction.reply({ embeds: [embed] });
  }
}
