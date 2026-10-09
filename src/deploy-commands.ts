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
    const files = await readdir(categoryPath);

    for (const file of files) {
      if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;

      const filePath = join(categoryPath, file);
      const commandModule = await import(pathToFileURL(filePath).href);
      const command: Command = commandModule.default ?? commandModule.command;

      if (command?.data) {
        commands.push(command.data);
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
      logger.info(`Successfully reloaded guild commands.`);
    } else {
      await rest.put(Routes.applicationCommands(config.DISCORD_CLIENT_ID), { body: commands });
      logger.info(`Successfully reloaded global commands.`);
    }
  } catch (error) {
    logger.error(error, "Failed to deploy commands");
    process.exit(1);
  }
}

deploy();
