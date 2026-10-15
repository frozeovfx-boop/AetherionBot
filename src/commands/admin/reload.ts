import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";
import { loadCommands } from "../../handlers/commandHandler.js";

export default class ReloadCommand extends Command {
  constructor() {
    super({
      name: "reload",
      description: "Komutları yeniden yükler (owner)",
      category: "admin",
      cooldown: 10,
      ownerOnly: true,
      data: new SlashCommandBuilder()
        .setName("reload")
        .setDescription("Komutları yeniden yükler (owner)")
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    client.commands.clear();
    await loadCommands(client);

    const embed = baseEmbed(Theme.success)
      .setAuthor({ name: "ADMIN" })
      .setTitle("Reload")
      .setDescription(
        [
          line(),
          kv("Komutlar", code(client.commands.size)),
          line(),
        ].join("\n")
      );

    await interaction.editReply({ embeds: [embed] });
  }
}
