import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
  ChannelType,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

export default class AnnounceCommand extends Command {
  constructor() {
    super({
      name: "announce",
      description: "Duyuru gönderir",
      category: "server",
      cooldown: 10,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuild],
      data: new SlashCommandBuilder()
        .setName("announce")
        .setDescription("Duyuru gönderir")
        .addStringOption((o) => o.setName("mesaj").setDescription("Duyuru metni").setRequired(true))
        .addChannelOption((o) =>
          o
            .setName("kanal")
            .setDescription("Kanal")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString("mesaj", true);
    const channel = (interaction.options.getChannel("kanal") ?? interaction.channel) as TextChannel;

    const embed = baseEmbed(Theme.primary)
      .setAuthor({
        name: "DUYURU",
        iconURL: interaction.guild?.iconURL({ size: 64 }) ?? undefined,
      })
      .setDescription([line(), text.slice(0, 4000), line()].join("\n"))
      .setFooter({ text: interaction.user.tag });

    await channel.send({ embeds: [embed] });
    await interaction.reply({
      embeds: [baseEmbed(Theme.success).setDescription(`Duyuru ${channel} kanalına gönderildi.`)],
      ephemeral: true,
    });
  }
}
