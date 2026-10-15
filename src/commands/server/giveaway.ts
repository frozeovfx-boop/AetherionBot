import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { randomBytes } from "node:crypto";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";
import { endGiveaway } from "../../utils/giveawayEnd.js";

function parseDuration(input: string): number | null {
  const match = input.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const value = parseInt(match[1]!, 10);
  const unit = match[2]!.toLowerCase();
  const map: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * (map[unit] ?? 0);
}

export default class GiveawayCommand extends Command {
  constructor() {
    super({
      name: "giveaway",
      description: "Çekiliş sistemi",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuild],
      data: new SlashCommandBuilder()
        .setName("giveaway")
        .setDescription("Çekiliş sistemi")
        .addSubcommand((s) =>
          s
            .setName("baslat")
            .setDescription("Çekiliş başlat")
            .addStringOption((o) => o.setName("odul").setRequired(true).setDescription("Ödül"))
            .addStringOption((o) =>
              o.setName("sure").setRequired(true).setDescription("30m, 2h, 1d")
            )
            .addIntegerOption((o) =>
              o
                .setName("kazanan")
                .setDescription("Kazanan sayısı")
                .setMinValue(1)
                .setMaxValue(20)
                .setRequired(false)
            )
        )
        .addSubcommand((s) =>
          s
            .setName("bitir")
            .setDescription("Çekilişi şimdi bitir")
            .addStringOption((o) =>
              o.setName("mesaj_id").setDescription("Çekiliş mesaj ID").setRequired(true)
            )
        )
        .addSubcommand((s) =>
          s
            .setName("yeniden")
            .setDescription("Kazananı yeniden seç")
            .addStringOption((o) =>
              o.setName("mesaj_id").setDescription("Çekiliş mesaj ID").setRequired(true)
            )
        )
        .addSubcommand((s) => s.setName("liste").setDescription("Aktif çekilişler"))
        .addSubcommand((s) =>
          s
            .setName("sans-rol")
            .setDescription("Şanslı rol ayarla")
            .addRoleOption((o) => o.setName("rol").setRequired(true))
            .addNumberOption((o) =>
              o
                .setName("carpan")
                .setDescription("1.5 = %50 daha şanslı, 2 = 2 kat (1=kaldır)")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(10)
            )
        )
        .addSubcommand((s) => s.setName("sans-liste").setDescription("Şanslı roller"))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild || !interaction.channel) return;
    const sub = interaction.options.getSubcommand();


    if (sub === "sans-liste") {
      const luck = client.settings.get(interaction.guild.id).giveawayLuck;
      const entries = Object.entries(luck);
      await interaction.reply({
        embeds: [
          baseEmbed(Theme.economy)
            .setAuthor({ name: "GIVEAWAY · ŞANS" })
            .setDescription(
              [
                line(),
                entries.length
                  ? entries.map(([rid, w]) => `<@&${rid}> · **×${w}**`).join("\n")
                  : "Şanslı rol yok.",
                line(),
                "Üyeler `/sans` ile kendi oranını görür.",
              ].join("\n")
            ),
        ],
        ephemeral: true,
      });
      return;
    }

    if (sub === "sans-rol") {
      const role = interaction.options.getRole("rol", true);
      const carpan = interaction.options.getNumber("carpan", true);
      if (carpan <= 1) {
        client.settings.setGiveawayLuck(interaction.guild.id, role.id, null);
        await interaction.reply({
          embeds: [
            baseEmbed(Theme.mute)
              .setAuthor({ name: "GIVEAWAY · ŞANS" })
              .setDescription(`${role} şanslı listeden çıkarıldı.`),
          ],
        });
        return;
      }
      client.settings.setGiveawayLuck(interaction.guild.id, role.id, carpan);
      await interaction.reply({
        embeds: [
          baseEmbed(Theme.success)
            .setAuthor({ name: "GIVEAWAY · ŞANS" })
            .setDescription(
              [line(), kv("Rol", `${role}`), kv("Çarpan", `**×${carpan}**`), line()].join("\n")
            ),
        ],
      });
      return;
    }

    if (sub === "liste") {
      const active = client.giveaways.active().filter((g) => g.guildId === interaction.guild!.id);
      if (!active.length) {
        await interaction.reply({
          embeds: [baseEmbed(Theme.mute).setDescription("Aktif çekiliş yok.")],
          ephemeral: true,
        });
        return;
      }
      const rows = active.map(
        (g) =>
          `${code(g.messageId)} · ${g.prize} · bitiş <t:${Math.floor(g.endsAt / 1000)}:R>`
      );
      await interaction.reply({
        embeds: [
          baseEmbed(Theme.primary)
            .setAuthor({ name: "GIVEAWAY" })
            .setDescription([line(), rows.join("\n"), line()].join("\n")),
        ],
        ephemeral: true,
      });
      return;
    }

    if (sub === "bitir" || sub === "yeniden") {
      const messageId = interaction.options.getString("mesaj_id", true);
      const g =
        client.giveaways.getByMessage(messageId) ??
        client.giveaways.get(messageId);
      if (!g || g.guildId !== interaction.guild.id) {
        await interaction.reply({
          embeds: [baseEmbed(Theme.warning).setDescription("Çekiliş bulunamadı.")],
          ephemeral: true,
        });
        return;
      }
      if (sub === "bitir" && g.ended) {
        await interaction.reply({
          embeds: [baseEmbed(Theme.mute).setDescription("Zaten bitmiş.")],
          ephemeral: true,
        });
        return;
      }
      // reroll: allow ended
      if (sub === "yeniden") {
        g.ended = false;
      }
      await interaction.reply({
        embeds: [baseEmbed(Theme.success).setDescription(sub === "bitir" ? "Bitiriliyor…" : "Yeniden seçiliyor…")],
        ephemeral: true,
      });
      await endGiveaway(client, g, sub === "yeniden");
      return;
    }

    // baslat
    const prize = interaction.options.getString("odul", true);
    const durationStr = interaction.options.getString("sure", true);
    const winners = interaction.options.getInteger("kazanan") ?? 1;
    const ms = parseDuration(durationStr);

    if (!ms || ms < 10_000 || ms > 30 * 86_400_000) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Geçersiz süre. Örnek: `30m` `2h` `1d`")],
        ephemeral: true,
      });
      return;
    }

    const endsAt = Date.now() + ms;
    const id = randomBytes(4).toString("hex");

    const embed = baseEmbed(Theme.economy)
      .setAuthor({ name: "GIVEAWAY" })
      .setTitle("Çekiliş")
      .setDescription(
        [
          line(),
          kv("Ödül", prize),
          kv("Kazanan", `${winners} kişi`),
          kv("Bitiş", `<t:${Math.floor(endsAt / 1000)}:R>`),
          line(),
          "Katılmak için 🎉 tepkisine tıkla.",
          Object.keys(client.settings.get(interaction.guild.id).giveawayLuck).length
            ? "Şanslı roller ağırlıklı seçilir · `/sans`"
            : null,
        ]
          .filter(Boolean)
          .join("\n")
      )
      .setFooter({ text: `ID ${id} · ${interaction.user.tag}` })
      .setTimestamp(endsAt);

    await interaction.reply({
      embeds: [baseEmbed(Theme.success).setDescription("Çekiliş başlatıldı.")],
      ephemeral: true,
    });

    const channel = interaction.channel as TextChannel;
    const msg = await channel.send({ embeds: [embed] });
    await msg.react("🎉");

    const data = {
      id,
      guildId: interaction.guild.id,
      channelId: channel.id,
      messageId: msg.id,
      prize,
      winnersCount: winners,
      endsAt,
      hostId: interaction.user.id,
      ended: false,
    };
    client.giveaways.create(data);
    client.giveaways.schedule(id, ms, () => {
      void endGiveaway(client, data, false);
    });
  }
}
