import { Events } from "discord.js";
import { Event } from "../structures/Event.js";
import type { AetherionClient } from "../client/AetherionClient.js";

export default class ReadyEvent extends Event<typeof Events.ClientReady> {
  constructor() {
    super(Events.ClientReady, true);
  }

  public execute(client: AetherionClient): void {
    client.logger.info(`Logged in as ${client.user?.tag}`);
    client.logger.info(`Serving ${client.guilds.cache.size} guilds`);
  }
}
