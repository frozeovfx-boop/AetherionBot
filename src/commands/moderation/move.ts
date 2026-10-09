import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class MoveCommand extends Command {
  constructor() {
    super({
      name: "move",
      description: "Kullanıcıyı başka bir ses kanalına taşır",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.MoveMembers],
      clientPermissions: [PermissionFlagsBits.MoveMembers],
      data: new SlashCommandBuilder()
        .setName("move")
        .setDescription("Kullanıcıyı başka bir ses kanalına taşır")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef kullanıcı").setRequired(true)
        )
        .addChannelOption((opt) =>
          opt
            .setName("kanal")
            .setDescription("Hedef ses kanalı")
            .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const channel = interaction.options.getChannel("kanal", true);

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      await interaction.reply({ content: "Kullanıcı sunucuda bulunamadı.", ephemeral: true });
      return;
    }

    if (!member.voice.channel) {
      await interaction.reply({ content: "Kullanıcı bir ses kanalında değil.", ephemeral: true });
      return;
    }

    await member.voice.setChannel(channel.id, `Move | Yetkili: ${interaction.user.tag}`);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Kullanıcı Taşındı")
      .addFields(
        { name: "Kullanıcı", value: `${target.tag}`, inline: true },
        { name: "Kanal", value: `${channel}`, inline: true },
        { name: "Yetkili", value: interaction.user.tag, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
