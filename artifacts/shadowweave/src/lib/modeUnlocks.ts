import { getArchive } from "./archive";
import { evaluateChallenges } from "./bountyBoard";

export interface UnlockCondition {
  modeTitle: string;
  type: "stories" | "bounties" | "words";
  threshold: number;
  hint: string;
}

export const LOCKED_MODES: UnlockCondition[] = [
  { modeTitle: "DARK MIRROR",     type: "stories",  threshold: 5,     hint: "Save 5 stories" },
  { modeTitle: "TIME LOOP",       type: "bounties", threshold: 3,     hint: "Complete 3 bounty challenges" },
  { modeTitle: "DREAM SEQUENCE",  type: "stories",  threshold: 10,    hint: "Save 10 stories" },
  { modeTitle: "PUBLIC PROPERTY", type: "bounties", threshold: 5,     hint: "Complete 5 bounty challenges" },
  { modeTitle: "ESCAPE ATTEMPT",  type: "stories",  threshold: 18,    hint: "Save 18 stories" },
  { modeTitle: "VILLAIN MODE",    type: "words",    threshold: 12000, hint: "Write 12,000 total words" },
];

export interface UnlockStatus {
  locked: boolean;
  current: number;
  threshold: number;
  hint: string;
  progress: number;
}

let _metrics: { stories: number; words: number; bounties: number } | null = null;
let _metricsTs = 0;

function getMetrics() {
  const now = Date.now();
  if (_metrics && now - _metricsTs < 10000) return _metrics;
  const archive = getArchive();
  const stories = archive.length;
  const words = archive.reduce((t, s) => t + (s.wordCount ?? 0), 0);
  let bounties = 0;
  try { bounties = evaluateChallenges().filter(b => b.complete).length; } catch {}
  _metrics = { stories, words, bounties };
  _metricsTs = now;
  return _metrics;
}

export function invalidateMetrics() {
  _metrics = null;
}

export function getUnlockStatus(modeTitle: string): UnlockStatus | null {
  const cond = LOCKED_MODES.find(m => m.modeTitle === modeTitle);
  if (!cond) return null;
  const m = getMetrics();
  const current =
    cond.type === "stories" ? m.stories :
    cond.type === "bounties" ? m.bounties : m.words;
  return {
    locked: current < cond.threshold,
    current,
    threshold: cond.threshold,
    hint: cond.hint,
    progress: Math.min(1, current / cond.threshold),
  };
}

export function isModeLocked(modeTitle: string): boolean {
  return getUnlockStatus(modeTitle)?.locked ?? false;
}
