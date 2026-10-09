import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class ClearWarnsCommand extends Command {
  constructor() {
    super({
      name: "clearwarns",
      description: "Bir kullanıcının uyarılarını temizler (şu an placeholder — DB yakında)",
      category: "moderation",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ModerateMembers],
      data: new SlashCommandBuilder()
        .setName("clearwarns")
        .setDescription("Bir kullanıcının uyarılarını temizler")
        .addUserOption((opt) =>
          opt.setName("kullanici").setDescription("Hedef kullanıcı").setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser("kullanici", true);

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("Uyarılar Temizlendi")
      .setDescription(`${target.tag} kullanıcısının uyarıları temizlendi.\n\n*Not: Kalıcı case sistemi bir sonraki adımda eklenecek.*`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
