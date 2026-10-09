import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { buildModEmbed } from "../../utils/modlog.js";

export default class BanCommand extends Command {
  constructor() {
    super({
      name: "ban",
      description: "Bir kullanıcıyı sunucudan yasaklar",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.BanMembers],
      clientPermissions: [PermissionFlagsBits.BanMembers],
      data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Bir kullanıcıyı sunucudan yasaklar")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Yasaklanacak kullanıcı").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("sebep").setDescription("Yasaklama sebebi").setRequired(false)
        )
        .addIntegerOption((opt) =>
          opt
            .setName("mesaj_sil")
            .setDescription("Kaç günlük mesajlar silinsin (0-7)")
            .setMinValue(0)
            .setMaxValue(7)
            .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const reason = interaction.options.getString("sebep") ?? "Sebep belirtilmedi";
    const deleteMessageDays = interaction.options.getInteger("mesaj_sil") ?? 0;

    if (target.id === interaction.user.id || target.id === client.user?.id) {
      await interaction.reply({ content: "Geçersiz hedef.", ephemeral: true });
      return;
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (member) {
      if (!member.bannable) {
        await interaction.reply({ content: "Bu kullanıcıyı yasaklayamıyorum (yetki/rol hiyerarşisi).", ephemeral: true });
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
    }

    await interaction.guild.members.ban(target.id, {
      reason: `${reason} | Yetkili: ${interaction.user.tag}`,
      deleteMessageSeconds: deleteMessageDays * 24 * 60 * 60,
    });

    const modCase = client.cases.create({
      guildId: interaction.guild.id,
      userId: target.id,
      moderatorId: interaction.user.id,
      type: "ban",
      reason,
    });

    const embed = buildModEmbed({
      type: "ban",
      userTag: target.tag,
      userId: target.id,
      moderatorTag: interaction.user.tag,
      reason,
      caseId: modCase.id,
    });

    await interaction.reply({ embeds: [embed] });
  }
}
