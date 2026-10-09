import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { buildModEmbed } from "../../utils/modlog.js";

export default class SoftbanCommand extends Command {
  constructor() {
    super({
      name: "softban",
      description: "Kullanıcıyı yasaklayıp hemen yasağı kaldırır (mesaj temizliği için)",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.BanMembers],
      clientPermissions: [PermissionFlagsBits.BanMembers],
      data: new SlashCommandBuilder()
        .setName("softban")
        .setDescription("Kullanıcıyı yasaklayıp hemen yasağı kaldırır (mesaj temizliği için)")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Softban uygulanacak kullanıcı").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("sebep").setDescription("Sebep").setRequired(false)
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
    const reason = interaction.options.getString("sebep") ?? "Softban";
    const deleteMessageDays = interaction.options.getInteger("mesaj_sil") ?? 1;

    if (target.id === interaction.user.id || target.id === client.user?.id) {
      await interaction.reply({ content: "Geçersiz hedef.", ephemeral: true });
      return;
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (member && !member.bannable) {
      await interaction.reply({ content: "Bu kullanıcıyı softban yapamıyorum.", ephemeral: true });
      return;
    }

    await interaction.guild.members.ban(target.id, {
      reason: `Softban | ${reason} | Yetkili: ${interaction.user.tag}`,
      deleteMessageSeconds: deleteMessageDays * 24 * 60 * 60,
    });
    await interaction.guild.members.unban(target.id, `Softban kaldırıldı | ${interaction.user.tag}`);

    const modCase = client.cases.create({
      guildId: interaction.guild.id,
      userId: target.id,
      moderatorId: interaction.user.id,
      type: "softban",
      reason,
    });

    const embed = buildModEmbed({
      type: "softban",
      userTag: target.tag,
      userId: target.id,
      moderatorTag: interaction.user.tag,
      reason,
      caseId: modCase.id,
    });

    await interaction.reply({ embeds: [embed] });
  }
}
