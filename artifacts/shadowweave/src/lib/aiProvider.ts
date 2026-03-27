const KEY = "sw_ai_provider_v1";

export type AiProvider = "venice" | "novelai";

export function getAiProvider(): AiProvider {
  try {
    const v = localStorage.getItem(KEY);
    return v === "novelai" ? "novelai" : "venice";
  } catch {
    return "venice";
  }
}

export function setAiProvider(p: AiProvider): void {
  try {
    localStorage.setItem(KEY, p);
  } catch {
    // ignore
  }
}

export function toggleAiProvider(): AiProvider {
  const next = getAiProvider() === "venice" ? "novelai" : "venice";
  setAiProvider(next);
  return next;
}
