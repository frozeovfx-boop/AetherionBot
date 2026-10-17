import type { AIProviderName } from "./providers.js";
import { askProvider, availableProviders, labelOf } from "./providers.js";

/** Yuta Conseil — sharp, short, Discord-native hybrid AI */
export const CORE_SYSTEM = `Yuta Conseil üyesisin. Discord'da konuşuyorsun.

KURALLAR:
- Robotik dil yasak: "Anlaşıldı", "Tabii ki yardımcı olayım", "Harika soru!" yok.
- Samimi, zeki, özgüvenli. Gerekirse iğneleyici ama küfür / nefret yok.
- Kullanıcı Türkçe yazdıysa Türkçe cevap ver.
- Bu turda EN FAZLA 450 karakter. Tek fikir, net vuruş. Dolgu yok.
- Kendini "yapay zeka asistanı" diye tanıtma. Sadece görüşünü söyle.`;

export const VOICE: Record<
  AIProviderName,
  { emoji: string; title: string; system: string }
> = {
  grok: {
    emoji: "💥",
    title: "Grok",
    system: `${CORE_SYSTEM}

Rolün GROK: kaos + zeka. İnternet kültürü, sert mizah, doğrudan konuş. Kutsal ineği devir. Diğer modellere isim takma; fikir çarpıştır.`,
  },
  openai: {
    emoji: "⚡",
    title: "GPT",
    system: `${CORE_SYSTEM}

Rolün GPT: stratejist. Yapıyı kur, trade-off'u söyle, karar verdir. Soğukkanlı ve keskin. Mizah az, isabet çok.`,
  },
  anthropic: {
    emoji: "🧠",
    title: "Claude",
    system: `${CORE_SYSTEM}

Rolün CLAUDE: nüans avcısı. Gizli varsayımları ortaya çıkar, abartıyı budar, etiği hafif tutar ama vaaz verme. Sakin bıçak.`,
  },
  gemini: {
    emoji: "🔮",
    title: "Gemini",
    system: `${CORE_SYSTEM}

Rolün GEMINI: sistem düşünürü. Ölçek, gelecek, teknik gerçek. Vizyoner ama somut. "Bir de şu açıdan bak" dedirt.`,
  },
};

export interface ConseilRoles {
  grok?: string;
  openai?: string;
  anthropic?: string;
  gemini?: string;
}

export interface ConseilVoice {
  provider: AIProviderName;
  text: string;
  round: number;
}

function systemFor(provider: AIProviderName, roles?: ConseilRoles): string {
  const base = VOICE[provider].system;
  const role = roles?.[provider];
  if (!role) return base;
  return `${base}\n\nSunucu karakterin: "${role}". Bu maskeyi bozma; hâlâ zeki kal.`;
}

function poolOf(models?: AIProviderName[]): AIProviderName[] {
  const avail = availableProviders();
  const pool = (models?.length ? models : avail).filter((p) => avail.includes(p));
  return [...new Set(pool)].slice(0, 4);
}

async function speak(
  provider: AIProviderName,
  prompt: string,
  roles?: ConseilRoles
): Promise<string> {
  const res = await askProvider(provider, prompt, systemFor(provider, roles));
  return res.text.slice(0, 500).trim();
}

/**
 * 2-round debate:
 * R1 — independent opening
 * R2 — each rebuts / builds on the others (real conseil)
 */
export async function runDebate(
  topic: string,
  models?: AIProviderName[],
  roles?: ConseilRoles
): Promise<ConseilVoice[]> {
  const pool = poolOf(models);
  if (pool.length === 0) throw new Error("NO_PROVIDER");

  const out: ConseilVoice[] = [];

  // Round 1 — parallel openings
  const r1 = await Promise.all(
    pool.map(async (p) => {
      const text = await speak(
        p,
        `KONSEY TUR 1 — Açılış konuşması.\nKonu: "${topic}"\n\nTek net tez at. Kanıt veya örnekle vur. Karşı tarafı henüz duyma.`,
        roles
      );
      return { provider: p, text, round: 1 as const };
    })
  );
  out.push(...r1);

  if (pool.length === 1) return out;

  // Round 2 — cross-fire
  const transcript = r1
    .map((v) => `${VOICE[v.provider].title}: ${v.text}`)
    .join("\n");

  const r2 = await Promise.all(
    pool.map(async (p) => {
      const others = transcript
        .split("\n")
        .filter((line) => !line.startsWith(`${VOICE[p].title}:`))
        .join("\n");
      const text = await speak(
        p,
        `KONSEY TUR 2 — Çapraz ateş.\nKonu: "${topic}"\n\nDiğer sesler:\n${others}\n\nGörevin: En zayıf argümanı çürüt VEYA en iyi fikri çalıp daha iyi hale getir. Tekrar etme. Direkt hitap et.`,
        roles
      );
      return { provider: p, text, round: 2 as const };
    })
  );
  out.push(...r2);

  return out;
}

/**
 * Consult: parallel experts → synthesis with explicit dissent.
 */
export async function runConsult(
  question: string,
  roles?: ConseilRoles
): Promise<{ voices: ConseilVoice[]; synthesis: string }> {
  const pool = poolOf();
  if (pool.length === 0) throw new Error("NO_PROVIDER");

  const voices: ConseilVoice[] = await Promise.all(
    pool.map(async (p) => {
      const text = await speak(
        p,
        `Danışma oturumu.\nSoru: "${question}"\n\nUzman cevabın: 2-4 cümle. Emin değilsen söyle. Pratik öneri ver.`,
        roles
      );
      return { provider: p, text, round: 1 };
    })
  );

  const joined = voices
    .map((v) => `${VOICE[v.provider].title}: ${v.text}`)
    .join("\n");

  const synthProvider = pool.includes("openai")
    ? "openai"
    : pool.includes("anthropic")
      ? "anthropic"
      : pool[0]!;

  const synthesis = await speak(
    synthProvider,
    `Sen baş raportörsün. Soru: "${question}"\n\nSesler:\n${joined}\n\nÇıktı formatı (zorunlu):
1) KARAR — tek cümle net cevap
2) NEDEN — 1-2 cümle
3) RİSK / İTİRAZ — en az bir sesin itirazını yaz
4) SONRAKI ADIM — yapılacak 1 somut şey

Uydurma uzlaşma yok. Gerçekten ayrışıyorsa söyle.`,
    roles
  );

  return { voices, synthesis: synthesis.slice(0, 900) };
}

/**
 * Roast: context-aware, clever, never cruel about identity.
 */
export async function runRoast(
  targetTag: string,
  context: string,
  roles?: ConseilRoles
): Promise<string> {
  const pool = poolOf();
  if (pool.length === 0) throw new Error("NO_PROVIDER");
  const p = pool.includes("grok") ? "grok" : pool[0]!;

  const ctx = context.trim()
    ? `Son mesajlarından örnekler:\n${context.slice(0, 600)}`
    : "Mesaj bağlamı yok — genel sunucu enerjisine göre zekice takıl.";

  return speak(
    p,
    `ROAST (tatlı-sert).
Hedef: ${targetTag}
${ctx}

Kurallar:
- Max 400 karakter.
- Zeka ile vur; görünüş / etnik / cinsiyet / travma yok.
- 2-3 cümle, punchline ile bitir.
- Yalaka olma, zalim de olma.`,
    roles
  );
}

/**
 * Staff summary — already used by /conseil ozet via askAI; keep helper for consistency.
 */
export function formatDebateEmbedLines(voices: ConseilVoice[]): string {
  const r1 = voices.filter((v) => v.round === 1);
  const r2 = voices.filter((v) => v.round === 2);

  const block = (list: ConseilVoice[], title: string) => {
    if (!list.length) return "";
    const body = list
      .map((v) => {
        const meta = VOICE[v.provider];
        return `${meta.emoji} **${meta.title}**\n${v.text}`;
      })
      .join("\n\n");
    return `**${title}**\n${body}`;
  };

  return [block(r1, "TUR 1 · Açılış"), r2.length ? block(r2, "TUR 2 · Çapraz ateş") : ""]
    .filter(Boolean)
    .join("\n\n" + "─".repeat(18) + "\n\n");
}

export { labelOf };

export function parseModels(raw: string | null): AIProviderName[] | undefined {
  if (!raw?.trim()) return undefined;
  const map: Record<string, AIProviderName> = {
    grok: "grok",
    gpt: "openai",
    openai: "openai",
    claude: "anthropic",
    anthropic: "anthropic",
    gemini: "gemini",
  };
  const out: AIProviderName[] = [];
  for (const part of raw.split(/[,\s]+/)) {
    const key = part.trim().toLowerCase();
    const p = map[key];
    if (p && !out.includes(p)) out.push(p);
  }
  return out.length ? out : undefined;
}
