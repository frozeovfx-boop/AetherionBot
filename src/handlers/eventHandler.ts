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

    try {
      const filePath = join(eventsPath, file);
      const eventModule = await import(pathToFileURL(filePath).href);
      const raw = eventModule.default ?? eventModule.event;
      if (!raw) continue;

      const event: Event =
        typeof raw === "function" ? new (raw as new () => Event)() : raw;

      if (!event?.name) {
        logger.warn(`Skipping invalid event file: ${file}`);
        continue;
      }

      const runner = (...args: unknown[]) => {
        try {
          const result = event.execute(client, ...(args as never[]));
          if (result instanceof Promise) {
            result.catch((err) => client.logger.error(err, `Event error: ${String(event.name)}`));
          }
        } catch (err) {
          client.logger.error(err, `Event error: ${String(event.name)}`);
        }
      };

      if (event.once) {
        client.once(event.name, runner);
      } else {
        client.on(event.name, runner);
      }

      loaded++;
      logger.info(`Event bound: ${String(event.name)}`);
    } catch (err) {
      logger.warn({ err, file }, "Failed to load event");
    }
  }

  logger.info(`Loaded ${loaded} events`);
}
