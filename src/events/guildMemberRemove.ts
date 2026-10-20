import { Events, GuildMember, PartialGuildMember, TextChannel } from "discord.js";
import { Event } from "../structures/Event.js";
import type { YutaClient } from "../client/YutaClient.js";
import { line, yutaMemberCard } from "../utils/embeds.js";

export default class GuildMemberRemoveEvent extends Event<typeof Events.GuildMemberRemove> {
  constructor() {
    super(Events.GuildMemberRemove);
  }

  public async execute(
    client: YutaClient,
    member: GuildMember | PartialGuildMember
  ): Promise<void> {
    const cfg = client.settings.get(member.guild.id);

    // Invite leave count
    const invKey = `${member.guild.id}:${member.id}`;
    const inviterId = client.invites.memberInviter.get(invKey);
    if (inviterId) {
      client.invites.addLeave(member.guild.id, inviterId);
      client.invites.memberInviter.delete(invKey);
    }

    if (!cfg.welcomeChannelId) return;

    try {
      const channel = await client.channels.fetch(cfg.welcomeChannelId);
      if (!channel || !channel.isTextBased() || channel.isDMBased()) return;

      const tag = member.user?.tag ?? member.id;
      const text = cfg.leaveMessage
        .replaceAll("{user}", tag)
        .replaceAll("{server}", member.guild.name)
        .replaceAll("{count}", String(member.guild.memberCount));

      const embed = yutaMemberCard({
        title: "Ayrıldı",
        description: text,
        avatarUrl: member.user?.displayAvatarURL({ size: 256 }) ?? null,
        guildIcon: member.guild.iconURL({ size: 64 }),
      });

      await (channel as TextChannel).send({ embeds: [embed] });
    } catch (err) {
      client.logger.error(err, "leave message failed");
    }
  }
}
