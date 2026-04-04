import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import type { Request } from "express";

const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "session_stats.json");

export interface SessionStat {
  sessionId: string;
  storiesStarted: number;
  chaptersGenerated: number;
  totalWords: number;
  modes: Record<string, number>;
  lastActivity: number;
  firstSeen: number;
}

function read(): Record<string, SessionStat> {
  try {
    if (!existsSync(FILE)) return {};
    return JSON.parse(readFileSync(FILE, "utf-8"));
  } catch { return {}; }
}

function save(data: Record<string, SessionStat>) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export function getSessionId(req: Request): string {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip ?? "unknown";
  const ua = (req.headers["user-agent"] ?? "").slice(0, 40);
  return Buffer.from(`${ip}::${ua}`).toString("base64").slice(0, 16);
}

export function trackChapter(sessionId: string, wordCount: number, mode: string, isFirst: boolean) {
  const data = read();
  const now = Date.now();
  const existing = data[sessionId];
  data[sessionId] = {
    sessionId,
    storiesStarted: (existing?.storiesStarted ?? 0) + (isFirst ? 1 : 0),
    chaptersGenerated: (existing?.chaptersGenerated ?? 0) + 1,
    totalWords: (existing?.totalWords ?? 0) + wordCount,
    modes: {
      ...(existing?.modes ?? {}),
      [mode]: ((existing?.modes?.[mode] ?? 0) + 1),
    },
    lastActivity: now,
    firstSeen: existing?.firstSeen ?? now,
  };
  save(data);
}

export function getAllSessionStats(): SessionStat[] {
  const data = read();
  return Object.values(data).sort((a, b) => b.lastActivity - a.lastActivity);
}
