import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

const CD = 7 * 24 * 60 * 60 * 1000;
const map = new Map<string, number>();
const REWARD = 2500;

export default class WeeklyCommand extends Command {
  constructor() {
    super({
      name: "weekly",
      description: "Haftalık ödül",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder().setName("weekly").setDescription("Haftalık ödül").toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const key = `${interaction.guild.id}:${interaction.user.id}`;
    const now = Date.now();
    if (map.get(key) && now - map.get(key)! < CD) {
      const days = Math.ceil((CD - (now - map.get(key)!)) / 86400000);
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription(`**${days} gün** sonra tekrar.`)],
        ephemeral: true,
      });
      return;
    }
    map.set(key, now);
    client.economy.addWallet(interaction.guild.id, interaction.user.id, REWARD);
    const p = client.economy.get(interaction.guild.id, interaction.user.id);

    const embed = baseEmbed(Theme.economy)
      .setAuthor({ name: "ECONOMY" })
      .setTitle("Haftalık Ödül")
      .setDescription(
        [
          line(),
          kv("Ödül", `**+${REWARD.toLocaleString()}** 💵`),
          kv("Cüzdan", code(p.wallet.toLocaleString())),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
