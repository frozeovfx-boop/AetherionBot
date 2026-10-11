import {
  EmbedBuilder,
  ColorResolvable,
  User,
  Guild,
  APIEmbedField,
} from "discord.js";

/** Aetherion visual identity */
export const Theme = {
  primary: 0x7c5cff as ColorResolvable, // violet
  success: 0x3dd68c as ColorResolvable,
  danger: 0xff5c7a as ColorResolvable,
  warning: 0xffc14a as ColorResolvable,
  info: 0x5cb8ff as ColorResolvable,
  mute: 0x8b8b9e as ColorResolvable,
  economy: 0xffd666 as ColorResolvable,
  music: 0xff6bcb as ColorResolvable,
  fun: 0xff8fab as ColorResolvable,
  footer: "Aetherion",
} as const;

export function baseEmbed(color: ColorResolvable = Theme.primary): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(color)
    .setTimestamp()
    .setFooter({ text: Theme.footer });
}

export function successEmbed(title: string, description?: string): EmbedBuilder {
  const e = baseEmbed(Theme.success).setTitle(`✦ ${title}`);
  if (description) e.setDescription(description);
  return e;
}

export function errorEmbed(title: string, description?: string): EmbedBuilder {
  const e = baseEmbed(Theme.danger).setTitle(`✕ ${title}`);
  if (description) e.setDescription(description);
  return e;
}

export function infoEmbed(title: string, description?: string): EmbedBuilder {
  const e = baseEmbed(Theme.info).setTitle(`◈ ${title}`);
  if (description) e.setDescription(description);
  return e;
}

export function modEmbed(
  title: string,
  fields: APIEmbedField[],
  color: ColorResolvable = Theme.danger
): EmbedBuilder {
  return baseEmbed(color)
    .setTitle(`🛡 ${title}`)
    .addFields(fields);
}

export function economyEmbed(title: string, description?: string): EmbedBuilder {
  const e = baseEmbed(Theme.economy).setTitle(`⬡ ${title}`);
  if (description) e.setDescription(description);
  return e;
}

export function userCard(user: User, title: string, description?: string): EmbedBuilder {
  const e = baseEmbed(Theme.primary)
    .setAuthor({ name: title, iconURL: user.displayAvatarURL({ size: 128 }) })
    .setThumbnail(user.displayAvatarURL({ size: 256 }));
  if (description) e.setDescription(description);
  return e;
}

export function guildCard(guild: Guild, title: string): EmbedBuilder {
  return baseEmbed(Theme.primary)
    .setTitle(`◈ ${title}`)
    .setThumbnail(guild.iconURL({ size: 256 }) ?? null);
}

export function divider(): string {
  return "────────────────────";
}

export function code(value: string | number): string {
  return `\`${value}\``;
}

export function bold(value: string | number): string {
  return `**${value}**`;
}
