import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, code, kv } from "../../utils/embeds.js";
import { buildModEmbed, sendModLog } from "../../utils/modlog.js";

export default class BanCommand extends Command {
  constructor() {
    super({
      name: "ban",
      description: "Kullanıcıyı yasaklar",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.BanMembers],
      clientPermissions: [PermissionFlagsBits.BanMembers],
      data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Kullanıcıyı yasaklar")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(true))
        .addStringOption((o) => o.setName("sebep").setDescription("Sebep").setRequired(false))
        .addIntegerOption((o) =>
          o.setName("gun").setDescription("Mesaj silme (0-7 gün)").setMinValue(0).setMaxValue(7).setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const reason = interaction.options.getString("sebep") ?? "Belirtilmedi";
    const days = interaction.options.getInteger("gun") ?? 0;
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (target.id === interaction.user.id) {
      await interaction.reply({ embeds: [baseEmbed(Theme.warning).setDescription("Kendini yasaklayamazsın.")], ephemeral: true });
      return;
    }
    if (member && !member.bannable) {
      await interaction.reply({ embeds: [baseEmbed(Theme.danger).setDescription("Bu kullanıcı yasaklanamaz.")], ephemeral: true });
      return;
    }

    await interaction.guild.members.ban(target.id, {
      deleteMessageSeconds: days * 86_400,
      reason: `${reason} · ${interaction.user.tag}`,
    });

    const modCase = client.cases.create({
      guildId: interaction.guild.id,
      userId: target.id,
      moderatorId: interaction.user.id,
      type: "ban",
      reason,
    });

    const embed = baseEmbed(Theme.mod)
      .setAuthor({ name: "MODERASYON", iconURL: interaction.guild.iconURL({ size: 64 }) ?? undefined })
      .setTitle("Yasaklama")
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .setDescription(
        [
          line(),
          kv("Kullanıcı", `${target.tag}`),
          kv("ID", code(target.id)),
          kv("Yetkili", interaction.user.tag),
          kv("Sebep", reason),
          days ? kv("Silinen", `${days} gün mesaj`) : null,
          line(),
        ]
          .filter(Boolean)
          .join("\n")
      )
      .setFooter({ text: `Case #${modCase.id} · Aetherion` });

    await interaction.reply({ embeds: [embed] });

    await sendModLog(
      client,
      interaction.guild.id,
      buildModEmbed({
        type: "ban",
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

