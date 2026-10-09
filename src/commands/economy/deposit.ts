import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class DepositCommand extends Command {
  constructor() {
    super({
      name: "deposit",
      description: "Cüzdandan bankaya para yatır",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("deposit")
        .setDescription("Cüzdandan bankaya para yatır")
        .addIntegerOption((opt) =>
          opt.setName("miktar").setDescription("Miktar").setRequired(true).setMinValue(1)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const amount = interaction.options.getInteger("miktar", true);
    const ok = client.economy.deposit(interaction.guild.id, interaction.user.id, amount);

    if (!ok) {
      await interaction.reply({ content: "Cüzdanında yeterli para yok.", ephemeral: true });
      return;
    }

    const profile = client.economy.get(interaction.guild.id, interaction.user.id);
    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("Para Yatırıldı")
      .setDescription(`**${amount.toLocaleString()}** 💵 bankaya yatırıldı.\nBanka: **${profile.bank.toLocaleString()}**`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
