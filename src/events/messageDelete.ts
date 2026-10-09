import { Events, Message, PartialMessage } from "discord.js";
import { Event } from "../structures/Event.js";
import type { AetherionClient } from "../client/AetherionClient.js";
import { storeSnipe } from "../utils/snipe.js";

export default class MessageDeleteEvent extends Event<typeof Events.MessageDelete> {
  constructor() {
    super(Events.MessageDelete);
  }

  public execute(_client: AetherionClient, message: Message | PartialMessage): void {
    storeSnipe(message);
  }
}
