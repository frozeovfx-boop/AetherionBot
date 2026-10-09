import {
  Collection,
  Guild,
  VoiceChannel,
  StageChannel,
  ChatInputCommandInteraction,
} from "discord.js";
import type { AetherionClient } from "../client/AetherionClient.js";

export interface Track {
  title: string;
  url: string;
  duration: number;
  requesterId: string;
  requesterTag: string;
}

export interface GuildQueue {
  guildId: string;
  voiceChannelId: string;
  textChannelId: string;
  tracks: Track[];
  current: Track | null;
  playing: boolean;
  volume: number;
  loop: "off" | "track" | "queue";
}

/**
 * Music queue manager.
 * Lavalink connection will plug in here — interface stays the same.
 */
export class MusicManager {
  public queues = new Collection<string, GuildQueue>();

  public getQueue(guildId: string): GuildQueue | undefined {
    return this.queues.get(guildId);
  }

  public ensureQueue(
    guildId: string,
    voiceChannelId: string,
    textChannelId: string
  ): GuildQueue {
    let queue = this.queues.get(guildId);
    if (!queue) {
      queue = {
        guildId,
        voiceChannelId,
        textChannelId,
        tracks: [],
        current: null,
        playing: false,
        volume: 100,
        loop: "off",
      };
      this.queues.set(guildId, queue);
    }
    return queue;
  }

  public addTrack(guildId: string, track: Track): number {
    const queue = this.queues.get(guildId);
    if (!queue) return 0;
    queue.tracks.push(track);
    return queue.tracks.length;
  }

  public skip(guildId: string): Track | null {
    const queue = this.queues.get(guildId);
    if (!queue) return null;
    const skipped = queue.current;
    queue.current = queue.tracks.shift() ?? null;
    queue.playing = !!queue.current;
    return skipped;
  }

  public stop(guildId: string): void {
    const queue = this.queues.get(guildId);
    if (!queue) return;
    queue.tracks = [];
    queue.current = null;
    queue.playing = false;
  }

  public destroy(guildId: string): void {
    this.stop(guildId);
    this.queues.delete(guildId);
  }
}
