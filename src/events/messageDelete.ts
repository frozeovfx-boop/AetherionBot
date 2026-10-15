import { Events, Message, PartialMessage } from "discord.js";
import { Event } from "../structures/Event.js";
import type { YutaClient } from "../client/YutaClient.js";
import { storeSnipe } from "../utils/snipe.js";
import { sendGuildLog } from "../utils/guildLog.js";
import { Theme, baseEmbed, line, kv, code } from "../utils/embeds.js";

export default class MessageDeleteEvent extends Event<typeof Events.MessageDelete> {
  constructor() {
    super(Events.MessageDelete);
  }

  public async execute(
    client: YutaClient,
    message: Message | PartialMessage
  ): Promise<void> {
    storeSnipe(message);

    if (!message.guild || message.author?.bot) return;

    const content = message.content?.slice(0, 1000) || "*içerik yok / embed / dosya*";
    const embed = baseEmbed(Theme.danger)
      .setAuthor({ name: "MESAJ · SİLİNDİ" })
      .setDescription(
        [
          line(),
          kv("Yazar", message.author?.tag ?? "Bilinmiyor"),
          kv("Kanal", `${message.channel}`),
          kv("ID", code(message.id)),
          line(),
          content,
          line(),
        ].join("\n")
      );

    if (message.author) {
      embed.setThumbnail(message.author.displayAvatarURL({ size: 64 }));
    }

    await sendGuildLog(client, message.guild.id, "message", embed);
  }
}
