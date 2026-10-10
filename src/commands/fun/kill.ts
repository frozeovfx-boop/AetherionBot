import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

const WAYS = [
  "lazer kılıcıyla yok etti",
  "yastıkla boğdu",
  "banana peel'e bastırıp düşürdü",
  "çok fazla meme attı",
  "timeout attı (kalıcı)",
];

export default class KillCommand extends Command {
  constructor() {
    super({
      name: "kill",
      description: "Şaka yollu birini 'öldür'",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("kill")
        .setDescription("Şaka yollu birini öldür")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef").setRequired(true)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser("kullanici", true);
    const way = WAYS[Math.floor(Math.random() * WAYS.length)]!;
    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setDescription(`💀 **${interaction.user.username}**, **${target.username}** kullanıcısını ${way}!`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
