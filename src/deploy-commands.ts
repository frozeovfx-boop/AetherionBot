import { REST, Routes } from "discord.js";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { config } from "./config/index.js";
import { logger } from "./utils/logger.js";
import type { Command } from "./structures/Command.js";

/** Discord max: 100 chat-input commands per guild / global scope */
const MAX_COMMANDS = 100;

/** Higher = deployed first when over limit */
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

async function deploy() {
  const loaded: { name: string; category: string; data: object; priority: number }[] = [];
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
        const filePath = join(categoryPath, file);
        const commandModule = await import(pathToFileURL(filePath).href);
        const raw = commandModule.default ?? commandModule.command;
        if (!raw) continue;

        const command: Command =
          typeof raw === "function" ? new (raw as new () => Command)() : raw;

        if (command?.data) {
          loaded.push({
            name: command.name,
            category: command.category,
            data: command.data as object,
            priority: CATEGORY_PRIORITY[command.category] ?? 10,
          });
        }
      } catch (err) {
        logger.warn({ err, file }, "Skipping command file during deploy");
      }
    }
  }

  loaded.sort((a, b) => b.priority - a.priority || a.name.localeCompare(b.name));

  const selected = loaded.slice(0, MAX_COMMANDS);
  const skipped = loaded.length - selected.length;
  const body = selected.map((c) => c.data);

  if (skipped > 0) {
    logger.warn(
      `Discord limit is ${MAX_COMMANDS} slash commands. Deploying ${selected.length}, skipping ${skipped} (mostly low-priority fun).`
    );
  }

  const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

  try {
    logger.info(`Started refreshing ${body.length} application (/) commands.`);

    if (config.DISCORD_GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, config.DISCORD_GUILD_ID),
        { body }
      );
      logger.info(`Successfully reloaded ${body.length} guild commands.`);
    } else {
      await rest.put(Routes.applicationCommands(config.DISCORD_CLIENT_ID), { body });
      logger.info(`Successfully reloaded ${body.length} global commands.`);
    }

    logger.info(
      `Deployed categories sample: ${[...new Set(selected.map((c) => c.category))].join(", ")}`
    );
  } catch (error) {
    logger.error(error, "Failed to deploy commands");
    process.exit(1);
  }
}

deploy();
