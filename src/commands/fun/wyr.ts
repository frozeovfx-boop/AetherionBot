import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

const QUESTIONS = [
  ["Uçabilmek", "Görünmez olmak"],
  ["Sürekli yaz", "Sürekli kış"],
  ["Zaman yolculuğu", "Telepati"],
  ["Sadece tatlı", "Sadece tuzlu"],
  ["Past'ı değiştirmek", "Future'ı görmek"],
];

export default class WyrCommand extends Command {
  constructor() {
    super({
      name: "wyr",
      description: "Would you rather",
      category: "fun",
      cooldown: 5,
      data: new SlashCommandBuilder().setName("wyr").setDescription("Would you rather").toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const [a, b] = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]!;

    const embed = baseEmbed(Theme.fun)
      .setAuthor({ name: "WYR" })
      .setTitle("Hangisini seçersin?")
      .setDescription([line(), `**A)** ${a}`, `**B)** ${b}`, line()].join("\n"));

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    await msg.react("🇦");
    await msg.react("🇧");
  }
}
