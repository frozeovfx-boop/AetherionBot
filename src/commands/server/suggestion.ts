import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

export default class SuggestionCommand extends Command {
  constructor() {
    super({
      name: "suggestion",
      description: "Öneri gönderir",
      category: "server",
      cooldown: 15,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("suggestion")
        .setDescription("Öneri gönderir")
        .addStringOption((o) => o.setName("oneri").setDescription("Önerin").setRequired(true))
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString("oneri", true);

    const embed = baseEmbed(Theme.info)
      .setAuthor({
        name: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL({ size: 64 }),
      })
      .setTitle("Öneri")
      .setDescription([line(), text.slice(0, 2000), line()].join("\n"));

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    await msg.react("👍");
    await msg.react("👎");
  }
}
