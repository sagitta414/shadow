const DIGNITY_KEY = "sw_dignity_v1";
const OBEDIENCE_KEY = "sw_obedience_v1";
const RENAME_KEY = "sw_renames_v1";

export interface DignityRecord {
  heroineName: string;
  level: number;
  history: Array<{ delta: number; reason: string; date: string }>;
}

export interface ObedienceRecord {
  heroineName: string;
  captorName: string;
  rung: number;
  unlockedAt: string[];
}

export interface RenameRecord {
  heroineName: string;
  captorName: string;
  designation: string;
  assignedAt: string;
}

function getDignityStore(): Record<string, DignityRecord> {
  try {
    const raw = localStorage.getItem(DIGNITY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === "object" && !Array.isArray(parsed)) ? parsed : {};
  } catch { return {}; }
}

function saveDignityStore(store: Record<string, DignityRecord>) {
  localStorage.setItem(DIGNITY_KEY, JSON.stringify(store));
}

export function getDignity(heroine: string): DignityRecord {
  const store = getDignityStore();
  return store[heroine] ?? { heroineName: heroine, level: 100, history: [] };
}

export function adjustDignity(heroine: string, delta: number, reason: string): DignityRecord {
  const store = getDignityStore();
  const rec = store[heroine] ?? { heroineName: heroine, level: 100, history: [] };
  const newLevel = Math.max(0, Math.min(100, rec.level + delta));
  const updated: DignityRecord = {
    ...rec,
    level: newLevel,
    history: [...rec.history, { delta, reason, date: new Date().toISOString() }].slice(-50),
  };
  store[heroine] = updated;
  saveDignityStore(store);
  return updated;
}

export function getDignityLabel(level: number): string {
  if (level >= 90) return "Fully Defiant";
  if (level >= 70) return "Resistant";
  if (level >= 50) return "Wavering";
  if (level >= 30) return "Compromised";
  if (level >= 10) return "Broken";
  return "Fully Conditioned";
}

export function getDignityColor(level: number): string {
  if (level >= 70) return "#22C55E";
  if (level >= 40) return "#EAB308";
  if (level >= 15) return "#F97316";
  return "#EF4444";
}

function getObedienceStore(): ObedienceRecord[] {
  try {
    const raw = localStorage.getItem(OBEDIENCE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export function getObedience(heroine: string, captor: string): ObedienceRecord {
  const store = getObedienceStore();
  return store.find(r => r.heroineName === heroine && r.captorName === captor)
    ?? { heroineName: heroine, captorName: captor, rung: 0, unlockedAt: [] };
}

export function advanceObedience(heroine: string, captor: string): ObedienceRecord {
  const store = getObedienceStore();
  const idx = store.findIndex(r => r.heroineName === heroine && r.captorName === captor);
  const rec = idx >= 0 ? store[idx] : { heroineName: heroine, captorName: captor, rung: 0, unlockedAt: [] };
  const updated: ObedienceRecord = {
    ...rec,
    rung: Math.min(10, rec.rung + 1),
    unlockedAt: [...rec.unlockedAt, new Date().toISOString()],
  };
  if (idx >= 0) store[idx] = updated; else store.push(updated);
  localStorage.setItem(OBEDIENCE_KEY, JSON.stringify(store));
  return updated;
}

export const OBEDIENCE_RUNGS = [
  "Baseline — unbowed, untested",
  "First Acknowledgment — she answers a direct question",
  "Physical Compliance — kneels when commanded",
  "Name Response — answers to the designation given",
  "Controlled Silence — stops speaking without permission",
  "Directed Movement — follows movement instructions without resistance",
  "Voluntary Confession — discloses something she chose to protect",
  "Public Compliance — performs obedience before an audience",
  "Active Participation — initiates conditioned behavior without prompt",
  "Internalized Identity — the designation has replaced the name in her own mind",
  "Complete — no coercion required. She is exactly what was designed.",
];

function getRenameStore(): RenameRecord[] {
  try {
    const raw = localStorage.getItem(RENAME_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export function getRename(heroine: string, captor: string): RenameRecord | null {
  return getRenameStore().find(r => r.heroineName === heroine && r.captorName === captor) ?? null;
}

export function setRename(heroine: string, captor: string, designation: string): void {
  const store = getRenameStore().filter(r => !(r.heroineName === heroine && r.captorName === captor));
  store.push({ heroineName: heroine, captorName: captor, designation, assignedAt: new Date().toISOString() });
  localStorage.setItem(RENAME_KEY, JSON.stringify(store));
}

export function getAllRenames(heroine: string): RenameRecord[] {
  return getRenameStore().filter(r => r.heroineName === heroine);
}

export function buildDegradationInstruction(heroine: string, captor: string): string {
  const dignity = getDignity(heroine);
  const obedience = getObedience(heroine, captor);
  const rename = getRename(heroine, captor);
  const parts: string[] = [];
  parts.push(`Current dignity level: ${dignity.level}/100 (${getDignityLabel(dignity.level)})`);
  parts.push(`Obedience rung with this captor: ${obedience.rung}/10 — ${OBEDIENCE_RUNGS[obedience.rung]}`);
  if (rename) parts.push(`She is designated "${rename.designation}" by this captor — use only this name in dialogue and narration from the captor's POV.`);
  return `\n\nCONDITIONING STATE:\n${parts.join("\n")}\nWrite consistently with this established state. Do not skip ahead or regress without narrative justification.`;
}
