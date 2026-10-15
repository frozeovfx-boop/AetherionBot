import { Events, Message, PartialMessage } from "discord.js";
import { Event } from "../structures/Event.js";
import type { AetherionClient } from "../client/AetherionClient.js";
import { sendGuildLog } from "../utils/guildLog.js";
import { Theme, baseEmbed, line, kv, code } from "../utils/embeds.js";

export default class MessageUpdateEvent extends Event<typeof Events.MessageUpdate> {
  constructor() {
    super(Events.MessageUpdate);
  }

  public async execute(
    client: AetherionClient,
    oldMessage: Message | PartialMessage,
    newMessage: Message | PartialMessage
  ): Promise<void> {
    if (!newMessage.guild || newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    try {
      if (oldMessage.partial) await oldMessage.fetch().catch(() => null);
      if (newMessage.partial) await newMessage.fetch().catch(() => null);
    } catch {
      return;
    }

    const before = oldMessage.content?.slice(0, 800) || "*yok*";
    const after = newMessage.content?.slice(0, 800) || "*yok*";
    if (before === after) return;

    const embed = baseEmbed(Theme.warning)
      .setAuthor({ name: "MESAJ · DÜZENLENDİ" })
      .setDescription(
        [
          line(),
          kv("Yazar", newMessage.author?.tag ?? "Bilinmiyor"),
          kv("Kanal", `${newMessage.channel}`),
          kv("ID", code(newMessage.id)),
          line(),
          "**Eski**",
          before,
          "",
          "**Yeni**",
          after,
          line(),
          `[Mesaja git](${newMessage.url})`,
        ].join("\n")
      );

    if (newMessage.author) {
      embed.setThumbnail(newMessage.author.displayAvatarURL({ size: 64 }));
    }

    await sendGuildLog(client, newMessage.guild.id, "message", embed);
  }
}
