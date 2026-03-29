// Returns a Set of "YYYY-MM-DD" date keys where at least one story was saved
export function getWritingActivitySet(days = 91): Set<string> {
  let archive: any[] = [];
  try { archive = JSON.parse(localStorage.getItem("sw_archive_v1") || "[]"); } catch {}

  const active = new Set<string>();
  const cutoff = Date.now() - days * 86_400_000;

  for (const entry of archive) {
    const ts = entry.savedAt ?? entry.createdAt ?? 0;
    if (ts < cutoff) continue;
    const d = new Date(ts);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    active.add(key);
  }
  return active;
}

export function buildActivitySlots(days = 91): { key: string; isToday: boolean }[] {
  const slots: { key: string; isToday: boolean }[] = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    slots.push({ key, isToday: i === 0 });
  }
  return slots;
}
