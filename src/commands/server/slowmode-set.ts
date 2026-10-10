import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class SlowmodeSetCommand extends Command {
  constructor() {
    super({
      name: "slowmode-set",
      description: "Kanala yavaş mod ayarlar (saniye)",
      category: "server",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageChannels],
      clientPermissions: [PermissionFlagsBits.ManageChannels],
      data: new SlashCommandBuilder()
        .setName("slowmode-set")
        .setDescription("Kanala yavaş mod ayarlar")
        .addIntegerOption((opt) =>
          opt.setName("saniye").setDescription("0-21600").setRequired(true).setMinValue(0).setMaxValue(21600)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.channel || !("setRateLimitPerUser" in interaction.channel)) {
      await interaction.reply({ content: "Bu kanalda kullanılamaz.", ephemeral: true });
      return;
    }
    const sec = interaction.options.getInteger("saniye", true);
    await (interaction.channel as TextChannel).setRateLimitPerUser(sec, `slowmode-set | ${interaction.user.tag}`);
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setDescription(sec === 0 ? "Yavaş mod kapatıldı." : `Yavaş mod: **${sec} saniye**`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
