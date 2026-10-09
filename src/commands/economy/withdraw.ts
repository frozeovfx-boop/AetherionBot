import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class WithdrawCommand extends Command {
  constructor() {
    super({
      name: "withdraw",
      description: "Bankadan cüzdana para çek",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("withdraw")
        .setDescription("Bankadan cüzdana para çek")
        .addIntegerOption((opt) =>
          opt.setName("miktar").setDescription("Miktar").setRequired(true).setMinValue(1)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const amount = interaction.options.getInteger("miktar", true);
    const ok = client.economy.withdraw(interaction.guild.id, interaction.user.id, amount);

    if (!ok) {
      await interaction.reply({ content: "Bankanda yeterli para yok.", ephemeral: true });
      return;
    }

    const profile = client.economy.get(interaction.guild.id, interaction.user.id);
    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("Para Çekildi")
      .setDescription(`**${amount.toLocaleString()}** 💵 cüzdana çekildi.\nCüzdan: **${profile.wallet.toLocaleString()}**`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
