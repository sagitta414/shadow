import { getArchive } from "./archive";

export interface ThreatLevel {
  score: number;
  level: number;
  title: string;
  subtitle: string;
  color: string;
  nextThreshold: number;
}

const LEVELS = [
  { level: 1, title: "Observer",    subtitle: "Watching from the dark",              color: "#6B7280", threshold: 0   },
  { level: 2, title: "Initiate",    subtitle: "First steps into shadow",             color: "#8B5CF6", threshold: 10  },
  { level: 3, title: "Infiltrator", subtitle: "The shadows know your name",          color: "#7C3AED", threshold: 22  },
  { level: 4, title: "Captor",      subtitle: "You hold power now",                  color: "#EF4444", threshold: 36  },
  { level: 5, title: "Warden",      subtitle: "This domain is yours",                color: "#DC2626", threshold: 52  },
  { level: 6, title: "Architect",   subtitle: "You design the cage",                 color: "#B91C1C", threshold: 68  },
  { level: 7, title: "Shadow Lord", subtitle: "The dark bends to your will",         color: "#FF6B35", threshold: 80  },
  { level: 8, title: "Unbound",     subtitle: "No rules remain",                     color: "#FF4500", threshold: 88  },
  { level: 9, title: "Voidwalker",  subtitle: "You exist beyond the light",          color: "#FF1493", threshold: 94  },
  { level: 10, title: "The Void",   subtitle: "Darkness incarnate",                  color: "#FF0080", threshold: 99  },
];

const DARK_WORDS = /\b(broken|shattered|surrender|submit|comply|helpless|consumed|devoured|trapped|enslaved|claimed|owned|dominated|controlled|powerless|screamed|begged|pleaded|relented|defeated|conquered)\b/gi;

export function computeThreatScore(): number {
  const stories = getArchive();
  if (stories.length === 0) return 0;

  let score = 0;

  // Base: each story = 3pts
  score += stories.length * 3;

  // Words: every 500 words = 1pt (cap at 30)
  const totalWords = stories.reduce((s, st) => s + st.wordCount, 0);
  score += Math.min(30, Math.floor(totalWords / 500));

  // High ratings: 5-star = +2pts each
  score += stories.filter(s => s.rating === 5).length * 2;

  // Darkness: dark keyword density
  for (const story of stories) {
    const text = story.chapters.join(" ");
    const matches = text.match(DARK_WORDS) ?? [];
    score += Math.min(4, Math.floor(matches.length / 15));
  }

  // Warden's Log generated: +1pt each (cap 10)
  const wardensCount = stories.filter(s => (s as any).wardensLog).length;
  score += Math.min(10, wardensCount);

  // Psych reports generated: +1pt each (cap 10)
  const psychCount = stories.filter(s => (s as any).psychReport).length;
  score += Math.min(10, psychCount);

  return Math.min(100, score);
}

export function getThreatLevel(): ThreatLevel {
  const score = computeThreatScore();
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (score >= lvl.threshold) current = lvl;
    else break;
  }
  const nextIdx = LEVELS.indexOf(current) + 1;
  const nextThreshold = nextIdx < LEVELS.length ? LEVELS[nextIdx].threshold : 100;
  return { score, ...current, nextThreshold };
}
