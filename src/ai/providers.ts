import { config } from "../config/index.js";

export type AIProviderName = "grok" | "openai" | "anthropic" | "gemini";

export interface AIResult {
  text: string;
  provider: AIProviderName;
}

const DEFAULT_SYSTEM =
  "You are Yuta, a concise and helpful Discord assistant. Answer clearly in the user's language. Keep answers under 1500 characters unless asked for detail.";

/**
 * Multi-provider AI. No SDK deps — plain fetch.
 */
export async function askAI(
  prompt: string,
  system: string = DEFAULT_SYSTEM
): Promise<AIResult> {
  if (config.GROK_API_KEY) return askGrok(prompt, system);
  if (config.OPENAI_API_KEY) return askOpenAI(prompt, system);
  if (config.ANTHROPIC_API_KEY) return askAnthropic(prompt, system);
  if (config.GOOGLE_API_KEY) return askGemini(prompt, system);
  throw new Error("NO_PROVIDER");
}

/** Call a specific provider by name (skips if key missing) */
export async function askProvider(
  provider: AIProviderName,
  prompt: string,
  system: string
): Promise<AIResult> {
  switch (provider) {
    case "grok":
      if (!config.GROK_API_KEY) throw new Error("GROK_API_KEY yok");
      return askGrok(prompt, system);
    case "openai":
      if (!config.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY yok");
      return askOpenAI(prompt, system);
    case "anthropic":
      if (!config.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY yok");
      return askAnthropic(prompt, system);
    case "gemini":
      if (!config.GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY yok");
      return askGemini(prompt, system);
  }
}

export function availableProviders(): AIProviderName[] {
  const list: AIProviderName[] = [];
  if (config.GROK_API_KEY) list.push("grok");
  if (config.OPENAI_API_KEY) list.push("openai");
  if (config.ANTHROPIC_API_KEY) list.push("anthropic");
  if (config.GOOGLE_API_KEY) list.push("gemini");
  return list;
}

export function hasAnyProvider(): boolean {
  return availableProviders().length > 0;
}

export function activeProviderLabel(): string {
  const a = availableProviders();
  if (!a.length) return "Yok";
  return a.map((p) => labelOf(p)).join(" · ");
}

export function labelOf(p: AIProviderName): string {
  const map: Record<AIProviderName, string> = {
    grok: "Grok",
    openai: "GPT",
    anthropic: "Claude",
    gemini: "Gemini",
  };
  return map[p];
}

async function askGrok(prompt: string, system: string): Promise<AIResult> {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "grok-2-latest",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      max_tokens: 900,
      temperature: 0.85,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Grok ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Grok empty");
  return { text, provider: "grok" };
}

async function askOpenAI(prompt: string, system: string): Promise<AIResult> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      max_tokens: 900,
      temperature: 0.8,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenAI ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenAI empty");
  return { text, provider: "openai" };
}

async function askAnthropic(prompt: string, system: string): Promise<AIResult> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-latest",
      max_tokens: 900,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Anthropic ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text = data.content?.find((c) => c.type === "text")?.text?.trim();
  if (!text) throw new Error("Anthropic empty");
  return { text, provider: "anthropic" };
}

async function askGemini(prompt: string, system: string): Promise<AIResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.GOOGLE_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${system}\n\nUser: ${prompt}` }] }],
      generationConfig: { maxOutputTokens: 900, temperature: 0.85 },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error("Gemini empty");
  return { text, provider: "gemini" };
}
