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

export default class AnnounceCommand extends Command {
  constructor() {
    super({
      name: "announce",
      description: "Duyuru gönderir",
      category: "server",
      cooldown: 10,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageMessages],
      data: new SlashCommandBuilder()
        .setName("announce")
        .setDescription("Duyuru gönderir")
        .addStringOption((opt) =>
          opt.setName("mesaj").setDescription("Duyuru metni").setRequired(true)
        )
        .addChannelOption((opt) =>
          opt
            .setName("kanal")
            .setDescription("Kanal (boşsa mevcut)")
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const message = interaction.options.getString("mesaj", true);
    const channel = (interaction.options.getChannel("kanal") ?? interaction.channel) as TextChannel | null;

    if (!channel || !("send" in channel)) {
      await interaction.reply({ content: "Geçersiz kanal.", ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("📢 Duyuru")
      .setDescription(message)
      .setFooter({ text: `Gönderen: ${interaction.user.tag}` })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: "Duyuru gönderildi.", ephemeral: true });
  }
}
