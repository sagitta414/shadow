import { useState, useEffect } from "react";
import {
  ACHIEVEMENTS, getUnlockedAchievements, getTotalXP, getUnlockCount,
  getAchievementState, type Achievement, type AchievementRarity,
} from "../lib/achievements";

const RARITY_ORDER: AchievementRarity[] = ["common", "rare", "epic", "legendary"];

const RARITY_PALETTE: Record<AchievementRarity, { accent: string; rgb: string; label: string; glow: string }> = {
  common:    { accent: "#94A3B8", rgb: "148,163,184", label: "Common",    glow: "rgba(148,163,184,0.25)" },
  rare:      { accent: "#60A5FA", rgb: "96,165,250",  label: "Rare",      glow: "rgba(96,165,250,0.3)" },
  epic:      { accent: "#C084FC", rgb: "192,132,252", label: "Epic",      glow: "rgba(192,132,252,0.35)" },
  legendary: { accent: "#F5D67A", rgb: "245,214,122", label: "Legendary", glow: "rgba(245,214,122,0.4)" },
};

function AchievementCard({ ach, unlocked, unlockedAt, state }: {
  ach: Achievement;
  unlocked: boolean;
  unlockedAt?: number;
  state: ReturnType<typeof getAchievementState>;
}) {
  const [hov, setHov] = useState(false);
  const pal = RARITY_PALETTE[ach.rarity];
  const prog = ach.progress ? ach.progress(state) : null;
  const hidden = ach.hidden && !unlocked;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        background: unlocked
          ? (hov ? `rgba(${pal.rgb}, 0.2)` : `rgba(${pal.rgb}, 0.13)`)
          : "rgba(22,12,42,0.88)",
        border: `1px solid ${unlocked
          ? (hov ? `rgba(${pal.rgb}, 0.65)` : `rgba(${pal.rgb}, 0.3)`)
          : "rgba(255,255,255,0.1)"}`,
        borderRadius: "14px",
        padding: "1rem 1.1rem",
        transition: "all 0.22s ease",
        transform: hov && unlocked ? "translateY(-3px)" : "none",
        boxShadow: hov && unlocked ? `0 8px 28px ${pal.glow}` : "none",
        opacity: unlocked ? 1 : 0.75,
        backdropFilter: "blur(14px)",
        overflow: "hidden",
        display: "flex",
        gap: "0.85rem",
        alignItems: "flex-start",
      }}
    >
      {/* Unlocked top shimmer */}
      {unlocked && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, rgba(${pal.rgb}, ${hov ? 0.8 : 0.35}), transparent)`, transition: "opacity 0.3s" }} />
      )}

      {/* Icon */}
      <div style={{
        width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
        background: unlocked ? `rgba(${pal.rgb}, 0.14)` : "rgba(255,255,255,0.03)",
        border: `1px solid rgba(${pal.rgb}, ${unlocked ? 0.3 : 0.06})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: hidden ? "1.2rem" : "1.5rem",
        boxShadow: unlocked && hov ? `0 0 24px ${pal.glow}` : "none",
        transition: "all 0.22s",
        filter: unlocked ? "none" : "grayscale(1) brightness(0.4)",
      }}>
        {hidden ? "❓" : ach.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem", flexWrap: "wrap" }}>
          <span style={{
            fontFamily: "'Cinzel', serif", fontSize: "0.75rem", fontWeight: 700,
            color: unlocked ? (hov ? "#FFF" : `rgba(235,230,255,0.92)`) : "rgba(200,195,230,0.72)",
            transition: "color 0.22s", letterSpacing: "0.02em",
          }}>
            {hidden ? "???" : ach.title}
          </span>
          <span style={{
            fontSize: "0.35rem", letterSpacing: "2px", padding: "2px 7px",
            borderRadius: "20px", background: `rgba(${pal.rgb}, ${unlocked ? 0.15 : 0.06})`,
            color: unlocked ? pal.accent : `rgba(${pal.rgb}, 0.35)`,
            border: `1px solid rgba(${pal.rgb}, ${unlocked ? 0.3 : 0.1})`,
            fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "uppercase",
          }}>
            {pal.label}
          </span>
          {unlocked && (
            <span style={{
              fontSize: "0.35rem", letterSpacing: "2px", padding: "2px 7px",
              borderRadius: "20px", background: `rgba(${pal.rgb}, 0.12)`,
              color: pal.accent, fontFamily: "'Cinzel', serif", fontWeight: 700,
              border: `1px solid rgba(${pal.rgb}, 0.25)`,
              marginLeft: "auto", flexShrink: 0,
            }}>
              +{ach.xp} XP
            </span>
          )}
        </div>

        <div style={{ fontSize: "0.6rem", color: hidden ? "rgba(160,155,195,0.45)" : (unlocked ? "rgba(220,215,250,0.72)" : "rgba(185,180,215,0.62)"), fontFamily: "'Raleway', sans-serif", lineHeight: 1.5, marginBottom: prog ? "0.6rem" : "0.2rem" }}>
          {hidden ? "Complete hidden conditions to reveal this achievement." : ach.desc}
        </div>

        {/* Lore (only when unlocked) */}
        {unlocked && !hidden && (
          <div style={{ fontSize: "0.57rem", color: `rgba(${pal.rgb}, 0.78)`, fontFamily: "'Raleway', sans-serif", fontStyle: "italic", lineHeight: 1.45, marginBottom: prog ? "0.6rem" : 0 }}>
            "{ach.lore}"
          </div>
        )}

        {/* Progress bar */}
        {prog && !unlocked && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "0.4rem", color: "rgba(190,185,220,0.6)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px", textTransform: "uppercase" }}>Progress</span>
              <span style={{ fontSize: "0.4rem", color: `rgba(${pal.rgb}, 0.72)`, fontFamily: "'Cinzel', serif" }}>{prog[0].toLocaleString()} / {prog[1].toLocaleString()}</span>
            </div>
            <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, (prog[0] / prog[1]) * 100)}%`, background: `linear-gradient(90deg, rgba(${pal.rgb},0.5), rgba(${pal.rgb},0.8))`, borderRadius: "2px", transition: "width 0.5s ease" }} />
            </div>
          </div>
        )}

        {/* Unlock date */}
        {unlocked && unlockedAt && (
          <div style={{ marginTop: "0.3rem", fontSize: "0.38rem", color: "rgba(170,165,200,0.55)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px" }}>
            UNLOCKED {new Date(unlockedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}

type FilterType = "all" | AchievementRarity | "unlocked" | "locked";

export default function AchievementsPage({ onBack }: { onBack: () => void }) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const unlockedList = getUnlockedAchievements();
  const unlockedMap = new Map(unlockedList.map((u) => [u.id, u.unlockedAt]));
  const totalXP = getTotalXP();
  const unlockCount = getUnlockCount();
  const state = getAchievementState();

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unlocked", label: "Unlocked" },
    { key: "locked", label: "Locked" },
    { key: "common", label: "Common" },
    { key: "rare", label: "Rare" },
    { key: "epic", label: "Epic" },
    { key: "legendary", label: "Legendary" },
  ];

  const filtered = ACHIEVEMENTS.filter((a) => {
    if (filter === "all") return true;
    if (filter === "unlocked") return unlockedMap.has(a.id);
    if (filter === "locked") return !unlockedMap.has(a.id);
    return a.rarity === filter;
  });

  const sortedFiltered = [...filtered].sort((a, b) => {
    const aUnlocked = unlockedMap.has(a.id) ? 1 : 0;
    const bUnlocked = unlockedMap.has(b.id) ? 1 : 0;
    if (aUnlocked !== bUnlocked) return bUnlocked - aUnlocked;
    return RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity);
  });

  const totalAch = ACHIEVEMENTS.length;
  const xpPercent = Math.min(100, (totalXP / 2000) * 100);

  return (
    <div style={{ minHeight: "100vh", padding: "0 0 4rem" }}>
      <style>{`
        @keyframes achFadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes xpShimmer { 0% { background-position: 0% center; } 100% { background-position: 200% center; } }
        @keyframes legendaryPulse { 0%,100%{box-shadow:0 0 12px rgba(245,214,122,0.3);} 50%{box-shadow:0 0 28px rgba(245,214,122,0.7);} }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(4,1,10,0.92)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "0 2rem", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(245,214,122,0.5) 50%, transparent)" }} />
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", cursor: "pointer", color: "rgba(200,195,235,0.55)", padding: 0, fontSize: "0.6rem", fontFamily: "'Cinzel', serif", letterSpacing: "2px", textTransform: "uppercase", transition: "color 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(245,214,122,0.8)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(200,195,235,0.55)"; }}>
          ← Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ fontSize: "0.9rem" }}>🏆</span>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.72rem", fontWeight: 900, letterSpacing: "4px", textTransform: "uppercase", background: "linear-gradient(135deg, #F5D67A 0%, #E8B830 40%, #FFFFFF 60%, #F5D67A 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "xpShimmer 4s linear infinite" }}>
            Trophy Vault
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.55rem", color: "rgba(245,214,122,0.6)", fontFamily: "'Cinzel', serif", letterSpacing: "1.5px" }}>{unlockCount}/{totalAch}</span>
        </div>
      </div>

      <div style={{ padding: "2rem 2rem 0", opacity: mounted ? 1 : 0, animation: mounted ? "achFadeUp 0.55s ease both" : "none" }}>

        {/* ── XP BAR ── */}
        <div style={{ background: "rgba(8,3,20,0.85)", border: "1px solid rgba(245,214,122,0.12)", borderRadius: "18px", padding: "1.5rem 2rem", marginBottom: "2rem", backdropFilter: "blur(16px)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(245,214,122,0.45), transparent)" }} />

          <div style={{ display: "flex", alignItems: "flex-start", gap: "2.5rem", flexWrap: "wrap" }}>
            {/* XP Score */}
            <div>
              <div style={{ fontSize: "0.4rem", color: "rgba(245,214,122,0.4)", letterSpacing: "4px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.4rem" }}>Total Darkness XP</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: "2.5rem", fontWeight: 900, background: "linear-gradient(135deg, #F5D67A 0%, #E8B830 50%, #F5D67A 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "xpShimmer 5s linear infinite", lineHeight: 1 }}>
                {totalXP.toLocaleString()}
              </div>
              <div style={{ fontSize: "0.38rem", color: "rgba(245,214,122,0.3)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "2px", marginTop: "0.3rem" }}>XP ACCUMULATED</div>
            </div>

            {/* Divider */}
            <div style={{ width: "1px", background: "rgba(245,214,122,0.1)", alignSelf: "stretch", flexShrink: 0 }} />

            {/* Stats grid */}
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
              {[
                ["🏆", unlockCount.toString(), "Trophies"],
                ["📖", state.totalStories.toString(), "Stories"],
                [" ✍", state.totalWords.toLocaleString(), "Words"],
                ["🔥", state.streakCount.toString(), "Day Streak"],
              ].map(([icon, val, label]) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.1rem", lineHeight: 1, marginBottom: "0.3rem" }}>{icon}</div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", fontWeight: 900, color: "rgba(245,214,122,0.8)", lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: "0.38rem", color: "rgba(200,195,230,0.3)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginTop: "3px" }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Progress toward max */}
            <div style={{ flex: 1, minWidth: "180px", alignSelf: "center" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "0.4rem", color: "rgba(245,214,122,0.4)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "2px", textTransform: "uppercase" }}>Grimoire Power</span>
                <span style={{ fontSize: "0.4rem", color: "rgba(245,214,122,0.5)", fontFamily: "'Cinzel', serif" }}>{Math.round(xpPercent)}%</span>
              </div>
              <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${xpPercent}%`, background: "linear-gradient(90deg, #D4A017, #F5D67A, #D4A017)", backgroundSize: "200% 100%", animation: "xpShimmer 2.5s linear infinite", borderRadius: "3px", transition: "width 0.8s ease" }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── FILTER TABS ── */}
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {filters.map(({ key, label }) => {
            const active = filter === key;
            const pal = (key in RARITY_PALETTE) ? RARITY_PALETTE[key as AchievementRarity] : null;
            const count = key === "all" ? ACHIEVEMENTS.length
              : key === "unlocked" ? unlockCount
              : key === "locked" ? (totalAch - unlockCount)
              : ACHIEVEMENTS.filter((a) => a.rarity === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  padding: "0.4rem 0.9rem",
                  borderRadius: "30px",
                  border: `1px solid ${active ? (pal ? `rgba(${pal.rgb},0.65)` : "rgba(168,85,247,0.65)") : "rgba(255,255,255,0.08)"}`,
                  background: active ? (pal ? `rgba(${pal.rgb},0.15)` : "rgba(168,85,247,0.15)") : "rgba(255,255,255,0.03)",
                  color: active ? (pal ? pal.accent : "#C084FC") : "rgba(200,195,235,0.4)",
                  cursor: "pointer",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: "0.35rem",
                }}
              >
                {label}
                <span style={{ fontSize: "0.5rem", opacity: 0.65 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* ── GRID ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "0.75rem" }}>
          {sortedFiltered.map((ach) => (
            <AchievementCard
              key={ach.id}
              ach={ach}
              unlocked={unlockedMap.has(ach.id)}
              unlockedAt={unlockedMap.get(ach.id)}
              state={state}
            />
          ))}
        </div>

        {sortedFiltered.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 2rem", color: "rgba(180,175,210,0.25)", fontFamily: "'Cinzel', serif", fontSize: "0.72rem", letterSpacing: "3px" }}>
            Nothing to display in this filter
          </div>
        )}
      </div>
    </div>
  );
}
