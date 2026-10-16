import { Collection } from "discord.js";
import { JsonStore } from "./JsonStore.js";

export interface TempbanEntry {
  guildId: string;
  userId: string;
  moderatorId: string;
  reason: string;
  expiresAt: number;
  caseId?: number;
}

type Dump = Record<string, TempbanEntry>; // guildId:userId

export class TempbanManager {
  private data = new Collection<string, TempbanEntry>();
  private store = new JsonStore<Dump>("tempbans.json");
  private ready = false;
  private timers = new Map<string, NodeJS.Timeout>();

  public async init(): Promise<void> {
    const loaded = await this.store.load({});
    for (const [k, v] of Object.entries(loaded)) this.data.set(k, v);
    this.ready = true;
  }

  private key(guildId: string, userId: string): string {
    return `${guildId}:${userId}`;
  }

  private persist(): void {
    if (!this.ready) return;
    const dump: Dump = {};
    for (const [k, v] of this.data) dump[k] = v;
    this.store.save(dump);
  }

  public add(entry: TempbanEntry): void {
    const k = this.key(entry.guildId, entry.userId);
    this.data.set(k, entry);
    this.persist();
  }

  public remove(guildId: string, userId: string): void {
    const k = this.key(guildId, userId);
    this.data.delete(k);
    this.persist();
    const t = this.timers.get(k);
    if (t) {
      clearTimeout(t);
      this.timers.delete(k);
    }
  }

  public all(): TempbanEntry[] {
    return [...this.data.values()];
  }

  public schedule(key: string, delayMs: number, fn: () => void): void {
    const existing = this.timers.get(key);
    if (existing) clearTimeout(existing);
    const delay = Math.max(0, Math.min(delayMs, 2_147_000_000));
    this.timers.set(key, setTimeout(fn, delay));
  }
}
