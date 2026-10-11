import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class ModstatsCommand extends Command {
  constructor() {
    super({
      name: "modstats",
      description: "Yetkili istatistikleri",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
      data: new SlashCommandBuilder()
        .setName("modstats")
        .setDescription("Yetkili istatistikleri")
        .addUserOption((o) => o.setName("yetkili").setDescription("Hedef").setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const mod = interaction.options.getUser("yetkili") ?? interaction.user;
    const all = client.cases.getGuildCases(interaction.guild.id, 500).filter((c) => c.moderatorId === mod.id);

    const counts: Record<string, number> = {};
    for (const c of all) {
      counts[c.type] = (counts[c.type] ?? 0) + 1;
    }

    const rows = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, n]) => kv(type, code(n)))
      .join("\n") || "Kayıt yok.";

    const embed = baseEmbed(Theme.mod)
      .setAuthor({ name: "MODERASYON" })
      .setTitle(`İstatistik · ${mod.username}`)
      .setThumbnail(mod.displayAvatarURL({ size: 256 }))
      .setDescription([line(), rows, line(), kv("Toplam", code(all.length))].join("\n"));

    await interaction.reply({ embeds: [embed] });
  }
}
