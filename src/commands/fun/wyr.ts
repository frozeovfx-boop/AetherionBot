import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

const QUESTIONS = [
  ["Uçmak", "Görünmez olmak"],
  ["Geçmişi görmek", "Geleceği görmek"],
  ["Hep yaz", "Hep kış"],
  ["Sadece tatlı", "Sadece tuzlu"],
  ["Zengin ama mutsuz", "Fakir ama mutlu"],
  ["Süper güç", "Süper zeka"],
  ["Zaman yolculuğu", "Teleport"],
  ["Konuşan hayvan", "Uçan araba"],
];

export default class WyrCommand extends Command {
  constructor() {
    super({
      name: "wyr",
      description: "Would you rather",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder().setName("wyr").setDescription("Would you rather").toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const [a, b] = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]!;
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Would You Rather?")
      .setDescription(`**A)** ${a}\n**B)** ${b}`)
      .setTimestamp();
    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    await msg.react("🇦");
    await msg.react("🇧");
  }
}
