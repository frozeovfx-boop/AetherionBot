import { EmbedBuilder, ColorResolvable } from "discord.js";
import type { CaseType } from "../types/moderation.js";
import { Theme, baseEmbed, line, code, kv } from "./embeds.js";

const COLORS: Record<CaseType, ColorResolvable> = {
  ban: Theme.danger,
  softban: Theme.warning,
  kick: Theme.danger,
  timeout: Theme.warning,
  untimeout: Theme.success,
  unban: Theme.success,
  warn: Theme.warning,
  mute: Theme.warning,
  unmute: Theme.success,
  other: Theme.info,
};

const TITLES: Record<CaseType, string> = {
  ban: "Yasaklama",
  softban: "Softban",
  kick: "Atma",
  timeout: "Timeout",
  untimeout: "Timeout Kaldırıldı",
  unban: "Yasak Kaldırıldı",
  warn: "Uyarı",
  mute: "Susturma",
  unmute: "Susturma Kaldırıldı",
  other: "Moderasyon",
};

export async function sendModLog(): Promise<void> {}

export function buildModEmbed(data: {
  type: CaseType;
  userTag: string;
  userId: string;
  moderatorTag: string;
  reason: string;
  duration?: string;
  caseId?: number;
}): EmbedBuilder {
  const embed = baseEmbed(COLORS[data.type])
    .setAuthor({ name: "MODERASYON" })
    .setTitle(TITLES[data.type])
    .setDescription(
      [
        line(),
        kv("Kullanıcı", data.userTag),
        kv("ID", code(data.userId)),
        kv("Yetkili", data.moderatorTag),
        data.duration ? kv("Süre", data.duration) : null,
        kv("Sebep", data.reason),
        line(),
      ]
        .filter(Boolean)
        .join("\n")
    );

  if (data.caseId) embed.setFooter({ text: `Case #${data.caseId} · Aetherion` });
  return embed;
}
