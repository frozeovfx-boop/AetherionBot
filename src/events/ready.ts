import { Events, ActivityType, REST, Routes } from "discord.js";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Event } from "../structures/Event.js";
import type { AetherionClient } from "../client/AetherionClient.js";
import type { Command } from "../structures/Command.js";

const MAX_COMMANDS = 100;

const CATEGORY_PRIORITY: Record<string, number> = {
  moderation: 100,
  utility: 90,
  economy: 80,
  music: 70,
  server: 60,
  fun: 40,
  ai: 30,
  admin: 20,
};

async function collectSlashData(): Promise<object[]> {
  const loaded: { data: object; priority: number }[] = [];
  const commandsPath = join(process.cwd(), "src", "commands");
  const categories = await readdir(commandsPath);

  for (const category of categories) {
    const categoryPath = join(commandsPath, category);
    let files: string[];
    try {
      files = await readdir(categoryPath);
    } catch {
      continue;
    }

    for (const file of files) {
      if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;
      try {
        const mod = await import(pathToFileURL(join(categoryPath, file)).href);
        const Cmd = mod.default;
        if (!Cmd) continue;
        const instance: Command = typeof Cmd === "function" ? new Cmd() : Cmd;
        if (!instance?.data) continue;
        loaded.push({
          data: instance.data,
          priority: CATEGORY_PRIORITY[instance.category] ?? 10,
        });
      } catch {
        /* skip broken */
      }
    }
  }

  loaded.sort((a, b) => b.priority - a.priority);
  return loaded.slice(0, MAX_COMMANDS).map((c) => c.data);
}

export default class ReadyEvent extends Event<typeof Events.ClientReady> {
  constructor() {
    super(Events.ClientReady, true);
  }

  public async execute(client: AetherionClient): Promise<void> {
    client.logger.info(`Logged in as ${client.user?.tag}`);
    client.logger.info(`Serving ${client.guilds.cache.size} guilds · ${client.commands.size} commands`);

    // Presence
    const updatePresence = () => {
      const n = client.guilds.cache.size;
      client.user?.setPresence({
        activities: [
          {
            name: `${n} sunucu · /help`,
            type: ActivityType.Watching,
          },
        ],
        status: "online",
      });
    };
    updatePresence();
    setInterval(updatePresence, 10 * 60_000);

    // Auto deploy slash commands (guild if DISCORD_GUILD_ID, else global)
    try {
      const body = await collectSlashData();
      const rest = new REST({ version: "10" }).setToken(client.config.DISCORD_TOKEN);
      const clientId = client.config.DISCORD_CLIENT_ID;
      const guildId = client.config.DISCORD_GUILD_ID;

      if (guildId) {
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });
        client.logger.info(`Slash commands deployed to guild ${guildId} (${body.length})`);
      } else {
        await rest.put(Routes.applicationCommands(clientId), { body });
        client.logger.info(`Global slash commands deployed (${body.length})`);
      }
    } catch (err) {
      client.logger.error(err, "Auto deploy failed");
    }
  }
}
