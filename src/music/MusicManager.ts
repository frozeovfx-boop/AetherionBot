import { Collection } from "discord.js";
import { LavalinkNode, type LavalinkTrack } from "./LavalinkNode.js";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";

export interface Track {
  title: string;
  url: string;
  duration: number;
  requesterId: string;
  requesterTag: string;
  encoded?: string;
  author?: string;
  artworkUrl?: string | null;
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
 * Queue manager + optional Lavalink search.
 * When Lavalink is online: real metadata from YouTube/etc.
 * When offline: queue still works (no audio — needs Lavalink process).
 */
export class MusicManager {
  public queues = new Collection<string, GuildQueue>();
  public node: LavalinkNode | null = null;
  public lavalinkReady = false;

  public async init(): Promise<void> {
    const node = new LavalinkNode(
      config.LAVALINK_HOST,
      config.LAVALINK_PORT,
      config.LAVALINK_PASSWORD
    );
    this.node = node;
    const ok = await node.connect();
    this.lavalinkReady = ok;
    if (ok) {
      logger.info(`Lavalink connected → ${config.LAVALINK_HOST}:${config.LAVALINK_PORT}`);
    } else {
      logger.warn(
        `Lavalink offline (${config.LAVALINK_HOST}:${config.LAVALINK_PORT}) — queue mode only`
      );
    }
  }

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

  /** Resolve query via Lavalink or fallback title-only track */
  public async resolve(
    query: string,
    requesterId: string,
    requesterTag: string
  ): Promise<Track[]> {
    if (this.lavalinkReady && this.node) {
      const identifier = query.startsWith("http") ? query : `ytsearch:${query}`;
      try {
        const loaded = await this.node.loadTracks(identifier);
        if (loaded.length > 0) {
          return loaded.slice(0, 1).map((t) => this.mapTrack(t, requesterId, requesterTag));
        }
      } catch (err) {
        logger.error(err, "Lavalink loadTracks failed");
      }
    }

    return [
      {
        title: query.length > 80 ? query.slice(0, 77) + "..." : query,
        url: query.startsWith("http") ? query : `search:${query}`,
        duration: 0,
        requesterId,
        requesterTag,
      },
    ];
  }

  private mapTrack(t: LavalinkTrack, requesterId: string, requesterTag: string): Track {
    return {
      title: t.info.title,
      url: t.info.uri ?? t.info.identifier,
      duration: t.info.length,
      requesterId,
      requesterTag,
      encoded: t.encoded,
      author: t.info.author,
      artworkUrl: t.info.artworkUrl,
    };
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

  public formatDuration(ms: number): string {
    if (!ms || ms <= 0) return "—";
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const h = Math.floor(m / 60);
    if (h) return `${h}:${String(m % 60).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${m}:${String(sec).padStart(2, "0")}`;
  }
}
