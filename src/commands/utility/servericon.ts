import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class ServericonCommand extends Command {
  constructor() {
    super({
      name: "servericon",
      description: "Sunucu ikonunu gösterir",
      category: "utility",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("servericon")
        .setDescription("Sunucu ikonunu gösterir")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const icon = interaction.guild.iconURL({ size: 4096 });
    if (!icon) {
      await interaction.reply({ content: "Sunucunun ikonu yok.", ephemeral: true });
      return;
    }
    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(interaction.guild.name).setImage(icon).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
