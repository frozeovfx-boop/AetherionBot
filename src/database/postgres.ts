import pg from "pg";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";

let pool: pg.Pool | null = null;

export function isPostgresEnabled(): boolean {
  return Boolean(config.DATABASE_URL);
}

export async function initPostgres(): Promise<boolean> {
  if (!config.DATABASE_URL) {
    logger.info("Postgres: off (JSON store)");
    return false;
  }
  try {
    pool = new pg.Pool({
      connectionString: config.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30_000,
    });
    await pool.query("SELECT 1");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS yuta_kv (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    logger.info("Postgres: connected · yuta_kv ready");
    return true;
  } catch (err) {
    logger.error(err, "Postgres init failed — falling back to JSON");
    pool = null;
    return false;
  }
}

export async function pgGet<T>(key: string): Promise<T | null> {
  if (!pool) return null;
  try {
    const res = await pool.query("SELECT value FROM yuta_kv WHERE key = $1", [key]);
    if (!res.rows[0]) return null;
    return res.rows[0].value as T;
  } catch {
    return null;
  }
}

export async function pgSet(key: string, value: unknown): Promise<void> {
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO yuta_kv (key, value, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [key, JSON.stringify(value)]
    );
  } catch (err) {
    logger.error(err, `pgSet ${key}`);
  }
}

export async function closePostgres(): Promise<void> {
  if (pool) {
    await pool.end().catch(() => null);
    pool = null;
  }
}
