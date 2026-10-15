import { Collection } from "discord.js";
import { JsonStore } from "./JsonStore.js";

export interface GiveawayData {
  id: string;
  guildId: string;
  channelId: string;
  messageId: string;
  prize: string;
  winnersCount: number;
  endsAt: number;
  hostId: string;
  ended: boolean;
}

type Dump = Record<string, GiveawayData>;

export class GiveawayManager {
  private data = new Collection<string, GiveawayData>();
  private store = new JsonStore<Dump>("giveaways.json");
  private ready = false;
  private timers = new Map<string, NodeJS.Timeout>();

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

  public create(g: GiveawayData): void {
    this.data.set(g.id, g);
    this.persist();
  }

  public get(id: string): GiveawayData | undefined {
    return this.data.get(id);
  }

  public getByMessage(messageId: string): GiveawayData | undefined {
    return this.data.find((g) => g.messageId === messageId);
  }

  public markEnded(id: string): void {
    const g = this.data.get(id);
    if (!g) return;
    g.ended = true;
    this.persist();
    const t = this.timers.get(id);
    if (t) {
      clearTimeout(t);
      this.timers.delete(id);
    }
  }

  public active(): GiveawayData[] {
    return [...this.data.values()].filter((g) => !g.ended);
  }

  public schedule(id: string, delayMs: number, fn: () => void): void {
    const existing = this.timers.get(id);
    if (existing) clearTimeout(existing);
    const delay = Math.max(0, Math.min(delayMs, 2_147_000_000));
    const t = setTimeout(fn, delay);
    this.timers.set(id, t);
  }
}
