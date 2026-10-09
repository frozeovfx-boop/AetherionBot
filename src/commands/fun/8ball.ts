import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

const ANSWERS = [
  "Kesinlikle.",
  "Hiç şüphesiz.",
  "Evet, kesin.",
  "Gördüğüm kadarıyla evet.",
  "Büyük ihtimalle.",
  "Evet.",
  "İşaretler eveti gösteriyor.",
  "Belirsiz, tekrar dene.",
  "Sonra sor.",
  "Şimdi söylemesem daha iyi.",
  "Şu an tahmin edemem.",
  "Konsantre ol ve tekrar sor.",
  "Cevabım hayır.",
  "Kaynaklarım hayır diyor.",
  "Pek iyi görünmüyor.",
  "Çok şüpheli.",
];

export default class EightBallCommand extends Command {
  constructor() {
    super({
      name: "8ball",
      description: "Sihirli 8ball'a soru sor",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("8ball")
        .setDescription("Sihirli 8ball'a soru sor")
        .addStringOption((opt) =>
          opt.setName("soru").setDescription("Sorun").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString("soru", true);
    const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)]!;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🎱 8ball")
      .addFields(
        { name: "Soru", value: question },
        { name: "Cevap", value: answer }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
