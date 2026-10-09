import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

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
        .addIntegerOption((opt) =>
          opt.setName("miktar").setDescription("Bahis miktarı").setRequired(true).setMinValue(10)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const amount = interaction.options.getInteger("miktar", true);
    const ok = client.economy.removeWallet(interaction.guild.id, interaction.user.id, amount);

    if (!ok) {
      await interaction.reply({ content: "Cüzdanında yeterli para yok.", ephemeral: true });
      return;
    }

    const win = Math.random() < 0.45;
    if (win) {
      const prize = amount * 2;
      client.economy.addWallet(interaction.guild.id, interaction.user.id, prize);
      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle("Kazandın!")
        .setDescription(`**+${prize.toLocaleString()}** 💵 kazandın.`)
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setColor(0xed4245)
        .setTitle("Kaybettin")
        .setDescription(`**-${amount.toLocaleString()}** 💵 kaybettin.`)
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }
  }
}
