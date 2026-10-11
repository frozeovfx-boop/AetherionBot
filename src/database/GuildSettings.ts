import { Collection } from "discord.js";
import { JsonStore } from "./JsonStore.js";
import type { Locale } from "../i18n/index.js";

export interface GuildConfig {
  prefix: string;
  locale: Locale;
  modlogChannelId: string | null;
  welcomeChannelId: string | null;
  welcomeMessage: string;
  leaveMessage: string;
}

type SettingsDump = Record<string, GuildConfig>;

const DEFAULTS: GuildConfig = {
  prefix: "!",
  locale: "tr",
  modlogChannelId: null,
  welcomeChannelId: null,
  welcomeMessage: "Hoş geldin {user} — **{server}** ailesine katıldın. Üye #{count}",
  leaveMessage: "**{user}** sunucudan ayrıldı.",
};

/**
 * Per-guild settings with JSON persistence.
 */
export class GuildSettings {
  private data = new Collection<string, GuildConfig>();
  private store = new JsonStore<SettingsDump>("guilds.json");
  private ready = false;
  private defaults: GuildConfig = { ...DEFAULTS };

  public async init(defaultPrefix = "!"): Promise<void> {
    this.defaults.prefix = defaultPrefix;
    const loaded = await this.store.load({});
    for (const [id, cfg] of Object.entries(loaded)) {
      this.data.set(id, { ...DEFAULTS, ...cfg });
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

  private mutate(guildId: string, patch: Partial<GuildConfig>): GuildConfig {
    const cfg = { ...this.get(guildId), ...patch };
    this.data.set(guildId, cfg);
    this.persist();
    return cfg;
  }

  public setPrefix(guildId: string, prefix: string): void {
    this.mutate(guildId, { prefix });
  }

  public setLocale(guildId: string, locale: Locale): void {
    this.mutate(guildId, { locale });
  }

  public setModlog(guildId: string, channelId: string | null): void {
    this.mutate(guildId, { modlogChannelId: channelId });
  }

  public setWelcome(
    guildId: string,
    data: { channelId?: string | null; message?: string; leaveMessage?: string }
  ): void {
    const patch: Partial<GuildConfig> = {};
    if (data.channelId !== undefined) patch.welcomeChannelId = data.channelId;
    if (data.message !== undefined) patch.welcomeMessage = data.message;
    if (data.leaveMessage !== undefined) patch.leaveMessage = data.leaveMessage;
    this.mutate(guildId, patch);
  }

  public getPrefix(guildId: string): string {
    return this.get(guildId).prefix;
  }

  public getLocale(guildId: string): Locale {
    return this.get(guildId).locale;
  }
}
