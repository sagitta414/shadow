const KEY = "sw_recent_modes_v1";

export interface RecentMode {
  page: string;
  label: string;
  icon: string;
  visitedAt: number;
}

const MODE_META: Record<string, { label: string; icon: string }> = {
  "superhero-mode":      { label: "Heroine Forge",         icon: "🔱" },
  "celebrity-mode":      { label: "Celebrity Captive",      icon: "👁" },
  "daily-scenario":      { label: "Daily Dispatch",         icon: "📅" },
  "character-params":    { label: "Custom Scenario",        icon: "🔮" },
  "mind-break":          { label: "Mind Break",             icon: "🌀" },
  "dual-capture":        { label: "Two Heroines",           icon: "⛓" },
  "rescue-gone-wrong":   { label: "Rescue Gone Wrong",      icon: "🕸" },
  "power-drain":         { label: "Power Drain",            icon: "⚡" },
  "mass-capture":        { label: "Mass Capture",           icon: "🗡" },
  "corruption-arc":      { label: "Corruption Arc",         icon: "🌑" },
  "hero-auction":        { label: "Hero Auction",           icon: "⚖" },
  "trophy-display":      { label: "Trophy Display",         icon: "👁" },
  "obedience-training":  { label: "Obedience Training",     icon: "📋" },
  "showcase":            { label: "The Showcase",           icon: "🎭" },
  "public-property":     { label: "Public Property",        icon: "🔓" },
  "betting-pool":        { label: "Betting Pool",           icon: "🎲" },
  "villain-team-up":     { label: "Villain Team-Up",        icon: "⚔" },
  "chain-of-custody":    { label: "Chain of Custody",       icon: "🔗" },
  "long-game":           { label: "The Long Game",          icon: "⏳" },
  "dark-mirror":         { label: "Dark Mirror",            icon: "🪞" },
  "arena-mode":          { label: "Arena Mode",             icon: "🏟" },
  "the-handler":         { label: "The Handler",            icon: "📁" },
  "interrogation-room":  { label: "Interrogation Room",     icon: "🔦" },
  "captor-home":         { label: "Captor Config",          icon: "🎭" },
  "captor-logic":        { label: "Captor Logic Sim",       icon: "♟" },
  "scenario-generator":  { label: "Scenario Engine",        icon: "⚙" },
  "character-mapper":    { label: "Relationship Map",       icon: "🗺" },
  "sounding-board":      { label: "Sounding Board",         icon: "💬" },
};

export function recordModeVisit(page: string): void {
  const meta = MODE_META[page];
  if (!meta) return;
  const existing = getRecentModes();
  const filtered = existing.filter((m) => m.page !== page);
  const updated = [
    { page, label: meta.label, icon: meta.icon, visitedAt: Date.now() },
    ...filtered,
  ].slice(0, 6);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function getRecentModes(): RecentMode[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
