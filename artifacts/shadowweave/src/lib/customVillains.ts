const KEY = "sw_custom_villains_v1";

export interface CustomVillain {
  id: string;
  name: string;
  alias: string;
  faction: string;
  powers: string;
  personality: string[];
  backstory: string;
  createdAt: number;
}

export const VILLAIN_PERSONALITY_TRAITS = [
  "Calculating", "Sadistic", "Manipulative", "Obsessive", "Ruthless",
  "Charismatic", "Patient", "Impulsive", "Cold", "Theatrical",
  "Ideological", "Desperate", "Controlling", "Paranoid", "Possessive",
  "Protective", "Methodical", "Volatile", "Cunning", "Domineering",
];

export const VILLAIN_FACTIONS = [
  "HYDRA", "AIM", "The Hand", "Weapon X Program", "SHIELD (Rogue Cell)",
  "Intergang", "League of Shadows", "Cobra", "The Boys (Vought)",
  "Independent", "Corporate", "Government Black Site", "Cult", "Criminal Syndicate", "Custom",
];

export function getCustomVillains(): CustomVillain[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function saveCustomVillain(v: CustomVillain): void {
  const list = getCustomVillains().filter(x => x.id !== v.id);
  localStorage.setItem(KEY, JSON.stringify([v, ...list]));
}

export function deleteCustomVillain(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getCustomVillains().filter(x => x.id !== id)));
}
