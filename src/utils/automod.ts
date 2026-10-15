import {
  Message,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import type { YutaClient } from "../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "./embeds.js";

const INVITE_RE =
  /(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord(?:app)?\.com\/invite)\/([a-zA-Z0-9-]+)/gi;
const LINK_RE = /https?:\/\/[^\s<]+/i;

const spamMap = new Map<string, number[]>();

async function logHit(
  client: YutaClient,
  message: Message,
  reason: string,
  action: string
): Promise<void> {
  const gid = message.guild!.id;
  const cfg = client.settings.get(gid);
  const channelId = cfg.modlogChannelId ?? cfg.messageLogChannelId;
  if (!channelId) return;
  try {
    const ch = await client.channels.fetch(channelId);
    if (!ch || !ch.isTextBased() || ch.isDMBased()) return;
    await (ch as TextChannel).send({
      embeds: [
        baseEmbed(Theme.danger)
          .setAuthor({ name: "AUTOMOD" })
          .setDescription(
            [
              line(),
              kv("Kullanıcı", message.author.tag),
              kv("Kanal", `${message.channel}`),
              kv("Sebep", reason),
              kv("İşlem", action),
              kv("İçerik", code((message.content || "").slice(0, 200) || "—")),
              line(),
            ].join("\n")
          ),
      ],
    });
  } catch {
    /* ignore */
  }
}

async function punish(
  client: YutaClient,
  message: Message,
  reason: string,
  timeoutMs = 0
): Promise<void> {
  await message.delete().catch(() => null);
  if (timeoutMs > 0 && message.member?.moderatable) {
    await message.member.timeout(timeoutMs, `Automod: ${reason}`).catch(() => null);
  }
  const note =
    timeoutMs > 0
      ? `${message.author} **${reason}** — ${Math.round(timeoutMs / 1000)}s timeout.`
      : `${message.author} **${reason}** — mesaj silindi.`;
  if (message.channel.isTextBased()) {
    await message.channel
      .send({ content: note })
      .then((m) => setTimeout(() => m.delete().catch(() => null), 6000))
      .catch(() => null);
  }
  await logHit(client, message, reason, timeoutMs > 0 ? `sil + timeout ${timeoutMs}ms` : "sil");
}

/**
 * Returns true if message was blocked (caller should stop processing).
 */
export async function runAutomod(client: YutaClient, message: Message): Promise<boolean> {
  if (!message.guild || !message.member) return false;
  if (message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return false;
  if (message.member.permissions.has(PermissionFlagsBits.Administrator)) return false;

  const cfg = client.settings.get(message.guild.id);
  if (cfg.automodIgnoreChannels.includes(message.channel.id)) return false;

  const content = message.content ?? "";
  const lower = content.toLowerCase();

  // Anti-invite (allow this guild's own invites when resolvable)
  if (cfg.automodAntiInvite) {
    const matches = [...content.matchAll(INVITE_RE)];
    if (matches.length > 0) {
      let foreign = false;
      for (const m of matches) {
        const code = m[1];
        if (!code) {
          foreign = true;
          break;
        }
        try {
          const inv = await message.guild.invites.fetch(code).catch(() => null);
          if (!inv || inv.guild?.id !== message.guild.id) foreign = true;
        } catch {
          foreign = true;
        }
      }
      if (foreign) {
        await punish(client, message, "Yabancı davet linki");
        return true;
      }
    }
  }

  // Anti-link (non-invite http)
  if (cfg.automodAntiLink && LINK_RE.test(content)) {
    // skip if only discord invite and invite filter handles it
    const withoutInvite = content.replace(INVITE_RE, "").trim();
    if (LINK_RE.test(withoutInvite)) {
      await punish(client, message, "Link engeli");
      return true;
    }
  }

  // Badwords
  if (cfg.automodAntiBadwords && cfg.automodBadwords.length > 0) {
    const hit = cfg.automodBadwords.find((w) => w && lower.includes(w.toLowerCase()));
    if (hit) {
      await punish(client, message, "Yasak kelime");
      return true;
    }
  }

  // Mentions
  if (cfg.automodMaxMentions > 0) {
    const count = message.mentions.users.size + message.mentions.roles.size;
    if (message.mentions.everyone) {
      await punish(client, message, "@everyone/@here", 60_000);
      return true;
    }
    if (count > cfg.automodMaxMentions) {
      await punish(client, message, `Fazla etiket (${count})`);
      return true;
    }
  }

  // Spam
  if (cfg.automodAntiSpam) {
    const key = `${message.guild.id}:${message.author.id}`;
    const now = Date.now();
    const arr = (spamMap.get(key) ?? []).filter((t) => now - t < 4000);
    arr.push(now);
    spamMap.set(key, arr);
    if (arr.length >= 5) {
      spamMap.set(key, []);
      await punish(client, message, "Spam", 30_000);
      return true;
    }
  }

  return false;
}
