const KEY = "sw_voice_profiles_v1";

export interface VoiceProfile {
  heroineName: string;
  defiant: string;
  scared: string;
  breaking: string;
  broken: string;
  quirks: string;
  updatedAt: string;
}

export function getVoiceProfiles(): Record<string, VoiceProfile> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === "object" && !Array.isArray(parsed)) ? parsed : {};
  } catch { return {}; }
}

export function getVoiceProfile(name: string): VoiceProfile | null {
  return getVoiceProfiles()[name] ?? null;
}

export function saveVoiceProfile(p: VoiceProfile): void {
  const all = getVoiceProfiles();
  all[p.heroineName] = { ...p, updatedAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteVoiceProfile(name: string): void {
  const all = getVoiceProfiles();
  delete all[name];
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function buildVoiceInstruction(name: string): string {
  const profile = getVoiceProfile(name);
  if (!profile) return "";
  const parts: string[] = [];
  if (profile.defiant) parts.push(`Defiant voice: ${profile.defiant}`);
  if (profile.scared) parts.push(`Scared/vulnerable voice: ${profile.scared}`);
  if (profile.breaking) parts.push(`Breaking voice: ${profile.breaking}`);
  if (profile.broken) parts.push(`Fully conditioned voice: ${profile.broken}`);
  if (profile.quirks) parts.push(`Speech quirks & patterns: ${profile.quirks}`);
  if (parts.length === 0) return "";
  return `\n\nESTABLISHED VOICE PROFILE — ${name}:\n${parts.join("\n")}\nUse this profile to write her dialogue and internal monologue consistently with prior stories.`;
}

export const VOICE_PRESETS: Record<string, Partial<VoiceProfile>> = {
  "Black Canary": {
    defiant: "Short, cutting. Every sentence lands like a jab. No wasted words. 'You'll need more than this.'",
    scared: "Still controlled but the cracks show — longer pauses, one-word answers, swallowed syllables.",
    breaking: "Angry at herself for anything she gives away. Speaks in fragments. Stops mid-sentence.",
    broken: "Answers immediately and completely. No edge. Hollow precision.",
    quirks: "Calls villains by rank, not name. Never begs. Sometimes goes completely silent instead of answering.",
  },
  "Supergirl": {
    defiant: "Earnest and absolute. 'I will stop you.' Believes every word she says. Doesn't understand why he's smiling.",
    scared: "Voice rises slightly. More words than necessary. Over-explains. Keeps trying to reason.",
    breaking: "The optimism collapses. She stops finishing sentences. Long silences where hope used to be.",
    broken: "Agreeable, soft, eager to please. The confidence that defined her is simply... absent.",
    quirks: "Refers to people she loves by name mid-monologue. Has a tell — blinks hard when lying.",
  },
  "Wonder Woman": {
    defiant: "Formal, regal, completely unintimidated. 'You are beneath what I came here to face.'",
    scared: "Fear reads as fury — she gets louder, not quieter. Her pride won't let her show the real thing.",
    breaking: "The regal posture drops. She stops referring to Themyscira. Speaks like a mortal.",
    broken: "Quiet obedience with traces of the queen still visible — until they're not.",
    quirks: "Refers to abstract ideals as if they're people. Never apologizes. Calls every villain 'fool' once.",
  },
};
