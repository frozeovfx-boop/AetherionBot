import type { GuildMember, User } from "discord.js";
import type { YutaClient } from "../client/YutaClient.js";
import type { GiveawayData } from "../database/GiveawayManager.js";
import { Theme, baseEmbed, line, kv } from "./embeds.js";

/** Highest luck multiplier among member roles (default 1). */
export function memberLuckWeight(
  client: YutaClient,
  guildId: string,
  member: GuildMember | null
): number {
  if (!member) return 1;
  const luck = client.settings.get(guildId).giveawayLuck;
  let best = 1;
  for (const [roleId, w] of Object.entries(luck)) {
    if (member.roles.cache.has(roleId) && w > best) best = w;
  }
  return best;
}

function weightedPick(entries: { user: User; weight: number }[], count: number): User[] {
  const pool = entries.map((e) => ({ ...e }));
  const selected: User[] = [];

  for (let n = 0; n < count && pool.length > 0; n++) {
    const total = pool.reduce((s, e) => s + e.weight, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i]!.weight;
      if (r <= 0) {
        idx = i;
        break;
      }
      idx = i;
    }
    selected.push(pool[idx]!.user);
    pool.splice(idx, 1);
  }
  return selected;
}

export async function endGiveaway(
  client: YutaClient,
  g: GiveawayData,
  reroll: boolean
): Promise<void> {
  if (!reroll && g.ended) return;
  client.giveaways.markEnded(g.id);

  try {
    const channel = await client.channels.fetch(g.channelId);
    if (!channel || !channel.isTextBased() || channel.isDMBased()) return;

    const msg = await channel.messages.fetch(g.messageId).catch(() => null);
    if (!msg) return;

    const guild = msg.guild;
    if (!guild) return;

    const reaction = msg.reactions.cache.get("🎉");
    const users = reaction ? await reaction.users.fetch() : null;
    const entrants = users?.filter((u) => !u.bot).map((u) => u) ?? [];

    if (entrants.length === 0) {
      await msg.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Kimse katılmadı.")],
      });
      return;
    }

    const weighted: { user: User; weight: number }[] = [];
    for (const u of entrants) {
      const member = await guild.members.fetch(u.id).catch(() => null);
      weighted.push({ user: u, weight: memberLuckWeight(client, guild.id, member) });
    }

    const winners = weightedPick(weighted, g.winnersCount);
    const selected = winners.map((u) => u.toString());

    await msg.reply({
      embeds: [
        baseEmbed(Theme.success)
          .setAuthor({ name: reroll ? "GIVEAWAY · REROLL" : "GIVEAWAY" })
          .setTitle("Sonuç")
          .setDescription(
            [
              line(),
              kv("Ödül", g.prize),
              kv("Kazananlar", selected.join(", ")),
              line(),
            ].join("\n")
          ),
      ],
    });
  } catch (err) {
    client.logger.error(err, "giveaway end");
  }
}

export function resumeGiveaways(client: YutaClient): void {
  for (const g of client.giveaways.active()) {
    const delay = g.endsAt - Date.now();
    if (delay <= 0) {
      void endGiveaway(client, g, false);
    } else {
      client.giveaways.schedule(g.id, delay, () => {
        void endGiveaway(client, g, false);
      });
    }
  }
  client.logger.info(`Giveaways resumed: ${client.giveaways.active().length} active`);
}
