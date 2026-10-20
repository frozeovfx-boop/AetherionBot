import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { code, kv, yutaOk } from "../../utils/embeds.js";

/** Alias — same as /logset mod */
export default class SetmodlogCommand extends Command {
  constructor() {
    super({
      name: "setmodlog",
      description: "Moderasyon log kanalı (/logset mod ile aynı)",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuild],
      data: new SlashCommandBuilder()
        .setName("setmodlog")
        .setDescription("Moderasyon log kanalı")
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

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const channel = interaction.options.getChannel("kanal") as TextChannel | null;
    client.settings.setModlog(interaction.guild.id, channel?.id ?? null);

    await interaction.reply({
      embeds: [
        yutaOk(
          "Mod log",
          [
            kv("Kanal", channel ? `${channel}` : code("kapalı")),
            "",
            "Ban · kick · warn · timeout buraya düşer.",
            "Aynı ayar: `/logset mod`",
          ].join("\n")
        ),
      ],
    });
  }
}
