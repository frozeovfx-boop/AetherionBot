import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, code, kv, yutaOk } from "../../utils/embeds.js";
import { FREE_LIMITS, isGuildPremium } from "../../utils/premium.js";

function ch(id: string | null | undefined): string {
  return id ? `<#${id}>` : code("—");
}

function role(id: string | null | undefined): string {
  return id ? `<@&${id}>` : code("—");
}

function on(v: boolean): string {
  return v ? "**Açık**" : code("kapalı");
}

/**
 * Single admin glance: spine status + what is still missing.
 */
export default class AyarlarCommand extends Command {
  constructor() {
    super({
      name: "ayarlar",
      description: "Sunucu ayar özeti",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuild],
      data: new SlashCommandBuilder()
        .setName("ayarlar")
        .setDescription("Sunucu ayar özeti")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const c = client.settings.get(interaction.guild.id);
    const prem = isGuildPremium(client, interaction.guild.id);
    const premUntil =
      c.premiumUntil > Date.now()
        ? `<t:${Math.floor(c.premiumUntil / 1000)}:D>`
        : code("yok");

    const missing: string[] = [];
    if (!c.ticketCategoryId && !(c.ticketButtons?.length > 0)) missing.push("`/ticket-setup`");
    if (!c.modlogChannelId) missing.push("`/logset mod`");
    if (!c.messageLogChannelId) missing.push("`/logset mesaj`");
    if (!c.welcomeChannelId) missing.push("`/setwelcome kanal`");
    if (!c.automodAntiInvite && !c.automodAntiLink && !c.automodAntiSpam && !c.automodAntiBadwords) {
      missing.push("`/automod`");
    }

    const genel = [
      kv("Prefix", code(c.prefix)),
      kv("Dil", code(c.locale || "tr")),
      kv("Premium", prem ? `**Aktif** · ${premUntil}` : code("free")),
      !prem
        ? kv("AI limit/gün", `ask ${FREE_LIMITS.ask} · debate ${FREE_LIMITS.conseil_debate}`)
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const log = [
      kv("Mod", ch(c.modlogChannelId)),
      kv("Mesaj", ch(c.messageLogChannelId)),
      kv("Üye", ch(c.memberLogChannelId)),
      kv("Ses", ch(c.voiceLogChannelId)),
      kv("Davet", ch(c.inviteLogChannelId)),
    ].join("\n");

    const ticket = [
      kv("Kategori", ch(c.ticketCategoryId)),
      kv("Destek", role(c.ticketSupportRoleId)),
      kv("Log", ch(c.ticketLogChannelId)),
      kv("Buton", code(String(c.ticketButtons?.length ?? 0))),
    ].join("\n");

    const welcome = [
      kv("Kanal", ch(c.welcomeChannelId)),
      kv("Mesaj", code((c.welcomeMessage || "—").slice(0, 48))),
    ].join("\n");

    const automod = [
      kv("Davet", on(c.automodAntiInvite)),
      kv("Link", on(c.automodAntiLink)),
      kv("Spam", on(c.automodAntiSpam)),
      kv("Küfür", on(c.automodAntiBadwords)),
      kv("Mention", c.automodMaxMentions === 0 ? code("kapalı") : code(c.automodMaxMentions)),
    ].join("\n");

    const diger = [
      kv("Autorole", c.autoroleIds.length ? c.autoroleIds.map((id) => `<@&${id}>`).join(" ") : code("—")),
      kv("Özel oda", ch(c.tempVoiceHubId)),
    ].join("\n");

    const embed = baseEmbed(Theme.primary)
      .setAuthor({
        name: "Yuta · Ayarlar",
        iconURL: interaction.guild.iconURL({ size: 64 }) ?? undefined,
      })
      .setThumbnail(interaction.guild.iconURL({ size: 128 }))
      .addFields(
        { name: "Genel", value: genel, inline: true },
        { name: "Log", value: log, inline: true },
        { name: "Ticket", value: ticket, inline: false },
        { name: "Welcome", value: welcome, inline: true },
        { name: "Automod", value: automod, inline: true },
        { name: "Diğer", value: diger, inline: false }
      )
      .setFooter({ text: `${interaction.guild.name} · Yuta · v1` });

    if (missing.length) {
      embed.addFields({
        name: "Eksik kurulum",
        value: missing.slice(0, 6).join(" · "),
        inline: false,
      });
    } else {
      embed.addFields({
        name: "Omurga",
        value: "Temel kurulum tamam — `/help` → Kurulum ile detay.",
        inline: false,
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
