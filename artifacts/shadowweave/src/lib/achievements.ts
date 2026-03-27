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
  uniqueVillainCount: number;
  specialistPlayed: number;
  primaryPlayed: number;
  hasCustomVillain: boolean;
  isLateNight: boolean;
  completedModes: string[];
  unlockedCount: number;
  celebrityCount: number;
  maxStoriesPerDay: number;
  maxSingleWordCount: number;
  pairedMaxCount: number;
  singleHeroineWords: number;
}

export const SPECIALIST_TOOLS: string[] = [
  "Mind Break Chamber", "Two Heroines One Cell", "Rescue Gone Wrong",
  "Power Drain Mode", "Mass Capture Mode", "Corruption Arc",
  "Hero Auction", "Trophy Display", "Obedience Training",
  "The Showcase", "Public Property", "Betting Pool",
  "Villain Team-Up", "Chain of Custody", "The Long Game",
  "Dark Mirror", "Arena Mode", "The Handler",
];

export const PRIMARY_TOOLS: string[] = [
  "Heroine Forge", "Celebrity Captive", "Custom Scenario",
];

export const ACHIEVEMENTS: Achievement[] = [

  // ── ORIGIN ────────────────────────────────────────────────────────────────
  {
    id: "first_inscription",
    title: "The Baptism",
    lore: "She didn't know what she was consenting to. Neither did he. That was the agreement.",
    desc: "Save your very first story.",
    icon: "🩸",
    rarity: "common",
    xp: 10,
  },

  // ── STORY COUNT ───────────────────────────────────────────────────────────
  {
    id: "shadow_initiate",
    title: "Five Notches",
    lore: "Five. The groove in the wood is beginning to form. He keeps track with something sharp.",
    desc: "Save 5 stories.",
    icon: "🌑",
    rarity: "common",
    xp: 10,
    progress: (s) => [Math.min(s.totalStories, 5), 5],
  },
  {
    id: "willing_subject",
    title: "Double Digits, Double Meaning",
    lore: "Ten entries. She stopped asking how many more around the seventh. He never answered anyway.",
    desc: "Save 10 stories.",
    icon: "🔒",
    rarity: "common",
    xp: 10,
    progress: (s) => [Math.min(s.totalStories, 10), 10],
  },
  {
    id: "keeper_of_darkness",
    title: "The Quarter-Hundred",
    lore: "Twenty-five documented descents. He filed them alphabetically. She does not know she's been alphabetised.",
    desc: "Save 25 stories.",
    icon: "🗝",
    rarity: "rare",
    xp: 25,
    progress: (s) => [Math.min(s.totalStories, 25), 25],
  },
  {
    id: "architect_of_ruin",
    title: "Half a Hundred Fallen",
    lore: "Fifty. At some point this stopped being a hobby and became infrastructure. He maintains it carefully.",
    desc: "Save 50 stories.",
    icon: "🏚",
    rarity: "epic",
    xp: 60,
    progress: (s) => [Math.min(s.totalStories, 50), 50],
  },
  {
    id: "dark_chronicler",
    title: "The Century",
    lore: "One hundred documented descents. The archive breathes on its own now. He barely has to feed it.",
    desc: "Save 100 stories.",
    icon: "📖",
    rarity: "legendary",
    xp: 150,
    progress: (s) => [Math.min(s.totalStories, 100), 100],
  },
  {
    id: "two_hundred_sins",
    title: "Two Hundred Names in the Ledger",
    lore: "Each one was someone's favourite heroine. Each one has a number. He keeps the ledger under lock.",
    desc: "Save 200 stories.",
    icon: "📕",
    rarity: "legendary",
    xp: 200,
    progress: (s) => [Math.min(s.totalStories, 200), 200],
  },
  {
    id: "five_hundred_sins",
    title: "The Library of Ruin",
    lore: "Five hundred. A proper library requires a proper catalogue. He has both. The index alone fills a separate binder.",
    desc: "Save 500 stories.",
    icon: "🗃",
    rarity: "legendary",
    xp: 300,
    progress: (s) => [Math.min(s.totalStories, 500), 500],
  },
  {
    id: "thousand_stories",
    title: "One Thousand. Not One She Chose.",
    lore: "A thousand stories. Not a single ending she negotiated. The thousandth was indistinguishable from the first.",
    desc: "Save 1,000 stories.",
    icon: "💠",
    rarity: "legendary",
    xp: 500,
    progress: (s) => [Math.min(s.totalStories, 1000), 1000],
  },

  // ── WORD COUNT ────────────────────────────────────────────────────────────
  {
    id: "blood_on_page",
    title: "First Wound",
    lore: "Eight thousand words. Not a drop was unintentional. Each one costs her something she can't name.",
    desc: "Write 8,000 words across all stories.",
    icon: "✍",
    rarity: "common",
    xp: 10,
    progress: (s) => [Math.min(s.totalWords, 8000), 8000],
  },
  {
    id: "silk_and_ink",
    title: "The Dossier Grows Thick",
    lore: "Twenty thousand words. The folder no longer sits flat. He keeps it rubber-banded.",
    desc: "Write 20,000 words.",
    icon: "🪶",
    rarity: "rare",
    xp: 25,
    progress: (s) => [Math.min(s.totalWords, 20000), 20000],
  },
  {
    id: "the_grimoire",
    title: "The Tome of Methods",
    lore: "Fifty thousand words — a reference manual for her undoing, cross-referenced by heroine and circumstance.",
    desc: "Write 50,000 words.",
    icon: "📜",
    rarity: "epic",
    xp: 60,
    progress: (s) => [Math.min(s.totalWords, 50000), 50000],
  },
  {
    id: "grand_tome",
    title: "The Grand Ledger",
    lore: "One hundred thousand words of detailed, sustained ruin. Certain libraries would shelve this in restricted access.",
    desc: "Write 100,000 words.",
    icon: "🔮",
    rarity: "legendary",
    xp: 100,
    progress: (s) => [Math.min(s.totalWords, 100000), 100000],
  },
  {
    id: "shadow_weaver_title",
    title: "Six Figures of Shame",
    lore: "Two hundred thousand words. Some novels are shorter. None of them end like these do.",
    desc: "Write 200,000 words.",
    icon: "🕸",
    rarity: "legendary",
    xp: 150,
    progress: (s) => [Math.min(s.totalWords, 200000), 200000],
  },
  {
    id: "word_river",
    title: "Drowning in the Archive",
    lore: "Four hundred thousand words. She is somewhere in all of it — unnamed, unnumbered, everywhere.",
    desc: "Write 400,000 words.",
    icon: "🌊",
    rarity: "legendary",
    xp: 250,
    progress: (s) => [Math.min(s.totalWords, 400000), 400000],
  },
  {
    id: "written_into_bone",
    title: "The Unforgivable Archive",
    lore: "Seven hundred and fifty thousand words. She exists now only inside this. She was the raw material all along.",
    desc: "Write 750,000 words.",
    icon: "💀",
    rarity: "legendary",
    xp: 350,
    progress: (s) => [Math.min(s.totalWords, 750000), 750000],
  },
  {
    id: "one_million_words",
    title: "One Million Words of Her Ruin",
    lore: "A million words. No publisher would touch it. He doesn't need one. The archive is its own audience.",
    desc: "Write 1,000,000 words.",
    icon: "🌌",
    rarity: "legendary",
    xp: 600,
    progress: (s) => [Math.min(s.totalWords, 1000000), 1000000],
  },
  {
    id: "devoted_documentation",
    title: "Devoted Documentation",
    lore: "Sixty thousand words about a single heroine. He knows her better than she knows herself. He has a map of her breaking points.",
    desc: "Write 60,000 words featuring a single heroine across all stories.",
    icon: "📍",
    rarity: "epic",
    xp: 80,
    progress: (s) => [Math.min(s.singleHeroineWords, 60000), 60000],
  },

  // ── STREAKS ───────────────────────────────────────────────────────────────
  {
    id: "the_oath",
    title: "Five Consecutive Nights",
    lore: "Five. The habit was always going to stick. He recognised it before she did.",
    desc: "Maintain a 5-day story streak.",
    icon: "⚔",
    rarity: "common",
    xp: 10,
    progress: (s) => [Math.min(s.streakCount, 5), 5],
  },
  {
    id: "bound_to_dark",
    title: "Ten Days of Her",
    lore: "Ten consecutive nights. She is in the routine whether she agreed to it or not.",
    desc: "Maintain a 10-day story streak.",
    icon: "⛓",
    rarity: "rare",
    xp: 30,
    progress: (s) => [Math.min(s.streakCount, 10), 10],
  },
  {
    id: "no_mercy_no_dawn",
    title: "Three Weeks Running",
    lore: "Twenty-one days. Three full weeks of the same dark ritual, same time, same chair, same purpose.",
    desc: "Maintain a 21-day story streak.",
    icon: "🌘",
    rarity: "epic",
    xp: 70,
    progress: (s) => [Math.min(s.streakCount, 21), 21],
  },
  {
    id: "eternal_contract",
    title: "Forty-Five Nights Unbroken",
    lore: "Forty-five. She has lived inside six weeks of his attention. The calendar has her name pencilled in.",
    desc: "Maintain a 45-day story streak.",
    icon: "🔱",
    rarity: "legendary",
    xp: 175,
    progress: (s) => [Math.min(s.streakCount, 45), 45],
  },
  {
    id: "property_of_time",
    title: "Three Months of Custody",
    lore: "Ninety days. The season changed around her. She did not notice. She was occupied.",
    desc: "Maintain a 90-day story streak.",
    icon: "⌛",
    rarity: "legendary",
    xp: 250,
    progress: (s) => [Math.min(s.streakCount, 90), 90],
  },
  {
    id: "irrevocably_his",
    title: "Half a Year Belongs to Her",
    lore: "One hundred eighty nights. Six months of unbroken custody. The door was repurposed as a wall somewhere in month four.",
    desc: "Maintain a 180-day story streak.",
    icon: "👑",
    rarity: "legendary",
    xp: 400,
    progress: (s) => [Math.min(s.streakCount, 180), 180],
  },
  {
    id: "year_of_ruin",
    title: "The Full Year",
    lore: "Three hundred sixty-five nights. She is the calendar. Every date has her name in the margin.",
    desc: "Maintain a 365-day story streak.",
    icon: "🗓",
    rarity: "legendary",
    xp: 750,
    progress: (s) => [Math.min(s.streakCount, 365), 365],
  },

  // ── MODE DIVERSITY ────────────────────────────────────────────────────────
  {
    id: "curious_darkness",
    title: "First Three Rooms",
    lore: "She opened three different doors. Not one of them led out. He built the floor plan that way.",
    desc: "Play 3 different specialist modes.",
    icon: "🔦",
    rarity: "common",
    xp: 10,
    progress: (s) => [Math.min(s.specialistPlayed, 3), 3],
  },
  {
    id: "the_collector",
    title: "Ten Chambers",
    lore: "Ten specialist methods documented. Ten very different ways to arrive at the same conclusion.",
    desc: "Play 10 different specialist modes.",
    icon: "📌",
    rarity: "rare",
    xp: 30,
    progress: (s) => [Math.min(s.specialistPlayed, 10), 10],
  },
  {
    id: "connoisseur_of_ruin",
    title: "The Refined Palate",
    lore: "Fifteen modes. He has developed preferences. He knows which methods produce the most interesting results.",
    desc: "Play 15 different specialist modes.",
    icon: "🎭",
    rarity: "epic",
    xp: 70,
    progress: (s) => [Math.min(s.specialistPlayed, 15), 15],
  },
  {
    id: "master_of_shadows",
    title: "The Complete Taxonomy",
    lore: "All eighteen. Every known form of ruin practiced, documented, filed. The methodology is now encyclopedic.",
    desc: "Play all 18 specialist modes.",
    icon: "👁",
    rarity: "legendary",
    xp: 200,
    progress: (s) => [Math.min(s.specialistPlayed, 18), 18],
  },

  // ── THREE PRIMARY MODES ───────────────────────────────────────────────────
  {
    id: "three_thrones",
    title: "Three Seats of Power",
    lore: "The forge, the captive chamber, the blank page — all three occupied. None of the chairs are hers.",
    desc: "Play all 3 primary story modes.",
    icon: "⚜",
    rarity: "rare",
    xp: 30,
    progress: (s) => [Math.min(s.primaryPlayed, 3), 3],
  },

  // ── CELEBRITY CAPTIVE ─────────────────────────────────────────────────────
  {
    id: "soft_opening",
    title: "The First Real Name",
    lore: "A real name. Not a character — the person who plays her. The list is longer than she would expect.",
    desc: "Complete your first Celebrity Captive story.",
    icon: "🎬",
    rarity: "common",
    xp: 10,
  },
  {
    id: "open_season",
    title: "Ten Off the List",
    lore: "Ten real names. The list is laminated now. He crosses them off with something deliberate.",
    desc: "Complete 10 Celebrity Captive stories.",
    icon: "🎯",
    rarity: "rare",
    xp: 35,
    progress: (s) => [Math.min(s.celebrityCount, 10), 10],
  },
  {
    id: "celebrity_circuit",
    title: "The Full Red Carpet of Ruin",
    lore: "Twenty-five names. The event was extended three times. The velvet rope is still up. It always will be.",
    desc: "Complete 25 Celebrity Captive stories.",
    icon: "⭐",
    rarity: "epic",
    xp: 80,
    progress: (s) => [Math.min(s.celebrityCount, 25), 25],
  },
  {
    id: "celebrity_archive",
    title: "The Comprehensive Blacklist",
    lore: "Fifty real names filed and processed. The dossier is thick enough to require a second shelf.",
    desc: "Complete 50 Celebrity Captive stories.",
    icon: "🗂",
    rarity: "legendary",
    xp: 200,
    progress: (s) => [Math.min(s.celebrityCount, 50), 50],
  },

  // ── SPECIFIC MODE TROPHIES ────────────────────────────────────────────────
  {
    id: "mind_sculptor",
    title: "Architect of Collapse",
    lore: "She built walls inside her own mind to protect herself. He found every one. He brought his own tools.",
    desc: "Complete a Mind Break Chamber story.",
    icon: "🌀",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "the_hammer_falls",
    title: "Sold to the Highest Silence",
    lore: "The bidder didn't say a word. He simply raised the card. She went for less than she was worth. He knew she would.",
    desc: "Complete a Hero Auction story.",
    icon: "⚖",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "corruptors_brand",
    title: "The Long Rewrite",
    lore: "She used to have a different set of values. He kept notes on where each one broke. The notes are annotated.",
    desc: "Complete a Corruption Arc story.",
    icon: "🌑",
    rarity: "epic",
    xp: 60,
  },
  {
    id: "blood_and_crowd",
    title: "The Crowd Gets What It Paid For",
    lore: "They chanted for ruin. He delivered on time. She was the programme — printed, distributed, collected afterward.",
    desc: "Complete an Arena Mode story.",
    icon: "🏟",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "protocol_acknowledged",
    title: "Clean Paperwork, Dirty Business",
    lore: "Every form filed correctly. Every box ticked. The professional does not improvise. She was in the brief.",
    desc: "Complete a Handler Protocol story.",
    icon: "📁",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "the_patient_dark",
    title: "The Slow Harvest",
    lore: "He planted in the first chapter. He harvested in the last. She spent the middle not realising what was being grown.",
    desc: "Complete a Long Game story.",
    icon: "⏳",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "drain_complete",
    title: "Zero Reserves",
    lore: "The gauge read empty at 3:17am. She checked it six more times. The gauge did not change its opinion.",
    desc: "Complete a Power Drain story.",
    icon: "⚡",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "shattered_reflection",
    title: "The Better Version",
    lore: "The copy walked out with everything the original had built. She watched through the glass. The worst part was she understood the copy better.",
    desc: "Complete a Dark Mirror story.",
    icon: "🪞",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "properly_broken_in",
    title: "The Conditioning Holds",
    lore: "She answers to her number now. He stopped using her name somewhere in the second session. The number is more precise.",
    desc: "Complete an Obedience Training story.",
    icon: "📋",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "on_display_for_all",
    title: "The Exhibition",
    lore: "Every angle. Every reaction catalogued and filed. The audience rotated. She did not get to.",
    desc: "Complete a Showcase story.",
    icon: "🖼",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "community_asset",
    title: "Property of Record",
    lore: "The paperwork assigned her a registration number. She is categorised, catalogued, and made available pending request.",
    desc: "Complete a Public Property story.",
    icon: "🔓",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "house_always_wins",
    title: "The Stakes Were Her",
    lore: "Every chip on the table was borrowed from her. The house raked the pot and did not offer receipts. She was always the margin.",
    desc: "Complete a Betting Pool story.",
    icon: "🎲",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "two_masters_one_prize",
    title: "Shared Acquisition",
    lore: "They argued jurisdiction for three minutes. It was settled with a coin. She was heads. The coin was already in his hand.",
    desc: "Complete a Villain Team-Up story.",
    icon: "⚔",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "signed_and_transferred",
    title: "Chain of Possession",
    lore: "The manifest listed her between the cargo. Signed out. Signed in. Signed out again. She accumulated signatures.",
    desc: "Complete a Chain of Custody story.",
    icon: "🔗",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "no_one_is_coming",
    title: "The Unreliable Rescue",
    lore: "She heard them on the stairs. She called out. She was mistaken about what they were there for.",
    desc: "Complete a Rescue Gone Wrong story.",
    icon: "🕸",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "group_discount",
    title: "Bulk Acquisition",
    lore: "Efficiency is a virtue. One operation, multiple outcomes. The van had four seatbelts it did not need.",
    desc: "Complete a Mass Capture story.",
    icon: "🗡",
    rarity: "rare",
    xp: 25,
  },
  {
    id: "two_for_one",
    title: "The Pair",
    lore: "They tried to comfort each other through the bars. He documented it. The tenderness made the rest more effective.",
    desc: "Complete a Two Heroines story.",
    icon: "⛓",
    rarity: "rare",
    xp: 25,
  },

  // ── HEROINE & VILLAIN MASTERY ─────────────────────────────────────────────
  {
    id: "pantheon_of_fallen",
    title: "Ten Types of Ruin",
    lore: "Ten heroines. Ten entirely different ways to fall. He has a category for each. He has been adding sub-categories.",
    desc: "Write stories with 10 different heroines.",
    icon: "🗿",
    rarity: "epic",
    xp: 60,
    progress: (s) => [Math.min(s.heroineCount, 10), 10],
  },
  {
    id: "comprehensive_collection",
    title: "Thirty-Five Documented",
    lore: "A third of a hundred heroines filed, studied, processed. The portfolio requires its own shelf.",
    desc: "Write stories with 35 different heroines.",
    icon: "📚",
    rarity: "epic",
    xp: 90,
    progress: (s) => [Math.min(s.heroineCount, 35), 35],
  },
  {
    id: "full_roster",
    title: "The Seventy-Five",
    lore: "Seventy-five heroines processed. Not one returned the same way they arrived. He noted the differences.",
    desc: "Write stories with 75 different heroines.",
    icon: "🗂",
    rarity: "legendary",
    xp: 200,
    progress: (s) => [Math.min(s.heroineCount, 75), 75],
  },
  {
    id: "devoted_captor",
    title: "The Returning Face",
    lore: "Eight visits. He wears the same expression every time. She has started to recognise it before the door opens.",
    desc: "Use the same villain 8+ times.",
    icon: "🎯",
    rarity: "rare",
    xp: 30,
    progress: (s) => [Math.min(s.maxVillainCount, 8), 8],
  },
  {
    id: "obsession_manifest",
    title: "Fifteen Encounters, One Face",
    lore: "Fifteen times with the same villain. He has mapped every expression she makes under sustained pressure. He calls it a reference.",
    desc: "Use the same villain 15+ times.",
    icon: "🔁",
    rarity: "epic",
    xp: 70,
    progress: (s) => [Math.min(s.maxVillainCount, 15), 15],
  },
  {
    id: "he_keeps_coming_back",
    title: "Thirty-Five Returns",
    lore: "Thirty-five visits from the same presence. He has never once been satisfied with just one encounter. She's stopped expecting it to end.",
    desc: "Use the same villain 35+ times.",
    icon: "👹",
    rarity: "legendary",
    xp: 175,
    progress: (s) => [Math.min(s.maxVillainCount, 35), 35],
  },
  {
    id: "villain_monopoly",
    title: "The Exclusive Partnership",
    lore: "Fifty stories, one villain. He claimed her exclusively somewhere around story twelve. She just didn't have the vocabulary for it yet.",
    desc: "Use the same villain 50+ times.",
    icon: "🕯",
    rarity: "legendary",
    xp: 350,
    progress: (s) => [Math.min(s.maxVillainCount, 50), 50],
  },
  {
    id: "favourite_specimen",
    title: "The Preferred Subject",
    lore: "Fifteen stories, one heroine. She is the default now. She has become the standard against which the others are measured.",
    desc: "Use the same heroine 15+ times.",
    icon: "📌",
    rarity: "epic",
    xp: 70,
    progress: (s) => [Math.min(s.maxHeroineCount, 15), 15],
  },
  {
    id: "the_compliant_one",
    title: "Forty Entries, Same Name",
    lore: "Forty stories. Same heroine. She stopped being a superhero somewhere in the second decade of encounters. He marked the exact story.",
    desc: "Use the same heroine 40+ times.",
    icon: "🔐",
    rarity: "legendary",
    xp: 200,
    progress: (s) => [Math.min(s.maxHeroineCount, 40), 40],
  },
  {
    id: "rogues_gallery",
    title: "The Rogues' Gallery",
    lore: "Ten distinct villains across the archive. He has been auditioning. The competition was not disclosed to the heroines.",
    desc: "Use 10 different villains across your archive.",
    icon: "🎭",
    rarity: "rare",
    xp: 35,
    progress: (s) => [Math.min(s.uniqueVillainCount, 10), 10],
  },
  {
    id: "full_catalogue_villains",
    title: "The Full Catalogue",
    lore: "Twenty distinct methods of evil applied across the archive. The variety is deliberate. The results are compared.",
    desc: "Use 20 different villains across your archive.",
    icon: "📋",
    rarity: "epic",
    xp: 80,
    progress: (s) => [Math.min(s.uniqueVillainCount, 20), 20],
  },
  {
    id: "ritual_pairing",
    title: "Ritual Pairing",
    lore: "Five times — the same heroine, the same villain. The combination has been validated. He returns to it the way a surgeon returns to a preferred technique.",
    desc: "Write 5 stories with the same heroine & villain pairing.",
    icon: "🔗",
    rarity: "rare",
    xp: 40,
    progress: (s) => [Math.min(s.pairedMaxCount, 5), 5],
  },
  {
    id: "matched_set",
    title: "The Matched Set",
    lore: "Fifteen entries: same heroine, same villain. It is a series now. He has an outline. She does not know about the outline.",
    desc: "Write 15 stories with the same heroine & villain pairing.",
    icon: "♾",
    rarity: "epic",
    xp: 100,
    progress: (s) => [Math.min(s.pairedMaxCount, 15), 15],
  },
  {
    id: "devoted_partnership",
    title: "The Standing Appointment",
    lore: "Thirty entries. Same name, same face, every time. It is no longer a choice — it is a compulsion. It is written in the schedule in ink.",
    desc: "Write 30 stories with the same heroine & villain pairing.",
    icon: "💍",
    rarity: "legendary",
    xp: 250,
    progress: (s) => [Math.min(s.pairedMaxCount, 30), 30],
  },

  // ── META ACHIEVEMENTS ─────────────────────────────────────────────────────
  {
    id: "below_the_surface",
    title: "Fifteen Trophies Deep",
    lore: "The further she sinks, the quieter the surface becomes. Fifteen trophies. She has stopped looking up.",
    desc: "Unlock 15 achievements.",
    icon: "🌊",
    rarity: "rare",
    xp: 30,
    progress: (s) => [Math.min(s.unlockedCount, 15), 15],
  },
  {
    id: "the_grand_hall",
    title: "The Gallery Fills",
    lore: "Thirty commendations. The walls are running out of space. He has ordered a second wing.",
    desc: "Unlock 30 achievements.",
    icon: "🏛",
    rarity: "epic",
    xp: 70,
    progress: (s) => [Math.min(s.unlockedCount, 30), 30],
  },
  {
    id: "the_obsessive_record",
    title: "Fifty Documented Achievements",
    lore: "Fifty. The obsession has its own taxonomy now. The catalogue of accomplishments is stored next to the catalogue of names.",
    desc: "Unlock 50 achievements.",
    icon: "🏆",
    rarity: "legendary",
    xp: 200,
    progress: (s) => [Math.min(s.unlockedCount, 50), 50],
  },
  {
    id: "masters_collection",
    title: "The Master's Collection",
    lore: "Seventy-five trophies. He has built something that cannot be casually assembled. Every one required sustained, deliberate attention.",
    desc: "Unlock 75 achievements.",
    icon: "🌟",
    rarity: "legendary",
    xp: 400,
    progress: (s) => [Math.min(s.unlockedCount, 75), 75],
  },

  // ── SPECIAL / HIDDEN ──────────────────────────────────────────────────────
  {
    id: "witching_hour",
    title: "The Hour She Doesn't Sleep Either",
    lore: "Written between midnight and 3am. Some darkness is exclusive to that window. So is this.",
    desc: "Generate a story between midnight and 3am.",
    icon: "🕛",
    rarity: "epic",
    xp: 60,
    hidden: true,
  },
  {
    id: "forged_in_shadow",
    title: "The Villain Architect",
    lore: "He built the threat from nothing. Custom-designed, named, armed with specific knowledge. The most dangerous ones are always bespoke.",
    desc: "Create a custom villain.",
    icon: "☠",
    rarity: "rare",
    xp: 30,
  },
  {
    id: "the_sleepless",
    title: "No Rest for the Wicked",
    lore: "After midnight, two hundred stories in the archive. The studio never closed. The heroine in tonight's story doesn't get to close her eyes either.",
    desc: "Write a story after midnight with 200+ stories in your archive.",
    icon: "🌃",
    rarity: "legendary",
    xp: 150,
    hidden: true,
  },
  {
    id: "the_collector_obsessive",
    title: "The Full Taxonomy",
    lore: "Every specialist mode. Every method of ruin catalogued, executed, and filed. The curriculum is complete. There is no next class.",
    desc: "Complete every single specialist mode at least once.",
    icon: "🏅",
    rarity: "legendary",
    xp: 250,
    hidden: true,
  },
  {
    id: "no_escape_route",
    title: "Every Door Sealed",
    lore: "Eight different modes in a single week. She tried them all. None of them led to the same exit. None of them led to any exit.",
    desc: "Play 8 different story modes in a single week.",
    icon: "🚪",
    rarity: "epic",
    xp: 100,
    hidden: true,
  },
  {
    id: "single_story_marathon",
    title: "The Endurance Session",
    lore: "Two thousand words. One uninterrupted session. She didn't get a break. He didn't take one either. The story ran until it was done.",
    desc: "Write a single story over 2,000 words.",
    icon: "⏱",
    rarity: "rare",
    xp: 40,
    hidden: true,
    progress: (s) => [Math.min(s.maxSingleWordCount, 2000), 2000],
  },
  {
    id: "single_story_epic",
    title: "The Full Treatment",
    lore: "Four thousand words. A novella's worth of sustained ruin in a single document. She was exhausted before the third act. The story wasn't.",
    desc: "Write a single story over 4,000 words.",
    icon: "📰",
    rarity: "epic",
    xp: 90,
    hidden: true,
    progress: (s) => [Math.min(s.maxSingleWordCount, 4000), 4000],
  },
  {
    id: "novel_length",
    title: "Chapter and Verse of Her Undoing",
    lore: "Eight thousand words in a single story. Not a chapter — the entire book. Every verse devoted to exactly one subject.",
    desc: "Write a single story over 8,000 words.",
    icon: "📗",
    rarity: "legendary",
    xp: 200,
    hidden: true,
    progress: (s) => [Math.min(s.maxSingleWordCount, 8000), 8000],
  },
  {
    id: "five_in_one_day",
    title: "The Productive Evening",
    lore: "Five stories. One calendar day. He calls it efficiency. She would call it something else. He hasn't asked her.",
    desc: "Write 5 stories in a single day.",
    icon: "🌙",
    rarity: "epic",
    xp: 80,
    hidden: true,
    progress: (s) => [Math.min(s.maxStoriesPerDay, 5), 5],
  },
  {
    id: "ten_in_one_day",
    title: "The Session That Never Ended",
    lore: "Ten stories. One day. He sat down in daylight and stood up in a different one. The heroines are blurring together. He is not bothered by this.",
    desc: "Write 10 stories in a single day.",
    icon: "🔥",
    rarity: "legendary",
    xp: 200,
    hidden: true,
    progress: (s) => [Math.min(s.maxStoriesPerDay, 10), 10],
  },
  {
    id: "deep_obsession",
    title: "The Irreversible Preference",
    lore: "The same heroine and the same villain, twenty times. The pairing has been tested in every configuration. He has decided it is optimal.",
    desc: "Write 20 stories with the exact same heroine & villain pairing.",
    icon: "🧿",
    rarity: "legendary",
    xp: 175,
    hidden: true,
    progress: (s) => [Math.min(s.pairedMaxCount, 20), 20],
  },
  {
    id: "three_am_regular",
    title: "The Regular at 3am",
    lore: "The screen at 3am does not judge. Neither does the cursor. It simply waits and then accepts whatever is given to it.",
    desc: "Write stories after midnight on 5 separate occasions.",
    icon: "🌑",
    rarity: "epic",
    xp: 80,
    hidden: true,
  },
];

// ── STORAGE ───────────────────────────────────────────────────────────────────

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

// ── STATE COMPUTATION ─────────────────────────────────────────────────────────

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
  const villains = new Set<string>();
  const villainCount = new Map<string, number>();
  const heroineCount = new Map<string, number>();
  const heroineWords = new Map<string, number>();
  const pairedCount = new Map<string, number>();
  const storiesPerDay = new Map<string, number>();
  let celebrityCount = 0;
  let maxSingleWordCount = 0;

  // Weekly mode tracking
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentModes = new Set<string>();

  // Midnight sessions tracking
  let midnightSessions = 0;
  const midnightDays = new Set<string>();

  for (const s of archive) {
    if (s.tool === "Celebrity Captive" || s.mode === "Celebrity Captive") {
      celebrityCount++;
    }
    if (s.savedAt && s.savedAt > oneWeekAgo && s.tool) {
      recentModes.add(s.tool);
    }

    // Per-day counts
    if (s.savedAt) {
      const dayKey = new Date(s.savedAt).toDateString();
      storiesPerDay.set(dayKey, (storiesPerDay.get(dayKey) || 0) + 1);
      const hour = new Date(s.savedAt).getHours();
      if (hour >= 0 && hour < 3 && !midnightDays.has(dayKey)) {
        midnightDays.add(dayKey);
        midnightSessions++;
      }
    }

    // Single story word count
    if (s.wordCount && s.wordCount > maxSingleWordCount) {
      maxSingleWordCount = s.wordCount;
    }

    if (s.characters && Array.isArray(s.characters) && s.characters.length > 0) {
      const h = s.characters[0];
      heroines.add(h);
      heroineCount.set(h, (heroineCount.get(h) || 0) + 1);
      heroineWords.set(h, (heroineWords.get(h) || 0) + (s.wordCount || 0));

      if (s.characters[1]) {
        const v = s.characters[1];
        villains.add(v);
        villainCount.set(v, (villainCount.get(v) || 0) + 1);

        const pairKey = `${h}|||${v}`;
        pairedCount.set(pairKey, (pairedCount.get(pairKey) || 0) + 1);
      }
    }
  }

  const maxVillainCount = villainCount.size > 0 ? Math.max(...Array.from(villainCount.values())) : 0;
  const maxHeroineCount = heroineCount.size > 0 ? Math.max(...Array.from(heroineCount.values())) : 0;
  const singleHeroineWords = heroineWords.size > 0 ? Math.max(...Array.from(heroineWords.values())) : 0;
  const pairedMaxCount = pairedCount.size > 0 ? Math.max(...Array.from(pairedCount.values())) : 0;
  const maxStoriesPerDay = storiesPerDay.size > 0 ? Math.max(...Array.from(storiesPerDay.values())) : 0;
  const specialistPlayed = SPECIALIST_TOOLS.filter((t) => completedModes.includes(t)).length;
  const primaryPlayed = PRIMARY_TOOLS.filter((t) => completedModes.includes(t)).length;

  const hour = new Date().getHours();
  const isLateNight = hour >= 0 && hour < 3;

  return {
    totalStories, totalWords, streakCount,
    heroineCount: heroines.size,
    maxVillainCount,
    maxHeroineCount,
    uniqueVillainCount: villains.size,
    specialistPlayed,
    primaryPlayed,
    hasCustomVillain,
    isLateNight,
    completedModes,
    unlockedCount,
    celebrityCount,
    maxStoriesPerDay,
    maxSingleWordCount,
    pairedMaxCount,
    singleHeroineWords,
  };
}

// ── CHECK & UNLOCK ────────────────────────────────────────────────────────────

export function checkAndUnlockAchievements(): Achievement[] {
  const state = computeState();
  const alreadyUnlocked = new Set(getUnlockedAchievements().map((u) => u.id));
  const newlyUnlocked: Achievement[] = [];

  // Weekly mode diversity
  let archive: any[] = [];
  try { archive = JSON.parse(localStorage.getItem("sw_archive_v1") || "[]"); } catch {}
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentModes = new Set<string>();
  for (const s of archive) {
    if (s.savedAt && s.savedAt > oneWeekAgo && s.tool) recentModes.add(s.tool);
  }

  // Midnight sessions count
  let midnightSessions = 0;
  const midnightDays = new Set<string>();
  for (const s of archive) {
    if (s.savedAt) {
      const hour = new Date(s.savedAt).getHours();
      const dayKey = new Date(s.savedAt).toDateString();
      if (hour >= 0 && hour < 3 && !midnightDays.has(dayKey)) {
        midnightDays.add(dayKey);
        midnightSessions++;
      }
    }
  }

  const checks: Record<string, boolean> = {
    // Origin
    first_inscription:          state.totalStories >= 1,
    // Story count
    shadow_initiate:            state.totalStories >= 5,
    willing_subject:            state.totalStories >= 10,
    keeper_of_darkness:         state.totalStories >= 25,
    architect_of_ruin:          state.totalStories >= 50,
    dark_chronicler:            state.totalStories >= 100,
    two_hundred_sins:           state.totalStories >= 200,
    five_hundred_sins:          state.totalStories >= 500,
    thousand_stories:           state.totalStories >= 1000,
    // Word count
    blood_on_page:              state.totalWords >= 8000,
    silk_and_ink:               state.totalWords >= 20000,
    the_grimoire:               state.totalWords >= 50000,
    grand_tome:                 state.totalWords >= 100000,
    shadow_weaver_title:        state.totalWords >= 200000,
    word_river:                 state.totalWords >= 400000,
    written_into_bone:          state.totalWords >= 750000,
    one_million_words:          state.totalWords >= 1000000,
    devoted_documentation:      state.singleHeroineWords >= 60000,
    // Streaks
    the_oath:                   state.streakCount >= 5,
    bound_to_dark:              state.streakCount >= 10,
    no_mercy_no_dawn:           state.streakCount >= 21,
    eternal_contract:           state.streakCount >= 45,
    property_of_time:           state.streakCount >= 90,
    irrevocably_his:            state.streakCount >= 180,
    year_of_ruin:               state.streakCount >= 365,
    // Mode diversity
    curious_darkness:           state.specialistPlayed >= 3,
    the_collector:              state.specialistPlayed >= 10,
    connoisseur_of_ruin:        state.specialistPlayed >= 15,
    master_of_shadows:          state.specialistPlayed >= 18,
    // Primary
    three_thrones:              state.primaryPlayed >= 3,
    // Celebrity
    soft_opening:               state.completedModes.includes("Celebrity Captive"),
    open_season:                state.celebrityCount >= 10,
    celebrity_circuit:          state.celebrityCount >= 25,
    celebrity_archive:          state.celebrityCount >= 50,
    // Specific modes
    mind_sculptor:              state.completedModes.includes("Mind Break Chamber"),
    the_hammer_falls:           state.completedModes.includes("Hero Auction"),
    corruptors_brand:           state.completedModes.includes("Corruption Arc"),
    blood_and_crowd:            state.completedModes.includes("Arena Mode"),
    protocol_acknowledged:      state.completedModes.includes("The Handler"),
    the_patient_dark:           state.completedModes.includes("The Long Game"),
    drain_complete:             state.completedModes.includes("Power Drain Mode"),
    shattered_reflection:       state.completedModes.includes("Dark Mirror"),
    properly_broken_in:         state.completedModes.includes("Obedience Training"),
    on_display_for_all:         state.completedModes.includes("The Showcase"),
    community_asset:            state.completedModes.includes("Public Property"),
    house_always_wins:          state.completedModes.includes("Betting Pool"),
    two_masters_one_prize:      state.completedModes.includes("Villain Team-Up"),
    signed_and_transferred:     state.completedModes.includes("Chain of Custody"),
    no_one_is_coming:           state.completedModes.includes("Rescue Gone Wrong"),
    group_discount:             state.completedModes.includes("Mass Capture Mode"),
    two_for_one:                state.completedModes.includes("Two Heroines One Cell"),
    // Heroine / villain mastery
    pantheon_of_fallen:         state.heroineCount >= 10,
    comprehensive_collection:   state.heroineCount >= 35,
    full_roster:                state.heroineCount >= 75,
    devoted_captor:             state.maxVillainCount >= 8,
    obsession_manifest:         state.maxVillainCount >= 15,
    he_keeps_coming_back:       state.maxVillainCount >= 35,
    villain_monopoly:           state.maxVillainCount >= 50,
    favourite_specimen:         state.maxHeroineCount >= 15,
    the_compliant_one:          state.maxHeroineCount >= 40,
    rogues_gallery:             state.uniqueVillainCount >= 10,
    full_catalogue_villains:    state.uniqueVillainCount >= 20,
    ritual_pairing:             state.pairedMaxCount >= 5,
    matched_set:                state.pairedMaxCount >= 15,
    devoted_partnership:        state.pairedMaxCount >= 30,
    // Meta
    below_the_surface:          state.unlockedCount >= 15,
    the_grand_hall:             state.unlockedCount >= 30,
    the_obsessive_record:       state.unlockedCount >= 50,
    masters_collection:         state.unlockedCount >= 75,
    // Hidden
    witching_hour:              state.isLateNight && state.totalStories >= 1,
    forged_in_shadow:           state.hasCustomVillain,
    the_sleepless:              state.isLateNight && state.totalStories >= 200,
    the_collector_obsessive:    SPECIALIST_TOOLS.every((t) => state.completedModes.includes(t)),
    no_escape_route:            recentModes.size >= 8,
    single_story_marathon:      state.maxSingleWordCount >= 2000,
    single_story_epic:          state.maxSingleWordCount >= 4000,
    novel_length:               state.maxSingleWordCount >= 8000,
    five_in_one_day:            state.maxStoriesPerDay >= 5,
    ten_in_one_day:             state.maxStoriesPerDay >= 10,
    deep_obsession:             state.pairedMaxCount >= 20,
    three_am_regular:           midnightSessions >= 5,
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
