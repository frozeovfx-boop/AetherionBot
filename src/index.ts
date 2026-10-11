import { AetherionClient } from "./client/AetherionClient.js";
import { loadCommands } from "./handlers/commandHandler.js";
import { loadEvents } from "./handlers/eventHandler.js";
import { logger } from "./utils/logger.js";
import { bindGuildSettings } from "./i18n/index.js";

async function main() {
  const client = new AetherionClient();

  try {
    await client.economy.init();
    await client.cases.init();
    await client.inventory.init();
    await client.settings.init(client.config.PREFIX);
    bindGuildSettings(client.settings);
    await client.music.init();
    logger.info("Stores ready: economy · cases · inventory · guilds");

    await loadEvents(client);
    await loadCommands(client);
    await client.start();
  } catch (error) {
    logger.fatal(error, "Failed to start Aetherion");
    process.exit(1);
  }
}

main();
