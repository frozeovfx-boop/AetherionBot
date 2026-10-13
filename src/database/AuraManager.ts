import { Collection } from "discord.js";
import { JsonStore } from "./JsonStore.js";

type AuraDump = Record<string, number>; // guildId:userId -> score

/**
 * Server aura / reputation. +1 from others, cooldown per pair.
 */
export class AuraManager {
  private scores = new Collection<string, number>();
  private lastGive = new Collection<string, number>(); // from->to key
  private store = new JsonStore<AuraDump>("aura.json");
  private ready = false;

  private static COOLDOWN = 12 * 60 * 60 * 1000; // 12h per target

  public async init(): Promise<void> {
    const data = await this.store.load({});
    for (const [k, v] of Object.entries(data)) this.scores.set(k, v);
    this.ready = true;
  }

  private persist(): void {
    if (!this.ready) return;
    const dump: AuraDump = {};
    for (const [k, v] of this.scores) dump[k] = v;
    this.store.save(dump);
  }

  private key(guildId: string, userId: string): string {
    return `${guildId}:${userId}`;
  }

  public get(guildId: string, userId: string): number {
    return this.scores.get(this.key(guildId, userId)) ?? 0;
  }

  /** Returns null if cooldown, new score on success */
  public give(
    guildId: string,
    fromId: string,
    toId: string,
    amount = 1
  ): { ok: true; score: number } | { ok: false; reason: "self" | "cooldown"; remainingMs?: number } {
    if (fromId === toId) return { ok: false, reason: "self" };

    const cdKey = `${guildId}:${fromId}->${toId}`;
    const last = this.lastGive.get(cdKey) ?? 0;
    const now = Date.now();
    if (now - last < AuraManager.COOLDOWN) {
      return { ok: false, reason: "cooldown", remainingMs: AuraManager.COOLDOWN - (now - last) };
    }

    const k = this.key(guildId, toId);
    const score = (this.scores.get(k) ?? 0) + amount;
    this.scores.set(k, score);
    this.lastGive.set(cdKey, now);
    this.persist();
    return { ok: true, score };
  }

  public leaderboard(guildId: string, limit = 10): { userId: string; score: number }[] {
    return [...this.scores.entries()]
      .filter(([k]) => k.startsWith(`${guildId}:`))
      .map(([k, score]) => ({ userId: k.split(":")[1]!, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
