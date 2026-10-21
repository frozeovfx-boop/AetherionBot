import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Command } from "../structures/Command.js";

const MAX_COMMANDS = 100;

const NAME_BOOST: Record<string, number> = {
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
  setprefix: 440,
  ban: 430,
  kick: 425,
  timeout: 420,
  warn: 415,
  case: 410,
  cases: 405,
  clear: 395,
  purge: 390,
  lock: 385,
  unlock: 380,
  help: 360,
  premium: 355,
  ask: 350,
  conseil: 345,
  play: 320,
  skip: 315,
  stop: 310,
  queue: 305,
  nowplaying: 300,
  musicstatus: 295,
  balance: 200,
  work: 195,
  daily: 190,
  level: 185,
  serverinfo: 180,
  userinfo: 175,
  ping: 170,
  botinfo: 165,
};

const CATEGORY_BASE: Record<string, number> = {
  moderation: 100,
  server: 80,
  ai: 70,
  utility: 60,
  music: 50,
  economy: 40,
  admin: 20,
};

/** No slash — clutter / filler. Prefix may still work. */
export const SLASH_BLOCK = new Set([
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
  "status",
  "setlanguage",
  "davet",
  "snipe",
  "stat",
  "serverstats",
  "channelinfo",
  "roleinfo",
  "tempban",
  "modstats",
  "slowmode",
  "mute",
  "aistatus",
]);

function priorityOf(name: string, category: string): number {
  if (SLASH_BLOCK.has(name)) return -1;
  return (CATEGORY_BASE[category] ?? 10) + (NAME_BOOST[name] ?? 0);
}

export type SlashPick = { name: string; category: string; data: object; priority: number };

export async function collectSlashCommands(): Promise<{
  selected: SlashPick[];
  blocked: number;
  cut: string[];
}> {
  const loaded: SlashPick[] = [];
  let blocked = 0;
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
        const mod = await import(pathToFileURL(join(categoryPath, file)).href);
        const raw = mod.default ?? mod.command;
        if (!raw) continue;
        const command: Command = typeof raw === "function" ? new raw() : raw;
        if (!command?.data) continue;
        const priority = priorityOf(command.name, command.category);
        if (priority < 0) {
          blocked++;
          continue;
        }
        loaded.push({
          name: command.name,
          category: command.category,
          data: command.data as object,
          priority,
        });
      } catch {
        /* skip broken command files silently */
      }
    }
  }

  loaded.sort((a, b) => b.priority - a.priority || a.name.localeCompare(b.name));
  const selected = loaded.slice(0, MAX_COMMANDS);
  const cut = loaded.slice(MAX_COMMANDS).map((c) => c.name);
  return { selected, blocked, cut };
}
