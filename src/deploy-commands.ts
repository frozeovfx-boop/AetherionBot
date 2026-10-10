import { REST, Routes } from "discord.js";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { config } from "./config/index.js";
import { logger } from "./utils/logger.js";
import type { Command } from "./structures/Command.js";

async function deploy() {
  const commands: object[] = [];
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

        // Class export → instantiate; already instance → use as-is
        const command: Command =
          typeof raw === "function" ? new (raw as new () => Command)() : raw;

        if (command?.data) {
          commands.push(command.data);
        }
      } catch (err) {
        logger.warn({ err, file }, `Skipping command file during deploy`);
      }
    }
  }

  const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

  try {
    logger.info(`Started refreshing ${commands.length} application (/) commands.`);

    if (config.DISCORD_GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, config.DISCORD_GUILD_ID),
        { body: commands }
      );
      logger.info(`Successfully reloaded ${commands.length} guild commands.`);
    } else {
      await rest.put(Routes.applicationCommands(config.DISCORD_CLIENT_ID), { body: commands });
      logger.info(`Successfully reloaded ${commands.length} global commands.`);
    }
  } catch (error) {
    logger.error(error, "Failed to deploy commands");
    process.exit(1);
  }
}

deploy();
