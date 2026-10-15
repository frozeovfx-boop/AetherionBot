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
  primary: 0x8b5cf6 as ColorResolvable,
  success: 0x34d399 as ColorResolvable,
  danger: 0xf43f5e as ColorResolvable,
  warning: 0xfbbf24 as ColorResolvable,
  info: 0x38bdf8 as ColorResolvable,
  mute: 0x64748b as ColorResolvable,
  economy: 0xf59e0b as ColorResolvable,
  music: 0xec4899 as ColorResolvable,
  mod: 0xf43f5e as ColorResolvable,
  footer: "Yuta",
} as const;

export function baseEmbed(color: ColorResolvable = Theme.primary): EmbedBuilder {
  return new EmbedBuilder().setColor(color).setTimestamp().setFooter({ text: Theme.footer });
}

export function line(): string {
  return "────────────────────────";
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
  cyan: 0x00f2fe as ColorResolvable,
  purple: 0x9b51e0 as ColorResolvable,
  footer: "LEVEL: OMEGA · Status: ONLINE · 99.9% Legendary",
} as const;

export function conseilEmbed(color: ColorResolvable = ConseilTheme.cyan): EmbedBuilder {
  return new EmbedBuilder().setColor(color).setTimestamp().setFooter({ text: ConseilTheme.footer });
}
