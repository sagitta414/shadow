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
  maxHeroineCount: number;
  specialistPlayed: number;
  primaryPlayed: number;
  hasCustomVillain: boolean;
  isLateNight: boolean;
  completedModes: string[];
  unlockedCount: number;
  celebrityCount: number;
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
    id: "willing_subject",
    title: "Willing Subject",
    lore: "She stopped asking when it would end. That made things easier for everyone.",
    desc: "Save 10 stories.",
    icon: "🔒",
    rarity: "common",
    xp: 10,
    progress: (s) => [Math.min(s.totalStories, 10), 10],
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
  {
    id: "two_hundred_sins",
    title: "Two Hundred Sins",
    lore: "Each entry numbered. Each fall catalogued with precision. The shame is meticulous.",
    desc: "Save 200 stories.",
    icon: "📕",
    rarity: "legendary",
    xp: 200,
    progress: (s) => [Math.min(s.totalStories, 200), 200],
  },
  {
    id: "five_hundred_sins",
    title: "The Endless Ledger",
    lore: "Half a thousand entries and the ink shows no sign of running dry. Neither does the hunger.",
    desc: "Save 500 stories.",
    icon: "🗃",
    rarity: "legendary",
    xp: 300,
    progress: (s) => [Math.min(s.totalStories, 500), 500],
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
    id: "silk_and_ink",
    title: "Silk and Ink",
    lore: "Enough to fill a dossier. Enough to keep her quiet for a while.",
    desc: "Write 10,000 words.",
    icon: "🪶",
    rarity: "common",
    xp: 10,
    progress: (s) => [Math.min(s.totalWords, 10000), 10000],
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
  {
    id: "word_river",
    title: "The River Has No Shores",
    lore: "The current carries her. The current carries all of them. You only have to keep writing.",
    desc: "Write 200,000 words.",
    icon: "🌊",
    rarity: "legendary",
    xp: 200,
    progress: (s) => [Math.min(s.totalWords, 200000), 200000],
  },
  {
    id: "written_into_bone",
    title: "Written Into the Bone",
    lore: "Half a million words. She can no longer tell where the fiction ends and she begins.",
    desc: "Write 500,000 words.",
    icon: "💀",
    rarity: "legendary",
    xp: 300,
    progress: (s) => [Math.min(s.totalWords, 500000), 500000],
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
  {
    id: "property_of_time",
    title: "Property of Time",
    lore: "Two months of nightly ritual. Even the clock reports to you now.",
    desc: "Maintain a 60-day story streak.",
    icon: "⌛",
    rarity: "legendary",
    xp: 200,
    progress: (s) => [Math.min(s.streakCount, 60), 60],
  },
  {
    id: "irrevocably_his",
    title: "Irrevocably His",
    lore: "One hundred days. The contract rewrote itself while she wasn't looking. She never noticed the moment the door stopped being a door.",
    desc: "Maintain a 100-day story streak.",
    icon: "👑",
    rarity: "legendary",
    xp: 300,
    progress: (s) => [Math.min(s.streakCount, 100), 100],
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

  // ── Celebrity Captive ─────────────────────────────────────────────────────
  {
    id: "soft_opening",
    title: "Soft Opening",
    lore: "The first name off the list. The red carpet rolled out for a different kind of audience.",
    desc: "Complete your first Celebrity Captive story.",
    icon: "🎬",
    rarity: "common",
    xp: 10,
  },
  {
    id: "open_season",
    title: "Open Season",
    lore: "Five different names. Five different rooms. The selection process has no rules.",
    desc: "Complete 5 Celebrity Captive stories.",
    icon: "🎯",
    rarity: "rare",
    xp: 25,
    progress: (s) => [Math.min(s.celebrityCount, 5), 5],
  },
  {
    id: "celebrity_circuit",
    title: "The Celebrity Circuit",
    lore: "Ten encounters with real-world names. The casting couch has a different meaning here.",
    desc: "Complete 10 Celebrity Captive stories.",
    icon: "⭐",
    rarity: "epic",
    xp: 60,
    progress: (s) => [Math.min(s.celebrityCount, 10), 10],
  },

  // ── Specific Mode Trophies ────────────────────────────────────────────────
  {
    id: "mind_sculptor",
    title: "Mind Sculptor",
    lore: "She resisted until the architecture of her thoughts changed. He was patient about it.",
    desc: "Complete a Mind Break Chamber story.",
    icon: "🌀",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "the_hammer_falls",
    title: "The Hammer Falls",
    lore: "SOLD. The crowd didn't even hesitate. Neither did the bidder.",
    desc: "Complete a Hero Auction story.",
    icon: "⚖",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "corruptors_brand",
    title: "The Corruptor's Brand",
    lore: "By chapter seven, she stopped calling it corruption. By chapter ten, she stopped calling it anything.",
    desc: "Complete a Corruption Arc story.",
    icon: "🌑",
    rarity: "epic",
    xp: 60,
  },
  {
    id: "blood_and_crowd",
    title: "Blood & Crowd",
    lore: "The arena remembers every fighter. Every fall. Every name they stop using afterward.",
    desc: "Complete an Arena Mode story.",
    icon: "🏟",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "protocol_acknowledged",
    title: "Protocol Acknowledged",
    lore: "No supervillain required. The professional was sufficient. She was thorough about paperwork.",
    desc: "Complete a Handler Protocol story.",
    icon: "📁",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "the_patient_dark",
    title: "The Patient Dark",
    lore: "Time is the cruelest captor. He knew this from the start. She learned it slowly.",
    desc: "Complete a Long Game story.",
    icon: "⏳",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "drain_complete",
    title: "The Drain Complete",
    lore: "The last flicker of power left her at 3am. The silence after was absolute. She had nothing left to fight with.",
    desc: "Complete a Power Drain story.",
    icon: "⚡",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "shattered_reflection",
    title: "Shattered Reflection",
    lore: "The copy destroyed everything the original had built. She watched. The worst part was that she understood the copy better.",
    desc: "Complete a Dark Mirror story.",
    icon: "🪞",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "properly_broken_in",
    title: "Properly Broken In",
    lore: "She sits. She stays. She doesn't speak unless given permission. He was thorough about the conditioning.",
    desc: "Complete an Obedience Training story.",
    icon: "📋",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "on_display_for_all",
    title: "On Display for All",
    lore: "Every angle catalogued. Every reaction filed. The audience never ran out of opinions.",
    desc: "Complete a Showcase story.",
    icon: "🎭",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "community_asset",
    title: "Community Asset",
    lore: "The transfer of ownership completed without incident. She's public record now. Anyone can file a request.",
    desc: "Complete a Public Property story.",
    icon: "🔓",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "house_always_wins",
    title: "House Always Wins",
    lore: "The men with the money walked away richer. They always do. She was the pot.",
    desc: "Complete a Betting Pool story.",
    icon: "🎲",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "two_masters_one_prize",
    title: "Two Masters, One Prize",
    lore: "The argument over who had the first turn lasted longer than her resistance. They settled it politely.",
    desc: "Complete a Villain Team-Up story.",
    icon: "⚔",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "signed_and_transferred",
    title: "Signed and Transferred",
    lore: "Every handler left their mark before passing her along. By the end she had more marks than she could count.",
    desc: "Complete a Chain of Custody story.",
    icon: "🔗",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "no_one_is_coming",
    title: "No One Is Coming",
    lore: "She heard footsteps on the stairs. They walked past the door. The silence after was its own kind of answer.",
    desc: "Complete a Rescue Gone Wrong story.",
    icon: "🕸",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "group_discount",
    title: "Group Discount",
    lore: "He had enough left over for the rest of them too. The van had room. He always plans ahead.",
    desc: "Complete a Mass Capture story.",
    icon: "🗡",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "two_for_one",
    title: "Two for the Price of One",
    lore: "They held hands through the bars. That was the part he enjoyed most. It made the whole thing more efficient.",
    desc: "Complete a Two Heroines story.",
    icon: "⛓",
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
    id: "comprehensive_collection",
    title: "Comprehensive Collection",
    lore: "A quarter-century of different names. The dossier is thick enough to be a weapon now.",
    desc: "Write stories with 25 different heroines.",
    icon: "📚",
    rarity: "epic",
    xp: 80,
    progress: (s) => [Math.min(s.heroineCount, 25), 25],
  },
  {
    id: "full_roster",
    title: "The Full Roster",
    lore: "Every name. Every face. Every power and every weakness. He's worked through them all at least once.",
    desc: "Write stories with 50 different heroines.",
    icon: "🗂",
    rarity: "legendary",
    xp: 150,
    progress: (s) => [Math.min(s.heroineCount, 50), 50],
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
  {
    id: "obsession_manifest",
    title: "Obsession Manifest",
    lore: "Ten stories. The same cold smile. The same set of hands. She's starting to know his schedule.",
    desc: "Use the same villain 10+ times.",
    icon: "🔁",
    rarity: "epic",
    xp: 60,
    progress: (s) => [Math.min(s.maxVillainCount, 10), 10],
  },
  {
    id: "he_keeps_coming_back",
    title: "He Keeps Coming Back",
    lore: "Twenty encounters with the same face. She stopped pretending to be surprised. He stopped pretending it was business.",
    desc: "Use the same villain 20+ times.",
    icon: "👹",
    rarity: "legendary",
    xp: 150,
    progress: (s) => [Math.min(s.maxVillainCount, 20), 20],
  },
  {
    id: "favourite_specimen",
    title: "Favourite Specimen",
    lore: "He keeps coming back to the same one. She's starting to understand what it means when she hears the door.",
    desc: "Use the same heroine 10+ times.",
    icon: "📍",
    rarity: "epic",
    xp: 60,
    progress: (s) => [Math.min(s.maxHeroineCount, 10), 10],
  },
  {
    id: "the_compliant_one",
    title: "The Compliant One",
    lore: "Twenty stories with the same heroine. By now she barely needs to be told. The conditioning holds long after the story ends.",
    desc: "Use the same heroine 20+ times.",
    icon: "🔐",
    rarity: "legendary",
    xp: 150,
    progress: (s) => [Math.min(s.maxHeroineCount, 20), 20],
  },

  // ── Meta Achievements ─────────────────────────────────────────────────────
  {
    id: "below_the_surface",
    title: "Below the Surface",
    lore: "The deeper she sank, the less she looked for the surface. Ten trophies. She's stopped counting.",
    desc: "Unlock 10 achievements.",
    icon: "🌊",
    rarity: "rare",
    xp: 25,
    progress: (s) => [Math.min(s.unlockedCount, 10), 10],
  },
  {
    id: "the_grand_hall",
    title: "The Grand Hall of Shame",
    lore: "Portraits line the walls. Each frame holds a different ruin. Twenty frames. He hasn't run out of wall space.",
    desc: "Unlock 20 achievements.",
    icon: "🏛",
    rarity: "epic",
    xp: 60,
    progress: (s) => [Math.min(s.unlockedCount, 20), 20],
  },
  {
    id: "the_obsessive_record",
    title: "The Obsessive Record",
    lore: "Thirty trophies. The studio has become something else entirely. He built this one room at a time.",
    desc: "Unlock 30 achievements.",
    icon: "🏆",
    rarity: "legendary",
    xp: 150,
    progress: (s) => [Math.min(s.unlockedCount, 30), 30],
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
  {
    id: "the_sleepless",
    title: "The Sleepless",
    lore: "Sleep is for writers who feel guilty. The studio light stays on. The file stays open. The heroine doesn't get to sleep either.",
    desc: "Write a story after midnight with 100+ stories in your archive.",
    icon: "🌃",
    rarity: "legendary",
    xp: 100,
    hidden: true,
  },
  {
    id: "the_collector_obsessive",
    title: "The Collector's Mark",
    lore: "Every specialist mode. Every scenario. Every method of ruin — catalogued, executed, filed. Nothing left untried.",
    desc: "Complete every specialist mode at least once.",
    icon: "🏅",
    rarity: "legendary",
    xp: 200,
    hidden: true,
  },
  {
    id: "no_escape_route",
    title: "No Escape Route",
    lore: "She mapped every exit. He'd already sealed them. The archive proves she never found one.",
    desc: "Write stories featuring 5 different modes in a single week.",
    icon: "🚪",
    rarity: "epic",
    xp: 80,
    hidden: true,
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
  const unlockedCount = getUnlockedAchievements().length;

  const totalStories = archive.length;
  const totalWords = archive.reduce((sum: number, s: any) => sum + (s.wordCount || 0), 0);

  const heroines = new Set<string>();
  const villainCount = new Map<string, number>();
  const heroineCount = new Map<string, number>();
  let celebrityCount = 0;

  // Track weekly mode timestamps for no_escape_route
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentModes = new Set<string>();

  for (const s of archive) {
    // Celebrity captive count
    if (s.tool === "Celebrity Captive" || s.mode === "Celebrity Captive") {
      celebrityCount++;
    }

    // Mode diversity in last 7 days
    if (s.savedAt && s.savedAt > oneWeekAgo && s.tool) {
      recentModes.add(s.tool);
    }

    if (s.characters && Array.isArray(s.characters) && s.characters.length > 0) {
      const h = s.characters[0];
      heroines.add(h);
      heroineCount.set(h, (heroineCount.get(h) || 0) + 1);

      if (s.characters[1]) {
        const v = s.characters[1];
        villainCount.set(v, (villainCount.get(v) || 0) + 1);
      }
    }
  }

  const maxVillainCount = villainCount.size > 0 ? Math.max(...Array.from(villainCount.values())) : 0;
  const maxHeroineCount = heroineCount.size > 0 ? Math.max(...Array.from(heroineCount.values())) : 0;
  const specialistPlayed = SPECIALIST_TOOLS.filter((t) => completedModes.includes(t)).length;
  const primaryPlayed = PRIMARY_TOOLS.filter((t) => completedModes.includes(t)).length;

  const hour = new Date().getHours();
  const isLateNight = hour >= 0 && hour < 3;

  return {
    totalStories, totalWords, streakCount,
    heroineCount: heroines.size,
    maxVillainCount,
    maxHeroineCount,
    specialistPlayed,
    primaryPlayed,
    hasCustomVillain,
    isLateNight,
    completedModes,
    unlockedCount,
    celebrityCount,
  };
}

// ── Check & Unlock ────────────────────────────────────────────────────────────

export function checkAndUnlockAchievements(): Achievement[] {
  const state = computeState();
  const alreadyUnlocked = new Set(getUnlockedAchievements().map((u) => u.id));
  const newlyUnlocked: Achievement[] = [];

  // Compute weekly mode diversity
  let archive: any[] = [];
  try { archive = JSON.parse(localStorage.getItem("sw_archive_v1") || "[]"); } catch {}
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentModes = new Set<string>();
  for (const s of archive) {
    if (s.savedAt && s.savedAt > oneWeekAgo && s.tool) recentModes.add(s.tool);
  }

  const checks: Record<string, boolean> = {
    // Origin
    first_inscription:       state.totalStories >= 1,
    // Story count
    shadow_initiate:         state.totalStories >= 5,
    willing_subject:         state.totalStories >= 10,
    keeper_of_darkness:      state.totalStories >= 25,
    architect_of_ruin:       state.totalStories >= 50,
    dark_chronicler:         state.totalStories >= 100,
    two_hundred_sins:        state.totalStories >= 200,
    five_hundred_sins:       state.totalStories >= 500,
    // Word count
    blood_on_page:           state.totalWords >= 5000,
    silk_and_ink:            state.totalWords >= 10000,
    the_grimoire:            state.totalWords >= 20000,
    grand_tome:              state.totalWords >= 50000,
    shadow_weaver_title:     state.totalWords >= 100000,
    word_river:              state.totalWords >= 200000,
    written_into_bone:       state.totalWords >= 500000,
    // Streaks
    the_oath:                state.streakCount >= 3,
    bound_to_dark:           state.streakCount >= 7,
    no_mercy_no_dawn:        state.streakCount >= 14,
    eternal_contract:        state.streakCount >= 30,
    property_of_time:        state.streakCount >= 60,
    irrevocably_his:         state.streakCount >= 100,
    // Mode diversity
    curious_darkness:        state.specialistPlayed >= 3,
    the_collector:           state.specialistPlayed >= 7,
    connoisseur_of_ruin:     state.specialistPlayed >= 12,
    master_of_shadows:       state.specialistPlayed >= 18,
    // Primary
    three_thrones:           state.primaryPlayed >= 3,
    // Celebrity
    soft_opening:            state.completedModes.includes("Celebrity Captive"),
    open_season:             state.celebrityCount >= 5,
    celebrity_circuit:       state.celebrityCount >= 10,
    // Specific modes
    mind_sculptor:           state.completedModes.includes("Mind Break Chamber"),
    the_hammer_falls:        state.completedModes.includes("Hero Auction"),
    corruptors_brand:        state.completedModes.includes("Corruption Arc"),
    blood_and_crowd:         state.completedModes.includes("Arena Mode"),
    protocol_acknowledged:   state.completedModes.includes("The Handler"),
    the_patient_dark:        state.completedModes.includes("The Long Game"),
    drain_complete:          state.completedModes.includes("Power Drain Mode"),
    shattered_reflection:    state.completedModes.includes("Dark Mirror"),
    properly_broken_in:      state.completedModes.includes("Obedience Training"),
    on_display_for_all:      state.completedModes.includes("The Showcase"),
    community_asset:         state.completedModes.includes("Public Property"),
    house_always_wins:       state.completedModes.includes("Betting Pool"),
    two_masters_one_prize:   state.completedModes.includes("Villain Team-Up"),
    signed_and_transferred:  state.completedModes.includes("Chain of Custody"),
    no_one_is_coming:        state.completedModes.includes("Rescue Gone Wrong"),
    group_discount:          state.completedModes.includes("Mass Capture Mode"),
    two_for_one:             state.completedModes.includes("Two Heroines One Cell"),
    // Heroine / villain mastery
    pantheon_of_fallen:      state.heroineCount >= 10,
    comprehensive_collection:state.heroineCount >= 25,
    full_roster:             state.heroineCount >= 50,
    devoted_captor:          state.maxVillainCount >= 5,
    obsession_manifest:      state.maxVillainCount >= 10,
    he_keeps_coming_back:    state.maxVillainCount >= 20,
    favourite_specimen:      state.maxHeroineCount >= 10,
    the_compliant_one:       state.maxHeroineCount >= 20,
    // Meta
    below_the_surface:       state.unlockedCount >= 10,
    the_grand_hall:          state.unlockedCount >= 20,
    the_obsessive_record:    state.unlockedCount >= 30,
    // Special / hidden
    witching_hour:           state.isLateNight && state.totalStories >= 1,
    forged_in_shadow:        state.hasCustomVillain,
    the_sleepless:           state.isLateNight && state.totalStories >= 100,
    the_collector_obsessive: SPECIALIST_TOOLS.every((t) => state.completedModes.includes(t)),
    no_escape_route:         recentModes.size >= 5,
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
