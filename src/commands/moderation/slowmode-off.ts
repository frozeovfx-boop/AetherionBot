import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class SlowmodeOffCommand extends Command {
  constructor() {
    super({
      name: "slowmode-off",
      description: "Yavaş modu kapatır",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageChannels],
      clientPermissions: [PermissionFlagsBits.ManageChannels],
      data: new SlashCommandBuilder()
        .setName("slowmode-off")
        .setDescription("Yavaş modu kapatır")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.channel || !("setRateLimitPerUser" in interaction.channel)) {
      await interaction.reply({ content: "Bu kanalda kullanılamaz.", ephemeral: true });
      return;
    }
    await (interaction.channel as TextChannel).setRateLimitPerUser(0, `slowmode-off | ${interaction.user.tag}`);
    const embed = new EmbedBuilder().setColor(0x57f287).setDescription("Yavaş mod kapatıldı.").setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
