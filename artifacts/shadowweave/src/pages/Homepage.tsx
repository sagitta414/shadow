import { useState } from "react";

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
    desc: "Craft a character's complete psychological makeup — their trauma, fears, vulnerabilities, and breaking points — through 7 deep configuration questions.",
    cta: "Build Character",
    features: ["7 Guided Questions", "AI Story Generation", "Psyche Meters"],
    r: 139, g: 0, b: 0,
    accent: "#C0392B", glow: "rgba(192,57,43,0.55)",
    titleColor: "#D4AF37", tagColor: "rgba(212,175,55,0.9)",
  },
  {
    id: "captor", num: "02", icon: "🎭",
    title: "Captor Profile", subtitle: "Antagonist System",
    desc: "Define the antagonist's full operational profile — motive, methods, psychological approach and endgame — through 8 configuration questions.",
    cta: "Configure Captor",
    features: ["8 Deep Questions", "Operational Profile", "JSON Export"],
    r: 44, g: 62, b: 80,
    accent: "#5D6D7E", glow: "rgba(93,109,126,0.5)",
    titleColor: "#AAB7C4", tagColor: "rgba(170,183,196,0.9)",
  },
  {
    id: "scenario", num: "03", icon: "⚡",
    title: "Scenario Engine", subtitle: "Question Generator",
    desc: "Select motive, control method, violence level and psychology to generate 8 targeted narrative questions tailored to your exact scenario.",
    cta: "Generate Questions",
    features: ["4 Config Inputs", "Instant Generation", "Tailored Output"],
    r: 0, g: 150, b: 50,
    accent: "#27AE60", glow: "rgba(39,174,96,0.5)",
    titleColor: "#2ECC71", tagColor: "rgba(46,204,113,0.9)",
  },
  {
    id: "mapper", num: "04", icon: "◎",
    title: "Relationship Map", subtitle: "Character Dynamics",
    desc: "Build a visual node map of every character. Draw connections and label them: Hates, Secretly Loves, Blackmails, Owes Money.",
    cta: "Open Mapper",
    features: ["Drag & Drop Canvas", "10 Relationship Types", "SVG Export"],
    r: 75, g: 0, b: 130,
    accent: "#8E44AD", glow: "rgba(142,68,173,0.5)",
    titleColor: "#BB8FCE", tagColor: "rgba(187,143,206,0.9)",
  },
  {
    id: "themes", num: "05", icon: "◼",
    title: "Mood Lighting", subtitle: "Interface Atmosphere",
    desc: "Transform the studio's visual palette: Void darkness, Cold Blue isolation, Candlelight claustrophobia, Static Glitch distress.",
    cta: "Change Atmosphere",
    features: ["4 Live Themes", "Instant Preview", "Persists Session"],
    r: 120, g: 80, b: 0,
    accent: "#D4AC0D", glow: "rgba(212,172,13,0.5)",
    titleColor: "#F4D03F", tagColor: "rgba(244,208,63,0.9)",
  },
  {
    id: "sounding", num: "06", icon: "✦",
    title: "Sounding Board", subtitle: "AI Co-Writer",
    desc: "Chat with an AI narrative collaborator. Ask what your captor would do, get three unexpected plot twists, break creative blocks instantly.",
    cta: "Talk to AI",
    features: ["Streaming AI", "8 Quick Prompts", "Story Context"],
    r: 0, g: 128, b: 100,
    accent: "#1ABC9C", glow: "rgba(26,188,156,0.5)",
    titleColor: "#48C9B0", tagColor: "rgba(72,201,176,0.9)",
  },
  {
    id: "captor-logic", num: "07", icon: "◈",
    title: "Captor Logic", subtitle: "Behaviour Simulator",
    desc: "Input inviolable rules and goals. The AI engine acts as a captor behavioural simulator — suggesting actions, risks, and psychological effects.",
    cta: "Run Simulation",
    features: ["Rules Engine", "Goal Mapping", "Risk Analysis"],
    r: 100, g: 0, b: 150,
    accent: "#9B59B6", glow: "rgba(155,89,182,0.5)",
    titleColor: "#C39BD3", tagColor: "rgba(195,155,211,0.9)",
  },
];

export default function Homepage({ onEnter, onCaptorPortal, onScenarioGenerator, onCharacterMapper, onSoundingBoard, onCaptorLogic, onSuperheroMode }: HomepageProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  function handleClick(id: string) {
    if (id === "victim")        onEnter();
    if (id === "captor")        onCaptorPortal();
    if (id === "scenario")      onScenarioGenerator();
    if (id === "mapper")        onCharacterMapper();
    if (id === "sounding")      onSoundingBoard();
    if (id === "captor-logic")  onCaptorLogic();
    if (id === "themes") {
      const btn = document.querySelector("[title='Change theme']") as HTMLButtonElement | null;
      btn?.click();
    }
  }

  const [heroTool, ...restTools] = TOOLS;
  const row2 = restTools.slice(0, 3);
  const row3 = restTools.slice(3);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Vignette overlay ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 5, background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.75) 100%)" }} />

      {/* ════════════════════════════════════════════════════════════
          HERO HEADER
      ════════════════════════════════════════════════════════════ */}
      <header style={{ position: "relative", overflow: "hidden", padding: "0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>

        {/* Background layers */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(80,0,0,0.35) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "200px", background: "radial-gradient(ellipse, rgba(139,0,0,0.15) 0%, transparent 70%)", filter: "blur(30px)", pointerEvents: "none" }} />

        {/* Fine grid overlay */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

        {/* Corner ornaments */}
        <div style={{ position: "absolute", top: "1.5rem", left: "2rem", width: "32px", height: "32px", borderTop: "1px solid rgba(184,134,11,0.35)", borderLeft: "1px solid rgba(184,134,11,0.35)" }} />
        <div style={{ position: "absolute", top: "1.5rem", right: "2rem", width: "32px", height: "32px", borderTop: "1px solid rgba(184,134,11,0.35)", borderRight: "1px solid rgba(184,134,11,0.35)" }} />
        <div style={{ position: "absolute", bottom: "1.5rem", left: "2rem", width: "32px", height: "32px", borderBottom: "1px solid rgba(184,134,11,0.35)", borderLeft: "1px solid rgba(184,134,11,0.35)" }} />
        <div style={{ position: "absolute", bottom: "1.5rem", right: "2rem", width: "32px", height: "32px", borderBottom: "1px solid rgba(184,134,11,0.35)", borderRight: "1px solid rgba(184,134,11,0.35)" }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4.5rem 4rem 4rem", textAlign: "center", position: "relative" }}>

          {/* Studio label */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
            <div style={{ width: "50px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(184,134,11,0.6))" }} />
            <span className="font-montserrat" style={{ fontSize: "0.62rem", letterSpacing: "5px", textTransform: "uppercase", color: "rgba(184,134,11,0.6)", fontWeight: 700 }}>
              Professional Dark Narrative Studio
            </span>
            <div style={{ width: "50px", height: "1px", background: "linear-gradient(90deg, rgba(184,134,11,0.6), transparent)" }} />
          </div>

          {/* Main title */}
          <div style={{ position: "relative", marginBottom: "1.75rem" }}>
            <h1 className="font-cinzel" style={{
              fontSize: "clamp(3rem, 9vw, 7rem)",
              fontWeight: 900,
              letterSpacing: "0.18em",
              lineHeight: 1,
              background: "linear-gradient(180deg, #F5E6C8 0%, #D4AF37 40%, #A07830 75%, #6B4F20 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 2px 40px rgba(212,175,55,0.25))",
              position: "relative",
              zIndex: 1,
            }}>
              SHADOWWEAVE
            </h1>
            {/* Ghosted echo */}
            <h1 aria-hidden className="font-cinzel" style={{
              fontSize: "clamp(3rem, 9vw, 7rem)",
              fontWeight: 900,
              letterSpacing: "0.18em",
              lineHeight: 1,
              position: "absolute",
              inset: 0,
              color: "transparent",
              WebkitTextStroke: "1px rgba(212,175,55,0.07)",
              transform: "translate(2px, 2px)",
              userSelect: "none",
            }}>
              SHADOWWEAVE
            </h1>
          </div>

          {/* Tagline */}
          <p className="font-crimson" style={{ fontSize: "clamp(1rem, 2vw, 1.3rem)", color: "rgba(220,210,240,0.45)", fontStyle: "italic", letterSpacing: "0.06em", marginBottom: "2.75rem", maxWidth: "420px" }}>
            Where darkness becomes narrative craft
          </p>

          {/* Stats row */}
          <div style={{ display: "flex", gap: "2.5rem", marginBottom: "2.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { v: "7", l: "Modules" },
              { v: "15+", l: "Questions" },
              { v: "2", l: "AI Modes" },
              { v: "4", l: "Themes" },
            ].map((s) => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div className="font-cinzel" style={{ fontSize: "1.6rem", fontWeight: 900, color: "#D4AF37", lineHeight: 1, letterSpacing: "1px" }}>{s.v}</div>
                <div className="font-montserrat" style={{ fontSize: "0.58rem", color: "rgba(200,200,220,0.3)", letterSpacing: "2.5px", textTransform: "uppercase", marginTop: "0.2rem" }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Superhero toggle */}
          <button
            onClick={onSuperheroMode}
            style={{
              padding: "0.875rem 2.25rem",
              background: "linear-gradient(135deg, rgba(20,0,40,0.9) 0%, rgba(40,0,60,0.9) 100%)",
              border: "1px solid rgba(255,184,0,0.3)",
              borderRadius: "40px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              color: "inherit",
              transition: "all 0.35s ease",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 0 0 1px rgba(255,0,128,0.1) inset",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,184,0,0.7)";
              e.currentTarget.style.boxShadow = "0 0 40px rgba(255,184,0,0.2), 0 0 80px rgba(255,0,128,0.1), 0 0 0 1px rgba(255,0,128,0.15) inset";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,184,0,0.3)";
              e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,0,128,0.1) inset";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span style={{ fontSize: "1rem" }}>⚡</span>
            <span className="font-cinzel" style={{
              fontSize: "0.72rem", letterSpacing: "3.5px", textTransform: "uppercase",
              background: "linear-gradient(90deg, #FFB800 0%, #FF4080 50%, #60A0FF 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              fontWeight: 700,
            }}>
              Switch to Superhero Mode
            </span>
            <span style={{ fontSize: "1rem" }}>⚡</span>
          </button>
        </div>

        {/* Bottom separator */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent 0%, rgba(139,0,0,0.6) 30%, rgba(212,175,55,0.4) 50%, rgba(139,0,0,0.6) 70%, transparent 100%)" }} />
      </header>

      {/* ════════════════════════════════════════════════════════════
          TOOLS
      ════════════════════════════════════════════════════════════ */}
      <main style={{ flex: 1, padding: "3rem 2rem 5rem", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>

        {/* Section label */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "2rem" }}>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(255,255,255,0.06), transparent)" }} />
          <span className="font-cinzel" style={{ fontSize: "0.62rem", letterSpacing: "5px", textTransform: "uppercase", color: "rgba(200,200,220,0.25)" }}>Select a Module</span>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06))" }} />
        </div>

        {/* ── FEATURED CARD (Tool 01) ── */}
        <FeaturedCard tool={heroTool} hovered={hovered === heroTool.id} onHover={setHovered} onClick={handleClick} />

        {/* ── ROW 2: Tools 02–04 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "1rem" }}>
          {row2.map((t) => <StandardCard key={t.id} tool={t} hovered={hovered === t.id} onHover={setHovered} onClick={handleClick} />)}
        </div>

        {/* ── ROW 3: Tools 05–07 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "1rem" }}>
          {row3.map((t) => <StandardCard key={t.id} tool={t} hovered={hovered === t.id} onHover={setHovered} onClick={handleClick} />)}
        </div>

        {/* ── SUPERHERO BANNER ── */}
        <HeroBanner onSuperheroMode={onSuperheroMode} />

        {/* Footer */}
        <div style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <span className="font-montserrat" style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.18)", letterSpacing: "2px", textTransform: "uppercase" }}>For adult dark fiction writers only</span>
          <span className="font-montserrat" style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.18)", letterSpacing: "2px", textTransform: "uppercase" }}>Venice AI · llama-3.3-70b</span>
        </div>
      </main>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// FEATURED CARD (wide horizontal card for Tool 01)
// ──────────────────────────────────────────────────────────────────────────────
function FeaturedCard({ tool, hovered, onHover, onClick }: {
  tool: typeof TOOLS[0];
  hovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}) {
  const accentRgb = `${tool.r},${tool.g},${tool.b}`;
  return (
    <button
      onClick={() => onClick(tool.id)}
      onMouseEnter={() => onHover(tool.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        width: "100%",
        background: hovered
          ? `linear-gradient(135deg, rgba(${accentRgb},0.18) 0%, rgba(${accentRgb},0.08) 60%, rgba(0,0,0,0.6) 100%)`
          : "rgba(6,2,12,0.85)",
        backdropFilter: "blur(24px)",
        border: `1px solid ${hovered ? `rgba(${accentRgb},0.45)` : "rgba(255,255,255,0.06)"}`,
        borderRadius: "18px",
        padding: "0",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.45s cubic-bezier(0.23,1,0.32,1)",
        color: "inherit",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        boxShadow: hovered ? `0 0 60px rgba(${accentRgb},0.15), 0 0 120px rgba(${accentRgb},0.07)` : "none",
      }}
    >
      {/* Left accent bar */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: `linear-gradient(180deg, ${tool.accent}, transparent)`, opacity: hovered ? 1 : 0.3, transition: "opacity 0.4s", borderRadius: "18px 0 0 18px" }} />

      {/* Top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, rgba(${accentRgb},0.7), transparent)`, opacity: hovered ? 1 : 0, transition: "opacity 0.4s" }} />

      {/* Glow orb top-right */}
      <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "250px", height: "250px", borderRadius: "50%", background: `radial-gradient(circle, rgba(${accentRgb},0.25) 0%, transparent 70%)`, opacity: hovered ? 1 : 0, transition: "opacity 0.5s", pointerEvents: "none" }} />

      {/* Ghosted number */}
      <div className="font-cinzel" style={{
        position: "absolute", right: "2rem", top: "50%", transform: "translateY(-50%)",
        fontSize: "10rem", fontWeight: 900, color: `rgba(${accentRgb},${hovered ? "0.09" : "0.04"})`,
        lineHeight: 1, pointerEvents: "none", letterSpacing: "-0.05em",
        transition: "color 0.4s",
        userSelect: "none",
      }}>
        {tool.num}
      </div>

      {/* Left panel */}
      <div style={{ padding: "2.5rem 2.5rem", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0", minWidth: "180px", borderRight: `1px solid rgba(${accentRgb},0.12)` }}>
        <div className="font-cinzel" style={{ fontSize: "0.6rem", letterSpacing: "3px", color: hovered ? tool.titleColor : "rgba(200,200,220,0.3)", marginBottom: "1.5rem", transition: "color 0.3s" }}>{tool.num}</div>
        <div style={{ fontSize: "3rem", lineHeight: 1, marginBottom: "1.25rem", filter: hovered ? `drop-shadow(0 0 16px rgba(${accentRgb},0.7))` : "none", transition: "filter 0.4s" }}>{tool.icon}</div>
        <div className="font-montserrat" style={{ fontSize: "0.6rem", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(200,200,220,0.35)", marginBottom: "0.3rem" }}>{tool.subtitle}</div>
        <div className="font-cinzel" style={{ fontSize: "0.85rem", color: hovered ? tool.titleColor : "rgba(200,200,220,0.5)", fontWeight: 700, transition: "color 0.3s" }}>{tool.title}</div>
      </div>

      {/* Right panel */}
      <div style={{ padding: "2.5rem 3rem 2.5rem 2.5rem", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <h2 className="font-cinzel" style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)", color: hovered ? tool.titleColor : "#E8E8F5", fontWeight: 900, marginBottom: "1rem", transition: "color 0.3s", lineHeight: 1.15, letterSpacing: "0.04em" }}>
            {tool.title}
          </h2>
          <p style={{ fontSize: "0.92rem", color: "rgba(200,200,220,0.65)", lineHeight: 1.8, maxWidth: "520px" }}>
            {tool.desc}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {tool.features.map((f) => (
              <span key={f} style={{
                padding: "0.3rem 0.75rem",
                background: hovered ? `rgba(${accentRgb},0.15)` : "rgba(255,255,255,0.04)",
                border: `1px solid ${hovered ? `rgba(${accentRgb},0.4)` : "rgba(255,255,255,0.07)"}`,
                borderRadius: "20px",
                fontSize: "0.65rem",
                color: hovered ? tool.tagColor : "rgba(200,200,220,0.35)",
                fontFamily: "'Montserrat', sans-serif",
                letterSpacing: "1px",
                transition: "all 0.3s",
              }}>{f}</span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.25rem", background: hovered ? `rgba(${accentRgb},0.2)` : "rgba(255,255,255,0.04)", border: `1px solid ${hovered ? `rgba(${accentRgb},0.5)` : "rgba(255,255,255,0.07)"}`, borderRadius: "8px", transition: "all 0.3s" }}>
            <span className="font-cinzel" style={{ fontSize: "0.75rem", letterSpacing: "2.5px", color: hovered ? tool.titleColor : "rgba(200,200,220,0.3)", textTransform: "uppercase", transition: "color 0.3s" }}>{tool.cta}</span>
            <span style={{ color: hovered ? tool.titleColor : "rgba(200,200,220,0.25)", transition: "all 0.3s", transform: hovered ? "translateX(3px)" : "none" }}>→</span>
          </div>
        </div>
      </div>
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// STANDARD CARD
// ──────────────────────────────────────────────────────────────────────────────
function StandardCard({ tool, hovered, onHover, onClick }: {
  tool: typeof TOOLS[0];
  hovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}) {
  const accentRgb = `${tool.r},${tool.g},${tool.b}`;
  return (
    <button
      onClick={() => onClick(tool.id)}
      onMouseEnter={() => onHover(tool.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        background: hovered
          ? `linear-gradient(155deg, rgba(${accentRgb},0.16) 0%, rgba(${accentRgb},0.06) 50%, rgba(0,0,0,0.7) 100%)`
          : "rgba(6,2,12,0.85)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${hovered ? `rgba(${accentRgb},0.45)` : "rgba(255,255,255,0.06)"}`,
        borderRadius: "16px",
        padding: "2rem 1.75rem",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
        color: "inherit",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: "280px",
        boxShadow: hovered ? `0 8px 50px rgba(${accentRgb},0.15), 0 0 100px rgba(${accentRgb},0.06)` : "none",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* Left accent bar */}
      <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: "3px", background: `linear-gradient(180deg, transparent, ${tool.accent}, transparent)`, opacity: hovered ? 1 : 0, transition: "opacity 0.4s", borderRadius: "0 3px 3px 0" }} />

      {/* Top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent 10%, rgba(${accentRgb},0.7) 50%, transparent 90%)`, opacity: hovered ? 1 : 0, transition: "opacity 0.35s" }} />

      {/* Ghosted number */}
      <div className="font-cinzel" style={{
        position: "absolute", bottom: "-0.5rem", right: "1rem",
        fontSize: "7rem", fontWeight: 900,
        color: `rgba(${accentRgb},${hovered ? "0.1" : "0.04"})`,
        lineHeight: 1, pointerEvents: "none", letterSpacing: "-0.05em",
        transition: "color 0.4s", userSelect: "none",
      }}>
        {tool.num}
      </div>

      {/* Corner glow */}
      <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "160px", height: "160px", borderRadius: "50%", background: `radial-gradient(circle, rgba(${accentRgb},0.3) 0%, transparent 70%)`, opacity: hovered ? 1 : 0, transition: "opacity 0.5s", pointerEvents: "none" }} />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <div className="font-cinzel" style={{ fontSize: "0.58rem", letterSpacing: "3px", color: hovered ? tool.titleColor : "rgba(200,200,220,0.25)", marginBottom: "0.25rem", transition: "color 0.3s" }}>{tool.num}</div>
          <div className="font-montserrat" style={{ fontSize: "0.58rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(200,200,220,0.3)", fontWeight: 600 }}>{tool.subtitle}</div>
        </div>
        <div style={{
          width: "42px", height: "42px", borderRadius: "10px",
          background: hovered ? `rgba(${accentRgb},0.2)` : "rgba(255,255,255,0.04)",
          border: `1px solid ${hovered ? `rgba(${accentRgb},0.45)` : "rgba(255,255,255,0.07)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.3rem",
          filter: hovered ? `drop-shadow(0 0 8px rgba(${accentRgb},0.7))` : "none",
          transition: "all 0.35s",
        }}>
          {tool.icon}
        </div>
      </div>

      {/* Title */}
      <div className="font-cinzel" style={{ fontSize: "clamp(1.15rem, 1.8vw, 1.4rem)", color: hovered ? tool.titleColor : "#E8E8F5", fontWeight: 800, marginBottom: "0.875rem", lineHeight: 1.25, transition: "color 0.3s", letterSpacing: "0.02em" }}>
        {tool.title}
      </div>

      {/* Description */}
      <p style={{ fontSize: "0.82rem", color: "rgba(200,200,220,0.55)", lineHeight: 1.75, flex: 1 }}>
        {tool.desc}
      </p>

      {/* CTA row */}
      <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "1rem", borderTop: `1px solid rgba(${accentRgb},${hovered ? "0.2" : "0.07"})`, transition: "border-color 0.3s" }}>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {tool.features.slice(0, 2).map((f) => (
            <span key={f} style={{ fontSize: "0.58rem", color: hovered ? tool.tagColor : "rgba(200,200,220,0.25)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px", transition: "color 0.3s" }}>{f}</span>
          ))}
        </div>
        <span className="font-cinzel" style={{ fontSize: "0.7rem", letterSpacing: "2px", color: hovered ? tool.titleColor : "rgba(200,200,220,0.25)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.3rem", transition: "all 0.3s", transform: hovered ? "translateX(3px)" : "none", whiteSpace: "nowrap" }}>
          {tool.cta} →
        </span>
      </div>
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// HERO BANNER (Superhero Mode)
// ──────────────────────────────────────────────────────────────────────────────
function HeroBanner({ onSuperheroMode }: { onSuperheroMode: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onSuperheroMode}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%",
        marginTop: "1rem",
        padding: "0",
        background: hov
          ? "linear-gradient(135deg, rgba(20,5,50,0.95) 0%, rgba(40,0,60,0.95) 40%, rgba(10,10,40,0.95) 100%)"
          : "linear-gradient(135deg, rgba(10,2,25,0.9) 0%, rgba(20,0,35,0.9) 50%, rgba(5,5,20,0.9) 100%)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${hov ? "rgba(255,184,0,0.4)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: "18px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.45s cubic-bezier(0.23,1,0.32,1)",
        color: "inherit",
        position: "relative",
        overflow: "hidden",
        boxShadow: hov ? "0 0 80px rgba(255,184,0,0.12), 0 0 160px rgba(255,0,128,0.06)" : "none",
        display: "block",
      }}
    >
      {/* Gradient background */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,184,0,0.05) 0%, rgba(255,0,128,0.04) 50%, rgba(96,160,255,0.05) 100%)", opacity: hov ? 1 : 0, transition: "opacity 0.4s", pointerEvents: "none" }} />

      {/* Top bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #FFB800 20%, #FF0080 50%, #60A0FF 80%, transparent)", opacity: hov ? 1 : 0.3, transition: "opacity 0.4s" }} />

      {/* Orbs */}
      <div style={{ position: "absolute", left: "-60px", top: "50%", transform: "translateY(-50%)", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,184,0,0.12) 0%, transparent 70%)", opacity: hov ? 1 : 0, transition: "opacity 0.5s", pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: "-60px", top: "50%", transform: "translateY(-50%)", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(96,160,255,0.12) 0%, transparent 70%)", opacity: hov ? 1 : 0, transition: "opacity 0.5s", pointerEvents: "none" }} />

      {/* Ghost text */}
      <div className="font-cinzel" style={{ position: "absolute", right: "2rem", top: "50%", transform: "translateY(-50%)", fontSize: "7rem", fontWeight: 900, color: hov ? "rgba(255,184,0,0.06)" : "rgba(255,255,255,0.02)", lineHeight: 1, letterSpacing: "-0.03em", userSelect: "none", transition: "color 0.4s", pointerEvents: "none" }}>HERO</div>

      <div style={{ padding: "2.25rem 2.5rem", display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap", position: "relative" }}>
        <div style={{
          width: "60px", height: "60px", borderRadius: "14px", flexShrink: 0,
          background: hov ? "linear-gradient(135deg, rgba(255,184,0,0.25), rgba(255,0,128,0.2), rgba(96,160,255,0.25))" : "rgba(255,255,255,0.04)",
          border: `1px solid ${hov ? "rgba(255,184,0,0.5)" : "rgba(255,255,255,0.07)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.75rem",
          filter: hov ? "drop-shadow(0 0 12px rgba(255,184,0,0.5))" : "none",
          transition: "all 0.4s",
        }}>⚡</div>

        <div style={{ flex: 1 }}>
          <div className="font-montserrat" style={{ fontSize: "0.6rem", letterSpacing: "4px", textTransform: "uppercase", color: hov ? "rgba(255,184,0,0.7)" : "rgba(200,200,220,0.25)", marginBottom: "0.4rem", transition: "color 0.3s" }}>Alternative Mode</div>
          <h3 className="font-cinzel" style={{
            fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", fontWeight: 900, letterSpacing: "0.08em",
            background: hov ? "linear-gradient(90deg, #FFB800, #FF4080, #60A0FF)" : "linear-gradient(90deg, rgba(200,200,220,0.5), rgba(200,200,220,0.3))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            marginBottom: "0.4rem", transition: "all 0.35s",
          }}>
            Hero Story Forge
          </h3>
          <p style={{ fontSize: "0.82rem", color: hov ? "rgba(200,200,220,0.6)" : "rgba(200,200,220,0.3)", lineHeight: 1.6, maxWidth: "500px", transition: "color 0.3s" }}>
            Switch to Superhero Mode — choose from 100 heroines, select your villain, set the scene, and generate a cinematic story with chapter continuation.
          </p>
        </div>

        <div style={{
          padding: "0.75rem 1.75rem", borderRadius: "10px", flexShrink: 0,
          background: hov ? "linear-gradient(135deg, rgba(255,184,0,0.2), rgba(255,0,128,0.15))" : "rgba(255,255,255,0.04)",
          border: `1px solid ${hov ? "rgba(255,184,0,0.5)" : "rgba(255,255,255,0.07)"}`,
          display: "flex", alignItems: "center", gap: "0.5rem",
          transition: "all 0.35s",
          boxShadow: hov ? "0 4px 24px rgba(255,184,0,0.2)" : "none",
        }}>
          <span className="font-cinzel" style={{ fontSize: "0.75rem", letterSpacing: "2.5px", textTransform: "uppercase", color: hov ? "#FFB800" : "rgba(200,200,220,0.3)", transition: "color 0.3s", whiteSpace: "nowrap" }}>Enter Hero Mode</span>
          <span style={{ color: hov ? "#FFB800" : "rgba(200,200,220,0.25)", transform: hov ? "translateX(3px)" : "none", transition: "all 0.3s" }}>→</span>
        </div>
      </div>
    </button>
  );
}
