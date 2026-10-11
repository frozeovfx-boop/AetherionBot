import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, bar } from "../../utils/embeds.js";

export default class RateCommand extends Command {
  constructor() {
    super({
      name: "rate",
      description: "Bir şeyi puanla",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("rate")
        .setDescription("Bir şeyi puanla")
        .addStringOption((o) => o.setName("hedef").setDescription("Ne puanlanacak?").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getString("hedef", true);
    let hash = 0;
    for (let i = 0; i < target.length; i++) hash = (hash * 31 + target.charCodeAt(i)) >>> 0;
    const score = hash % 101;

    const embed = baseEmbed(Theme.fun)
      .setAuthor({ name: "RATE" })
      .setTitle(target.slice(0, 100))
      .setDescription(
        [
          line(),
          `**${score}/100**`,
          bar(score / 100),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
