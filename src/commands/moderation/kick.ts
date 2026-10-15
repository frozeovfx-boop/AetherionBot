import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, code, kv } from "../../utils/embeds.js";
import { buildModEmbed, sendModLog } from "../../utils/modlog.js";

export default class KickCommand extends Command {
  constructor() {
    super({
      name: "kick",
      description: "Kullanıcıyı sunucudan atar",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.KickMembers],
      clientPermissions: [PermissionFlagsBits.KickMembers],
      data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kullanıcıyı sunucudan atar")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(true))
        .addStringOption((o) => o.setName("sebep").setDescription("Sebep").setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const reason = interaction.options.getString("sebep") ?? "Belirtilmedi";
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member?.kickable) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Bu kullanıcı atılamaz.")],
        ephemeral: true,
      });
      return;
    }

    await member.kick(`${reason} · ${interaction.user.tag}`);

    const modCase = client.cases.create({
      guildId: interaction.guild.id,
      userId: target.id,
      moderatorId: interaction.user.id,
      type: "kick",
      reason,
    });

    const embed = baseEmbed(Theme.mod)
      .setAuthor({ name: "MODERASYON", iconURL: interaction.guild.iconURL({ size: 64 }) ?? undefined })
      .setTitle("Atma")
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
      .setFooter({ text: `Case #${modCase.id} · Sukuna` });

    await interaction.reply({ embeds: [embed] });

    await sendModLog(
      client,
      interaction.guild.id,
      buildModEmbed({
        type: "kick",
        userTag: target.tag,
        userId: target.id,
        moderatorTag: interaction.user.tag,
        reason,
        caseId: modCase.id,
        userAvatar: target.displayAvatarURL({ size: 256 }),
      })
    );

  }
}
