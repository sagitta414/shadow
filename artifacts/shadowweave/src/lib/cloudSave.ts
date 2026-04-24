const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const API = `${BASE}/api`;

const CLOUD_KEYS = [
  "sw_archive_v1",
  "sw_streak_v1",
  "sw_achievements_v2",
  "sw_mode_completions_v1",
  "sw_mode_mastery_v1",
  "sw_bounty_v1",
  "sw_custom_villains_v1",
  "sw_favorites_v1",
];

export interface CloudSaveResult {
  ok: boolean;
  savedAt?: string;
  error?: string;
}

export interface CloudLoadResult {
  data: Record<string, unknown> | null;
  savedAt?: string;
  error?: string;
}

export async function pushToCloud(): Promise<CloudSaveResult> {
  const payload: Record<string, unknown> = {};
  for (const key of CLOUD_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) payload[key] = JSON.parse(raw);
    } catch {
      payload[key] = null;
    }
  }
  const resp = await fetch(`${API}/cloud-save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: payload }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Network error" }));
    return { ok: false, error: err.error ?? "Save failed" };
  }
  const result = await resp.json();
  return { ok: true, savedAt: result.savedAt };
}

export async function pullFromCloud(): Promise<CloudLoadResult> {
  const resp = await fetch(`${API}/cloud-save`);
  if (!resp.ok) {
    return { data: null, error: "Failed to reach server" };
  }
  const result = await resp.json();
  return { data: result.data ?? null, savedAt: result.savedAt };
}

export function applyCloudData(data: Record<string, unknown>): void {
  for (const key of CLOUD_KEYS) {
    if (key in data && data[key] !== null && data[key] !== undefined) {
      localStorage.setItem(key, JSON.stringify(data[key]));
    }
  }
}
