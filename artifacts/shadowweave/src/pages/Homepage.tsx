import { useState } from "react";

interface HomepageProps {
  onEnter: () => void;
  onCaptorPortal: () => void;
  onScenarioGenerator: () => void;
}

const features = [
  {
    icon: "🌑",
    title: "Psychological Depths",
    desc: "Craft characters with complex psychological profiles, trauma, and dark motivations that drive compelling narratives.",
    accent: "rgba(139,0,0,0.4)",
  },
  {
    icon: "⛓️",
    title: "Dark Themes",
    desc: "Explore taboo subjects, moral ambiguity, and the darkest corners of human nature in your storytelling.",
    accent: "rgba(45,27,105,0.4)",
  },
  {
    icon: "🩸",
    title: "Professional Tools",
    desc: "Advanced character builders, story editors, and narrative tools designed for serious dark fiction writers.",
    accent: "rgba(61,10,74,0.4)",
  },
];

const choices = [
  {
    id: "victim" as const,
    icon: "🫀",
    title: "Victim Profile",
    titleColor: "#B8860B",
    desc: "Build your character's psychological makeup, background, trauma, and emotional vulnerabilities through 7 in-depth questions.",
    borderDefault: "rgba(139,0,0,0.4)",
    borderHover: "rgba(184,134,11,0.65)",
    bgDefault: "rgba(10,0,21,0.65)",
    bgHover: "rgba(139,0,0,0.22)",
    shadowHover: "rgba(139,0,0,0.25)",
    badge: { text: "7 Questions", bg: "rgba(139,0,0,0.2)", border: "rgba(139,0,0,0.5)", color: "#FF6666" },
    sub: { text: "+ Story Editor", color: "rgba(184,134,11,0.7)" },
    topBar: "rgba(184,134,11,0.8)",
  },
  {
    id: "captor" as const,
    icon: "🎭",
    title: "Captor Profile",
    titleColor: "#7F8C8D",
    desc: "Define your antagonist's operational structure, motivation, methods, and endgame strategy through 8 configuration questions.",
    borderDefault: "rgba(44,62,80,0.4)",
    borderHover: "rgba(127,140,141,0.65)",
    bgDefault: "rgba(10,0,21,0.65)",
    bgHover: "rgba(44,62,80,0.22)",
    shadowHover: "rgba(44,62,80,0.25)",
    badge: { text: "8 Questions", bg: "rgba(44,62,80,0.3)", border: "rgba(44,62,80,0.6)", color: "#7F8C8D" },
    sub: { text: "+ Full Summary", color: "rgba(127,140,141,0.7)" },
    topBar: "rgba(127,140,141,0.8)",
  },
  {
    id: "scenario" as const,
    icon: "⚡",
    title: "Scenario Generator",
    titleColor: "#00FF41",
    desc: "Select your captor's motive, gear, violence level, and psychology to instantly generate targeted narrative questions for your scene.",
    borderDefault: "rgba(0,255,65,0.2)",
    borderHover: "rgba(0,255,65,0.5)",
    bgDefault: "rgba(10,0,21,0.65)",
    bgHover: "rgba(0,255,65,0.07)",
    shadowHover: "rgba(0,200,50,0.2)",
    badge: { text: "4 Inputs", bg: "rgba(0,255,65,0.1)", border: "rgba(0,255,65,0.3)", color: "#00FF41" },
    sub: { text: "+ Instant Output", color: "rgba(0,255,65,0.6)" },
    topBar: "rgba(0,255,65,0.7)",
  },
];

export default function Homepage({ onEnter, onCaptorPortal, onScenarioGenerator }: HomepageProps) {
  const [showChoice, setShowChoice] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  function handleChoiceClick(id: string) {
    if (id === "victim")   onEnter();
    if (id === "captor")   onCaptorPortal();
    if (id === "scenario") onScenarioGenerator();
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        textAlign: "center",
        padding: "3rem 2rem",
      }}
    >
      {!showChoice ? (
        <div className="fade-in" style={{ width: "100%", maxWidth: "1100px" }}>
          <div style={{ marginBottom: "0.75rem" }}>
            <span className="badge badge-crimson">Dark Narrative Studio</span>
          </div>

          <div className="logo-text" style={{ marginBottom: "1rem" }}>
            SHADOWWEAVE
          </div>

          <p
            className="font-crimson"
            style={{
              fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
              color: "rgba(200,200,220,0.75)",
              marginBottom: "0.75rem",
              fontStyle: "italic",
              letterSpacing: "0.05em",
            }}
          >
            Where darkness becomes narrative
          </p>

          <div className="divider" style={{ maxWidth: "400px", margin: "1.25rem auto 3rem" }}>
            <span className="divider-symbol">✦</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
              marginBottom: "3.5rem",
            }}
          >
            {features.map((card) => (
              <div
                key={card.title}
                className="glass-card"
                style={{ cursor: "default", textAlign: "left" }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "14px",
                    background: card.accent,
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.8rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  {card.icon}
                </div>
                <div
                  className="font-cinzel"
                  style={{ fontSize: "1.1rem", color: "#D4AF37", marginBottom: "0.75rem", fontWeight: 600 }}
                >
                  {card.title}
                </div>
                <div style={{ fontSize: "0.9rem", lineHeight: "1.7", color: "rgba(200,200,220,0.75)" }}>
                  {card.desc}
                </div>
              </div>
            ))}
          </div>

          <button className="enter-button" onClick={() => setShowChoice(true)}>
            Enter the Studio
          </button>

          <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "rgba(192,192,192,0.35)", letterSpacing: "2px", textTransform: "uppercase" }}>
            For adult dark fiction writers
          </p>
        </div>
      ) : (
        <div className="slide-in" style={{ width: "100%", maxWidth: "1050px" }}>
          <div className="logo-text" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginBottom: "0.5rem" }}>
            SHADOWWEAVE
          </div>

          <div className="divider" style={{ maxWidth: "350px", margin: "0.75rem auto 0.5rem" }}>
            <span className="divider-symbol">✦</span>
          </div>

          <p
            className="font-cinzel"
            style={{ fontSize: "clamp(0.9rem, 2vw, 1.2rem)", color: "rgba(184,134,11,0.9)", marginBottom: "0.4rem", letterSpacing: "2px" }}
          >
            Choose Your Tool
          </p>
          <p style={{ color: "rgba(200,200,220,0.55)", marginBottom: "2.5rem", fontSize: "0.95rem" }}>
            Select a module to begin crafting your narrative
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.25rem",
              marginBottom: "2.5rem",
            }}
          >
            {choices.map((c) => {
              const isHovered = hovered === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleChoiceClick(c.id)}
                  onMouseEnter={() => setHovered(c.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: isHovered ? c.bgHover : c.bgDefault,
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${isHovered ? c.borderHover : c.borderDefault}`,
                    borderRadius: "20px",
                    padding: "2rem 1.75rem",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)",
                    transform: isHovered ? "translateY(-6px)" : "none",
                    boxShadow: isHovered
                      ? `0 24px 50px rgba(0,0,0,0.6), 0 0 40px ${c.shadowHover}`
                      : "0 8px 25px rgba(0,0,0,0.4)",
                    color: "inherit",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "2px",
                      background: `linear-gradient(90deg, transparent, ${c.topBar}, transparent)`,
                      opacity: isHovered ? 1 : 0,
                      transition: "opacity 0.3s ease",
                    }}
                  />

                  <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{c.icon}</div>

                  <div
                    className="font-cinzel"
                    style={{ fontSize: "1.3rem", color: c.titleColor, marginBottom: "0.75rem", fontWeight: 700 }}
                  >
                    {c.title}
                  </div>

                  <div style={{ fontSize: "0.88rem", color: "rgba(200,200,220,0.72)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                    {c.desc}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        padding: "0.25rem 0.7rem",
                        borderRadius: "50px",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        fontFamily: "'Montserrat', sans-serif",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        background: c.badge.bg,
                        border: `1px solid ${c.badge.border}`,
                        color: c.badge.color,
                      }}
                    >
                      {c.badge.text}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: c.sub.color }}>
                      {c.sub.text}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowChoice(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(200,200,220,0.45)",
              cursor: "pointer",
              fontSize: "0.9rem",
              letterSpacing: "1px",
              transition: "color 0.2s ease",
              padding: "0.5rem 1rem",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(200,200,220,0.85)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(200,200,220,0.45)")}
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
