import { REST, Routes } from "discord.js";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { config } from "./config/index.js";
import { logger } from "./utils/logger.js";
import type { Command } from "./structures/Command.js";

/** Discord max: 100 chat-input commands per guild / global scope */
const MAX_COMMANDS = 100;

/**
 * Per-command boost (added to category base).
 * Setup + core moderation must win the 100 slot race.
 */
const NAME_BOOST: Record<string, number> = {
  // Setup / server spine
  "ticket-setup": 500,
  automod: 490,
  logset: 485,
  selfrole: 480,
  setwelcome: 475,
  setmodlog: 470,
  ayarlar: 465,
  ozeloda: 460,
  giveaway: 455,
  autorole: 450,
  setprefix: 445,
  setlanguage: 440,
  // Core mod
  ban: 430,
  kick: 425,
  timeout: 420,
  warn: 415,
  case: 410,
  cases: 405,
  tempban: 400,
  clear: 395,
  purge: 390,
  lock: 385,
  unlock: 380,
  slowmode: 375,
  modstats: 370,
  // Product surface
  help: 360,
  premium: 355,
  ask: 350,
  conseil: 345,
  aistatus: 340,
  // Music essentials
  play: 320,
  skip: 315,
  stop: 310,
  queue: 305,
  nowplaying: 300,
  musicstatus: 295,
  // Economy light presence
  balance: 200,
  work: 195,
  daily: 190,
  level: 185,
};

/** Category baseline when name has no boost */
const CATEGORY_BASE: Record<string, number> = {
  moderation: 100,
  server: 80,
  utility: 60,
  ai: 70,
  economy: 40,
  music: 50,
  admin: 30,
};

/**
 * Never deploy as slash (prefix still works if handler allows).
 * Filler / low-value — free slots for real setup.
 */
const SLASH_BLOCK = new Set([
  "confession",
  "suggestion",
  "capsule",
  "starboard",
  "sticky",
  "tag",
  "announce",
  "translate",
  "weather",
  "qr",
  "shorturl",
  "steal",
  "calc",
  "github",
  "remind",
  "afk",
  "seen",
  "say",
  "sans",
  "poll",
  "embed",
  "emoji",
  "roles",
  "banner",
  "avatar",
  "gamble",
  "slots",
  "shop",
  "buy",
  "inventory",
  "deposit",
  "withdraw",
  "pay",
  "weekly",
  "leaderboard",
  "filter",
  "shuffle",
  "loop",
  "volume",
  "pause",
  "resume",
  "remove",
  "clearqueue",
  "hackban",
  "massban",
  "nuke",
  "deafen",
  "move",
  "voicemute",
  "nickname",
  "report",
  "reason",
  "softban",
  "unban",
  "unmute",
  "untimeout",
  "unlockdown",
  "lockdown",
  "clearwarns",
  "banlist",
  "addrole",
  "removerole",
  "eval",
  "reload",
]);

function priorityOf(name: string, category: string): number {
  if (SLASH_BLOCK.has(name)) return -1000;
  const boost = NAME_BOOST[name] ?? 0;
  const base = CATEGORY_BASE[category] ?? 10;
  return base + boost;
}

async function deploy() {
  const loaded: { name: string; category: string; data: object; priority: number }[] = [];
  const commandsPath = join(process.cwd(), "src", "commands");
  const categories = await readdir(commandsPath);

  for (const category of categories) {
    const categoryPath = join(commandsPath, category);
    let files: string[];
    try {
      files = await readdir(categoryPath);
    } catch {
      continue;
    }

    for (const file of files) {
      if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;

      try {
        const filePath = join(categoryPath, file);
        const commandModule = await import(pathToFileURL(filePath).href);
        const raw = commandModule.default ?? commandModule.command;
        if (!raw) continue;

        const command: Command =
          typeof raw === "function" ? new (raw as new () => Command)() : raw;

        if (!command?.data) continue;

        const priority = priorityOf(command.name, command.category);
        if (priority < 0) {
          logger.info(`Slash skip (blocked): ${command.name}`);
          continue;
        }

        loaded.push({
          name: command.name,
          category: command.category,
          data: command.data as object,
          priority,
        });
      } catch (err) {
        logger.warn({ err, file }, "Skipping command file during deploy");
      }
    }
  }

  loaded.sort((a, b) => b.priority - a.priority || a.name.localeCompare(b.name));

  const selected = loaded.slice(0, MAX_COMMANDS);
  const skipped = loaded.length - selected.length;
  const body = selected.map((c) => c.data);

  logger.info(
    `Slash order (top 25): ${selected
      .slice(0, 25)
      .map((c) => c.name)
      .join(", ")}`
  );

  if (skipped > 0) {
    logger.warn(
      `Discord limit ${MAX_COMMANDS}. Deploying ${selected.length}, cut ${skipped}: ${loaded
        .slice(MAX_COMMANDS)
        .map((c) => c.name)
        .join(", ")}`
    );
  }

  const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

  try {
    logger.info(`Started refreshing ${body.length} application (/) commands.`);

    if (config.DISCORD_GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, config.DISCORD_GUILD_ID),
        { body }
      );
      logger.info(`Successfully reloaded ${body.length} guild commands.`);
    } else {
      await rest.put(Routes.applicationCommands(config.DISCORD_CLIENT_ID), { body });
      logger.info(`Successfully reloaded ${body.length} global commands.`);
    }
  } catch (error) {
    logger.error(error, "Failed to deploy commands");
    process.exit(1);
  }
}

deploy();
