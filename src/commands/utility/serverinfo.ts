import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ChannelType,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class ServerInfoCommand extends Command {
  constructor() {
    super({
      name: "serverinfo",
      description: "Sunucu bilgilerini gösterir",
      category: "utility",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("serverinfo")
        .setDescription("Sunucu bilgilerini gösterir")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const guild = interaction.guild;
    const owner = await guild.fetchOwner();

    const textChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).size;
    const categories = guild.channels.cache.filter((c) => c.type === ChannelType.GuildCategory).size;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields(
        { name: "Sahip", value: `${owner.user.tag}`, inline: true },
        { name: "ID", value: `\`${guild.id}\``, inline: true },
        { name: "Oluşturulma", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: "Üyeler", value: `${guild.memberCount}`, inline: true },
        { name: "Roller", value: `${guild.roles.cache.size}`, inline: true },
        { name: "Emojiler", value: `${guild.emojis.cache.size}`, inline: true },
        { name: "Kanallar", value: `Yazı: ${textChannels} | Ses: ${voiceChannels} | Kategori: ${categories}`, inline: false },
        { name: "Boost", value: `Seviye ${guild.premiumTier} (${guild.premiumSubscriptionCount ?? 0} boost)`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
