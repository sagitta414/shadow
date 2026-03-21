import { useState } from "react";

interface HomepageProps {
  onEnter: () => void;
  onCaptorPortal: () => void;
  onScenarioGenerator: () => void;
  onCharacterMapper: () => void;
  onSoundingBoard: () => void;
}

const tools = [
  {
    id: "victim",
    num: "01",
    icon: "🫀",
    title: "Victim Profile",
    subtitle: "Character Builder",
    desc: "Craft a character's complete psychological makeup — their trauma, fears, vulnerabilities, and breaking points — through 7 deep configuration questions.",
    cta: "Build Character",
    accent: "#8B0000",
    accentDim: "rgba(139,0,0,0.12)",
    accentBorder: "rgba(139,0,0,0.35)",
    accentHover: "rgba(139,0,0,0.22)",
    accentGlow: "rgba(139,0,0,0.5)",
    titleColor: "#D4AF37",
    tag: "7 Questions + Story Editor",
    tagColor: "rgba(212,175,55,0.8)",
  },
  {
    id: "captor",
    num: "02",
    icon: "🎭",
    title: "Captor Profile",
    subtitle: "Antagonist System",
    desc: "Define the antagonist's full operational profile — motive, methods, psychological approach, resources, and endgame — through 8 configuration questions.",
    cta: "Configure Captor",
    accent: "#2C3E50",
    accentDim: "rgba(44,62,80,0.12)",
    accentBorder: "rgba(44,62,80,0.4)",
    accentHover: "rgba(44,62,80,0.22)",
    accentGlow: "rgba(44,62,80,0.5)",
    titleColor: "#7F8C8D",
    tag: "8 Questions + Export",
    tagColor: "rgba(127,140,141,0.8)",
  },
  {
    id: "scenario",
    num: "03",
    icon: "⚡",
    title: "Scenario Engine",
    subtitle: "Question Generator",
    desc: "Select the captor's motive, control method, violence level, and psychology to generate 8 targeted narrative questions tailored to your exact scenario.",
    cta: "Generate Questions",
    accent: "#005500",
    accentDim: "rgba(0,200,80,0.07)",
    accentBorder: "rgba(0,200,80,0.25)",
    accentHover: "rgba(0,200,80,0.1)",
    accentGlow: "rgba(0,200,80,0.4)",
    titleColor: "#00CC44",
    tag: "4 Inputs · Instant Output",
    tagColor: "rgba(0,200,80,0.7)",
  },
  {
    id: "mapper",
    num: "04",
    icon: "◎",
    title: "Relationship Map",
    subtitle: "Character Dynamics",
    desc: "Build a visual node map of every character — victim, captor, family, police. Draw connections and label them: Hates, Secretly Loves, Blackmails, Owes Money.",
    cta: "Open Mapper",
    accent: "#2D1B69",
    accentDim: "rgba(45,27,105,0.12)",
    accentBorder: "rgba(45,27,105,0.4)",
    accentHover: "rgba(45,27,105,0.22)",
    accentGlow: "rgba(45,27,105,0.5)",
    titleColor: "#9060E0",
    tag: "Visual · Drag & Drop · Export",
    tagColor: "rgba(144,96,224,0.8)",
  },
  {
    id: "themes",
    num: "05",
    icon: "◼",
    title: "Mood Lighting",
    subtitle: "Interface Atmosphere",
    desc: "Transform the studio's entire visual palette to match your story's tone. Void darkness, Cold Blue isolation, Flickering Candlelight claustrophobia, Static & Glitch distress.",
    cta: "Change Atmosphere",
    accent: "#5A3800",
    accentDim: "rgba(90,56,0,0.15)",
    accentBorder: "rgba(180,120,0,0.35)",
    accentHover: "rgba(90,56,0,0.25)",
    accentGlow: "rgba(180,120,0,0.4)",
    titleColor: "#C8960A",
    tag: "4 Themes · Live Preview",
    tagColor: "rgba(200,150,10,0.8)",
  },
  {
    id: "sounding",
    num: "06",
    icon: "✦",
    title: "Sounding Board",
    subtitle: "AI Co-Writer",
    desc: "Chat with an AI narrative collaborator trained on your story. Ask what your captor would do, get three unexpected plot twists, break creative blocks instantly.",
    cta: "Talk to AI",
    accent: "#004d38",
    accentDim: "rgba(0,100,80,0.12)",
    accentBorder: "rgba(0,200,130,0.25)",
    accentHover: "rgba(0,100,80,0.2)",
    accentGlow: "rgba(0,200,130,0.4)",
    titleColor: "#00C882",
    tag: "Streaming AI · Venice AI",
    tagColor: "rgba(0,200,130,0.8)",
  },
];

export default function Homepage({ onEnter, onCaptorPortal, onScenarioGenerator, onCharacterMapper, onSoundingBoard }: HomepageProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  function handleClick(id: string) {
    if (id === "victim")   onEnter();
    if (id === "captor")   onCaptorPortal();
    if (id === "scenario") onScenarioGenerator();
    if (id === "mapper")   onCharacterMapper();
    if (id === "sounding") onSoundingBoard();
    if (id === "themes") {
      // Open theme switcher — click the theme button in bottom-right
      const btn = document.querySelector("[title='Change theme']") as HTMLButtonElement | null;
      btn?.click();
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Edge vignette */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 10, background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.7) 100%)" }} />

      {/* Hero */}
      <header style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "5rem 2rem 3rem", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
          <div style={{ width: "40px", height: "1px", background: "rgba(184,134,11,0.5)" }} />
          <span className="font-montserrat" style={{ fontSize: "0.7rem", letterSpacing: "4px", textTransform: "uppercase", color: "rgba(184,134,11,0.7)", fontWeight: 600 }}>
            Professional Dark Narrative Studio
          </span>
          <div style={{ width: "40px", height: "1px", background: "rgba(184,134,11,0.5)" }} />
        </div>

        <h1 className="logo-text" style={{ lineHeight: 1, marginBottom: "1.5rem" }}>SHADOWWEAVE</h1>

        <p className="font-crimson" style={{ fontSize: "clamp(1.1rem, 2vw, 1.4rem)", color: "rgba(220,220,240,0.55)", fontStyle: "italic", letterSpacing: "0.06em", maxWidth: "500px" }}>
          Where darkness becomes narrative
        </p>

        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "120px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,0,0,0.8), transparent)" }} />
      </header>

      {/* Tools grid */}
      <main style={{ flex: 1, padding: "3rem 2rem 4rem", maxWidth: "1300px", margin: "0 auto", width: "100%" }}>

        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p className="font-cinzel" style={{ fontSize: "0.75rem", letterSpacing: "4px", textTransform: "uppercase", color: "rgba(200,200,220,0.3)" }}>
            Select a module to begin
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5px", background: "rgba(255,255,255,0.04)", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
          {tools.map((tool) => {
            const isHovered = hovered === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => handleClick(tool.id)}
                onMouseEnter={() => setHovered(tool.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: isHovered ? tool.accentHover : "rgba(6,0,12,0.85)",
                  backdropFilter: "blur(20px)",
                  border: "none",
                  padding: "2.5rem 2rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.4s cubic-bezier(0.23,1,0.32,1)",
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Active left border */}
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: tool.accent, opacity: isHovered ? 1 : 0, transition: "opacity 0.3s ease", boxShadow: `0 0 20px ${tool.accentGlow}` }} />
                {/* Top glow */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, ${tool.accent}, transparent)`, opacity: isHovered ? 0.9 : 0, transition: "opacity 0.4s ease" }} />
                {/* Hover glow circle */}
                <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "200px", height: "200px", borderRadius: "50%", background: `radial-gradient(circle, ${tool.accentGlow} 0%, transparent 70%)`, opacity: isHovered ? 0.5 : 0, transition: "opacity 0.4s ease", pointerEvents: "none" }} />

                {/* Number */}
                <div className="font-cinzel" style={{ fontSize: "0.7rem", letterSpacing: "3px", color: isHovered ? tool.titleColor : "rgba(200,200,220,0.2)", fontWeight: 700, marginBottom: "1.5rem", transition: "color 0.3s ease" }}>
                  {tool.num}
                </div>

                {/* Icon */}
                <div style={{ fontSize: "2.2rem", marginBottom: "1.25rem", filter: isHovered ? "drop-shadow(0 0 12px rgba(255,255,255,0.3))" : "none", transition: "filter 0.3s ease", lineHeight: 1 }}>
                  {tool.icon}
                </div>

                {/* Subtitle */}
                <div className="font-montserrat" style={{ fontSize: "0.7rem", letterSpacing: "3px", textTransform: "uppercase", color: "rgba(200,200,220,0.35)", marginBottom: "0.4rem", fontWeight: 600 }}>
                  {tool.subtitle}
                </div>

                {/* Title */}
                <div className="font-cinzel" style={{ fontSize: "clamp(1.4rem, 2vw, 1.8rem)", color: isHovered ? tool.titleColor : "#E8E8F0", fontWeight: 700, marginBottom: "1rem", transition: "color 0.3s ease", lineHeight: 1.2 }}>
                  {tool.title}
                </div>

                {/* Description */}
                <p style={{ fontSize: "0.88rem", color: "rgba(200,200,220,0.6)", lineHeight: 1.75, marginBottom: "2rem", flex: 1 }}>
                  {tool.desc}
                </p>

                {/* CTA row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                  <span style={{ fontSize: "0.72rem", color: isHovered ? tool.tagColor : "rgba(200,200,220,0.25)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px", transition: "color 0.3s ease" }}>
                    {tool.tag}
                  </span>
                  <span className="font-cinzel" style={{ fontSize: "0.8rem", letterSpacing: "2px", textTransform: "uppercase", color: isHovered ? tool.titleColor : "rgba(200,200,220,0.25)", display: "flex", alignItems: "center", gap: "0.4rem", transition: "all 0.3s ease", transform: isHovered ? "translateX(4px)" : "none", whiteSpace: "nowrap" }}>
                    {tool.cta} →
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Stats strip */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.04)", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            {[
              { label: "Modules", value: "6" },
              { label: "Questions", value: "15+" },
              { label: "AI Modes", value: "2" },
              { label: "Themes", value: "4" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div className="font-cinzel" style={{ fontSize: "1.1rem", color: "#D4AF37", fontWeight: 700 }}>{stat.value}</div>
                <div style={{ fontSize: "0.7rem", color: "rgba(200,200,220,0.3)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>{stat.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.72rem", color: "rgba(200,200,220,0.2)", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>
            For adult dark fiction writers only
          </p>
        </div>
      </main>
    </div>
  );
}
