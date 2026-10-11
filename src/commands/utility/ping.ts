import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, code } from "../../utils/embeds.js";
import { tg } from "../../i18n/index.js";

export default class PingCommand extends Command {
  constructor() {
    super({
      name: "ping",
      description: "Bot gecikmesini gösterir / Bot latency",
      category: "utility",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Bot latency / Gecikme")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const gid = interaction.guildId;
    const sent = await interaction.reply({
      content: tg(gid, "ping.measuring"),
      fetchReply: true,
    });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const api = Math.round(client.ws.ping);

    const bar = (ms: number) => {
      if (ms < 80) return "█████";
      if (ms < 150) return "████░";
      if (ms < 250) return "███░░";
      return "██░░░";
    };

    const embed = baseEmbed(Theme.primary)
      .setTitle(tg(gid, "ping.title"))
      .setDescription(
        [
          `**${tg(gid, "ping.latency")}**  ${code(`${latency}ms`)}  \`${bar(latency)}\``,
          `**${tg(gid, "ping.api")}**    ${code(`${api}ms`)}  \`${bar(api)}\``,
          `**${tg(gid, "ping.uptime")}** ${code(formatUptime(client.uptime ?? 0))}`,
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
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}
