import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class DeafenCommand extends Command {
  constructor() {
    super({
      name: "deafen",
      description: "Kullanıcıyı sağırlaştırır / sağırlaştırmayı kaldırır",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.DeafenMembers],
      clientPermissions: [PermissionFlagsBits.DeafenMembers],
      data: new SlashCommandBuilder()
        .setName("deafen")
        .setDescription("Kullanıcıyı sağırlaştırır / sağırlaştırmayı kaldırır")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef kullanıcı").setRequired(true)
        )
        .addBooleanOption((opt) =>
          opt.setName("sagirlastir").setDescription("true = sağırlaştır, false = kaldır").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("sebep").setDescription("Sebep").setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.DeafenMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const deaf = interaction.options.getBoolean("sagirlastir", true);
    const reason = interaction.options.getString("sebep") ?? "Deafen";

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      await interaction.reply({ content: "Kullanıcı sunucuda bulunamadı.", ephemeral: true });
      return;
    }

    if (!member.voice.channel) {
      await interaction.reply({ content: "Kullanıcı bir ses kanalında değil.", ephemeral: true });
      return;
    }

    await member.voice.setDeaf(deaf, `${reason} | Yetkili: ${interaction.user.tag}`);

    const embed = new EmbedBuilder()
      .setColor(deaf ? 0xfee75c : 0x57f287)
      .setTitle(deaf ? "Sağırlaştırıldı" : "Sağırlaştırma Kaldırıldı")
      .addFields(
        { name: "Kullanıcı", value: `${target.tag}`, inline: true },
        { name: "Yetkili", value: interaction.user.tag, inline: true },
        { name: "Sebep", value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
