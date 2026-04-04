import { recordStoryDay } from "./streak";
import { checkAndUnlockAchievements, recordModeCompletion } from "./achievements";

export interface ArchivedStory {
  id: string;
  title: string;
  createdAt: number;
  universe: string;
  tool: string;
  characters: string[];
  chapters: string[];
  tags: string[];
  favourite: boolean;
  wordCount: number;
  rating?: number;
}

const KEY = "sw_archive_v1";

export function getArchive(): ArchivedStory[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveStoryToArchive(
  story: Omit<ArchivedStory, "id" | "createdAt" | "tags" | "favourite" | "wordCount">
): string {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const full: ArchivedStory = {
    ...story,
    id,
    createdAt: Date.now(),
    tags: [],
    favourite: false,
    wordCount: story.chapters.join(" ").split(/\s+/).filter(Boolean).length,
  };
  const existing = getArchive();
  localStorage.setItem(KEY, JSON.stringify([full, ...existing]));
  recordStoryDay();
  recordModeCompletion(story.tool);
  checkAndUnlockAchievements();
  return id;
}

// Alias for consistency across new mode pages
export const saveToArchive = saveStoryToArchive;

export function updateArchiveStory(id: string, patch: Partial<ArchivedStory>) {
  const stories = getArchive().map((s) => (s.id === id ? { ...s, ...patch } : s));
  localStorage.setItem(KEY, JSON.stringify(stories));
}

// Heroine Resistance Score — compute across all archived stories featuring a heroine
export interface HeroineResistanceScore {
  totalStories: number;
  resistEvents: number;
  brokenEvents: number;
  bargainEvents: number;
  submitEvents: number;
  dominantOutcome: "Fighter" | "Negotiator" | "Submitted" | "Broken" | "Unknown";
  resistanceRating: number; // 0-100, higher = more resistant overall
}

export function getHeroineResistanceScore(heroineName: string): HeroineResistanceScore {
  const name = heroineName.toLowerCase();
  const stories = getArchive().filter(s =>
    s.characters.some(c => c.toLowerCase().includes(name) || name.includes(c.toLowerCase()))
  );
  let resistEvents = 0, brokenEvents = 0, bargainEvents = 0, submitEvents = 0;
  for (const story of stories) {
    const text = story.chapters.join(" ").toLowerCase();
    resistEvents += (text.match(/\b(resist|fought|defiant|defi|struggle|refused|won't|wouldn't|pushes? back|breaks? free|not giving|never submit|holds? firm)\b/g) ?? []).length;
    brokenEvents += (text.match(/\b(broken|shatter|completely broken|utterly broken|spirit broken|breaks? completely|no longer resists?|stopped fighting|gave up|finally broke|all resistance gone)\b/g) ?? []).length;
    bargainEvents += (text.match(/\b(bargain|negotiate|deal|if you|please|promise|let me go|trade|exchange|terms?)\b/g) ?? []).length;
    submitEvents += (text.match(/\b(submitted?|surrender|yields?|complies?|obeyed?|relented?|gave in|gave way|accepts? his|accepts? the|does as|does what)\b/g) ?? []).length;
  }
  const total = resistEvents + brokenEvents + bargainEvents + submitEvents || 1;
  const resistanceRating = Math.min(100, Math.round((resistEvents * 100 + bargainEvents * 60 - submitEvents * 40 - brokenEvents * 80) / total + 50));
  let dominantOutcome: HeroineResistanceScore["dominantOutcome"] = "Unknown";
  const max = Math.max(resistEvents, brokenEvents, bargainEvents, submitEvents);
  if (max === 0) dominantOutcome = "Unknown";
  else if (max === resistEvents) dominantOutcome = "Fighter";
  else if (max === bargainEvents) dominantOutcome = "Negotiator";
  else if (max === submitEvents) dominantOutcome = "Submitted";
  else dominantOutcome = "Broken";
  return { totalStories: stories.length, resistEvents, brokenEvents, bargainEvents, submitEvents, dominantOutcome, resistanceRating: Math.max(0, Math.min(100, resistanceRating)) };
}

export function deleteArchiveStory(id: string) {
  const stories = getArchive().filter((s) => s.id !== id);
  localStorage.setItem(KEY, JSON.stringify(stories));
}

export function exportStoryAsTXT(story: ArchivedStory) {
  const chapterText = story.chapters
    .map((c, i) =>
      story.chapters.length > 1 ? `${"═".repeat(50)}\nCHAPTER ${i + 1}\n${"═".repeat(50)}\n\n${c}` : c
    )
    .join("\n\n");
  const text = `SHADOWWEAVE — STORY ARCHIVE\n${"═".repeat(50)}\n\nTITLE: ${story.title}\nCHARACTERS: ${story.characters.join(", ")}\nUNIVERSE: ${story.universe}\nDATE: ${new Date(story.createdAt).toLocaleDateString()}\nWORDS: ${story.wordCount.toLocaleString()}\nTAGS: ${story.tags.join(", ") || "—"}\n\n${"═".repeat(50)}\n\n${chapterText}`;
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shadowweave_${story.title.replace(/[^a-z0-9]/gi, "_").toLowerCase().slice(0, 40)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Daily Scenario Chronicle ───────────────────────────────────────────────
export interface DailyEntry {
  dateKey: string;
  date: string;
  heroine: string;
  heroineColor: string;
  villain: string;
  setting: string;
  title: string;
  story: string;
  savedAt: number;
}

const DAILY_KEY = "sw_daily_archive_v1";

export function getDailyArchive(): DailyEntry[] {
  try {
    return JSON.parse(localStorage.getItem(DAILY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getTodayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getDailyEntryForToday(): DailyEntry | null {
  const key = getTodayDateKey();
  return getDailyArchive().find((e) => e.dateKey === key) ?? null;
}

export function getDailyEntryForDate(dateKey: string): DailyEntry | null {
  return getDailyArchive().find((e) => e.dateKey === dateKey) ?? null;
}

export function saveDailyEntry(entry: Omit<DailyEntry, "savedAt">): void {
  const existing = getDailyArchive().filter((e) => e.dateKey !== entry.dateKey);
  localStorage.setItem(DAILY_KEY, JSON.stringify([{ ...entry, savedAt: Date.now() }, ...existing]));
}

export function exportStoryAsPDF(story: ArchivedStory) {
  const w = window.open("", "_blank");
  if (!w) return;
  const chaptersHTML = story.chapters
    .map(
      (ch, i) => `
      <div class="chapter">
        ${story.chapters.length > 1 ? `<div class="chapter-title">— Chapter ${i + 1} —</div>` : ""}
        ${ch
          .split("\n")
          .filter(Boolean)
          .map((p) => `<p>${p}</p>`)
          .join("")}
      </div>
      ${i < story.chapters.length - 1 ? '<hr class="chapter-break"/>' : ""}
    `
    )
    .join("");
  w.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${story.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'EB Garamond', Georgia, serif; max-width: 680px; margin: 0 auto; padding: 60px 40px; color: #1a1a1a; background: #fff; }
    .header { border-bottom: 2px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 30px; }
    h1 { font-family: 'Cinzel', Georgia, serif; font-size: 1.6rem; font-weight: 600; margin-bottom: 10px; line-height: 1.3; }
    .meta { font-size: 0.8rem; color: #555; letter-spacing: 0.05em; line-height: 1.8; }
    .meta strong { color: #1a1a1a; }
    .chapter { margin-bottom: 2.5rem; }
    .chapter-title { font-family: 'Cinzel', Georgia, serif; font-size: 0.8rem; letter-spacing: 0.2em; text-align: center; margin-bottom: 1.5rem; color: #555; }
    p { font-size: 1rem; line-height: 1.85; text-indent: 1.5em; margin-bottom: 0.25em; }
    hr.chapter-break { border: none; border-top: 1px solid #ccc; margin: 2rem auto; width: 40%; }
    .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #ccc; font-size: 0.7rem; color: #888; text-align: center; letter-spacing: 0.1em; }
    @media print { body { padding: 40px; } .footer { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${story.title}</h1>
    <div class="meta">
      <strong>Characters:</strong> ${story.characters.join(", ")}<br/>
      <strong>Universe:</strong> ${story.universe} &nbsp;·&nbsp; <strong>Tool:</strong> ${story.tool}<br/>
      <strong>Date:</strong> ${new Date(story.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
      &nbsp;·&nbsp; <strong>Words:</strong> ${story.wordCount.toLocaleString()}
      ${story.tags.length ? `<br/><strong>Tags:</strong> ${story.tags.join(", ")}` : ""}
    </div>
  </div>
  ${chaptersHTML}
  <div class="footer">Generated by SHADOWWEAVE — Dark Narrative Studio</div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`);
  w.document.close();
}
