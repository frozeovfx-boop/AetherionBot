import { Collection } from "discord.js";
import { JsonStore } from "./JsonStore.js";

type DayBucket = Record<string, number>; // feature -> count
type Dump = Record<string, DayBucket>; // `${guildId}:${yyyymmdd}` -> counts

function dayKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
}

export class UsageManager {
  private data = new Collection<string, DayBucket>();
  private store = new JsonStore<Dump>("usage.json");
  private ready = false;

  public async init(): Promise<void> {
    const loaded = await this.store.load({});
    for (const [k, v] of Object.entries(loaded)) this.data.set(k, v);
    this.ready = true;
  }

  private persist(): void {
    if (!this.ready) return;
    const dump: Dump = {};
    for (const [k, v] of this.data) dump[k] = v;
    this.store.save(dump);
  }

  private key(guildId: string): string {
    return `${guildId}:${dayKey()}`;
  }

  public get(guildId: string, feature: string): number {
    return this.data.get(this.key(guildId))?.[feature] ?? 0;
  }

  public inc(guildId: string, feature: string): number {
    const k = this.key(guildId);
    const bucket = this.data.get(k) ?? {};
    bucket[feature] = (bucket[feature] ?? 0) + 1;
    this.data.set(k, bucket);
    this.persist();
    return bucket[feature]!;
  }
}
