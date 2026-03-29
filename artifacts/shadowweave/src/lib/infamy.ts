// ── SHADOWWEAVE · Villain Infamy System ──────────────────────────────────────

export type InfamyTier = 0 | 1 | 2 | 3 | 4;

export interface InfamyLevel {
  tier: InfamyTier;
  title: string;
  color: string;
  rgb: string;
  glow: string;
  minCount: number;
}

export const INFAMY_LEVELS: InfamyLevel[] = [
  { tier: 0, title: "Shadow",        color: "#64748B", rgb: "100,116,139", glow: "rgba(100,116,139,0.2)", minCount: 0  },
  { tier: 1, title: "Rising Threat", color: "#94A3B8", rgb: "148,163,184", glow: "rgba(148,163,184,0.25)", minCount: 1  },
  { tier: 2, title: "The Feared",    color: "#F87171", rgb: "248,113,113", glow: "rgba(248,113,113,0.3)",  minCount: 3  },
  { tier: 3, title: "Terror",        color: "#C084FC", rgb: "192,132,252", glow: "rgba(192,132,252,0.35)", minCount: 6  },
  { tier: 4, title: "Apex Predator", color: "#FB923C", rgb: "251,146,60",  glow: "rgba(251,146,60,0.4)",  minCount: 10 },
  // Tier 5 is legendary — only shows as special tag
];

export const UNTOUCHABLE_LEVEL: InfamyLevel = {
  tier: 4, title: "The Untouchable", color: "#F5D67A", rgb: "245,214,122", glow: "rgba(245,214,122,0.5)", minCount: 15,
};

export interface VillainStat {
  name: string;
  count: number;
  level: InfamyLevel;
}

// ── Compute ───────────────────────────────────────────────────────────────────

export function getVillainAppearances(): Map<string, number> {
  let archive: any[] = [];
  try { archive = JSON.parse(localStorage.getItem("sw_archive_v1") || "[]"); } catch {}

  const counts = new Map<string, number>();
  for (const story of archive) {
    if (!story.characters || !Array.isArray(story.characters)) continue;
    // Characters[1] onwards are typically antagonists
    // For mass capture / duo modes, characters[2+] may be heroines too — use characters[1] as primary villain
    if (story.characters[1]) {
      const v = story.characters[1];
      counts.set(v, (counts.get(v) || 0) + 1);
    }
  }
  return counts;
}

export function getInfamyLevel(count: number): InfamyLevel {
  if (count >= 15) return UNTOUCHABLE_LEVEL;
  if (count >= 10) return INFAMY_LEVELS[4];
  if (count >= 6)  return INFAMY_LEVELS[3];
  if (count >= 3)  return INFAMY_LEVELS[2];
  if (count >= 1)  return INFAMY_LEVELS[1];
  return INFAMY_LEVELS[0];
}

export function getTopVillains(n = 5): VillainStat[] {
  const appearances = getVillainAppearances();
  return Array.from(appearances.entries())
    .map(([name, count]) => ({ name, count, level: getInfamyLevel(count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

export function getVillainStat(name: string): VillainStat {
  const appearances = getVillainAppearances();
  const count = appearances.get(name) || 0;
  return { name, count, level: getInfamyLevel(count) };
}
