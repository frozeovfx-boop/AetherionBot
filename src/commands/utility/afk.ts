import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Collection } from "discord.js";

export const afkMap = new Collection<string, { reason: string; since: number }>();

export default class AfkCommand extends Command {
  constructor() {
    super({
      name: "afk",
      description: "AFK moduna geç",
      category: "utility",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("afk")
        .setDescription("AFK moduna geç")
        .addStringOption((opt) =>
          opt.setName("sebep").setDescription("AFK sebebi").setRequired(false)
        )
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const reason = interaction.options.getString("sebep") ?? "Belirtilmedi";
    afkMap.set(interaction.user.id, { reason, since: Date.now() });

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setDescription(`AFK modundasın: **${reason}**`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
