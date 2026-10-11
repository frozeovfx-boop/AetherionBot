import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

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
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(true))
        .addStringOption((o) =>
          o.setName("sure").setDescription("Süre (30m, 2h, 7d)").setRequired(true)
        )
        .addStringOption((o) => o.setName("sebep").setDescription("Sebep").setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
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

    const modCase = client.cases.create({
      guildId: interaction.guild.id,
      userId: target.id,
      moderatorId: interaction.user.id,
      type: "ban",
      reason: `Tempban ${durationStr} · ${reason}`,
      duration: ms,
    });

    const embed = baseEmbed(Theme.mod)
      .setAuthor({ name: "MODERASYON" })
      .setTitle("Geçici Yasak")
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .setDescription(
        [
          line(),
          kv("Kullanıcı", target.tag),
          kv("ID", code(target.id)),
          kv("Süre", durationStr),
          kv("Yetkili", interaction.user.tag),
          kv("Sebep", reason),
          line(),
        ].join("\n")
      )
      .setFooter({ text: `Case #${modCase.id} · Aetherion` });

    await interaction.reply({ embeds: [embed] });

    setTimeout(async () => {
      try {
        await interaction.guild!.members.unban(target.id, "Tempban süresi doldu");
      } catch {
        /* already unbanned */
      }
    }, ms);
  }
}
