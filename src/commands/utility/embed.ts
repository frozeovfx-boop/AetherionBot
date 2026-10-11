import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line } from "../../utils/embeds.js";

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
        .addStringOption((o) => o.setName("baslik").setDescription("Başlık").setRequired(true))
        .addStringOption((o) => o.setName("aciklama").setDescription("Açıklama").setRequired(true))
        .addStringOption((o) => o.setName("renk").setDescription("Hex (5865F2)").setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const title = interaction.options.getString("baslik", true);
    const desc = interaction.options.getString("aciklama", true);
    const hex = interaction.options.getString("renk");
    let color = Theme.primary as number;
    if (hex) {
      const parsed = parseInt(hex.replace("#", ""), 16);
      if (!Number.isNaN(parsed)) color = parsed;
    }

    const embed = baseEmbed(color)
      .setTitle(title.slice(0, 200))
      .setDescription(desc.slice(0, 4000));

    await interaction.reply({ content: "✓", ephemeral: true });
    await interaction.channel?.send({ embeds: [embed] });
  }
}
