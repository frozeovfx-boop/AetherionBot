import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

export default class MockCommand extends Command {
  constructor() {
    super({
      name: "mock",
      description: "Mock metin",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("mock")
        .setDescription("Mock metin")
        .addStringOption((o) => o.setName("metin").setDescription("Metin").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString("metin", true);
    const mocked = [...text]
      .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
      .join("");

    const embed = baseEmbed(Theme.fun)
      .setAuthor({ name: "MOCK" })
      .setDescription([line(), mocked.slice(0, 1500), line()].join("\n"));

    await interaction.reply({ embeds: [embed] });
  }
}
