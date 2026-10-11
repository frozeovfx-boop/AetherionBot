import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

/**
 * Simple JSON file persistence.
 * Works on any host (bot-hosting, Railway, VPS) without Postgres.
 * Swap to Postgres later without touching command code.
 */
export class JsonStore<T> {
  private filePath: string;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(filename: string) {
    this.filePath = join(process.cwd(), "data", filename);
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

  public save(data: T): void {
    // serialize writes so concurrent updates don't corrupt the file
    this.writeQueue = this.writeQueue.then(async () => {
      try {
        const dir = join(process.cwd(), "data");
        if (!existsSync(dir)) await mkdir(dir, { recursive: true });
        await writeFile(this.filePath, JSON.stringify(data, null, 0), "utf8");
      } catch (err) {
        console.error(`[JsonStore] failed to save ${this.filePath}:`, err);
      }
    });
  }
}
