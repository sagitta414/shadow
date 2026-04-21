// PATRON VILLAINS — Repeated villain use elevates them to "Patron" tier with bonuses.

import { getArchive } from "./archive";

export type PatronTier = "none" | "favored" | "anointed" | "consecrated";

export interface PatronStatus {
  villain: string;
  uses: number;
  tier: PatronTier;
  nextThreshold: number | null;
  perk: string | null;
  unlockedScenarios: string[];
}

const TIER_THRESHOLDS: Array<{ tier: PatronTier; uses: number; perk: string }> = [
  { tier: "favored",      uses: 3,  perk: "+10% intensity bias toward villain's signature method" },
  { tier: "anointed",     uses: 7,  perk: "Unlocks villain's private location pool" },
  { tier: "consecrated",  uses: 15, perk: "Unlocks ETERNAL CAPTIVE epilogue mode for this villain" },
];

const SCENARIO_TEMPLATES: Record<PatronTier, string[]> = {
  none: [],
  favored: ["The Returning"],
  anointed: ["The Returning", "Property Marked"],
  consecrated: ["The Returning", "Property Marked", "Eternal Captive"],
};

export function getVillainUses(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of getArchive()) {
    for (const c of s.characters ?? []) {
      if (c.startsWith("V:")) counts[c] = (counts[c] ?? 0) + 1;
    }
  }
  return counts;
}

export function getPatronStatus(villain: string): PatronStatus {
  const uses = getVillainUses()[villain] ?? 0;
  let tier: PatronTier = "none";
  let perk: string | null = null;
  for (const t of TIER_THRESHOLDS) {
    if (uses >= t.uses) { tier = t.tier; perk = t.perk; }
  }
  const nextEntry = TIER_THRESHOLDS.find(t => uses < t.uses);
  return {
    villain,
    uses,
    tier,
    nextThreshold: nextEntry ? nextEntry.uses : null,
    perk,
    unlockedScenarios: SCENARIO_TEMPLATES[tier],
  };
}

export function getAllPatrons(): PatronStatus[] {
  const counts = getVillainUses();
  return Object.keys(counts)
    .map(v => getPatronStatus(v))
    .filter(p => p.tier !== "none")
    .sort((a, b) => b.uses - a.uses);
}

export function getPatronCount(): number {
  return getAllPatrons().length;
}
