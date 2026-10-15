import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

const FACTS = [
  "Bal balları asla uyumaz; kanat çırparak havalandırmayı sağlarlar.",
  "Ahtapotların 3 kalbi vardır.",
  "Bir günde 1 milyar+ yıldırım düşer.",
  "Discord 2015'te kuruldu.",
  "TypeScript, JavaScript'in üst kümesidir.",
];

export default class FactCommand extends Command {
  constructor() {
    super({
      name: "fact",
      description: "Rastgele bilgi",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder().setName("fact").setDescription("Rastgele bilgi").toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const fact = FACTS[Math.floor(Math.random() * FACTS.length)]!;
    const embed = baseEmbed(Theme.fun)
      .setAuthor({ name: "FACT" })
      .setDescription([line(), fact, line()].join("\n"));
    await interaction.reply({ embeds: [embed] });
  }
}
