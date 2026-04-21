import { getArchive } from "./archive";
import { evaluateChallenges } from "./bountyBoard";

export interface DarknessRank {
  tier: 0 | 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  color: string;
  glowColor: string;
  minScore: number;
  icon: string;
  bg: string;
}

export const DARKNESS_RANKS: DarknessRank[] = [
  {
    tier: 0, title: "SHADOW ACOLYTE",    subtitle: "The journey begins in darkness",
    color: "#94A3B8", glowColor: "rgba(148,163,184,0.35)", minScore: 0,
    icon: "🕯", bg: "rgba(148,163,184,0.07)",
  },
  {
    tier: 1, title: "SHADOW WEAVER",     subtitle: "Threads of darkness take shape",
    color: "#C084FC", glowColor: "rgba(192,132,252,0.4)", minScore: 100,
    icon: "🕸", bg: "rgba(192,132,252,0.07)",
  },
  {
    tier: 2, title: "DARK CHRONICLER",   subtitle: "Stories that haunt the void",
    color: "#818CF8", glowColor: "rgba(129,140,248,0.4)", minScore: 350,
    icon: "📜", bg: "rgba(129,140,248,0.07)",
  },
  {
    tier: 3, title: "VOID ARCHITECT",    subtitle: "Builder of corridors with no exit",
    color: "#E879F9", glowColor: "rgba(232,121,249,0.45)", minScore: 800,
    icon: "🌑", bg: "rgba(232,121,249,0.07)",
  },
  {
    tier: 4, title: "THE SHADOW ITSELF", subtitle: "You are what they fear",
    color: "#FFB800", glowColor: "rgba(255,184,0,0.5)", minScore: 1800,
    icon: "♾", bg: "rgba(255,184,0,0.06)",
  },
];

export function computeDarknessScore(): number {
  const archive = getArchive();
  let score = 0;
  for (const s of archive) {
    score += 25;
    score += Math.floor((s.wordCount ?? 0) / 50);
    score += (s.chapters.length - 1) * 15;
    if ((s as any).wardensLog) score += 10;
    if ((s as any).psychReport) score += 10;
    const journals = (s as any).journalEntries ?? {};
    score += Object.keys(journals).length * 5;
    if (s.rating === 5) score += 8;
    if (s.favourite) score += 5;
  }
  try {
    const bounties = evaluateChallenges();
    score += bounties.filter(b => b.complete).length * 50;
  } catch {}
  return score;
}

export function getDarknessRank(score: number): DarknessRank {
  for (let i = DARKNESS_RANKS.length - 1; i >= 0; i--) {
    if (score >= DARKNESS_RANKS[i].minScore) return DARKNESS_RANKS[i];
  }
  return DARKNESS_RANKS[0];
}

export function getNextRank(current: DarknessRank): DarknessRank | null {
  return DARKNESS_RANKS.find(r => r.minScore > current.minScore) ?? null;
}

export function getRankProgress(score: number, current: DarknessRank): number {
  const next = getNextRank(current);
  if (!next) return 1;
  return Math.min(1, (score - current.minScore) / (next.minScore - current.minScore));
}

export function getScoreBreakdown(score: number) {
  const rank = getDarknessRank(score);
  const next = getNextRank(rank);
  const progress = getRankProgress(score, rank);
  const pointsToNext = next ? Math.max(0, next.minScore - score) : 0;
  return { rank, next, progress, pointsToNext, score };
}
