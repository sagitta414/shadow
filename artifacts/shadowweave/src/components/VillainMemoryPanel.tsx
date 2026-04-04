import { useState, useEffect } from "react";
import { getArchive } from "../lib/archive";

interface MemoryData {
  preferredTactics: string[];
  knownEffective: string[];
  knownIneffective: string[];
  psychologicalApproach: string;
  villainSignature: string;
  warningToTarget: string;
}

interface Props {
  villain: string;
  heroineColor?: string;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function VillainMemoryPanel({ villain, heroineColor = "#C8A830" }: Props) {
  const [memory, setMemory] = useState<MemoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    if (loaded) { setOpen(!open); return; }
    setLoading(true); setOpen(true);
    try {
      const archive = getArchive();
      const villainStories = archive
        .filter(s => s.characters.some(c => c.toLowerCase().includes(villain.toLowerCase())) || (s.tool ?? "").toLowerCase().includes("faction"))
        .slice(0, 6)
        .map(s => ({ heroine: s.characters.find(c => !c.toLowerCase().includes(villain.toLowerCase())) ?? s.characters[0] ?? "Unknown", summary: s.chapters.slice(0, 2).join(" ").slice(0, 500) }));

      const resp = await fetch(`${BASE}/api/story/villain-memory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ villain, archiveEntries: villainStories }),
      });
      const json = await resp.json();
      if (json.memory) { setMemory(json.memory); setLoaded(true); }
    } finally { setLoading(false); }
  }

  const archive = getArchive();
  const caseCount = archive.filter(s => s.characters.some(c => c.toLowerCase().includes(villain.toLowerCase()))).length;

  return (
    <div style={{ margin: "0.75rem 0", background: "rgba(0,0,0,0.5)", border: `1px solid ${heroineColor}15`, borderRadius: "8px", overflow: "hidden" }}>
      <style>{`@keyframes vm-pulse { 0%,100%{opacity:0.7;}50%{opacity:1;} }`}</style>
      <button onClick={load} style={{ width: "100%", padding: "0.6rem 1rem", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontFamily: "'Courier New',monospace", fontSize: "0.42rem", color: "rgba(200,195,215,0.3)", letterSpacing: "3px", textTransform: "uppercase" }}>🧠 VILLAIN MEMORY</span>
          {caseCount > 0 && <span style={{ padding: "0.1rem 0.4rem", background: `${heroineColor}18`, border: `1px solid ${heroineColor}33`, borderRadius: "8px", fontFamily: "'Courier New',monospace", fontSize: "0.38rem", color: `${heroineColor}88` }}>{caseCount} PRIOR {caseCount === 1 ? "CASE" : "CASES"}</span>}
          {loading && <span style={{ fontFamily: "'Courier New',monospace", fontSize: "0.38rem", color: "rgba(200,195,215,0.25)", animation: "vm-pulse 1.2s infinite" }}>LOADING…</span>}
        </div>
        <span style={{ color: "rgba(200,195,215,0.25)", fontSize: "0.45rem" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && memory && (
        <div style={{ padding: "0 1rem 0.85rem", borderTop: `1px solid ${heroineColor}10` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginTop: "0.65rem" }}>
            {/* Preferred tactics */}
            <div style={{ padding: "0.55rem 0.75rem", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "6px" }}>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.38rem", color: heroineColor, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.35rem" }}>PREFERRED TACTICS</div>
              {memory.preferredTactics.slice(0, 3).map((t, i) => <div key={i} style={{ fontFamily: "'Courier New',monospace", fontSize: "0.44rem", color: "rgba(200,195,215,0.55)", lineHeight: 1.7 }}>— {t}</div>)}
            </div>

            {/* Known effective */}
            <div style={{ padding: "0.55rem 0.75rem", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "6px" }}>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.38rem", color: "#34D399", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.35rem" }}>KNOWN EFFECTIVE</div>
              {memory.knownEffective.slice(0, 3).map((e, i) => <div key={i} style={{ fontFamily: "'Courier New',monospace", fontSize: "0.44rem", color: "rgba(200,195,215,0.55)", lineHeight: 1.7 }}>✓ {e}</div>)}
            </div>

            {/* Psych approach */}
            <div style={{ padding: "0.55rem 0.75rem", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "6px", gridColumn: "1/-1" }}>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.38rem", color: "#60A5FA", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.25rem" }}>PSYCHOLOGICAL APPROACH</div>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.46rem", color: "rgba(200,195,215,0.6)", lineHeight: 1.7 }}>{memory.psychologicalApproach}</div>
            </div>

            {/* Warning to target */}
            <div style={{ padding: "0.55rem 0.75rem", background: "rgba(200,0,0,0.04)", border: "1px solid rgba(200,0,0,0.12)", borderLeft: "2px solid rgba(200,0,0,0.3)", borderRadius: "6px", gridColumn: "1/-1" }}>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.38rem", color: "#EF4444", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.25rem" }}>⚠ WARNING</div>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.46rem", color: "rgba(220,180,180,0.65)", lineHeight: 1.7, fontStyle: "italic" }}>{memory.warningToTarget}</div>
            </div>
          </div>

          {caseCount === 0 && (
            <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.42rem", color: "rgba(200,195,215,0.2)", textAlign: "center", padding: "0.5rem 0", marginTop: "0.25rem" }}>No prior cases in archive — profile generated from behavioral patterns.</div>
          )}
        </div>
      )}

      {open && !memory && !loading && (
        <div style={{ padding: "0.75rem 1rem", fontFamily: "'Courier New',monospace", fontSize: "0.42rem", color: "rgba(200,195,215,0.2)", textAlign: "center" }}>No memory data available.</div>
      )}
    </div>
  );
}
