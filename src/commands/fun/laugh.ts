import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

export default class LaughCommand extends Command {
  constructor() {
    super({
      name: "laugh",
      description: "kahkaha attı!",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder().setName("laugh").setDescription("kahkaha attı!").toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = baseEmbed(Theme.fun)
      .setAuthor({ name: "FUN" })
      .setDescription(
        [
          line(),
          `😂 **${interaction.user.username}** kahkaha attı!`,
          line(),
        ].join("\n")
      );
    await interaction.reply({ embeds: [embed] });
  }
}
