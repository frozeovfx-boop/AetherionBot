import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class ModstatsCommand extends Command {
  constructor() {
    super({
      name: "modstats",
      description: "Yetkili / sunucu mod istatistiği",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
      data: new SlashCommandBuilder()
        .setName("modstats")
        .setDescription("Yetkili / sunucu mod istatistiği")
        .addUserOption((o) =>
          o.setName("yetkili").setDescription("Belirli yetkili").setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const target = interaction.options.getUser("yetkili");
    const all = client.cases.getGuildCases(interaction.guild.id, 500);

    if (target) {
      const mine = all.filter((c) => c.moderatorId === target.id);
      const byType: Record<string, number> = {};
      for (const c of mine) byType[c.type] = (byType[c.type] ?? 0) + 1;
      const rows = Object.entries(byType)
        .sort((a, b) => b[1] - a[1])
        .map(([t, n]) => kv(t, code(n)));

      await interaction.reply({
        embeds: [
          baseEmbed(Theme.mod)
            .setAuthor({ name: "MODSTATS", iconURL: target.displayAvatarURL({ size: 64 }) })
            .setTitle(target.username)
            .setDescription(
              [line(), kv("Toplam işlem", code(mine.length)), line(), rows.join("\n") || "—", line()].join(
                "\n"
              )
            ),
        ],
      });
      return;
    }

    const byType: Record<string, number> = {};
    const byMod: Record<string, number> = {};
    for (const c of all) {
      byType[c.type] = (byType[c.type] ?? 0) + 1;
      byMod[c.moderatorId] = (byMod[c.moderatorId] ?? 0) + 1;
    }
    const topMods = Object.entries(byMod)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const topLines = await Promise.all(
      topMods.map(async ([id, n], i) => {
        const u = await client.users.fetch(id).catch(() => null);
        return `**${i + 1}.** ${u?.username ?? id} — ${code(n)}`;
      })
    );
    const typeLines = Object.entries(byType)
      .sort((a, b) => b[1] - a[1])
      .map(([t, n]) => kv(t, code(n)));

    await interaction.reply({
      embeds: [
        baseEmbed(Theme.mod)
          .setAuthor({ name: "MODSTATS" })
          .setTitle(interaction.guild.name)
          .setDescription(
            [
              line(),
              kv("Toplam case", code(all.length)),
              line(),
              "**Tipler**",
              typeLines.join("\n") || "—",
              line(),
              "**Top yetkili**",
              topLines.join("\n") || "—",
              line(),
            ].join("\n")
          ),
      ],
    });
  }
}
