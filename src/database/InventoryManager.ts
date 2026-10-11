import { Collection } from "discord.js";
import { JsonStore } from "./JsonStore.js";

type InvDump = Record<string, string[]>;

/**
 * Persistent inventory (shop purchases).
 */
export class InventoryManager {
  private items = new Collection<string, string[]>();
  private store = new JsonStore<InvDump>("inventory.json");
  private ready = false;

  public async init(): Promise<void> {
    const data = await this.store.load({});
    for (const [k, v] of Object.entries(data)) {
      this.items.set(k, v);
    }
    this.ready = true;
  }

  private persist(): void {
    if (!this.ready) return;
    const dump: InvDump = {};
    for (const [k, v] of this.items) dump[k] = v;
    this.store.save(dump);
  }

  private key(guildId: string, userId: string): string {
    return `${guildId}:${userId}`;
  }

  public get(guildId: string, userId: string): string[] {
    return this.items.get(this.key(guildId, userId)) ?? [];
  }

  public add(guildId: string, userId: string, itemId: string): void {
    const k = this.key(guildId, userId);
    const list = this.items.get(k) ?? [];
    list.push(itemId);
    this.items.set(k, list);
    this.persist();
  }

  public counts(guildId: string, userId: string): Map<string, number> {
    const map = new Map<string, number>();
    for (const id of this.get(guildId, userId)) {
      map.set(id, (map.get(id) ?? 0) + 1);
    }
    return map;
  }
}
