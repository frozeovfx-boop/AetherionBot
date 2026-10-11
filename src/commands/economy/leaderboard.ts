import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, code } from "../../utils/embeds.js";

export default class LeaderboardCommand extends Command {
  constructor() {
    super({
      name: "leaderboard",
      description: "Zenginlik sıralaması",
      category: "economy",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder().setName("leaderboard").setDescription("Zenginlik sıralaması").toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const top = client.economy.getLeaderboard(interaction.guild.id, 10);
    if (top.length === 0) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Henüz ekonomi verisi yok.")],
        ephemeral: true,
      });
      return;
    }

    const medals = ["①", "②", "③"];
    const lines = await Promise.all(
      top.map(async (p, i) => {
        const user = await client.users.fetch(p.userId).catch(() => null);
        const name = user?.username ?? p.userId;
        const total = p.wallet + p.bank;
        const rank = medals[i] ?? `${i + 1}.`;
        return `${rank}  **${name}**\n　　${code(total.toLocaleString())} 💵`;
      })
    );

    const embed = baseEmbed(Theme.economy)
      .setAuthor({ name: "ECONOMY" })
      .setTitle("Sıralama")
      .setDescription([line(), lines.join("\n\n"), line()].join("\n"))
      .setFooter({ text: `${interaction.guild.name} · Aetherion` });

    await interaction.reply({ embeds: [embed] });
  }
}
