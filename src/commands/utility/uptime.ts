import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class UptimeCommand extends Command {
  constructor() {
    super({
      name: "uptime",
      description: "Bot çalışma süresi",
      category: "utility",
      cooldown: 3,
      data: new SlashCommandBuilder().setName("uptime").setDescription("Bot çalışma süresi").toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const ms = client.uptime ?? 0;
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000) % 24;
    const d = Math.floor(ms / 86400000);
    const text = d ? `${d}g ${h}s ${m}d` : h ? `${h}s ${m}d ${s}sn` : `${m}d ${s}sn`;

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: "AETHERION" })
      .setTitle("Uptime")
      .setDescription([line(), kv("Süre", code(text)), kv("Ping", code(`${client.ws.ping}ms`)), line()].join("\n"));

    await interaction.reply({ embeds: [embed] });
  }
}
