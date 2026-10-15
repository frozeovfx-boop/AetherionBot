import type { ClientEvents } from "discord.js";
import type { YutaClient } from "../client/YutaClient.js";

export abstract class Event<K extends keyof ClientEvents = keyof ClientEvents> {
  public readonly name: K;
  public readonly once: boolean;

  constructor(name: K, once = false) {
    this.name = name;
    this.once = once;
  }

  public abstract execute(client: YutaClient, ...args: ClientEvents[K]): Promise<void> | void;
}
