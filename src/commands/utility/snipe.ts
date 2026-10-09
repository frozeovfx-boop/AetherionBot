import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class SnipeCommand extends Command {
  constructor() {
    super({
      name: "snipe",
      description: "Son silinen mesajı gösterir (placeholder — event yakında)",
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
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Snipe")
      .setDescription("Silinen mesaj yakalama sistemi bir sonraki adımda eklenecek.\n`messageDelete` event + cache hazırlanıyor.")
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
