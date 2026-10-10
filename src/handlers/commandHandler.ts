import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { AetherionClient } from "../client/AetherionClient.js";
import type { Command } from "../structures/Command.js";
import { logger } from "../utils/logger.js";

export async function loadCommands(client: AetherionClient): Promise<void> {
  const commandsPath = join(process.cwd(), "src", "commands");
  const categories = await readdir(commandsPath);

  let loaded = 0;

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

        if (!command?.name) {
          logger.warn(`Skipping invalid command file: ${file}`);
          continue;
        }

        client.commands.set(command.name, command);
        loaded++;
      } catch (err) {
        logger.warn({ err, file }, `Failed to load command`);
      }
    }
  }

  logger.info(`Loaded ${loaded} commands`);
}
