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
    const files = await readdir(categoryPath);

    for (const file of files) {
      if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;

      const filePath = join(categoryPath, file);
      const commandModule = await import(pathToFileURL(filePath).href);
      const command: Command = commandModule.default ?? commandModule.command;

      if (!command?.name) {
        logger.warn(`Skipping invalid command file: ${file}`);
        continue;
      }

      client.commands.set(command.name, command);
      loaded++;
    }
  }

  logger.info(`Loaded ${loaded} commands`);
}
