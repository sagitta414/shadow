import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import type { Request } from "express";

const DATA_DIR = join(process.cwd(), "data");
const EVENTS_FILE = join(DATA_DIR, "events.json");
const MAX_EVENTS = 2000;

export interface SwEvent {
  id: string;
  timestamp: number;
  type: string;
  path: string;
  ip: string;
  sessionId: string;
  heroine?: string;
  villain?: string;
  mode?: string;
  setting?: string;
  extra?: Record<string, unknown>;
  durationMs?: number;
}

function readEvents(): SwEvent[] {
  try {
    if (!existsSync(EVENTS_FILE)) return [];
    return JSON.parse(readFileSync(EVENTS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveEvents(events: SwEvent[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getSessionId(req: Request): string {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip ?? "unknown";
  const ua = (req.headers["user-agent"] ?? "").slice(0, 40);
  return Buffer.from(`${ip}::${ua}`).toString("base64").slice(0, 16);
}

function classifyPath(path: string): string {
  if (path.includes("slow-burn-continue"))    return "slow_burn_continue";
  if (path.includes("slow-burn"))             return "slow_burn_start";
  if (path.includes("confined-space-continue")) return "confined_continue";
  if (path.includes("confined-space"))        return "confined_start";
  if (path.includes("debrief"))               return "debrief";
  if (path.includes("dossier-update"))        return "dossier_update";
  if (path.includes("villain-memory"))        return "villain_memory";
  if (path.includes("branch-choices"))        return "branch_choices";
  if (path.includes("generate-scene-image"))  return "image_generate";
  if (path.includes("generate-heroine-image")) return "heroine_image";
  if (path.includes("daily-scenario"))        return "daily_scenario";
  if (path.includes("daily-scenario-continue")) return "daily_scenario_continue";
  if (path.includes("faction"))               return "faction";
  if (path.includes("director"))              return "director";
  if (path.includes("arena"))                 return "arena";
  if (path.includes("interrogation"))         return "interrogation";
  if (path.includes("mind-break"))            return "mind_break";
  if (path.includes("escape"))                return "escape";
  if (path.includes("negotiation"))           return "negotiation";
  if (path.includes("corruption"))            return "corruption";
  if (path.includes("dream-sequence"))        return "dream_sequence";
  if (path.includes("time-loop"))             return "time_loop";
  if (path.includes("dark-mirror"))           return "dark_mirror";
  if (path.includes("long-game"))             return "long_game";
  if (path.includes("auction"))               return "auction";
  if (path.includes("dual-capture"))          return "dual_capture";
  if (path.includes("mass-capture"))          return "mass_capture";
  if (path.includes("trophy"))                return "trophy";
  if (path.includes("obedience"))             return "obedience";
  if (path.includes("public-property"))       return "public_property";
  if (path.includes("betting-pool"))          return "betting_pool";
  if (path.includes("chain-of-custody"))      return "chain_of_custody";
  if (path.includes("showcase"))              return "showcase";
  if (path.includes("villain-team"))          return "villain_team";
  if (path.includes("handler"))               return "handler";
  if (path.includes("rescue-gone-wrong"))     return "rescue_gone_wrong";
  if (path.includes("power-drain"))           return "power_drain";
  if (path.includes("plot-twist"))            return "plot_twist";
  if (path.includes("story"))                 return "story_generate";
  return "other";
}

export function logEvent(req: Request, extra?: Record<string, unknown>, durationMs?: number): void {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const heroineName = typeof body.heroine === "object" && body.heroine !== null
      ? (body.heroine as { name?: string }).name
      : typeof body.heroine === "string" ? body.heroine : undefined;

    const event: SwEvent = {
      id: uid(),
      timestamp: Date.now(),
      type: classifyPath(req.path),
      path: req.path,
      ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip ?? "unknown",
      sessionId: getSessionId(req),
      heroine: heroineName,
      villain: typeof body.villain === "string" ? body.villain : undefined,
      mode: typeof body.mode === "string" ? body.mode : undefined,
      setting: typeof body.setting === "string" ? body.setting
             : typeof body.room === "string" ? body.room : undefined,
      extra,
      durationMs,
    };

    const events = readEvents();
    events.unshift(event);
    if (events.length > MAX_EVENTS) events.splice(MAX_EVENTS);
    saveEvents(events);
  } catch {
    // never crash the main request
  }
}

export function getAllEvents(): SwEvent[] {
  return readEvents();
}

export function getEventStats() {
  const events = readEvents();
  const now = Date.now();
  const DAY = 86400000;
  const WEEK = 7 * DAY;

  const today = events.filter(e => now - e.timestamp < DAY).length;
  const thisWeek = events.filter(e => now - e.timestamp < WEEK).length;
  const sessions = new Set(events.map(e => e.sessionId)).size;
  const images = events.filter(e => e.type === "image_generate" || e.type === "heroine_image").length;

  const modeCounts: Record<string, number> = {};
  for (const e of events) {
    modeCounts[e.type] = (modeCounts[e.type] ?? 0) + 1;
  }
  const topMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0];

  const hourBuckets: number[] = Array(24).fill(0);
  for (const e of events.filter(e => now - e.timestamp < WEEK)) {
    const h = new Date(e.timestamp).getHours();
    hourBuckets[h]++;
  }

  const heroines: Record<string, number> = {};
  for (const e of events) {
    if (e.heroine) heroines[e.heroine] = (heroines[e.heroine] ?? 0) + 1;
  }
  const topHeroines = Object.entries(heroines).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const villains: Record<string, number> = {};
  for (const e of events) {
    if (e.villain) villains[e.villain] = (villains[e.villain] ?? 0) + 1;
  }
  const topVillains = Object.entries(villains).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return {
    total: events.length,
    today,
    thisWeek,
    sessions,
    images,
    topMode: topMode ? { type: topMode[0], count: topMode[1] } : null,
    modeCounts,
    hourBuckets,
    topHeroines,
    topVillains,
  };
}
