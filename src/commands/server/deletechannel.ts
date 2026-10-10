import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class DeletechannelCommand extends Command {
  constructor() {
    super({
      name: "deletechannel",
      description: "Kanal siler",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageChannels],
      clientPermissions: [PermissionFlagsBits.ManageChannels],
      data: new SlashCommandBuilder()
        .setName("deletechannel")
        .setDescription("Kanal siler")
        .addChannelOption((opt) =>
          opt.setName("kanal").setDescription("Kanal").setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel("kanal", true);
    if (!("delete" in channel)) {
      await interaction.reply({ content: "Bu kanal silinemez.", ephemeral: true });
      return;
    }
    await interaction.reply({ content: `**${channel.name}** siliniyor...`, ephemeral: true });
    await channel.delete(`deletechannel | ${interaction.user.tag}`);
  }
}
