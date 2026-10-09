import { Events, Message, Collection } from "discord.js";
import { Event } from "../structures/Event.js";
import type { AetherionClient } from "../client/AetherionClient.js";

export default class MessageCreateEvent extends Event<typeof Events.MessageCreate> {
  constructor() {
    super(Events.MessageCreate);
  }

  public async execute(client: AetherionClient, message: Message): Promise<void> {
    if (message.author.bot || !message.guild) return;

    const prefix = client.config.PREFIX;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const name = args.shift()?.toLowerCase();
    if (!name) return;

    const command = client.commands.get(name);
    if (!command || !command.prefix) return;

    if (command.guildOnly && !message.guild) return;

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
        await message.reply(`Bu komutu tekrar kullanabilmek için **${remaining}** saniye beklemelisin.`);
        return;
      }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
      await command.execute(client, message, args);
    } catch (error) {
      client.logger.error(error, `Prefix command error: ${command.name}`);
      await message.reply("Komut çalıştırılırken bir hata oluştu.").catch(() => null);
    }
  }
}
