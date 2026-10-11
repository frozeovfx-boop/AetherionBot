import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

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
        .addChannelOption((o) =>
          o
            .setName("kanal")
            .setDescription("Kanal")
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const channel = interaction.options.getChannel("kanal", true);
    const name = channel.name;

    if (channel.id === interaction.channelId) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Bulunduğun kanalı silemezsin.")],
        ephemeral: true,
      });
      return;
    }

    await interaction.guild.channels.delete(channel.id, `deletechannel · ${interaction.user.tag}`);

    const embed = baseEmbed(Theme.danger)
      .setAuthor({ name: "SERVER" })
      .setTitle("Kanal Silindi")
      .setDescription(
        [
          line(),
          kv("Kanal", name ?? "—"),
          kv("Yetkili", interaction.user.tag),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
