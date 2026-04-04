import { Router } from "express";
import { getAllEvents, getEventStats } from "../lib/eventLogger";
import { getAllSessionStats } from "../lib/sessionStats";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const router = Router();
const ADMIN_KEY = process.env.ADMIN_KEY;
const ADMIN_EMAIL = "jefflynch107@gmail.com";
const VISITORS_FILE = join(process.cwd(), "data", "visitors.json");

function requireAdmin(req: Parameters<Parameters<typeof router.get>[1]>[0], res: Parameters<Parameters<typeof router.get>[1]>[1]): boolean {
  const key = req.headers["x-admin-key"] as string | undefined;
  const email = req.headers["x-admin-email"] as string | undefined;
  if (!ADMIN_KEY || !key || key !== ADMIN_KEY) {
    res.status(401).json({ error: "Invalid admin key" });
    return false;
  }
  if (email && email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    res.status(403).json({ error: "Unauthorized email" });
    return false;
  }
  return true;
}

router.get("/admin/visitors", (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const visitors = existsSync(VISITORS_FILE)
      ? JSON.parse(readFileSync(VISITORS_FILE, "utf-8"))
      : [];
    res.json({ count: visitors.length, visitors });
  } catch {
    res.json({ count: 0, visitors: [] });
  }
});

router.get("/admin/events", (req, res) => {
  if (!requireAdmin(req, res)) return;
  const limit = Math.min(parseInt((req.query.limit as string) ?? "200"), 500);
  const offset = parseInt((req.query.offset as string) ?? "0");
  const type = req.query.type as string | undefined;
  const session = req.query.session as string | undefined;

  let events = getAllEvents();
  if (type) events = events.filter(e => e.type === type);
  if (session) events = events.filter(e => e.sessionId === session);

  const total = events.length;
  const page = events.slice(offset, offset + limit);
  res.json({ total, events: page });
});

router.get("/admin/stats", (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json(getEventStats());
});

router.get("/admin/session-stats", (req, res) => {
  if (!requireAdmin(req, res)) return;
  const stats = getAllSessionStats();

  // Supplement with event-based counts for sessions not yet in session_stats.json
  const events = getAllEvents();
  const STORY_TYPES = new Set(["story_generate","slow_burn_start","confined_start","daily_scenario","daily_scenario_continue","slow_burn_continue","confined_continue","faction","director","arena","interrogation","mind_break","escape","negotiation","corruption","dream_sequence","time_loop","dark_mirror","long_game","auction","dual_capture","mass_capture","trophy","obedience","public_property","betting_pool","chain_of_custody","showcase","villain_team","handler","rescue_gone_wrong","power_drain"]);

  const eventMap: Record<string, { storiesFromEvents: number; modesFromEvents: Record<string, number>; lastEventActivity: number; firstEventSeen: number }> = {};
  for (const e of events) {
    if (!STORY_TYPES.has(e.type)) continue;
    const s = eventMap[e.sessionId];
    if (!s) {
      eventMap[e.sessionId] = { storiesFromEvents: 1, modesFromEvents: { [e.type]: 1 }, lastEventActivity: e.timestamp, firstEventSeen: e.timestamp };
    } else {
      s.storiesFromEvents++;
      s.modesFromEvents[e.type] = (s.modesFromEvents[e.type] ?? 0) + 1;
      if (e.timestamp > s.lastEventActivity) s.lastEventActivity = e.timestamp;
      if (e.timestamp < s.firstEventSeen) s.firstEventSeen = e.timestamp;
    }
  }

  // Merge: prefer session_stats.json data, fall back to event-derived data
  const trackedIds = new Set(stats.map(s => s.sessionId));
  const merged = [...stats];
  for (const [sid, ev] of Object.entries(eventMap)) {
    if (trackedIds.has(sid)) continue;
    merged.push({
      sessionId: sid,
      storiesStarted: ev.storiesFromEvents,
      chaptersGenerated: ev.storiesFromEvents,
      totalWords: 0,
      modes: ev.modesFromEvents,
      lastActivity: ev.lastEventActivity,
      firstSeen: ev.firstEventSeen,
    });
  }

  merged.sort((a, b) => b.lastActivity - a.lastActivity);
  res.json({ sessions: merged });
});

export default router;
