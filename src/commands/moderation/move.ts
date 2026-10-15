import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  VoiceChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class MoveCommand extends Command {
  constructor() {
    super({
      name: "move",
      description: "Kullanıcıyı ses kanalına taşır",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.MoveMembers],
      clientPermissions: [PermissionFlagsBits.MoveMembers],
      data: new SlashCommandBuilder()
        .setName("move")
        .setDescription("Kullanıcıyı ses kanalına taşır")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(true))
        .addChannelOption((o) =>
          o
            .setName("kanal")
            .setDescription("Hedef ses kanalı")
            .addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const channel = interaction.options.getChannel("kanal", true) as VoiceChannel;
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member?.voice.channel) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Kullanıcı ses kanalında değil.")],
        ephemeral: true,
      });
      return;
    }

    await member.voice.setChannel(channel, `move · ${interaction.user.tag}`);

    const embed = baseEmbed(Theme.info)
      .setAuthor({ name: "MODERASYON" })
      .setTitle("Taşındı")
      .setDescription(
        [
          line(),
          kv("Kullanıcı", target.tag),
          kv("Kanal", `${channel}`),
          kv("Yetkili", interaction.user.tag),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
