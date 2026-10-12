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
  autoroleIds: string[];
  starboardChannelId: string | null;
  starboardMin: number;
  confessionChannelId: string | null;
  sticky: Record<string, string>; // channelId -> content
  tags: Record<string, string>; // name -> content
}

type SettingsDump = Record<string, GuildConfig>;

const DEFAULTS: GuildConfig = {
  prefix: "!",
  locale: "tr",
  modlogChannelId: null,
  welcomeChannelId: null,
  welcomeMessage: "Hoş geldin {user} — **{server}** ailesine katıldın. Üye #{count}",
  leaveMessage: "**{user}** sunucudan ayrıldı.",
  autoroleIds: [],
  starboardChannelId: null,
  starboardMin: 3,
  confessionChannelId: null,
  sticky: {},
  tags: {},
};

export class GuildSettings {
  private data = new Collection<string, GuildConfig>();
  private store = new JsonStore<SettingsDump>("guilds.json");
  private ready = false;
  private defaults: GuildConfig = { ...DEFAULTS };

  public async init(defaultPrefix = "!"): Promise<void> {
    this.defaults.prefix = defaultPrefix;
    const loaded = await this.store.load({});
    for (const [id, cfg] of Object.entries(loaded)) {
      this.data.set(id, {
        ...DEFAULTS,
        ...cfg,
        autoroleIds: cfg.autoroleIds ?? [],
        sticky: cfg.sticky ?? {},
        tags: cfg.tags ?? {},
        starboardMin: cfg.starboardMin ?? 3,
      });
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
    return this.data.get(guildId) ?? { ...this.defaults, sticky: {}, tags: {} };
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

  public setAutoroles(guildId: string, roleIds: string[]): void {
    this.mutate(guildId, { autoroleIds: roleIds });
  }

  public addAutorole(guildId: string, roleId: string): void {
    const ids = [...this.get(guildId).autoroleIds];
    if (!ids.includes(roleId)) ids.push(roleId);
    this.setAutoroles(guildId, ids);
  }

  public removeAutorole(guildId: string, roleId: string): void {
    this.setAutoroles(
      guildId,
      this.get(guildId).autoroleIds.filter((id) => id !== roleId)
    );
  }

  public setStarboard(guildId: string, channelId: string | null, min?: number): void {
    const patch: Partial<GuildConfig> = { starboardChannelId: channelId };
    if (min !== undefined) patch.starboardMin = min;
    this.mutate(guildId, patch);
  }

  public setConfession(guildId: string, channelId: string | null): void {
    this.mutate(guildId, { confessionChannelId: channelId });
  }

  public setSticky(guildId: string, channelId: string, content: string | null): void {
    const sticky = { ...this.get(guildId).sticky };
    if (content === null) delete sticky[channelId];
    else sticky[channelId] = content;
    this.mutate(guildId, { sticky });
  }

  public setTag(guildId: string, name: string, content: string | null): void {
    const tags = { ...this.get(guildId).tags };
    const key = name.toLowerCase();
    if (content === null) delete tags[key];
    else tags[key] = content;
    this.mutate(guildId, { tags });
  }

  public getPrefix(guildId: string): string {
    return this.get(guildId).prefix;
  }

  public getLocale(guildId: string): Locale {
    return this.get(guildId).locale;
  }
}
