import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

/**
 * Atomic, debounced JSON file store.
 * - Debounce batches rapid writes
 * - Atomic rename avoids half-written files on crash
 */
export class JsonStore<T> {
  private filePath: string;
  private tmpPath: string;
  private writeTimer: ReturnType<typeof setTimeout> | null = null;
  private pending: T | null = null;
  private flushPromise: Promise<void> = Promise.resolve();
  private readonly debounceMs: number;

  constructor(filename: string, debounceMs = 400) {
    this.filePath = join(process.cwd(), "data", filename);
    this.tmpPath = `${this.filePath}.tmp`;
    this.debounceMs = debounceMs;
  }

  public async load(fallback: T): Promise<T> {
    try {
      if (!existsSync(this.filePath)) return fallback;
      const raw = await readFile(this.filePath, "utf8");
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  /** Schedule a save (debounced). Safe to call on every mutation. */
  public save(data: T): void {
    this.pending = data;
    if (this.writeTimer) clearTimeout(this.writeTimer);
    this.writeTimer = setTimeout(() => {
      this.writeTimer = null;
      void this.flush();
    }, this.debounceMs);
  }

  /** Force immediate write of latest pending data */
  public async flush(): Promise<void> {
    if (this.pending === null) return;
    const data = this.pending;
    this.pending = null;
    this.flushPromise = this.flushPromise.then(async () => {
      try {
        const dir = join(process.cwd(), "data");
        if (!existsSync(dir)) await mkdir(dir, { recursive: true });
        const json = JSON.stringify(data);
        await writeFile(this.tmpPath, json, "utf8");
        await rename(this.tmpPath, this.filePath);
      } catch (err) {
        console.error(`[JsonStore] save failed ${this.filePath}:`, err);
      }
    });
    await this.flushPromise;
  }
}
