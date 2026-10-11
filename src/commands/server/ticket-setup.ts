import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
  ChannelType,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

export default class TicketSetupCommand extends Command {
  constructor() {
    super({
      name: "ticket-setup",
      description: "Ticket paneli oluşturur",
      category: "server",
      cooldown: 10,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuild],
      data: new SlashCommandBuilder()
        .setName("ticket-setup")
        .setDescription("Ticket paneli oluşturur")
        .addChannelOption((o) =>
          o
            .setName("kanal")
            .setDescription("Panel kanalı")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel("kanal", true) as TextChannel;

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: "DESTEK", iconURL: interaction.guild?.iconURL({ size: 64 }) ?? undefined })
      .setTitle("Ticket Sistemi")
      .setDescription(
        [
          line(),
          "Destek almak için aşağıdaki butona tıkla.",
          "Her kullanıcı için tek açık ticket.",
          line(),
        ].join("\n")
      )
      .setFooter({ text: "Aetherion Support" });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_create")
        .setLabel("Ticket Aç")
        .setStyle(ButtonStyle.Primary)
    );

    await channel.send({ embeds: [embed], components: [row] });

    await interaction.reply({
      embeds: [
        baseEmbed(Theme.success)
          .setTitle("Panel Hazır")
          .setDescription(`Ticket paneli ${channel} kanalına gönderildi.`),
      ],
      ephemeral: true,
    });
  }
}
