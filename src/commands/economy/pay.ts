import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class PayCommand extends Command {
  constructor() {
    super({
      name: "pay",
      description: "Başka kullanıcıya para gönder",
      category: "economy",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("pay")
        .setDescription("Başka kullanıcıya para gönder")
        .addUserOption((o) => o.setName("kullanici").setDescription("Alıcı").setRequired(true))
        .addIntegerOption((o) =>
          o.setName("miktar").setDescription("Miktar").setRequired(true).setMinValue(1)
        )
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const amount = interaction.options.getInteger("miktar", true);

    if (target.bot || target.id === interaction.user.id) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Geçersiz hedef.")],
        ephemeral: true,
      });
      return;
    }

    if (!client.economy.removeWallet(interaction.guild.id, interaction.user.id, amount)) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Yeterli paran yok.")],
        ephemeral: true,
      });
      return;
    }

    client.economy.addWallet(interaction.guild.id, target.id, amount);

    const embed = baseEmbed(Theme.economy)
      .setAuthor({ name: "ECONOMY" })
      .setTitle("Transfer")
      .setDescription(
        [
          line(),
          kv("Gönderen", interaction.user.tag),
          kv("Alıcı", target.tag),
          kv("Miktar", `**${amount.toLocaleString()}** 💵`),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
