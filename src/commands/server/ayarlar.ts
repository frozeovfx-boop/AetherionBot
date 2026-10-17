import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

function ch(id: string | null): string {
  return id ? `<#${id}>` : code("—");
}

function on(v: boolean): string {
  return v ? "**Açık**" : code("kapalı");
}

/**
 * Single admin panel: all guild settings at a glance.
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

    const embed = baseEmbed(Theme.primary)
      .setAuthor({
        name: "AYARLAR",
        iconURL: interaction.guild.iconURL({ size: 64 }) ?? undefined,
      })
      .setDescription(
        [
          line(),
          "**Genel**",
          kv("Prefix", code(c.prefix)),
          kv("Premium", client.settings.isPremium(interaction.guild.id) ? "**Aktif**" : code("yok")),
          kv("Dil", code(c.locale)),
          line(),
          "**Kanallar**",
          kv("Modlog", ch(c.modlogChannelId)),
          kv("Welcome", ch(c.welcomeChannelId)),
          kv("Mesaj log", ch(c.messageLogChannelId)),
          kv("Üye log", ch(c.memberLogChannelId)),
          kv("Ses log", ch(c.voiceLogChannelId)),
          kv("Davet log", ch(c.inviteLogChannelId)),
          kv("Starboard", ch(c.starboardChannelId)),
          kv("Confession", ch(c.confessionChannelId)),
          line(),
          "**Sistem**",
          kv("Autorole", c.autoroleIds.length ? c.autoroleIds.map((id) => `<@&${id}>`).join(" ") : code("—")),
          kv("Özel oda hub", ch(c.tempVoiceHubId)),
          kv("Ticket log", ch(c.ticketLogChannelId)),
          kv("Ticket buton", code(c.ticketButtons?.length ?? 0)),
          line(),
          "**Automod**",
          kv("Davet", on(c.automodAntiInvite)),
          kv("Link", on(c.automodAntiLink)),
          kv("Spam", on(c.automodAntiSpam)),
          kv("Küfür", on(c.automodAntiBadwords)),
          kv("Mention", c.automodMaxMentions === 0 ? code("kapalı") : code(c.automodMaxMentions)),
          line(),
        ].join("\n")
      )
      .setFooter({ text: `${interaction.guild.name} · Yuta` });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
