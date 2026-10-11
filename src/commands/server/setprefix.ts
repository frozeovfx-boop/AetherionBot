import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class SetprefixCommand extends Command {
  constructor() {
    super({
      name: "setprefix",
      description: "Sunucu prefixini ayarlar",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuild],
      data: new SlashCommandBuilder()
        .setName("setprefix")
        .setDescription("Sunucu prefixini ayarlar")
        .addStringOption((o) =>
          o.setName("prefix").setDescription("Yeni prefix (1-5 karakter)").setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const prefix = interaction.options.getString("prefix", true);
    if (prefix.length < 1 || prefix.length > 5) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.warning).setDescription("Prefix 1-5 karakter olmalı.")],
        ephemeral: true,
      });
      return;
    }

    client.settings.setPrefix(interaction.guild.id, prefix);

    const embed = baseEmbed(Theme.success)
      .setAuthor({ name: "SERVER" })
      .setTitle("Prefix")
      .setDescription([line(), kv("Yeni", code(prefix)), line()].join("\n"));

    await interaction.reply({ embeds: [embed] });
  }
}
