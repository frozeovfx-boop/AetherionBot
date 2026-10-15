import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

const ANSWERS = [
  "Kesinlikle.",
  "Evet.",
  "Büyük ihtimalle.",
  "Belki.",
  "Emin değilim.",
  "Sonra sor.",
  "Hayır.",
  "Mümkün değil.",
  "Asla.",
  "Şansın yaver gider.",
];

export default class EightBallCommand extends Command {
  constructor() {
    super({
      name: "8ball",
      description: "Sihirli 8ball",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("8ball")
        .setDescription("Sihirli 8ball")
        .addStringOption((o) => o.setName("soru").setDescription("Soru").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString("soru", true);
    const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)]!;

    const embed = baseEmbed(Theme.fun)
      .setAuthor({ name: "8BALL" })
      .setDescription(
        [
          line(),
          `**Soru**\n${question.slice(0, 300)}`,
          "",
          `**Cevap**\n${answer}`,
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
