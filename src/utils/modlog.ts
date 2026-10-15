import {
  EmbedBuilder,
  ColorResolvable,
  TextChannel,
  Client,
} from "discord.js";
import type { CaseType } from "../types/moderation.js";
import type { YutaClient } from "../client/YutaClient.js";
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

export function buildModEmbed(data: {
  type: CaseType;
  userTag: string;
  userId: string;
  moderatorTag: string;
  reason: string;
  duration?: string;
  caseId?: number;
  userAvatar?: string | null;
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

  if (data.userAvatar) embed.setThumbnail(data.userAvatar);
  if (data.caseId) embed.setFooter({ text: `Case #${data.caseId} · Yuta` });
  return embed;
}

/** Send moderation embed to configured modlog channel */
export async function sendModLog(
  client: YutaClient,
  guildId: string,
  embed: EmbedBuilder
): Promise<void> {
  const channelId = client.settings.get(guildId).modlogChannelId;
  if (!channelId) return;

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased() || channel.isDMBased()) return;
    await (channel as TextChannel).send({ embeds: [embed] });
  } catch {
    /* channel deleted / missing perms */
  }
}
