import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, code, divider } from "../../utils/embeds.js";

const COOLDOWN = 24 * 60 * 60 * 1000;
const REWARD = 500;

export default class DailyCommand extends Command {
  constructor() {
    super({
      name: "daily",
      description: "Günlük ödül",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Günlük ödül")
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
      const embed = baseEmbed(Theme.warning)
        .setTitle("⬡ Daily")
        .setDescription(`Çok erken.\nTekrar: **${hours}s ${mins}dk** sonra`);
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    profile.lastDaily = now;
    client.economy.addWallet(interaction.guild.id, interaction.user.id, REWARD);
    const p = client.economy.get(interaction.guild.id, interaction.user.id);

    const embed = baseEmbed(Theme.economy)
      .setTitle("⬡ Daily Ödül")
      .setDescription(
        [
          divider(),
          `**+${REWARD.toLocaleString()}** 💵 cüzdanına eklendi`,
          `Yeni bakiye  ${code(p.wallet.toLocaleString())}`,
          divider(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
