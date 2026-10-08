import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_GUILD_ID: z.string().optional(),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  OWNER_IDS: z.string().default(""),
  PREFIX: z.string().default("!"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  GROK_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  LAVALINK_HOST: z.string().default("localhost"),
  LAVALINK_PORT: z.coerce.number().default(2333),
  LAVALINK_PASSWORD: z.string().default("youshallnotpass"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = {
  ...parsed.data,
  ownerIds: parsed.data.OWNER_IDS.split(",").map((id) => id.trim()).filter(Boolean),
  isDev: parsed.data.NODE_ENV === "development",
} as const;

export type Config = typeof config;
