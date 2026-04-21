import { useState, useRef } from "react";
import { getArchive, ArchivedStory } from "../lib/archive";
import StoryReader from "../components/StoryReader";
import { useIsMobile } from "../hooks/useIsMobile";

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
  const isMobile = useIsMobile(640);
  const [groupBy, setGroupBy] = useState<GroupBy>("date");
  const [readingStory, setReadingStory] = useState<ArchivedStory | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const px = isMobile ? "16px" : "32px";
  const cardW = isMobile ? 155 : 200;

  if (stories.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.2 }}>📜</div>
        <div style={{ fontSize: "15px", color: "#444", letterSpacing: "2px", textAlign: "center" }}>NO STORIES IN ARCHIVE YET</div>
        <div style={{ fontSize: "12px", color: "#333", marginTop: "8px", textAlign: "center" }}>Generate a story to see it appear here</div>
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
        .tl-card { transition: all 0.2s ease; cursor: pointer; }
        .tl-card:active { transform: scale(0.97); opacity: 0.85; }
        @media (hover: hover) { .tl-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.5); } }
        .tl-scroll { -webkit-overflow-scrolling: touch; }
        .tl-scroll::-webkit-scrollbar { height: 3px; }
        .tl-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 4px; }
        @keyframes tlFade { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }
        .tl-group { animation: tlFade 0.4s ease both; }
        .tl-grp-btn { transition: all 0.15s; }
        .tl-grp-btn:active { opacity: 0.7; transform: scale(0.96); }
      `}</style>

      {/* Header */}
      <div style={{ padding: `20px ${px} 0`, display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={onBack} style={{ background: "transparent", border: "1px solid #333", color: "#666", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "14px", flexShrink: 0, WebkitTapHighlightColor: "transparent" }}>←</button>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#555", marginBottom: "1px" }}>SHADOWWEAVE</div>
            <div style={{ fontSize: isMobile ? "16px" : "20px", fontWeight: 900, letterSpacing: "2px", color: "#ddd" }}>STORY TIMELINE</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: "11px", color: "#444", letterSpacing: "2px", flexShrink: 0 }}>
            {stories.length} {stories.length === 1 ? "story" : "stories"}
          </div>
        </div>

        {/* Group toggle — full row below title on mobile */}
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
          {(["date", "tool", "villain"] as GroupBy[]).map(g => (
            <button key={g} onClick={() => setGroupBy(g)} className="tl-grp-btn"
              style={{
                background: groupBy === g ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${groupBy === g ? "#A855F7" : "#2a2a2a"}`,
                color: groupBy === g ? "#A855F7" : "#555",
                borderRadius: "20px", padding: "6px 14px", cursor: "pointer",
                fontWeight: 700, letterSpacing: "1px", fontSize: "11px",
                textTransform: "uppercase", whiteSpace: "nowrap",
                WebkitTapHighlightColor: "transparent",
              }}>
              {g === "date" ? "📅 Date" : g === "tool" ? "🎬 Mode" : "☠ Villain"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: "1px", background: "linear-gradient(to right, transparent, rgba(168,85,247,0.25), transparent)", margin: `12px ${px}` }} />

      {/* Timeline scroll area */}
      <div ref={scrollRef} className="tl-scroll"
        style={{ flex: 1, overflowX: "auto", overflowY: "hidden", padding: `0 ${px} 40px` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "44px", minWidth: "max-content", paddingBottom: "16px" }}>
          {groups.map((group, gi) => (
            <div key={gi} className="tl-group" style={{ animationDelay: `${gi * 0.06}s` }}>
              {/* Group label */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{
                  fontSize: isMobile ? "10px" : "11px", fontWeight: 900, letterSpacing: "2px",
                  color: group.color, textTransform: "uppercase",
                  background: `${group.color}11`, border: `1px solid ${group.color}33`,
                  borderRadius: "4px", padding: "3px 10px",
                }}>{group.label}</div>
                <div style={{ height: "1px", width: "40px", background: `linear-gradient(to right, ${group.color}44, transparent)` }} />
                <div style={{ fontSize: "10px", color: "#444" }}>{group.stories.length}</div>
              </div>

              {/* Story cards row */}
              <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: "0" }}>
                {/* Timeline rail */}
                <div style={{
                  position: "absolute", left: 0, right: 0, top: "22px", height: "1px",
                  background: `linear-gradient(to right, ${group.color}22, ${group.color}44, ${group.color}22)`,
                  pointerEvents: "none",
                }} />

                {group.stories.map((story, si) => {
                  const col = univColor(story.universe);
                  const isHov = hoverId === story.id;
                  return (
                    <div key={story.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: isMobile ? "14px" : "20px", flexShrink: 0, width: `${cardW}px` }}>
                      {/* Timeline dot */}
                      <div style={{
                        width: isMobile ? "10px" : "12px", height: isMobile ? "10px" : "12px",
                        borderRadius: "50%",
                        background: isHov ? col : "#1a1a2a",
                        border: `2px solid ${col}`,
                        transition: "all 0.2s",
                        flexShrink: 0, marginBottom: "10px",
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
                          background: "linear-gradient(135deg, #0e0e1c, #0a0a14)",
                          border: `1px solid ${isHov ? col + "55" : col + "22"}`,
                          borderRadius: "10px",
                          padding: isMobile ? "10px" : "14px",
                          width: `${cardW}px`,
                          transition: "border-color 0.2s",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "7px" }}>
                          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: col, flexShrink: 0 }} />
                          <div style={{ fontSize: "8px", color: col, letterSpacing: "0.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 700 }}>{story.universe}</div>
                        </div>
                        <div style={{ fontSize: isMobile ? "11px" : "12px", fontWeight: 700, color: "#ddd", letterSpacing: "0.3px", marginBottom: "5px", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{story.title}</div>
                        {story.characters.length > 0 && (
                          <div style={{ fontSize: "10px", color: "#555", marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {story.characters.slice(0, 2).join(" · ")}
                          </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <div style={{ fontSize: "9px", color: "#444", letterSpacing: "0.5px" }}>
                            {story.wordCount.toLocaleString()}w
                          </div>
                          {story.chapters.length > 1 && (
                            <div style={{ fontSize: "9px", color: "#333", background: "#111", border: "1px solid #1e1e1e", borderRadius: "3px", padding: "1px 4px" }}>
                              {story.chapters.length}ch
                            </div>
                          )}
                          {story.favourite && <span style={{ fontSize: "9px" }}>⭐</span>}
                        </div>
                        <div style={{ fontSize: "9px", color: "#2a2a2a", marginTop: "7px" }}>
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
      <div style={{
        padding: `10px ${px}`,
        borderTop: "1px solid rgba(255,255,255,0.04)",
        display: "flex", gap: isMobile ? "16px" : "24px", flexWrap: "wrap",
        background: "rgba(0,0,0,0.3)",
      }}>
        {[
          ["📖", stories.length.toString(), "stories"],
          ["📝", stories.reduce((a, s) => a + s.wordCount, 0).toLocaleString(), "words"],
          ["⭐", stories.filter(s => s.favourite).length.toString(), "faves"],
          ["📚", stories.reduce((a, s) => a + s.chapters.length, 0).toString(), "chapters"],
        ].map(([icon, val, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ fontSize: isMobile ? "12px" : "14px" }}>{icon}</span>
            <span style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: 700, color: "#ccc" }}>{val}</span>
            <span style={{ fontSize: "9px", color: "#444", letterSpacing: "1px" }}>{label}</span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", fontSize: "10px", color: "#2a2a2a" }}>← scroll →</div>
      </div>

      {readingStory && <StoryReader story={readingStory} onClose={() => setReadingStory(null)} />}
    </div>
  );
}
