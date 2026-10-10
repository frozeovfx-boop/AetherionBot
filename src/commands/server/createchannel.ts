import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class CreatechannelCommand extends Command {
  constructor() {
    super({
      name: "createchannel",
      description: "Metin kanalı oluşturur",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageChannels],
      clientPermissions: [PermissionFlagsBits.ManageChannels],
      data: new SlashCommandBuilder()
        .setName("createchannel")
        .setDescription("Metin kanalı oluşturur")
        .addStringOption((opt) =>
          opt.setName("isim").setDescription("Kanal adı").setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const name = interaction.options.getString("isim", true);
    const ch = await interaction.guild.channels.create({
      name,
      type: ChannelType.GuildText,
      reason: `createchannel | ${interaction.user.tag}`,
    });
    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setDescription(`Kanal oluşturuldu: ${ch}`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
