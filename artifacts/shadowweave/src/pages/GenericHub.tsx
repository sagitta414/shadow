import { useIsMobile } from "../hooks/useIsMobile";

export interface HubMode {
  icon: string;
  title: string;
  badge: string;
  desc: string;
  color: string;
  r: number; g: number; b: number;
  pageId: string;
}

interface Props {
  title: string;
  icon: string;
  accent: string;
  subtitle: string;
  tagline: string;
  modes: HubMode[];
  onBack: () => void;
  onSelectMode: (pageId: string) => void;
}

export default function GenericHub({ title, icon, accent, subtitle, tagline, modes, onBack, onSelectMode }: Props) {
  const isMobile = useIsMobile(640);
  const px = isMobile ? "16px" : "32px";
  const cols = isMobile ? 1 : modes.length <= 4 ? 2 : 3;

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      <style>{`.ghub-card { transition: all 0.18s; cursor: pointer; } .ghub-card:hover { transform: translateY(-2px); }`}</style>

      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${accent}18`,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(14px)",
        padding: `${isMobile ? "13px" : "17px"} ${px}`,
        display: "flex", alignItems: "center", gap: "14px",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <button onClick={onBack} style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "8px", padding: "8px 14px", color: "#777", fontSize: "12px",
          cursor: "pointer", letterSpacing: "1px", flexShrink: 0,
        }}>← BACK</button>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
            background: `linear-gradient(135deg, ${accent}20, ${accent}08)`,
            border: `1px solid ${accent}30`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px",
          }}>{icon}</div>
          <div>
            <div style={{ fontSize: isMobile ? "12px" : "13px", fontWeight: 900, color: accent, letterSpacing: "3px" }}>{title}</div>
            <div style={{ fontSize: "9px", color: "#3a3a3a", letterSpacing: "1px", marginTop: "1px" }}>{subtitle}</div>
          </div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: "9px", color: "#2a2a2a", letterSpacing: "1px" }}>{modes.length} MODES</div>
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: `${isMobile ? "22px" : "36px"} ${px}` }}>

        {/* Intro */}
        <div style={{ textAlign: "center", marginBottom: isMobile ? "28px" : "40px" }}>
          <div style={{ fontSize: isMobile ? "26px" : "36px", marginBottom: "12px", filter: `drop-shadow(0 0 10px ${accent}44)` }}>{icon}</div>
          <div style={{ fontSize: isMobile ? "18px" : "24px", fontWeight: 900, color: accent, letterSpacing: "4px", marginBottom: "10px" }}>{title}</div>
          <div style={{ fontSize: isMobile ? "11px" : "13px", color: "#4a4a4a", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>{tagline}</div>
        </div>

        {/* Mode Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: isMobile ? "12px" : "16px",
        }}>
          {modes.map(m => (
            <button key={m.pageId} className="ghub-card"
              onClick={() => onSelectMode(m.pageId)}
              style={{
                background: `linear-gradient(150deg, rgba(${m.r},${m.g},${m.b},0.07) 0%, #050508 100%)`,
                border: `1px solid rgba(${m.r},${m.g},${m.b},0.18)`,
                borderRadius: "14px", padding: isMobile ? "16px" : "20px",
                textAlign: "left", WebkitTapHighlightColor: "transparent",
                display: "flex", flexDirection: "column",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `rgba(${m.r},${m.g},${m.b},0.4)`;
                (e.currentTarget as HTMLElement).style.background = `linear-gradient(150deg, rgba(${m.r},${m.g},${m.b},0.12) 0%, #050508 100%)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `rgba(${m.r},${m.g},${m.b},0.18)`;
                (e.currentTarget as HTMLElement).style.background = `linear-gradient(150deg, rgba(${m.r},${m.g},${m.b},0.07) 0%, #050508 100%)`;
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "8px", flexShrink: 0,
                  background: `rgba(${m.r},${m.g},${m.b},0.12)`,
                  border: `1px solid rgba(${m.r},${m.g},${m.b},0.28)`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
                }}>{m.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "11px", fontWeight: 900, color: m.color, letterSpacing: "1.5px", lineHeight: 1.2 }}>{m.title}</div>
                  <div style={{ fontSize: "8px", color: `rgba(${m.r},${m.g},${m.b},0.55)`, marginTop: "3px", letterSpacing: "0.5px" }}>{m.badge}</div>
                </div>
                <div style={{ color: m.color, fontSize: "12px", opacity: 0.5, flexShrink: 0 }}>→</div>
              </div>
              <div style={{ fontSize: "10px", color: "#4a4a4a", lineHeight: 1.65 }}>{m.desc}</div>
            </button>
          ))}
        </div>

        <div style={{ margin: `${isMobile ? "28px" : "40px"} 0 0`, textAlign: "center", fontSize: "9px", color: "#1e1e1e", letterSpacing: "1px" }}>
          ALL STORIES SAVED TO ARCHIVE
        </div>
      </div>
    </div>
  );
}
