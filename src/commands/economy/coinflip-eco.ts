import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class CoinflipEcoCommand extends Command {
  constructor() {
    super({
      name: "coinflip-eco",
      description: "Yazı/tura bahis",
      category: "economy",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("coinflip-eco")
        .setDescription("Yazı/tura bahis")
        .addIntegerOption((o) =>
          o.setName("miktar").setDescription("Bahis").setRequired(true).setMinValue(10)
        )
        .addStringOption((o) =>
          o
            .setName("secim")
            .setDescription("Yazı veya Tura")
            .setRequired(true)
            .addChoices({ name: "Yazı", value: "yazi" }, { name: "Tura", value: "tura" })
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const bet = interaction.options.getInteger("miktar", true);
    const choice = interaction.options.getString("secim", true);

    if (!client.economy.removeWallet(interaction.guild.id, interaction.user.id, bet)) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Yeterli paran yok.")],
        ephemeral: true,
      });
      return;
    }

    const result = Math.random() < 0.5 ? "yazi" : "tura";
    const win = result === choice;
    if (win) client.economy.addWallet(interaction.guild.id, interaction.user.id, bet * 2);

    const embed = baseEmbed(win ? Theme.success : Theme.danger)
      .setAuthor({ name: "ECONOMY" })
      .setTitle(win ? "Kazandın" : "Kaybettin")
      .setDescription(
        [
          line(),
          kv("Seçim", choice === "yazi" ? "Yazı" : "Tura"),
          kv("Sonuç", result === "yazi" ? "Yazı" : "Tura"),
          kv("Bahis", win ? `**+${(bet * 2).toLocaleString()}**` : `**−${bet.toLocaleString()}**`),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
