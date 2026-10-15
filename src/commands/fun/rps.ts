import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

const CHOICES = ["taş", "kağıt", "makas"] as const;
const EMOJI = { taş: "🪨", kağıt: "📄", makas: "✂️" };

export default class RpsCommand extends Command {
  constructor() {
    super({
      name: "rps",
      description: "Taş kağıt makas",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("rps")
        .setDescription("Taş kağıt makas")
        .addStringOption((o) =>
          o
            .setName("secim")
            .setDescription("Seçimin")
            .setRequired(true)
            .addChoices(
              { name: "Taş", value: "taş" },
              { name: "Kağıt", value: "kağıt" },
              { name: "Makas", value: "makas" }
            )
        )
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getString("secim", true) as typeof CHOICES[number];
    const bot = CHOICES[Math.floor(Math.random() * 3)]!;

    let result = "Berabere";
    if (user === bot) result = "Berabere";
    else if (
      (user === "taş" && bot === "makas") ||
      (user === "kağıt" && bot === "taş") ||
      (user === "makas" && bot === "kağıt")
    )
      result = "Kazandın";
    else result = "Kaybettin";

    const embed = baseEmbed(
      result === "Kazandın" ? Theme.success : result === "Kaybettin" ? Theme.danger : Theme.mute
    )
      .setAuthor({ name: "RPS" })
      .setTitle(result)
      .setDescription(
        [
          line(),
          kv("Sen", `${EMOJI[user]} ${user}`),
          kv("Bot", `${EMOJI[bot]} ${bot}`),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
