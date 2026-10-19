import {
  EmbedBuilder,
  ColorResolvable,
  User,
  Guild,
  APIEmbedField,
} from "discord.js";

/**
 * Yuta visual language
 * One palette. No noise. Every embed reads the same.
 */
export const Theme = {
  /** Hollow Purple — deep cosmic violet */
  primary: 0x8918f5 as ColorResolvable,
  /** Brighter hollow core */
  hollow: 0x8918f5 as ColorResolvable,
  success: 0x34d399 as ColorResolvable,
  danger: 0xe11d48 as ColorResolvable,
  warning: 0xf59e0b as ColorResolvable,
  info: 0x818cf8 as ColorResolvable,
  mute: 0x64748b as ColorResolvable,
  economy: 0x8918f5 as ColorResolvable,
  music: 0xa855f7 as ColorResolvable,
  mod: 0xe11d48 as ColorResolvable,
  footer: "Yuta",
} as const;

export function baseEmbed(color: ColorResolvable = Theme.primary): EmbedBuilder {
  return new EmbedBuilder().setColor(color).setTimestamp().setFooter({ text: Theme.footer });
}

export function line(): string {
  return "━━━━━━━━━━━━━━━━━━━━";
}

export function divider(): string {
  return line();
}

export function code(v: string | number): string {
  return `\`${v}\``;
}

export function field(label: string, value: string): string {
  return `**${label}**\n${value}`;
}

export function kv(label: string, value: string | number, width = 12): string {
  const pad = label.padEnd(width, " ");
  return `\`${pad}\`  ${value}`;
}

export function success(title: string, body?: string): EmbedBuilder {
  const e = baseEmbed(Theme.success).setTitle(title);
  if (body) e.setDescription(body);
  return e;
}

export function danger(title: string, body?: string): EmbedBuilder {
  const e = baseEmbed(Theme.danger).setTitle(title);
  if (body) e.setDescription(body);
  return e;
}

export function info(title: string, body?: string): EmbedBuilder {
  const e = baseEmbed(Theme.info).setTitle(title);
  if (body) e.setDescription(body);
  return e;
}

export function card(user: User, title: string, body?: string): EmbedBuilder {
  const e = baseEmbed(Theme.primary)
    .setAuthor({ name: title, iconURL: user.displayAvatarURL({ size: 128 }) })
    .setThumbnail(user.displayAvatarURL({ size: 256 }));
  if (body) e.setDescription(body);
  return e;
}

export function serverCard(guild: Guild, title: string): EmbedBuilder {
  return baseEmbed(Theme.primary)
    .setTitle(title)
    .setThumbnail(guild.iconURL({ size: 256 }) ?? null);
}

export function modCard(fields: APIEmbedField[], title: string): EmbedBuilder {
  return baseEmbed(Theme.mod).setTitle(title).addFields(fields);
}

/** Progress bar 0–1 */
export function bar(ratio: number, size = 12): string {
  const r = Math.max(0, Math.min(1, ratio));
  const filled = Math.round(r * size);
  return `\`${"━".repeat(filled)}${"─".repeat(size - filled)}\``;
}

/** Conseil / Hybrid AI visual */
export const ConseilTheme = {
  cyan: 0x8918f5 as ColorResolvable,
  purple: 0x8918f5 as ColorResolvable,
  footer: "Yuta · Conseil",
} as const;

export function conseilEmbed(color: ColorResolvable = ConseilTheme.purple): EmbedBuilder {
  return new EmbedBuilder().setColor(color).setTimestamp().setFooter({ text: ConseilTheme.footer });
}
