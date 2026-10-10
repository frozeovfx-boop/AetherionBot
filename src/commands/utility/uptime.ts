import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";

export default class UptimeCommand extends Command {
  constructor() {
    super({
      name: "uptime",
      description: "Bot çalışma süresini gösterir",
      category: "utility",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("uptime")
        .setDescription("Bot çalışma süresini gösterir")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const ms = client.uptime ?? 0;
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000) % 24;
    const d = Math.floor(ms / 86400000);
    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("Uptime")
      .setDescription(`**${d}g ${h}s ${m}d ${s}sn**`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
