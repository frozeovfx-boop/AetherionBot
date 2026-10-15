import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
  ChannelType,
  Role,
  CategoryChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class TicketSetupCommand extends Command {
  constructor() {
    super({
      name: "ticket-setup",
      description: "Ticket sistemi kurulumu",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuild],
      data: new SlashCommandBuilder()
        .setName("ticket-setup")
        .setDescription("Ticket sistemi kurulumu")
        .addSubcommand((s) =>
          s
            .setName("panel")
            .setDescription("Ticket paneli gönder")
            .addChannelOption((o) =>
              o
                .setName("kanal")
                .setDescription("Panel kanalı")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
            )
            .addStringOption((o) =>
              o.setName("baslik").setDescription("Panel başlığı").setRequired(false)
            )
            .addStringOption((o) =>
              o.setName("aciklama").setDescription("Panel yazısı").setRequired(false)
            )
        )
        .addSubcommand((s) =>
          s
            .setName("ayar")
            .setDescription("Kategori / destek rolü / log")
            .addChannelOption((o) =>
              o
                .setName("kategori")
                .setDescription("Ticket kanallarının kategorisi")
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(false)
            )
            .addRoleOption((o) =>
              o.setName("destek").setDescription("Destek ekibi rolü").setRequired(false)
            )
            .addChannelOption((o) =>
              o
                .setName("log")
                .setDescription("Transcript / kapanış log kanalı")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
            )
        )
        .addSubcommand((s) => s.setName("durum").setDescription("Ticket ayarları"))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const sub = interaction.options.getSubcommand();

    if (sub === "ayar") {
      const cat = interaction.options.getChannel("kategori") as CategoryChannel | null;
      const role = interaction.options.getRole("destek") as Role | null;
      const log = interaction.options.getChannel("log") as TextChannel | null;
      const patch: {
        ticketCategoryId?: string | null;
        ticketSupportRoleId?: string | null;
        ticketLogChannelId?: string | null;
      } = {};
      if (cat) patch.ticketCategoryId = cat.id;
      if (role) patch.ticketSupportRoleId = role.id;
      if (log) patch.ticketLogChannelId = log.id;
      if (Object.keys(patch).length) client.settings.setTicket(interaction.guild.id, patch);
    }

    if (sub === "panel") {
      const channel = interaction.options.getChannel("kanal", true) as TextChannel;
      const title = interaction.options.getString("baslik") ?? "Destek";
      const desc =
        interaction.options.getString("aciklama") ??
        "Sorununu iletmek için ticket aç. Her kullanıcıda tek açık ticket bulunur.";

      const embed = baseEmbed(Theme.primary)
        .setAuthor({
          name: "TICKET",
          iconURL: interaction.guild.iconURL({ size: 64 }) ?? undefined,
        })
        .setTitle(title.slice(0, 200))
        .setDescription([line(), desc.slice(0, 1000), line()].join("\n"))
        .setFooter({ text: "Yuta" });

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_create")
          .setLabel("Ticket Aç")
          .setStyle(ButtonStyle.Primary)
      );

      await channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({
        embeds: [
          baseEmbed(Theme.success)
            .setAuthor({ name: "TICKET" })
            .setDescription(`Panel ${channel} kanalına gönderildi.`),
        ],
        ephemeral: true,
      });
      return;
    }

    const cfg = client.settings.get(interaction.guild.id);
    await interaction.reply({
      embeds: [
        baseEmbed(Theme.primary)
          .setAuthor({ name: "TICKET" })
          .setDescription(
            [
              line(),
              kv("Kategori", cfg.ticketCategoryId ? code(cfg.ticketCategoryId) : code("yok")),
              kv(
                "Destek rolü",
                cfg.ticketSupportRoleId ? `<@&${cfg.ticketSupportRoleId}>` : code("yok")
              ),
              kv(
                "Log",
                cfg.ticketLogChannelId ? `<#${cfg.ticketLogChannelId}>` : code("yok")
              ),
              line(),
            ].join("\n")
          ),
      ],
      ephemeral: sub === "durum",
    });
  }
}
