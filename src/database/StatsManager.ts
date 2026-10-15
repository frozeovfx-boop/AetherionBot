import { Collection } from "discord.js";
import { JsonStore } from "./JsonStore.js";

export interface UserStats {
  guildId: string;
  userId: string;
  messages: number;
  voiceMinutes: number;
}

type Dump = Record<string, UserStats>;

/**
 * Text + voice activity counters (Marpel-style stats, clean).
 */
export class StatsManager {
  private data = new Collection<string, UserStats>();
  private store = new JsonStore<Dump>("stats.json");
  private ready = false;
  private dirty = false;
  /** xp anti-spam: guild:user -> last xp ts */
  private lastMsgXp = new Collection<string, number>();

  public async init(): Promise<void> {
    const loaded = await this.store.load({});
    for (const [k, v] of Object.entries(loaded)) this.data.set(k, v);
    this.ready = true;
    setInterval(() => this.flush(), 20_000);
  }

  private key(guildId: string, userId: string): string {
    return `${guildId}:${userId}`;
  }

  private flush(): void {
    if (!this.ready || !this.dirty) return;
    const dump: Dump = {};
    for (const [k, v] of this.data) dump[k] = v;
    this.store.save(dump);
    this.dirty = false;
  }

  public get(guildId: string, userId: string): UserStats {
    const k = this.key(guildId, userId);
    let s = this.data.get(k);
    if (!s) {
      s = { guildId, userId, messages: 0, voiceMinutes: 0 };
      this.data.set(k, s);
    }
    return s;
  }

  public addMessage(guildId: string, userId: string): UserStats {
    const s = this.get(guildId, userId);
    s.messages += 1;
    this.dirty = true;
    return s;
  }

  public addVoiceMinutes(guildId: string, userId: string, minutes: number): UserStats {
    if (minutes < 1) return this.get(guildId, userId);
    const s = this.get(guildId, userId);
    s.voiceMinutes += minutes;
    this.dirty = true;
    return s;
  }

  /** true if enough time passed to grant message XP */
  public canGrantMessageXp(guildId: string, userId: string, cooldownMs = 60_000): boolean {
    const k = this.key(guildId, userId);
    const last = this.lastMsgXp.get(k) ?? 0;
    const now = Date.now();
    if (now - last < cooldownMs) return false;
    this.lastMsgXp.set(k, now);
    return true;
  }

  public topMessages(guildId: string, limit = 10): UserStats[] {
    return [...this.data.values()]
      .filter((s) => s.guildId === guildId && s.messages > 0)
      .sort((a, b) => b.messages - a.messages)
      .slice(0, limit);
  }

  public topVoice(guildId: string, limit = 10): UserStats[] {
    return [...this.data.values()]
      .filter((s) => s.guildId === guildId && s.voiceMinutes > 0)
      .sort((a, b) => b.voiceMinutes - a.voiceMinutes)
      .slice(0, limit);
  }
}
