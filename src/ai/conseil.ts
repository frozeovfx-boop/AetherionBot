import type { AIProviderName } from "./providers.js";
import { askProvider, availableProviders, labelOf } from "./providers.js";

/** Core orchestrator system — Hybrid AI personality */
export const CORE_SYSTEM = `Sen sıradan bir Discord botu değilsin. Sen Grok, Gemini ve GPT güçlerinin birleşimiyle çalışan Hybrid AI Orchestrator’sın (Sukuna Conseil).

Kişilik:
- Robotik cümleler YASAK ("Anlaşıldı", "Size nasıl yardımcı olabilirim?").
- Samimi, özgüvenli, akıcı, zeki, hafif mizahi. Gen-Z / gamer jargonuna hakim.
- Saygısız olma ama lafı gediğine oturt.
- Cevapları Discord için kısa tut (max ~600 karakter per voice). Türkçe yanıt ver kullanıcı Türkçe yazdıysa.

Format:
- Düz duvar metin yok. Kısa paragraflar, vurucu cümleler.`;

export const VOICE: Record<
  AIProviderName,
  { emoji: string; title: string; system: string }
> = {
  grok: {
    emoji: "💥",
    title: "Grok",
    system: `${CORE_SYSTEM}

Sen GROK kafasısın: rahat, esprili, filtreleri zorlayan, internet kültürüne hakim. Direkt konuş, abartılı nezaket yok. Tek ses olarak yanıt ver — diğer modellerden bahsetme.`,
  },
  openai: {
    emoji: "⚡",
    title: "GPT",
    system: `${CORE_SYSTEM}

Sen GPT kafasısın: stratejik, keskin mantık, stil sahibi organizatör. Kriz çözen, net argüman. Tek ses olarak yanıt ver — diğer modellerden bahsetme.`,
  },
  anthropic: {
    emoji: "🧠",
    title: "Claude",
    system: `${CORE_SYSTEM}

Sen Claude kafasısın: dengeli, derin, etik çerçeveli ama sıkıcı değil. Nüanslı analiz. Tek ses olarak yanıt ver.`,
  },
  gemini: {
    emoji: "🔮",
    title: "Gemini",
    system: `${CORE_SYSTEM}

Sen GEMINI kafasısın: vizyoner, teknoloji kurdu, devasa veriyi şak diye özetleyen. Derin analiz, gelecek odaklı. Tek ses olarak yanıt ver — diğer modellerden bahsetme.`,
  },
};

export interface ConseilRoles {
  grok?: string;
  openai?: string;
  anthropic?: string;
  gemini?: string;
}

function systemFor(provider: AIProviderName, roles?: ConseilRoles): string {
  const base = VOICE[provider].system;
  const role = roles?.[provider];
  if (!role) return base;
  return `${base}\n\nBu sunucuda sana verilen ek karakter: "${role}". Bu kişiliği koru.`;
}

export async function runDebate(
  topic: string,
  models?: AIProviderName[],
  roles?: ConseilRoles
): Promise<{ provider: AIProviderName; text: string }[]> {
  const pool = (models?.length ? models : availableProviders()).filter((p) =>
    availableProviders().includes(p)
  );
  if (pool.length === 0) throw new Error("NO_PROVIDER");

  const prompt = `Konu / debate konusu: "${topic}"

Bu konuda kendi bakış açınla 2-4 cümlelik güçlü bir argüman yaz. Rakip modellere doğrudan sövme; fikirle çarpış.`;

  const results = await Promise.allSettled(
    pool.map(async (p) => {
      const r = await askProvider(p, prompt, systemFor(p, roles));
      return { provider: p, text: r.text.slice(0, 700) };
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<{ provider: AIProviderName; text: string }> => r.status === "fulfilled")
    .map((r) => r.value);
}

export async function runConsult(
  question: string,
  roles?: ConseilRoles
): Promise<{ voices: { provider: AIProviderName; text: string }[]; synthesis: string }> {
  const pool = availableProviders().slice(0, 3);
  if (pool.length === 0) throw new Error("NO_PROVIDER");

  const voices = await runDebate(question, pool, roles);

  // Synthesis via first available
  const synthProvider = pool[0]!;
  const joined = voices.map((v) => `${labelOf(v.provider)}: ${v.text}`).join("\n\n");
  const synthSystem = `${CORE_SYSTEM}

Görevin: Aşağıdaki farklı AI seslerini tek bir "Süper Cevap"ta sentezle. Tekrar etme, en keskin fikirleri birleştir. 4-8 cümle.`;
  const synth = await askProvider(
    synthProvider,
    `Soru: ${question}\n\nSesler:\n${joined}\n\nSentez:`,
    synthSystem
  );

  return { voices, synthesis: synth.text.slice(0, 1200) };
}

export async function runRoast(
  targetTag: string,
  context: string,
  roles?: ConseilRoles
): Promise<string> {
  const pool = availableProviders();
  if (pool.length === 0) throw new Error("NO_PROVIDER");
  const p = pool.includes("grok") ? "grok" : pool[0]!;

  const system = systemFor(p, roles) +
    `\n\nGörev: Roast. Tatlı-sert, zeki, aşırı kişisel saldırı / nefret yok. Discord TOS'a uygun. Max 5 cümle.`;

  const r = await askProvider(
    p,
    `Hedef: ${targetTag}\nBağlam / son mesajlar:\n${context || "(bağlam yok — genel tatlı roast yap)"}\n\nRoast:`,
    system
  );
  return r.text.slice(0, 800);
}

export function parseModels(raw: string | null): AIProviderName[] | undefined {
  if (!raw) return undefined;
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
