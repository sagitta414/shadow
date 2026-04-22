import { getArchive } from "./archive";
import { evaluateChallenges } from "./bountyBoard";
import { getTotalMasteryLevels } from "./modeMastery";

export type VillainUnlockType = "stories" | "words" | "bounties" | "mastery";

export interface VillainUnlock {
  name: string;
  tier: 1 | 2 | 3;
  type: VillainUnlockType;
  threshold: number;
  hint: string;
  flavor: string;
}

export const LOCKED_VILLAINS: VillainUnlock[] = [
  // ── Tier 1 · First gates ─────────────────────────────────────────────────────
  { name: "Loki",                tier: 1, type: "stories",  threshold: 5,     hint: "Save 5 stories",               flavor: "The God of Mischief reveals himself only to those with a taste for dark narrative." },
  { name: "Green Goblin",        tier: 1, type: "stories",  threshold: 8,     hint: "Save 8 stories",               flavor: "He only reveals himself to those who've shown they mean business." },
  { name: "Purple Man",          tier: 1, type: "words",    threshold: 8000,  hint: "Write 8,000 words",            flavor: "Control begins with comprehension. Write enough — and he finds you." },

  // ── Tier 2 · Mid gates ───────────────────────────────────────────────────────
  { name: "Mephisto",            tier: 2, type: "stories",  threshold: 12,    hint: "Save 12 stories",              flavor: "He's been watching since your first dark story. Now he offers a bargain." },
  { name: "Ra's al Ghul",        tier: 2, type: "stories",  threshold: 14,    hint: "Save 14 stories",              flavor: "The Demon's Head judges only the persistent." },
  { name: "Thanos",              tier: 2, type: "stories",  threshold: 16,    hint: "Save 16 stories",              flavor: "The Mad Titan doesn't notice you until your ambition proves real." },
  { name: "Dark Phoenix",        tier: 2, type: "words",    threshold: 18000, hint: "Write 18,000 words",           flavor: "The Phoenix chooses only those who have already known destruction." },
  { name: "Hela",                tier: 2, type: "stories",  threshold: 20,    hint: "Save 20 stories",              flavor: "The goddess of death counts only those who've faced enough endings." },
  { name: "Kang the Conqueror",  tier: 2, type: "bounties", threshold: 4,     hint: "Complete 4 bounty challenges", flavor: "The Conqueror only appears to those who've proven themselves across timelines." },
  { name: "Dormammu",            tier: 2, type: "words",    threshold: 24000, hint: "Write 24,000 words",           flavor: "The Dark Dimension is reached only by those who've wandered far enough." },

  // ── Tier 3 · Prestige gates ──────────────────────────────────────────────────
  { name: "Galactus",            tier: 3, type: "stories",  threshold: 28,    hint: "Save 28 stories",              flavor: "The World Devourer only acknowledges those who've built something worth consuming." },
  { name: "Darkseid",            tier: 3, type: "mastery",  threshold: 20,    hint: "Earn 20 mastery levels",       flavor: "The God of Evil only acknowledges those who've mastered the craft." },
  { name: "Apocalypse",          tier: 3, type: "words",    threshold: 32000, hint: "Write 32,000 words",           flavor: "En Sabah Nur reveals himself only to the strong. Prove it in words." },
  { name: "Emperor Palpatine",   tier: 3, type: "bounties", threshold: 7,     hint: "Complete 7 bounty challenges", flavor: "The Emperor moves through agents. Prove your usefulness across seven contracts." },
  { name: "Anti-Monitor",        tier: 3, type: "words",    threshold: 45000, hint: "Write 45,000 words",           flavor: "He who has consumed universes can only be found by those who've filled their own." },
];

export interface VillainUnlockStatus {
  locked: boolean;
  tier: 1 | 2 | 3;
  current: number;
  threshold: number;
  hint: string;
  flavor: string;
  progress: number;
  type: VillainUnlockType;
}

const SEEN_KEY = "sw_villain_unlocks_seen_v1";

export function getSeenVillainUnlocks(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]")); } catch { return new Set(); }
}
export function markVillainUnlockSeen(name: string) {
  const s = getSeenVillainUnlocks(); s.add(name);
  localStorage.setItem(SEEN_KEY, JSON.stringify([...s]));
}

let _cache: { stories: number; words: number; bounties: number; mastery: number } | null = null;
let _cacheTs = 0;

function getMetrics() {
  const now = Date.now();
  if (_cache && now - _cacheTs < 5000) return _cache;
  const archive = getArchive();
  const stories = archive.length;
  const words = archive.reduce((t, s) => t + (s.wordCount ?? 0), 0);
  let bounties = 0, mastery = 0;
  try { bounties = evaluateChallenges().filter((b: { complete: boolean }) => b.complete).length; } catch {}
  try { mastery = getTotalMasteryLevels(); } catch {}
  _cache = { stories, words, bounties, mastery };
  _cacheTs = now;
  return _cache;
}

export function getVillainUnlockStatus(name: string): VillainUnlockStatus | null {
  const def = LOCKED_VILLAINS.find(v => v.name === name);
  if (!def) return null;
  const m = getMetrics();
  const current =
    def.type === "stories"  ? m.stories  :
    def.type === "words"    ? m.words    :
    def.type === "bounties" ? m.bounties :
    m.mastery;
  return {
    locked: current < def.threshold,
    tier: def.tier,
    current,
    threshold: def.threshold,
    hint: def.hint,
    flavor: def.flavor,
    progress: Math.min(1, current / def.threshold),
    type: def.type,
  };
}

export function isVillainLocked(name: string): boolean {
  return getVillainUnlockStatus(name)?.locked ?? false;
}

export function getNewlyUnlockedVillains(): VillainUnlock[] {
  const seen = getSeenVillainUnlocks();
  const m = getMetrics();
  return LOCKED_VILLAINS.filter(v => {
    if (seen.has(v.name)) return false;
    const current =
      v.type === "stories"  ? m.stories  :
      v.type === "words"    ? m.words    :
      v.type === "bounties" ? m.bounties :
      m.mastery;
    return current >= v.threshold;
  });
}

export function getTotalLockedCount(): number {
  const m = getMetrics();
  return LOCKED_VILLAINS.filter(v => {
    const current =
      v.type === "stories"  ? m.stories  :
      v.type === "words"    ? m.words    :
      v.type === "bounties" ? m.bounties :
      m.mastery;
    return current < v.threshold;
  }).length;
}
