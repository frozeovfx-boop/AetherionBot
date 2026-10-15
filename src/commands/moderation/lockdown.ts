import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

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

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    await interaction.deferReply();

    let count = 0;
    for (const ch of interaction.guild.channels.cache.values()) {
      if (ch.type !== ChannelType.GuildText) continue;
      try {
        await (ch as TextChannel).permissionOverwrites.edit(interaction.guild.roles.everyone, {
          SendMessages: false,
        });
        count++;
      } catch { /* skip */ }
    }

    const embed = baseEmbed(Theme.danger)
      .setAuthor({ name: "MODERASYON" })
      .setTitle("Lockdown")
      .setDescription(
        [
          line(),
          kv("Kilitlenen", `**${count}** kanal`),
          kv("Yetkili", interaction.user.tag),
          line(),
        ].join("\n")
      );

    await interaction.editReply({ embeds: [embed] });
  }
}
