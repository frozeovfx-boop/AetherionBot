import { REST, Routes } from "discord.js";
import { config } from "./config/index.js";
import { logger } from "./utils/logger.js";
import { collectSlashCommands } from "./utils/slashDeploy.js";

async function deploy() {
  const { selected, blocked, cut } = await collectSlashCommands();
  const body = selected.map((c) => c.data);

  logger.info(`slash  ${selected.length} · blocked ${blocked}${cut.length ? ` · cut ${cut.length}` : ""}`);
  logger.info(`top    ${selected.slice(0, 12).map((c) => c.name).join(" · ")}`);

  const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);
  try {
    if (config.DISCORD_GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, config.DISCORD_GUILD_ID),
        { body }
      );
      logger.info(`ok     guild deploy (${config.DISCORD_GUILD_ID})`);
    } else {
      await rest.put(Routes.applicationCommands(config.DISCORD_CLIENT_ID), { body });
      logger.info("ok     global deploy");
    }
  } catch (error) {
    logger.error(error, "slash deploy failed");
    process.exit(1);
  }
}

deploy();
