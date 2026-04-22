import { useState, useMemo, useEffect } from "react";
import { VILLAINS, VILLAIN_UNIVERSES } from "../lib/villains";
import type { Villain } from "../lib/villains";
import {
  getVillainUnlockStatus,
  isVillainLocked,
  getNewlyUnlockedVillains,
  markVillainUnlockSeen,
  getTotalLockedCount,
} from "../lib/villainUnlocks";
import type { VillainUnlockStatus } from "../lib/villainUnlocks";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const UNIVERSE_LABELS: Record<string, string> = {
  Marvel: "Marvel",
  DC: "DC",
  CW: "Arrowverse",
  TB: "The Boys",
  PR: "Power Rangers",
  SW: "Star Wars",
  Animated: "Animated",
};

const UNIV_COLORS: Record<string, string> = {
  Marvel: "#FF6060",
  DC: "#60A0FF",
  CW: "#40E090",
  TB: "#FF3D00",
  PR: "#F472B6",
  SW: "#A78BFA",
  Animated: "#FBBF24",
};

const TIER_COLORS: Record<1 | 2 | 3, string> = {
  1: "#F59E0B",
  2: "#A855F7",
  3: "#EF4444",
};

function villainSlug(name: string): string {
  return name.toLowerCase()
    .replace(/\//g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function villainImgSrc(name: string): string {
  return `${BASE}/villains/${villainSlug(name)}.png`;
}

interface Props {
  value: string;
  onChange: (name: string) => void;
  accentColor: string;
  accentRgb: string;
  label?: string;
  allowCustom?: boolean;
}

function VillainLoreModal({ v, accentColor, accentRgb, onClose, onSelect, isSelected, unlockStatus }: {
  v: Villain; accentColor: string; accentRgb: string;
  onClose: () => void; onSelect: () => void; isSelected: boolean;
  unlockStatus: VillainUnlockStatus | null;
}) {
  const [imgErr, setImgErr] = useState(false);
  const univColor = UNIV_COLORS[v.universe] ?? "#EF4444";
  const locked = unlockStatus?.locked ?? false;

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "linear-gradient(160deg, rgba(10,4,18,0.99), rgba(20,6,28,0.99))", border: `1px solid ${locked ? "rgba(255,255,255,0.08)" : `${univColor}33`}`, borderRadius: "24px", maxWidth: "520px", width: "100%", overflow: "hidden", boxShadow: locked ? "0 20px 60px rgba(0,0,0,0.8)" : `0 0 80px ${univColor}18, 0 20px 60px rgba(0,0,0,0.8)` }}
      >
        {/* Portrait */}
        <div style={{ height: "340px", position: "relative", overflow: "hidden", background: "rgba(0,0,0,0.8)" }}>
          {!imgErr ? (
            <img
              src={villainImgSrc(v.name)}
              alt={v.name}
              onError={() => setImgErr(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", filter: locked ? "grayscale(1) brightness(0.35)" : "none", transition: "filter 0.3s" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "7rem", background: `radial-gradient(circle at 50% 40%, ${locked ? "rgba(80,80,80,0.15)" : `${univColor}11`}, transparent)`, filter: locked ? "grayscale(1)" : "none" }}>{v.icon}</div>
          )}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(transparent, rgba(10,4,18,0.99))" }} />

          {/* Lock overlay */}
          {locked && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <div style={{ fontSize: "3rem", filter: "drop-shadow(0 0 12px rgba(255,200,80,0.6))" }}>🔒</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "3px", color: "rgba(255,200,80,0.8)", textTransform: "uppercase" }}>LOCKED</div>
            </div>
          )}

          {/* Universe badge */}
          {!locked && (
            <div style={{ position: "absolute", top: "1rem", left: "1rem", padding: "0.2rem 0.7rem", borderRadius: "20px", background: `${univColor}22`, border: `1px solid ${univColor}55`, color: univColor, fontSize: "0.58rem", fontFamily: "'Cinzel', serif", letterSpacing: "2px" }}>
              {UNIVERSE_LABELS[v.universe]?.toUpperCase() ?? v.universe.toUpperCase()}
            </div>
          )}

          {/* Tier badge when locked */}
          {locked && unlockStatus && (
            <div style={{ position: "absolute", top: "1rem", left: "1rem", padding: "0.2rem 0.7rem", borderRadius: "20px", background: `${TIER_COLORS[unlockStatus.tier]}22`, border: `1px solid ${TIER_COLORS[unlockStatus.tier]}55`, color: TIER_COLORS[unlockStatus.tier], fontSize: "0.58rem", fontFamily: "'Cinzel', serif", letterSpacing: "2px" }}>
              TIER {unlockStatus.tier}
            </div>
          )}

          <button
            onClick={onClose}
            style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: "34px", height: "34px", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
          >✕</button>

          {/* Name over gradient */}
          <div style={{ position: "absolute", bottom: "1rem", left: "1.5rem", right: "1.5rem" }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1.7rem", color: locked ? "rgba(200,190,220,0.45)" : "#FFF0F0", fontWeight: 700, letterSpacing: "1px", marginBottom: "0.15rem", textShadow: "0 2px 16px rgba(0,0,0,0.9)" }}>{v.name}</div>
            <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.65rem", color: locked ? "rgba(200,190,220,0.3)" : "rgba(255,200,200,0.45)", letterSpacing: "1px", textTransform: "uppercase" }}>{locked ? "THREAT LEVEL: CLASSIFIED" : "Threat Level: Active"}</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem 1.75rem 1.75rem" }}>
          {locked && unlockStatus ? (
            <>
              {/* Flavor text */}
              <div style={{ background: "rgba(255,200,80,0.05)", border: "1px solid rgba(255,200,80,0.15)", borderRadius: "14px", padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
                <div style={{ fontSize: "0.5rem", fontFamily: "'Cinzel', serif", letterSpacing: "3px", color: "rgba(255,200,80,0.5)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Intelligence Report</div>
                <div style={{ fontSize: "0.88rem", color: "rgba(255,235,200,0.7)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.65, fontStyle: "italic" }}>{unlockStatus.flavor}</div>
              </div>
              {/* Unlock condition */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
                <div style={{ fontSize: "0.5rem", fontFamily: "'Cinzel', serif", letterSpacing: "3px", color: "rgba(200,190,220,0.35)", textTransform: "uppercase", marginBottom: "0.55rem" }}>Unlock Condition</div>
                <div style={{ fontSize: "0.88rem", color: "rgba(255,220,180,0.8)", fontFamily: "'Raleway', sans-serif", marginBottom: "0.75rem" }}>{unlockStatus.hint}</div>
                {/* Progress bar */}
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "100px", height: "6px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${unlockStatus.progress * 100}%`, background: `linear-gradient(90deg, ${TIER_COLORS[unlockStatus.tier]}, ${TIER_COLORS[unlockStatus.tier]}88)`, borderRadius: "100px", transition: "width 0.4s" }} />
                </div>
                <div style={{ fontSize: "0.52rem", color: "rgba(200,190,220,0.3)", fontFamily: "'Cinzel', serif", marginTop: "0.4rem", textAlign: "right", letterSpacing: "1px" }}>
                  {unlockStatus.type === "words" ? `${unlockStatus.current.toLocaleString()} / ${unlockStatus.threshold.toLocaleString()} words` : `${unlockStatus.current} / ${unlockStatus.threshold}`}
                </div>
              </div>
              <button
                disabled
                style={{ width: "100%", padding: "0.9rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", color: "rgba(200,190,220,0.25)", fontFamily: "'Cinzel', serif", fontSize: "0.72rem", letterSpacing: "3px", cursor: "not-allowed", textTransform: "uppercase" }}
              >🔒  Still Locked</button>
            </>
          ) : (
            <>
              {/* Scheme */}
              <div style={{ background: `${univColor}0D`, border: `1px solid ${univColor}22`, borderRadius: "14px", padding: "1.1rem 1.25rem", marginBottom: "1.25rem" }}>
                <div style={{ fontSize: "0.5rem", fontFamily: "'Cinzel', serif", letterSpacing: "3px", color: `${univColor}88`, textTransform: "uppercase", marginBottom: "0.55rem" }}>Master Plan</div>
                <div style={{ fontSize: "0.92rem", color: "rgba(255,230,230,0.88)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.65 }}>{v.scheme}</div>
              </div>

              {/* Icon + universe */}
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.4rem" }}>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "0.75rem 1rem", textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.2rem" }}>{v.icon}</div>
                  <div style={{ fontSize: "0.5rem", color: "rgba(200,195,225,0.3)", fontFamily: "'Cinzel', serif", letterSpacing: "2px" }}>SYMBOL</div>
                </div>
                <div style={{ flex: 2, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "0.75rem 1rem" }}>
                  <div style={{ fontSize: "0.5rem", color: "rgba(200,195,225,0.3)", fontFamily: "'Cinzel', serif", letterSpacing: "2px", marginBottom: "0.4rem" }}>UNIVERSE</div>
                  <div style={{ fontSize: "1rem", color: univColor, fontFamily: "'Cinzel', serif", fontWeight: 700 }}>
                    {UNIVERSE_LABELS[v.universe] ?? v.universe}
                  </div>
                  <div style={{ fontSize: "0.62rem", color: "rgba(200,190,220,0.35)", fontFamily: "'Raleway', sans-serif", marginTop: "0.3rem", lineHeight: 1.3 }}>
                    {v.universe === "Marvel" ? "Marvel Comics / MCU" : v.universe === "DC" ? "DC Comics / DCEU" : v.universe === "CW" ? "The CW Arrowverse" : v.universe === "TB" ? "Amazon Prime — The Boys" : v.universe === "PR" ? "Power Rangers Franchise" : v.universe === "SW" ? "Star Wars Universe" : "Animated / Disney"}
                  </div>
                </div>
              </div>

              <button
                onClick={() => { onSelect(); onClose(); }}
                style={{ width: "100%", padding: "0.9rem", background: isSelected ? `rgba(${accentRgb},0.25)` : `rgba(${accentRgb},0.12)`, border: `1px solid rgba(${accentRgb},${isSelected ? "0.7" : "0.4"})`, borderRadius: "14px", color: accentColor, fontFamily: "'Cinzel', serif", fontSize: "0.72rem", letterSpacing: "3px", cursor: "pointer", transition: "all 0.2s", textTransform: "uppercase" }}
              >
                {isSelected ? "✓  Selected" : "Select This Villain"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VillainPicker({ value, onChange, accentColor, accentRgb, label = "SELECT VILLAIN", allowCustom = true }: Props) {
  const [search, setSearch] = useState("");
  const [universe, setUniverse] = useState<string>("All");
  const [lore, setLore] = useState<Villain | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  useEffect(() => {
    const fresh = getNewlyUnlockedVillains();
    if (fresh.length > 0) {
      setNewlyUnlocked(fresh.map(v => v.name));
    }
  }, []);

  function handleDismissBanner() {
    newlyUnlocked.forEach(name => markVillainUnlockSeen(name));
    setNewlyUnlocked([]);
    setDismissedBanner(true);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return VILLAINS.filter(v => {
      const matchesUniverse = universe === "All" || v.universe === universe;
      const matchesSearch = !q || v.name.toLowerCase().includes(q) || v.scheme.toLowerCase().includes(q);
      return matchesUniverse && matchesSearch;
    });
  }, [search, universe]);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "0.3rem 0.6rem",
    borderRadius: "20px",
    border: `1px solid ${active ? accentColor : `rgba(${accentRgb},0.2)`}`,
    background: active ? `rgba(${accentRgb},0.14)` : "rgba(255,255,255,0.02)",
    color: active ? accentColor : `rgba(200,195,225,0.45)`,
    fontSize: "0.6rem",
    fontFamily: "'Cinzel', serif",
    letterSpacing: "1.5px",
    cursor: "pointer",
    transition: "all 0.15s",
    whiteSpace: "nowrap" as const,
  });

  const isCustom = value && !VILLAINS.some(v => v.name === value);
  const totalLocked = getTotalLockedCount();

  function markImgError(name: string) {
    setImgErrors(prev => new Set([...prev, name]));
  }

  return (
    <div>
      {lore && (
        <VillainLoreModal
          v={lore}
          accentColor={accentColor}
          accentRgb={accentRgb}
          onClose={() => setLore(null)}
          onSelect={() => { if (!isVillainLocked(lore.name)) onChange(lore.name); }}
          isSelected={value === lore.name}
          unlockStatus={getVillainUnlockStatus(lore.name)}
        />
      )}

      <div style={{ fontSize: "0.57rem", color: `rgba(${accentRgb},0.5)`, fontFamily: "'Cinzel', serif", letterSpacing: "2.5px", marginBottom: "0.6rem" }}>{label}</div>

      {/* Newly unlocked banner */}
      {newlyUnlocked.length > 0 && !dismissedBanner && (
        <div style={{ background: "linear-gradient(135deg, rgba(34,12,54,0.95), rgba(20,6,36,0.98))", border: "1px solid rgba(168,85,247,0.5)", borderRadius: "12px", padding: "0.85rem 1rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem", boxShadow: "0 0 24px rgba(168,85,247,0.15)" }}>
          <div style={{ fontSize: "1.4rem", flexShrink: 0 }}>🔓</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "2px", color: "#C084FC", textTransform: "uppercase", marginBottom: "0.2rem" }}>New Villain{newlyUnlocked.length > 1 ? "s" : ""} Unlocked</div>
            <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.72rem", color: "rgba(230,210,255,0.85)" }}>
              {newlyUnlocked.join(", ")} {newlyUnlocked.length > 1 ? "are" : "is"} now available
            </div>
          </div>
          <button
            onClick={handleDismissBanner}
            style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "8px", color: "#C084FC", cursor: "pointer", fontSize: "0.6rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", padding: "0.3rem 0.65rem", whiteSpace: "nowrap" }}
          >Dismiss</button>
        </div>
      )}

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search villains by name or scheme…"
        style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${accentRgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.5rem 0.8rem", outline: "none", boxSizing: "border-box", marginBottom: "0.65rem" }}
      />

      {/* Universe tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.75rem" }}>
        <button style={tabStyle(universe === "All")} onClick={() => setUniverse("All")}>All ({VILLAINS.length})</button>
        {VILLAIN_UNIVERSES.map(u => {
          const count = VILLAINS.filter(v => v.universe === u).length;
          return (
            <button key={u} style={tabStyle(universe === u)} onClick={() => setUniverse(u)}>
              {UNIVERSE_LABELS[u]} ({count})
            </button>
          );
        })}
      </div>

      {/* Portrait grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(138px, 1fr))", gap: "0.5rem", maxHeight: "500px", overflowY: "auto", paddingRight: "4px", scrollbarWidth: "thin", scrollbarColor: `rgba(${accentRgb},0.2) transparent` }}>
        {filtered.map(v => {
          const isSel = value === v.name;
          const univColor = UNIV_COLORS[v.universe] ?? "#EF4444";
          const hasImg = !imgErrors.has(v.name);
          const unlockStatus = getVillainUnlockStatus(v.name);
          const locked = unlockStatus?.locked ?? false;
          const isNew = newlyUnlocked.includes(v.name);

          return (
            <div
              key={v.name}
              style={{
                position: "relative", borderRadius: "13px",
                border: isNew ? "1px solid rgba(168,85,247,0.7)" : locked ? "1px solid rgba(255,255,255,0.05)" : `1px solid ${isSel ? accentColor : "rgba(255,255,255,0.07)"}`,
                background: locked ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.6)",
                overflow: "hidden",
                cursor: locked ? "default" : "pointer",
                transition: "border-color 0.15s, box-shadow 0.15s",
                boxShadow: isNew ? "0 0 16px rgba(168,85,247,0.25)" : isSel ? `0 0 12px rgba(${accentRgb},0.3)` : "none",
                opacity: locked ? 0.75 : 1,
              }}
              onClick={() => { if (!locked) onChange(v.name); else setLore(v); }}
            >
              {/* Portrait area */}
              <div style={{ height: "118px", overflow: "hidden", background: `radial-gradient(circle at 50% 30%, ${locked ? "rgba(30,20,40,0.8)" : `${univColor}08`}, rgba(0,0,0,0.7))`, position: "relative" }}>
                {hasImg ? (
                  <img
                    src={villainImgSrc(v.name)}
                    alt={v.name}
                    onError={() => markImgError(v.name)}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block", filter: locked ? "grayscale(1) brightness(0.3)" : "none", transition: "filter 0.3s" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", filter: locked ? "grayscale(1) opacity(0.35)" : "none" }}>{v.icon}</div>
                )}
                {/* Fade */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(transparent, rgba(0,0,0,0.92))" }} />

                {/* Lock overlay */}
                {locked && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                    <div style={{ fontSize: "1.6rem", filter: "drop-shadow(0 0 6px rgba(255,200,80,0.5))" }}>🔒</div>
                    {unlockStatus && (
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.38rem", letterSpacing: "2px", color: `${TIER_COLORS[unlockStatus.tier]}CC`, textTransform: "uppercase" }}>TIER {unlockStatus.tier}</div>
                    )}
                  </div>
                )}

                {/* Universe dot (only when unlocked) */}
                {!locked && (
                  <div style={{ position: "absolute", top: "0.45rem", left: "0.45rem", width: "7px", height: "7px", borderRadius: "50%", background: univColor, boxShadow: `0 0 5px ${univColor}` }} />
                )}

                {/* "NEW" badge */}
                {isNew && (
                  <div style={{ position: "absolute", top: "0.35rem", left: "0.35rem", background: "rgba(168,85,247,0.9)", borderRadius: "6px", padding: "0.1rem 0.35rem", fontSize: "0.42rem", fontFamily: "'Cinzel', serif", letterSpacing: "1.5px", color: "#FFF", textTransform: "uppercase" }}>NEW</div>
                )}

                {/* Info button */}
                <button
                  onClick={e => { e.stopPropagation(); setLore(v); }}
                  style={{ position: "absolute", top: "0.3rem", right: "0.3rem", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: "22px", height: "22px", color: "rgba(255,255,255,0.65)", cursor: "pointer", fontSize: "0.58rem", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", lineHeight: 1 }}
                  title={locked ? "View unlock condition" : "View full profile"}
                >ℹ</button>

                {/* Selected check */}
                {isSel && !locked && (
                  <div style={{ position: "absolute", bottom: "0.35rem", right: "0.4rem", width: "16px", height: "16px", borderRadius: "50%", background: accentColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", color: "#000", fontWeight: 700 }}>✓</div>
                )}
              </div>

              {/* Text info */}
              <div style={{ padding: "0.5rem 0.6rem 0.65rem" }}>
                <div style={{ fontSize: "0.67rem", color: locked ? "rgba(200,190,220,0.3)" : isSel ? accentColor : "rgba(255,235,235,0.92)", fontFamily: "'Cinzel', serif", fontWeight: 700, lineHeight: 1.25, marginBottom: "0.2rem" }}>{v.name}</div>

                {locked && unlockStatus ? (
                  <>
                    <div style={{ fontSize: "0.48rem", color: `${TIER_COLORS[unlockStatus.tier]}88`, fontFamily: "'Raleway', sans-serif", marginBottom: "0.3rem", lineHeight: 1.2 }}>{unlockStatus.hint}</div>
                    {/* Progress bar */}
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "100px", height: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${unlockStatus.progress * 100}%`, background: TIER_COLORS[unlockStatus.tier], borderRadius: "100px" }} />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "0.52rem", color: univColor, fontFamily: "'Raleway', sans-serif", marginBottom: "0.2rem", lineHeight: 1.2 }}>{UNIVERSE_LABELS[v.universe] ?? v.universe}</div>
                    <div style={{ fontSize: "0.5rem", color: "rgba(200,195,225,0.3)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{v.scheme}</div>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "2.5rem", color: `rgba(${accentRgb},0.3)`, fontSize: "0.75rem", fontFamily: "'Cinzel', serif" }}>No villains match</div>
        )}
      </div>

      {/* Result count + locked count */}
      {filtered.length > 0 && (
        <div style={{ fontSize: "0.57rem", color: "rgba(200,195,225,0.2)", fontFamily: "'Cinzel', serif", letterSpacing: "2px", textAlign: "right", marginTop: "0.5rem", display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: totalLocked > 0 ? "rgba(255,200,80,0.3)" : "transparent" }}>🔒 {totalLocked} LOCKED</span>
          <span>{filtered.length} / {VILLAINS.length} VILLAINS</span>
        </div>
      )}

      {/* Custom */}
      {allowCustom && (
        <input
          value={isCustom ? value : ""}
          onChange={e => onChange(e.target.value)}
          placeholder="Or type a custom villain…"
          style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${accentRgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.5rem 0.8rem", outline: "none", boxSizing: "border-box", marginTop: "0.65rem" }}
        />
      )}

      {/* Selected display */}
      {value && (
        <div style={{ marginTop: "0.5rem", padding: "0.4rem 0.75rem", background: `rgba(${accentRgb},0.08)`, border: `1px solid rgba(${accentRgb},0.2)`, borderRadius: "6px", fontSize: "0.65rem", color: accentColor, fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>
          Selected: {value}
        </div>
      )}
    </div>
  );
}
