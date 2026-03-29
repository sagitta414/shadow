export interface CustomHeroine {
  id: string;
  name: string;
  appearance: string;
  powers: string;
  weakness: string;
  backstory: string;
  createdAt: number;
}

const KEY = "sw_custom_heroines_v1";

export function getCustomHeroines(): CustomHeroine[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

export function saveCustomHeroine(h: Omit<CustomHeroine, "id" | "createdAt">): CustomHeroine {
  const heroine: CustomHeroine = { ...h, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), createdAt: Date.now() };
  const all = getCustomHeroines();
  localStorage.setItem(KEY, JSON.stringify([heroine, ...all]));
  return heroine;
}

export function deleteCustomHeroine(id: string) {
  const all = getCustomHeroines().filter(h => h.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}
