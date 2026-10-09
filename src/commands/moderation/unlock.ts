import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class UnlockCommand extends Command {
  constructor() {
    super({
      name: "unlock",
      description: "Kanalın kilidini açar",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageChannels],
      clientPermissions: [PermissionFlagsBits.ManageChannels],
      data: new SlashCommandBuilder()
        .setName("unlock")
        .setDescription("Kanalın kilidini açar")
        .addStringOption((opt) =>
          opt.setName("sebep").setDescription("Sebep").setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild || !interaction.channel?.isTextBased()) return;

    const reason = interaction.options.getString("sebep") ?? "Sebep belirtilmedi";
    const channel = interaction.channel as TextChannel;

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: null,
    });

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("Kanal Kilidi Açıldı")
      .addFields(
        { name: "Kanal", value: `${channel}`, inline: true },
        { name: "Yetkili", value: `${interaction.user.tag}`, inline: true },
        { name: "Sebep", value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
