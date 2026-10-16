import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../structures/Command.js";
import type { YutaClient } from "../../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../../utils/embeds.js";
import { isPostgresEnabled } from "../../database/postgres.js";

export default class StatusCommand extends Command {
  constructor() {
    super({
      name: "status",
      description: "Sistem sağlığı (owner)",
      category: "admin",
      cooldown: 5,
      ownerOnly: true,
      data: new SlashCommandBuilder()
        .setName("status")
        .setDescription("Sistem sağlığı")
        .toJSON(),
    });
  }

  public async execute(client: YutaClient, interaction: ChatInputCommandInteraction): Promise<void> {
    const mem = process.memoryUsage();
    const embed = baseEmbed(Theme.primary)
      .setAuthor({ name: "STATUS" })
      .setDescription(
        [
          line(),
          kv("Guild", code(client.guilds.cache.size)),
          kv("Ping", code(`${Math.round(client.ws.ping)}ms`)),
          kv("Uptime", code(`${Math.floor(process.uptime())}s`)),
          kv("RSS", code(`${Math.round(mem.rss / 1024 / 1024)}MB`)),
          kv("Postgres", isPostgresEnabled() ? "**on**" : code("json only")),
          kv("Lavalink", client.music.lavalinkReady ? "**online**" : code("offline")),
          kv("Giveaway", code(client.giveaways.active().length)),
          kv("Tempban", code(client.tempbans.all().length)),
          line(),
        ].join("\n")
      );
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
