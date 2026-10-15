import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class LogsetCommand extends Command {
  constructor() {
    super({
      name: "logset",
      description: "Gelişmiş log kanalları",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuild],
      data: new SlashCommandBuilder()
        .setName("logset")
        .setDescription("Gelişmiş log kanalları")
        .addSubcommand((s) =>
          s
            .setName("mesaj")
            .setDescription("Mesaj silme / düzenleme logu")
            .addChannelOption((o) =>
              o
                .setName("kanal")
                .setDescription("Kanal (boş = kapat)")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
            )
        )
        .addSubcommand((s) =>
          s
            .setName("uye")
            .setDescription("Rol / nick logu")
            .addChannelOption((o) =>
              o
                .setName("kanal")
                .setDescription("Kanal (boş = kapat)")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
            )
        )
        .addSubcommand((s) =>
          s
            .setName("ses")
            .setDescription("Ses kanalı giriş / çıkış logu")
            .addChannelOption((o) =>
              o
                .setName("kanal")
                .setDescription("Kanal (boş = kapat)")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
            )
        )
        .addSubcommand((s) => s.setName("durum").setDescription("Log ayarlarını göster"))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const sub = interaction.options.getSubcommand();

    if (sub === "durum") {
      const cfg = client.settings.get(interaction.guild.id);
      const embed = baseEmbed(Theme.primary)
        .setAuthor({ name: "LOG" })
        .setDescription(
          [
            line(),
            kv("Mesaj", cfg.messageLogChannelId ? `<#${cfg.messageLogChannelId}>` : code("kapalı")),
            kv("Üye", cfg.memberLogChannelId ? `<#${cfg.memberLogChannelId}>` : code("kapalı")),
            kv("Ses", cfg.voiceLogChannelId ? `<#${cfg.voiceLogChannelId}>` : code("kapalı")),
            kv("Mod", cfg.modlogChannelId ? `<#${cfg.modlogChannelId}>` : code("kapalı")),
            kv("Davet", cfg.inviteLogChannelId ? `<#${cfg.inviteLogChannelId}>` : code("kapalı")),
            line(),
          ].join("\n")
        );
      await interaction.reply({ embeds: [embed] });
      return;
    }

    const ch = interaction.options.getChannel("kanal") as TextChannel | null;
    const id = ch?.id ?? null;

    if (sub === "mesaj") client.settings.setMessageLog(interaction.guild.id, id);
    if (sub === "uye") client.settings.setMemberLog(interaction.guild.id, id);
    if (sub === "ses") client.settings.setVoiceLog(interaction.guild.id, id);

    const embed = baseEmbed(id ? Theme.success : Theme.mute)
      .setAuthor({ name: "LOG" })
      .setDescription(
        [
          line(),
          kv("Tip", sub),
          kv("Kanal", ch ? `${ch}` : "Kapalı"),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
