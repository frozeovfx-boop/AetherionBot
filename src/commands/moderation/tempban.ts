import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";
import { liftTempban } from "../../utils/tempbanResume.js";

function parseDuration(input: string): number | null {
  const match = input.match(/^(\d+)(m|h|d)$/i);
  if (!match) return null;
  const value = parseInt(match[1]!, 10);
  const unit = match[2]!.toLowerCase();
  const map: Record<string, number> = { m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * (map[unit] ?? 0);
}

export default class TempbanCommand extends Command {
  constructor() {
    super({
      name: "tempban",
      description: "Geçici yasaklama",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.BanMembers],
      clientPermissions: [PermissionFlagsBits.BanMembers],
      data: new SlashCommandBuilder()
        .setName("tempban")
        .setDescription("Geçici yasaklama")
        .addUserOption((o) => o.setName("kullanici").setDescription("kullanici").setRequired(true))
        .addStringOption((o) =>
          o.setName("sure").setDescription("30m, 2h, 7d").setRequired(true)
        )
        .addStringOption((o) => o.setName("sebep").setDescription("sebep").setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const durationStr = interaction.options.getString("sure", true);
    const reason = interaction.options.getString("sebep") ?? "Tempban";
    const ms = parseDuration(durationStr);

    if (!ms || ms < 60_000 || ms > 28 * 86_400_000) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Geçersiz süre. Örnek: `30m` `2h` `7d`")],
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.guild.members.ban(target.id, {
        reason: `Tempban ${durationStr} · ${reason} · ${interaction.user.tag}`,
      });
    } catch {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Yasaklanamadı.")],
        ephemeral: true,
      });
      return;
    }

    const expiresAt = Date.now() + ms;
    const modCase = client.cases.create({
      guildId: interaction.guild.id,
      userId: target.id,
      moderatorId: interaction.user.id,
      type: "ban",
      reason: `Tempban ${durationStr} · ${reason}`,
      duration: ms,
    });
    client.cases.setExpires(interaction.guild.id, modCase.id, expiresAt);

    client.tempbans.add({
      guildId: interaction.guild.id,
      userId: target.id,
      moderatorId: interaction.user.id,
      reason,
      expiresAt,
      caseId: modCase.id,
    });
    const key = `${interaction.guild.id}:${target.id}`;
    client.tempbans.schedule(key, ms, () => {
      void liftTempban(client, interaction.guild!.id, target.id);
    });

    await interaction.reply({
      embeds: [
        baseEmbed(Theme.mod)
          .setAuthor({ name: "MODERASYON" })
          .setTitle("Geçici Yasak")
          .setThumbnail(target.displayAvatarURL({ size: 256 }))
          .setDescription(
            [
              line(),
              kv("Kullanıcı", target.tag),
              kv("ID", code(target.id)),
              kv("Süre", durationStr),
              kv("Bitiş", `<t:${Math.floor(expiresAt / 1000)}:R>`),
              kv("Yetkili", interaction.user.tag),
              kv("Sebep", reason),
              line(),
            ].join("\n")
          )
          .setFooter({ text: `Case #${modCase.id} · Yuta` }),
      ],
    });
  }
}
