import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

const COOLDOWN = 24 * 60 * 60 * 1000;
const REWARD = 500;

export default class DailyCommand extends Command {
  constructor() {
    super({
      name: "daily",
      description: "Günlük ödülünü al",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Günlük ödülünü al")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const profile = client.economy.get(interaction.guild.id, interaction.user.id);
    const now = Date.now();

    if (profile.lastDaily && now - profile.lastDaily < COOLDOWN) {
      const remaining = COOLDOWN - (now - profile.lastDaily);
      const hours = Math.floor(remaining / 3_600_000);
      const mins = Math.floor((remaining % 3_600_000) / 60_000);
      await interaction.reply({
        content: `Günlük ödülünü zaten aldın. **${hours}s ${mins}dk** sonra tekrar dene.`,
        ephemeral: true,
      });
      return;
    }

    profile.lastDaily = now;
    client.economy.addWallet(interaction.guild.id, interaction.user.id, REWARD);

    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setTitle("Daily Ödül")
      .setDescription(`**+${REWARD.toLocaleString()}** 💵 cüzdanına eklendi.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
