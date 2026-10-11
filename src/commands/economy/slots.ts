import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "⭐", "💎", "7️⃣"];

export default class SlotsCommand extends Command {
  constructor() {
    super({
      name: "slots",
      description: "Slot makinesi",
      category: "economy",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("slots")
        .setDescription("Slot makinesi")
        .addIntegerOption((o) =>
          o.setName("miktar").setDescription("Bahis").setRequired(true).setMinValue(10)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const bet = interaction.options.getInteger("miktar", true);
    if (!client.economy.removeWallet(interaction.guild.id, interaction.user.id, bet)) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Yeterli paran yok.")],
        ephemeral: true,
      });
      return;
    }

    const a = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!;
    const b = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!;
    const c = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!;

    let mult = 0;
    if (a === b && b === c) mult = a === "7️⃣" ? 10 : a === "💎" ? 7 : 5;
    else if (a === b || b === c || a === c) mult = 2;

    const win = bet * mult;
    if (win > 0) client.economy.addWallet(interaction.guild.id, interaction.user.id, win);

    const embed = baseEmbed(win > 0 ? Theme.success : Theme.danger)
      .setAuthor({ name: "ECONOMY" })
      .setTitle("Slots")
      .setDescription(
        [
          line(),
          `**[  ${a}  |  ${b}  |  ${c}  ]**`,
          "",
          kv("Bahis", `${bet.toLocaleString()} 💵`),
          kv("Sonuç", win > 0 ? `**+${win.toLocaleString()}** 💵` : `**−${bet.toLocaleString()}** 💵`),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
