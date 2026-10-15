import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, code, kv } from "../../utils/embeds.js";

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
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(true))
        .addStringOption((o) => o.setName("sebep").setDescription("Sebep").setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const reason = interaction.options.getString("sebep") ?? "Belirtilmedi";
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Kullanıcı bulunamadı.")],
        ephemeral: true,
      });
      return;
    }

    await member.timeout(null, `${reason} · ${interaction.user.tag}`);

    const modCase = client.cases.create({
      guildId: interaction.guild.id,
      userId: target.id,
      moderatorId: interaction.user.id,
      type: "unmute",
      reason,
    });

    const embed = baseEmbed(Theme.success)
      .setAuthor({ name: "MODERASYON", iconURL: interaction.guild.iconURL({ size: 64 }) ?? undefined })
      .setTitle("Susturma Kaldırıldı")
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .setDescription(
        [
          line(),
          kv("Kullanıcı", target.tag),
          kv("ID", code(target.id)),
          kv("Yetkili", interaction.user.tag),
          kv("Sebep", reason),
          line(),
        ].join("\n")
      )
      .setFooter({ text: `Case #${modCase.id} · Yuta` });

    await interaction.reply({ embeds: [embed] });
  }
}
