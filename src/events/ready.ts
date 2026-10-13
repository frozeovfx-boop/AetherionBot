import { Events, ActivityType, REST, Routes } from "discord.js";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Event } from "../structures/Event.js";
import type { AetherionClient } from "../client/AetherionClient.js";
import type { Command } from "../structures/Command.js";

const MAX_COMMANDS = 100;

const CATEGORY_PRIORITY: Record<string, number> = {
  moderation: 100,
  utility: 90,
  economy: 80,
  music: 70,
  server: 60,
  fun: 40,
  ai: 30,
  admin: 20,
};

async function collectSlashData(): Promise<object[]> {
  const loaded: { data: object; priority: number }[] = [];
  const commandsPath = join(process.cwd(), "src", "commands");
  const categories = await readdir(commandsPath);

  for (const category of categories) {
    const categoryPath = join(commandsPath, category);
    let files: string[];
    try {
      files = await readdir(categoryPath);
    } catch {
      continue;
    }

    for (const file of files) {
      if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;
      try {
        const mod = await import(pathToFileURL(join(categoryPath, file)).href);
        const Cmd = mod.default;
        if (!Cmd) continue;
        const instance: Command = typeof Cmd === "function" ? new Cmd() : Cmd;
        if (!instance?.data) continue;
        loaded.push({
          data: instance.data,
          priority: CATEGORY_PRIORITY[instance.category] ?? 10,
        });
      } catch {
        /* skip broken */
      }
    }
  }

  loaded.sort((a, b) => b.priority - a.priority);
  return loaded.slice(0, MAX_COMMANDS).map((c) => c.data);
}

export default class ReadyEvent extends Event<typeof Events.ClientReady> {
  constructor() {
    super(Events.ClientReady, true);
  }

  public async execute(client: AetherionClient): Promise<void> {
    client.logger.info(`Logged in as ${client.user?.tag}`);
    client.logger.info(`Serving ${client.guilds.cache.size} guilds · ${client.commands.size} commands`);

    // Presence
    const updatePresence = () => {
      const n = client.guilds.cache.size;
      client.user?.setPresence({
        activities: [
          {
            name: `${n} sunucu · /help`,
            type: ActivityType.Watching,
          },
        ],
        status: "online",
      });
    };
    updatePresence();
    setInterval(updatePresence, 10 * 60_000);

    // Invite cache
    for (const guild of client.guilds.cache.values()) {
      try {
        const { Collection } = await import("discord.js");
        const invs = await guild.invites.fetch();
        const map = new Collection<string, { uses: number; inviterId: string }>();
        for (const [code, inv] of invs) {
          map.set(code, { uses: inv.uses ?? 0, inviterId: inv.inviter?.id ?? "" });
        }
        client.invites.cache.set(guild.id, map);
      } catch {
        /* Manage Guild required */
      }
    }

    // Time capsules
    setInterval(async () => {
      const due = client.capsules.due();
      for (const c of due) {
        try {
          const channel = await client.channels.fetch(c.channelId);
          if (channel && channel.isTextBased() && !channel.isDMBased()) {
            const { Theme, baseEmbed, line, kv } = await import("../utils/embeds.js");
            await channel.send({
              embeds: [
                baseEmbed(Theme.info)
                  .setAuthor({ name: "CAPSULE · AÇILDI" })
                  .setDescription(
                    [
                      line(),
                      c.content,
                      line(),
                      kv("Yazan", c.authorTag),
                      kv("ID", c.id),
                    ].join("\n")
                  ),
              ],
            });
          }
          client.capsules.markOpened(c.id);
        } catch (err) {
          client.logger.error(err, `capsule ${c.id}`);
          client.capsules.markOpened(c.id);
        }
      }
    }, 30_000);

    // Birthday announcements (once per guild per calendar day)
    const birthdayAnnounced = new Set<string>();
    const checkBirthdays = async () => {
      const now = new Date();
      const dayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      for (const guild of client.guilds.cache.values()) {
        const stamp = `${guild.id}:${dayKey}`;
        if (birthdayAnnounced.has(stamp)) continue;
        const list = client.birthdays.today(guild.id, now);
        if (!list.length) {
          birthdayAnnounced.add(stamp);
          continue;
        }
        const cfg = client.settings.get(guild.id);
        const channelId = cfg.welcomeChannelId ?? guild.systemChannelId;
        if (!channelId) {
          birthdayAnnounced.add(stamp);
          continue;
        }
        try {
          const channel = await client.channels.fetch(channelId);
          if (!channel || !channel.isTextBased() || channel.isDMBased()) {
            birthdayAnnounced.add(stamp);
            continue;
          }
          const { Theme, baseEmbed, line } = await import("../utils/embeds.js");
          const mentions = list.map((b) => `<@${b.userId}>`).join(" ");
          await channel.send({
            embeds: [
              baseEmbed(Theme.success)
                .setAuthor({ name: "BIRTHDAY" })
                .setTitle("Bugün doğum günü!")
                .setDescription([line(), mentions, line(), "✦ İyi ki doğdunuz!"].join("\n")),
            ],
          });
          birthdayAnnounced.add(stamp);
          client.logger.info(`Birthday announce → ${guild.name}`);
        } catch (err) {
          client.logger.error(err, "birthday announce");
          birthdayAnnounced.add(stamp);
        }
      }
    };
    setTimeout(checkBirthdays, 15_000);
    setInterval(checkBirthdays, 60 * 60_000);

    // Auto deploy slash commands (guild if DISCORD_GUILD_ID, else global)
    try {
      const body = await collectSlashData();
      const rest = new REST({ version: "10" }).setToken(client.config.DISCORD_TOKEN);
      const clientId = client.config.DISCORD_CLIENT_ID;
      const guildId = client.config.DISCORD_GUILD_ID;

      if (guildId) {
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });
        client.logger.info(`Slash commands deployed to guild ${guildId} (${body.length})`);
      } else {
        await rest.put(Routes.applicationCommands(clientId), { body });
        client.logger.info(`Global slash commands deployed (${body.length})`);
      }
    } catch (err) {
      client.logger.error(err, "Auto deploy failed");
    }
  }
}
