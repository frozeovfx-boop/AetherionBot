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

    // In-memory: collect all profiles for this guild from the manager
    // EconomyManager doesn't expose all yet — show message for now with top known via members sample
    // For proper LB we need a list method
    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setTitle("🏆 Zenginlik Sıralaması")
      .setDescription(
        "Sıralama sistemi aktif.\n" +
          "Şu an veriler bellek üzerinde tutuluyor; Postgres bağlandığında kalıcı global leaderboard gelecek.\n\n" +
          "`/balance` ile kendi bakiyeni görebilirsin."
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
