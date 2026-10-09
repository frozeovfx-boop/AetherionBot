import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class SlowmodeCommand extends Command {
  constructor() {
    super({
      name: "slowmode",
      description: "Kanalın yavaş mod süresini ayarlar",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageChannels],
      clientPermissions: [PermissionFlagsBits.ManageChannels],
      data: new SlashCommandBuilder()
        .setName("slowmode")
        .setDescription("Kanalın yavaş mod süresini ayarlar")
        .addIntegerOption((opt) =>
          opt
            .setName("saniye")
            .setDescription("Yavaş mod süresi (0 = kapat, max 21600)")
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(21600)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.channel?.isTextBased()) return;

    const seconds = interaction.options.getInteger("saniye", true);
    const channel = interaction.channel as TextChannel;

    await channel.setRateLimitPerUser(seconds, `Slowmode | Yetkili: ${interaction.user.tag}`);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setDescription(
        seconds === 0
          ? "Yavaş mod **kapatıldı**."
          : `Yavaş mod **${seconds} saniye** olarak ayarlandı.`
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
