import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  OAuth2Scopes,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

export default class InviteCommand extends Command {
  constructor() {
    super({
      name: "invite",
      description: "Bot davet linki",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder().setName("invite").setDescription("Bot davet linki").toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const url = client.generateInvite({
      scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
      permissions: [
        PermissionFlagsBits.Administrator,
      ],
    });

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: "AETHERION", iconURL: client.user?.displayAvatarURL({ size: 64 }) })
      .setTitle("Davet")
      .setDescription(
        [
          line(),
          "Botu sunucuna ekle.",
          "Slash komutlar + yönetici yetkisi dahil.",
          line(),
        ].join("\n")
      );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setLabel("Davet Et").setStyle(ButtonStyle.Link).setURL(url)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
}
