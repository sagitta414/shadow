// ── SHADOWWEAVE · Achievement System ─────────────────────────────────────────

const ACHIEVEMENTS_KEY = "sw_achievements_v2";
const MODE_COMPLETIONS_KEY = "sw_mode_completions_v1";

export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export interface Achievement {
  id: string;
  title: string;
  lore: string;
  desc: string;
  icon: string;
  rarity: AchievementRarity;
  xp: number;
  hidden?: boolean;
  progress?: (state: AchievementCheckState) => [number, number];
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: number;
}

export interface AchievementCheckState {
  totalStories: number;
  totalWords: number;
  streakCount: number;
  heroineCount: number;
  maxVillainCount: number;
  specialistPlayed: number;
  primaryPlayed: number;
  hasCustomVillain: boolean;
  isLateNight: boolean;
  completedModes: string[];
}

export const SPECIALIST_TOOLS: string[] = [
  "Mind Break Chamber",
  "Two Heroines One Cell",
  "Rescue Gone Wrong",
  "Power Drain Mode",
  "Mass Capture Mode",
  "Corruption Arc",
  "Hero Auction",
  "Trophy Display",
  "Obedience Training",
  "The Showcase",
  "Public Property",
  "Betting Pool",
  "Villain Team-Up",
  "Chain of Custody",
  "The Long Game",
  "Dark Mirror",
  "Arena Mode",
  "The Handler",
];

export const PRIMARY_TOOLS: string[] = [
  "Heroine Forge",
  "Celebrity Captive",
  "Custom Scenario",
];

export const ACHIEVEMENTS: Achievement[] = [
  // ── Origin ────────────────────────────────────────────────────────────────
  {
    id: "first_inscription",
    title: "The First Inscription",
    lore: "A single drop of ink begins the grimoire. The dark has your name now.",
    desc: "Save your very first story.",
    icon: "🩸",
    rarity: "common",
    xp: 10,
  },

  // ── Story Count ───────────────────────────────────────────────────────────
  {
    id: "shadow_initiate",
    title: "Shadow Initiate",
    lore: "The darkness recognises those who return to it.",
    desc: "Save 5 stories.",
    icon: "🌑",
    rarity: "common",
    xp: 10,
    progress: (s) => [Math.min(s.totalStories, 5), 5],
  },
  {
    id: "keeper_of_darkness",
    title: "Keeper of Darkness",
    lore: "She built a vault of ruin — and she returns to it often.",
    desc: "Save 25 stories.",
    icon: "🗝",
    rarity: "rare",
    xp: 25,
    progress: (s) => [Math.min(s.totalStories, 25), 25],
  },
  {
    id: "architect_of_ruin",
    title: "Architect of Ruin",
    lore: "Not merely a witness. A designer of suffering.",
    desc: "Save 50 stories.",
    icon: "🏚",
    rarity: "epic",
    xp: 60,
    progress: (s) => [Math.min(s.totalStories, 50), 50],
  },
  {
    id: "dark_chronicler",
    title: "The Dark Chronicler",
    lore: "A century of falls, all written in the same hand. The archive never sleeps.",
    desc: "Save 100 stories.",
    icon: "📖",
    rarity: "legendary",
    xp: 150,
    progress: (s) => [Math.min(s.totalStories, 100), 100],
  },

  // ── Word Count ────────────────────────────────────────────────────────────
  {
    id: "blood_on_page",
    title: "Blood on the Page",
    lore: "Words drawn not from ink, but from something older.",
    desc: "Write 5,000 words across all stories.",
    icon: "✍",
    rarity: "common",
    xp: 10,
    progress: (s) => [Math.min(s.totalWords, 5000), 5000],
  },
  {
    id: "the_grimoire",
    title: "The Grimoire",
    lore: "A tome thick enough to press a heroine flat beneath its weight.",
    desc: "Write 20,000 words.",
    icon: "📜",
    rarity: "rare",
    xp: 25,
    progress: (s) => [Math.min(s.totalWords, 20000), 20000],
  },
  {
    id: "grand_tome",
    title: "The Grand Tome",
    lore: "Libraries burn. This one endures.",
    desc: "Write 50,000 words.",
    icon: "🔮",
    rarity: "epic",
    xp: 60,
    progress: (s) => [Math.min(s.totalWords, 50000), 50000],
  },
  {
    id: "shadow_weaver_title",
    title: "Shadow Weaver",
    lore: "The darkness no longer writes itself. You do.",
    desc: "Write 100,000 words.",
    icon: "🕸",
    rarity: "legendary",
    xp: 150,
    progress: (s) => [Math.min(s.totalWords, 100000), 100000],
  },

  // ── Streaks ───────────────────────────────────────────────────────────────
  {
    id: "the_oath",
    title: "The Oath is Spoken",
    lore: "A promise made in the dark is the hardest kind to break.",
    desc: "Maintain a 3-day story streak.",
    icon: "⚔",
    rarity: "common",
    xp: 10,
    progress: (s) => [Math.min(s.streakCount, 3), 3],
  },
  {
    id: "bound_to_dark",
    title: "Bound to the Dark",
    lore: "One week. The collar fits now.",
    desc: "Maintain a 7-day story streak.",
    icon: "⛓",
    rarity: "rare",
    xp: 25,
    progress: (s) => [Math.min(s.streakCount, 7), 7],
  },
  {
    id: "no_mercy_no_dawn",
    title: "No Mercy, No Dawn",
    lore: "Fourteen nights without reprieve. The ritual is complete.",
    desc: "Maintain a 14-day story streak.",
    icon: "🌘",
    rarity: "epic",
    xp: 60,
    progress: (s) => [Math.min(s.streakCount, 14), 14],
  },
  {
    id: "eternal_contract",
    title: "The Eternal Contract",
    lore: "Thirty days. There is no leaving now.",
    desc: "Maintain a 30-day story streak.",
    icon: "🔱",
    rarity: "legendary",
    xp: 150,
    progress: (s) => [Math.min(s.streakCount, 30), 30],
  },

  // ── Mode Diversity ────────────────────────────────────────────────────────
  {
    id: "curious_darkness",
    title: "A Curious Darkness",
    lore: "She tried the door. It was unlocked the whole time.",
    desc: "Play 3 different specialist modes.",
    icon: "🔦",
    rarity: "common",
    xp: 10,
    progress: (s) => [Math.min(s.specialistPlayed, 3), 3],
  },
  {
    id: "the_collector",
    title: "The Collector",
    lore: "Each scenario — a specimen pinned behind glass.",
    desc: "Play 7 different specialist modes.",
    icon: "📌",
    rarity: "rare",
    xp: 25,
    progress: (s) => [Math.min(s.specialistPlayed, 7), 7],
  },
  {
    id: "connoisseur_of_ruin",
    title: "Connoisseur of Ruin",
    lore: "Not all darknesses are equal. She knows the difference now.",
    desc: "Play 12 different specialist modes.",
    icon: "🎭",
    rarity: "epic",
    xp: 60,
    progress: (s) => [Math.min(s.specialistPlayed, 12), 12],
  },
  {
    id: "master_of_shadows",
    title: "Master of All Shadows",
    lore: "Every door opened. Every darkness entered. Nothing left unexplored.",
    desc: "Play all 18 specialist modes.",
    icon: "👁",
    rarity: "legendary",
    xp: 150,
    progress: (s) => [Math.min(s.specialistPlayed, 18), 18],
  },

  // ── Three Primary Modes ───────────────────────────────────────────────────
  {
    id: "three_thrones",
    title: "The Three Thrones",
    lore: "The forge, the captive chamber, the blank page. All three claimed.",
    desc: "Play all 3 primary story modes.",
    icon: "⚜",
    rarity: "rare",
    xp: 25,
    progress: (s) => [Math.min(s.primaryPlayed, 3), 3],
  },

  // ── Specific Mode Trophies ────────────────────────────────────────────────
  {
    id: "mind_sculptor",
    title: "Mind Sculptor",
    lore: "She resisted until the architecture of her thoughts changed.",
    desc: "Complete a Mind Break Chamber story.",
    icon: "🌀",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "the_hammer_falls",
    title: "The Hammer Falls",
    lore: "SOLD. The crowd didn't even hesitate.",
    desc: "Complete a Hero Auction story.",
    icon: "⚖",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "corruptors_brand",
    title: "The Corruptor's Brand",
    lore: "By chapter seven, she stopped calling it corruption.",
    desc: "Complete a Corruption Arc story.",
    icon: "🌑",
    rarity: "epic",
    xp: 60,
  },
  {
    id: "blood_and_crowd",
    title: "Blood & Crowd",
    lore: "The arena remembers every fighter. Every fall.",
    desc: "Complete an Arena Mode story.",
    icon: "🏟",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "protocol_acknowledged",
    title: "Protocol Acknowledged",
    lore: "No supervillain required. The professional was sufficient.",
    desc: "Complete a Handler Protocol story.",
    icon: "📁",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "the_patient_dark",
    title: "The Patient Dark",
    lore: "Time is the cruelest captor. He knew this from the start.",
    desc: "Complete a Long Game story.",
    icon: "⏳",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "drain_complete",
    title: "The Drain Complete",
    lore: "The last flicker of power left her at 3am. The silence after was absolute.",
    desc: "Complete a Power Drain story.",
    icon: "⚡",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "shattered_reflection",
    title: "Shattered Reflection",
    lore: "The copy destroyed everything the original had built. She watched.",
    desc: "Complete a Dark Mirror story.",
    icon: "🪞",
    rarity: "rare",
    xp: 25,
  },

  // ── Heroine & Villain Mastery ─────────────────────────────────────────────
  {
    id: "pantheon_of_fallen",
    title: "Pantheon of the Fallen",
    lore: "Ten different names. Ten different stories of descent. The gallery grows.",
    desc: "Write stories with 10 different heroines.",
    icon: "🗿",
    rarity: "epic",
    xp: 60,
    progress: (s) => [Math.min(s.heroineCount, 10), 10],
  },
  {
    id: "devoted_captor",
    title: "The Devoted Captor",
    lore: "He has a type. The same name appears again and again in his ledger.",
    desc: "Use the same villain 5+ times.",
    icon: "🎯",
    rarity: "rare",
    xp: 25,
    progress: (s) => [Math.min(s.maxVillainCount, 5), 5],
  },

  // ── Special / Hidden ──────────────────────────────────────────────────────
  {
    id: "witching_hour",
    title: "The Witching Hour",
    lore: "Some stories should only be written after midnight. She knows that now.",
    desc: "Generate a story between midnight and 3am.",
    icon: "🕛",
    rarity: "epic",
    xp: 60,
    hidden: true,
  },
  {
    id: "forged_in_shadow",
    title: "Forged in Shadow",
    lore: "The villain built from nothing was the most dangerous of them all.",
    desc: "Create a custom villain.",
    icon: "☠",
    rarity: "rare",
    xp: 25,
  },
];

// ── Storage ───────────────────────────────────────────────────────────────────

export function getUnlockedAchievements(): UnlockedAchievement[] {
  try { return JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) || "[]"); }
  catch { return []; }
}

export function getCompletedModes(): string[] {
  try { return JSON.parse(localStorage.getItem(MODE_COMPLETIONS_KEY) || "[]"); }
  catch { return []; }
}

export function recordModeCompletion(toolName: string): void {
  const existing = getCompletedModes();
  if (!existing.includes(toolName)) {
    localStorage.setItem(MODE_COMPLETIONS_KEY, JSON.stringify([...existing, toolName]));
  }
}

function saveUnlocked(list: UnlockedAchievement[]): void {
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(list));
}

export function getTotalXP(): number {
  const unlocked = new Set(getUnlockedAchievements().map((u) => u.id));
  return ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).reduce((s, a) => s + a.xp, 0);
}

export function getUnlockCount(): number {
  return getUnlockedAchievements().length;
}

// ── State Computation ─────────────────────────────────────────────────────────

function computeState(): AchievementCheckState {
  let archive: any[] = [];
  try { archive = JSON.parse(localStorage.getItem("sw_archive_v1") || "[]"); } catch {}

  let streakCount = 0;
  try {
    const s = JSON.parse(localStorage.getItem("sw_streak_v1") || "null");
    if (s) streakCount = s.count || 0;
  } catch {}

  let hasCustomVillain = false;
  try {
    const cv = JSON.parse(localStorage.getItem("sw_custom_villains_v1") || "[]");
    hasCustomVillain = Array.isArray(cv) && cv.length > 0;
  } catch {}

  const completedModes = getCompletedModes();

  const totalStories = archive.length;
  const totalWords = archive.reduce((sum: number, s: any) => sum + (s.wordCount || 0), 0);

  const heroines = new Set<string>();
  const villainCount = new Map<string, number>();

  for (const s of archive) {
    if (s.characters && Array.isArray(s.characters) && s.characters.length > 0) {
      heroines.add(s.characters[0]);
      if (s.characters[1]) {
        const v = s.characters[1];
        villainCount.set(v, (villainCount.get(v) || 0) + 1);
      }
    }
  }

  const maxVillainCount = villainCount.size > 0 ? Math.max(...Array.from(villainCount.values())) : 0;
  const specialistPlayed = SPECIALIST_TOOLS.filter((t) => completedModes.includes(t)).length;
  const primaryPlayed = PRIMARY_TOOLS.filter((t) => completedModes.includes(t)).length;

  const hour = new Date().getHours();
  const isLateNight = hour >= 0 && hour < 3;

  return {
    totalStories, totalWords, streakCount,
    heroineCount: heroines.size,
    maxVillainCount,
    specialistPlayed,
    primaryPlayed,
    hasCustomVillain,
    isLateNight,
    completedModes,
  };
}

// ── Check & Unlock ────────────────────────────────────────────────────────────

export function checkAndUnlockAchievements(): Achievement[] {
  const state = computeState();
  const alreadyUnlocked = new Set(getUnlockedAchievements().map((u) => u.id));
  const newlyUnlocked: Achievement[] = [];

  const checks: Record<string, boolean> = {
    first_inscription:    state.totalStories >= 1,
    shadow_initiate:      state.totalStories >= 5,
    keeper_of_darkness:   state.totalStories >= 25,
    architect_of_ruin:    state.totalStories >= 50,
    dark_chronicler:      state.totalStories >= 100,
    blood_on_page:        state.totalWords >= 5000,
    the_grimoire:         state.totalWords >= 20000,
    grand_tome:           state.totalWords >= 50000,
    shadow_weaver_title:  state.totalWords >= 100000,
    the_oath:             state.streakCount >= 3,
    bound_to_dark:        state.streakCount >= 7,
    no_mercy_no_dawn:     state.streakCount >= 14,
    eternal_contract:     state.streakCount >= 30,
    curious_darkness:     state.specialistPlayed >= 3,
    the_collector:        state.specialistPlayed >= 7,
    connoisseur_of_ruin:  state.specialistPlayed >= 12,
    master_of_shadows:    state.specialistPlayed >= 18,
    three_thrones:        state.primaryPlayed >= 3,
    mind_sculptor:        state.completedModes.includes("Mind Break Chamber"),
    the_hammer_falls:     state.completedModes.includes("Hero Auction"),
    corruptors_brand:     state.completedModes.includes("Corruption Arc"),
    blood_and_crowd:      state.completedModes.includes("Arena Mode"),
    protocol_acknowledged:state.completedModes.includes("The Handler"),
    the_patient_dark:     state.completedModes.includes("The Long Game"),
    drain_complete:       state.completedModes.includes("Power Drain Mode"),
    shattered_reflection: state.completedModes.includes("Dark Mirror"),
    pantheon_of_fallen:   state.heroineCount >= 10,
    devoted_captor:       state.maxVillainCount >= 5,
    witching_hour:        state.isLateNight && state.totalStories >= 1,
    forged_in_shadow:     state.hasCustomVillain,
  };

  for (const ach of ACHIEVEMENTS) {
    if (!alreadyUnlocked.has(ach.id) && checks[ach.id]) {
      newlyUnlocked.push(ach);
    }
  }

  if (newlyUnlocked.length > 0) {
    const existing = getUnlockedAchievements();
    const now = Date.now();
    saveUnlocked([...existing, ...newlyUnlocked.map((a) => ({ id: a.id, unlockedAt: now }))]);
    for (const ach of newlyUnlocked) {
      window.dispatchEvent(new CustomEvent("sw-achievement-unlocked", { detail: ach }));
    }
  }

  return newlyUnlocked;
}

export function getAchievementState(): AchievementCheckState {
  return computeState();
}
