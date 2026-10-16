import { Collection } from "discord.js";
import { JsonStore } from "./JsonStore.js";
import type { Locale } from "../i18n/index.js";

export interface TicketButton {
  id: string;
  label: string;
  style: "Primary" | "Secondary" | "Success" | "Danger";
  description?: string;
  /** Optional staff role for this ticket type */
  supportRoleId?: string;
}

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
  sticky: Record<string, string>;
  tags: Record<string, string>;
  conseilRoles: Record<string, string>;
  tempVoiceHubId: string | null;
  tempVoiceCategoryId: string | null;
  inviteLogChannelId: string | null;
  messageLogChannelId: string | null;
  memberLogChannelId: string | null;
  voiceLogChannelId: string | null;
  automodAntiInvite: boolean;
  automodAntiLink: boolean;
  automodAntiSpam: boolean;
  automodAntiBadwords: boolean;
  automodMaxMentions: number;
  automodBadwords: string[];
  automodIgnoreChannels: string[];
  ticketCategoryId: string | null;
  ticketSupportRoleId: string | null;
  ticketLogChannelId: string | null;
  ticketButtons: TicketButton[];
  /** roleId -> weight multiplier (1 = normal, 2 = 2x chance) */
  giveawayLuck: Record<string, number>;
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
  conseilRoles: {},
  tempVoiceHubId: null,
  tempVoiceCategoryId: null,
  inviteLogChannelId: null,
  messageLogChannelId: null,
  memberLogChannelId: null,
  voiceLogChannelId: null,
  automodAntiInvite: false,
  automodAntiLink: false,
  automodAntiSpam: false,
  automodAntiBadwords: false,
  automodMaxMentions: 5,
  automodBadwords: [],
  automodIgnoreChannels: [],
  ticketCategoryId: null,
  ticketSupportRoleId: null,
  ticketLogChannelId: null,
  ticketButtons: [
    { id: "destek", label: "Destek", style: "Primary" },
  ],
  giveawayLuck: {},
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
        conseilRoles: cfg.conseilRoles ?? {},
        starboardMin: cfg.starboardMin ?? 3,
        automodBadwords: cfg.automodBadwords ?? [],
        automodIgnoreChannels: cfg.automodIgnoreChannels ?? [],
        ticketButtons:
          cfg.ticketButtons?.length
            ? cfg.ticketButtons
            : [{ id: "destek", label: "Destek", style: "Primary" }],
        giveawayLuck: cfg.giveawayLuck ?? {},
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
    return (
      this.data.get(guildId) ?? {
        ...this.defaults,
        sticky: {},
        tags: {},
        conseilRoles: {},
      }
    );
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

  public setConseilRole(guildId: string, model: string, personality: string | null): void {
    const roles = { ...this.get(guildId).conseilRoles };
    const key = model.toLowerCase();
    if (personality === null) delete roles[key];
    else roles[key] = personality.slice(0, 200);
    this.mutate(guildId, { conseilRoles: roles });
  }

  public setTempVoice(
    guildId: string,
    hubId: string | null,
    categoryId: string | null = null
  ): void {
    this.mutate(guildId, {
      tempVoiceHubId: hubId,
      tempVoiceCategoryId: categoryId,
    });
  }

  public setInviteLog(guildId: string, channelId: string | null): void {
    this.mutate(guildId, { inviteLogChannelId: channelId });
  }

  public setMessageLog(guildId: string, channelId: string | null): void {
    this.mutate(guildId, { messageLogChannelId: channelId });
  }

  public setMemberLog(guildId: string, channelId: string | null): void {
    this.mutate(guildId, { memberLogChannelId: channelId });
  }

  public setVoiceLog(guildId: string, channelId: string | null): void {
    this.mutate(guildId, { voiceLogChannelId: channelId });
  }


  public setAutomod(
    guildId: string,
    patch: Partial<{
      automodAntiInvite: boolean;
      automodAntiLink: boolean;
      automodAntiSpam: boolean;
      automodAntiBadwords: boolean;
      automodMaxMentions: number;
      automodBadwords: string[];
      automodIgnoreChannels: string[];
    }>
  ): void {
    this.mutate(guildId, patch);
  }




  public setGiveawayLuck(guildId: string, roleId: string, weight: number | null): void {
    const luck = { ...this.get(guildId).giveawayLuck };
    if (weight === null || weight <= 1) delete luck[roleId];
    else luck[roleId] = Math.min(10, Math.max(1.1, Math.round(weight * 10) / 10));
    this.mutate(guildId, { giveawayLuck: luck });
  }

  public setTicketButtons(guildId: string, buttons: TicketButton[]): void {
    this.mutate(guildId, { ticketButtons: buttons.slice(0, 5) });
  }

  public setTicket(
    guildId: string,
    patch: Partial<{
      ticketCategoryId: string | null;
      ticketSupportRoleId: string | null;
      ticketLogChannelId: string | null;
    }>
  ): void {
    this.mutate(guildId, patch);
  }

  public getPrefix(guildId: string): string {
    return this.get(guildId).prefix;
  }

  public getLocale(guildId: string): Locale {
    return this.get(guildId).locale;
  }
}
