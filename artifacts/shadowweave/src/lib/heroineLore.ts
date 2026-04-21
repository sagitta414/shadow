import { getArchive, type ArchivedStory } from "./archive";

export interface LoreEntry {
  generatedAt: number;
  evolution: string;
  breakingPoints: string;
  endurance: string;
  currentState: string;
  fullNarrative: string;
}

export interface HeroineLoreRecord {
  name: string;
  portraitUrl?: string;
  portraitGeneratedAt?: number;
  lore?: LoreEntry;
}

const KEY = "sw_heroine_lore_v2";

function load(): Record<string, HeroineLoreRecord> {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

function save(data: Record<string, HeroineLoreRecord>) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getLoreRecord(name: string): HeroineLoreRecord | null {
  return load()[name] ?? null;
}

export function upsertLoreRecord(name: string, patch: Partial<HeroineLoreRecord>) {
  const data = load();
  data[name] = { name, ...data[name], ...patch };
  save(data);
}

export function getAllLoreNames(): string[] {
  return Object.keys(load());
}

export interface HeroineArchiveProfile {
  name: string;
  storyCount: number;
  totalWords: number;
  universes: string[];
  chapterSamples: string[];
  lore?: LoreEntry;
  portraitUrl?: string;
}

export function buildHeroineProfiles(): HeroineArchiveProfile[] {
  const archive = getArchive();
  const map: Record<string, { stories: ArchivedStory[] }> = {};

  for (const story of archive) {
    const heroine = story.characters?.[0]?.trim();
    if (!heroine) continue;
    if (!map[heroine]) map[heroine] = { stories: [] };
    map[heroine].stories.push(story);
  }

  const stored = load();

  return Object.entries(map).map(([name, { stories }]) => {
    const totalWords = stories.reduce((t, s) => t + (s.wordCount ?? 0), 0);
    const universes = [...new Set(stories.map(s => s.universe).filter(Boolean) as string[])];
    const chapterSamples = stories
      .flatMap(s => s.chapters)
      .slice(0, 3)
      .map(ch => ch.slice(0, 600));

    const rec = stored[name];
    return {
      name,
      storyCount: stories.length,
      totalWords,
      universes,
      chapterSamples,
      lore: rec?.lore,
      portraitUrl: rec?.portraitUrl,
    };
  }).sort((a, b) => b.storyCount - a.storyCount || b.totalWords - a.totalWords);
}
