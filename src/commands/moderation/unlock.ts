import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class UnlockCommand extends Command {
  constructor() {
    super({
      name: "unlock",
      description: "Kanalın kilidini açar",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageChannels],
      clientPermissions: [PermissionFlagsBits.ManageChannels],
      data: new SlashCommandBuilder()
        .setName("unlock")
        .setDescription("Kanalın kilidini açar")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild || !interaction.channel || !("permissionOverwrites" in interaction.channel)) {
      await interaction.reply({ content: "Bu kanalın kilidi açılamaz.", ephemeral: true });
      return;
    }

    const ch = interaction.channel as TextChannel;
    await ch.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });

    const embed = baseEmbed(Theme.success)
      .setAuthor({ name: "MODERASYON" })
      .setTitle("Kilit Açıldı")
      .setDescription(
        [
          line(),
          kv("Kanal", `${ch}`),
          kv("Yetkili", interaction.user.tag),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
