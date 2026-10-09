import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class KickCommand extends Command {
  constructor() {
    super({
      name: "kick",
      description: "Bir kullanıcıyı sunucudan atar",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.KickMembers],
      clientPermissions: [PermissionFlagsBits.KickMembers],
      data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Bir kullanıcıyı sunucudan atar")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Atılacak kullanıcı").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("sebep").setDescription("Atılma sebebi").setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const reason = interaction.options.getString("sebep") ?? "Sebep belirtilmedi";

    if (target.id === interaction.user.id) {
      await interaction.reply({ content: "Kendini atamazsın.", ephemeral: true });
      return;
    }

    if (target.id === client.user?.id) {
      await interaction.reply({ content: "Beni atamazsın.", ephemeral: true });
      return;
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      await interaction.reply({ content: "Bu kullanıcı sunucuda değil.", ephemeral: true });
      return;
    }

    if (!member.kickable) {
      await interaction.reply({ content: "Bu kullanıcıyı atamıyorum (yetki/rol hiyerarşisi).", ephemeral: true });
      return;
    }

    if (
      interaction.member &&
      "roles" in interaction.member &&
      member.roles.highest.position >= interaction.member.roles.highest.position &&
      interaction.guild.ownerId !== interaction.user.id
    ) {
      await interaction.reply({ content: "Bu kullanıcı senden yüksek veya eşit role sahip.", ephemeral: true });
      return;
    }

    await member.kick(`${reason} | Yetkili: ${interaction.user.tag}`);

    const embed = new EmbedBuilder()
      .setColor(0xfaa61a)
      .setTitle("Kullanıcı Atıldı")
      .addFields(
        { name: "Kullanıcı", value: `${target.tag} (\`${target.id}\`)`, inline: true },
        { name: "Yetkili", value: `${interaction.user.tag}`, inline: true },
        { name: "Sebep", value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
