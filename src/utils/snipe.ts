import { Collection, Message, PartialMessage } from "discord.js";

export interface SnipeData {
  content: string;
  authorTag: string;
  authorId: string;
  authorAvatar: string;
  channelId: string;
  createdAt: Date;
  attachments: string[];
}

/** channelId -> last deleted message */
export const snipeCache = new Collection<string, SnipeData>();

export function storeSnipe(message: Message | PartialMessage): void {
  if (!message.channelId) return;
  if (message.author?.bot) return;

  snipeCache.set(message.channelId, {
    content: message.content || "*içerik yok*",
    authorTag: message.author?.tag ?? "Bilinmiyor",
    authorId: message.author?.id ?? "0",
    authorAvatar: message.author?.displayAvatarURL() ?? "",
    channelId: message.channelId,
    createdAt: message.createdAt ?? new Date(),
    attachments: message.attachments?.map((a) => a.url) ?? [],
  });
}
