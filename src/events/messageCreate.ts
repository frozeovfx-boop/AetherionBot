import { Events, Message, Collection } from "discord.js";
import { Event } from "../structures/Event.js";
import type { YutaClient } from "../client/YutaClient.js";
import { afkMap } from "../commands/utility/afk.js";
import { PrefixInteraction, optionNamesFromData } from "../utils/PrefixInteraction.js";
import { Theme, baseEmbed, line } from "../utils/embeds.js";
import { runAutomod } from "../utils/automod.js";

/** channelId -> last sticky message id */
const stickyMsgs = new Map<string, string>();

export default class MessageCreateEvent extends Event<typeof Events.MessageCreate> {
  constructor() {
    super(Events.MessageCreate);
  }

  public async execute(client: YutaClient, message: Message): Promise<void> {
    if (message.author.bot || !message.guild) return;

    // Automod (before stats / commands)
    if (await runAutomod(client, message)) return;

    // Seen tracker
    client.seen.touch(message.author.id);

    // Text stats + message XP (1/min cooldown)
    client.stats.addMessage(message.guild.id, message.author.id);
    if (client.stats.canGrantMessageXp(message.guild.id, message.author.id)) {
      const { leveledUp, profile } = client.economy.addXp(message.guild.id, message.author.id, 15);
      if (leveledUp && message.channel.isTextBased()) {
        message.channel
          .send({
            embeds: [
              baseEmbed(Theme.economy)
                .setAuthor({ name: "LEVEL UP" })
                .setDescription(
                  [line(), `✦ **${message.author.username}** seviye **${profile.level}**`, line()].join("\n")
                ),
            ],
          })
          .catch(() => null);
      }
    }

    // AFK
    if (afkMap.has(message.author.id)) {
      afkMap.delete(message.author.id);
      await message
        .reply({ content: "AFK modundan çıktın." })
        .then((m) => setTimeout(() => m.delete().catch(() => null), 5000));
    }

    for (const user of message.mentions.users.values()) {
      const afk = afkMap.get(user.id);
      if (afk) {
        await message.reply({ content: `**${user.username}** AFK: ${afk.reason}` }).catch(() => null);
        break;
      }
    }

    // Sticky repost
    const stickyContent = client.settings.get(message.guild.id).sticky[message.channel.id];
    if (stickyContent && message.channel.isTextBased() && !message.channel.isDMBased()) {
      const prev = stickyMsgs.get(message.channel.id);
      if (prev) {
        await message.channel.messages.delete(prev).catch(() => null);
      }
      try {
        const sent = await message.channel.send({
          embeds: [
            baseEmbed(Theme.info)
              .setAuthor({ name: "STICKY" })
              .setDescription([line(), stickyContent, line()].join("\n")),
          ],
        });
        stickyMsgs.set(message.channel.id, sent.id);
      } catch {
        /* ignore */
      }
    }

    const prefix = client.settings.getPrefix(message.guild.id);
    if (!message.content.startsWith(prefix)) return;

    const raw = message.content.slice(prefix.length).trim();
    if (!raw) return;

    const parts = raw.split(/\s+/);
    const name = parts.shift()?.toLowerCase();
    if (!name) return;

    // Built-in: tag shortcut !t <name> or exact tag name as command
    const tags = client.settings.get(message.guild.id).tags;
    if (name === "t" || name === "tags") {
      const tagName = parts[0]?.toLowerCase();
      if (tagName && tags[tagName]) {
        await message.reply({
          embeds: [
            baseEmbed(Theme.primary)
              .setAuthor({ name: `TAG · ${tagName}` })
              .setDescription([line(), tags[tagName], line()].join("\n")),
          ],
        });
        return;
      }
    }
    if (tags[name]) {
      await message.reply({
        embeds: [
          baseEmbed(Theme.primary)
            .setAuthor({ name: `TAG · ${name}` })
            .setDescription([line(), tags[name], line()].join("\n")),
        ],
      });
      return;
    }

    const command = client.commands.get(name);
    if (!command) return;

    if (command.permissions.length > 0 && message.member) {
      const missing = message.member.permissions.missing(command.permissions);
      if (missing.length > 0) {
        await message.reply("Bu komut için yetkin yok.");
        return;
      }
    }

    if (command.ownerOnly && !client.config.ownerIds.includes(message.author.id)) {
      await message.reply("Bu komutu sadece bot sahibi kullanabilir.");
      return;
    }

    if (!client.cooldowns.has(command.name)) {
      client.cooldowns.set(command.name, new Collection());
    }
    const now = Date.now();
    const timestamps = client.cooldowns.get(command.name)!;
    const cooldownAmount = command.cooldown * 1000;

    if (timestamps.has(message.author.id)) {
      const expiration = timestamps.get(message.author.id)! + cooldownAmount;
      if (now < expiration) {
        const remaining = ((expiration - now) / 1000).toFixed(1);
        await message.reply(`**${remaining}**s bekle.`);
        return;
      }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    const optionNames = optionNamesFromData(command.data);
    const bridge = new PrefixInteraction(message, command.name, parts, optionNames);

    try {
      await command.execute(client, bridge as never, parts);
    } catch (error) {
      client.logger.error(error, `Prefix command error: ${command.name}`);
      const msg =
        error instanceof Error && error.message.startsWith("Eksik")
          ? error.message
          : "Komut çalıştırılamadı. Slash (`/`) ile dene veya argümanları kontrol et.";
      if (!bridge.replied && !bridge.deferred) {
        await message.reply(msg).catch(() => null);
      } else {
        await bridge.editReply(msg).catch(() => null);
      }
    }
  }
}
