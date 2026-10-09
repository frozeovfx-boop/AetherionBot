import { EmbedBuilder, TextChannel, ColorResolvable } from "discord.js";
import type { AetherionClient } from "../client/AetherionClient.js";
import type { CaseType } from "../types/moderation.js";

const COLORS: Record<CaseType, ColorResolvable> = {
  ban: 0xed4245,
  softban: 0xfaa61a,
  kick: 0xed4245,
  timeout: 0xfee75c,
  untimeout: 0x57f287,
  unban: 0x57f287,
  warn: 0xfee75c,
  mute: 0xfee75c,
  unmute: 0x57f287,
  other: 0x5865f2,
};

const TITLES: Record<CaseType, string> = {
  ban: "Ban",
  softban: "Softban",
  kick: "Kick",
  timeout: "Timeout",
  untimeout: "Timeout Kaldırıldı",
  unban: "Unban",
  warn: "Warn",
  mute: "Mute",
  unmute: "Unmute",
  other: "Moderation Action",
};

export async function sendModLog(
  client: AetherionClient,
  guildId: string,
  data: {
    type: CaseType;
    userTag: string;
    userId: string;
    moderatorTag: string;
    reason: string;
    duration?: string;
    caseId?: number;
  }
): Promise<void> {
  // Placeholder: when DB + config is ready, fetch modlog channel from guild config
  // For now this is a no-op until modlog channel is configured
  void client;
  void guildId;
  void data;
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
  const embed = new EmbedBuilder()
    .setColor(COLORS[data.type])
    .setTitle(TITLES[data.type])
    .addFields(
      { name: "Kullanıcı", value: `${data.userTag} (\`${data.userId}\`)`, inline: true },
      { name: "Yetkili", value: data.moderatorTag, inline: true },
      { name: "Sebep", value: data.reason }
    )
    .setTimestamp();

  if (data.duration) {
    embed.addFields({ name: "Süre", value: data.duration, inline: true });
  }

  if (data.caseId) {
    embed.setFooter({ text: `Case #${data.caseId}` });
  }

  return embed;
}
