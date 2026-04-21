import { useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import ArrowverseMode from "./ArrowverseMode";
import RewriteCanonMode from "./RewriteCanonMode";
import SeasonArcMode from "./SeasonArcMode";

interface Props {
  onBack: () => void;
  onContinue?: (storyId: string) => void;
}

type SubMode = "hub" | "arrowverse" | "rewrite" | "season-arc";

const MODES = [
  {
    id: "arrowverse" as const,
    icon: "🏹",
    title: "DARK EPISODES",
    subtitle: "Arrow · The Flash · 21 Scenarios",
    desc: "Every darkest episode from Arrow and The Flash — Prometheus's chamber, Enter Zoom, Infantino Street, Elseworlds — playable as fully immersive stories.",
    color: "#4ADE80",
    r: 74, g: 222, b: 128,
    tags: ["Arrow", "The Flash", "21 Scenarios"],
  },
  {
    id: "rewrite" as const,
    icon: "📝",
    title: "REWRITE THE CANON",
    subtitle: "13 Pivot Moments · Alternate History",
    desc: "Pick a pivotal CW episode moment and write the version that stayed buried. Sara and the Mirakuru pit. Iris and Savitar's deadline. The night Darhk didn't let Thea go.",
    color: "#A855F7",
    r: 168, g: 85, b: 247,
    tags: ["Arrow", "The Flash", "Legends", "Supergirl"],
  },
  {
    id: "season-arc" as const,
    icon: "🎬",
    title: "SEASON ARC",
    subtitle: "Multi-Chapter · Full Season Build",
    desc: "Design a full villain arc — pick your villain, up to 3 heroines, and a season premise. Each chapter ends on a cliffhanger. The grip deepens with every episode.",
    color: "#C084FC",
    r: 192, g: 132, b: 252,
    tags: ["Custom Villain", "3 Heroines", "Episode Chapters"],
  },
];

export default function CWSpecialistHub({ onBack, onContinue }: Props) {
  const isMobile = useIsMobile(640);
  const [sub, setSub] = useState<SubMode>("hub");

  if (sub === "arrowverse") return <ArrowverseMode onBack={() => setSub("hub")} onContinue={onContinue} />;
  if (sub === "rewrite") return <RewriteCanonMode onBack={() => setSub("hub")} onContinue={onContinue} />;
  if (sub === "season-arc") return <SeasonArcMode onBack={() => setSub("hub")} onContinue={onContinue} />;

  const px = isMobile ? "16px" : "32px";
  const accent = "#4ADE80";

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <style>{`
        .cwh-card { transition: all 0.2s; cursor: pointer; }
        .cwh-card:hover { transform: translateY(-3px); }
        @keyframes cwPulse { 0%,100%{opacity:0.6;} 50%{opacity:1;} }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(74,222,128,0.12)",
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(12px)",
        padding: `${isMobile ? "14px" : "18px"} ${px}`,
        display: "flex", alignItems: "center", gap: "16px", position: "sticky", top: 0, zIndex: 100,
      }}>
        <button onClick={onBack} style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "8px", padding: "8px 14px", color: "#888", fontSize: "12px",
          cursor: "pointer", letterSpacing: "1px",
        }}>← BACK</button>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `linear-gradient(135deg, ${accent}22, ${accent}08)`, border: `1px solid ${accent}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>⚡</div>
          <div>
            <div style={{ fontSize: isMobile ? "13px" : "14px", fontWeight: 900, color: accent, letterSpacing: "3px" }}>CW SPECIALIST MODE</div>
            <div style={{ fontSize: "10px", color: "#444", letterSpacing: "1px" }}>ARROWVERSE · DARK UNIVERSE</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: `${isMobile ? "24px" : "40px"} ${px}` }}>

        {/* Intro */}
        <div style={{ textAlign: "center", marginBottom: isMobile ? "32px" : "48px" }}>
          <div style={{ fontSize: isMobile ? "28px" : "40px", marginBottom: "16px", filter: "drop-shadow(0 0 12px #4ADE8044)" }}>⚡</div>
          <div style={{ fontSize: isMobile ? "20px" : "28px", fontWeight: 900, color: accent, letterSpacing: "4px", marginBottom: "12px" }}>
            CW SPECIALIST MODE
          </div>
          <div style={{ fontSize: isMobile ? "12px" : "14px", color: "#555", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
            Three dedicated tools for the CW dark universe. Play darkest episodes, rewrite pivotal moments, or build a full villain season arc.
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
            {["Arrow", "The Flash", "Supergirl", "Legends of Tomorrow"].map(s => (
              <div key={s} style={{ background: `${accent}0d`, border: `1px solid ${accent}22`, borderRadius: "20px", padding: "3px 10px", fontSize: "9px", color: accent, letterSpacing: "1px", fontWeight: 700 }}>{s}</div>
            ))}
          </div>
        </div>

        {/* Mode Cards */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? "14px" : "20px" }}>
          {MODES.map(m => (
            <button key={m.id} className="cwh-card"
              onClick={() => setSub(m.id)}
              style={{
                background: `linear-gradient(160deg, rgba(${m.r},${m.g},${m.b},0.06) 0%, #050508 100%)`,
                border: `1px solid rgba(${m.r},${m.g},${m.b},0.2)`,
                borderRadius: "16px", padding: isMobile ? "20px" : "24px",
                textAlign: "left", WebkitTapHighlightColor: "transparent",
                display: "flex", flexDirection: "column", gap: "0",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `rgba(${m.r},${m.g},${m.b},0.45)`;
                (e.currentTarget as HTMLElement).style.background = `linear-gradient(160deg, rgba(${m.r},${m.g},${m.b},0.11) 0%, #050508 100%)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `rgba(${m.r},${m.g},${m.b},0.2)`;
                (e.currentTarget as HTMLElement).style.background = `linear-gradient(160deg, rgba(${m.r},${m.g},${m.b},0.06) 0%, #050508 100%)`;
              }}
            >
              {/* Icon + title row */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
                  background: `rgba(${m.r},${m.g},${m.b},0.12)`,
                  border: `1px solid rgba(${m.r},${m.g},${m.b},0.3)`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
                }}>{m.icon}</div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 900, color: m.color, letterSpacing: "2px", lineHeight: 1.2 }}>{m.title}</div>
                  <div style={{ fontSize: "9px", color: `rgba(${m.r},${m.g},${m.b},0.6)`, letterSpacing: "1px", marginTop: "2px" }}>{m.subtitle}</div>
                </div>
              </div>

              {/* Desc */}
              <div style={{ fontSize: "11px", color: "#555", lineHeight: 1.7, flexGrow: 1, marginBottom: "16px" }}>{m.desc}</div>

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "16px" }}>
                {m.tags.map(t => (
                  <div key={t} style={{
                    background: `rgba(${m.r},${m.g},${m.b},0.08)`,
                    border: `1px solid rgba(${m.r},${m.g},${m.b},0.18)`,
                    borderRadius: "4px", padding: "2px 7px", fontSize: "8px", color: m.color, letterSpacing: "0.5px", fontWeight: 600,
                  }}>{t}</div>
                ))}
              </div>

              {/* CTA */}
              <div style={{
                background: `rgba(${m.r},${m.g},${m.b},0.1)`,
                border: `1px solid rgba(${m.r},${m.g},${m.b},0.25)`,
                borderRadius: "8px", padding: "10px 14px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ fontSize: "10px", color: m.color, fontWeight: 700, letterSpacing: "1.5px" }}>ENTER MODE</div>
                <div style={{ color: m.color, fontSize: "14px" }}>→</div>
              </div>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ margin: `${isMobile ? "32px" : "48px"} 0 20px`, height: "1px", background: "linear-gradient(to right, transparent, rgba(74,222,128,0.12), transparent)" }} />

        {/* Footer note */}
        <div style={{ textAlign: "center", fontSize: "10px", color: "#2a2a2a", letterSpacing: "1px" }}>
          STORIES SAVED TO ARCHIVE · CONTINUE ANY STORY FROM DARK DOSSIER
        </div>
      </div>
    </div>
  );
}
