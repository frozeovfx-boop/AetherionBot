import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ChannelType,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class ChannelsCommand extends Command {
  constructor() {
    super({
      name: "channels",
      description: "Kanal sayısını türlere göre gösterir",
      category: "utility",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("channels")
        .setDescription("Kanal sayısını türlere göre gösterir")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const c = interaction.guild.channels.cache;
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Kanallar")
      .addFields(
        { name: "Metin", value: `${c.filter((x) => x.type === ChannelType.GuildText).size}`, inline: true },
        { name: "Ses", value: `${c.filter((x) => x.type === ChannelType.GuildVoice).size}`, inline: true },
        { name: "Kategori", value: `${c.filter((x) => x.type === ChannelType.GuildCategory).size}`, inline: true },
        { name: "Forum", value: `${c.filter((x) => x.type === ChannelType.GuildForum).size}`, inline: true },
        { name: "Toplam", value: `${c.size}`, inline: true }
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
