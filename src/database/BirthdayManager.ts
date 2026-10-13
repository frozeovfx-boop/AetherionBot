import { Collection } from "discord.js";
import { JsonStore } from "./JsonStore.js";

export interface Birthday {
  userId: string;
  guildId: string;
  month: number; // 1-12
  day: number; // 1-31
}

type Dump = Record<string, { month: number; day: number }>; // guildId:userId

export class BirthdayManager {
  private map = new Collection<string, Birthday>();
  private store = new JsonStore<Dump>("birthdays.json");
  private ready = false;

  public async init(): Promise<void> {
    const data = await this.store.load({});
    for (const [k, v] of Object.entries(data)) {
      const [guildId, userId] = k.split(":");
      if (!guildId || !userId) continue;
      this.map.set(k, { guildId, userId, month: v.month, day: v.day });
    }
    this.ready = true;
  }

  private persist(): void {
    if (!this.ready) return;
    const dump: Dump = {};
    for (const [k, b] of this.map) dump[k] = { month: b.month, day: b.day };
    this.store.save(dump);
  }

  private key(guildId: string, userId: string): string {
    return `${guildId}:${userId}`;
  }

  public set(guildId: string, userId: string, month: number, day: number): void {
    this.map.set(this.key(guildId, userId), { guildId, userId, month, day });
    this.persist();
  }

  public remove(guildId: string, userId: string): void {
    this.map.delete(this.key(guildId, userId));
    this.persist();
  }

  public get(guildId: string, userId: string): Birthday | null {
    return this.map.get(this.key(guildId, userId)) ?? null;
  }

  public today(guildId: string, now = new Date()): Birthday[] {
    const m = now.getMonth() + 1;
    const d = now.getDate();
    return [...this.map.values()].filter(
      (b) => b.guildId === guildId && b.month === m && b.day === d
    );
  }

  public list(guildId: string): Birthday[] {
    return [...this.map.values()]
      .filter((b) => b.guildId === guildId)
      .sort((a, b) => a.month - b.month || a.day - b.day);
  }
}
