import { useState } from "react";

interface HomepageProps {
  onEnter: () => void;
  onCaptorPortal: () => void;
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

export default function Homepage({ onEnter, onCaptorPortal }: HomepageProps) {
  const [showChoice, setShowChoice] = useState(false);
  const [hoveredChoice, setHoveredChoice] = useState<null | "victim" | "captor">(null);

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
          <div style={{ marginBottom: "0.5rem" }}>
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

          <div className="divider" style={{ maxWidth: "400px", margin: "1.5rem auto 3rem" }}>
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

          <p style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "rgba(192,192,192,0.4)", letterSpacing: "2px", textTransform: "uppercase" }}>
            For adult dark fiction writers
          </p>
        </div>
      ) : (
        <div className="slide-in" style={{ width: "100%", maxWidth: "850px" }}>
          <div className="logo-text" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "0.5rem" }}>
            SHADOWWEAVE
          </div>

          <div className="divider" style={{ maxWidth: "350px", margin: "1rem auto 0.5rem" }}>
            <span className="divider-symbol">✦</span>
          </div>

          <p
            className="font-cinzel"
            style={{ fontSize: "clamp(1rem, 2vw, 1.3rem)", color: "rgba(184,134,11,0.9)", marginBottom: "0.5rem", letterSpacing: "2px" }}
          >
            Choose Your Configuration
          </p>
          <p style={{ color: "rgba(200,200,220,0.6)", marginBottom: "2.5rem", fontSize: "1rem" }}>
            Who will you be building today?
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2.5rem",
            }}
          >
            <button
              onClick={onEnter}
              onMouseEnter={() => setHoveredChoice("victim")}
              onMouseLeave={() => setHoveredChoice(null)}
              style={{
                background: hoveredChoice === "victim"
                  ? "rgba(139,0,0,0.22)"
                  : "rgba(10,0,21,0.65)",
                backdropFilter: "blur(20px)",
                border: hoveredChoice === "victim"
                  ? "1px solid rgba(184,134,11,0.65)"
                  : "1px solid rgba(139,0,0,0.4)",
                borderRadius: "20px",
                padding: "2.5rem 2rem",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)",
                transform: hoveredChoice === "victim" ? "translateY(-6px)" : "none",
                boxShadow: hoveredChoice === "victim"
                  ? "0 24px 50px rgba(0,0,0,0.6), 0 0 40px rgba(139,0,0,0.25)"
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
                  background: "linear-gradient(90deg, transparent, rgba(184,134,11,0.8), transparent)",
                  opacity: hoveredChoice === "victim" ? 1 : 0,
                  transition: "opacity 0.3s ease",
                }}
              />
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🫀</div>
              <div className="font-cinzel" style={{ fontSize: "1.4rem", color: "#B8860B", marginBottom: "0.75rem", fontWeight: 700 }}>
                Victim Profile
              </div>
              <div style={{ fontSize: "0.9rem", color: "rgba(200,200,220,0.75)", lineHeight: 1.7 }}>
                Build your character's psychological makeup, background, trauma, and emotional vulnerabilities through 7 in-depth questions.
              </div>
              <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="badge badge-crimson">7 Questions</span>
                <span style={{ fontSize: "0.8rem", color: "rgba(184,134,11,0.7)" }}>+ Story Editor</span>
              </div>
            </button>

            <button
              onClick={onCaptorPortal}
              onMouseEnter={() => setHoveredChoice("captor")}
              onMouseLeave={() => setHoveredChoice(null)}
              style={{
                background: hoveredChoice === "captor"
                  ? "rgba(44,62,80,0.22)"
                  : "rgba(10,0,21,0.65)",
                backdropFilter: "blur(20px)",
                border: hoveredChoice === "captor"
                  ? "1px solid rgba(127,140,141,0.65)"
                  : "1px solid rgba(44,62,80,0.4)",
                borderRadius: "20px",
                padding: "2.5rem 2rem",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)",
                transform: hoveredChoice === "captor" ? "translateY(-6px)" : "none",
                boxShadow: hoveredChoice === "captor"
                  ? "0 24px 50px rgba(0,0,0,0.6), 0 0 40px rgba(44,62,80,0.25)"
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
                  background: "linear-gradient(90deg, transparent, rgba(127,140,141,0.8), transparent)",
                  opacity: hoveredChoice === "captor" ? 1 : 0,
                  transition: "opacity 0.3s ease",
                }}
              />
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎭</div>
              <div className="font-cinzel" style={{ fontSize: "1.4rem", color: "#7F8C8D", marginBottom: "0.75rem", fontWeight: 700 }}>
                Captor Profile
              </div>
              <div style={{ fontSize: "0.9rem", color: "rgba(200,200,220,0.75)", lineHeight: 1.7 }}>
                Define your antagonist's operational structure, motivation, methods, and endgame strategy through 8 configuration questions.
              </div>
              <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  className="badge"
                  style={{ background: "rgba(44,62,80,0.3)", borderColor: "rgba(44,62,80,0.6)", color: "#7F8C8D" }}
                >
                  8 Questions
                </span>
                <span style={{ fontSize: "0.8rem", color: "rgba(127,140,141,0.7)" }}>+ Full Summary</span>
              </div>
            </button>
          </div>

          <button
            onClick={() => setShowChoice(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(200,200,220,0.5)",
              cursor: "pointer",
              fontSize: "0.9rem",
              letterSpacing: "1px",
              transition: "color 0.2s ease",
              padding: "0.5rem 1rem",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(200,200,220,0.9)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(200,200,220,0.5)")}
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
