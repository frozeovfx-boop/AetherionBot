import { Events, GuildMember, TextChannel, Collection } from "discord.js";
import { Event } from "../structures/Event.js";
import type { YutaClient } from "../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "../utils/embeds.js";

export default class GuildMemberAddEvent extends Event<typeof Events.GuildMemberAdd> {
  constructor() {
    super(Events.GuildMemberAdd);
  }

  public async execute(client: YutaClient, member: GuildMember): Promise<void> {
    const cfg = client.settings.get(member.guild.id);

    // Autorole
    if (cfg.autoroleIds.length > 0) {
      const roles = cfg.autoroleIds.filter((id) => member.guild.roles.cache.has(id));
      if (roles.length > 0) {
        await member.roles.add(roles, "Yuta autorole").catch((err) => {
          client.logger.error(err, "autorole failed");
        });
      }
    }

    // Invite tracking
    let inviterTag = "Bilinmiyor";
    let inviterId: string | null = null;
    try {
      const cached = client.invites.cache.get(member.guild.id) ?? new Collection();
      const current = await member.guild.invites.fetch().catch(() => null);
      if (current) {
        for (const [code, inv] of current) {
          const prev = cached.get(code);
          const uses = inv.uses ?? 0;
          if (prev && uses > prev.uses && inv.inviter) {
            inviterId = inv.inviter.id;
            inviterTag = inv.inviter.tag;
            client.invites.addJoin(member.guild.id, inviterId);
            client.invites.memberInviter.set(`${member.guild.id}:${member.id}`, inviterId);
            break;
          }
          if (!prev && uses > 0 && inv.inviter) {
            inviterId = inv.inviter.id;
            inviterTag = inv.inviter.tag;
            client.invites.addJoin(member.guild.id, inviterId);
            client.invites.memberInviter.set(`${member.guild.id}:${member.id}`, inviterId);
            break;
          }
        }
        // refresh cache
        const next = new Collection<string, { uses: number; inviterId: string }>();
        for (const [code, inv] of current) {
          next.set(code, { uses: inv.uses ?? 0, inviterId: inv.inviter?.id ?? "" });
        }
        client.invites.cache.set(member.guild.id, next);
      }
    } catch (err) {
      client.logger.error(err, "invite track");
    }

    // Invite log
    if (cfg.inviteLogChannelId && inviterId) {
      try {
        const logCh = await client.channels.fetch(cfg.inviteLogChannelId);
        if (logCh && logCh.isTextBased() && !logCh.isDMBased()) {
          const stats = client.invites.get(member.guild.id, inviterId);
          await (logCh as TextChannel).send({
            embeds: [
              baseEmbed(Theme.info)
                .setAuthor({ name: "DAVET" })
                .setDescription(
                  [
                    line(),
                    kv("Üye", member.user.tag),
                    kv("Davet eden", inviterTag),
                    kv("Toplam", code(stats.joins)),
                    line(),
                  ].join("\n")
                )
                .setThumbnail(member.user.displayAvatarURL({ size: 128 })),
            ],
          });
        }
      } catch {
        /* ignore */
      }
    }

    // Welcome
    if (!cfg.welcomeChannelId) return;

    try {
      const channel = await client.channels.fetch(cfg.welcomeChannelId);
      if (!channel || !channel.isTextBased() || channel.isDMBased()) return;

      let text = cfg.welcomeMessage
        .replaceAll("{user}", `${member}`)
        .replaceAll("{server}", member.guild.name)
        .replaceAll("{count}", String(member.guild.memberCount));
      text = text.replaceAll("{inviter}", inviterTag);

      const embed = baseEmbed(Theme.success)
        .setAuthor({
          name: member.user.tag,
          iconURL: member.user.displayAvatarURL({ size: 64 }),
        })
        .setTitle("Hoş Geldin")
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .setDescription([line(), text, line()].join("\n"))
        .setFooter({ text: `Üye #${member.guild.memberCount} · Yuta` });

      await (channel as TextChannel).send({ embeds: [embed] });
    } catch (err) {
      client.logger.error(err, "welcome message failed");
    }
  }
}
