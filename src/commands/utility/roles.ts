import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, code } from "../../utils/embeds.js";

export default class RolesCommand extends Command {
  constructor() {
    super({
      name: "roles",
      description: "Sunucu rollerini listeler",
      category: "utility",
      cooldown: 5,
      guildOnly: true,
      data: new SlashCommandBuilder().setName("roles").setDescription("Sunucu rollerini listeler").toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const g = interaction.guild!;
    const roles = g.roles.cache
      .filter((r) => r.id !== g.id)
      .sort((a, b) => b.position - a.position)
      .map((r) => r.toString())
      .slice(0, 40);

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: g.name, iconURL: g.iconURL({ size: 64 }) ?? undefined })
      .setTitle(`Roller · ${code(g.roles.cache.size - 1)}`)
      .setDescription([line(), roles.join(" ") || "—", line()].join("\n"));

    await interaction.reply({ embeds: [embed] });
  }
}
