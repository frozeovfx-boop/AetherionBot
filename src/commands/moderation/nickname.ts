import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class NicknameCommand extends Command {
  constructor() {
    super({
      name: "nickname",
      description: "Kullanıcı takma adını değiştirir",
      category: "moderation",
      cooldown: 3,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageNicknames],
      clientPermissions: [PermissionFlagsBits.ManageNicknames],
      data: new SlashCommandBuilder()
        .setName("nickname")
        .setDescription("Kullanıcı takma adını değiştirir")
        .addUserOption((o) => o.setName("kullanici").setDescription("Hedef").setRequired(true))
        .addStringOption((o) => o.setName("takma_ad").setDescription("Yeni ad (boş = sıfırla)").setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    const target = interaction.options.getUser("kullanici", true);
    const nick = interaction.options.getString("takma_ad");
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member?.manageable) {
      await interaction.reply({
        embeds: [baseEmbed(Theme.danger).setDescription("Bu kullanıcının adı değiştirilemez.")],
        ephemeral: true,
      });
      return;
    }

    await member.setNickname(nick, `nickname · ${interaction.user.tag}`);

    const embed = baseEmbed(Theme.info)
      .setAuthor({ name: "MODERASYON" })
      .setTitle("Takma Ad")
      .setDescription(
        [
          line(),
          kv("Kullanıcı", target.tag),
          kv("Yeni ad", nick ? code(nick) : "*sıfırlandı*"),
          kv("Yetkili", interaction.user.tag),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }
}
