import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

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
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Bu kanalda slowmode yok.")],
        ephemeral: true,
      });
      return;
    }

    await (interaction.channel as TextChannel).setRateLimitPerUser(0, `slowmode-off · ${interaction.user.tag}`);

    const embed = baseEmbed(Theme.success)
      .setAuthor({ name: "MODERASYON" })
      .setTitle("Slowmode Kapalı")
      .setDescription(
        [
          line(),
          kv("Kanal", `${interaction.channel}`),
          kv("Yetkili", interaction.user.tag),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
