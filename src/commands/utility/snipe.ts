import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { snipeCache } from "../../utils/snipe.js";

export default class SnipeCommand extends Command {
  constructor() {
    super({
      name: "snipe",
      description: "Son silinen mesajı gösterir",
      category: "utility",
      cooldown: 5,
      guildOnly: true,
      permissions: [PermissionFlagsBits.ManageMessages],
      data: new SlashCommandBuilder()
        .setName("snipe")
        .setDescription("Son silinen mesajı gösterir")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.channel) return;

    const data = snipeCache.get(interaction.channel.id);
    if (!data) {
      await interaction.reply({ content: "Bu kanalda silinen mesaj yok.", ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setAuthor({ name: data.authorTag, iconURL: data.authorAvatar || undefined })
      .setDescription(data.content.slice(0, 2000))
      .setFooter({ text: `Silindi` })
      .setTimestamp(data.createdAt);

    if (data.attachments.length > 0) {
      embed.addFields({ name: "Ekler", value: data.attachments.map((u) => `[Dosya](${u})`).join("\n") });
      if (data.attachments[0]?.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
        embed.setImage(data.attachments[0]);
      }
    }

    await interaction.reply({ embeds: [embed] });
  }
}
