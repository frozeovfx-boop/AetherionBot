import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class EmbedCommand extends Command {
  constructor() {
    super({
      name: "embed",
      description: "Basit embed gönderir",
      category: "utility",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageMessages],
      data: new SlashCommandBuilder()
        .setName("embed")
        .setDescription("Basit embed gönderir")
        .addStringOption((opt) => opt.setName("baslik").setDescription("Başlık").setRequired(true))
        .addStringOption((opt) => opt.setName("aciklama").setDescription("Açıklama").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const title = interaction.options.getString("baslik", true);
    const desc = interaction.options.getString("aciklama", true);
    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(title).setDescription(desc).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
