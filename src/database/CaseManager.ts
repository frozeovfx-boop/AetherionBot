import { Collection } from "discord.js";
import type { ModCase, CaseType } from "../types/moderation.js";

/**
 * In-memory case store.
 * Interface is DB-ready: swap implementation later with Postgres/Prisma without touching commands.
 */
export class CaseManager {
  private cases = new Collection<string, ModCase[]>(); // guildId -> cases
  private counters = new Collection<string, number>(); // guildId -> next id

  public create(data: {
    guildId: string;
    userId: string;
    moderatorId: string;
    type: CaseType;
    reason: string;
    duration?: number | null;
  }): ModCase {
    const nextId = (this.counters.get(data.guildId) ?? 0) + 1;
    this.counters.set(data.guildId, nextId);

    const modCase: ModCase = {
      id: nextId,
      guildId: data.guildId,
      userId: data.userId,
      moderatorId: data.moderatorId,
      type: data.type,
      reason: data.reason,
      duration: data.duration ?? null,
      createdAt: new Date(),
      active: true,
    };

    const list = this.cases.get(data.guildId) ?? [];
    list.push(modCase);
    this.cases.set(data.guildId, list);

    return modCase;
  }

  public get(guildId: string, caseId: number): ModCase | undefined {
    return this.cases.get(guildId)?.find((c) => c.id === caseId);
  }

  public getUserCases(guildId: string, userId: string): ModCase[] {
    return (this.cases.get(guildId) ?? []).filter((c) => c.userId === userId);
  }

  public getGuildCases(guildId: string, limit = 25): ModCase[] {
    const list = this.cases.get(guildId) ?? [];
    return list.slice(-limit).reverse();
  }

  public clearUserWarns(guildId: string, userId: string): number {
    const list = this.cases.get(guildId) ?? [];
    let cleared = 0;
    for (const c of list) {
      if (c.userId === userId && c.type === "warn" && c.active) {
        c.active = false;
        cleared++;
      }
    }
    return cleared;
  }

  public deactivate(guildId: string, caseId: number): boolean {
    const c = this.get(guildId, caseId);
    if (!c) return false;
    c.active = false;
    return true;
  }
}
