import { TextChannel, EmbedBuilder } from "discord.js";
import type { YutaClient } from "../client/YutaClient.js";

export type LogKind = "message" | "member" | "voice" | "mod" | "invite";

export async function sendGuildLog(
  client: YutaClient,
  guildId: string,
  kind: LogKind,
  embed: EmbedBuilder
): Promise<void> {
  const cfg = client.settings.get(guildId);
  let channelId: string | null = null;

  switch (kind) {
    case "message":
      channelId = cfg.messageLogChannelId;
      break;
    case "member":
      channelId = cfg.memberLogChannelId;
      break;
    case "voice":
      channelId = cfg.voiceLogChannelId;
      break;
    case "mod":
      channelId = cfg.modlogChannelId;
      break;
    case "invite":
      channelId = cfg.inviteLogChannelId;
      break;
  }

  if (!channelId) return;

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased() || channel.isDMBased()) return;
    await (channel as TextChannel).send({ embeds: [embed] });
  } catch {
    /* missing perms / deleted */
  }
}
