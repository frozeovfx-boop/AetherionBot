import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  version as djsVersion,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";

export default class BotinfoCommand extends Command {
  constructor() {
    super({
      name: "botinfo",
      description: "Bot bilgileri",
      category: "utility",
      cooldown: 5,
      data: new SlashCommandBuilder().setName("botinfo").setDescription("Bot bilgileri").toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const users = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
    const ms = client.uptime ?? 0;
    const uptime = formatUptime(ms);

    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: "YUTA", iconURL: client.user?.displayAvatarURL({ size: 64 }) })
      .setTitle("Sistem")
      .setThumbnail(client.user?.displayAvatarURL({ size: 256 }) ?? null)
      .setDescription(
        [
          line(),
          kv("Sunucular", code(client.guilds.cache.size)),
          kv("Kullanıcılar", code(users.toLocaleString())),
          kv("Komutlar", code(client.commands.size)),
          kv("Ping", code(`${client.ws.ping}ms`)),
          kv("Uptime", code(uptime)),
          kv("Node", code(process.version)),
          kv("d.js", code(djsVersion)),
          line(),
        ].join("\n")
      );

    await interaction.reply({ embeds: [embed] });
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
