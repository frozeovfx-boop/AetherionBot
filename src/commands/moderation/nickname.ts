import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class NicknameCommand extends Command {
  constructor() {
    super({
      name: "nickname",
      description: "Bir kullanıcının takma adını değiştirir",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageNicknames],
      clientPermissions: [PermissionFlagsBits.ManageNicknames],
      data: new SlashCommandBuilder()
        .setName("nickname")
        .setDescription("Bir kullanıcının takma adını değiştirir")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef kullanıcı").setRequired(true)
        )
        .addStringOption((opt) =>
          opt.setName("takma_ad").setDescription("Yeni takma ad (boş bırakırsan sıfırlar)").setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const nickname = interaction.options.getString("takma_ad");

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      await interaction.reply({ content: "Kullanıcı sunucuda bulunamadı.", ephemeral: true });
      return;
    }

    if (!member.manageable) {
      await interaction.reply({ content: "Bu kullanıcının takma adını değiştiremiyorum.", ephemeral: true });
      return;
    }

    const oldNick = member.nickname ?? member.user.username;
    await member.setNickname(nickname, `Nickname | Yetkili: ${interaction.user.tag}`);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Takma Ad Güncellendi")
      .addFields(
        { name: "Kullanıcı", value: `${target.tag}`, inline: true },
        { name: "Eski", value: oldNick, inline: true },
        { name: "Yeni", value: nickname ?? "Sıfırlandı", inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
