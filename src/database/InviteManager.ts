import { Collection } from "discord.js";
import { JsonStore } from "./JsonStore.js";

export interface InviteStats {
  joins: number;
  left: number;
  fake: number;
}

type Dump = Record<string, InviteStats>; // guildId:inviterId

/**
 * Invite tracker — Marpel-style, cleaner persistence.
 */
export class InviteManager {
  private stats = new Collection<string, InviteStats>();
  /** guildId -> code -> { uses, inviterId } */
  public cache = new Collection<string, Collection<string, { uses: number; inviterId: string }>>();
  private store = new JsonStore<Dump>("invites.json");
  private ready = false;

  public async init(): Promise<void> {
    const data = await this.store.load({});
    for (const [k, v] of Object.entries(data)) this.stats.set(k, v);
    this.ready = true;
  }

  private persist(): void {
    if (!this.ready) return;
    const dump: Dump = {};
    for (const [k, v] of this.stats) dump[k] = v;
    this.store.save(dump);
  }

  private key(guildId: string, userId: string): string {
    return `${guildId}:${userId}`;
  }

  public get(guildId: string, userId: string): InviteStats {
    return this.stats.get(this.key(guildId, userId)) ?? { joins: 0, left: 0, fake: 0 };
  }

  public addJoin(guildId: string, inviterId: string): InviteStats {
    const k = this.key(guildId, inviterId);
    const s = this.get(guildId, inviterId);
    s.joins += 1;
    this.stats.set(k, s);
    this.persist();
    return s;
  }

  public addLeave(guildId: string, inviterId: string): void {
    const k = this.key(guildId, inviterId);
    const s = this.get(guildId, inviterId);
    s.left += 1;
    this.stats.set(k, s);
    this.persist();
  }

  public leaderboard(guildId: string, limit = 10): { userId: string; joins: number; left: number; net: number }[] {
    return [...this.stats.entries()]
      .filter(([k]) => k.startsWith(`${guildId}:`))
      .map(([k, s]) => ({
        userId: k.split(":")[1]!,
        joins: s.joins,
        left: s.left,
        net: s.joins - s.left,
      }))
      .sort((a, b) => b.net - a.net)
      .slice(0, limit);
  }

  /** memberId -> inviterId for leave tracking */
  public memberInviter = new Collection<string, string>(); // guildId:memberId -> inviterId
}
