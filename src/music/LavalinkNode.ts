import { EventEmitter } from "node:events";

export interface LavalinkTrackInfo {
  identifier: string;
  isSeekable: boolean;
  author: string;
  length: number;
  isStream: boolean;
  position: number;
  title: string;
  uri?: string;
  artworkUrl?: string | null;
  sourceName?: string;
}

export interface LavalinkTrack {
  encoded: string;
  info: LavalinkTrackInfo;
}

export interface LoadResult {
  loadType: string;
  data?: {
    info?: { name?: string };
    tracks?: LavalinkTrack[];
  } | LavalinkTrack | LavalinkTrack[];
}

/**
 * Minimal Lavalink v4 REST client.
 * Full voice playback requires a running Lavalink process + session.
 */
export class LavalinkNode extends EventEmitter {
  public connected = false;
  private baseUrl: string;
  private password: string;
  private sessionId: string | null = null;

  constructor(
    host: string,
    port: number,
    password: string,
    private readonly secure = false
  ) {
    super();
    const protocol = secure ? "https" : "http";
    this.baseUrl = `${protocol}://${host}:${port}`;
    this.password = password;
  }

  public async connect(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/v4/info`, {
        headers: { Authorization: this.password },
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        this.connected = false;
        return false;
      }
      this.connected = true;
      this.emit("ready");
      return true;
    } catch {
      this.connected = false;
      return false;
    }
  }

  public async loadTracks(identifier: string): Promise<LavalinkTrack[]> {
    if (!this.connected) return [];
    const url = `${this.baseUrl}/v4/loadtracks?identifier=${encodeURIComponent(identifier)}`;
    const res = await fetch(url, {
      headers: { Authorization: this.password },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const body = (await res.json()) as LoadResult;
    return this.extractTracks(body);
  }

  private extractTracks(body: LoadResult): LavalinkTrack[] {
    if (body.loadType === "track" && body.data && !Array.isArray(body.data) && "encoded" in body.data) {
      return [body.data as LavalinkTrack];
    }
    if (body.loadType === "search" || body.loadType === "playlist") {
      const data = body.data as { tracks?: LavalinkTrack[] };
      return data?.tracks ?? [];
    }
    return [];
  }

  public isReady(): boolean {
    return this.connected;
  }
}
