import { Events, ActivityType, REST, Routes, Collection } from "discord.js";
import { Event } from "../structures/Event.js";
import type { YutaClient } from "../client/YutaClient.js";
import { resumeGiveaways } from "../utils/giveawayEnd.js";
import { resumeTempbans } from "../utils/tempbanResume.js";
import { collectSlashCommands } from "../utils/slashDeploy.js";
import { Theme, baseEmbed, line, kv } from "../utils/embeds.js";

export default class ReadyEvent extends Event<typeof Events.ClientReady> {
  constructor() {
    super(Events.ClientReady, true);
  }

  public async execute(client: YutaClient): Promise<void> {
    const tag = client.user?.tag ?? "Yuta";
    client.logger.info("────────────────────────────");
    client.logger.info(`Yuta   ${tag}`);
    client.logger.info(`guild  ${client.guilds.cache.size} · cmds ${client.commands.size}`);

    const updatePresence = () => {
      client.user?.setPresence({
        activities: [
          {
            name: `/help · ${client.guilds.cache.size} sunucu`,
            type: ActivityType.Watching,
          },
        ],
        status: "online",
      });
    };
    updatePresence();
    setInterval(updatePresence, 10 * 60_000);

    resumeGiveaways(client);
    resumeTempbans(client);
    void client.music.init(client);

    for (const guild of client.guilds.cache.values()) {
      try {
        const invs = await guild.invites.fetch();
        const map = new Collection<string, { uses: number; inviterId: string }>();
        for (const [code, inv] of invs) {
          map.set(code, { uses: inv.uses ?? 0, inviterId: inv.inviter?.id ?? "" });
        }
        client.invites.cache.set(guild.id, map);
      } catch {
        /* need Manage Guild */
      }
    }

    setInterval(async () => {
      for (const c of client.capsules.due()) {
        try {
          const channel = await client.channels.fetch(c.channelId);
          if (channel && channel.isTextBased() && !channel.isDMBased()) {
            await channel.send({
              embeds: [
                baseEmbed(Theme.info)
                  .setAuthor({ name: "Yuta · Kapsül" })
                  .setDescription([line(), c.content, line(), kv("Yazan", c.authorTag)].join("\n")),
              ],
            });
          }
          client.capsules.markOpened(c.id);
        } catch {
          client.capsules.markOpened(c.id);
        }
      }
    }, 30_000);

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
          await channel.send({
            embeds: [
              baseEmbed(Theme.primary)
                .setAuthor({ name: "Yuta · Doğum günü" })
                .setDescription(list.map((b) => `<@${b.userId}>`).join(" ")),
            ],
          });
          birthdayAnnounced.add(stamp);
        } catch {
          birthdayAnnounced.add(stamp);
        }
      }
    };
    setTimeout(() => void checkBirthdays(), 15_000);
    setInterval(() => void checkBirthdays(), 60 * 60_000);

    try {
      const { selected, blocked, cut } = await collectSlashCommands();
      const body = selected.map((c) => c.data);
      const rest = new REST({ version: "10" }).setToken(client.config.DISCORD_TOKEN);
      const clientId = client.config.DISCORD_CLIENT_ID;
      const guildId = client.config.DISCORD_GUILD_ID;

      if (guildId) {
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });
      } else {
        await rest.put(Routes.applicationCommands(clientId), { body });
      }

      client.logger.info(
        `slash  ${selected.length} · block ${blocked}` + (cut.length ? ` · cut ${cut.length}` : "")
      );
      client.logger.info(`top    ${selected.slice(0, 10).map((c) => c.name).join(" · ")}`);
    } catch (err) {
      client.logger.error(err, "slash deploy");
    }

    client.logger.info("ready  online");
    client.logger.info("────────────────────────────");
  }
}
