import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class LeaderboardCommand extends Command {
  constructor() {
    super({
      name: "leaderboard",
      description: "Zenginlik sıralaması",
      category: "economy",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Zenginlik sıralaması")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const top = client.economy.getLeaderboard(interaction.guild.id, 10);

    if (top.length === 0) {
      await interaction.reply({ content: "Henüz ekonomi verisi yok. `/daily` veya `/work` dene.", ephemeral: true });
      return;
    }

    const medals = ["🥇", "🥈", "🥉"];
    const lines = await Promise.all(
      top.map(async (p, i) => {
        const user = await client.users.fetch(p.userId).catch(() => null);
        const name = user?.username ?? p.userId;
        const total = p.wallet + p.bank;
        const medal = medals[i] ?? `\`${i + 1}.\``;
        return `${medal} **${name}** — ${total.toLocaleString()} 💵`;
      })
    );

    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setTitle("🏆 Zenginlik Sıralaması")
      .setDescription(lines.join("\n"))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
