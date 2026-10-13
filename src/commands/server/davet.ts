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

export default class DavetCommand extends Command {
  constructor() {
    super({
      name: "davet",
      description: "Davet istatistikleri",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("davet")
        .setDescription("Davet istatistikleri")
        .addSubcommand((s) =>
          s
            .setName("bak")
            .setDescription("Davet sayısı")
            .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(false))
        )
        .addSubcommand((s) => s.setName("top").setDescription("Davet sıralaması"))
        .addSubcommand((s) =>
          s
            .setName("log")
            .setDescription("Davet log kanalı")
            .addChannelOption((o) =>
              o
                .setName("kanal")
                .setDescription("Log kanalı (boş = kapat)")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
            )
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const sub = interaction.options.getSubcommand();

    if (sub === "log") {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
        await interaction.reply({ content: "Yetkin yok.", ephemeral: true });
        return;
      }
      const ch = interaction.options.getChannel("kanal") as TextChannel | null;
      // if option omitted, Discord returns null — treat as disable only when explicitly... 
      // For simplicity: no channel = disable, with channel = set
      const provided = interaction.options.get("kanal");
      if (!provided || provided.value === null) {
        client.settings.setInviteLog(interaction.guild.id, null);
        await interaction.reply({
          embeds: [baseEmbed(Theme.mute).setDescription("Davet logu kapatıldı.")],
        });
        return;
      }
      client.settings.setInviteLog(interaction.guild.id, ch!.id);
      await interaction.reply({
        embeds: [
          baseEmbed(Theme.success)
            .setAuthor({ name: "DAVET" })
            .setDescription([line(), kv("Log", `${ch}`), line()].join("\n")),
        ],
      });
      return;
    }

    if (sub === "bak") {
      const user = interaction.options.getUser("kullanici") ?? interaction.user;
      const s = client.invites.get(interaction.guild.id, user.id);
      const net = s.joins - s.left;
      const embed = baseEmbed(Theme.primary)
        .setAuthor({ name: "DAVET", iconURL: user.displayAvatarURL({ size: 64 }) })
        .setTitle(user.username)
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .setDescription(
          [
            line(),
            kv("Toplam", code(s.joins)),
            kv("Ayrılan", code(s.left)),
            kv("Net", code(net)),
            line(),
          ].join("\n")
        );
      await interaction.reply({ embeds: [embed] });
      return;
    }

    // top
    const top = client.invites.leaderboard(interaction.guild.id, 10);
    if (!top.length) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Henüz davet verisi yok.")],
      });
      return;
    }
    const rows = await Promise.all(
      top.map(async (e, i) => {
        const u = await client.users.fetch(e.userId).catch(() => null);
        return `**${i + 1}.** ${u?.username ?? e.userId} — net ${code(e.net)} *(${e.joins} giriş)*`;
      })
    );
    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: "DAVET · TOP" })
      .setDescription([line(), rows.join("\n"), line()].join("\n"));
    await interaction.reply({ embeds: [embed] });
  }
}
