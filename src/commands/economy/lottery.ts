import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

const TICKET = 100;

export default class LotteryCommand extends Command {
  constructor() {
    super({
      name: "lottery",
      description: "Piyango bileti al",
      category: "economy",
      cooldown: 10,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("lottery")
        .setDescription("Piyango bileti al")
        .addIntegerOption((o) =>
          o.setName("adet").setDescription("Bilet sayısı").setMinValue(1).setMaxValue(10).setRequired(false)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const count = interaction.options.getInteger("adet") ?? 1;
    const cost = TICKET * count;

    if (!client.economy.removeWallet(interaction.guild.id, interaction.user.id, cost)) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Yeterli paran yok.")],
        ephemeral: true,
      });
      return;
    }

    let won = 0;
    for (let i = 0; i < count; i++) {
      if (Math.random() < 0.08) won += TICKET * (5 + Math.floor(Math.random() * 16));
    }

    if (won > 0) client.economy.addWallet(interaction.guild.id, interaction.user.id, won);

    const embed = baseEmbed(won > 0 ? Theme.success : Theme.mute)
      .setAuthor({ name: "ECONOMY" })
      .setTitle(won > 0 ? "Piyango · Kazandın" : "Piyango")
      .setDescription(
        [
          line(),
          kv("Bilet", `${count} × ${TICKET}`),
          kv("Sonuç", won > 0 ? `**+${won.toLocaleString()}** 💵` : "Boş"),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
