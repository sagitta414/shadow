import { useMemo } from "react";
import { getArchive } from "../lib/archive";
import { useIsMobile } from "../hooks/useIsMobile";

interface Props { onBack: () => void; onContinue?: (storyId: string) => void; }

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden", marginTop: "5px" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "2px", transition: "width 0.6s ease" }} />
    </div>
  );
}

const MILESTONES = [
  {
    id: "rewrite5",
    icon: "🔮",
    title: "THE HIDDEN PROMETHEUS",
    desc: "Complete 5 Rewrite the Canon stories",
    reward: "Unlocks a secret Prometheus scenario in Rewrite the Canon — the season finale you were never meant to see",
    check: (stats: ReturnType<typeof buildStats>) => stats.byTool["Rewrite the Canon"] >= 5,
    target: 5,
    getValue: (stats: ReturnType<typeof buildStats>) => Math.min(stats.byTool["Rewrite the Canon"] ?? 0, 5),
    color: "#FF4060",
  },
  {
    id: "total10",
    icon: "📖",
    title: "SHADOW ARCHIVE OPEN",
    desc: "Accumulate 10 stories in the archive",
    reward: "The Story Continuation engine unlocks — any story in the archive can now grow new chapters",
    check: (stats: ReturnType<typeof buildStats>) => stats.total >= 10,
    target: 10,
    getValue: (stats: ReturnType<typeof buildStats>) => Math.min(stats.total, 10),
    color: "#34D399",
  },
  {
    id: "words50k",
    icon: "✒️",
    title: "THE FIFTY THOUSAND",
    desc: "Write 50,000 total words across the archive",
    reward: "You have written enough for a full novel. The dark library recognises you.",
    check: (stats: ReturnType<typeof buildStats>) => stats.totalWords >= 50000,
    target: 50000,
    getValue: (stats: ReturnType<typeof buildStats>) => Math.min(stats.totalWords, 50000),
    color: "#C084FC",
    formatVal: (v: number) => `${(v / 1000).toFixed(1)}k`,
  },
  {
    id: "arc3",
    icon: "🌑",
    title: "ARC ARCHITECT",
    desc: "Generate 3 Season Arc chapters total",
    reward: "The villain voices grow deeper. Season Arc chapters now reference your established villain's established patterns.",
    check: (stats: ReturnType<typeof buildStats>) => stats.arcChapters >= 3,
    target: 3,
    getValue: (stats: ReturnType<typeof buildStats>) => Math.min(stats.arcChapters, 3),
    color: "#A855F7",
  },
  {
    id: "total50",
    icon: "💀",
    title: "SHADOW TIER",
    desc: "50 stories in the dark archive",
    reward: "Shadow Tier granted. The studio has documented enough descents to constitute a record. You are a chronicler.",
    check: (stats: ReturnType<typeof buildStats>) => stats.total >= 50,
    target: 50,
    getValue: (stats: ReturnType<typeof buildStats>) => Math.min(stats.total, 50),
    color: "#F5D67A",
  },
];

function buildStats(archive: ReturnType<typeof getArchive>) {
  const total = archive.length;
  const totalWords = archive.reduce((a, s) => a + s.wordCount, 0);
  const totalChapters = archive.reduce((a, s) => a + s.chapters.length, 0);
  const faves = archive.filter(s => s.favourite).length;

  const byTool: Record<string, number> = {};
  const byVillain: Record<string, number> = {};
  const byHeroine: Record<string, number> = {};

  for (const s of archive) {
    byTool[s.tool] = (byTool[s.tool] ?? 0) + 1;
    const villain = s.characters[1] ?? "Unknown";
    if (villain) byVillain[villain.split("(")[0].trim()] = (byVillain[villain.split("(")[0].trim()] ?? 0) + 1;
    const heroine = s.characters[0] ?? "Unknown";
    if (heroine) byHeroine[heroine] = (byHeroine[heroine] ?? 0) + 1;
  }

  const arcChapters = archive
    .filter(s => s.tool === "Season Arc Mode")
    .reduce((a, s) => a + s.chapters.length, 0);

  const topModes = Object.entries(byTool).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const topVillains = Object.entries(byVillain).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topHeroines = Object.entries(byHeroine).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return { total, totalWords, totalChapters, faves, byTool, arcChapters, topModes, topVillains, topHeroines };
}

const MODE_COLORS: Record<string, string> = {
  "Arrowverse Mode": "#4ADE80",
  "Rewrite the Canon": "#60A5FA",
  "Season Arc Mode": "#A855F7",
  "Celebrity Captive": "#C8A84B",
  "Heroine Forge": "#F97316",
  "Story Continuation": "#34D399",
};
function modeColor(mode: string) {
  for (const [k, v] of Object.entries(MODE_COLORS)) {
    if (mode.includes(k.split(" ")[0])) return v;
  }
  return "#888";
}

export default function DarkDossier({ onBack, onContinue }: Props) {
  const isMobile = useIsMobile(640);
  const archive = getArchive();
  const stats = useMemo(() => buildStats(archive), [archive.length]);
  const px = isMobile ? "16px" : "28px";
  const maxModeCount = stats.topModes[0]?.[1] ?? 1;

  const unlockedCount = MILESTONES.filter(m => m.check(stats)).length;

  if (archive.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ fontSize: "52px", marginBottom: "16px", opacity: 0.15 }}>🗂</div>
        <div style={{ fontSize: "13px", color: "#444", letterSpacing: "3px", textAlign: "center" }}>NO DATA ON FILE</div>
        <div style={{ fontSize: "11px", color: "#333", marginTop: "8px", textAlign: "center" }}>Generate stories to build your dossier</div>
        <button onClick={onBack} style={{ marginTop: "24px", background: "transparent", border: "1px solid #2a2a2a", color: "#555", borderRadius: "8px", padding: "10px 24px", cursor: "pointer", letterSpacing: "2px", fontSize: "12px" }}>← BACK</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "60px" }}>
      <style>{`
        @keyframes ddFade { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }
        .dd-section { animation: ddFade 0.4s ease both; }
        .dd-milestone { transition: all 0.2s; }
        .dd-milestone:hover { transform: translateY(-2px); }
      `}</style>

      {/* Header */}
      <div style={{ padding: `22px ${px} 0`, display: "flex", alignItems: "center", gap: "14px" }}>
        <button onClick={onBack}
          style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#555", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "14px", flexShrink: 0 }}>
          ←
        </button>
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#555", marginBottom: "2px" }}>SHADOWWEAVE</div>
          <div style={{ fontSize: isMobile ? "18px" : "22px", fontWeight: 900, letterSpacing: "3px", color: "#ddd" }}>THE DOSSIER</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: "10px", color: "#444", letterSpacing: "2px" }}>{unlockedCount}/{MILESTONES.length}</div>
          <div style={{ fontSize: "9px", color: "#333", letterSpacing: "1px" }}>MILESTONES</div>
        </div>
      </div>
      <div style={{ height: "1px", background: "linear-gradient(to right, transparent, rgba(168,85,247,0.25), transparent)", margin: `14px ${px}` }} />

      <div style={{ padding: `0 ${px}` }}>

        {/* Stats overview */}
        <div className="dd-section" style={{ animationDelay: "0s", display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "10px", marginBottom: "32px" }}>
          {[
            { icon: "📖", val: stats.total.toLocaleString(), label: "STORIES" },
            { icon: "📝", val: stats.totalWords >= 1000 ? `${(stats.totalWords / 1000).toFixed(1)}k` : stats.totalWords.toString(), label: "WORDS" },
            { icon: "📚", val: stats.totalChapters.toString(), label: "CHAPTERS" },
            { icon: "⭐", val: stats.faves.toString(), label: "FAVOURITES" },
          ].map(({ icon, val, label }) => (
            <div key={label} style={{ background: "linear-gradient(135deg, #0e0e1c, #0a0a12)", border: "1px solid #1a1a28", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "22px", marginBottom: "6px" }}>{icon}</div>
              <div style={{ fontSize: isMobile ? "18px" : "22px", fontWeight: 900, color: "#ddd", letterSpacing: "1px" }}>{val}</div>
              <div style={{ fontSize: "8px", color: "#444", letterSpacing: "2px", marginTop: "3px" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Mode breakdown */}
        {stats.topModes.length > 0 && (
          <div className="dd-section" style={{ animationDelay: "0.08s", marginBottom: "32px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#555", marginBottom: "14px" }}>MODE BREAKDOWN</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {stats.topModes.map(([mode, count]) => (
                <div key={mode}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div style={{ fontSize: "11px", color: "#888", letterSpacing: "0.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%" }}>{mode.replace(" Mode", "").replace("Rewrite the Canon", "Canon Rewrite")}</div>
                    <div style={{ fontSize: "10px", color: "#555", letterSpacing: "1px", flexShrink: 0 }}>{count}</div>
                  </div>
                  <Bar value={count} max={maxModeCount} color={modeColor(mode)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Villain / Heroine cols */}
        <div className="dd-section" style={{ animationDelay: "0.14s", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
          {/* Top Villains */}
          {stats.topVillains.length > 0 && (
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#555", marginBottom: "12px" }}>MOST USED VILLAIN</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {stats.topVillains.map(([villain, count], i) => (
                  <div key={villain} style={{ display: "flex", alignItems: "center", gap: "10px", background: "linear-gradient(135deg, #0e0e1c, transparent)", border: "1px solid #141420", borderRadius: "8px", padding: "10px 12px" }}>
                    <div style={{ fontSize: "11px", color: i === 0 ? "#C084FC" : "#444", fontWeight: 900, width: "16px", flexShrink: 0 }}>#{i + 1}</div>
                    <div style={{ flex: 1, fontSize: "11px", color: i === 0 ? "#ddd" : "#777", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{villain}</div>
                    <div style={{ fontSize: "10px", color: i === 0 ? "#C084FC" : "#444", fontWeight: 700, flexShrink: 0 }}>{count}×</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Heroines */}
          {stats.topHeroines.length > 0 && (
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#555", marginBottom: "12px" }}>MOST USED HEROINE</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {stats.topHeroines.map(([heroine, count], i) => (
                  <div key={heroine} style={{ display: "flex", alignItems: "center", gap: "10px", background: "linear-gradient(135deg, #0e0e1c, transparent)", border: "1px solid #141420", borderRadius: "8px", padding: "10px 12px" }}>
                    <div style={{ fontSize: "11px", color: i === 0 ? "#4ADE80" : "#444", fontWeight: 900, width: "16px", flexShrink: 0 }}>#{i + 1}</div>
                    <div style={{ flex: 1, fontSize: "11px", color: i === 0 ? "#ddd" : "#777", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{heroine}</div>
                    <div style={{ fontSize: "10px", color: i === 0 ? "#4ADE80" : "#444", fontWeight: 700, flexShrink: 0 }}>{count}×</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Milestones */}
        <div className="dd-section" style={{ animationDelay: "0.2s" }}>
          <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#555", marginBottom: "14px" }}>MILESTONES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {MILESTONES.map((m) => {
              const unlocked = m.check(stats);
              const current = m.getValue(stats);
              const pct = Math.round((current / m.target) * 100);
              const col = unlocked ? m.color : "#2a2a2a";
              return (
                <div key={m.id} className="dd-milestone"
                  style={{ background: unlocked ? `linear-gradient(135deg, ${m.color}0d, #0a0a12)` : "rgba(255,255,255,0.02)", border: `1px solid ${unlocked ? m.color + "44" : "#1a1a1a"}`, borderRadius: "12px", padding: isMobile ? "14px" : "18px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ fontSize: isMobile ? "20px" : "24px", flexShrink: 0, opacity: unlocked ? 1 : 0.2 }}>{m.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 900, color: unlocked ? m.color : "#333", letterSpacing: "1.5px" }}>{m.title}</div>
                        {unlocked && <div style={{ fontSize: "8px", background: `${m.color}22`, border: `1px solid ${m.color}44`, color: m.color, borderRadius: "20px", padding: "1px 7px", letterSpacing: "1px", flexShrink: 0 }}>UNLOCKED</div>}
                      </div>
                      <div style={{ fontSize: "11px", color: unlocked ? "#666" : "#333", marginBottom: "8px" }}>{m.desc}</div>
                      {unlocked ? (
                        <div style={{ fontSize: "11px", color: m.color, lineHeight: 1.5, fontStyle: "italic" }}>↳ {m.reward}</div>
                      ) : (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <div style={{ fontSize: "9px", color: "#333" }}>{m.formatVal ? m.formatVal(current) : current} / {m.formatVal ? m.formatVal(m.target) : m.target}</div>
                            <div style={{ fontSize: "9px", color: "#333" }}>{pct}%</div>
                          </div>
                          <div style={{ height: "2px", background: "rgba(255,255,255,0.04)", borderRadius: "2px" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: col, borderRadius: "2px", transition: "width 0.6s ease" }} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
