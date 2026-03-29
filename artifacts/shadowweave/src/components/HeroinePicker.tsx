import { useState, useMemo } from "react";
import { ALL_HEROINES, HEROINE_UNIVERSES, UNIVERSE_LABELS } from "../lib/heroines";
import type { Heroine } from "../lib/heroines";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function heroSlug(name: string): string {
  return name.toLowerCase()
    .replace(/\//g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function heroImgSrc(name: string): string {
  return `${BASE}/heroes/${heroSlug(name)}.png`;
}

const UNIV_COLORS: Record<string, string> = {
  Marvel: "#FF6060",
  DC: "#60A0FF",
  CW: "#40E090",
  TB: "#FF3D00",
  PR: "#F472B6",
  Animated: "#FBBF24",
  SW: "#A78BFA",
  TV: "#94A3B8",
  Gaming: "#34D399",
  Film: "#C084FC",
};

interface Props {
  value: string;
  onChange: (name: string) => void;
  accentColor: string;
  accentRgb: string;
}

function LoreModal({ h, accentColor, accentRgb, onClose, onSelect, isSelected }: {
  h: Heroine; accentColor: string; accentRgb: string;
  onClose: () => void; onSelect: () => void; isSelected: boolean;
}) {
  const [imgErr, setImgErr] = useState(false);
  const univColor = UNIV_COLORS[h.universe] ?? "#888";

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "linear-gradient(160deg, rgba(10,5,22,0.99), rgba(18,8,32,0.99))", border: `1px solid ${univColor}33`, borderRadius: "24px", maxWidth: "520px", width: "100%", overflow: "hidden", boxShadow: `0 0 80px ${univColor}18, 0 20px 60px rgba(0,0,0,0.7)` }}
      >
        {/* Portrait */}
        <div style={{ height: "340px", position: "relative", overflow: "hidden", background: "rgba(0,0,0,0.7)" }}>
          {!imgErr ? (
            <img
              src={heroImgSrc(h.name)}
              alt={h.name}
              onError={() => setImgErr(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "7rem", background: `radial-gradient(circle at 50% 40%, ${univColor}11, transparent)` }}>{h.icon}</div>
          )}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(transparent, rgba(10,5,22,0.99))" }} />
          <div style={{ position: "absolute", top: "1rem", left: "1rem", padding: "0.2rem 0.7rem", borderRadius: "20px", background: `${univColor}22`, border: `1px solid ${univColor}55`, color: univColor, fontSize: "0.58rem", fontFamily: "'Cinzel', serif", letterSpacing: "2px" }}>
            {h.universe.toUpperCase()}
          </div>
          <button
            onClick={onClose}
            style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: "34px", height: "34px", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
          >✕</button>
          {/* Name over gradient */}
          <div style={{ position: "absolute", bottom: "1rem", left: "1.5rem", right: "1.5rem" }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1.6rem", color: "#F4F0FF", fontWeight: 700, letterSpacing: "1px", marginBottom: "0.1rem", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>{h.name}</div>
            <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.78rem", color: univColor, letterSpacing: "0.5px" }}>{h.alias}</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem 1.75rem 1.75rem" }}>
          {/* Powers block */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${univColor}22`, borderRadius: "14px", padding: "1.1rem 1.25rem", marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.5rem", fontFamily: "'Cinzel', serif", letterSpacing: "3px", color: `${univColor}88`, textTransform: "uppercase", marginBottom: "0.55rem" }}>Powers & Abilities</div>
            <div style={{ fontSize: "0.92rem", color: "rgba(225,218,250,0.9)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.65 }}>{h.power}</div>
          </div>

          {/* Icon + universe detail */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.4rem" }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "0.75rem 1rem", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.2rem" }}>{h.icon}</div>
              <div style={{ fontSize: "0.5rem", color: "rgba(200,195,225,0.3)", fontFamily: "'Cinzel', serif", letterSpacing: "2px" }}>SYMBOL</div>
            </div>
            <div style={{ flex: 2, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "0.75rem 1rem" }}>
              <div style={{ fontSize: "0.5rem", color: "rgba(200,195,225,0.3)", fontFamily: "'Cinzel', serif", letterSpacing: "2px", marginBottom: "0.4rem" }}>UNIVERSE</div>
              <div style={{ fontSize: "1rem", color: univColor, fontFamily: "'Cinzel', serif", fontWeight: 700 }}>{h.universe === "TB" ? "The Boys" : h.universe === "PR" ? "Power Rangers" : h.universe === "SW" ? "Star Wars" : h.universe === "CW" ? "CW / Arrowverse" : h.universe}</div>
              <div style={{ fontSize: "0.65rem", color: "rgba(200,195,225,0.4)", fontFamily: "'Raleway', sans-serif", marginTop: "0.2rem" }}>Real name: {h.alias}</div>
            </div>
          </div>

          <button
            onClick={() => { onSelect(); onClose(); }}
            style={{ width: "100%", padding: "0.9rem", background: isSelected ? `rgba(${accentRgb},0.25)` : `rgba(${accentRgb},0.12)`, border: `1px solid rgba(${accentRgb},${isSelected ? "0.7" : "0.4"})`, borderRadius: "14px", color: accentColor, fontFamily: "'Cinzel', serif", fontSize: "0.72rem", letterSpacing: "3px", cursor: "pointer", transition: "all 0.2s", textTransform: "uppercase" }}
          >
            {isSelected ? "✓  Selected" : "Select This Heroine"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HeroinePicker({ value, onChange, accentColor, accentRgb }: Props) {
  const [search, setSearch] = useState("");
  const [universe, setUniverse] = useState<string>("All");
  const [lore, setLore] = useState<Heroine | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ALL_HEROINES.filter(h => {
      const matchesUniverse = universe === "All" || h.universe === universe;
      const matchesSearch = !q || h.name.toLowerCase().includes(q) || h.alias.toLowerCase().includes(q) || h.power.toLowerCase().includes(q);
      return matchesUniverse && matchesSearch;
    });
  }, [search, universe]);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "0.3rem 0.65rem",
    borderRadius: "20px",
    border: `1px solid ${active ? accentColor : `rgba(${accentRgb},0.2)`}`,
    background: active ? `rgba(${accentRgb},0.14)` : "rgba(255,255,255,0.02)",
    color: active ? accentColor : `rgba(200,195,225,0.45)`,
    fontSize: "0.62rem",
    fontFamily: "'Cinzel', serif",
    letterSpacing: "1.5px",
    cursor: "pointer",
    transition: "all 0.15s",
    whiteSpace: "nowrap" as const,
  });

  function markImgError(name: string) {
    setImgErrors(prev => new Set([...prev, name]));
  }

  return (
    <div>
      {lore && (
        <LoreModal
          h={lore}
          accentColor={accentColor}
          accentRgb={accentRgb}
          onClose={() => setLore(null)}
          onSelect={() => onChange(lore.name)}
          isSelected={value === lore.name}
        />
      )}

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search heroines by name, alias or power…"
        style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${accentRgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.55rem 0.85rem", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" }}
      />

      {/* Universe tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.875rem" }}>
        <button style={tabStyle(universe === "All")} onClick={() => setUniverse("All")}>All ({ALL_HEROINES.length})</button>
        {HEROINE_UNIVERSES.map(u => {
          const count = ALL_HEROINES.filter(h => h.universe === u).length;
          return (
            <button key={u} style={tabStyle(universe === u)} onClick={() => setUniverse(u)}>
              {UNIVERSE_LABELS[u]} ({count})
            </button>
          );
        })}
      </div>

      {/* Portrait grid */}
      <div style={{ position: "relative" }}>
        <div
          id="heroine-grid-scroll"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(138px, 1fr))", gap: "0.5rem", maxHeight: "720px", overflowY: "auto", paddingRight: "4px", paddingBottom: "2px", scrollbarWidth: "thin", scrollbarColor: `rgba(${accentRgb},0.55) rgba(255,255,255,0.05)` }}
        >
        {filtered.map(h => {
          const isSel = value === h.name;
          const univColor = UNIV_COLORS[h.universe] ?? "#888";
          const hasImg = !imgErrors.has(h.name);
          return (
            <div
              key={h.name}
              style={{ position: "relative", borderRadius: "13px", border: `1px solid ${isSel ? accentColor : "rgba(255,255,255,0.07)"}`, background: "rgba(0,0,0,0.55)", overflow: "hidden", cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s", boxShadow: isSel ? `0 0 12px rgba(${accentRgb},0.3)` : "none" }}
              onClick={() => onChange(h.name)}
            >
              {/* Portrait area */}
              <div style={{ height: "118px", overflow: "hidden", background: `radial-gradient(circle at 50% 30%, ${univColor}08, rgba(0,0,0,0.7))`, position: "relative" }}>
                {hasImg ? (
                  <img
                    src={heroImgSrc(h.name)}
                    alt={h.name}
                    onError={() => markImgError(h.name)}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>{h.icon}</div>
                )}
                {/* Fade */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(transparent, rgba(0,0,0,0.9))" }} />
                {/* Universe dot */}
                <div style={{ position: "absolute", top: "0.45rem", left: "0.45rem", width: "7px", height: "7px", borderRadius: "50%", background: univColor, boxShadow: `0 0 5px ${univColor}` }} />
                {/* Info button */}
                <button
                  onClick={e => { e.stopPropagation(); setLore(h); }}
                  style={{ position: "absolute", top: "0.3rem", right: "0.3rem", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: "22px", height: "22px", color: "rgba(255,255,255,0.65)", cursor: "pointer", fontSize: "0.58rem", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", lineHeight: 1 }}
                  title="View full profile"
                >ℹ</button>
                {/* Selected indicator */}
                {isSel && (
                  <div style={{ position: "absolute", bottom: "0.35rem", right: "0.4rem", width: "16px", height: "16px", borderRadius: "50%", background: accentColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", color: "#000", fontWeight: 700 }}>✓</div>
                )}
              </div>

              {/* Text info */}
              <div style={{ padding: "0.5rem 0.6rem 0.65rem" }}>
                <div style={{ fontSize: "0.67rem", color: isSel ? accentColor : "rgba(225,218,250,0.92)", fontFamily: "'Cinzel', serif", fontWeight: 700, lineHeight: 1.25, marginBottom: "0.2rem" }}>{h.name}</div>
                <div style={{ fontSize: "0.52rem", color: univColor, fontFamily: "'Raleway', sans-serif", marginBottom: "0.2rem", lineHeight: 1.2 }}>{h.alias}</div>
                <div style={{ fontSize: "0.5rem", color: "rgba(200,195,225,0.32)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{h.power}</div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "2.5rem", color: `rgba(${accentRgb},0.3)`, fontSize: "0.75rem", fontFamily: "'Cinzel', serif" }}>No heroines match your search</div>
        )}
        </div>{/* end scroll div */}
        {filtered.length > 10 && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 6, height: "52px", background: `linear-gradient(transparent, rgba(6,2,14,0.94))`, pointerEvents: "none", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "6px" }}>
            <span style={{ fontSize: "0.48rem", color: `rgba(${accentRgb},0.6)`, fontFamily: "'Cinzel', serif", letterSpacing: "2.5px" }}>↕  SCROLL TO SEE ALL {filtered.length} HEROINES</span>
          </div>
        )}
      </div>{/* end relative wrapper */}

      {/* Result count */}
      {filtered.length > 0 && (
        <div style={{ fontSize: "0.57rem", color: "rgba(200,195,225,0.2)", fontFamily: "'Cinzel', serif", letterSpacing: "2px", textAlign: "right", marginTop: "0.5rem" }}>
          {filtered.length} / {ALL_HEROINES.length} HEROINES
        </div>
      )}

      {/* Custom input */}
      <input
        value={value && !ALL_HEROINES.some(h => h.name === value) ? value : ""}
        onChange={e => onChange(e.target.value)}
        placeholder="Or type a custom heroine name…"
        style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${accentRgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.55rem 0.85rem", outline: "none", boxSizing: "border-box", marginTop: "0.75rem" }}
      />
    </div>
  );
}
