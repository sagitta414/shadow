const KEY = "sw_arcs_v1";

export interface StoryArc {
  id: string;
  name: string;
  description: string;
  storyIds: string[];
  createdAt: number;
  color: string;
}

export function getArcs(): StoryArc[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function saveArc(arc: StoryArc): void {
  const arcs = getArcs().filter(a => a.id !== arc.id);
  localStorage.setItem(KEY, JSON.stringify([arc, ...arcs]));
}

export function deleteArc(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getArcs().filter(a => a.id !== id)));
}

export function addStoryToArc(arcId: string, storyId: string): void {
  const arcs = getArcs().map(a =>
    a.id === arcId && !a.storyIds.includes(storyId)
      ? { ...a, storyIds: [...a.storyIds, storyId] }
      : a
  );
  localStorage.setItem(KEY, JSON.stringify(arcs));
}

export function removeStoryFromArc(arcId: string, storyId: string): void {
  const arcs = getArcs().map(a =>
    a.id === arcId ? { ...a, storyIds: a.storyIds.filter(id => id !== storyId) } : a
  );
  localStorage.setItem(KEY, JSON.stringify(arcs));
}

export const ARC_COLORS = [
  "#A855F7", "#EF4444", "#3B82F6", "#10B981",
  "#F59E0B", "#EC4899", "#14B8A6", "#F97316",
];
