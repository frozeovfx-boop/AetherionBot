import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class BalanceCommand extends Command {
  constructor() {
    super({
      name: "balance",
      description: "Cüzdan ve banka",
      category: "economy",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Cüzdan ve banka")
        .addUserOption((o) => o.setName("kullanici").setRequired(false))
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const user = interaction.options.getUser("kullanici") ?? interaction.user;
    const p = client.economy.get(interaction.guild.id, user.id);
    const total = p.wallet + p.bank;

    const embed = baseEmbed(Theme.economy)
      .setAuthor({ name: "ECONOMY", iconURL: user.displayAvatarURL({ size: 64 }) })
      .setTitle(user.username)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .setDescription(
        [
          line(),
          kv("Cüzdan", code(p.wallet)),
          kv("Banka", code(p.bank)),
          kv("Toplam", code(total)),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
