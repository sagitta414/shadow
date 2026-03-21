import { useState, useEffect } from "react";

interface LoginProps {
  onEnter: () => void;
}

const FEATURES = [
  { icon: "◈", label: "7 Narrative Modules", sub: "Character builders, scenario engines & mappers" },
  { icon: "✦", label: "AI Sounding Board", sub: "Streaming AI collaborator trained on your story" },
  { icon: "⚡", label: "Superhero Story Forge", sub: "100 heroines, 30 villains, chapter continuation" },
  { icon: "◎", label: "Character Relationship Map", sub: "Visual node canvas with drag-and-drop dynamics" },
];

function Orbs() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: "700px", height: "700px", top: "-20%", left: "-20%", background: "radial-gradient(circle, rgba(100,0,0,0.18) 0%, transparent 65%)", animation: "orbFloat 28s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: "500px", height: "500px", bottom: "-15%", right: "5%", background: "radial-gradient(circle, rgba(45,27,105,0.2) 0%, transparent 65%)", animation: "orbFloat 22s 5s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: "350px", height: "350px", top: "40%", left: "50%", background: "radial-gradient(circle, rgba(80,5,80,0.14) 0%, transparent 65%)", animation: "orbFloat 35s 10s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: "280px", height: "280px", top: "10%", right: "10%", background: "radial-gradient(circle, rgba(139,0,0,0.1) 0%, transparent 65%)", animation: "orbFloat 18s 3s ease-in-out infinite" }} />
    </div>
  );
}

function GridOverlay() {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      backgroundImage: "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)",
      backgroundSize: "80px 80px",
    }} />
  );
}

export default function Login({ onEnter }: LoginProps) {
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shake, setShake] = useState(false);
  const [featureIndex, setFeatureIndex] = useState(-1);

  useEffect(() => {
    const t0 = setTimeout(() => setMounted(true), 80);
    const timers = FEATURES.map((_, i) =>
      setTimeout(() => setFeatureIndex(i), 600 + i * 160)
    );
    return () => { clearTimeout(t0); timers.forEach(clearTimeout); };
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); onEnter(); }, 1400);
  }

  const passInputStyle: React.CSSProperties = {
    width: "100%",
    background: focused ? "rgba(184,134,11,0.04)" : "rgba(0,0,0,0.5)",
    border: `1px solid ${focused ? "rgba(184,134,11,0.5)" : "rgba(255,255,255,0.07)"}`,
    borderRadius: "10px",
    padding: "0.95rem 1rem 0.95rem 2.75rem",
    color: "transparent",
    textShadow: "0 0 8px rgba(220,200,255,0.7)",
    fontFamily: "'Raleway', sans-serif",
    fontSize: "0.93rem",
    outline: "none",
    transition: "all 0.3s ease",
    letterSpacing: "0.4px",
    boxSizing: "border-box",
    boxShadow: focused ? "0 0 0 3px rgba(184,134,11,0.08)" : "none",
    caretColor: "rgba(184,134,11,0.8)",
  };

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", overflow: "hidden", background: "#030008", zIndex: 10 }}>

      {/* ════ LEFT PANEL — Branding ════ */}
      <div
        className="login-left"
        style={{
          position: "relative",
          flex: "0 0 56%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "3.5rem 4rem",
          overflow: "hidden",
          borderRight: "1px solid rgba(255,255,255,0.04)",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateX(0)" : "translateX(-20px)",
          transition: "opacity 0.9s cubic-bezier(0.23,1,0.32,1), transform 0.9s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        <Orbs />
        <GridOverlay />

        {/* Diagonal accent strip */}
        <div style={{ position: "absolute", top: 0, right: 0, width: "1px", bottom: 0, background: "linear-gradient(180deg, transparent 0%, rgba(139,0,0,0.3) 30%, rgba(184,134,11,0.2) 60%, transparent 100%)" }} />

        {/* Corner ornaments */}
        <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem", width: "24px", height: "24px", borderTop: "1px solid rgba(184,134,11,0.4)", borderLeft: "1px solid rgba(184,134,11,0.4)" }} />
        <div style={{ position: "absolute", bottom: "1.5rem", right: "1.5rem", width: "24px", height: "24px", borderBottom: "1px solid rgba(184,134,11,0.4)", borderRight: "1px solid rgba(184,134,11,0.4)" }} />

        {/* Studio badge */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "4rem" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8B0000", boxShadow: "0 0 10px rgba(139,0,0,0.8)" }} />
            <span className="font-montserrat" style={{ fontSize: "0.58rem", letterSpacing: "4px", textTransform: "uppercase", color: "rgba(184,134,11,0.55)", fontWeight: 700 }}>
              Professional Dark Narrative Studio
            </span>
          </div>

          {/* Main title */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ position: "relative", lineHeight: 0.85 }}>
              <h1 className="font-cinzel" style={{
                fontSize: "clamp(4rem, 8vw, 7.5rem)",
                fontWeight: 900,
                letterSpacing: "0.04em",
                color: "transparent",
                WebkitTextStroke: "1px rgba(212,175,55,0.15)",
                margin: 0, lineHeight: 0.9,
                userSelect: "none",
                position: "absolute",
                top: "4px", left: "4px",
              }}>SHADOW<br />WEAVE</h1>
              <h1 className="font-cinzel" style={{
                fontSize: "clamp(4rem, 8vw, 7.5rem)",
                fontWeight: 900,
                letterSpacing: "0.04em",
                background: "linear-gradient(160deg, #F5E8C0 0%, #D4AF37 30%, #A07030 65%, #6B4F20 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                margin: 0, lineHeight: 0.9,
                position: "relative",
                filter: "drop-shadow(0 4px 40px rgba(212,175,55,0.2))",
              }}>SHADOW<br />WEAVE</h1>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ width: "40px", height: "1px", background: "rgba(139,0,0,0.6)" }} />
            <p className="font-crimson" style={{ fontSize: "1.1rem", color: "rgba(220,210,240,0.4)", fontStyle: "italic", letterSpacing: "0.06em", margin: 0 }}>
              Where darkness becomes narrative craft
            </p>
          </div>
        </div>

        {/* Feature list */}
        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem" }}>
            <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, rgba(139,0,0,0.5), transparent)" }} />
            <span className="font-montserrat" style={{ fontSize: "0.55rem", letterSpacing: "3.5px", color: "rgba(200,200,220,0.2)", textTransform: "uppercase" }}>Studio Capabilities</span>
            <div style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, transparent, rgba(139,0,0,0.5))" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                  opacity: featureIndex >= i ? 1 : 0,
                  transform: featureIndex >= i ? "translateX(0)" : "translateX(-12px)",
                  transition: "opacity 0.5s ease, transform 0.5s ease",
                }}
              >
                <div style={{
                  width: "36px", height: "36px", borderRadius: "9px", flexShrink: 0,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(184,134,11,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", color: "rgba(184,134,11,0.7)",
                }}>
                  {f.icon}
                </div>
                <div>
                  <div className="font-cinzel" style={{ fontSize: "0.8rem", color: "rgba(220,215,240,0.75)", fontWeight: 700, marginBottom: "0.15rem", letterSpacing: "0.03em" }}>{f.label}</div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(200,200,220,0.3)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.5 }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom stats row */}
          <div style={{ display: "flex", gap: "2rem", marginTop: "2rem", paddingTop: "1.75rem", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            {[["7", "Modules"], ["100+", "Heroines"], ["2", "AI Modes"], ["4", "Themes"]].map(([v, l]) => (
              <div key={l}>
                <div className="font-cinzel" style={{ fontSize: "1.3rem", fontWeight: 900, color: "#D4AF37", letterSpacing: "1px", lineHeight: 1 }}>{v}</div>
                <div className="font-montserrat" style={{ fontSize: "0.55rem", color: "rgba(200,200,220,0.25)", letterSpacing: "2px", textTransform: "uppercase", marginTop: "0.2rem" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════ RIGHT PANEL — Login ════ */}
      <div
        className="login-right-panel"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          position: "relative",
          overflow: "hidden",
          background: "rgba(2,0,6,0.6)",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateX(0)" : "translateX(16px)",
          transition: "opacity 0.9s 0.1s cubic-bezier(0.23,1,0.32,1), transform 0.9s 0.1s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        {/* Subtle top glow */}
        <div style={{ position: "absolute", top: "-80px", left: "50%", transform: "translateX(-50%)", width: "300px", height: "200px", background: "radial-gradient(ellipse, rgba(139,0,0,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div
          className="login-form-box"
          style={{
            width: "100%",
            maxWidth: "380px",
            animation: shake ? "shakeCard 0.5s ease" : "none",
          }}
        >
          {/* Mini logo */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 1rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "30px", marginBottom: "1.5rem" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#8B0000", boxShadow: "0 0 8px rgba(139,0,0,0.9)" }} />
              <span className="font-cinzel" style={{ fontSize: "0.65rem", letterSpacing: "3px", color: "rgba(200,200,220,0.4)" }}>SHADOWWEAVE</span>
            </div>
            <h2 className="font-cinzel" style={{ fontSize: "1.5rem", fontWeight: 900, color: "#E8E8F5", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
              Enter the Dark
            </h2>
            <p style={{ fontSize: "0.8rem", color: "rgba(200,200,220,0.3)", fontFamily: "'Raleway', sans-serif", letterSpacing: "0.5px" }}>
              Enter your passphrase to proceed
            </p>
          </div>

          {/* Top accent bar */}
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,0,0,0.5) 30%, rgba(184,134,11,0.4) 60%, transparent)", marginBottom: "2rem" }} />

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

            {/* Passphrase */}
            <div>
              <label className="font-montserrat" style={{ display: "block", fontSize: "0.6rem", letterSpacing: "2.5px", textTransform: "uppercase", color: focused ? "rgba(184,134,11,0.8)" : "rgba(200,200,220,0.28)", marginBottom: "0.45rem", transition: "color 0.25s" }}>
                Passphrase
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: focused ? "rgba(139,0,0,0.8)" : "rgba(200,200,220,0.2)", fontSize: "0.85rem", pointerEvents: "none", transition: "color 0.25s" }}>◆</span>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="••••••••••••"
                  autoComplete="off"
                  spellCheck={false}
                  style={passInputStyle}
                />
              </div>
            </div>

            {/* Enter button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "0.4rem",
                width: "100%",
                padding: "1.05rem",
                background: loading ? "rgba(100,0,0,0.3)" : "linear-gradient(135deg, #5A0000 0%, #8B0000 50%, #5A0000 100%)",
                backgroundSize: "200% auto",
                border: `1px solid ${loading ? "rgba(139,0,0,0.2)" : "rgba(139,0,0,0.55)"}`,
                borderRadius: "11px",
                color: loading ? "rgba(240,240,255,0.4)" : "#F5F0FF",
                fontFamily: "'Cinzel', serif",
                fontSize: "0.88rem",
                fontWeight: 700,
                letterSpacing: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                textTransform: "uppercase",
                transition: "all 0.35s ease",
                boxShadow: loading ? "none" : "0 4px 24px rgba(139,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)",
                animation: loading ? "none" : "shimmer 3s linear infinite",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 10px 35px rgba(139,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)";
                  e.currentTarget.style.borderColor = "rgba(184,134,11,0.45)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 24px rgba(139,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)";
                  e.currentTarget.style.borderColor = "rgba(139,0,0,0.55)";
                }
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
                  <span style={{ display: "flex", gap: "4px" }}>
                    {[0,1,2].map((i) => (
                      <span key={i} style={{ display: "inline-block", width: "5px", height: "5px", borderRadius: "50%", background: "#B8860B", animation: `progressGlow 0.9s ${i * 0.2}s ease-in-out infinite` }} />
                    ))}
                  </span>
                  Entering the Dark…
                </span>
              ) : "Enter the Studio"}
            </button>

          </form>
        </div>
      </div>

      <style>{`
        @keyframes shakeCard {
          0%,100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-5px); }
          60% { transform: translateX(5px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
        @media (max-width: 720px) {
          .login-left { display: none !important; }
          .login-right-panel {
            padding: 1.5rem !important;
            justify-content: flex-start !important;
            padding-top: 3rem !important;
          }
          .login-form-box { max-width: 100% !important; }
        }
        @media (max-width: 420px) {
          .login-right-panel { padding: 1.25rem !important; padding-top: 2.5rem !important; }
        }
      `}</style>
    </div>
  );
}
