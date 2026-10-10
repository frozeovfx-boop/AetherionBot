import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  OAuth2Scopes,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class InviteCommand extends Command {
  constructor() {
    super({
      name: "invite",
      description: "Bot davet linkini verir",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Bot davet linkini verir")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const url = client.generateInvite({
      scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
      permissions: [PermissionFlagsBits.Administrator],
    });
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Davet")
      .setDescription(`[Beni sunucuna ekle](${url})`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
