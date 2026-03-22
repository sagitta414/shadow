const KEY = "sw_mode_presets_v1";

export interface ModePreset {
  intensity?: 1 | 2 | 3;
  storyLength?: string;
}

export function getPreset(mode: string): ModePreset {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return d[mode] ?? {};
  } catch {
    return {};
  }
}

export function savePreset(mode: string, preset: Partial<ModePreset>): void {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    d[mode] = { ...d[mode], ...preset };
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {}
}
