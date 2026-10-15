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

export default class UnlockdownCommand extends Command {
  constructor() {
    super({
      name: "unlockdown",
      description: "Tüm kanalların kilidini açar",
      category: "moderation",
      cooldown: 30,
      guildOnly: true,
      permissions: [PermissionFlagsBits.Administrator],
      clientPermissions: [PermissionFlagsBits.ManageChannels],
      data: new SlashCommandBuilder()
        .setName("unlockdown")
        .setDescription("Tüm kanalların kilidini açar")
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
          SendMessages: null,
        });
        count++;
      } catch { /* skip */ }
    }

    const embed = baseEmbed(Theme.success)
      .setAuthor({ name: "MODERASYON" })
      .setTitle("Unlockdown")
      .setDescription(
        [
          line(),
          kv("Açılan", `**${count}** kanal`),
          kv("Yetkili", interaction.user.tag),
          line(),
        ].join("\n")
      );

    await interaction.editReply({ embeds: [embed] });
  }
}
