import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class PurgeCommand extends Command {
  constructor() {
    super({
      name: "purge",
      description: "Belirtilen sayıda mesajı siler",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageMessages],
      clientPermissions: [PermissionFlagsBits.ManageMessages],
      data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Belirtilen sayıda mesajı siler")
        .addIntegerOption((opt) =>
          opt
            .setName("miktar")
            .setDescription("Silinecek mesaj sayısı (1-100)")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
        )
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Sadece bu kullanıcının mesajlarını sil").setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild || !interaction.channel?.isTextBased()) return;

    const amount = interaction.options.getInteger("miktar", true);
    const targetUser = interaction.options.getUser("kullanici");

    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.channel as TextChannel;

    let deletedCount = 0;

    if (targetUser) {
      const messages = await channel.messages.fetch({ limit: 100 });
      const filtered = messages.filter((m) => m.author.id === targetUser.id).first(amount);
      if (filtered.length > 0) {
        const deleted = await channel.bulkDelete(filtered, true);
        deletedCount = deleted.size;
      }
    } else {
      const deleted = await channel.bulkDelete(amount, true);
      deletedCount = deleted.size;
    }

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setDescription(`**${deletedCount}** mesaj silindi.`)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
}
