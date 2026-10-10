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

export default class UnlockdownCommand extends Command {
  constructor() {
    super({
      name: "unlockdown",
      description: "Tüm metin kanallarının kilidini açar",
      category: "moderation",
      cooldown: 30,
      guildOnly: true,
      permissions: [PermissionFlagsBits.Administrator],
      clientPermissions: [PermissionFlagsBits.ManageChannels],
      data: new SlashCommandBuilder()
        .setName("unlockdown")
        .setDescription("Tüm metin kanallarının kilidini açar")
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
        await (ch as TextChannel).permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });
        count++;
      } catch { /* skip */ }
    }
    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("Unlockdown")
      .setDescription(`**${count}** kanalın kilidi açıldı.`)
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  }
}
