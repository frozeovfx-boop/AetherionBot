import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, code, kv } from "../../utils/embeds.js";

export default class TimeoutCommand extends Command {
  constructor() {
    super({
      name: "timeout",
      description: "Kullanıcıya timeout uygular",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
      clientPermissions: [PermissionFlagsBits.ModerateMembers],
      data: new SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Kullanıcıya timeout uygular")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(true))
        .addIntegerOption((o) =>
          o.setName("dakika").setDescription("Süre (dakika)").setRequired(true).setMinValue(1).setMaxValue(40320)
        )
        .addStringOption((o) => o.setName("sebep").setDescription("Sebep").setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const minutes = interaction.options.getInteger("dakika", true);
    const reason = interaction.options.getString("sebep") ?? "Belirtilmedi";
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member?.moderatable) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Bu kullanıcıya timeout uygulanamaz.")],
        ephemeral: true,
      });
      return;
    }

    const duration = minutes * 60 * 1000;
    await member.timeout(duration, `${reason} · ${interaction.user.tag}`);

    const modCase = client.cases.create({
      guildId: interaction.guild.id,
      userId: target.id,
      moderatorId: interaction.user.id,
      type: "timeout",
      reason,
      duration,
    });

    const embed = baseEmbed(Theme.warning)
      .setAuthor({ name: "MODERASYON", iconURL: interaction.guild.iconURL({ size: 64 }) ?? undefined })
      .setTitle("Timeout")
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .setDescription(
        [
          line(),
          kv("Kullanıcı", target.tag),
          kv("ID", code(target.id)),
          kv("Yetkili", interaction.user.tag),
          kv("Süre", `${minutes} dakika`),
          kv("Sebep", reason),
          line(),
        ].join("\n")
      )
      .setFooter({ text: `Case #${modCase.id} · Aetherion` });

    await interaction.reply({ embeds: [embed] });
  }
}
