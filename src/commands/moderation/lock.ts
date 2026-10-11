import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class LockCommand extends Command {
  constructor() {
    super({
      name: "lock",
      description: "Kanalı kilitler",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageChannels],
      clientPermissions: [PermissionFlagsBits.ManageChannels],
      data: new SlashCommandBuilder()
        .setName("lock")
        .setDescription("Kanalı kilitler")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild || !interaction.channel || !("permissionOverwrites" in interaction.channel)) {
      await interaction.reply({ content: "Bu kanal kilitlenemez.", ephemeral: true });
      return;
    }

    const ch = interaction.channel as TextChannel;
    await ch.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });

    const embed = baseEmbed(Theme.danger)
      .setAuthor({ name: "MODERASYON" })
      .setTitle("Kanal Kilitli")
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
