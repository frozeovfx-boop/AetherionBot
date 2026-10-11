import { EmbedBuilder, ColorResolvable } from "discord.js";
import type { CaseType } from "../types/moderation.js";
import { Theme, baseEmbed, code, divider } from "./embeds.js";

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

export async function sendModLog(): Promise<void> {
  // wired when modlog channel config exists
}

export function buildModEmbed(data: {
  type: CaseType;
  userTag: string;
  userId: string;
  moderatorTag: string;
  reason: string;
  duration?: string;
  caseId?: number;
}): EmbedBuilder {
  const lines = [
    divider(),
    `**Kullanıcı**   ${data.userTag}`,
    `**ID**          ${code(data.userId)}`,
    `**Yetkili**     ${data.moderatorTag}`,
    data.duration ? `**Süre**        ${code(data.duration)}` : null,
    `**Sebep**       ${data.reason}`,
    divider(),
  ]
    .filter(Boolean)
    .join("\n");

  const embed = baseEmbed(COLORS[data.type])
    .setTitle(`🛡  ${TITLES[data.type]}`)
    .setDescription(lines);

  if (data.caseId) {
    embed.setFooter({ text: `Case #${data.caseId} · Aetherion` });
  }

  return embed;
}
