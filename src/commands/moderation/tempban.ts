import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

function parseDuration(input: string): number | null {
  const match = input.match(/^(\d+)(s|m|h|d|w)$/i);
  if (!match) return null;
  const value = parseInt(match[1]!, 10);
  const unit = match[2]!.toLowerCase();
  const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000, w: 604_800_000 };
  return value * (multipliers[unit] ?? 0);
}

export default class TempBanCommand extends Command {
  constructor() {
    super({
      name: "tempban",
      description: "Kullanıcıyı geçici olarak yasaklar",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.BanMembers],
      clientPermissions: [PermissionFlagsBits.BanMembers],
      data: new SlashCommandBuilder()
        .setName("tempban")
        .setDescription("Kullanıcıyı geçici olarak yasaklar")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Yasaklanacak kullanıcı").setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("sure")
            .setDescription("Süre (örnek: 1h, 2d, 1w)")
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("sebep").setDescription("Sebep").setRequired(false)
        )
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
    if (!ms || ms < 60_000 || ms > 30 * 86_400_000) {
      await interaction.reply({
        content: "Geçersiz süre. Örnek: `30m`, `2h`, `1d`, `1w` (min 1 dakika, max 30 gün)",
        ephemeral: true,
      });
      return;
    }

    if (target.id === interaction.user.id || target.id === client.user?.id) {
      await interaction.reply({ content: "Geçersiz hedef.", ephemeral: true });
      return;
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (member && !member.bannable) {
      await interaction.reply({ content: "Bu kullanıcıyı yasaklayamıyorum.", ephemeral: true });
      return;
    }

    await interaction.guild.members.ban(target.id, {
      reason: `Tempban (${durationStr}) | ${reason} | Yetkili: ${interaction.user.tag}`,
    });

    // Schedule unban via simple timeout (production: use BullMQ)
    setTimeout(async () => {
      try {
        await interaction.guild?.members.unban(target.id, `Tempban süresi doldu`);
      } catch {
        // already unbanned or missing
      }
    }, ms);

    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle("Geçici Yasaklama")
      .addFields(
        { name: "Kullanıcı", value: `${target.tag} (\`${target.id}\`)`, inline: true },
        { name: "Süre", value: durationStr, inline: true },
        { name: "Yetkili", value: interaction.user.tag, inline: true },
        { name: "Sebep", value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
