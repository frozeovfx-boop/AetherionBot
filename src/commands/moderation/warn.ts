import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class WarnCommand extends Command {
  constructor() {
    super({
      name: "warn",
      description: "Bir kullanıcıyı uyarır",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
      data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Bir kullanıcıyı uyarır")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Uyarılan kullanıcı").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("sebep").setDescription("Uyarı sebebi").setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const reason = interaction.options.getString("sebep", true);

    if (target.id === interaction.user.id) {
      await interaction.reply({ content: "Kendini uyaramazsın.", ephemeral: true });
      return;
    }

    if (target.bot) {
      await interaction.reply({ content: "Botları uyaramazsın.", ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setTitle("Kullanıcı Uyarıldı")
      .addFields(
        { name: "Kullanıcı", value: `${target.tag} (\`${target.id}\`)`, inline: true },
        { name: "Yetkili", value: `${interaction.user.tag}`, inline: true },
        { name: "Sebep", value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // DM attempt
    try {
      const dmEmbed = new EmbedBuilder()
        .setColor(0xfee75c)
        .setTitle(`Uyarı — ${interaction.guild.name}`)
        .setDescription(`**Sebep:** ${reason}`)
        .setTimestamp();
      await target.send({ embeds: [dmEmbed] });
    } catch {
      // User has DMs closed
    }
  }
}
