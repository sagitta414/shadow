const KEY = "sw_campaigns_v1";

export interface CampaignChapter {
  id: string;
  title: string;
  story: string;
  heroine: string;
  villain: string;
  setting: string;
  createdAt: string;
  wordCount: number;
  summary: string;
  chapterNumber: number;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  heroine: string;
  villain: string;
  arc: string;
  chapters: CampaignChapter[];
  createdAt: string;
  updatedAt: string;
  coverColor: string;
  status: "active" | "complete" | "abandoned";
}

export function getCampaigns(): Campaign[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export function saveCampaign(c: Campaign): void {
  const list = getCampaigns().filter(x => x.id !== c.id);
  localStorage.setItem(KEY, JSON.stringify([{ ...c, updatedAt: new Date().toISOString() }, ...list]));
}

export function deleteCampaign(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getCampaigns().filter(x => x.id !== id)));
}

export function getCampaign(id: string): Campaign | null {
  return getCampaigns().find(x => x.id === id) ?? null;
}

export function addChapterToCampaign(campaignId: string, chapter: CampaignChapter): Campaign | null {
  const campaign = getCampaign(campaignId);
  if (!campaign) return null;
  const updated: Campaign = {
    ...campaign,
    chapters: [...campaign.chapters, chapter],
    updatedAt: new Date().toISOString(),
  };
  saveCampaign(updated);
  return updated;
}

export function buildContextSummary(chapters: CampaignChapter[]): string {
  if (chapters.length === 0) return "";
  return chapters.map((ch, i) =>
    `CHAPTER ${i + 1} — ${ch.title}:\n${ch.summary || ch.story.slice(0, 400) + "..."}`
  ).join("\n\n---\n\n");
}

export const CAMPAIGN_ARCS = [
  "Capture & Conditioning — systematic breaking over weeks",
  "The Long Infiltration — sleeper agent conditioning, returned to her team",
  "Descent Arc — seven chapters of slow psychological erosion",
  "Rescue Gone Wrong — team attempts extraction, all captured",
  "The Tournament — heroine fights her way through a villain gauntlet",
  "Transfer Protocol — passed between multiple handlers",
  "The Molding — complete persona replacement over a campaign",
  "Custom Arc — define your own",
];

export const CAMPAIGN_COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#06B6D4", "#8B5CF6", "#EC4899", "#F43F5E",
];
