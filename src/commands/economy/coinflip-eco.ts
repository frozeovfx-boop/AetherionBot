import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class CoinflipEcoCommand extends Command {
  constructor() {
    super({
      name: "coinflip-eco",
      description: "Yazı tura bahis",
      category: "economy",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("coinflip-eco")
        .setDescription("Yazı tura bahis")
        .addIntegerOption((opt) =>
          opt.setName("miktar").setDescription("Bahis").setRequired(true).setMinValue(10)
        )
        .addStringOption((opt) =>
          opt.setName("secim").setDescription("Yazı/Tura").setRequired(true)
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
      await interaction.reply({ content: "Yeterli para yok.", ephemeral: true });
      return;
    }
    const result = Math.random() < 0.5 ? "yazi" : "tura";
    const win = choice === result;
    if (win) client.economy.addWallet(interaction.guild.id, interaction.user.id, bet * 2);
    const embed = new EmbedBuilder()
      .setColor(win ? 0x57f287 : 0xed4245)
      .setTitle("🪙 Yazı Tura")
      .setDescription(`Sonuç: **${result === "yazi" ? "Yazı" : "Tura"}**\n${win ? `Kazandın +${(bet*2).toLocaleString()}` : `Kaybettin -${bet.toLocaleString()}`}`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
