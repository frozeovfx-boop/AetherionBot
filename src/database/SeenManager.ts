import { Collection } from "discord.js";
import { JsonStore } from "./JsonStore.js";

type SeenDump = Record<string, number>; // userId -> timestamp

export class SeenManager {
  private map = new Collection<string, number>();
  private store = new JsonStore<SeenDump>("seen.json");
  private ready = false;
  private dirty = false;

  public async init(): Promise<void> {
    const data = await this.store.load({});
    for (const [k, v] of Object.entries(data)) this.map.set(k, v);
    this.ready = true;
    setInterval(() => this.flush(), 30_000);
  }

  private flush(): void {
    if (!this.ready || !this.dirty) return;
    const dump: SeenDump = {};
    for (const [k, v] of this.map) dump[k] = v;
    this.store.save(dump);
    this.dirty = false;
  }

  public touch(userId: string): void {
    this.map.set(userId, Date.now());
    this.dirty = true;
  }

  public get(userId: string): number | null {
    return this.map.get(userId) ?? null;
  }
}
