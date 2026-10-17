import { YutaClient } from "./client/YutaClient.js";
import { loadCommands } from "./handlers/commandHandler.js";
import { loadEvents } from "./handlers/eventHandler.js";
import { logger } from "./utils/logger.js";
import { bindGuildSettings } from "./i18n/index.js";
import { initPostgres } from "./database/postgres.js";

async function main() {
  const client = new YutaClient();

  try {
    await initPostgres();
    await client.economy.init();
    await client.cases.init();
    await client.inventory.init();
    await client.settings.init(client.config.PREFIX);
    bindGuildSettings(client.settings);
    await client.music.init();
    await client.seen.init();
    await client.capsules.init();
    await client.aura.init();
    await client.birthdays.init();
    await client.invites.init();
    await client.selfroles.init();
    await client.stats.init();
    await client.giveaways.init();
    await client.tempbans.init();
    await client.usage.init();
    logger.info("Stores ready: economy · cases · inventory · guilds · seen · capsules · aura · birthdays · stats");

    await loadEvents(client);
    await loadCommands(client);
    await client.start();
  } catch (error) {
    logger.fatal(error, "Failed to start Megumi");
    process.exit(1);
  }
}

main();
