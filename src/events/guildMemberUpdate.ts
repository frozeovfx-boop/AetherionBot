import { Events, GuildMember, PartialGuildMember } from "discord.js";
import { Event } from "../structures/Event.js";
import type { YutaClient } from "../client/YutaClient.js";
import { sendGuildLog } from "../utils/guildLog.js";
import { Theme, baseEmbed, line, kv } from "../utils/embeds.js";

export default class GuildMemberUpdateEvent extends Event<typeof Events.GuildMemberUpdate> {
  constructor() {
    super(Events.GuildMemberUpdate);
  }

  public async execute(
    client: YutaClient,
    oldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember
  ): Promise<void> {
    if (newMember.user.bot) return;

    // Nickname
    const oldNick = oldMember.nickname ?? oldMember.user?.username ?? null;
    const newNick = newMember.nickname ?? newMember.user.username;
    if (oldMember.nickname !== newMember.nickname) {
      const embed = baseEmbed(Theme.info)
        .setAuthor({
          name: "ÜYE · NICK",
          iconURL: newMember.user.displayAvatarURL({ size: 64 }),
        })
        .setDescription(
          [
            line(),
            kv("Kullanıcı", newMember.user.tag),
            kv("Eski", oldNick ?? "—"),
            kv("Yeni", newNick),
            line(),
          ].join("\n")
        )
        .setThumbnail(newMember.user.displayAvatarURL({ size: 128 }));

      await sendGuildLog(client, newMember.guild.id, "member", embed);
    }

    // Roles
    const oldRoles = oldMember.roles?.cache ?? null;
    if (!oldRoles) return;

    const added = newMember.roles.cache.filter((r) => !oldRoles.has(r.id) && r.id !== newMember.guild.id);
    const removed = oldRoles.filter((r) => !newMember.roles.cache.has(r.id) && r.id !== newMember.guild.id);

    if (added.size === 0 && removed.size === 0) return;

    const lines: string[] = [line(), kv("Kullanıcı", newMember.user.tag)];
    if (added.size) {
      lines.push(kv("Eklenen", added.map((r) => r.name).join(", ")));
    }
    if (removed.size) {
      lines.push(kv("Alınan", removed.map((r) => r.name).join(", ")));
    }
    lines.push(line());

    const embed = baseEmbed(added.size ? Theme.success : Theme.danger)
      .setAuthor({
        name: "ÜYE · ROL",
        iconURL: newMember.user.displayAvatarURL({ size: 64 }),
      })
      .setDescription(lines.join("\n"))
      .setThumbnail(newMember.user.displayAvatarURL({ size: 128 }));

    await sendGuildLog(client, newMember.guild.id, "member", embed);
  }
}
