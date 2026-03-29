import { Router } from "express";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "visitors.json");
const ADMIN_KEY = process.env.ADMIN_KEY ?? "shadow-admin-2026";

export interface Visitor {
  email: string;
  registeredAt: number;
  visitCount: number;
  lastSeen: number;
  userAgent?: string;
}

function readVisitors(): Visitor[] {
  try {
    if (!existsSync(DATA_FILE)) return [];
    return JSON.parse(readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveVisitors(visitors: Visitor[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(visitors, null, 2));
}

const router = Router();

router.post("/visitors", (req, res) => {
  const { email } = req.body as { email?: unknown };
  if (
    !email ||
    typeof email !== "string" ||
    !email.includes("@") ||
    !email.includes(".")
  ) {
    res.status(400).json({ error: "A valid email address is required." });
    return;
  }

  const visitors = readVisitors();
  const normalised = email.trim().toLowerCase();
  const existingIdx = visitors.findIndex(
    (v) => v.email.toLowerCase() === normalised
  );

  if (existingIdx >= 0) {
    visitors[existingIdx].visitCount += 1;
    visitors[existingIdx].lastSeen = Date.now();
    if (email.includes("@")) visitors[existingIdx].email = email.trim();
    saveVisitors(visitors);
    res.json({ ok: true, isNew: false });
  } else {
    const now = Date.now();
    visitors.unshift({
      email: email.trim(),
      registeredAt: now,
      visitCount: 1,
      lastSeen: now,
      userAgent: req.headers["user-agent"],
    });
    saveVisitors(visitors);
    res.json({ ok: true, isNew: true });
  }
});

router.get("/admin/visitors", (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) {
    res.status(401).json({ error: "Invalid admin key." });
    return;
  }
  const visitors = readVisitors();
  res.json({ count: visitors.length, visitors });
});

export default router;
