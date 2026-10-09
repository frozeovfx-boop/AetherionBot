import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ChannelType,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class ChannelInfoCommand extends Command {
  constructor() {
    super({
      name: "channelinfo",
      description: "Kanal hakkında bilgi gösterir",
      category: "utility",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("channelinfo")
        .setDescription("Kanal hakkında bilgi gösterir")
        .addChannelOption((opt) =>
          opt.setName("kanal").setDescription("Kanal").setRequired(false)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel("kanal") ?? interaction.channel;
    if (!channel) return;

    const typeNames: Record<number, string> = {
      [ChannelType.GuildText]: "Metin",
      [ChannelType.GuildVoice]: "Ses",
      [ChannelType.GuildCategory]: "Kategori",
      [ChannelType.GuildAnnouncement]: "Duyuru",
      [ChannelType.GuildStageVoice]: "Sahne",
      [ChannelType.GuildForum]: "Forum",
    };

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`Kanal: ${"name" in channel ? channel.name : "Bilinmiyor"}`)
      .addFields(
        { name: "ID", value: channel.id, inline: true },
        { name: "Tür", value: typeNames[channel.type] ?? "Diğer", inline: true },
        { name: "Oluşturulma", value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
