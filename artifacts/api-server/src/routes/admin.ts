import { Router } from "express";
import { getAllEvents, getEventStats } from "../lib/eventLogger";
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

export default router;
