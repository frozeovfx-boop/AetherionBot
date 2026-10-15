import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class StarboardCommand extends Command {
  constructor() {
    super({
      name: "starboard",
      description: "Yıldız tahtası ayarları",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuild],
      data: new SlashCommandBuilder()
        .setName("starboard")
        .setDescription("Yıldız tahtası ayarları")
        .addChannelOption((o) =>
          o
            .setName("kanal")
            .setDescription("Starboard kanalı")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false)
        )
        .addIntegerOption((o) =>
          o.setName("min").setDescription("Minimum ⭐ (varsayılan 3)").setMinValue(1).setMaxValue(50).setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const channel = interaction.options.getChannel("kanal") as TextChannel | null;
    const min = interaction.options.getInteger("min") ?? undefined;

    if (channel) {
      client.settings.setStarboard(interaction.guild.id, channel.id, min);
    } else if (min !== undefined) {
      const cfg = client.settings.get(interaction.guild.id);
      client.settings.setStarboard(interaction.guild.id, cfg.starboardChannelId, min);
    } else {
      client.settings.setStarboard(interaction.guild.id, null);
    }

    const cfg = client.settings.get(interaction.guild.id);
    const embed = baseEmbed(Theme.success)
      .setAuthor({ name: "STARBOARD" })
      .setDescription(
        [
          line(),
          kv("Kanal", cfg.starboardChannelId ? `<#${cfg.starboardChannelId}>` : "Kapalı"),
          kv("Minimum", code(cfg.starboardMin)),
          line(),
          "Mesajlara ⭐ eklenince yeter sayıya ulaşınca tahtaya düşer.",
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
