import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class GambleCommand extends Command {
  constructor() {
    super({
      name: "gamble",
      description: "Para bahis yap (50/50)",
      category: "economy",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("gamble")
        .setDescription("Para bahis yap (50/50)")
        .addIntegerOption((o) =>
          o.setName("miktar").setDescription("Bahis").setRequired(true).setMinValue(10)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const bet = interaction.options.getInteger("miktar", true);
    if (!client.economy.removeWallet(interaction.guild.id, interaction.user.id, bet)) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Yeterli paran yok.")],
        ephemeral: true,
      });
      return;
    }

    const win = Math.random() < 0.45;
    if (win) client.economy.addWallet(interaction.guild.id, interaction.user.id, bet * 2);

    const embed = baseEmbed(win ? Theme.success : Theme.danger)
      .setAuthor({ name: "ECONOMY" })
      .setTitle(win ? "Kazandın" : "Kaybettin")
      .setDescription(
        [
          line(),
          kv("Bahis", `${bet.toLocaleString()} 💵`),
          kv("Sonuç", win ? `**+${(bet * 2).toLocaleString()}** 💵` : `**−${bet.toLocaleString()}** 💵`),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
