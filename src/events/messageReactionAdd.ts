import {
  Events,
  MessageReaction,
  User,
  PartialMessageReaction,
  PartialUser,
  TextChannel,
} from "discord.js";
import { Event } from "../structures/Event.js";
import type { YutaClient } from "../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../utils/embeds.js";

/** messageId -> starboard message id (avoid duplicates) */
const posted = new Map<string, string>();

export default class MessageReactionAddEvent extends Event<typeof Events.MessageReactionAdd> {
  constructor() {
    super(Events.MessageReactionAdd);
  }

  public async execute(
    client: YutaClient,
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser
  ): Promise<void> {
    if (user.bot) return;

    try {
      if (reaction.partial) reaction = await reaction.fetch();
      if (reaction.message.partial) await reaction.message.fetch();
    } catch {
      return;
    }

    if (reaction.emoji.name !== "⭐") return;
    const message = reaction.message;
    if (!message.guild || message.author?.bot) return;

    const cfg = client.settings.get(message.guild.id);
    if (!cfg.starboardChannelId) return;

    const count = reaction.count ?? 0;
    if (count < cfg.starboardMin) return;
    if (posted.has(message.id)) return;

    try {
      const channel = await client.channels.fetch(cfg.starboardChannelId);
      if (!channel || !channel.isTextBased() || channel.isDMBased()) return;

      const embed = baseEmbed(Theme.economy)
        .setAuthor({
          name: message.author?.tag ?? "Bilinmeyen",
          iconURL: message.author?.displayAvatarURL({ size: 64 }),
        })
        .setDescription(
          [
            line(),
            message.content?.slice(0, 1500) || "*medya / embed*",
            line(),
            kv("⭐", code(count)),
            kv("Kanal", `${message.channel}`),
            line(),
          ].join("\n")
        )
        .setFooter({ text: message.id });

      const img = message.attachments.find((a) =>
        (a.contentType ?? "").startsWith("image/")
      );
      if (img) embed.setImage(img.url);

      const sent = await (channel as TextChannel).send({
        content: `⭐ **${count}** · [Mesaja git](${message.url})`,
        embeds: [embed],
      });
      posted.set(message.id, sent.id);
    } catch (err) {
      client.logger.error(err, "starboard failed");
    }
  }
}
