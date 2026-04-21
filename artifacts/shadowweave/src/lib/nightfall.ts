// NIGHTFALL HOURS — Time-windowed exclusive modes & "Blood Moon" days.

export interface NightfallWindow {
  modeTitle: string;
  startHour: number; // local hour 0-23
  endHour: number;   // exclusive
  label: string;
  flavor: string;
}

export const NIGHTFALL_MODES: NightfallWindow[] = [
  { modeTitle: "DREAM SEQUENCE",  startHour: 0,  endHour: 4,  label: "Witching Hours",   flavor: "Available 12am – 4am only" },
  { modeTitle: "MIND BREAK",      startHour: 23, endHour: 24, label: "Last Hour",        flavor: "Available 11pm – midnight" },
  { modeTitle: "DARK MIRROR",     startHour: 22, endHour: 4,  label: "After Curfew",     flavor: "Available 10pm – 4am" },
  { modeTitle: "INTERROGATION",   startHour: 2,  endHour: 6,  label: "Interrogator's Hour", flavor: "Available 2am – 6am" },
];

function inWindow(now: Date, w: NightfallWindow): boolean {
  const h = now.getHours();
  if (w.endHour > w.startHour) return h >= w.startHour && h < w.endHour;
  // wraps midnight
  return h >= w.startHour || h < w.endHour;
}

export function getNightfallStatus(modeTitle: string, now: Date = new Date()) {
  const w = NIGHTFALL_MODES.find(n => n.modeTitle === modeTitle);
  if (!w) return null;
  return { window: w, open: inWindow(now, w), label: w.label, flavor: w.flavor };
}

export function isNightfallMode(modeTitle: string): boolean {
  return !!NIGHTFALL_MODES.find(n => n.modeTitle === modeTitle);
}

// BLOOD MOON — first Friday of each month or any day where day-of-month is 13
export function isBloodMoonToday(now: Date = new Date()): boolean {
  if (now.getDate() === 13) return true;
  // First Friday: day-of-month <= 7 and weekday === 5
  return now.getDay() === 5 && now.getDate() <= 7;
}

export function nextBloodMoon(from: Date = new Date()): Date {
  const d = new Date(from);
  for (let i = 0; i < 366; i++) {
    if (isBloodMoonToday(d)) return d;
    d.setDate(d.getDate() + 1);
  }
  return d;
}

export interface NightfallSummary {
  open: NightfallWindow[];
  closed: Array<{ window: NightfallWindow; nextOpen: string }>;
  bloodMoon: boolean;
}

function describeNextOpen(w: NightfallWindow, now: Date): string {
  const tomorrow = w.startHour <= now.getHours() && now.getHours() < (w.endHour > w.startHour ? w.endHour : 24);
  const target = new Date(now);
  if (now.getHours() >= w.startHour && (w.endHour > w.startHour ? now.getHours() >= w.endHour : false)) {
    target.setDate(target.getDate() + 1);
  }
  target.setHours(w.startHour, 0, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  const hrs = Math.max(0, Math.floor(diffMs / 3600000));
  const mins = Math.max(0, Math.floor((diffMs % 3600000) / 60000));
  void tomorrow;
  if (hrs === 0) return `opens in ${mins}m`;
  return `opens in ${hrs}h ${mins}m`;
}

export function getNightfallSummary(now: Date = new Date()): NightfallSummary {
  const open: NightfallWindow[] = [];
  const closed: Array<{ window: NightfallWindow; nextOpen: string }> = [];
  for (const w of NIGHTFALL_MODES) {
    if (inWindow(now, w)) open.push(w);
    else closed.push({ window: w, nextOpen: describeNextOpen(w, now) });
  }
  return { open, closed, bloodMoon: isBloodMoonToday(now) };
}
