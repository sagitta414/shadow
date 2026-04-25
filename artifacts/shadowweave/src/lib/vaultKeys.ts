// VAULT KEYS — Earned via milestones, spent to bypass locked modes early.

import { getArchive } from "./archive";

const KEYS_KEY = "sw_vault_keys_v1";
const SPENT_KEY = "sw_vault_keys_spent_v1";
const UNLOCKS_KEY = "sw_vault_keys_unlocks_v1";

export type KeyKind = "bronze" | "silver" | "gold" | "obsidian";

export interface VaultKeyState {
  bronze: number;
  silver: number;
  gold: number;
  obsidian: number;
}

export interface KeyMilestone {
  id: string;
  kind: KeyKind;
  label: string;
  description: string;
  achieved: (metrics: Metrics) => boolean;
}

interface Metrics {
  stories: number;
  words: number;
  uniqueModes: number;
  uniqueHeroines: number;
  uniqueVillains: number;
  longestStory: number;
}

function metrics(): Metrics {
  const a = getArchive();
  const heroines = new Set<string>();
  const villains = new Set<string>();
  const modes = new Set<string>();
  let words = 0, longest = 0;
  for (const s of a) {
    words += s.wordCount ?? 0;
    if ((s.wordCount ?? 0) > longest) longest = s.wordCount ?? 0;
    modes.add(s.tool);
    for (const c of s.characters ?? []) {
      if (c.startsWith("V:")) villains.add(c);
      else heroines.add(c);
    }
  }
  return { stories: a.length, words, uniqueModes: modes.size, uniqueHeroines: heroines.size, uniqueVillains: villains.size, longestStory: longest };
}

export const KEY_MILESTONES: KeyMilestone[] = [
  { id: "first-blood",    kind: "bronze",   label: "First Blood",       description: "Complete your first story",           achieved: m => m.stories >= 1 },
  { id: "third-night",    kind: "bronze",   label: "Third Night",       description: "Complete 3 stories",                  achieved: m => m.stories >= 3 },
  { id: "lone-author",    kind: "bronze",   label: "Lone Author",       description: "Cross 5,000 total words written",     achieved: m => m.words >= 5000 },
  { id: "broad-canvas",   kind: "silver",   label: "Broad Canvas",      description: "Use 5 different story modes",         achieved: m => m.uniqueModes >= 5 },
  { id: "harem-keeper",   kind: "silver",   label: "Harem Keeper",      description: "Capture 8 unique heroines",           achieved: m => m.uniqueHeroines >= 8 },
  { id: "many-hands",     kind: "silver",   label: "Many Hands",        description: "Use 6 unique villains",               achieved: m => m.uniqueVillains >= 6 },
  { id: "dedicated",      kind: "silver",   label: "Dedicated",         description: "Cross 25,000 total words",            achieved: m => m.words >= 25000 },
  { id: "saga-weaver",    kind: "gold",     label: "Saga Weaver",       description: "Write a single 10,000-word story",    achieved: m => m.longestStory >= 10000 },
  { id: "deep-archive",   kind: "gold",     label: "Deep Archive",      description: "Complete 25 stories",                 achieved: m => m.stories >= 25 },
  { id: "anthology",      kind: "gold",     label: "Anthology",         description: "Use 10 different story modes",        achieved: m => m.uniqueModes >= 10 },
  { id: "grand-collector",kind: "obsidian", label: "Grand Collector",   description: "Capture 20 unique heroines",          achieved: m => m.uniqueHeroines >= 20 },
  { id: "monolith",       kind: "obsidian", label: "Monolith",          description: "Cross 100,000 total words",           achieved: m => m.words >= 100000 },
  { id: "century",        kind: "obsidian", label: "Century",           description: "Complete 100 stories",                achieved: m => m.stories >= 100 },
];

export const KEY_VALUE: Record<KeyKind, number> = { bronze: 1, silver: 2, gold: 3, obsidian: 5 };

export function getEarnedMilestones(): KeyMilestone[] {
  const m = metrics();
  return KEY_MILESTONES.filter(k => k.achieved(m));
}

export function getKeyState(): VaultKeyState {
  const earned = getEarnedMilestones();
  const totals = { bronze: 0, silver: 0, gold: 0, obsidian: 0 };
  for (const k of earned) totals[k.kind] += 1;
  let spent: VaultKeyState = { bronze: 0, silver: 0, gold: 0, obsidian: 0 };
  try { spent = { ...spent, ...JSON.parse(localStorage.getItem(SPENT_KEY) || "{}") }; } catch {}
  return {
    bronze:   Math.max(0, totals.bronze   - spent.bronze),
    silver:   Math.max(0, totals.silver   - spent.silver),
    gold:     Math.max(0, totals.gold     - spent.gold),
    obsidian: Math.max(0, totals.obsidian - spent.obsidian),
  };
}

export function getTotalUnspentValue(): number {
  const k = getKeyState();
  return k.bronze * KEY_VALUE.bronze + k.silver * KEY_VALUE.silver + k.gold * KEY_VALUE.gold + k.obsidian * KEY_VALUE.obsidian;
}

export function isVaultUnlocked(modeTitle: string): boolean {
  try {
    const map = JSON.parse(localStorage.getItem(UNLOCKS_KEY) || "{}");
    return !!map[modeTitle];
  } catch { return false; }
}

export interface SpendResult { ok: boolean; error?: string; }

export function spendKeysToUnlock(modeTitle: string, cost: number): SpendResult {
  const state = getKeyState();
  let need = cost;
  // Spend cheapest first
  const order: KeyKind[] = ["bronze", "silver", "gold", "obsidian"];
  const usable = { ...state };
  const spent: VaultKeyState = { bronze: 0, silver: 0, gold: 0, obsidian: 0 };
  for (const k of order) {
    while (need > 0 && usable[k] > 0) {
      const v = KEY_VALUE[k];
      if (v > need && k !== "obsidian") break; // don't overspend with low-tier; try higher tier
      need -= v;
      usable[k]--;
      spent[k]++;
    }
  }
  if (need > 0) return { ok: false, error: `Not enough keys — need ${cost} value, have ${getTotalUnspentValue()}` };
  // Persist spent
  let cur: VaultKeyState = { bronze: 0, silver: 0, gold: 0, obsidian: 0 };
  try { cur = { ...cur, ...JSON.parse(localStorage.getItem(SPENT_KEY) || "{}") }; } catch {}
  cur.bronze += spent.bronze; cur.silver += spent.silver; cur.gold += spent.gold; cur.obsidian += spent.obsidian;
  localStorage.setItem(SPENT_KEY, JSON.stringify(cur));
  // Persist unlock
  let map: Record<string, number> = {};
  try {
    const _pm = JSON.parse(localStorage.getItem(UNLOCKS_KEY) || "null");
    if (_pm && typeof _pm === "object" && !Array.isArray(_pm)) map = _pm;
  } catch {}
  map[modeTitle] = Date.now();
  localStorage.setItem(UNLOCKS_KEY, JSON.stringify(map));
  return { ok: true };
}

export function getUnlockCost(threshold: number): number {
  // Cost scales with required threshold
  if (threshold <= 5) return 1;
  if (threshold <= 10) return 2;
  if (threshold <= 25) return 4;
  if (threshold <= 50) return 7;
  return 10;
}

export const KEY_GLYPH: Record<KeyKind, string> = { bronze: "🗝", silver: "🔑", gold: "🔱", obsidian: "🜏" };
export const KEY_COLOR: Record<KeyKind, string> = { bronze: "#B45309", silver: "#94A3B8", gold: "#F59E0B", obsidian: "#7C3AED" };
