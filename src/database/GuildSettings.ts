import { Collection } from "discord.js";
import { JsonStore } from "./JsonStore.js";
import type { Locale } from "../i18n/index.js";

export interface GuildConfig {
  prefix: string;
  locale: Locale;
}

type SettingsDump = Record<string, GuildConfig>;

/**
 * Per-guild settings (prefix, language) with JSON persistence.
 */
export class GuildSettings {
  private data = new Collection<string, GuildConfig>();
  private store = new JsonStore<SettingsDump>("guilds.json");
  private ready = false;
  private defaults: GuildConfig = { prefix: "!", locale: "tr" };

  public async init(defaultPrefix = "!"): Promise<void> {
    this.defaults.prefix = defaultPrefix;
    const loaded = await this.store.load({});
    for (const [id, cfg] of Object.entries(loaded)) {
      this.data.set(id, cfg);
    }
    this.ready = true;
  }

  private persist(): void {
    if (!this.ready) return;
    const dump: SettingsDump = {};
    for (const [k, v] of this.data) dump[k] = v;
    this.store.save(dump);
  }

  public get(guildId: string): GuildConfig {
    return this.data.get(guildId) ?? { ...this.defaults };
  }

  public setPrefix(guildId: string, prefix: string): void {
    const cfg = this.get(guildId);
    cfg.prefix = prefix;
    this.data.set(guildId, cfg);
    this.persist();
  }

  public setLocale(guildId: string, locale: Locale): void {
    const cfg = this.get(guildId);
    cfg.locale = locale;
    this.data.set(guildId, cfg);
    this.persist();
  }

  public getPrefix(guildId: string): string {
    return this.get(guildId).prefix;
  }

  public getLocale(guildId: string): Locale {
    return this.get(guildId).locale;
  }
}
