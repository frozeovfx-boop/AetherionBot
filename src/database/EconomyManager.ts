import { Collection } from "discord.js";
import { JsonStore } from "./JsonStore.js";

export interface EconomyProfile {
  userId: string;
  guildId: string;
  wallet: number;
  bank: number;
  xp: number;
  level: number;
  lastDaily: number | null;
  lastWork: number | null;
}

type EconomyDump = Record<string, EconomyProfile>;

/**
 * Economy store with JSON persistence.
 * Interface stays the same — commands don't care about storage.
 */
export class EconomyManager {
  private profiles = new Collection<string, EconomyProfile>();
  private store = new JsonStore<EconomyDump>("economy.json");
  private ready = false;

  public async init(): Promise<void> {
    const data = await this.store.load({});
    for (const [k, v] of Object.entries(data)) {
      this.profiles.set(k, v);
    }
    this.ready = true;
  }

  private persist(): void {
    if (!this.ready) return;
    const dump: EconomyDump = {};
    for (const [k, v] of this.profiles) dump[k] = v;
    this.store.save(dump);
  }

  private key(guildId: string, userId: string): string {
    return `${guildId}:${userId}`;
  }

  public get(guildId: string, userId: string): EconomyProfile {
    const k = this.key(guildId, userId);
    let profile = this.profiles.get(k);
    if (!profile) {
      profile = {
        userId,
        guildId,
        wallet: 0,
        bank: 0,
        xp: 0,
        level: 1,
        lastDaily: null,
        lastWork: null,
      };
      this.profiles.set(k, profile);
      this.persist();
    }
    return profile;
  }

  public addWallet(guildId: string, userId: string, amount: number): EconomyProfile {
    const p = this.get(guildId, userId);
    p.wallet = Math.max(0, p.wallet + amount);
    this.persist();
    return p;
  }

  public removeWallet(guildId: string, userId: string, amount: number): boolean {
    const p = this.get(guildId, userId);
    if (p.wallet < amount) return false;
    p.wallet -= amount;
    this.persist();
    return true;
  }

  public deposit(guildId: string, userId: string, amount: number): boolean {
    const p = this.get(guildId, userId);
    if (p.wallet < amount) return false;
    p.wallet -= amount;
    p.bank += amount;
    this.persist();
    return true;
  }

  public withdraw(guildId: string, userId: string, amount: number): boolean {
    const p = this.get(guildId, userId);
    if (p.bank < amount) return false;
    p.bank -= amount;
    p.wallet += amount;
    this.persist();
    return true;
  }

  public addXp(
    guildId: string,
    userId: string,
    amount: number
  ): { profile: EconomyProfile; leveledUp: boolean } {
    const p = this.get(guildId, userId);
    p.xp += amount;
    let leveledUp = false;
    const needed = p.level * 100;
    if (p.xp >= needed) {
      p.xp -= needed;
      p.level += 1;
      leveledUp = true;
    }
    this.persist();
    return { profile: p, leveledUp };
  }

  public getLeaderboard(guildId: string, limit = 10): EconomyProfile[] {
    return [...this.profiles.values()]
      .filter((p) => p.guildId === guildId)
      .sort((a, b) => b.wallet + b.bank - (a.wallet + a.bank))
      .slice(0, limit);
  }
}
