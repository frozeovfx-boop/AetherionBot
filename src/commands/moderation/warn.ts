import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, code, kv } from "../../utils/embeds.js";
import { buildModEmbed, sendModLog } from "../../utils/modlog.js";

export default class WarnCommand extends Command {
  constructor() {
    super({
      name: "warn",
      description: "Kullanıcıyı uyarır",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
      data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Kullanıcıyı uyarır")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(true))
        .addStringOption((o) => o.setName("sebep").setDescription("Sebep").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const reason = interaction.options.getString("sebep", true);

    if (target.bot || target.id === interaction.user.id) {
      await interaction.reply({ embeds: [baseEmbed(Theme.warning).setDescription("Geçersiz hedef.")], ephemeral: true });
      return;
    }

    const modCase = client.cases.create({
      guildId: interaction.guild.id,
      userId: target.id,
      moderatorId: interaction.user.id,
      type: "warn",
      reason,
    });

    const warns = client.cases
      .getUserCases(interaction.guild.id, target.id)
      .filter((c) => c.type === "warn" && c.active).length;

    const embed = baseEmbed(Theme.warning)
      .setAuthor({ name: "MODERASYON", iconURL: interaction.guild.iconURL({ size: 64 }) ?? undefined })
      .setTitle("Uyarı")
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .setDescription(
        [
          line(),
          kv("Kullanıcı", target.tag),
          kv("ID", code(target.id)),
          kv("Yetkili", interaction.user.tag),
          kv("Sebep", reason),
          kv("Toplam", `${warns} aktif uyarı`),
          line(),
        ].join("\n")
      )
      .setFooter({ text: `Case #${modCase.id} · Aetherion` });

    await interaction.reply({ embeds: [embed] });

    await sendModLog(
      client,
      interaction.guild.id,
      buildModEmbed({
        type: "warn",
        userTag: target.tag,
        userId: target.id,
        moderatorTag: interaction.user.tag,
        reason,
        caseId: modCase.id,
        userAvatar: target.displayAvatarURL({ size: 256 }),
      })
    );


    await target.send({
      embeds: [
        baseEmbed(Theme.warning)
          .setTitle(`${interaction.guild.name} · Uyarı`)
          .setDescription(`**Sebep:** ${reason}\n**Yetkili:** ${interaction.user.tag}`),
      ],
    }).catch(() => null);
  }
}
