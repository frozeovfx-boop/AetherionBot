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
  footer: "Yuta · v1",
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

/** Short system notice (errors, limits, permission) */
export function yutaNotice(
  title: string,
  body: string,
  color: ColorResolvable = Theme.primary
): EmbedBuilder {
  return baseEmbed(color)
    .setAuthor({ name: title })
    .setDescription([line(), body, line()].join("\n"));
}

/** Permission / soft fail — purple, not panic red */
export function yutaFail(body: string): EmbedBuilder {
  return yutaNotice("Yuta", body, Theme.mute);
}

/** Destructive mod action card */
export function yutaMod(opts: {
  title: string;
  targetTag: string;
  targetId: string;
  targetAvatar?: string | null;
  moderatorTag: string;
  reason: string;
  caseId?: number;
  extra?: string[];
  guildIcon?: string | null;
}): EmbedBuilder {
  const rows = [
    line(),
    kv("Kullanıcı", opts.targetTag),
    kv("ID", code(opts.targetId)),
    kv("Yetkili", opts.moderatorTag),
    kv("Sebep", opts.reason),
    ...(opts.extra ?? []),
    line(),
  ];
  const e = baseEmbed(Theme.mod)
    .setAuthor({ name: "MOD", iconURL: opts.guildIcon ?? undefined })
    .setTitle(opts.title)
    .setDescription(rows.join("\n"));
  if (opts.targetAvatar) e.setThumbnail(opts.targetAvatar);
  if (opts.caseId != null) e.setFooter({ text: `Case #${opts.caseId} · Yuta · v1` });
  return e;
}

/** Welcome / leave — same hollow frame */
export function yutaMemberCard(opts: {
  title: string;
  description: string;
  avatarUrl?: string | null;
  guildIcon?: string | null;
}): EmbedBuilder {
  const e = baseEmbed(Theme.primary)
    .setAuthor({ name: opts.title, iconURL: opts.guildIcon ?? undefined })
    .setDescription([line(), opts.description, line()].join("\n"));
  if (opts.avatarUrl) e.setThumbnail(opts.avatarUrl);
  return e;
}

const V1 = "Yuta";

/** Success / setup confirmation — purple brand, not generic green spam */
export function yutaOk(title: string, body: string): EmbedBuilder {
  return baseEmbed(Theme.primary)
    .setAuthor({ name: `Yuta · ${title}` })
    .setDescription([line(), body, line()].join("\n"));
}

/** Ticket channel welcome card */
export function yutaTicketOpen(opts: {
  typeLabel: string;
  userTag: string;
  userMention: string;
  note?: string;
  avatarUrl?: string | null;
}): EmbedBuilder {
  const rows = [
    line(),
    `Merhaba ${opts.userMention}`,
    "Konunu **net** yaz. Ekip buradan takip eder.",
    line(),
    kv("Tür", opts.typeLabel),
    kv("Sahip", opts.userTag),
  ];
  if (opts.note) rows.push(kv("Not", opts.note));
  rows.push(line());
  const e = baseEmbed(Theme.primary)
    .setAuthor({ name: `Ticket` })
    .setTitle(opts.typeLabel)
    .setDescription(rows.join("\n"))
    .setFooter({ text: Theme.footer });
  if (opts.avatarUrl) e.setThumbnail(opts.avatarUrl);
  return e;
}
