import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class RichCommand extends Command {
  constructor() {
    super({
      name: "rich",
      description: "En zenginler (leaderboard alias)",
      category: "economy",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder().setName("rich").setDescription("En zenginler").toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const top = client.economy.getLeaderboard(interaction.guild.id, 10);
    if (!top.length) {
      await interaction.reply({ content: "Veri yok.", ephemeral: true });
      return;
    }
    const lines = await Promise.all(top.map(async (p, i) => {
      const u = await client.users.fetch(p.userId).catch(() => null);
      return `**${i + 1}.** ${u?.username ?? p.userId} — ${(p.wallet + p.bank).toLocaleString()} 💵`;
    }));
    const embed = new EmbedBuilder().setColor(0xfee75c).setTitle("💰 En Zenginler").setDescription(lines.join("\n")).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
