import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class RpsCommand extends Command {
  constructor() {
    super({
      name: "rps",
      description: "Taş kağıt makas",
      category: "fun",
      cooldown: 2,
      data: new SlashCommandBuilder()
        .setName("rps")
        .setDescription("Taş kağıt makas")
        .addStringOption((opt) =>
          opt.setName("secim").setDescription("Seçimin").setRequired(true)
            .addChoices(
              { name: "Taş", value: "rock" },
              { name: "Kağıt", value: "paper" },
              { name: "Makas", value: "scissors" }
            )
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const choice = interaction.options.getString("secim", true);
    const bot = ["rock", "paper", "scissors"][Math.floor(Math.random() * 3)]!;
    const names: Record<string, string> = { rock: "Taş", paper: "Kağıt", scissors: "Makas" };
    let result = "Berabere!";
    if (choice === bot) result = "Berabere!";
    else if (
      (choice === "rock" && bot === "scissors") ||
      (choice === "paper" && bot === "rock") ||
      (choice === "scissors" && bot === "paper")
    ) result = "Kazandın!";
    else result = "Kaybettin!";
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Taş Kağıt Makas")
      .setDescription(`Sen: **${names[choice]}**\nBot: **${names[bot]}**\n\n**${result}**`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
