import type { YutaClient } from "../client/YutaClient.js";
import type { GiveawayData } from "../database/GiveawayManager.js";
import { Theme, baseEmbed, line, kv } from "./embeds.js";

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

    const reaction = msg.reactions.cache.get("🎉");
    const users = reaction ? await reaction.users.fetch() : null;
    const entrants = users?.filter((u) => !u.bot).map((u) => u) ?? [];

    if (entrants.length === 0) {
      await msg.reply({
        embeds: [baseEmbed(Theme.mute).setDescription("Kimse katılmadı.")],
      });
      return;
    }

    const selected: string[] = [];
    const pool = [...entrants];
    for (let i = 0; i < Math.min(g.winnersCount, pool.length); i++) {
      const idx = Math.floor(Math.random() * pool.length);
      selected.push(pool.splice(idx, 1)[0]!.toString());
    }

    await msg.reply({
      embeds: [
        baseEmbed(Theme.success)
          .setAuthor({ name: reroll ? "GIVEAWAY · REROLL" : "GIVEAWAY" })
          .setTitle("Sonuç")
          .setDescription(
            [line(), kv("Ödül", g.prize), kv("Kazananlar", selected.join(", ")), line()].join(
              "\n"
            )
          ),
      ],
    });
  } catch (err) {
    client.logger.error(err, "giveaway end");
  }
}

/** Restore timers after restart */
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
