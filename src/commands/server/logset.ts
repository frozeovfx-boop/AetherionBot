import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { code, kv, yutaOk } from "../../utils/embeds.js";

export default class LogsetCommand extends Command {
  constructor() {
    super({
      name: "logset",
      description: "Log kanalları",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuild],
      data: new SlashCommandBuilder()
        .setName("logset")
        .setDescription("Log kanalları")
        .addSubcommand((s) =>
          s
            .setName("mesaj")
            .setDescription("Mesaj silme / düzenleme")
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
            .setDescription("Rol / nick değişimi")
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
            .setDescription("Ses giriş / çıkış")
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
            .setName("mod")
            .setDescription("Moderasyon logu (ban/warn/kick…)")
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
            .setName("davet")
            .setDescription("Davet kullanım logu")
            .addChannelOption((o) =>
              o
                .setName("kanal")
                .setDescription("Kanal (boş = kapat)")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
            )
        )
        .addSubcommand((s) => s.setName("durum").setDescription("Tüm log kanalları"))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const sub = interaction.options.getSubcommand();
    const gid = interaction.guild.id;

    if (sub === "durum") {
      const cfg = client.settings.get(gid);
      const ch = (id: string | null) => (id ? `<#${id}>` : code("kapalı"));
      await interaction.reply({
        embeds: [
          yutaOk(
            "Log durumu",
            [
              kv("Mesaj", ch(cfg.messageLogChannelId)),
              kv("Üye", ch(cfg.memberLogChannelId)),
              kv("Ses", ch(cfg.voiceLogChannelId)),
              kv("Mod", ch(cfg.modlogChannelId)),
              kv("Davet", ch(cfg.inviteLogChannelId)),
            ].join("\n")
          ),
        ],
      });
      return;
    }

    const channel = interaction.options.getChannel("kanal") as TextChannel | null;
    const id = channel?.id ?? null;

    if (sub === "mesaj") client.settings.setMessageLog(gid, id);
    else if (sub === "uye") client.settings.setMemberLog(gid, id);
    else if (sub === "ses") client.settings.setVoiceLog(gid, id);
    else if (sub === "mod") client.settings.setModlog(gid, id);
    else if (sub === "davet") client.settings.setInviteLog(gid, id);

    const labels: Record<string, string> = {
      mesaj: "Mesaj log",
      uye: "Üye log",
      ses: "Ses log",
      mod: "Mod log",
      davet: "Davet log",
    };

    await interaction.reply({
      embeds: [
        yutaOk(
          labels[sub] ?? "Log",
          [kv("Kanal", channel ? `${channel}` : code("kapalı")), kv("Durum", id ? "**Açık**" : code("Kapalı"))].join(
            "\n"
          )
        ),
      ],
    });
  }
}
