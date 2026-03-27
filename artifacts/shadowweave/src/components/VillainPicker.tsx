import { useState, useMemo } from "react";
import { VILLAINS, VILLAIN_UNIVERSES } from "../lib/villains";

const UNIVERSE_LABELS: Record<string, string> = {
  Marvel: "Marvel",
  DC: "DC",
  CW: "Arrowverse",
  TB: "The Boys",
  PR: "Power Rangers",
  SW: "Star Wars",
  Animated: "Animated",
};

interface Props {
  value: string;
  onChange: (name: string) => void;
  accentColor: string;
  accentRgb: string;
  label?: string;
  allowCustom?: boolean;
}

export default function VillainPicker({ value, onChange, accentColor, accentRgb, label = "SELECT VILLAIN", allowCustom = true }: Props) {
  const [search, setSearch] = useState("");
  const [universe, setUniverse] = useState<string>("All");

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

  const cardStyle = (selected: boolean): React.CSSProperties => ({
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
    padding: "0.55rem 0.7rem",
    borderRadius: "10px",
    border: `1px solid ${selected ? accentColor : `rgba(${accentRgb},0.15)`}`,
    background: selected ? `rgba(${accentRgb},0.12)` : "rgba(255,255,255,0.02)",
    cursor: "pointer",
    transition: "all 0.15s",
    outline: selected ? `1px solid rgba(${accentRgb},0.3)` : "none",
    textAlign: "left",
  });

  const isCustom = value && !VILLAINS.some(v => v.name === value);

  return (
    <div>
      <div style={{ fontSize: "0.57rem", color: `rgba(${accentRgb},0.5)`, fontFamily: "'Cinzel', serif", letterSpacing: "2.5px", marginBottom: "0.6rem" }}>{label}</div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search villains…"
        style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${accentRgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.5rem 0.8rem", outline: "none", boxSizing: "border-box", marginBottom: "0.65rem" }}
      />

      {/* Universe tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.75rem" }}>
        <button style={tabStyle(universe === "All")} onClick={() => setUniverse("All")}>All</button>
        {VILLAIN_UNIVERSES.map(u => (
          <button key={u} style={tabStyle(universe === u)} onClick={() => setUniverse(u)}>
            {UNIVERSE_LABELS[u]}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: "0.45rem", maxHeight: "280px", overflowY: "auto", paddingRight: "4px" }}>
        {filtered.map(v => (
          <button key={v.name} onClick={() => onChange(v.name)} style={cardStyle(value === v.name)}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ fontSize: "0.9rem" }}>{v.icon}</span>
              <span style={{ fontSize: "0.7rem", color: value === v.name ? accentColor : "rgba(220,215,245,0.85)", fontFamily: "'Cinzel', serif", fontWeight: 700, lineHeight: 1.2 }}>{v.name}</span>
            </div>
            <div style={{ fontSize: "0.55rem", color: "rgba(200,195,225,0.3)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.3 }}>{v.scheme.slice(0, 55)}{v.scheme.length > 55 ? "…" : ""}</div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "1.5rem", color: `rgba(${accentRgb},0.3)`, fontSize: "0.75rem", fontFamily: "'Cinzel', serif" }}>No villains match</div>
        )}
      </div>

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
