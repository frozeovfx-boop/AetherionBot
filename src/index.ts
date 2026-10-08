import { AetherionClient } from "./client/AetherionClient.js";
import { loadCommands } from "./handlers/commandHandler.js";
import { loadEvents } from "./handlers/eventHandler.js";
import { logger } from "./utils/logger.js";

async function main() {
  const client = new AetherionClient();

  try {
    await loadEvents(client);
    await loadCommands(client);
    await client.start();
  } catch (error) {
    logger.fatal(error, "Failed to start Aetherion");
    process.exit(1);
  }
}

main();
