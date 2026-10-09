import { Collection } from "discord.js";

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

/**
 * In-memory economy store. DB-ready interface.
 */
export class EconomyManager {
  private profiles = new Collection<string, EconomyProfile>(); // key: guildId:userId

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
    }
    return profile;
  }

  public addWallet(guildId: string, userId: string, amount: number): EconomyProfile {
    const p = this.get(guildId, userId);
    p.wallet = Math.max(0, p.wallet + amount);
    return p;
  }

  public removeWallet(guildId: string, userId: string, amount: number): boolean {
    const p = this.get(guildId, userId);
    if (p.wallet < amount) return false;
    p.wallet -= amount;
    return true;
  }

  public deposit(guildId: string, userId: string, amount: number): boolean {
    const p = this.get(guildId, userId);
    if (p.wallet < amount) return false;
    p.wallet -= amount;
    p.bank += amount;
    return true;
  }

  public withdraw(guildId: string, userId: string, amount: number): boolean {
    const p = this.get(guildId, userId);
    if (p.bank < amount) return false;
    p.bank -= amount;
    p.wallet += amount;
    return true;
  }

  public addXp(guildId: string, userId: string, amount: number): { profile: EconomyProfile; leveledUp: boolean } {
    const p = this.get(guildId, userId);
    p.xp += amount;
    let leveledUp = false;
    const needed = p.level * 100;
    if (p.xp >= needed) {
      p.xp -= needed;
      p.level += 1;
      leveledUp = true;
    }
    return { profile: p, leveledUp };
  }
}
