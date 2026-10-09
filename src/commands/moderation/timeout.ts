import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class TimeoutCommand extends Command {
  constructor() {
    super({
      name: "timeout",
      description: "Bir kullanıcıya timeout uygular (mute)",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
      clientPermissions: [PermissionFlagsBits.ModerateMembers],
      data: new SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Bir kullanıcıya timeout uygular")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Timeout uygulanacak kullanıcı").setRequired(true)
        )
        .addIntegerOption((opt) =>
          opt
            .setName("sure")
            .setDescription("Süre (dakika)")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(40320)
        )
        .addStringOption((opt) =>
          opt.setName("sebep").setDescription("Sebep").setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const minutes = interaction.options.getInteger("sure", true);
    const reason = interaction.options.getString("sebep") ?? "Sebep belirtilmedi";

    if (target.id === interaction.user.id) {
      await interaction.reply({ content: "Kendine timeout uygulayamazsın.", ephemeral: true });
      return;
    }

    if (target.id === client.user?.id) {
      await interaction.reply({ content: "Bana timeout uygulayamazsın.", ephemeral: true });
      return;
    }

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      await interaction.reply({ content: "Bu kullanıcı sunucuda değil.", ephemeral: true });
      return;
    }

    if (!member.moderatable) {
      await interaction.reply({ content: "Bu kullanıcıya timeout uygulayamıyorum.", ephemeral: true });
      return;
    }

    const duration = minutes * 60 * 1000;

    await member.timeout(duration, `${reason} | Yetkili: ${interaction.user.tag}`);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Timeout Uygulandı")
      .addFields(
        { name: "Kullanıcı", value: `${target.tag} (\`${target.id}\`)`, inline: true },
        { name: "Süre", value: `${minutes} dakika`, inline: true },
        { name: "Yetkili", value: `${interaction.user.tag}`, inline: true },
        { name: "Sebep", value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
