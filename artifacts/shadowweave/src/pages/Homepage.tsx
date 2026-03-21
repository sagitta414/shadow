import { useState, useEffect } from "react";

interface HomepageProps {
  onEnter: () => void;
  onCaptorPortal: () => void;
  onScenarioGenerator: () => void;
  onCharacterMapper: () => void;
  onSoundingBoard: () => void;
  onCaptorLogic: () => void;
  onSuperheroMode: () => void;
}

const TOOLS = [
  {
    id: "victim", num: "01",
    icon: "🫀",
    title: "Victim Profile",
    subtitle: "Character Builder",
    desc: "Build a complete psychological portrait — trauma, fears, breaking points — through 7 deep guided questions.",
    cta: "Build Character",
    features: ["7 Questions", "AI Story", "Psyche Meters"],
    r: 160, g: 20, b: 20, hex: "#C0392B", light: "#E8C85A",
  },
  {
    id: "captor", num: "02",
    icon: "🎭",
    title: "Captor Profile",
    subtitle: "Antagonist System",
    desc: "Define the antagonist's full operational profile — motive, methods, and endgame — via 8 configuration questions.",
    cta: "Configure Captor",
    features: ["8 Questions", "Operational Profile", "JSON Export"],
    r: 60, g: 80, b: 110, hex: "#3D5A8A", light: "#90B4D8",
  },
  {
    id: "scenario", num: "03",
    icon: "⚡",
    title: "Scenario Engine",
    subtitle: "Question Generator",
    desc: "Choose motive, control, violence level, and psychology to generate 8 tailored narrative questions instantly.",
    cta: "Generate Scenario",
    features: ["4 Config Inputs", "Instant Output", "AI Questions"],
    r: 0, g: 140, b: 60, hex: "#1E8449", light: "#52D68A",
  },
  {
    id: "mapper", num: "04",
    icon: "◎",
    title: "Relationship Map",
    subtitle: "Character Dynamics",
    desc: "Build a visual node map of every character. Draw connections: Hates, Loves, Blackmails, Manipulates.",
    cta: "Open Mapper",
    features: ["Drag & Drop", "10 Relation Types", "SVG Export"],
    r: 80, g: 10, b: 140, hex: "#6C3483", light: "#C39BD3",
  },
  {
    id: "themes", num: "05",
    icon: "◼",
    title: "Mood Lighting",
    subtitle: "Interface Atmosphere",
    desc: "Transform the studio's visual palette — Void darkness, Cold isolation, Candlelight, Static Glitch distress.",
    cta: "Change Atmosphere",
    features: ["4 Live Themes", "Instant Preview", "Persists Session"],
    r: 140, g: 90, b: 0, hex: "#B7770D", light: "#F4D03F",
  },
  {
    id: "sounding", num: "06",
    icon: "✦",
    title: "Sounding Board",
    subtitle: "AI Co-Writer",
    desc: "Chat with an AI narrative collaborator. Ask questions, get plot twists, break creative blocks in real time.",
    cta: "Talk to AI",
    features: ["Streaming AI", "8 Quick Prompts", "Story Context"],
    r: 0, g: 130, b: 110, hex: "#0E8C75", light: "#48C9B0",
  },
  {
    id: "captor-logic", num: "07",
    icon: "◈",
    title: "Captor Logic",
    subtitle: "Behaviour Simulator",
    desc: "Set inviolable rules and goals. The AI acts as a behavioural simulator — actions, risks, psychological effects.",
    cta: "Run Simulation",
    features: ["Rules Engine", "Goal Mapping", "Risk Analysis"],
    r: 110, g: 0, b: 160, hex: "#7D3C98", light: "#C39BD3",
  },
];

function handleClick(id: string, fns: HomepageProps) {
  if (id === "victim")       fns.onEnter();
  if (id === "captor")       fns.onCaptorPortal();
  if (id === "scenario")     fns.onScenarioGenerator();
  if (id === "mapper")       fns.onCharacterMapper();
  if (id === "sounding")     fns.onSoundingBoard();
  if (id === "captor-logic") fns.onCaptorLogic();
  if (id === "themes") {
    const btn = document.querySelector("[title='Change theme']") as HTMLButtonElement | null;
    btn?.click();
  }
}

export default function Homepage(props: HomepageProps) {
  const { onSuperheroMode } = props;
  const [hov, setHov] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "transparent" }}>
      <style>{`
        @keyframes heroShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes pulseDot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(0.7); }
        }
        .tool-card { transition: transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s cubic-bezier(0.23,1,0.32,1), border-color 0.35s ease; }
        .tool-card:hover { transform: translateY(-5px) !important; }
        .tool-card:active { transform: translateY(-2px) !important; }
        .tool-cta { transition: all 0.3s ease; }
        .tool-card:hover .tool-cta { opacity: 1 !important; }
        @media (max-width: 1000px) {
          .hp-tool-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 620px) {
          .hp-nav { padding: 0 1rem !important; }
          .hp-nav-stats { display: none !important; }
          .hp-tool-grid { grid-template-columns: 1fr !important; }
          .hp-hero-banner { flex-direction: column !important; gap: 1.25rem !important; padding: 1.5rem !important; }
          .hp-section-head { padding: 1.5rem 1rem 1rem !important; }
          .hp-main { padding: 0 1rem 3rem !important; }
        }
      `}</style>

      {/* Ambient glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-5%", left: "25%", width: "700px", height: "500px", background: "radial-gradient(ellipse, rgba(100,0,0,0.1) 0%, transparent 65%)", animation: "orbFloat 30s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "15%", width: "500px", height: "400px", background: "radial-gradient(ellipse, rgba(50,0,80,0.08) 0%, transparent 65%)", animation: "orbFloat 22s 8s ease-in-out infinite" }} />
      </div>

      {/* ═══ NAV BAR ═══ */}
      <nav className="hp-nav" style={{
        position: "relative", zIndex: 10, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 2rem", height: "60px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(14px)", background: "rgba(3,0,8,0.75)", flexShrink: 0,
      }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,0,0,0.4) 25%, rgba(184,134,11,0.3) 50%, rgba(139,0,0,0.4) 75%, transparent)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8B0000", boxShadow: "0 0 10px #8B0000", animation: "pulseDot 3s ease-in-out infinite" }} />
          <span className="font-cinzel" style={{ fontSize: "1rem", fontWeight: 900, letterSpacing: "4px", background: "linear-gradient(135deg, #E8D08A, #C8A830, #A07030)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            SHADOWWEAVE
          </span>
        </div>

        <div className="hp-nav-stats" style={{ display: "flex", gap: "1.75rem", alignItems: "center" }}>
          {[["7", "Tools"], ["100+", "Heroines"], ["Venice AI", "Powered by"], ["4", "Themes"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div className="font-cinzel" style={{ fontSize: "0.82rem", fontWeight: 900, color: "rgba(212,175,55,0.75)", lineHeight: 1 }}>{v}</div>
              <div className="font-montserrat" style={{ fontSize: "0.45rem", color: "rgba(200,200,220,0.22)", letterSpacing: "1.8px", textTransform: "uppercase", marginTop: "2px" }}>{l}</div>
            </div>
          ))}
        </div>

        <button
          onClick={onSuperheroMode}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.45rem 1.1rem", background: "rgba(20,5,40,0.85)", border: "1px solid rgba(255,184,0,0.22)", borderRadius: "30px", cursor: "pointer", color: "inherit", transition: "all 0.3s ease" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,184,0,0.55)"; e.currentTarget.style.boxShadow = "0 0 18px rgba(255,184,0,0.15)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,184,0,0.22)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <span style={{ fontSize: "0.8rem" }}>⚡</span>
          <span className="font-cinzel" style={{ fontSize: "0.6rem", letterSpacing: "2px", textTransform: "uppercase", background: "linear-gradient(90deg, #FFB800, #FF4080, #60A0FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontWeight: 700 }}>Hero Mode</span>
        </button>
      </nav>

      {/* ═══ SUPERHERO HERO BANNER ═══ */}
      <div
        className="hp-hero-banner"
        onClick={onSuperheroMode}
        style={{
          position: "relative", zIndex: 2, margin: "1.25rem 2rem 0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "2rem", padding: "1.5rem 2.25rem",
          background: "linear-gradient(135deg, rgba(20,5,50,0.95) 0%, rgba(40,0,80,0.9) 50%, rgba(0,20,60,0.9) 100%)",
          border: "1px solid rgba(255,184,0,0.2)", borderRadius: "16px", cursor: "pointer",
          overflow: "hidden",
          opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-10px)",
          transition: "opacity 0.5s ease, transform 0.5s ease, border-color 0.3s, box-shadow 0.3s",
          boxShadow: "0 4px 30px rgba(100,0,200,0.12)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,184,0,0.45)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 50px rgba(100,0,200,0.22), 0 0 0 1px rgba(255,184,0,0.1) inset";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,184,0,0.2)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 30px rgba(100,0,200,0.12)";
        }}
      >
        {/* Background shimmer */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 30%, rgba(255,184,0,0.04) 50%, transparent 70%)", backgroundSize: "200% 100%", animation: "heroShimmer 5s linear infinite", pointerEvents: "none" }} />
        {/* Stars */}
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{ position: "absolute", width: "2px", height: "2px", borderRadius: "50%", background: "rgba(255,220,100,0.5)", top: `${10 + (i * 37) % 80}%`, left: `${5 + (i * 71) % 90}%`, opacity: 0.3 + (i % 4) * 0.15, pointerEvents: "none" }} />
        ))}

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "2.8rem", lineHeight: 1, filter: "drop-shadow(0 0 16px rgba(255,184,0,0.6))" }}>⚡</div>
          <div>
            <div className="font-montserrat" style={{ fontSize: "0.52rem", letterSpacing: "3.5px", textTransform: "uppercase", color: "rgba(255,184,0,0.6)", marginBottom: "0.3rem", fontWeight: 700 }}>Superhero Mode · Featured</div>
            <div className="font-cinzel" style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.7rem)", fontWeight: 900, letterSpacing: "0.04em", background: "linear-gradient(90deg, #FFD700, #FF6090, #60A0FF, #FFD700)", backgroundSize: "300% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "heroShimmer 4s linear infinite" }}>
              HEROINE FORGE
            </div>
            <div style={{ fontSize: "0.78rem", color: "rgba(200,195,230,0.5)", fontFamily: "'Raleway', sans-serif", marginTop: "0.2rem" }}>Choose from 100 heroines · select villain · forge a multi-chapter story</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", position: "relative", zIndex: 1, flexShrink: 0 }}>
          {[["100+", "Heroines"], ["30", "Villains"], ["AI", "Chapters"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div className="font-cinzel" style={{ fontSize: "1.1rem", fontWeight: 900, color: "rgba(255,210,60,0.85)", lineHeight: 1 }}>{v}</div>
              <div className="font-montserrat" style={{ fontSize: "0.48rem", color: "rgba(200,200,220,0.25)", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "2px" }}>{l}</div>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.4rem", background: "rgba(255,184,0,0.12)", border: "1px solid rgba(255,184,0,0.35)", borderRadius: "10px" }}>
            <span className="font-cinzel" style={{ fontSize: "0.72rem", letterSpacing: "2px", color: "#FFD060", textTransform: "uppercase", fontWeight: 700 }}>Launch</span>
            <span style={{ color: "#FFD060", fontSize: "0.9rem" }}>→</span>
          </div>
        </div>
      </div>

      {/* ═══ SECTION HEADING ═══ */}
      <div className="hp-section-head" style={{
        position: "relative", zIndex: 2, padding: "2rem 2rem 0.75rem",
        opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-8px)",
        transition: "opacity 0.6s 0.1s ease, transform 0.6s 0.1s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(139,0,0,0.5), rgba(184,134,11,0.25) 50%, transparent)" }} />
          <span className="font-montserrat" style={{ fontSize: "0.52rem", letterSpacing: "4px", textTransform: "uppercase", color: "rgba(184,134,11,0.45)", fontWeight: 700, whiteSpace: "nowrap" }}>Narrative Modules</span>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(184,134,11,0.25) 50%, rgba(139,0,0,0.5))" }} />
        </div>
      </div>

      {/* ═══ TOOL GRID ═══ */}
      <main className="hp-main" style={{
        flex: 1, padding: "0.875rem 2rem 3rem",
        position: "relative", zIndex: 2,
      }}>
        <div className="hp-tool-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          maxWidth: "1400px",
          margin: "0 auto",
        }}>
          {TOOLS.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} hov={hov} setHov={setHov} index={i} mounted={mounted}
              onClick={() => handleClick(tool.id, props)} />
          ))}
        </div>

        {/* Footer */}
        <div style={{ maxWidth: "1400px", margin: "2rem auto 0", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <span className="font-montserrat" style={{ fontSize: "0.55rem", color: "rgba(200,200,220,0.14)", letterSpacing: "2px", textTransform: "uppercase" }}>For adult dark fiction writers only</span>
          <span className="font-montserrat" style={{ fontSize: "0.55rem", color: "rgba(200,200,220,0.14)", letterSpacing: "2px", textTransform: "uppercase" }}>Venice AI · llama-3.3-70b</span>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOOL CARD
// ─────────────────────────────────────────────────────────────────────────────
function ToolCard({ tool, hov, setHov, index, mounted, onClick }: {
  tool: typeof TOOLS[0];
  hov: string | null;
  setHov: (id: string | null) => void;
  index: number;
  mounted: boolean;
  onClick: () => void;
}) {
  const on = hov === tool.id;
  const rgb = `${tool.r},${tool.g},${tool.b}`;

  return (
    <button
      className="tool-card"
      onClick={onClick}
      onMouseEnter={() => setHov(tool.id)}
      onMouseLeave={() => setHov(null)}
      style={{
        display: "flex", flexDirection: "column",
        textAlign: "left", cursor: "pointer",
        color: "inherit", border: "none", padding: 0, background: "none",
        borderRadius: "16px", overflow: "hidden",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.55s ${index * 0.06}s ease, transform 0.55s ${index * 0.06}s ease`,
        boxShadow: on
          ? `0 16px 60px rgba(${rgb},0.25), 0 0 0 1px rgba(${rgb},0.35)`
          : `0 2px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(${rgb},0.12)`,
      }}
    >
      {/* ── ICON ZONE ── */}
      <div style={{
        position: "relative", padding: "1.75rem 1.75rem 1.5rem",
        background: on
          ? `linear-gradient(145deg, rgba(${rgb},0.35) 0%, rgba(${rgb},0.18) 60%, rgba(${rgb},0.08) 100%)`
          : `linear-gradient(145deg, rgba(${rgb},0.18) 0%, rgba(${rgb},0.08) 60%, rgba(2,0,8,0.7) 100%)`,
        transition: "background 0.4s ease",
        borderBottom: `1px solid rgba(${rgb},${on ? 0.3 : 0.1})`,
      }}>
        {/* Top accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${tool.hex}, rgba(${rgb},0.2))`, borderRadius: "16px 16px 0 0", opacity: on ? 1 : 0.5, transition: "opacity 0.3s" }} />

        {/* Ghost number watermark */}
        <div className="font-cinzel" style={{ position: "absolute", bottom: "-0.5rem", right: "0.75rem", fontSize: "5.5rem", fontWeight: 900, lineHeight: 1, color: `rgba(${rgb},${on ? 0.14 : 0.07})`, userSelect: "none", pointerEvents: "none", transition: "color 0.4s", letterSpacing: "-0.05em" }}>
          {tool.num}
        </div>

        {/* Header row: number + icon */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.1rem" }}>
          <span className="font-cinzel" style={{ fontSize: "0.5rem", letterSpacing: "2.5px", color: on ? tool.light : "rgba(200,200,220,0.28)", transition: "color 0.3s", fontWeight: 700 }}>
            №{tool.num}
          </span>
          <div style={{
            width: "46px", height: "46px", borderRadius: "12px",
            background: `rgba(${rgb},${on ? 0.3 : 0.14})`,
            border: `1px solid rgba(${rgb},${on ? 0.6 : 0.25})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.4rem", flexShrink: 0,
            filter: on ? `drop-shadow(0 0 10px rgba(${rgb},0.9))` : `drop-shadow(0 0 3px rgba(${rgb},0.3))`,
            transition: "all 0.35s ease",
          }}>{tool.icon}</div>
        </div>

        {/* Title */}
        <h2 className="font-cinzel" style={{
          margin: 0, fontSize: "1.15rem", fontWeight: 900, letterSpacing: "0.03em", lineHeight: 1.15,
          color: on ? "#F5EED0" : "rgba(240,238,255,0.88)", transition: "color 0.3s",
        }}>
          {tool.title}
        </h2>
        <div className="font-montserrat" style={{ fontSize: "0.52rem", letterSpacing: "2.5px", textTransform: "uppercase", color: on ? tool.light : "rgba(200,200,220,0.3)", marginTop: "0.3rem", transition: "color 0.3s", fontWeight: 600 }}>
          {tool.subtitle}
        </div>
      </div>

      {/* ── CONTENT ZONE ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        padding: "1.25rem 1.75rem 1.5rem",
        background: on
          ? `linear-gradient(180deg, rgba(${rgb},0.07) 0%, rgba(2,0,8,0.88) 100%)`
          : "rgba(2,0,8,0.82)",
        transition: "background 0.4s ease",
      }}>
        {/* Description */}
        <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(200,195,230,0.5)", lineHeight: 1.75, flex: 1 }}>
          {tool.desc}
        </p>

        {/* Feature pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "1rem", marginBottom: "1.1rem" }}>
          {tool.features.map((f) => (
            <span key={f} style={{
              padding: "0.2rem 0.6rem",
              background: `rgba(${rgb},${on ? 0.16 : 0.07})`,
              border: `1px solid rgba(${rgb},${on ? 0.4 : 0.18})`,
              borderRadius: "20px", fontSize: "0.58rem",
              color: on ? tool.light : "rgba(200,200,220,0.32)",
              fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.6px",
              transition: "all 0.3s",
            }}>{f}</span>
          ))}
        </div>

        {/* CTA button */}
        <div
          className="tool-cta"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem",
            padding: "0.75rem 1rem",
            background: on
              ? `linear-gradient(135deg, rgba(${rgb},0.3), rgba(${rgb},0.18))`
              : `rgba(${rgb},0.1)`,
            border: `1px solid rgba(${rgb},${on ? 0.6 : 0.25})`,
            borderRadius: "10px", transition: "all 0.35s ease",
            boxShadow: on ? `0 4px 24px rgba(${rgb},0.25)` : "none",
            opacity: on ? 1 : 0.75,
          }}
        >
          <span className="font-cinzel" style={{
            fontSize: "0.68rem", letterSpacing: "2.5px", textTransform: "uppercase",
            color: on ? tool.light : "rgba(200,200,220,0.5)", transition: "color 0.3s", fontWeight: 700,
          }}>
            {tool.cta}
          </span>
          <span style={{ color: on ? tool.light : "rgba(200,200,220,0.35)", fontSize: "0.8rem", transform: on ? "translateX(3px)" : "none", transition: "all 0.3s" }}>→</span>
        </div>
      </div>
    </button>
  );
}
