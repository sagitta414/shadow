import { useState, useEffect } from "react";
import { getDailyArchive, DailyEntry } from "../lib/archive";

interface Props {
  onBack: () => void;
}

export default function DailyChronicle({ onBack }: Props) {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setEntries(getDailyArchive());
  }, []);

  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "2rem 1.5rem", minHeight: "100vh" }}>
      <style>{`
        @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.3; transform:scale(0.5); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <div style={{ padding: "0.25rem 0.85rem", background: "rgba(200,168,75,0.12)", border: "1px solid rgba(200,168,75,0.35)", borderRadius: "20px", fontSize: "0.62rem", color: "rgba(200,168,75,0.9)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "2px", textTransform: "uppercase" }}>
              ◆ Daily Chronicle
            </div>
          </div>
          <h1 style={{ margin: 0, fontFamily: "'Cinzel', serif", fontSize: "clamp(1.3rem, 3vw, 2rem)", fontWeight: 900, background: "linear-gradient(135deg, #E8D08A 0%, #C8A830 45%, #A07030 80%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            THE DARK CHRONICLE
          </h1>
          <p style={{ margin: "0.4rem 0 0", fontFamily: "'Raleway', sans-serif", fontSize: "0.75rem", color: "rgba(200,168,75,0.35)", letterSpacing: "1px" }}>
            Every daily scenario auto-saved here — one story per night
          </p>
        </div>
        <button onClick={onBack} style={{ background: "none", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "0.5rem 1rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.72rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s", flexShrink: 0 }}>
          ← Back
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem", padding: "1rem 1.5rem", background: "rgba(8,4,20,0.7)", border: "1px solid rgba(200,168,75,0.08)", borderRadius: "10px", flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1.4rem", fontWeight: 900, color: "rgba(200,168,75,0.8)", lineHeight: 1 }}>{entries.length}</div>
          <div style={{ fontSize: "0.45rem", color: "rgba(200,168,75,0.3)", letterSpacing: "3px", textTransform: "uppercase", marginTop: "4px" }}>Stories</div>
        </div>
        <div style={{ width: "1px", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1.4rem", fontWeight: 900, color: "rgba(200,168,75,0.8)", lineHeight: 1 }}>
            {new Set(entries.map((e) => e.heroine)).size}
          </div>
          <div style={{ fontSize: "0.45rem", color: "rgba(200,168,75,0.3)", letterSpacing: "3px", textTransform: "uppercase", marginTop: "4px" }}>Heroines</div>
        </div>
        <div style={{ width: "1px", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1.4rem", fontWeight: 900, color: "rgba(200,168,75,0.8)", lineHeight: 1 }}>
            {new Set(entries.map((e) => e.villain)).size}
          </div>
          <div style={{ fontSize: "0.45rem", color: "rgba(200,168,75,0.3)", letterSpacing: "3px", textTransform: "uppercase", marginTop: "4px" }}>Villains</div>
        </div>
        <div style={{ width: "1px", background: "rgba(255,255,255,0.05)" }} />
        <div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", fontWeight: 700, color: "rgba(200,168,75,0.5)", lineHeight: 1.4 }}>Latest</div>
          <div style={{ fontSize: "0.7rem", color: "rgba(200,195,220,0.5)", fontFamily: "'Raleway', sans-serif" }}>{entries[0]?.date ?? "—"}</div>
        </div>
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.3 }}>◆</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: "rgba(200,168,75,0.4)", marginBottom: "0.5rem" }}>No stories yet</div>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.78rem", color: "rgba(200,195,220,0.25)", lineHeight: 1.7, maxWidth: "340px", margin: "0 auto" }}>
            Click today's Daily Dark Scenario on the homepage to generate and auto-save the first entry.
          </p>
        </div>
      )}

      {/* Entry list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {entries.map((entry, idx) => {
          const isOpen = expanded === entry.dateKey;
          const isToday = entry.date === today;
          const wordCount = entry.story.trim().split(/\s+/).filter(Boolean).length;
          const paragraphs = entry.story.split(/\n+/).filter(Boolean);

          return (
            <div
              key={entry.dateKey}
              style={{
                background: isOpen ? "rgba(8,4,20,0.95)" : "rgba(6,2,14,0.85)",
                border: `1px solid ${isOpen ? "rgba(200,168,75,0.3)" : "rgba(200,168,75,0.08)"}`,
                borderLeft: `3px solid ${isToday ? "rgba(200,168,75,0.8)" : "rgba(200,168,75,0.2)"}`,
                borderRadius: "10px",
                overflow: "hidden",
                transition: "border-color 0.3s ease",
                animation: `fadeIn 0.4s ease ${idx * 0.05}s both`,
              }}
            >
              {/* Row header */}
              <div
                onClick={() => setExpanded(isOpen ? null : entry.dateKey)}
                style={{
                  padding: "1rem 1.25rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  {isToday && (
                    <div style={{ fontSize: "0.45rem", color: "rgba(200,168,75,0.8)", letterSpacing: "3px", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(200,168,75,0.8)", animation: "pulseDot 2s ease-in-out infinite" }} />
                      TODAY
                    </div>
                  )}
                  <div style={{ fontSize: "0.62rem", color: isToday ? "rgba(200,168,75,0.6)" : "rgba(200,168,75,0.3)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px" }}>
                    {entry.date}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.9rem", fontWeight: 700, color: isOpen ? "rgba(228,215,160,0.95)" : "rgba(220,205,150,0.6)", transition: "color 0.2s", marginBottom: "0.3rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.title}
                  </div>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.65rem", color: entry.heroineColor, fontFamily: "'Cinzel', serif" }}>{entry.heroine}</span>
                    <span style={{ fontSize: "0.65rem", color: "rgba(200,195,220,0.3)" }}>vs</span>
                    <span style={{ fontSize: "0.65rem", color: "rgba(200,195,220,0.45)", fontFamily: "'Cinzel', serif" }}>{entry.villain}</span>
                    <span style={{ fontSize: "0.6rem", color: "rgba(200,168,75,0.25)", fontFamily: "'Montserrat', sans-serif" }}>· {wordCount.toLocaleString()} words</span>
                  </div>
                </div>

                <div style={{ color: isOpen ? "rgba(200,168,75,0.6)" : "rgba(200,168,75,0.2)", fontSize: "0.8rem", transition: "all 0.3s", transform: isOpen ? "rotate(180deg)" : "rotate(0)", flexShrink: 0 }}>
                  ▾
                </div>
              </div>

              {/* Expanded story */}
              {isOpen && (
                <div style={{ borderTop: "1px solid rgba(200,168,75,0.08)", padding: "1.5rem 1.5rem 1.25rem" }}>
                  {/* Setting */}
                  <div style={{ marginBottom: "1.25rem", padding: "0.6rem 1rem", background: "rgba(200,168,75,0.04)", border: "1px solid rgba(200,168,75,0.08)", borderRadius: "8px", fontSize: "0.7rem", color: "rgba(200,195,220,0.4)", fontFamily: "'Raleway', sans-serif", fontStyle: "italic" }}>
                    📍 {entry.setting}
                  </div>

                  {/* Story prose */}
                  <div style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1rem", lineHeight: 1.85, color: "rgba(220,215,200,0.8)" }}>
                    {paragraphs.map((p, i) => (
                      <p key={i} style={{ margin: "0 0 1.1em", textIndent: "1.5em" }}>{p}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {entries.length > 0 && (
        <div style={{ textAlign: "center", marginTop: "2.5rem", paddingBottom: "2rem" }}>
          <span style={{ fontSize: "0.52rem", color: "rgba(200,168,75,0.2)", letterSpacing: "3px", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase" }}>
            — {entries.length} scenario{entries.length !== 1 ? "s" : ""} in the chronicle —
          </span>
        </div>
      )}
    </div>
  );
}
