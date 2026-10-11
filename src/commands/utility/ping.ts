import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../../structures/Command.js";
import type { AetherionClient } from "../../client/AetherionClient.js";
import { Theme, baseEmbed, code } from "../../utils/embeds.js";

export default class PingCommand extends Command {
  constructor() {
    super({
      name: "ping",
      description: "Bot gecikmesini gösterir",
      category: "utility",
      cooldown: 3,
      data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Bot gecikmesini gösterir")
        .toJSON(),
    });
  }

  public async execute(client: AetherionClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const sent = await interaction.reply({ content: "⋯ ölçülüyor", fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const api = Math.round(client.ws.ping);

    const bar = (ms: number) => {
      if (ms < 80) return "█████";
      if (ms < 150) return "████░";
      if (ms < 250) return "███░░";
      return "██░░░";
    };

    const embed = baseEmbed(Theme.primary)
      .setTitle("◈ Bağlantı")
      .setDescription(
        [
          `**Mesaj**  ${code(`${latency}ms`)}  \`${bar(latency)}\``,
          `**API**    ${code(`${api}ms`)}  \`${bar(api)}\``,
          `**Uptime** ${code(formatUptime(client.uptime ?? 0))}`,
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
