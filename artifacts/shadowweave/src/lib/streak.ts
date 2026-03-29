const KEY = "sw_streak_v1";

export interface StreakData {
  lastDate: string;
  count: number;
  best: number;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function getStreak(): StreakData {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "null") ?? { lastDate: "", count: 0, best: 0 };
  } catch {
    return { lastDate: "", count: 0, best: 0 };
  }
}

export function recordStoryDay(): StreakData {
  const today = todayStr();
  const prev = getStreak();
  if (prev.lastDate === today) return prev;
  const newCount = prev.lastDate === yesterdayStr() ? prev.count + 1 : 1;
  const updated: StreakData = {
    lastDate: today,
    count: newCount,
    best: Math.max(prev.best, newCount),
  };
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}
