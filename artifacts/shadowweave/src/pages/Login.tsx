import { useState, useEffect } from "react";

interface LoginProps {
  onEnter: () => void;
}

function Particles() {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    dur: Math.random() * 8 + 6,
    delay: Math.random() * 8,
    opacity: Math.random() * 0.4 + 0.08,
    color: i % 3 === 0 ? "#8B0000" : i % 3 === 1 ? "#B8860B" : "#2D1B69",
  }));

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            animation: `orbFloat ${p.dur}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function Login({ onEnter }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onEnter();
    }, 1400);
  }

  const inputBase: React.CSSProperties = {
    width: "100%",
    background: "rgba(0,0,0,0.55)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "10px",
    padding: "0.95rem 1.1rem",
    color: "#F0F0FF",
    fontFamily: "'Raleway', sans-serif",
    fontSize: "0.95rem",
    outline: "none",
    transition: "all 0.3s cubic-bezier(0.23,1,0.32,1)",
    letterSpacing: "0.5px",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {/* Background orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", width: "700px", height: "700px",
          top: "-15%", left: "-12%",
          background: "radial-gradient(circle, rgba(139,0,0,0.14) 0%, transparent 65%)",
          animation: "orbFloat 30s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: "550px", height: "550px",
          bottom: "-10%", right: "-8%",
          background: "radial-gradient(circle, rgba(45,27,105,0.18) 0%, transparent 65%)",
          animation: "orbFloat 24s 6s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: "400px", height: "400px",
          top: "40%", left: "55%",
          background: "radial-gradient(circle, rgba(61,10,74,0.12) 0%, transparent 65%)",
          animation: "orbFloat 38s 12s ease-in-out infinite",
        }} />
      </div>

      <Particles />

      {/* Scanline overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        zIndex: 1,
      }} />

      {/* Main card */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "460px",
          margin: "1.5rem",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0) scale(1)" : "translateY(28px) scale(0.97)",
          transition: "opacity 0.8s cubic-bezier(0.23,1,0.32,1), transform 0.8s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        {/* Card glow halo */}
        <div style={{
          position: "absolute", inset: -1,
          borderRadius: "24px",
          background: "linear-gradient(135deg, rgba(139,0,0,0.25) 0%, rgba(45,27,105,0.15) 50%, rgba(184,134,11,0.12) 100%)",
          filter: "blur(12px)",
          zIndex: -1,
        }} />

        <div
          style={{
            background: "rgba(4,0,10,0.88)",
            backdropFilter: "blur(28px)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "22px",
            padding: "3rem 2.75rem 2.5rem",
            position: "relative",
            overflow: "hidden",
            animation: shake ? "shakeCard 0.5s ease" : "none",
          }}
        >
          {/* Top accent bar */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "2px",
            background: "linear-gradient(90deg, transparent, #8B0000 30%, #B8860B 60%, transparent)",
            borderRadius: "22px 22px 0 0",
          }} />

          {/* Inner highlight */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "90px",
            background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, transparent 100%)",
            borderRadius: "22px 22px 0 0",
            pointerEvents: "none",
          }} />

          {/* Corner ornaments */}
          <div style={{ position: "absolute", top: "1.25rem", left: "1.25rem", width: "18px", height: "18px", borderTop: "1px solid rgba(184,134,11,0.3)", borderLeft: "1px solid rgba(184,134,11,0.3)", borderRadius: "3px 0 0 0" }} />
          <div style={{ position: "absolute", top: "1.25rem", right: "1.25rem", width: "18px", height: "18px", borderTop: "1px solid rgba(184,134,11,0.3)", borderRight: "1px solid rgba(184,134,11,0.3)", borderRadius: "0 3px 0 0" }} />
          <div style={{ position: "absolute", bottom: "1.25rem", left: "1.25rem", width: "18px", height: "18px", borderBottom: "1px solid rgba(184,134,11,0.3)", borderLeft: "1px solid rgba(184,134,11,0.3)", borderRadius: "0 0 0 3px" }} />
          <div style={{ position: "absolute", bottom: "1.25rem", right: "1.25rem", width: "18px", height: "18px", borderBottom: "1px solid rgba(184,134,11,0.3)", borderRight: "1px solid rgba(184,134,11,0.3)", borderRadius: "0 0 3px 0" }} />

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ marginBottom: "0.5rem" }}>
              <span
                className="font-cinzel"
                style={{
                  fontSize: "clamp(1.9rem, 5vw, 2.6rem)",
                  fontWeight: 900,
                  background: "linear-gradient(135deg, #8B0000 0%, #B8860B 40%, #D4AF37 60%, #8B0000 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "6px",
                  animation: "shimmer 4s linear infinite",
                  display: "inline-block",
                }}
              >
                SHADOWWEAVE
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "center", margin: "0.75rem 0" }}>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(184,134,11,0.4))" }} />
              <span style={{ fontSize: "0.6rem", color: "rgba(184,134,11,0.5)", letterSpacing: "3px", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase" }}>
                Enter the Dark
              </span>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(184,134,11,0.4), transparent)" }} />
            </div>

            <p className="font-crimson" style={{ fontSize: "0.95rem", color: "rgba(200,200,220,0.45)", fontStyle: "italic", letterSpacing: "0.3px" }}>
              Professional Dark Narrative Studio
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Email field */}
            <div style={{ position: "relative" }}>
              <label
                className="font-montserrat"
                style={{
                  display: "block",
                  fontSize: "0.65rem",
                  color: focusedField === "email" ? "#B8860B" : "rgba(200,200,220,0.3)",
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  marginBottom: "0.45rem",
                  transition: "color 0.3s ease",
                }}
              >
                Identity
              </label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
                  fontSize: "0.9rem", opacity: focusedField === "email" ? 0.8 : 0.3,
                  transition: "opacity 0.3s", pointerEvents: "none", color: "#B8860B",
                }}>
                  ◈
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="your@email.com"
                  autoComplete="email"
                  style={{
                    ...inputBase,
                    paddingLeft: "2.5rem",
                    borderColor: focusedField === "email" ? "rgba(184,134,11,0.55)" : email ? "rgba(139,0,0,0.35)" : "rgba(255,255,255,0.07)",
                    boxShadow: focusedField === "email" ? "0 0 0 3px rgba(184,134,11,0.09), inset 0 0 20px rgba(184,134,11,0.04)" : "none",
                    background: focusedField === "email" ? "rgba(184,134,11,0.04)" : email ? "rgba(139,0,0,0.04)" : "rgba(0,0,0,0.55)",
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div style={{ position: "relative" }}>
              <label
                className="font-montserrat"
                style={{
                  display: "block",
                  fontSize: "0.65rem",
                  color: focusedField === "password" ? "#B8860B" : "rgba(200,200,220,0.3)",
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  marginBottom: "0.45rem",
                  transition: "color 0.3s ease",
                }}
              >
                Passphrase
              </label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
                  fontSize: "0.9rem", opacity: focusedField === "password" ? 0.8 : 0.3,
                  transition: "opacity 0.3s", pointerEvents: "none", color: "#8B0000",
                }}>
                  ◆
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  style={{
                    ...inputBase,
                    paddingLeft: "2.5rem",
                    paddingRight: "3rem",
                    borderColor: focusedField === "password" ? "rgba(184,134,11,0.55)" : password ? "rgba(139,0,0,0.35)" : "rgba(255,255,255,0.07)",
                    boxShadow: focusedField === "password" ? "0 0 0 3px rgba(184,134,11,0.09), inset 0 0 20px rgba(184,134,11,0.04)" : "none",
                    background: focusedField === "password" ? "rgba(184,134,11,0.04)" : password ? "rgba(139,0,0,0.04)" : "rgba(0,0,0,0.55)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: "0.9rem", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: showPassword ? "#B8860B" : "rgba(200,200,220,0.25)",
                    fontSize: "0.85rem", padding: "0.25rem",
                    transition: "color 0.2s",
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#B8860B")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = showPassword ? "#B8860B" : "rgba(200,200,220,0.25)")}
                >
                  {showPassword ? "◉" : "○"}
                </button>
              </div>
            </div>

            {/* Forgot */}
            <div style={{ textAlign: "right", marginTop: "-0.25rem" }}>
              <button
                type="button"
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(184,134,11,0.4)", fontFamily: "'Raleway', sans-serif", fontSize: "0.75rem", letterSpacing: "0.5px", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(184,134,11,0.85)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(184,134,11,0.4)")}
              >
                Forgot passphrase?
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "0.5rem",
                width: "100%",
                padding: "1.05rem",
                background: loading
                  ? "rgba(139,0,0,0.3)"
                  : "linear-gradient(135deg, #6B0000 0%, #8B0000 40%, #6B0000 100%)",
                backgroundSize: "200% auto",
                border: "1px solid rgba(139,0,0,0.5)",
                borderRadius: "12px",
                color: loading ? "rgba(240,240,255,0.45)" : "#F0F0FF",
                fontFamily: "'Cinzel', serif",
                fontSize: "0.95rem",
                fontWeight: 700,
                letterSpacing: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                textTransform: "uppercase",
                transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)",
                position: "relative",
                overflow: "hidden",
                boxShadow: loading ? "none" : "0 4px 20px rgba(139,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
                animation: loading ? "none" : "shimmer 3s linear infinite",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 30px rgba(139,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)";
                  e.currentTarget.style.borderColor = "rgba(184,134,11,0.5)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(139,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)";
                  e.currentTarget.style.borderColor = "rgba(139,0,0,0.5)";
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

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "0.5rem 0" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
              <span style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.2)", letterSpacing: "2px", fontFamily: "'Montserrat', sans-serif" }}>OR</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
            </div>

            {/* Guest entry */}
            <button
              type="button"
              onClick={onEnter}
              style={{
                width: "100%",
                padding: "0.9rem",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "12px",
                color: "rgba(200,200,220,0.4)",
                fontFamily: "'Cinzel', serif",
                fontSize: "0.82rem",
                letterSpacing: "3px",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                e.currentTarget.style.color = "rgba(200,200,220,0.7)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "rgba(200,200,220,0.4)";
              }}
            >
              Continue as Guest
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.18)", letterSpacing: "1.5px", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase" }}>
              No account? &nbsp;
              <button
                type="button"
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(184,134,11,0.45)", fontFamily: "inherit", fontSize: "inherit", letterSpacing: "inherit", textTransform: "inherit", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#B8860B")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(184,134,11,0.45)")}
                onClick={onEnter}
              >
                Create one
              </button>
            </p>
          </div>
        </div>

        {/* Bottom glow strip */}
        <div style={{
          position: "absolute", bottom: "-20px", left: "15%", right: "15%", height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(139,0,0,0.4) 30%, rgba(184,134,11,0.3) 60%, transparent)",
          filter: "blur(4px)",
        }} />
      </div>

      <style>{`
        @keyframes shakeCard {
          0%,100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}
