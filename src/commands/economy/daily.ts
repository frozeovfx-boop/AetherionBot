import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, code, divider } from "../../utils/embeds.js";
import { tg } from "../../i18n/index.js";

const COOLDOWN = 24 * 60 * 60 * 1000;
const REWARD = 500;

export default class DailyCommand extends Command {
  constructor() {
    super({
      name: "daily",
      description: "Günlük ödül / Daily reward",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Daily reward")
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const gid = interaction.guild.id;
    const profile = client.economy.get(gid, interaction.user.id);
    const now = Date.now();

    if (profile.lastDaily && now - profile.lastDaily < COOLDOWN) {
      const remaining = COOLDOWN - (now - profile.lastDaily);
      const hours = Math.floor(remaining / 3_600_000);
      const mins = Math.floor((remaining % 3_600_000) / 60_000);
      const embed = baseEmbed(Theme.warning)
        .setTitle(tg(gid, "eco.daily_title"))
        .setDescription(tg(gid, "eco.daily_wait", { time: `${hours}h ${mins}m` }));
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    profile.lastDaily = now;
    client.economy.addWallet(gid, interaction.user.id, REWARD);
    const p = client.economy.get(gid, interaction.user.id);

    const embed = baseEmbed(Theme.economy)
      .setTitle(tg(gid, "eco.daily_title"))
      .setDescription(
        [
          divider(),
          tg(gid, "eco.daily_claim", { amount: REWARD.toLocaleString() }),
          `${tg(gid, "eco.daily_balance")}  ${code(p.wallet.toLocaleString())}`,
          divider(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
