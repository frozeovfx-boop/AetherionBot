import type { YutaClient } from "../client/YutaClient.js";
import { Theme, baseEmbed, line, kv, code } from "./embeds.js";

/** Daily free caps — premium lifts these */
export const FREE_LIMITS = {
  ask: 15,
  conseil_debate: 3,
  conseil_consult: 5,
  conseil_roast: 5,
  conseil_ozet: 3,
  filter: 10,
} as const;

export type PremiumFeature = keyof typeof FREE_LIMITS;

const LABELS: Record<PremiumFeature, string> = {
  ask: "AI · /ask",
  conseil_debate: "Conseil · debate",
  conseil_consult: "Conseil · consult",
  conseil_roast: "Conseil · roast",
  conseil_ozet: "Conseil · ozet",
  filter: "Müzik · filter",
};

export function isGuildPremium(client: YutaClient, guildId: string | null | undefined): boolean {
  if (!guildId) return false;
  return client.settings.isPremium(guildId);
}

export function assertPremiumFeature(
  client: YutaClient,
  guildId: string | null | undefined,
  feature: PremiumFeature
): { ok: true; remaining: number | null } | { ok: false; embed: ReturnType<typeof baseEmbed> } {
  const limit = FREE_LIMITS[feature];
  const bucket = guildId ?? "dm";

  if (guildId && client.settings.isPremium(guildId)) {
    return { ok: true, remaining: null };
  }

  const used = client.usage.get(bucket, feature);
  if (used >= limit) {
    return {
      ok: false,
      embed: baseEmbed(Theme.warning)
        .setAuthor({ name: "PREMIUM" })
        .setTitle("Günlük limit doldu")
        .setDescription(
          [
            line(),
            kv("Özellik", LABELS[feature]),
            kv("Kullanım", code(`${used}/${limit}`)),
            line(),
            "Premium sunucuda limit kalkar · `/premium`",
            line(),
          ].join("\n")
        ),
    };
  }

  client.usage.inc(bucket, feature);
  return { ok: true, remaining: limit - used - 1 };
}

export function premiumStatusDescription(client: YutaClient, guildId: string): string {
  const prem = client.settings.isPremium(guildId);
  const until = client.settings.get(guildId).premiumUntil;
  const lines = [
    line(),
    prem
      ? kv("Durum", `**Premium** · <t:${Math.floor(until / 1000)}:R>`)
      : kv("Durum", code("Ücretsiz")),
    line(),
    "**Bugün (ücretsiz limit)**",
  ];
  for (const f of Object.keys(FREE_LIMITS) as PremiumFeature[]) {
    const used = client.usage.get(guildId, f);
    const lim = FREE_LIMITS[f];
    lines.push(kv(LABELS[f], prem ? code("∞") : code(`${used}/${lim}`)));
  }
  lines.push(line());
  lines.push("Özel: Conseil debate/consult, AI, filtre limitleri.");
  lines.push("Satın alma: sunucu sahibi ile / destek.");
  lines.push(line());
  return lines.join("\n");
}
