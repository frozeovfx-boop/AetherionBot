import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Collection,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv } from "../../utils/embeds.js";

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
        .addStringOption((o) => o.setName("sebep").setDescription("Sebep").setRequired(false))
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const reason = interaction.options.getString("sebep") ?? "Belirtilmedi";
    afkMap.set(interaction.user.id, { reason, since: Date.now() });

    const embed = baseEmbed(Theme.mute)
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ size: 64 }) })
      .setTitle("AFK")
      .setDescription([line(), kv("Sebep", reason), line()].join("\n"));

    await interaction.reply({ embeds: [embed] });
  }
}
