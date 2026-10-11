import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class WithdrawCommand extends Command {
  constructor() {
    super({
      name: "withdraw",
      description: "Bankadan cüzdana çek",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("withdraw")
        .setDescription("Bankadan cüzdana çek")
        .addIntegerOption((o) =>
          o.setName("miktar").setDescription("Miktar").setRequired(true).setMinValue(1)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const amount = interaction.options.getInteger("miktar", true);
    const ok = client.economy.withdraw(interaction.guild.id, interaction.user.id, amount);

    if (!ok) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Bankada yeterli para yok.")],
        ephemeral: true,
      });
      return;
    }

    const p = client.economy.get(interaction.guild.id, interaction.user.id);

    const embed = baseEmbed(Theme.economy)
      .setAuthor({ name: "ECONOMY" })
      .setTitle("Çekim")
      .setDescription(
        [
          line(),
          kv("Çekilen", `**${amount.toLocaleString()}** 💵`),
          kv("Cüzdan", code(p.wallet.toLocaleString())),
          kv("Banka", code(p.bank.toLocaleString())),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
