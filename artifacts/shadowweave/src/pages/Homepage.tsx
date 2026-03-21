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
    id: "victim", num: "01", icon: "🫀",
    title: "Victim Profile", subtitle: "Character Builder",
    desc: "Craft a character's complete psychological makeup — trauma, fears, vulnerabilities, and breaking points — through 7 deep configuration questions.",
    cta: "Build Character",
    features: ["7 Guided Questions", "AI Story Generation", "Psyche Meters"],
    r: 160, g: 20, b: 20,
    hex: "#C0392B", titleColor: "#E8C85A", dimColor: "rgba(232,200,90,0.55)",
  },
  {
    id: "captor", num: "02", icon: "🎭",
    title: "Captor Profile", subtitle: "Antagonist System",
    desc: "Define the antagonist's full operational profile — motive, methods, psychological approach, and endgame — through 8 configuration questions.",
    cta: "Configure Captor",
    features: ["8 Deep Questions", "Operational Profile", "JSON Export"],
    r: 60, g: 80, b: 110,
    hex: "#3D5A8A", titleColor: "#90B4D8", dimColor: "rgba(144,180,216,0.55)",
  },
  {
    id: "scenario", num: "03", icon: "⚡",
    title: "Scenario Engine", subtitle: "Question Generator",
    desc: "Select motive, control method, violence level, and psychology to generate 8 targeted narrative questions tailored to your exact scenario.",
    cta: "Generate Questions",
    features: ["4 Config Inputs", "Instant Output", "Tailored Questions"],
    r: 0, g: 140, b: 60,
    hex: "#1E8449", titleColor: "#52D68A", dimColor: "rgba(82,214,138,0.55)",
  },
  {
    id: "mapper", num: "04", icon: "◎",
    title: "Relationship Map", subtitle: "Character Dynamics",
    desc: "Build a visual node map of every character. Draw connections and label them: Hates, Secretly Loves, Blackmails, Owes Money.",
    cta: "Open Mapper",
    features: ["Drag & Drop Canvas", "10 Relation Types", "SVG Export"],
    r: 80, g: 10, b: 140,
    hex: "#6C3483", titleColor: "#C39BD3", dimColor: "rgba(195,155,211,0.55)",
  },
  {
    id: "themes", num: "05", icon: "◼",
    title: "Mood Lighting", subtitle: "Interface Atmosphere",
    desc: "Transform the studio's entire visual palette — Void darkness, Cold Blue isolation, Candlelight claustrophobia, Static Glitch distress.",
    cta: "Change Atmosphere",
    features: ["4 Live Themes", "Instant Preview", "Persists Session"],
    r: 140, g: 90, b: 0,
    hex: "#B7770D", titleColor: "#F4D03F", dimColor: "rgba(244,208,63,0.55)",
  },
  {
    id: "sounding", num: "06", icon: "✦",
    title: "Sounding Board", subtitle: "AI Co-Writer",
    desc: "Chat with an AI narrative collaborator trained on your story context. Ask questions, get plot twists, break creative blocks instantly.",
    cta: "Talk to AI",
    features: ["Streaming AI", "8 Quick Prompts", "Story Context"],
    r: 0, g: 130, b: 110,
    hex: "#0E8C75", titleColor: "#48C9B0", dimColor: "rgba(72,201,176,0.55)",
  },
  {
    id: "captor-logic", num: "07", icon: "◈",
    title: "Captor Logic", subtitle: "Behaviour Simulator",
    desc: "Input inviolable rules and goals. The AI engine acts as a captor behavioural simulator — suggesting consistent actions, risks, and psychological effects.",
    cta: "Run Simulation",
    features: ["Rules Engine", "Goal Mapping", "Risk Analysis"],
    r: 110, g: 0, b: 160,
    hex: "#7D3C98", titleColor: "#C39BD3", dimColor: "rgba(195,155,211,0.55)",
  },
];

function handleClick(id: string, fns: Omit<HomepageProps, "onSuperheroMode">) {
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

  const row1 = TOOLS.slice(0, 2);
  const row2 = TOOLS.slice(2, 5);
  const row3 = TOOLS.slice(5, 7);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "transparent" }}>
      <style>{`
        /* ── Tablet (≤ 900px) ── */
        @media (max-width: 900px) {
          .hp-nav-stats { display: none !important; }
          .hp-grid-r1 { grid-template-columns: 1fr !important; }
          .hp-grid-r2 { grid-template-columns: 1fr 1fr !important; }
          .hp-grid-r3 { grid-template-columns: 1fr !important; }
          .hp-hero-strip { padding: 2.5rem 1.5rem 1.5rem !important; }
          .hp-main { padding: 0 1.5rem 3rem !important; }
        }
        /* ── Mobile (≤ 600px) ── */
        @media (max-width: 600px) {
          .hp-nav { padding: 0 1rem !important; height: 56px !important; }
          .hp-hero-strip { padding: 2rem 1rem 1.25rem !important; }
          .hp-main { padding: 0 1rem 3rem !important; }
          .hp-grid-r1,
          .hp-grid-r2,
          .hp-grid-r3 { grid-template-columns: 1fr !important; }
          .hp-feature-left {
            flex-direction: row !important;
            align-items: center !important;
            min-width: unset !important;
            padding: 1.25rem 1.25rem !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.07) !important;
            gap: 1rem;
          }
          .hp-feature-right { padding: 1.25rem !important; }
          .hp-banner-content {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 1.25rem !important;
            gap: 1rem !important;
          }
        }
      `}</style>

      {/* Ambient glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", left: "30%", width: "600px", height: "500px", background: "radial-gradient(ellipse, rgba(100,0,0,0.12) 0%, transparent 65%)", animation: "orbFloat 30s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "20%", width: "500px", height: "400px", background: "radial-gradient(ellipse, rgba(50,0,80,0.1) 0%, transparent 65%)", animation: "orbFloat 22s 8s ease-in-out infinite" }} />
      </div>

      {/* ══════════════════════════════════════════════════════
          TOP NAV BAR
      ══════════════════════════════════════════════════════ */}
      <nav className="hp-nav" style={{
        position: "relative",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2.5rem",
        height: "64px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(12px)",
        background: "rgba(3,0,8,0.7)",
        flexShrink: 0,
      }}>
        {/* Bottom glow line */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,0,0,0.5) 25%, rgba(184,134,11,0.35) 50%, rgba(139,0,0,0.5) 75%, transparent)" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#8B0000", boxShadow: "0 0 10px rgba(139,0,0,1)" }} />
          <span className="font-cinzel" style={{ fontSize: "1.05rem", fontWeight: 900, letterSpacing: "4px", background: "linear-gradient(135deg, #E8D08A 0%, #C8A830 50%, #A07030 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            SHADOWWEAVE
          </span>
        </div>

        {/* Center stats */}
        <div className="hp-nav-stats" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {[["7", "Modules"], ["15+", "Questions"], ["2", "AI Modes"], ["4", "Themes"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div className="font-cinzel" style={{ fontSize: "0.9rem", fontWeight: 900, color: "rgba(212,175,55,0.8)", lineHeight: 1 }}>{v}</div>
              <div className="font-montserrat" style={{ fontSize: "0.5rem", color: "rgba(200,200,220,0.25)", letterSpacing: "2px", textTransform: "uppercase", marginTop: "1px" }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Superhero button */}
        <button
          onClick={onSuperheroMode}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1.25rem", background: "rgba(20,5,40,0.8)", border: "1px solid rgba(255,184,0,0.25)", borderRadius: "30px", cursor: "pointer", color: "inherit", transition: "all 0.3s ease" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,184,0,0.6)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,184,0,0.15)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,184,0,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <span style={{ fontSize: "0.85rem" }}>⚡</span>
          <span className="font-cinzel" style={{ fontSize: "0.62rem", letterSpacing: "2.5px", textTransform: "uppercase", background: "linear-gradient(90deg, #FFB800, #FF4080, #60A0FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontWeight: 700 }}>Hero Mode</span>
        </button>
      </nav>

      {/* ══════════════════════════════════════════════════════
          HERO TITLE STRIP
      ══════════════════════════════════════════════════════ */}
      <div className="hp-hero-strip" style={{
        position: "relative",
        zIndex: 2,
        padding: "3.5rem 2.5rem 2rem",
        overflow: "hidden",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(-12px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}>
        {/* Fine grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)", backgroundSize: "80px 80px", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div className="font-montserrat" style={{ fontSize: "0.58rem", letterSpacing: "5px", textTransform: "uppercase", color: "rgba(184,134,11,0.5)", marginBottom: "0.6rem", fontWeight: 700 }}>
                Professional Dark Narrative Studio
              </div>
              <h1 style={{ position: "relative", margin: 0 }}>
                <span aria-hidden className="font-cinzel" style={{ position: "absolute", fontSize: "clamp(2.5rem, 6vw, 5.5rem)", fontWeight: 900, letterSpacing: "0.12em", color: "transparent", WebkitTextStroke: "1px rgba(212,175,55,0.08)", top: "3px", left: "3px", userSelect: "none" }}>NARRATIVE MODULES</span>
                <span className="font-cinzel" style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)", fontWeight: 900, letterSpacing: "0.12em", background: "linear-gradient(135deg, #F0E0A0 0%, #D4AF37 40%, #8B6914 80%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1 }}>NARRATIVE MODULES</span>
              </h1>
            </div>
            <p className="font-crimson" style={{ fontSize: "1.05rem", color: "rgba(200,195,230,0.4)", fontStyle: "italic", textAlign: "right", maxWidth: "280px", lineHeight: 1.6 }}>
              Seven instruments of darkness — choose your entry point
            </p>
          </div>
          {/* Separator */}
          <div style={{ height: "1px", background: "linear-gradient(90deg, rgba(139,0,0,0.6), rgba(184,134,11,0.3) 40%, rgba(139,0,0,0.2) 80%, transparent)", marginTop: "1.5rem" }} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          TOOL GRID
      ══════════════════════════════════════════════════════ */}
      <main className="hp-main" style={{ flex: 1, padding: "0 2.5rem 4rem", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box", position: "relative", zIndex: 2 }}>

        {/* Row 1 — 2:1 split (wide left, narrow right) */}
        <div className="hp-grid-r1" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.875rem", marginBottom: "0.875rem" }}>
          {row1.map((t, i) => (
            <ToolCard key={t.id} tool={t} hovered={hov === t.id} onHover={setHov} onClick={(id) => handleClick(id, props)}
              size={i === 0 ? "feature" : "tall"} index={i} mounted={mounted} />
          ))}
        </div>

        {/* Row 2 — equal thirds */}
        <div className="hp-grid-r2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.875rem", marginBottom: "0.875rem" }}>
          {row2.map((t, i) => (
            <ToolCard key={t.id} tool={t} hovered={hov === t.id} onHover={setHov} onClick={(id) => handleClick(id, props)}
              size="standard" index={i + 2} mounted={mounted} />
          ))}
        </div>

        {/* Row 3 — 1:2 split (narrow left, wide right — opposite of row 1) */}
        <div className="hp-grid-r3" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.875rem" }}>
          {row3.map((t, i) => (
            <ToolCard key={t.id} tool={t} hovered={hov === t.id} onHover={setHov} onClick={(id) => handleClick(id, props)}
              size={i === 1 ? "feature" : "tall"} index={i + 5} mounted={mounted} />
          ))}
        </div>

        {/* ── SUPERHERO BANNER ── */}
        <SuperheroBanner onSuperheroMode={onSuperheroMode} mounted={mounted} />

        {/* Footer */}
        <div style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <span className="font-montserrat" style={{ fontSize: "0.58rem", color: "rgba(200,200,220,0.16)", letterSpacing: "2px", textTransform: "uppercase" }}>For adult dark fiction writers only</span>
          <span className="font-montserrat" style={{ fontSize: "0.58rem", color: "rgba(200,200,220,0.16)", letterSpacing: "2px", textTransform: "uppercase" }}>Venice AI · llama-3.3-70b</span>
        </div>
      </main>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// TOOL CARD
// ──────────────────────────────────────────────────────────────────────────────
function ToolCard({ tool, hovered, onHover, onClick, size, index, mounted }: {
  tool: typeof TOOLS[0];
  hovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
  size: "feature" | "tall" | "standard";
  index: number;
  mounted: boolean;
}) {
  const rgb = `${tool.r},${tool.g},${tool.b}`;
  const isFeature = size === "feature";

  return (
    <button
      onClick={() => onClick(tool.id)}
      onMouseEnter={() => onHover(tool.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        display: "flex",
        flexDirection: isFeature ? "row" : "column",
        textAlign: "left",
        cursor: "pointer",
        color: "inherit",
        border: "none",
        padding: 0,
        background: "none",
        position: "relative",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.6s ${index * 0.07}s ease, transform 0.6s ${index * 0.07}s ease`,
        minHeight: isFeature ? "220px" : size === "tall" ? "220px" : "190px",
      }}
    >
      {/* Main card surface */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        borderRadius: "14px",
        background: hovered
          ? `linear-gradient(145deg, rgba(${rgb},0.22) 0%, rgba(${rgb},0.1) 45%, rgba(2,0,8,0.85) 100%)`
          : `linear-gradient(145deg, rgba(${rgb},0.1) 0%, rgba(${rgb},0.04) 40%, rgba(2,0,8,0.9) 100%)`,
        border: `1px solid ${hovered ? `rgba(${rgb},0.55)` : `rgba(${rgb},0.18)`}`,
        transition: "all 0.45s cubic-bezier(0.23,1,0.32,1)",
        boxShadow: hovered
          ? `0 12px 50px rgba(${rgb},0.2), 0 0 0 1px rgba(${rgb},0.12) inset`
          : `0 0 0 0px rgba(${rgb},0)`,
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        padding: isFeature ? "0" : "1.75rem",
      }}>

        {/* Always-visible top accent bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "3px",
          background: `linear-gradient(90deg, ${tool.hex}, rgba(${rgb},0.3))`,
          opacity: hovered ? 1 : 0.45,
          transition: "opacity 0.4s",
          borderRadius: "14px 14px 0 0",
        }} />

        {/* Corner glow orb */}
        <div style={{
          position: "absolute", top: "-30px", right: "-30px",
          width: "180px", height: "180px",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${rgb},0.35) 0%, transparent 65%)`,
          opacity: hovered ? 1 : 0.3,
          transition: "opacity 0.5s",
          pointerEvents: "none",
        }} />

        {/* Ghosted background number */}
        <div className="font-cinzel" style={{
          position: "absolute",
          bottom: isFeature ? "50%" : "-0.5rem",
          right: isFeature ? "1.5rem" : "0.5rem",
          transform: isFeature ? "translateY(50%)" : "none",
          fontSize: isFeature ? "9rem" : "6rem",
          fontWeight: 900,
          letterSpacing: "-0.05em",
          lineHeight: 1,
          color: `rgba(${rgb},${hovered ? 0.12 : 0.07})`,
          transition: "color 0.4s",
          pointerEvents: "none",
          userSelect: "none",
        }}>{tool.num}</div>

        {isFeature ? (
          // ── Feature card inner layout (horizontal) ──
          <>
            {/* Left accent panel */}
            <div className="hp-feature-left" style={{
              padding: "2rem 1.75rem",
              borderRight: `1px solid rgba(${rgb},${hovered ? 0.25 : 0.1})`,
              display: "flex",
              flexDirection: "column",
              minWidth: "150px",
              transition: "border-color 0.4s",
              background: `rgba(${rgb},${hovered ? 0.08 : 0.03})`,
            }}>
              <div className="font-cinzel" style={{ fontSize: "0.58rem", letterSpacing: "3px", color: hovered ? tool.titleColor : "rgba(200,200,220,0.3)", marginBottom: "auto", transition: "color 0.3s" }}>{tool.num}</div>
              <div style={{ fontSize: "2.5rem", lineHeight: 1, marginBottom: "0.875rem", filter: hovered ? `drop-shadow(0 0 14px rgba(${rgb},0.8))` : `drop-shadow(0 0 4px rgba(${rgb},0.3))`, transition: "filter 0.4s" }}>{tool.icon}</div>
              <div className="font-montserrat" style={{ fontSize: "0.55rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(200,200,220,0.3)", marginBottom: "0.2rem" }}>{tool.subtitle}</div>
              <div className="font-cinzel" style={{ fontSize: "0.8rem", color: hovered ? tool.titleColor : tool.dimColor, fontWeight: 700, transition: "color 0.3s", letterSpacing: "0.03em" }}>{tool.title}</div>
            </div>

            {/* Right content panel */}
            <div className="hp-feature-right" style={{ flex: 1, padding: "2rem 2rem 1.75rem 2rem", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
              <div>
                <h2 className="font-cinzel" style={{ fontSize: "clamp(1.3rem, 2vw, 2rem)", fontWeight: 900, color: hovered ? "#F5EED0" : "rgba(240,240,255,0.85)", marginBottom: "0.75rem", lineHeight: 1.2, letterSpacing: "0.03em", transition: "color 0.3s" }}>
                  {tool.title}
                </h2>
                <p style={{ fontSize: "0.83rem", color: "rgba(200,195,230,0.55)", lineHeight: 1.8 }}>{tool.desc}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  {tool.features.map((f) => (
                    <span key={f} style={{ padding: "0.25rem 0.65rem", background: `rgba(${rgb},${hovered ? 0.18 : 0.08})`, border: `1px solid rgba(${rgb},${hovered ? 0.45 : 0.2})`, borderRadius: "20px", fontSize: "0.62rem", color: hovered ? tool.dimColor : "rgba(200,200,220,0.35)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.8px", transition: "all 0.3s" }}>{f}</span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", background: `rgba(${rgb},${hovered ? 0.22 : 0.08})`, border: `1px solid rgba(${rgb},${hovered ? 0.55 : 0.2})`, borderRadius: "8px", transition: "all 0.3s", boxShadow: hovered ? `0 4px 20px rgba(${rgb},0.25)` : "none" }}>
                  <span className="font-cinzel" style={{ fontSize: "0.7rem", letterSpacing: "2px", color: hovered ? tool.titleColor : "rgba(200,200,220,0.4)", textTransform: "uppercase", transition: "color 0.3s", whiteSpace: "nowrap" }}>{tool.cta}</span>
                  <span style={{ color: hovered ? tool.titleColor : "rgba(200,200,220,0.3)", transform: hovered ? "translateX(3px)" : "none", transition: "all 0.3s" }}>→</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          // ── Standard/Tall card inner layout (vertical) ──
          <>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <div>
                <div className="font-cinzel" style={{ fontSize: "0.55rem", letterSpacing: "3px", color: hovered ? tool.titleColor : "rgba(200,200,220,0.3)", marginBottom: "0.2rem", transition: "color 0.3s" }}>{tool.num}</div>
                <div className="font-montserrat" style={{ fontSize: "0.55rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(200,200,220,0.28)", fontWeight: 600 }}>{tool.subtitle}</div>
              </div>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
                background: `rgba(${rgb},${hovered ? 0.25 : 0.1})`,
                border: `1px solid rgba(${rgb},${hovered ? 0.55 : 0.22})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.25rem",
                filter: hovered ? `drop-shadow(0 0 8px rgba(${rgb},0.7))` : "none",
                transition: "all 0.35s",
                boxShadow: hovered ? `0 0 20px rgba(${rgb},0.3)` : "none",
              }}>{tool.icon}</div>
            </div>

            {/* Title */}
            <div className="font-cinzel" style={{ fontSize: "clamp(1rem, 1.6vw, 1.3rem)", fontWeight: 800, color: hovered ? "#F0EAD0" : "rgba(240,238,255,0.8)", marginBottom: "0.75rem", lineHeight: 1.25, letterSpacing: "0.02em", transition: "color 0.3s" }}>
              {tool.title}
            </div>

            {/* Description */}
            <p style={{ fontSize: "0.78rem", color: "rgba(195,190,220,0.5)", lineHeight: 1.75, flex: 1, marginBottom: 0 }}>
              {tool.desc}
            </p>

            {/* CTA row */}
            <div style={{ marginTop: "1.25rem", paddingTop: "0.875rem", borderTop: `1px solid rgba(${rgb},${hovered ? 0.22 : 0.1})`, display: "flex", justifyContent: "space-between", alignItems: "center", transition: "border-color 0.3s" }}>
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                {tool.features.slice(0, 2).map((f) => (
                  <span key={f} style={{ fontSize: "0.55rem", color: hovered ? tool.dimColor : "rgba(200,200,220,0.25)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.8px", transition: "color 0.3s" }}>{f}</span>
                ))}
              </div>
              <span className="font-cinzel" style={{ fontSize: "0.65rem", letterSpacing: "2px", color: hovered ? tool.titleColor : "rgba(200,200,220,0.3)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.3rem", transition: "all 0.3s", transform: hovered ? "translateX(3px)" : "none", whiteSpace: "nowrap" }}>
                {tool.cta} →
              </span>
            </div>
          </>
        )}
      </div>
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// SUPERHERO BANNER
// ──────────────────────────────────────────────────────────────────────────────
function SuperheroBanner({ onSuperheroMode, mounted }: { onSuperheroMode: () => void; mounted: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onSuperheroMode}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%",
        marginTop: "0.875rem",
        padding: 0,
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "inherit",
        display: "block",
        textAlign: "left",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.6s 0.55s ease, transform 0.6s 0.55s ease",
      }}
    >
      <div style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "14px",
        border: `1px solid ${hov ? "rgba(255,184,0,0.45)" : "rgba(255,255,255,0.06)"}`,
        background: hov
          ? "linear-gradient(135deg, rgba(18,4,40,0.97) 0%, rgba(35,0,55,0.97) 50%, rgba(8,8,30,0.97) 100%)"
          : "linear-gradient(135deg, rgba(8,2,18,0.92) 0%, rgba(15,0,25,0.92) 60%, rgba(4,4,15,0.92) 100%)",
        transition: "all 0.45s cubic-bezier(0.23,1,0.32,1)",
        boxShadow: hov ? "0 0 80px rgba(255,184,0,0.1), 0 0 160px rgba(255,0,128,0.06)" : "none",
        transform: hov ? "translateY(-2px)" : "translateY(0)",
      }}>
        {/* Prismatic top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, #FFB800 0%, #FF0080 33%, #8040FF 66%, #60A0FF 100%)", opacity: hov ? 1 : 0.25, transition: "opacity 0.4s" }} />

        {/* Background glow orbs */}
        <div style={{ position: "absolute", left: "-50px", top: "50%", transform: "translateY(-50%)", width: "220px", height: "220px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,184,0,0.15) 0%, transparent 65%)", opacity: hov ? 1 : 0, transition: "opacity 0.5s", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "10%", top: "50%", transform: "translateY(-50%)", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(96,160,255,0.12) 0%, transparent 65%)", opacity: hov ? 1 : 0, transition: "opacity 0.5s", pointerEvents: "none" }} />

        {/* Ghost text */}
        <div className="font-cinzel" style={{ position: "absolute", right: "1.5rem", top: "50%", transform: "translateY(-50%)", fontSize: "6rem", fontWeight: 900, letterSpacing: "-0.03em", color: hov ? "rgba(255,184,0,0.07)" : "rgba(255,255,255,0.02)", lineHeight: 1, userSelect: "none", transition: "color 0.4s", pointerEvents: "none" }}>HERO</div>

        <div className="hp-banner-content" style={{ display: "flex", alignItems: "center", gap: "2rem", padding: "1.75rem 2.25rem", flexWrap: "wrap", position: "relative" }}>
          {/* Icon badge */}
          <div style={{
            width: "52px", height: "52px", borderRadius: "12px", flexShrink: 0,
            background: hov ? "linear-gradient(135deg, rgba(255,184,0,0.25), rgba(255,0,128,0.2), rgba(96,160,255,0.2))" : "rgba(255,255,255,0.04)",
            border: `1px solid ${hov ? "rgba(255,184,0,0.5)" : "rgba(255,255,255,0.07)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem",
            filter: hov ? "drop-shadow(0 0 12px rgba(255,184,0,0.6))" : "none",
            transition: "all 0.4s",
          }}>⚡</div>

          <div style={{ flex: 1, minWidth: "200px" }}>
            <div className="font-montserrat" style={{ fontSize: "0.55rem", letterSpacing: "4px", textTransform: "uppercase", color: hov ? "rgba(255,184,0,0.7)" : "rgba(200,200,220,0.22)", marginBottom: "0.35rem", transition: "color 0.3s" }}>Alternative Mode</div>
            <h3 className="font-cinzel" style={{
              fontSize: "clamp(1.2rem, 2vw, 1.65rem)", fontWeight: 900, letterSpacing: "0.06em",
              background: hov ? "linear-gradient(90deg, #FFB800, #FF4080, #60A0FF)" : "linear-gradient(90deg, rgba(220,215,240,0.55), rgba(220,215,240,0.3))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              marginBottom: "0.35rem", transition: "all 0.35s",
            }}>Hero Story Forge</h3>
            <p style={{ fontSize: "0.78rem", color: hov ? "rgba(200,195,230,0.6)" : "rgba(200,195,230,0.28)", lineHeight: 1.6, maxWidth: "450px", transition: "color 0.3s" }}>
              Choose from 100 heroines, select your villain, configure the scene with restraints and tone, then generate a cinematic multi-chapter story.
            </p>
          </div>

          {/* CTA */}
          <div style={{
            padding: "0.7rem 1.5rem", borderRadius: "10px", flexShrink: 0,
            background: hov ? "linear-gradient(135deg, rgba(255,184,0,0.2), rgba(255,0,128,0.15))" : "rgba(255,255,255,0.04)",
            border: `1px solid ${hov ? "rgba(255,184,0,0.5)" : "rgba(255,255,255,0.06)"}`,
            display: "flex", alignItems: "center", gap: "0.5rem",
            transition: "all 0.35s",
            boxShadow: hov ? "0 4px 24px rgba(255,184,0,0.2)" : "none",
          }}>
            <span className="font-cinzel" style={{ fontSize: "0.7rem", letterSpacing: "2.5px", textTransform: "uppercase", color: hov ? "#FFB800" : "rgba(200,200,220,0.3)", transition: "color 0.3s", whiteSpace: "nowrap" }}>Enter Hero Mode</span>
            <span style={{ color: hov ? "#FFB800" : "rgba(200,200,220,0.25)", transform: hov ? "translateX(3px)" : "none", transition: "all 0.3s" }}>→</span>
          </div>
        </div>
      </div>
    </button>
  );
}
