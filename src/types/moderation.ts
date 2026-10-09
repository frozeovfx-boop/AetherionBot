export type CaseType =
  | "ban"
  | "softban"
  | "kick"
  | "timeout"
  | "untimeout"
  | "unban"
  | "warn"
  | "mute"
  | "unmute"
  | "other";

export interface ModCase {
  id: number;
  guildId: string;
  userId: string;
  moderatorId: string;
  type: CaseType;
  reason: string;
  duration?: number | null;
  createdAt: Date;
  active: boolean;
}

export interface GuildModConfig {
  guildId: string;
  modLogChannelId?: string | null;
  muteRoleId?: string | null;
  warnThreshold?: number;
  autoModEnabled?: boolean;
}
