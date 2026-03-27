import OpenAI from "openai";

export type AiProvider = "venice";

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
  frequency_penalty: 0.15,
  presence_penalty: 0.10,
};

export function getProvider(_body: unknown): AiProvider {
  return "venice";
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
  messages,
  maxTokens,
  onChunk,
  temperature = 0.78,
}: {
  provider?: AiProvider;
  messages: ChatMessage[];
  maxTokens: number;
  onChunk: (text: string) => void;
  temperature?: number;
}): Promise<void> {
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

export async function completeChat({
  messages,
  maxTokens,
  temperature = 0.78,
}: {
  provider?: AiProvider;
  messages: ChatMessage[];
  maxTokens: number;
  temperature?: number;
}): Promise<string> {
  const completion = await venice.chat.completions.create({
    model: "venice-uncensored-role-play",
    max_tokens: maxTokens,
    temperature,
    messages,
    ...VENICE_PARAMS,
  } as Parameters<typeof venice.chat.completions.create>[0]);
  return completion.choices[0]?.message?.content?.trim() ?? "";
}
