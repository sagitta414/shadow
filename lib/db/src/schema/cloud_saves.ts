import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const cloudSavesTable = pgTable("cloud_saves", {
  saveKey: text("save_key").primaryKey(),
  data: jsonb("data").notNull(),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
});

export type CloudSave = typeof cloudSavesTable.$inferSelect;
