import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class LockdownCommand extends Command {
  constructor() {
    super({
      name: "lockdown",
      description: "Tüm metin kanallarını kilitler",
      category: "moderation",
      cooldown: 30,
      guildOnly: true,
      permissions: [PermissionFlagsBits.Administrator],
      clientPermissions: [PermissionFlagsBits.ManageChannels],
      data: new SlashCommandBuilder()
        .setName("lockdown")
        .setDescription("Tüm metin kanallarını kilitler")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    await interaction.deferReply();
    let count = 0;
    for (const ch of interaction.guild.channels.cache.values()) {
      if (ch.type !== ChannelType.GuildText) continue;
      try {
        await (ch as TextChannel).permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
        count++;
      } catch { /* skip */ }
    }
    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle("Lockdown")
      .setDescription(`**${count}** kanal kilitlendi.`)
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  }
}
