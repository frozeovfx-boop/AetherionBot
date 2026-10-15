import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class PingCommand extends Command {
  constructor() {
    super({
      name: "ping",
      description: "Bot gecikmesi",
      category: "utility",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Bot gecikmesi")
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const sent = await interaction.reply({ content: "…", fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const api = Math.round(client.ws.ping);

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: "PING" })
      .setDescription(
        [
          line(),
          kv("Gecikme", code(`${latency}ms`)),
          kv("API", code(`${api}ms`)),
          kv("Uptime", code(formatUptime(client.uptime ?? 0))),
          line(),
        ].join("\n")
      );

    await interaction.editReply({ content: null, embeds: [embed] });
  }
}

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000) % 24;
  const d = Math.floor(ms / 86400000);
  if (d) return `${d}g ${h}s`;
  if (h) return `${h}s ${m}d`;
  return `${m}d ${s}sn`;
}
