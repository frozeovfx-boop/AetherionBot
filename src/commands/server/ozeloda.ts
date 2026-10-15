import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  VoiceChannel,
  CategoryChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

/**
 * Marpel-style temp voice setup — join hub → private room.
 */
export default class OzelodaCommand extends Command {
  constructor() {
    super({
      name: "ozeloda",
      description: "Özel oda (geçici ses) sistemi",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageChannels],
      data: new SlashCommandBuilder()
        .setName("ozeloda")
        .setDescription("Özel oda (geçici ses) sistemi")
        .addSubcommand((s) =>
          s
            .setName("kur")
            .setDescription("Hub ses kanalını ayarla")
            .addChannelOption((o) =>
              o
                .setName("hub")
                .setDescription("Kullanıcıların gireceği hub kanal")
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(true)
            )
            .addChannelOption((o) =>
              o
                .setName("kategori")
                .setDescription("Odaların açılacağı kategori")
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(false)
            )
        )
        .addSubcommand((s) => s.setName("kapat").setDescription("Sistemi kapat"))
        .addSubcommand((s) => s.setName("durum").setDescription("Ayarları göster"))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const sub = interaction.options.getSubcommand();

    if (sub === "kur") {
      const hub = interaction.options.getChannel("hub", true) as VoiceChannel;
      const cat = interaction.options.getChannel("kategori") as CategoryChannel | null;
      client.settings.setTempVoice(
        interaction.guild.id,
        hub.id,
        cat?.id ?? hub.parentId
      );

      const embed = baseEmbed(Theme.success)
        .setAuthor({ name: "ÖZEL ODA" })
        .setTitle("Sistem aktif")
        .setDescription(
          [
            line(),
            kv("Hub", `${hub}`),
            kv("Kategori", cat ? `${cat.name}` : hub.parent?.name ?? "—"),
            line(),
            "Üye hub’a girince kendi odası açılır.",
            "Oda boşalınca otomatik silinir.",
          ].join("\n")
        );

      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (sub === "kapat") {
      client.settings.setTempVoice(interaction.guild.id, null, null);
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setAuthor({ name: "ÖZEL ODA" }).setDescription("Sistem kapatıldı.")],
      });
      return;
    }

    const cfg = client.settings.get(interaction.guild.id);
    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: "ÖZEL ODA" })
      .setDescription(
        [
          line(),
          kv("Hub", cfg.tempVoiceHubId ? `<#${cfg.tempVoiceHubId}>` : code("kapalı")),
          kv("Kategori", cfg.tempVoiceCategoryId ? code(cfg.tempVoiceCategoryId) : "—"),
          line(),
        ].join("\n")
      );
    await interaction.reply({ embeds: [embed] });
  }
}
