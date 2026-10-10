import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class ServerbannerCommand extends Command {
  constructor() {
    super({
      name: "serverbanner",
      description: "Sunucu bannerını gösterir",
      category: "utility",
      cooldown: 3,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("serverbanner")
        .setDescription("Sunucu bannerını gösterir")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const banner = interaction.guild.bannerURL({ size: 4096 });
    if (!banner) {
      await interaction.reply({ content: "Sunucunun bannerı yok.", ephemeral: true });
      return;
    }
    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(interaction.guild.name).setImage(banner).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
