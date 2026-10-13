import { Events, VoiceState, Collection } from "discord.js";
import { Event } from "../structures/Event.js";
import type { AetherionClient } from "../client/AetherionClient.js";

/** guildId:userId -> join timestamp */
const voiceJoined = new Collection<string, number>();

const XP_PER_MINUTE = 5;
const COIN_PER_MINUTE = 2;
const MIN_MS = 60_000; // at least 1 min to earn

export default class VoiceStateUpdateEvent extends Event<typeof Events.VoiceStateUpdate> {
  constructor() {
    super(Events.VoiceStateUpdate);
  }

  public async execute(
    client: AetherionClient,
    oldState: VoiceState,
    newState: VoiceState
  ): Promise<void> {
    const member = newState.member ?? oldState.member;
    if (!member || member.user.bot) return;
    if (!newState.guild) return;

    const key = `${newState.guild.id}:${member.id}`;
    const joinedChannel = !oldState.channelId && newState.channelId;
    const leftChannel = oldState.channelId && !newState.channelId;
    const switched =
      oldState.channelId &&
      newState.channelId &&
      oldState.channelId !== newState.channelId;

    if (joinedChannel) {
      voiceJoined.set(key, Date.now());
      return;
    }

    if (leftChannel || switched) {
      const start = voiceJoined.get(key);
      voiceJoined.delete(key);

      if (switched) {
        voiceJoined.set(key, Date.now());
      }

      if (!start) return;
      const elapsed = Date.now() - start;
      if (elapsed < MIN_MS) return;

      const minutes = Math.floor(elapsed / 60_000);
      if (minutes < 1) return;

      const xp = minutes * XP_PER_MINUTE;
      const coins = minutes * COIN_PER_MINUTE;

      const { leveledUp, profile } = client.economy.addXp(
        newState.guild.id,
        member.id,
        xp
      );
      client.economy.addWallet(newState.guild.id, member.id, coins);

      if (leveledUp) {
        try {
          const ch =
            newState.guild.systemChannel ??
            newState.channel ??
            oldState.channel;
          if (ch && ch.isTextBased()) {
            const { Theme, baseEmbed, line, kv } = await import("../utils/embeds.js");
            await ch.send({
              embeds: [
                baseEmbed(Theme.economy)
                  .setAuthor({ name: "LEVEL UP" })
                  .setDescription(
                    [
                      line(),
                      `✦ **${member.user.username}** ses ile yükseldi!`,
                      kv("Seviye", `**${profile.level}**`),
                      line(),
                    ].join("\n")
                  ),
              ],
            });
          }
        } catch {
          /* ignore */
        }
      }
    }
  }
}
