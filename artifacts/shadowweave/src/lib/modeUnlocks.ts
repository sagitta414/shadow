import { getArchive } from "./archive";
import { evaluateChallenges } from "./bountyBoard";
import { getTotalMasteryLevels } from "./modeMastery";
import { getPatronCount } from "./patrons";
import { isVaultUnlocked, getUnlockCost } from "./vaultKeys";
import { getNightfallStatus, isNightfallMode } from "./nightfall";

export type UnlockType = "stories" | "bounties" | "words" | "mastery" | "patrons";

export interface UnlockCondition {
  modeTitle: string;
  type: UnlockType;
  threshold: number;
  hint: string;
}

export const LOCKED_MODES: UnlockCondition[] = [
  // ── Tier 1 · Early gates (introduce gamification) ─────────────────────────
  { modeTitle: "RESCUE GONE WRONG",   type: "stories",  threshold: 3,     hint: "Save 3 stories" },
  { modeTitle: "CONFINED SPACE",      type: "stories",  threshold: 4,     hint: "Save 4 stories" },
  { modeTitle: "DARK MIRROR",         type: "stories",  threshold: 5,     hint: "Save 5 stories" },
  { modeTitle: "DUAL CAPTURE",        type: "stories",  threshold: 7,     hint: "Save 7 stories" },
  { modeTitle: "SLOW BURN",           type: "words",    threshold: 8000,  hint: "Write 8,000 total words" },
  { modeTitle: "DREAM SEQUENCE",      type: "stories",  threshold: 10,    hint: "Save 10 stories" },
  // ── Tier 2 · Mid gates (require commitment) ──────────────────────────────
  { modeTitle: "VILLAIN MODE",        type: "words",    threshold: 12000, hint: "Write 12,000 total words" },
  { modeTitle: "CORRUPTION ARC",      type: "stories",  threshold: 12,    hint: "Save 12 stories" },
  { modeTitle: "TIME LOOP",           type: "bounties", threshold: 3,     hint: "Complete 3 bounty challenges" },
  { modeTitle: "POWER DRAIN",         type: "bounties", threshold: 4,     hint: "Complete 4 bounty challenges" },
  { modeTitle: "PUBLIC PROPERTY",     type: "bounties", threshold: 5,     hint: "Complete 5 bounty challenges" },
  { modeTitle: "NEGOTIATION ROOM",    type: "mastery",  threshold: 6,     hint: "Earn 6 total mastery levels" },
  { modeTitle: "MIND BREAK",          type: "mastery",  threshold: 8,     hint: "Earn 8 total mastery levels" },
  { modeTitle: "ESCAPE ATTEMPT",      type: "stories",  threshold: 18,    hint: "Save 18 stories" },
  { modeTitle: "THE SHOWCASE",        type: "stories",  threshold: 15,    hint: "Save 15 stories" },
  { modeTitle: "OBEDIENCE TRAINING",  type: "mastery",  threshold: 14,    hint: "Earn 14 total mastery levels" },
  // ── Tier 3 · Advanced gates (true endgame) ───────────────────────────────
  { modeTitle: "HERO AUCTION",        type: "words",    threshold: 25000, hint: "Write 25,000 total words" },
  { modeTitle: "ARENA MODE",          type: "stories",  threshold: 25,    hint: "Save 25 stories" },
  { modeTitle: "ETERNAL CAPTIVE",     type: "patrons",  threshold: 1,     hint: "Elevate 1 villain to Patron tier (Favored or higher)" },
  { modeTitle: "VILLAIN TEAM-UP",     type: "patrons",  threshold: 2,     hint: "Have 2 Patron-tier villains" },
  { modeTitle: "BETTING POOL",        type: "patrons",  threshold: 3,     hint: "Have 3 Patron-tier villains" },
  { modeTitle: "THE HANDLER",         type: "patrons",  threshold: 4,     hint: "Have 4 Patron-tier villains" },
  { modeTitle: "TROPHY DISPLAY",      type: "stories",  threshold: 30,    hint: "Save 30 stories" },
  { modeTitle: "THE LONG GAME",       type: "words",    threshold: 35000, hint: "Write 35,000 total words" },
  { modeTitle: "MASS CAPTURE",        type: "words",    threshold: 45000, hint: "Write 45,000 total words" },
  { modeTitle: "CHAIN OF CUSTODY",    type: "mastery",  threshold: 18,    hint: "Earn 18 total mastery levels" },
  { modeTitle: "FACTION WAR",         type: "words",    threshold: 60000, hint: "Write 60,000 total words" },
];

export interface UnlockStatus {
  locked: boolean;
  current: number;
  threshold: number;
  hint: string;
  progress: number;
  type: UnlockType;
  /** Cost in vault-key value to bypass. */
  keyCost: number;
  /** True when user has spent keys to unlock this. */
  bypassed: boolean;
  /** Nightfall window status when applicable. */
  nightfall: { open: boolean; label: string; flavor: string } | null;
}

let _metrics: { stories: number; words: number; bounties: number; mastery: number; patrons: number } | null = null;
let _metricsTs = 0;

function getMetrics() {
  const now = Date.now();
  if (_metrics && now - _metricsTs < 5000) return _metrics;
  const archive = getArchive();
  const stories = archive.length;
  const words = archive.reduce((t, s) => t + (s.wordCount ?? 0), 0);
  let bounties = 0;
  try { bounties = evaluateChallenges().filter(b => b.complete).length; } catch {}
  let mastery = 0, patrons = 0;
  try { mastery = getTotalMasteryLevels(); } catch {}
  try { patrons = getPatronCount(); } catch {}
  _metrics = { stories, words, bounties, mastery, patrons };
  _metricsTs = now;
  return _metrics;
}

export function invalidateMetrics() {
  _metrics = null;
}

export function getUnlockStatus(modeTitle: string): UnlockStatus | null {
  const cond = LOCKED_MODES.find(m => m.modeTitle === modeTitle);
  const nightStatus = getNightfallStatus(modeTitle);

  if (!cond && !nightStatus) return null;

  // Pure nightfall mode (no other condition) — locked when window closed
  if (!cond && nightStatus) {
    return {
      locked: !nightStatus.open,
      current: nightStatus.open ? 1 : 0,
      threshold: 1,
      hint: nightStatus.flavor,
      progress: nightStatus.open ? 1 : 0,
      type: "stories",
      keyCost: 1,
      bypassed: isVaultUnlocked(modeTitle),
      nightfall: { open: nightStatus.open, label: nightStatus.label, flavor: nightStatus.flavor },
    };
  }

  const m = getMetrics();
  const current =
    cond!.type === "stories" ? m.stories :
    cond!.type === "bounties" ? m.bounties :
    cond!.type === "words" ? m.words :
    cond!.type === "mastery" ? m.mastery :
    m.patrons;
  const baseLocked = current < cond!.threshold;
  const bypassed = isVaultUnlocked(modeTitle);
  const nightWindow = nightStatus ? { open: nightStatus.open, label: nightStatus.label, flavor: nightStatus.flavor } : null;
  const nightLocked = isNightfallMode(modeTitle) ? !(nightStatus?.open) : false;
  const locked = bypassed ? (nightLocked) : (baseLocked || nightLocked);
  return {
    locked,
    current,
    threshold: cond!.threshold,
    hint: cond!.hint,
    progress: Math.min(1, current / cond!.threshold),
    type: cond!.type,
    keyCost: getUnlockCost(cond!.threshold),
    bypassed,
    nightfall: nightWindow,
  };
}

export function isModeLocked(modeTitle: string): boolean {
  return getUnlockStatus(modeTitle)?.locked ?? false;
}
