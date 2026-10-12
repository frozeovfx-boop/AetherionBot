import { Events, GuildMember, TextChannel } from "discord.js";
import { Event } from "../structures/Event.js";
import type { AetherionClient } from "../client/AetherionClient.js";
import { Theme, baseEmbed, line } from "../utils/embeds.js";

export default class GuildMemberAddEvent extends Event<typeof Events.GuildMemberAdd> {
  constructor() {
    super(Events.GuildMemberAdd);
  }

  public async execute(client: AetherionClient, member: GuildMember): Promise<void> {
    const cfg = client.settings.get(member.guild.id);

    // Autorole
    if (cfg.autoroleIds.length > 0) {
      const roles = cfg.autoroleIds.filter((id) => member.guild.roles.cache.has(id));
      if (roles.length > 0) {
        await member.roles.add(roles, "Aetherion autorole").catch((err) => {
          client.logger.error(err, "autorole failed");
        });
      }
    }

    // Welcome
    if (!cfg.welcomeChannelId) return;

    try {
      const channel = await client.channels.fetch(cfg.welcomeChannelId);
      if (!channel || !channel.isTextBased() || channel.isDMBased()) return;

      const text = cfg.welcomeMessage
        .replaceAll("{user}", `${member}`)
        .replaceAll("{server}", member.guild.name)
        .replaceAll("{count}", String(member.guild.memberCount));

      const embed = baseEmbed(Theme.success)
        .setAuthor({
          name: member.user.tag,
          iconURL: member.user.displayAvatarURL({ size: 64 }),
        })
        .setTitle("Hoş Geldin")
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .setDescription([line(), text, line()].join("\n"))
        .setFooter({ text: `Üye #${member.guild.memberCount} · Aetherion` });

      await (channel as TextChannel).send({ embeds: [embed] });
    } catch (err) {
      client.logger.error(err, "welcome message failed");
    }
  }
}
