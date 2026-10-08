import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { AetherionClient } from "../client/AetherionClient.js";
import type { Event } from "../structures/Event.js";
import { logger } from "../utils/logger.js";

export async function loadEvents(client: AetherionClient): Promise<void> {
  const eventsPath = join(process.cwd(), "src", "events");
  const files = await readdir(eventsPath);

  let loaded = 0;

  for (const file of files) {
    if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;

    const filePath = join(eventsPath, file);
    const eventModule = await import(pathToFileURL(filePath).href);
    const event: Event = eventModule.default ?? eventModule.event;

    if (!event?.name) {
      logger.warn(`Skipping invalid event file: ${file}`);
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
      client.on(event.name, (...args) => event.execute(client, ...args));
    }

    loaded++;
  }

  logger.info(`Loaded ${loaded} events`);
}
