import { config } from "../config/index.js";

export type AIProviderName = "grok" | "openai" | "anthropic" | "gemini";

export interface AIResult {
  text: string;
  provider: AIProviderName;
}

const SYSTEM =
  "You are Aetherion, a concise and helpful Discord assistant. Answer clearly in the user's language. Keep answers under 1500 characters unless asked for detail.";

/**
 * Multi-provider AI. First available key wins.
 * No SDK deps — plain fetch for host simplicity.
 */
export async function askAI(prompt: string): Promise<AIResult> {
  if (config.GROK_API_KEY) {
    return askGrok(prompt);
  }
  if (config.OPENAI_API_KEY) {
    return askOpenAI(prompt);
  }
  if (config.ANTHROPIC_API_KEY) {
    return askAnthropic(prompt);
  }
  if (config.GOOGLE_API_KEY) {
    return askGemini(prompt);
  }
  throw new Error("NO_PROVIDER");
}

export function hasAnyProvider(): boolean {
  return !!(
    config.GROK_API_KEY ||
    config.OPENAI_API_KEY ||
    config.ANTHROPIC_API_KEY ||
    config.GOOGLE_API_KEY
  );
}

export function activeProviderLabel(): string {
  if (config.GROK_API_KEY) return "Grok";
  if (config.OPENAI_API_KEY) return "OpenAI";
  if (config.ANTHROPIC_API_KEY) return "Claude";
  if (config.GOOGLE_API_KEY) return "Gemini";
  return "Yok";
}

async function askGrok(prompt: string): Promise<AIResult> {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "grok-2-latest",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.7,
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
  if (!text) throw new Error("Grok empty response");
  return { text, provider: "grok" };
}

async function askOpenAI(prompt: string): Promise<AIResult> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.7,
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
  if (!text) throw new Error("OpenAI empty response");
  return { text, provider: "openai" };
}

async function askAnthropic(prompt: string): Promise<AIResult> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-latest",
      max_tokens: 800,
      system: SYSTEM,
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
  if (!text) throw new Error("Anthropic empty response");
  return { text, provider: "anthropic" };
}

async function askGemini(prompt: string): Promise<AIResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.GOOGLE_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: `${SYSTEM}\n\nUser: ${prompt}` }],
        },
      ],
      generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
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
  if (!text) throw new Error("Gemini empty response");
  return { text, provider: "gemini" };
}
