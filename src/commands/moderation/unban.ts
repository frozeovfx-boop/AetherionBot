import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class UnbanCommand extends Command {
  constructor() {
    super({
      name: "unban",
      description: "Bir kullanıcının yasağını kaldırır",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.BanMembers],
      clientPermissions: [PermissionFlagsBits.BanMembers],
      data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Bir kullanıcının yasağını kaldırır")
        .addStringOption((opt) =>
          opt.setName("kullanici_id").setDescription("Yasağı kaldırılacak kullanıcının ID'si").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("sebep").setDescription("Sebep").setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const userId = interaction.options.getString("kullanici_id", true);
    const reason = interaction.options.getString("sebep") ?? "Sebep belirtilmedi";

    if (!/^\d{17,20}$/.test(userId)) {
      await interaction.reply({ content: "Geçersiz kullanıcı ID'si.", ephemeral: true });
      return;
    }

    try {
      await interaction.guild.members.unban(userId, `${reason} | Yetkili: ${interaction.user.tag}`);
    } catch {
      await interaction.reply({ content: "Bu kullanıcı yasaklı değil veya ID hatalı.", ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("Yasak Kaldırıldı")
      .addFields(
        { name: "Kullanıcı ID", value: `\`${userId}\``, inline: true },
        { name: "Yetkili", value: `${interaction.user.tag}`, inline: true },
        { name: "Sebep", value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
