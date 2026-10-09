import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class SetPrefixCommand extends Command {
  constructor() {
    super({
      name: "setprefix",
      description: "Sunucu prefixini ayarlar (placeholder — DB yakında)",
      category: "server",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageGuild],
      data: new SlashCommandBuilder()
        .setName("setprefix")
        .setDescription("Sunucu prefixini ayarlar")
        .addStringOption((opt) =>
          opt.setName("prefix").setDescription("Yeni prefix (1-5 karakter)").setRequired(true).setMaxLength(5)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const prefix = interaction.options.getString("prefix", true);

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("Prefix Güncellendi")
      .setDescription(`Yeni prefix: \`${prefix}\`\n\n*Kalıcı kayıt bir sonraki adımda eklenecek.*`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
