import { getArchive, type ArchivedStory } from "./archive";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: string;
  icon: string;
  rarity: "common" | "rare" | "legendary";
  check: (archive: ArchivedStory[]) => boolean;
}

export interface ChallengeState {
  id: string;
  completedAt?: number;
  manualComplete?: boolean;
}

const STATE_KEY = "sw_bounty_v1";

export function getBountyState(): ChallengeState[] {
  try { return JSON.parse(localStorage.getItem(STATE_KEY) || "[]"); } catch { return []; }
}

export function markChallengeComplete(id: string) {
  const state = getBountyState().filter(s => s.id !== id);
  state.push({ id, completedAt: Date.now(), manualComplete: true });
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

export function isChallengeComplete(id: string): boolean {
  return getBountyState().some(s => s.id === id);
}

const POOL: Challenge[] = [
  // Common
  { id: "first_blood",      title: "First Blood",       description: "Save any story with 1,000+ words",                    reward: "Initiator",     icon: "🩸", rarity: "common",    check: a => a.some(s => s.wordCount >= 1000) },
  { id: "five_stories",     title: "The Collector",     description: "Archive 5 or more stories",                           reward: "Archivist",     icon: "📚", rarity: "common",    check: a => a.length >= 5 },
  { id: "starred",          title: "Star Gazer",        description: "Rate any story 5 stars",                              reward: "Critic",        icon: "⭐", rarity: "common",    check: a => a.some(s => s.rating === 5) },
  { id: "tagged_three",     title: "Catalogued",        description: "Add tags to 3 different stories",                     reward: "Librarian",     icon: "🏷", rarity: "common",    check: a => a.filter(s => s.tags.length > 0).length >= 3 },
  { id: "marvel_story",     title: "Marvel Hunter",     description: "Complete a story in the Marvel universe",             reward: "Marvelite",     icon: "🔴", rarity: "common",    check: a => a.some(s => s.universe?.toUpperCase().includes("MARVEL")) },
  { id: "dc_story",         title: "DC Darkness",       description: "Complete a story in the DC universe",                 reward: "Dark Knight",   icon: "🔵", rarity: "common",    check: a => a.some(s => s.universe?.toUpperCase().includes("DC")) },
  { id: "multi_chapter",    title: "The Serial",        description: "Save a story with 3 or more chapters",                reward: "Serialist",     icon: "📖", rarity: "common",    check: a => a.some(s => s.chapters.length >= 3) },
  { id: "favourite_three",  title: "Cherished",         description: "Mark 3 stories as favourites",                        reward: "Curator",       icon: "💛", rarity: "common",    check: a => a.filter(s => s.favourite).length >= 3 },
  // Rare
  { id: "three_thousand",   title: "The Long Game",     description: "Save a story with 3,000+ words",                     reward: "Wordsmith",     icon: "✍️", rarity: "rare",     check: a => a.some(s => s.wordCount >= 3000) },
  { id: "ten_stories",      title: "The Vault",         description: "Archive 10 or more stories",                          reward: "Keeper",        icon: "🗄", rarity: "rare",      check: a => a.length >= 10 },
  { id: "wardens_eye",      title: "The Warden's Eye",  description: "Generate a Warden's Log for any story",               reward: "Chronicler",    icon: "📋", rarity: "rare",      check: a => a.some(s => (s as any).wardensLog) },
  { id: "clinical_eye",     title: "Clinical Eye",      description: "Generate a Psychology Report for any story",          reward: "Analyst",       icon: "🧠", rarity: "rare",      check: a => a.some(s => (s as any).psychReport) },
  { id: "five_rated",       title: "The Judge",         description: "Rate 5 different stories",                            reward: "Adjudicator",   icon: "⚖️", rarity: "rare",     check: a => a.filter(s => s.rating != null).length >= 5 },
  { id: "dual_capture",     title: "Double Trouble",    description: "Save a Dual Capture story",                           reward: "Juggler",       icon: "⛓", rarity: "rare",      check: a => a.some(s => s.tool?.toLowerCase().includes("dual")) },
  { id: "mind_break",       title: "Mind Shattered",    description: "Save a Mind Break mode story",                        reward: "Psychonaut",    icon: "🌀", rarity: "rare",      check: a => a.some(s => s.tool?.toLowerCase().includes("mind")) },
  { id: "five_chapters",    title: "Epic Saga",         description: "Save a story with 5+ chapters",                      reward: "Saga Keeper",   icon: "📜", rarity: "rare",      check: a => a.some(s => s.chapters.length >= 5) },
  { id: "celeb_story",      title: "Lights Camera",     description: "Save a Celebrity Mode story",                         reward: "Director",      icon: "🎬", rarity: "rare",      check: a => a.some(s => s.universe?.toLowerCase().includes("celebrit")) },
  { id: "three_universes",  title: "Multiverse",        description: "Have stories from 3 different universes",            reward: "Explorer",      icon: "🌌", rarity: "rare",      check: a => new Set(a.map(s => s.universe?.split(" ")[0])).size >= 3 },
  // Legendary
  { id: "five_thousand",    title: "The Marathon",      description: "Save a story with 5,000+ words",                     reward: "Titan",         icon: "🏔", rarity: "legendary", check: a => a.some(s => s.wordCount >= 5000) },
  { id: "twenty_stories",   title: "The Obsessed",      description: "Archive 20 or more stories",                          reward: "Obsessive",     icon: "🕯", rarity: "legendary", check: a => a.length >= 20 },
  { id: "all_five_stars",   title: "Perfectionist",     description: "Rate 10 stories 5 stars",                            reward: "Purist",        icon: "💎", rarity: "legendary", check: a => a.filter(s => s.rating === 5).length >= 10 },
  { id: "five_logs",        title: "The Warden's Tome", description: "Generate Warden's Logs for 5 stories",               reward: "Grand Warden",  icon: "📔", rarity: "legendary", check: a => a.filter(s => (s as any).wardensLog).length >= 5 },
  { id: "five_psych",       title: "The Profiler",      description: "Generate Psychology Reports for 5 stories",          reward: "Grand Analyst", icon: "🔬", rarity: "legendary", check: a => a.filter(s => (s as any).psychReport).length >= 5 },
  { id: "ten_thousand",     title: "The Void Calls",    description: "Write 10,000+ total words across all stories",       reward: "The Void",      icon: "🌑", rarity: "legendary", check: a => a.reduce((t, s) => t + s.wordCount, 0) >= 10000 },
];

function getWeekNumber(): number {
  return Math.floor(Date.now() / (7 * 24 * 3600 * 1000));
}

function seededPick<T>(arr: T[], count: number, seed: number): T[] {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export function getWeeklyChallenges(): Challenge[] {
  const week = getWeekNumber();
  const common = seededPick(POOL.filter(c => c.rarity === "common"), 3, week);
  const rare = seededPick(POOL.filter(c => c.rarity === "rare"), 2, week + 1);
  const legendary = seededPick(POOL.filter(c => c.rarity === "legendary"), 1, week + 2);
  return [...common, ...rare, ...legendary];
}

export function evaluateChallenges(): { challenge: Challenge; complete: boolean }[] {
  const archive = getArchive();
  const challenges = getWeeklyChallenges();
  return challenges.map(c => ({ challenge: c, complete: c.check(archive) }));
}

export const RARITY_COLORS = {
  common:    { bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.35)", text: "#9CA3AF", label: "COMMON"    },
  rare:      { bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.4)",   text: "#818CF8", label: "RARE"      },
  legendary: { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.4)",   text: "#F59E0B", label: "LEGENDARY" },
};
