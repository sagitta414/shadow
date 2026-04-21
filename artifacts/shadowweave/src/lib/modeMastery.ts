// MODE MASTERY — XP & levels per story mode (1-10). Each level grants a perk.

const MASTERY_KEY = "sw_mode_mastery_v1";

interface MasteryRecord {
  xp: number;
  uses: number;
  lastUsed: number;
}

export interface MasteryState {
  level: number;       // 1-10
  xp: number;          // current xp
  xpForNext: number;   // xp needed to reach next level (cumulative threshold)
  xpInLevel: number;   // xp earned within current level
  xpToLevel: number;   // xp needed within current level to ding
  uses: number;
  unlockedPerks: string[];
  nextPerk: string | null;
}

// Cumulative XP thresholds for levels 1..10 (level 1 = 0 xp earned)
const THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3500];

const PERKS_BY_LEVEL = [
  null,                                         // L1 (default)
  "Unlocks BRUTAL intensity option",            // L2
  "Unlocks EPIC SAGA story length",             // L3
  "Unlocks Director's Notes injection",         // L4
  "Adds VOLATILE villain randomiser",           // L5
  "Unlocks scene image generation in this mode",// L6
  "Unlocks legacy continuation chain",          // L7
  "Unlocks Hidden Chamber locations",           // L8
  "Reduces lock thresholds by 25% in mode pool",// L9
  "Mastery — unlocks ASCENDED variant of mode", // L10
];

function readAll(): Record<string, MasteryRecord> {
  try { return JSON.parse(localStorage.getItem(MASTERY_KEY) || "{}"); } catch { return {}; }
}

function writeAll(data: Record<string, MasteryRecord>) {
  localStorage.setItem(MASTERY_KEY, JSON.stringify(data));
}

export function recordMasteryGain(modeTitle: string, opts?: { wordCount?: number }): MasteryState {
  const all = readAll();
  const cur = all[modeTitle] ?? { xp: 0, uses: 0, lastUsed: 0 };
  const wc = opts?.wordCount ?? 0;
  // 60 base + 1 xp per 50 words; capped at 220 per save
  const gain = Math.min(220, 60 + Math.floor(wc / 50));
  cur.xp += gain;
  cur.uses += 1;
  cur.lastUsed = Date.now();
  all[modeTitle] = cur;
  writeAll(all);
  return getMasteryState(modeTitle);
}

export function getMasteryState(modeTitle: string): MasteryState {
  const cur = readAll()[modeTitle] ?? { xp: 0, uses: 0, lastUsed: 0 };
  let level = 1;
  for (let i = 1; i < THRESHOLDS.length; i++) {
    if (cur.xp >= THRESHOLDS[i]) level = i + 1;
  }
  const idx = Math.min(level, THRESHOLDS.length - 1);
  const xpForNext = THRESHOLDS[idx] ?? THRESHOLDS[THRESHOLDS.length - 1];
  const prevThresh = THRESHOLDS[idx - 1] ?? 0;
  const xpInLevel = Math.max(0, cur.xp - prevThresh);
  const xpToLevel = Math.max(1, xpForNext - prevThresh);
  const unlockedPerks = PERKS_BY_LEVEL.slice(0, level).filter(Boolean) as string[];
  const nextPerk = level < 10 ? PERKS_BY_LEVEL[level] : null;
  return { level, xp: cur.xp, xpForNext, xpInLevel, xpToLevel, uses: cur.uses, unlockedPerks, nextPerk };
}

export function getAllMastery(): Array<{ modeTitle: string; state: MasteryState }> {
  const all = readAll();
  return Object.keys(all).map(mode => ({ modeTitle: mode, state: getMasteryState(mode) }))
    .sort((a, b) => b.state.xp - a.state.xp);
}

export function getTotalMasteryLevels(): number {
  return getAllMastery().reduce((t, m) => t + m.state.level, 0);
}
