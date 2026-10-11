import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

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
        .addStringOption((o) => o.setName("isim").setDescription("Kanal adı").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const name = interaction.options.getString("isim", true).toLowerCase().replace(/\s+/g, "-").slice(0, 100);
    const channel = await interaction.guild.channels.create({
      name,
      type: ChannelType.GuildText,
      reason: `createchannel · ${interaction.user.tag}`,
    });

    const embed = baseEmbed(Theme.success)
      .setAuthor({ name: "SERVER" })
      .setTitle("Kanal Oluşturuldu")
      .setDescription(
        [
          line(),
          kv("Kanal", `${channel}`),
          kv("Yetkili", interaction.user.tag),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
