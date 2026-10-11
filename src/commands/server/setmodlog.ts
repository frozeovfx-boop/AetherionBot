import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

export default class SetmodlogCommand extends Command {
  constructor() {
    super({
      name: "setmodlog",
      description: "Moderasyon log kanalını ayarlar",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuild],
      data: new SlashCommandBuilder()
        .setName("setmodlog")
        .setDescription("Moderasyon log kanalını ayarlar")
        .addChannelOption((o) =>
          o
            .setName("kanal")
            .setDescription("Log kanalı (boş = kapat)")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const channel = interaction.options.getChannel("kanal") as TextChannel | null;
    client.settings.setModlog(interaction.guild.id, channel?.id ?? null);

    const embed = baseEmbed(channel ? Theme.success : Theme.mute)
      .setAuthor({ name: "SERVER" })
      .setTitle("Modlog")
      .setDescription(
        [
          line(),
          kv("Kanal", channel ? `${channel}` : "Kapalı"),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
