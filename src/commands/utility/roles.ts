import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class RolesCommand extends Command {
  constructor() {
    super({
      name: "roles",
      description: "Sunucu rollerini listeler",
      category: "utility",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder()
        .setName("roles")
        .setDescription("Sunucu rollerini listeler")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;
    const roles = interaction.guild.roles.cache
      .filter((r) => r.id !== interaction.guild!.id)
      .sort((a, b) => b.position - a.position)
      .map((r) => r.toString())
      .slice(0, 50);
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`Roller (${interaction.guild.roles.cache.size - 1})`)
      .setDescription(roles.join(" ") || "Rol yok")
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
