import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, code, kv } from "../../utils/embeds.js";
import { buildModEmbed, sendModLog } from "../../utils/modlog.js";

export default class SoftbanCommand extends Command {
  constructor() {
    super({
      name: "softban",
      description: "Ban + anında unban (mesaj temizliği)",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.BanMembers],
      clientPermissions: [PermissionFlagsBits.BanMembers],
      data: new SlashCommandBuilder()
        .setName("softban")
        .setDescription("Ban + anında unban (mesaj temizliği)")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(true))
        .addStringOption((o) => o.setName("sebep").setDescription("Sebep").setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const reason = interaction.options.getString("sebep") ?? "Softban";

    try {
      await interaction.guild.members.ban(target.id, {
        deleteMessageSeconds: 86_400 * 7,
        reason: `Softban · ${reason} · ${interaction.user.tag}`,
      });
      await interaction.guild.members.unban(target.id, "Softban complete");
    } catch {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Softban başarısız.")],
        ephemeral: true,
      });
      return;
    }

    const modCase = client.cases.create({
      guildId: interaction.guild.id,
      userId: target.id,
      moderatorId: interaction.user.id,
      type: "softban",
      reason,
    });

    const embed = baseEmbed(Theme.warning)
      .setAuthor({ name: "MODERASYON" })
      .setTitle("Softban")
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
        type: "softban",
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
