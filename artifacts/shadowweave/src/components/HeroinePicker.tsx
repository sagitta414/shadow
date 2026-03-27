import { useState, useMemo } from "react";
import { ALL_HEROINES, HEROINE_UNIVERSES, UNIVERSE_LABELS } from "../lib/heroines";

interface Props {
  value: string;
  onChange: (name: string) => void;
  accentColor: string;
  accentRgb: string;
}

export default function HeroinePicker({ value, onChange, accentColor, accentRgb }: Props) {
  const [search, setSearch] = useState("");
  const [universe, setUniverse] = useState<string>("All");

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

  const cardStyle = (selected: boolean): React.CSSProperties => ({
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    padding: "0.6rem 0.75rem",
    borderRadius: "10px",
    border: `1px solid ${selected ? accentColor : `rgba(${accentRgb},0.15)`}`,
    background: selected ? `rgba(${accentRgb},0.12)` : "rgba(255,255,255,0.02)",
    cursor: "pointer",
    transition: "all 0.15s",
    outline: selected ? `1px solid rgba(${accentRgb},0.3)` : "none",
  });

  return (
    <div>
      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search heroines…"
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

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.5rem", maxHeight: "320px", overflowY: "auto", paddingRight: "4px" }}>
        {filtered.map(h => (
          <button
            key={h.name}
            onClick={() => onChange(h.name)}
            style={cardStyle(value === h.name)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "1rem" }}>{h.icon}</span>
              <span style={{ fontSize: "0.72rem", color: value === h.name ? accentColor : "rgba(220,215,245,0.85)", fontFamily: "'Cinzel', serif", fontWeight: 700, lineHeight: 1.2, textAlign: "left" }}>{h.name}</span>
            </div>
            <div style={{ fontSize: "0.57rem", color: "rgba(200,195,225,0.35)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.4, textAlign: "left" }}>{h.power}</div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "2rem", color: `rgba(${accentRgb},0.3)`, fontSize: "0.75rem", fontFamily: "'Cinzel', serif" }}>No heroines match your search</div>
        )}
      </div>

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
