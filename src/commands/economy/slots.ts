import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

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
        .addIntegerOption((opt) =>
          opt.setName("miktar").setDescription("Bahis").setRequired(true).setMinValue(10)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const bet = interaction.options.getInteger("miktar", true);
    if (!client.economy.removeWallet(interaction.guild.id, interaction.user.id, bet)) {
      await interaction.reply({ content: "Yeterli paran yok.", ephemeral: true });
      return;
    }

    const a = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!;
    const b = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!;
    const c = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]!;

    let multiplier = 0;
    if (a === b && b === c) multiplier = a === "7️⃣" ? 10 : a === "💎" ? 7 : 5;
    else if (a === b || b === c || a === c) multiplier = 2;

    const win = bet * multiplier;
    if (win > 0) client.economy.addWallet(interaction.guild.id, interaction.user.id, win);

    const embed = new EmbedBuilder()
      .setColor(win > 0 ? 0x57f287 : 0xed4245)
      .setTitle("🎰 Slots")
      .setDescription(`**[ ${a} | ${b} | ${c} ]**\n\n${win > 0 ? `Kazanç: **+${win.toLocaleString()}** 💵` : `Kaybettin: **-${bet.toLocaleString()}** 💵`}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
