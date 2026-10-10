import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

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

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const key = `${interaction.guild.id}:${interaction.user.id}`;
    const now = Date.now();
    if (map.get(key) && now - map.get(key)! < CD) {
      const left = CD - (now - map.get(key)!);
      const days = Math.ceil(left / 86400000);
      await interaction.reply({ content: `**${days} gün** sonra tekrar alabilirsin.`, ephemeral: true });
      return;
    }
    map.set(key, now);
    client.economy.addWallet(interaction.guild.id, interaction.user.id, REWARD);
    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setDescription(`Haftalık ödül: **+${REWARD.toLocaleString()}** 💵`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
