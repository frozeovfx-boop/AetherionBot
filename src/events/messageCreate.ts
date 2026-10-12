import { Events, Message, Collection, PermissionFlagsBits } from "discord.js";
import { Event } from "../structures/Event.js";
import type { AetherionClient } from "../client/AetherionClient.js";
import { afkMap } from "../commands/utility/afk.js";
import { PrefixInteraction, optionNamesFromData } from "../utils/PrefixInteraction.js";

export default class MessageCreateEvent extends Event<typeof Events.MessageCreate> {
  constructor() {
    super(Events.MessageCreate);
  }

  public async execute(client: AetherionClient, message: Message): Promise<void> {
    if (message.author.bot || !message.guild) return;

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

    const prefix = client.settings.getPrefix(message.guild.id);
    if (!message.content.startsWith(prefix)) return;

    const raw = message.content.slice(prefix.length).trim();
    if (!raw) return;

    const parts = raw.split(/\s+/);
    let name = parts.shift()?.toLowerCase();
    if (!name) return;

    let command = client.commands.get(name);

    // Subcommand-style: autorole ekle → still command "autorole"
    if (!command && parts.length > 0) {
      // keep as is
    }

    if (!command) return;

    // Permissions (member)
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

    // Cooldown
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
