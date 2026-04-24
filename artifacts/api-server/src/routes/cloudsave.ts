import { Router } from "express";
import { db, cloudSavesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();
const SAVE_KEY = "shadowweave-global";

router.post("/cloud-save", async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || typeof data !== "object") {
      return res.status(400).json({ error: "Invalid data payload" });
    }
    await db
      .insert(cloudSavesTable)
      .values({ saveKey: SAVE_KEY, data })
      .onConflictDoUpdate({ target: cloudSavesTable.saveKey, set: { data, savedAt: new Date() } });
    res.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (err) {
    console.error("cloud-save POST error:", err);
    res.status(500).json({ error: "Failed to save" });
  }
});

router.get("/cloud-save", async (_req, res) => {
  try {
    const rows = await db.select().from(cloudSavesTable).where(eq(cloudSavesTable.saveKey, SAVE_KEY));
    if (!rows.length) return res.json({ data: null });
    res.json({ data: rows[0].data, savedAt: rows[0].savedAt });
  } catch (err) {
    console.error("cloud-save GET error:", err);
    res.status(500).json({ error: "Failed to load" });
  }
});

export default router;
