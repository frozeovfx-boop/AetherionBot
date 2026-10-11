import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class DepositCommand extends Command {
  constructor() {
    super({
      name: "deposit",
      description: "Cüzdandan bankaya yatır",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("deposit")
        .setDescription("Cüzdandan bankaya yatır")
        .addIntegerOption((o) =>
          o.setName("miktar").setDescription("Miktar").setRequired(true).setMinValue(1)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const amount = interaction.options.getInteger("miktar", true);
    const ok = client.economy.deposit(interaction.guild.id, interaction.user.id, amount);

    if (!ok) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Cüzdanda yeterli para yok.")],
        ephemeral: true,
      });
      return;
    }

    const p = client.economy.get(interaction.guild.id, interaction.user.id);

    const embed = baseEmbed(Theme.economy)
      .setAuthor({ name: "ECONOMY" })
      .setTitle("Yatırım")
      .setDescription(
        [
          line(),
          kv("Yatırılan", `**${amount.toLocaleString()}** 💵`),
          kv("Cüzdan", code(p.wallet.toLocaleString())),
          kv("Banka", code(p.bank.toLocaleString())),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
