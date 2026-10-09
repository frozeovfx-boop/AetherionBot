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

export default class NukeCommand extends Command {
  constructor() {
    super({
      name: "nuke",
      description: "Kanalı klonlayıp eski kanalı siler (tüm mesajları temizler)",
      category: "moderation",
      cooldown: 15,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageChannels],
      clientPermissions: [PermissionFlagsBits.ManageChannels],
      data: new SlashCommandBuilder()
        .setName("nuke")
        .setDescription("Kanalı klonlayıp eski kanalı siler (tüm mesajları temizler)")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild || !interaction.channel) return;

    if (interaction.channel.type !== ChannelType.GuildText) {
      await interaction.reply({ content: "Bu komut sadece metin kanallarında kullanılabilir.", ephemeral: true });
      return;
    }

    const channel = interaction.channel as TextChannel;

    await interaction.reply({ content: "Kanal nuke ediliyor...", ephemeral: true });

    const position = channel.position;
    const newChannel = await channel.clone({
      reason: `Nuke | Yetkili: ${interaction.user.tag}`,
    });

    await newChannel.setPosition(position);
    await channel.delete(`Nuke | Yetkili: ${interaction.user.tag}`);

    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle("Kanal Nuke Edildi")
      .setDescription(`Bu kanal ${interaction.user} tarafından temizlendi.`)
      .setTimestamp();

    await newChannel.send({ embeds: [embed] });
  }
}
