import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class SlowmodeSetCommand extends Command {
  constructor() {
    super({
      name: "slowmode-set",
      description: "Kanal yavaş mod",
      category: "server",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageChannels],
      clientPermissions: [PermissionFlagsBits.ManageChannels],
      data: new SlashCommandBuilder()
        .setName("slowmode-set")
        .setDescription("Kanal yavaş mod")
        .addIntegerOption((o) =>
          o.setName("saniye").setDescription("0-21600").setRequired(true).setMinValue(0).setMaxValue(21600)
        )
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

    const seconds = interaction.options.getInteger("saniye", true);
    await (interaction.channel as TextChannel).setRateLimitPerUser(seconds, `slowmode · ${interaction.user.tag}`);

    const embed = baseEmbed(Theme.info)
      .setAuthor({ name: "SERVER" })
      .setTitle("Slowmode")
      .setDescription(
        [
          line(),
          kv("Kanal", `${interaction.channel}`),
          kv("Süre", code(seconds === 0 ? "Kapalı" : `${seconds}s`)),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
