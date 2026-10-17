import { Collection, type Client, type VoiceChannel } from "discord.js";
import { LavalinkNode, type LavalinkTrack } from "./LavalinkNode.js";
import { FILTERS, type FilterPreset } from "./filters.js";
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
  filter: FilterPreset;
}

/**
 * Queue + Lavalink search/playback bridge.
 * Playback uses `lavalink-client` when installed and node is online.
 */
export class MusicManager {
  public queues = new Collection<string, GuildQueue>();
  public node: LavalinkNode | null = null;
  public lavalinkReady = false;
  /** lavalink-client manager instance if loaded */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public lavalink: any = null;
  private client: Client | null = null;

  public async init(client?: Client): Promise<void> {
    if (client) this.client = client;

    const node = new LavalinkNode(
      config.LAVALINK_HOST,
      config.LAVALINK_PORT,
      config.LAVALINK_PASSWORD
    );
    this.node = node;
    const ok = await node.connect();
    this.lavalinkReady = ok;

    if (ok) {
      logger.info(`Lavalink REST ok → ${config.LAVALINK_HOST}:${config.LAVALINK_PORT}`);
      await this.initLavalinkClient();
    } else {
      logger.warn(
        `Lavalink offline (${config.LAVALINK_HOST}:${config.LAVALINK_PORT}) — queue/metadata only`
      );
      setInterval(() => void this.tryReconnect(), 60_000);
    }
  }

  private async initLavalinkClient(): Promise<void> {
    if (!this.client) return;
    try {
      const mod = await import("lavalink-client");
      const { LavalinkManager } = mod as {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        LavalinkManager: new (opts: any) => any;
      };

      this.lavalink = new LavalinkManager({
        nodes: [
          {
            authorization: config.LAVALINK_PASSWORD,
            host: config.LAVALINK_HOST,
            port: config.LAVALINK_PORT,
            id: "yuta-main",
          },
        ],
        sendToShard: (guildId: string, payload: unknown) => {
          const guild = this.client?.guilds.cache.get(guildId);
          if (guild) guild.shard.send(payload);
        },
        client: {
          id: this.client.user?.id ?? config.DISCORD_CLIENT_ID,
          username: this.client.user?.username ?? "Yuta",
        },
        autoMove: false,
        playerOptions: {
          clientBasedPositionUpdateInterval: 150,
          defaultSearchPlatform: "ytsearch",
          onDisconnect: {
            autoReconnect: true,
            destroyPlayer: false,
          },
          onEmptyQueue: {
            destroyAfterMs: 60_000,
          },
        },
      });

      this.lavalink.on("nodeConnect", (n: { id: string }) => {
        logger.info(`Lavalink player node connected: ${n.id}`);
        this.lavalinkReady = true;
      });
      this.lavalink.on("nodeError", (n: { id: string }, err: Error) => {
        logger.error(err, `Lavalink node error ${n.id}`);
      });
      this.lavalink.on("trackStart", (player: { guildId: string }, track: { info: { title: string } }) => {
        logger.info(`Playing in ${player.guildId}: ${track.info.title}`);
      });

      this.lavalink.on(
        "trackEnd",
        (player: { guildId: string }, _track: unknown, payload: { reason?: string }) => {
          const reason = payload?.reason ?? "";
          if (reason === "replaced" || reason === "stopped") return;
          void this.handleTrackEnd(player.guildId);
        }
      );

      // Wire voice state / raw packets after client ready
      this.lavalink.init({ ...this.client.user!, id: this.client.user!.id });

      this.client.on("raw", (d) => {
        void this.lavalink?.sendRawData(d);
      });

      logger.info("lavalink-client manager initialized");
    } catch (err) {
      logger.warn(
        { err },
        "lavalink-client not available — run npm install lavalink-client. REST search still works."
      );
      this.lavalink = null;
    }
  }

  public async tryReconnect(): Promise<void> {
    if (this.lavalinkReady || !this.node) return;
    const ok = await this.node.connect();
    this.lavalinkReady = ok;
    if (ok) {
      logger.info("Lavalink REST reconnected");
      await this.initLavalinkClient();
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
        filter: "off",
      };
      this.queues.set(guildId, queue);
    } else {
      queue.voiceChannelId = voiceChannelId;
      queue.textChannelId = textChannelId;
    }
    return queue;
  }

  public async resolve(
    query: string,
    requesterId: string,
    requesterTag: string
  ): Promise<Track[]> {
    if (this.lavalinkReady && this.node?.isReady()) {
      try {
        const identifier = query.startsWith("http") ? query : `ytsearch:${query}`;
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

  /**
   * Join voice + play current/queue head via lavalink-client if possible.
   */
  public async play(
    guildId: string,
    voiceChannel: VoiceChannel
  ): Promise<{ ok: boolean; reason?: string }> {
    const queue = this.queues.get(guildId);
    if (!queue?.current) return { ok: false, reason: "Kuyruk boş" };

    if (!this.lavalink) {
      return {
        ok: false,
        reason:
          "Oynatıcı yok. Host’ta `npm install` + çalışan Lavalink node gerekir (aşağıdaki checklist).",
      };
    }

    try {
      let player = this.lavalink.getPlayer(guildId);
      if (!player) {
        player = this.lavalink.createPlayer({
          guildId,
          voiceChannelId: voiceChannel.id,
          textChannelId: queue.textChannelId,
          selfDeaf: true,
          volume: queue.volume,
        });
        await player.connect();
      }

      const track = queue.current;
      if (track.encoded) {
        await player.play({
          track: { encoded: track.encoded, info: { title: track.title } },
          volume: queue.volume,
        });
      } else {
        const res = await player.search(
          { query: track.url.startsWith("http") ? track.url : track.title },
          track.requesterId
        );
        if (!res.tracks?.length) return { ok: false, reason: "Parça çözülemedi" };
        await player.play({ track: res.tracks[0], volume: queue.volume });
      }

      if (queue.filter !== "off") {
        await this.applyFilterToPlayer(guildId, queue.filter);
      }

      queue.playing = true;
      return { ok: true };
    } catch (err) {
      logger.error(err, "music play");
      return {
        ok: false,
        reason: err instanceof Error ? err.message : "Oynatma hatası",
      };
    }
  }

  public async applyFilterToPlayer(guildId: string, preset: FilterPreset): Promise<void> {
    const player = this.lavalink?.getPlayer(guildId);
    if (!player) return;
    const payload = FILTERS[preset].payload;
    try {
      if (preset === "off") {
        await player.filterManager?.resetFilters?.();
        await player.setFilters?.({});
      } else {
        await player.setFilters?.(payload);
        // fallback API shapes across library versions
        if (player.filterManager?.setFilters) {
          await player.filterManager.setFilters(payload);
        }
      }
    } catch (err) {
      logger.error(err, "apply filter");
    }
  }

  public setFilter(guildId: string, preset: FilterPreset): FilterPreset | null {
    const queue = this.queues.get(guildId);
    if (!queue) return null;
    queue.filter = preset;
    void this.applyFilterToPlayer(guildId, preset);
    void this.node?.applyFilters?.(guildId, FILTERS[preset].payload);
    return preset;
  }

  public async skip(guildId: string): Promise<Track | null> {
    const queue = this.queues.get(guildId);
    if (!queue) return null;
    const skipped = queue.current;
    queue.current = queue.tracks.shift() ?? null;
    queue.playing = !!queue.current;

    const player = this.lavalink?.getPlayer(guildId);
    if (player) {
      if (queue.current) {
        const ch = this.client?.channels.cache.get(queue.voiceChannelId);
        if (ch && ch.isVoiceBased()) {
          await this.play(guildId, ch as VoiceChannel);
        }
      } else {
        await player.stopTrack?.();
        await player.stop?.();
      }
    }
    return skipped;
  }

  public async stop(guildId: string): Promise<void> {
    const queue = this.queues.get(guildId);
    if (!queue) return;
    queue.tracks = [];
    queue.current = null;
    queue.playing = false;
    const player = this.lavalink?.getPlayer(guildId);
    if (player) {
      try {
        await player.destroy();
      } catch {
        /* */
      }
    }
  }

  public async pause(guildId: string): Promise<boolean> {
    const queue = this.queues.get(guildId);
    if (!queue?.current) return false;
    queue.playing = false;
    const player = this.lavalink?.getPlayer(guildId);
    try {
      await player?.pause?.(true);
      await player?.setPaused?.(true);
    } catch {
      /* */
    }
    return true;
  }

  public async resume(guildId: string): Promise<boolean> {
    const queue = this.queues.get(guildId);
    if (!queue?.current) return false;
    queue.playing = true;
    const player = this.lavalink?.getPlayer(guildId);
    try {
      await player?.pause?.(false);
      await player?.setPaused?.(false);
    } catch {
      /* */
    }
    return true;
  }

  public async setVolume(guildId: string, volume: number): Promise<void> {
    const queue = this.queues.get(guildId);
    if (!queue) return;
    queue.volume = Math.max(1, Math.min(200, volume));
    const player = this.lavalink?.getPlayer(guildId);
    if (player?.setVolume) await player.setVolume(queue.volume);
  }

  public destroy(guildId: string): void {
    void this.stop(guildId);
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
