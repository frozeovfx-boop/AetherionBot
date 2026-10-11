import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

export default class FacepalmCommand extends Command {
  constructor() {
    super({
      name: "facepalm",
      description: "yüzünü kapattı.",
      category: "fun",
      cooldown: 3,
      data: new SlashCommandBuilder().setName("facepalm").setDescription("yüzünü kapattı.").toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = baseEmbed(Theme.fun)
      .setAuthor({ name: "FUN" })
      .setDescription(
        [
          line(),
          `🤦 **${interaction.user.username}** yüzünü kapattı.`,
          line(),
        ].join("\n")
      );
    await interaction.reply({ embeds: [embed] });
  }
}
