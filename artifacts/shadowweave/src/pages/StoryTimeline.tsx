import { useState, useRef } from "react";
import { getArchive, ArchivedStory } from "../lib/archive";
import StoryReader from "../components/StoryReader";

interface Props { onBack: () => void; }

const UNIVERSE_COLORS: Record<string, string> = {
  MARVEL: "#FF6060", DC: "#60A0FF", CW: "#40E090", "The Boys": "#FF3D00",
  "Power Rangers": "#FF69B4", ANIMATED: "#C084FC", Celebrity: "#C8A84B",
  SW: "#4DC8FF", TV: "#FF9640", Daily: "#E8D08A", GAMING: "#34D399",
  FILM: "#A78BFA", Arrowverse: "#4ADE80",
};
function univColor(u: string) {
  for (const [k, v] of Object.entries(UNIVERSE_COLORS)) {
    if (u.toUpperCase().includes(k.toUpperCase())) return v;
  }
  return "#888";
}
function timeLabel(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function dayKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

type GroupBy = "date" | "tool" | "villain";

export default function StoryTimeline({ onBack }: Props) {
  const stories = getArchive();
  const [groupBy, setGroupBy] = useState<GroupBy>("date");
  const [readingStory, setReadingStory] = useState<ArchivedStory | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (stories.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.2 }}>📜</div>
        <div style={{ fontSize: "16px", color: "#444", letterSpacing: "2px" }}>NO STORIES IN ARCHIVE YET</div>
        <button onClick={onBack} style={{ marginTop: "24px", background: "transparent", border: "1px solid #333", color: "#666", borderRadius: "8px", padding: "10px 24px", cursor: "pointer", letterSpacing: "2px", fontSize: "12px" }}>← BACK</button>
      </div>
    );
  }

  function buildGroups(): { label: string; color: string; stories: ArchivedStory[] }[] {
    if (groupBy === "date") {
      const byDay = new Map<string, ArchivedStory[]>();
      for (const s of stories) {
        const k = dayKey(s.createdAt);
        if (!byDay.has(k)) byDay.set(k, []);
        byDay.get(k)!.push(s);
      }
      return Array.from(byDay.entries()).map(([, ss]) => ({
        label: timeLabel(ss[0].createdAt),
        color: "#888",
        stories: ss,
      }));
    }
    if (groupBy === "tool") {
      const byTool = new Map<string, ArchivedStory[]>();
      for (const s of stories) {
        const k = s.tool;
        if (!byTool.has(k)) byTool.set(k, []);
        byTool.get(k)!.push(s);
      }
      return Array.from(byTool.entries())
        .sort((a, b) => b[1].length - a[1].length)
        .map(([tool, ss]) => ({
          label: tool.replace(/ Mode$/, "").toUpperCase(),
          color: univColor(ss[0].universe),
          stories: ss,
        }));
    }
    // villain
    const byVillain = new Map<string, ArchivedStory[]>();
    for (const s of stories) {
      const villain = s.characters[1] ?? "Unknown";
      if (!byVillain.has(villain)) byVillain.set(villain, []);
      byVillain.get(villain)!.push(s);
    }
    return Array.from(byVillain.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .map(([villain, ss]) => ({
        label: villain.split("(")[0].trim().toUpperCase(),
        color: "#C084FC",
        stories: ss,
      }));
  }

  const groups = buildGroups();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        .tl-card:hover { border-color: var(--tl-color) !important; transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.5); }
        .tl-card { transition: all 0.2s ease; }
        .tl-scroll::-webkit-scrollbar { height: 4px; }
        .tl-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        @keyframes tlFade { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }
        .tl-group { animation: tlFade 0.4s ease both; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "24px 32px 0", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ background: "transparent", border: "1px solid #333", color: "#666", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "12px", letterSpacing: "1px" }}>←</button>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "4px", color: "#555", marginBottom: "2px" }}>SHADOWWEAVE</div>
          <div style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "3px", color: "#ddd" }}>STORY TIMELINE</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
          {(["date", "tool", "villain"] as GroupBy[]).map(g => (
            <button key={g} onClick={() => setGroupBy(g)}
              style={{ background: groupBy === g ? "rgba(168,85,247,0.12)" : "transparent", border: `1px solid ${groupBy === g ? "#A855F7" : "#333"}`, color: groupBy === g ? "#A855F7" : "#555", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", fontWeight: 700, letterSpacing: "1.5px", fontSize: "11px", textTransform: "uppercase" }}>
              {g === "date" ? "By Date" : g === "tool" ? "By Mode" : "By Villain"}
            </button>
          ))}
        </div>
        <div style={{ fontSize: "11px", color: "#444", letterSpacing: "2px" }}>{stories.length} STORIES</div>
      </div>

      <div style={{ height: "1px", background: "linear-gradient(to right, transparent, rgba(168,85,247,0.3), transparent)", margin: "16px 32px" }} />

      {/* Timeline scroll area */}
      <div ref={scrollRef} className="tl-scroll" style={{ flex: 1, overflowX: "auto", overflowY: "hidden", padding: "0 32px 40px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "48px", minWidth: "max-content", paddingBottom: "16px" }}>
          {groups.map((group, gi) => (
            <div key={gi} className="tl-group" style={{ animationDelay: `${gi * 0.06}s` }}>
              {/* Group label */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", fontWeight: 900, letterSpacing: "3px", color: group.color, textTransform: "uppercase" }}>{group.label}</div>
                <div style={{ height: "1px", width: "60px", background: `linear-gradient(to right, ${group.color}44, transparent)` }} />
                <div style={{ fontSize: "10px", color: "#333", letterSpacing: "1px" }}>{group.stories.length} {group.stories.length === 1 ? "story" : "stories"}</div>
              </div>

              {/* Story cards in a horizontal row with timeline line */}
              <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: "0" }}>
                {/* Timeline rail */}
                <div style={{
                  position: "absolute", left: 0, right: 0, top: "28px",
                  height: "1px",
                  background: `linear-gradient(to right, ${group.color}22, ${group.color}44, ${group.color}22)`,
                  pointerEvents: "none",
                }} />

                {group.stories.map((story, si) => {
                  const col = univColor(story.universe);
                  const isHov = hoverId === story.id;
                  return (
                    <div key={story.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: "20px", flexShrink: 0, width: "200px" }}>
                      {/* Timeline dot */}
                      <div style={{
                        width: "12px", height: "12px", borderRadius: "50%",
                        background: isHov ? col : "#222",
                        border: `2px solid ${col}`,
                        transition: "background 0.2s",
                        flexShrink: 0, marginBottom: "12px",
                        position: "relative", zIndex: 2,
                        boxShadow: isHov ? `0 0 10px ${col}88` : "none",
                      }} />

                      {/* Card */}
                      <div
                        className="tl-card"
                        onClick={() => setReadingStory(story)}
                        onMouseEnter={() => setHoverId(story.id)}
                        onMouseLeave={() => setHoverId(null)}
                        style={{
                          ["--tl-color" as string]: col,
                          background: "linear-gradient(135deg, #0e0e18, #0a0a12)",
                          border: `1px solid ${col}22`,
                          borderRadius: "10px",
                          padding: "14px",
                          cursor: "pointer",
                          width: "200px",
                          animationDelay: `${gi * 0.06 + si * 0.04}s`,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: col, flexShrink: 0 }} />
                          <div style={{ fontSize: "9px", color: col, letterSpacing: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 700 }}>{story.universe}</div>
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#ddd", letterSpacing: "0.5px", marginBottom: "6px", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{story.title}</div>
                        {story.characters.length > 0 && (
                          <div style={{ fontSize: "10px", color: "#555", marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {story.characters.slice(0, 2).join(" · ")}
                          </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ fontSize: "9px", color: "#444", letterSpacing: "1px" }}>
                            {story.wordCount.toLocaleString()}w
                          </div>
                          {story.chapters.length > 1 && (
                            <div style={{ fontSize: "9px", color: "#333", background: "#111", border: "1px solid #222", borderRadius: "3px", padding: "1px 5px" }}>
                              {story.chapters.length} ch
                            </div>
                          )}
                          {story.favourite && <div style={{ fontSize: "10px" }}>⭐</div>}
                        </div>
                        <div style={{ fontSize: "9px", color: "#333", marginTop: "8px", letterSpacing: "0.5px" }}>
                          {timeLabel(story.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ padding: "12px 32px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: "24px", flexWrap: "wrap" }}>
        {[
          ["📖", stories.length.toString(), "stories"],
          ["📝", stories.reduce((a, s) => a + s.wordCount, 0).toLocaleString(), "words"],
          ["⭐", stories.filter(s => s.favourite).length.toString(), "favourites"],
          ["📚", stories.reduce((a, s) => a + s.chapters.length, 0).toString(), "chapters"],
        ].map(([icon, val, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "14px" }}>{icon}</span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#ccc" }}>{val}</span>
            <span style={{ fontSize: "10px", color: "#444", letterSpacing: "1px" }}>{label}</span>
          </div>
        ))}
      </div>

      {readingStory && <StoryReader story={readingStory} onClose={() => setReadingStory(null)} />}
    </div>
  );
}
