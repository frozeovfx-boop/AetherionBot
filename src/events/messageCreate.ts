import { Events, Message, Collection } from "discord.js";
import { Event } from "../structures/Event.js";
import type { AetherionClient } from "../client/AetherionClient.js";
import { afkMap } from "../commands/utility/afk.js";

export default class MessageCreateEvent extends Event<typeof Events.MessageCreate> {
  constructor() {
    super(Events.MessageCreate);
  }

  public async execute(client: AetherionClient, message: Message): Promise<void> {
    if (message.author.bot || !message.guild) return;

    if (afkMap.has(message.author.id)) {
      afkMap.delete(message.author.id);
      await message.reply({ content: "AFK modundan çıktın." }).then((m) => {
        setTimeout(() => m.delete().catch(() => null), 5000);
      });
    }

    for (const user of message.mentions.users.values()) {
      const afk = afkMap.get(user.id);
      if (afk) {
        await message.reply({
          content: `**${user.username}** AFK: ${afk.reason}`,
        }).catch(() => null);
        break;
      }
    }

    const prefix = client.settings.getPrefix(message.guild.id);
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const name = args.shift()?.toLowerCase();
    if (!name) return;

    const command = client.commands.get(name);
    if (!command) return;

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

    try {
      await command.execute(client, message as never, args);
    } catch (error) {
      client.logger.error(error, `Prefix command error: ${command.name}`);
      await message.reply("Bu komut şu an sadece slash olarak çalışıyor.").catch(() => null);
    }
  }
}
