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
import { randomBytes } from "node:crypto";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import type { TicketButton } from "../../database/GuildSettings.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

const STYLE_MAP: Record<TicketButton["style"], ButtonStyle> = {
  Primary: ButtonStyle.Primary,
  Secondary: ButtonStyle.Secondary,
  Success: ButtonStyle.Success,
  Danger: ButtonStyle.Danger,
};

function styleLabel(s: string): string {
  const map: Record<string, string> = {
    Primary: "Mavi",
    Secondary: "Gri",
    Success: "Yeşil",
    Danger: "Kırmızı",
  };
  return map[s] ?? s;
}

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
                .setName("kategori").setDescription("Kategori")
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(false)
            )
            .addRoleOption((o) => o.setName("destek").setDescription("Destek rolü").setRequired(false))
            .addChannelOption((o) =>
              o
                .setName("log").setDescription("Log kanalı")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
            )
        )
        .addSubcommand((s) =>
          s
            .setName("buton-ekle")
            .setDescription("Panele özel buton ekle")
            .addStringOption((o) =>
              o.setName("yazi").setDescription("Buton yazısı (Destek, Rapor…)").setRequired(true)
            )
            .addStringOption((o) =>
              o
                .setName("renk")
                .setDescription("Klasik Discord rengi")
                .setRequired(true)
                .addChoices(
                  { name: "Mavi (Primary)", value: "Primary" },
                  { name: "Gri (Secondary)", value: "Secondary" },
                  { name: "Yeşil (Success)", value: "Success" },
                  { name: "Kırmızı (Danger)", value: "Danger" }
                )
            )
            .addStringOption((o) =>
              o
                .setName("aciklama")
                .setDescription("Ticket açılınca gösterilecek kısa not")
                .setRequired(false)
            )
            .addRoleOption((o) =>
              o
                .setName("destek")
                .setDescription("Bu türe özel destek rolü")
                .setRequired(false)
            )
        )
        .addSubcommand((s) =>
          s
            .setName("buton-rol")
            .setDescription("Mevcut butona destek rolü bağla")
            .addStringOption((o) =>
              o.setName("id").setDescription("Buton ID").setRequired(true)
            )
            .addRoleOption((o) =>
              o.setName("destek").setDescription("Rol (boş = kaldır)").setRequired(false)
            )
        )
        .addSubcommand((s) =>
          s
            .setName("buton-sil")
            .setDescription("Buton sil")
            .addStringOption((o) =>
              o.setName("id").setDescription("Buton ID (liste ile bak)").setRequired(true)
            )
        )
        .addSubcommand((s) => s.setName("buton-liste").setDescription("Kayıtlı butonlar"))
        .addSubcommand((s) => s.setName("durum").setDescription("Ticket ayarları"))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const sub = interaction.options.getSubcommand();
    const gid = interaction.guild.id;

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
      if (Object.keys(patch).length) client.settings.setTicket(gid, patch);
    }

    if (sub === "buton-ekle") {
      const label = interaction.options.getString("yazi", true).slice(0, 80);
      const style = interaction.options.getString("renk", true) as TicketButton["style"];
      const description = interaction.options.getString("aciklama")?.slice(0, 200);
      const destek = interaction.options.getRole("destek");
      const buttons = [...client.settings.get(gid).ticketButtons];
      if (buttons.length >= 5) {
        await interaction.reply({
          embeds: [baseEmbed(Theme.warning).setDescription("En fazla 5 buton (Discord satır limiti).")],
          ephemeral: true,
        });
        return;
      }
      let id =
        label
          .toLowerCase()
          .replace(/[^a-z0-9ğüşıöç]/gi, "")
          .slice(0, 12) || randomBytes(2).toString("hex");
      if (buttons.some((b) => b.id === id)) {
        id = `${id}-${randomBytes(1).toString("hex")}`;
      }
      buttons.push({
        id,
        label,
        style,
        description: description ?? undefined,
        supportRoleId: destek?.id,
      });
      client.settings.setTicketButtons(gid, buttons);
    }

    if (sub === "buton-rol") {
      const id = interaction.options.getString("id", true);
      const destek = interaction.options.getRole("destek");
      const buttons = [...client.settings.get(gid).ticketButtons];
      const idx = buttons.findIndex((b) => b.id === id);
      if (idx < 0) {
        await interaction.reply({
          embeds: [baseEmbed(Theme.warning).setDescription("Buton bulunamadı. `/ticket-setup buton-liste`")],
          ephemeral: true,
        });
        return;
      }
      const b = { ...buttons[idx]! };
      if (destek) b.supportRoleId = destek.id;
      else delete b.supportRoleId;
      buttons[idx] = b;
      client.settings.setTicketButtons(gid, buttons);
    }

    if (sub === "buton-sil") {
      const id = interaction.options.getString("id", true);
      const buttons = client.settings.get(gid).ticketButtons.filter((b) => b.id !== id);
      if (buttons.length === client.settings.get(gid).ticketButtons.length) {
        await interaction.reply({
          embeds: [baseEmbed(Theme.warning).setDescription("Buton bulunamadı.")],
          ephemeral: true,
        });
        return;
      }
      if (buttons.length === 0) {
        client.settings.setTicketButtons(gid, [
          { id: "destek", label: "Destek", style: "Primary" },
        ]);
      } else {
        client.settings.setTicketButtons(gid, buttons);
      }
    }

    if (sub === "buton-liste") {
      const buttons = client.settings.get(gid).ticketButtons;
      const rows = buttons.map(
        (b) =>
          `${code(b.id)} · **${b.label}** · ${styleLabel(b.style)}${
            b.supportRoleId ? ` · <@&${b.supportRoleId}>` : ""
          }${b.description ? ` — ${b.description}` : ""}`
      );
      await interaction.reply({
        embeds: [
          baseEmbed(Theme.primary)
            .setAuthor({ name: "TICKET · BUTONLAR" })
            .setDescription([line(), rows.join("\n") || "Yok", line()].join("\n")),
        ],
        ephemeral: true,
      });
      return;
    }

    if (sub === "panel") {
      const channel = interaction.options.getChannel("kanal", true) as TextChannel;
      const title = interaction.options.getString("baslik") ?? "Destek";
      const desc =
        interaction.options.getString("aciklama") ??
        "İhtiyacına uygun butona tıkla. Her kullanıcıda tek açık ticket.";

      let buttons = client.settings.get(gid).ticketButtons;
      if (!buttons.length) {
        buttons = [{ id: "destek", label: "Destek", style: "Primary" }];
      }

      const embed = baseEmbed(Theme.primary)
        .setAuthor({
          name: "TICKET",
          iconURL: interaction.guild.iconURL({ size: 64 }) ?? undefined,
        })
        .setTitle(title.slice(0, 200))
        .setDescription(
          [
            line(),
            desc.slice(0, 800),
            line(),
            buttons.map((b) => `• **${b.label}**${b.description ? ` — ${b.description}` : ""}`).join("\n"),
            line(),
          ].join("\n")
        )
        .setFooter({ text: "Yuta" });

      const row = new ActionRowBuilder<ButtonBuilder>();
      for (const b of buttons.slice(0, 5)) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`ticket_create:${b.id}`)
            .setLabel(b.label.slice(0, 80))
            .setStyle(STYLE_MAP[b.style] ?? ButtonStyle.Primary)
        );
      }

      await channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({
        embeds: [
          baseEmbed(Theme.success)
            .setAuthor({ name: "TICKET" })
            .setDescription(`Panel ${channel} · **${buttons.length}** buton`),
        ],
        ephemeral: true,
      });
      return;
    }

    const cfg = client.settings.get(gid);
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
              kv("Butonlar", code(cfg.ticketButtons.length)),
              line(),
              cfg.ticketButtons
                .map((b) => `• ${b.label} (${styleLabel(b.style)})`)
                .join("\n") || "—",
            ].join("\n")
          ),
      ],
      ephemeral: sub === "durum",
    });
  }
}
