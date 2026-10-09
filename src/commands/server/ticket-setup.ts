import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

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
        .addChannelOption((opt) =>
          opt
            .setName("kanal")
            .setDescription("Panelin gönderileceği kanal")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel("kanal", true);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🎫 Destek Talebi")
      .setDescription(
        "Yardım mı lazım?\n\nAşağıdaki butona tıklayarak destek talebi oluşturabilirsin.\nYetkili ekibimiz en kısa sürede ilgilenecek."
      )
      .setFooter({ text: "Aetherion Ticket System" })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_create")
        .setLabel("Ticket Oluştur")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("🎫")
    );

    if (!("send" in channel)) {
      await interaction.reply({ content: "Geçersiz kanal.", ephemeral: true });
      return;
    }

    await channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: `Ticket paneli ${channel} kanalına gönderildi.`, ephemeral: true });
  }
}
