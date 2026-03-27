import OpenAI from "openai";

export type AiProvider = "venice" | "novelai";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const venice = new OpenAI({
  baseURL: "https://api.venice.ai/api/v1",
  apiKey: process.env["VENICE_API_KEY"] ?? "",
});

export const VENICE_PARAMS = {
  venice_parameters: {
    include_venice_system_prompt: false,
  },
  frequency_penalty: 0.42,
  presence_penalty: 0.32,
};

export function getProvider(body: unknown): AiProvider {
  const b = body as Record<string, unknown>;
  return b?.provider === "novelai" ? "novelai" : "venice";
}

export function resolveTokens(base: number, body: unknown): number {
  const b = body as Record<string, unknown>;
  const sl = b?.storyLength as string | undefined;
  if (sl === "short") return Math.round(base * 0.6);
  if (sl === "long")  return Math.min(Math.round(base * 1.5), 2200);
  return base;
}

export function trimHistory(text: string, maxChars = 5500): string {
  if (!text || text.length <= maxChars) return text;
  const trimmed = text.slice(-maxChars);
  const paraBreak = trimmed.indexOf("\n\n");
  return paraBreak > 0 && paraBreak < 300
    ? `[...earlier chapters omitted...]\n\n${trimmed.slice(paraBreak + 2)}`
    : `[...earlier chapters omitted...]\n\n${trimmed}`;
}

export async function streamChat({
  provider = "venice",
  messages,
  maxTokens,
  onChunk,
  temperature = 1.0,
}: {
  provider?: AiProvider;
  messages: ChatMessage[];
  maxTokens: number;
  onChunk: (text: string) => void;
  temperature?: number;
}): Promise<void> {
  if (provider === "novelai") {
    await streamNovelAI(messages, maxTokens, onChunk, temperature);
  } else {
    await streamVenice(messages, maxTokens, onChunk, temperature);
  }
}

export async function completeChat({
  provider = "venice",
  messages,
  maxTokens,
  temperature = 1.0,
}: {
  provider?: AiProvider;
  messages: ChatMessage[];
  maxTokens: number;
  temperature?: number;
}): Promise<string> {
  if (provider === "novelai") {
    return completeNovelAI(messages, maxTokens, temperature);
  }
  return completeVenice(messages, maxTokens, temperature);
}

async function streamVenice(
  messages: ChatMessage[],
  maxTokens: number,
  onChunk: (t: string) => void,
  temperature: number
): Promise<void> {
  const stream = await venice.chat.completions.create({
    model: "venice-uncensored-role-play",
    max_tokens: maxTokens,
    temperature,
    messages,
    stream: true,
    ...VENICE_PARAMS,
  } as Parameters<typeof venice.chat.completions.create>[0]);

  for await (const chunk of stream) {
    const content = (
      chunk as { choices: Array<{ delta: { content?: string } }> }
    ).choices[0]?.delta?.content;
    if (content) onChunk(content);
  }
}

async function completeVenice(
  messages: ChatMessage[],
  maxTokens: number,
  temperature: number
): Promise<string> {
  const completion = await venice.chat.completions.create({
    model: "venice-uncensored-role-play",
    max_tokens: maxTokens,
    temperature,
    messages,
    ...VENICE_PARAMS,
  } as Parameters<typeof venice.chat.completions.create>[0]);
  return completion.choices[0]?.message?.content?.trim() ?? "";
}

function buildNovelAIInput(messages: ChatMessage[]): string {
  const system = messages.find((m) => m.role === "system")?.content ?? "";
  const rest = messages.filter((m) => m.role !== "system");

  let input = system.trimEnd();
  for (const msg of rest) {
    if (msg.role === "user") {
      input += `\n\n### Request:\n${msg.content}`;
    } else {
      input += `\n\n### Response:\n${msg.content}`;
    }
  }
  input += "\n\n### Response:\n";
  return input;
}

async function streamNovelAI(
  messages: ChatMessage[],
  maxTokens: number,
  onChunk: (t: string) => void,
  temperature: number
): Promise<void> {
  const input = buildNovelAIInput(messages);
  const res = await fetch("https://api.novelai.net/ai/generate-stream", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env["NOVELAI_API_KEY"] ?? ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input,
      model: "kayra-v1",
      parameters: {
        use_string: true,
        response_length: Math.min(maxTokens, 2048),
        min_length: 1,
        temperature,
        top_k: 0,
        top_p: 0.95,
        repetition_penalty: 1.15,
        repetition_penalty_range: 2048,
        repetition_penalty_slope: 0,
        repetition_penalty_frequency: 0,
        repetition_penalty_presence: 0,
      },
    }),
  });

  if (!res.ok || !res.body) {
    const err = await res.text().catch(() => "");
    throw new Error(`NovelAI ${res.status}: ${err.slice(0, 200)}`);
  }

  const reader = (res.body as ReadableStream<Uint8Array>).getReader();
  const dec = new TextDecoder();
  let buf = "";
  let eventType = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });

    const lines = buf.split("\n");
    buf = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("event:")) {
        eventType = trimmed.slice(6).trim();
      } else if (trimmed.startsWith("data:") && eventType === "completion") {
        try {
          const data = JSON.parse(trimmed.slice(5).trim()) as {
            token?: string;
          };
          if (data.token) onChunk(data.token);
        } catch {
          // skip malformed
        }
        eventType = "";
      }
    }
  }
}

async function completeNovelAI(
  messages: ChatMessage[],
  maxTokens: number,
  temperature: number
): Promise<string> {
  const input = buildNovelAIInput(messages);
  const res = await fetch("https://api.novelai.net/ai/generate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env["NOVELAI_API_KEY"] ?? ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input,
      model: "kayra-v1",
      parameters: {
        use_string: true,
        response_length: Math.min(maxTokens, 2048),
        min_length: 1,
        temperature,
        top_k: 0,
        top_p: 0.95,
        repetition_penalty: 1.15,
        repetition_penalty_range: 2048,
        repetition_penalty_slope: 0,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`NovelAI ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as { output?: string };
  return data.output?.trim() ?? "";
}
