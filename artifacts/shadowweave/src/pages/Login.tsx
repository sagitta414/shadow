import { useState, useEffect } from "react";

interface LoginProps {
  onEnter: () => void;
  onAdmin: () => void;
}

const CORRECT_PASS = "shadow";
const EMAIL_KEY = "sw_visitor_email_v1";

const ICONS = [
  "/icons/heroine-forge.png",
  "/icons/celebrity-captive.png",
  "/icons/custom-scenario.png",
  "/icons/mind-break.png",
  "/icons/two-heroines.png",
  "/icons/rescue-gone-wrong.png",
  "/icons/power-drain.png",
  "/icons/mass-capture.png",
  "/icons/corruption-arc.png",
  "/icons/interrogation-room.png",
  "/icons/captor-config.png",
  "/icons/captor-logic.png",
  "/icons/scenario-engine.png",
  "/icons/relationship-map.png",
  "/icons/sounding-board.png",
];

const STATS = [
  ["31+", "Story Modes"],
  ["210+", "Heroines"],
  ["Venice AI", "Engine"],
  ["Uncensored", "Model"],
];

async function registerVisitor(email: string): Promise<void> {
  try {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    await fetch(`${base}/api/visitors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch {
    // silent — never block studio entry on network error
  }
}

export default function Login({ onEnter, onAdmin }: LoginProps) {
  const [step, setStep] = useState<"password" | "email">("password");
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shake, setShake] = useState(false);
  const [denied, setDenied] = useState(false);

  const savedEmail = typeof window !== "undefined"
    ? localStorage.getItem(EMAIL_KEY) ?? ""
    : "";
  const [email, setEmail] = useState(savedEmail);
  const [emailFocused, setEmailFocused] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    if (password.trim().toLowerCase() !== CORRECT_PASS) {
      setShake(true);
      setDenied(true);
      setTimeout(() => setShake(false), 600);
      setTimeout(() => setDenied(false), 3000);
      setPassword("");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("email");
    }, 900);
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) {
      setEmailError("Please enter a valid email address.");
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    setEmailError("");
    setEmailLoading(true);
    localStorage.setItem(EMAIL_KEY, trimmed);
    await registerVisitor(trimmed);
    setEmailLoading(false);
    onEnter();
  }

  const cardStyle: React.CSSProperties = {
    position: "relative",
    background: "rgba(6,2,18,0.88)",
    backdropFilter: "blur(30px)",
    borderRadius: "20px",
    border: `1px solid ${denied ? "rgba(239,68,68,0.35)" : "rgba(168,85,247,0.35)"}`,
    boxShadow: denied
      ? "0 0 0 2px rgba(239,68,68,0.35), 0 32px 80px rgba(0,0,0,0.7), 0 0 80px rgba(168,85,247,0.08)"
      : "0 32px 80px rgba(0,0,0,0.7), 0 0 80px rgba(168,85,247,0.12), 0 0 0 1px rgba(168,85,247,0.08)",
    padding: "2.5rem 2.25rem 2.25rem",
    transition: "box-shadow 0.3s, border-color 0.3s",
    animation: shake ? "shakeCard 0.5s ease" : "none",
  };

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#020008", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        @keyframes shimmerSlide { 0% { background-position: 0% center; } 100% { background-position: 200% center; } }
        @keyframes floatA { 0%,100% { transform: translateY(0) translateX(0); } 33% { transform: translateY(-22px) translateX(10px); } 66% { transform: translateY(12px) translateX(-8px); } }
        @keyframes floatB { 0%,100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(18px) translateX(-14px); } }
        @keyframes floatC { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.45; transform:scale(0.6); } }
        @keyframes shakeCard { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-9px)} 30%{transform:translateX(9px)} 45%{transform:translateX(-5px)} 60%{transform:translateX(5px)} 75%{transform:translateX(-3px)} 90%{transform:translateX(3px)} }
        @keyframes deniedPulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,60,60,0);} 50%{box-shadow:0 0 14px 4px rgba(255,40,40,0.35);} }
        @keyframes iconReveal { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
        @keyframes cardRise { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes progressGlow { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes stepSlideIn { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      {/* ── ICON MOSAIC BACKDROP ── */}
      <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gridTemplateRows: "repeat(3, 1fr)", gap: 0, pointerEvents: "none" }}>
        {ICONS.map((src, i) => (
          <div
            key={i}
            style={{
              overflow: "hidden",
              opacity: mounted ? 0.14 : 0,
              transition: `opacity 1.2s ${0.05 * i}s ease`,
              filter: "saturate(0.6) brightness(0.7)",
              animation: mounted ? `iconReveal 1.2s ${0.04 * i}s ease both` : "none",
            }}
          >
            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        ))}
      </div>

      {/* ── DARK VIGNETTE ── */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(2,0,8,0.55) 0%, rgba(2,0,8,0.92) 70%)", pointerEvents: "none" }} />

      {/* ── ANIMATED GLOWS ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: "900px", height: "900px", top: "-30%", left: "-15%", background: "radial-gradient(circle, rgba(120,0,220,0.22) 0%, transparent 60%)", animation: "floatA 20s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: "700px", height: "700px", bottom: "-20%", right: "-10%", background: "radial-gradient(circle, rgba(220,50,100,0.18) 0%, transparent 60%)", animation: "floatB 26s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: "500px", height: "500px", top: "30%", right: "5%", background: "radial-gradient(circle, rgba(240,140,0,0.12) 0%, transparent 60%)", animation: "floatC 16s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: "600px", height: "300px", bottom: "0%", left: "25%", background: "radial-gradient(ellipse, rgba(60,10,180,0.14) 0%, transparent 70%)", animation: "floatC 30s 5s ease-in-out infinite" }} />
      </div>

      {/* ── TOP NAV STRIP ── */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "54px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2.5rem", zIndex: 10, background: "rgba(4,1,10,0.7)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.5) 25%, rgba(251,191,36,0.4) 50%, rgba(239,68,68,0.5) 75%, transparent)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#A855F7", boxShadow: "0 0 14px #A855F7, 0 0 30px rgba(168,85,247,0.4)", animation: "pulseDot 2.5s ease-in-out infinite" }} />
          <span style={{ fontSize: "0.9rem", fontWeight: 900, letterSpacing: "5px", background: "linear-gradient(135deg, #F5D67A 0%, #E8B830 35%, #D4A017 55%, #E8C840 75%, #F5D67A 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontFamily: "'Cinzel', serif", animation: "shimmerSlide 5s linear infinite" }}>SHADOWWEAVE</span>
        </div>
        <div style={{ display: "flex", gap: "2rem" }}>
          {STATS.map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 900, color: "rgba(230,190,60,0.75)", lineHeight: 1, fontFamily: "'Cinzel', serif" }}>{v}</div>
              <div style={{ fontSize: "0.38rem", color: "rgba(200,200,220,0.28)", letterSpacing: "2px", textTransform: "uppercase", marginTop: "2px", fontFamily: "'Montserrat', sans-serif" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CENTER CARD ── */}
      <div
        style={{
          position: "relative",
          zIndex: 20,
          width: "100%",
          maxWidth: "420px",
          padding: "0 1.5rem",
          animation: mounted ? "cardRise 0.8s 0.15s cubic-bezier(0.23,1,0.32,1) both" : "none",
        }}
      >
        <div style={cardStyle}>
          {/* Top shimmer line */}
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.9) 30%, rgba(251,191,36,0.9) 70%, transparent)", borderRadius: "1px" }} />
          {/* Inner top glow */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "120px", background: "radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.12) 0%, transparent 70%)", borderRadius: "20px 20px 0 0", pointerEvents: "none" }} />

          {/* Logo badge */}
          <div style={{ textAlign: "center", marginBottom: "2rem", position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.38rem 1.1rem", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.28)", borderRadius: "30px", marginBottom: "1.6rem" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#A855F7", boxShadow: "0 0 10px #A855F7, 0 0 20px rgba(168,85,247,0.5)", animation: "pulseDot 2.5s ease-in-out infinite" }} />
              <span style={{ fontSize: "0.6rem", letterSpacing: "3.5px", color: "rgba(192,132,252,0.8)", fontFamily: "'Cinzel', serif", fontWeight: 700 }}>SHADOWWEAVE</span>
            </div>

            {step === "password" ? (
              <>
                <h2 style={{ margin: "0 0 0.4rem", fontFamily: "'Cinzel', serif", fontSize: "2rem", fontWeight: 900, letterSpacing: "0.06em", background: "linear-gradient(135deg, #F5D67A 0%, #FFFFFF 45%, #F5D67A 80%, #E8B830 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmerSlide 5s linear infinite", lineHeight: 1.15 }}>
                  Enter the Dark
                </h2>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "rgba(200,195,240,0.38)", fontFamily: "'Raleway', sans-serif", letterSpacing: "1px" }}>
                  Enter your passphrase to proceed
                </p>
              </>
            ) : (
              <div style={{ animation: "stepSlideIn 0.4s cubic-bezier(0.23,1,0.32,1) both" }}>
                <h2 style={{ margin: "0 0 0.4rem", fontFamily: "'Cinzel', serif", fontSize: "1.75rem", fontWeight: 900, letterSpacing: "0.06em", background: "linear-gradient(135deg, #F5D67A 0%, #FFFFFF 45%, #F5D67A 80%, #E8B830 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmerSlide 5s linear infinite", lineHeight: 1.15 }}>
                  Register Your Presence
                </h2>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "rgba(200,195,240,0.38)", fontFamily: "'Raleway', sans-serif", letterSpacing: "1px" }}>
                  Leave your mark before you enter
                </p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.3) 30%, rgba(251,191,36,0.25) 70%, transparent)", marginBottom: "1.8rem" }} />

          {/* ACCESS DENIED banner — only on password step */}
          {step === "password" && (
            <div style={{
              overflow: "hidden",
              maxHeight: denied ? "90px" : "0px",
              opacity: denied ? 1 : 0,
              marginBottom: denied ? "1.2rem" : "0",
              transition: "max-height 0.3s cubic-bezier(0.23,1,0.32,1), opacity 0.25s ease, margin-bottom 0.3s ease",
            }}>
              <div style={{ position: "relative", padding: "0.85rem 1.1rem", background: "rgba(90,0,0,0.6)", border: "1px solid rgba(239,68,68,0.5)", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.85rem", overflow: "hidden", boxShadow: "0 0 30px rgba(180,0,0,0.2)" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,60,60,0.8) 40%, transparent)" }} />
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0, background: "rgba(180,0,0,0.4)", border: "1px solid rgba(255,60,60,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", animation: "deniedPulse 1s ease-in-out infinite" }}>🚫</div>
                <div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.8rem", fontWeight: 900, color: "#F87171", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.15rem" }}>Access Denied</div>
                  <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.65rem", color: "rgba(255,150,150,0.5)", letterSpacing: "0.5px" }}>Invalid passphrase. The dark does not yield.</div>
                </div>
              </div>
            </div>
          )}

          {/* Email error banner */}
          {step === "email" && emailError && (
            <div style={{ marginBottom: "1rem", padding: "0.7rem 1rem", background: "rgba(90,0,0,0.5)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "10px", fontSize: "0.7rem", color: "#F87171", fontFamily: "'Raleway', sans-serif", letterSpacing: "0.4px" }}>
              {emailError}
            </div>
          )}

          {/* ── STEP: PASSWORD ── */}
          {step === "password" && (
            <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.56rem", letterSpacing: "3px", textTransform: "uppercase", color: focused ? "rgba(192,132,252,0.9)" : "rgba(200,195,240,0.3)", marginBottom: "0.5rem", transition: "color 0.25s", fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>
                  Passphrase
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: focused ? "#A855F7" : "rgba(200,195,240,0.2)", fontSize: "0.8rem", pointerEvents: "none", transition: "color 0.25s", textShadow: focused ? "0 0 12px rgba(168,85,247,0.8)" : "none" }}>◆</span>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="••••••••••••"
                    autoComplete="off"
                    spellCheck={false}
                    style={{
                      width: "100%",
                      background: denied ? "rgba(80,0,0,0.3)" : focused ? "rgba(168,85,247,0.06)" : "rgba(0,0,0,0.45)",
                      border: `1px solid ${denied ? "rgba(239,68,68,0.5)" : focused ? "rgba(168,85,247,0.55)" : "rgba(168,85,247,0.15)"}`,
                      borderRadius: "12px",
                      padding: "0.95rem 1rem 0.95rem 2.75rem",
                      color: "transparent",
                      textShadow: "0 0 8px rgba(220,200,255,0.8)",
                      fontFamily: "'Raleway', sans-serif",
                      fontSize: "0.95rem",
                      outline: "none",
                      transition: "all 0.3s ease",
                      boxSizing: "border-box",
                      boxShadow: denied ? "0 0 0 3px rgba(239,68,68,0.1)" : focused ? "0 0 0 3px rgba(168,85,247,0.12), 0 0 20px rgba(168,85,247,0.08)" : "none",
                      caretColor: "#A855F7",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: "0.3rem",
                  width: "100%",
                  padding: "1.05rem",
                  background: loading ? "rgba(80,40,120,0.3)" : "linear-gradient(135deg, #6D28D9 0%, #9333EA 40%, #7C3AED 70%, #6D28D9 100%)",
                  backgroundSize: "200% auto",
                  border: `1px solid ${loading ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.6)"}`,
                  borderRadius: "13px",
                  color: loading ? "rgba(200,180,255,0.4)" : "#F5F0FF",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  letterSpacing: "4px",
                  cursor: loading ? "not-allowed" : "pointer",
                  textTransform: "uppercase",
                  transition: "all 0.3s ease",
                  boxShadow: loading ? "none" : "0 6px 30px rgba(109,40,217,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
                  animation: loading ? "none" : "shimmerSlide 3s linear infinite",
                }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(109,40,217,0.6), 0 0 60px rgba(168,85,247,0.2), inset 0 1px 0 rgba(255,255,255,0.12)"; } }}
                onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 30px rgba(109,40,217,0.45), inset 0 1px 0 rgba(255,255,255,0.12)"; } }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
                    <span style={{ display: "flex", gap: "5px" }}>
                      {[0, 1, 2].map((i) => (
                        <span key={i} style={{ display: "inline-block", width: "5px", height: "5px", borderRadius: "50%", background: "#C084FC", animation: `progressGlow 0.9s ${i * 0.2}s ease-in-out infinite` }} />
                      ))}
                    </span>
                    Verifying…
                  </span>
                ) : "Enter the Studio"}
              </button>
            </form>
          )}

          {/* ── STEP: EMAIL ── */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", animation: "stepSlideIn 0.35s cubic-bezier(0.23,1,0.32,1) both" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.56rem", letterSpacing: "3px", textTransform: "uppercase", color: emailFocused ? "rgba(192,132,252,0.9)" : "rgba(200,195,240,0.3)", marginBottom: "0.5rem", transition: "color 0.25s", fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>
                  Your Email
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: emailFocused ? "#A855F7" : "rgba(200,195,240,0.2)", fontSize: "0.8rem", pointerEvents: "none", transition: "color 0.25s" }}>✉</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                    style={{
                      width: "100%",
                      background: emailFocused ? "rgba(168,85,247,0.06)" : "rgba(0,0,0,0.45)",
                      border: `1px solid ${emailError ? "rgba(239,68,68,0.5)" : emailFocused ? "rgba(168,85,247,0.55)" : "rgba(168,85,247,0.15)"}`,
                      borderRadius: "12px",
                      padding: "0.95rem 1rem 0.95rem 2.75rem",
                      color: "#E8E0FF",
                      fontFamily: "'Raleway', sans-serif",
                      fontSize: "0.95rem",
                      outline: "none",
                      transition: "all 0.3s ease",
                      boxSizing: "border-box",
                      boxShadow: emailFocused ? "0 0 0 3px rgba(168,85,247,0.12), 0 0 20px rgba(168,85,247,0.08)" : "none",
                      caretColor: "#A855F7",
                    }}
                  />
                </div>
                <p style={{ margin: "0.5rem 0 0", fontSize: "0.6rem", color: "rgba(200,195,240,0.28)", fontFamily: "'Raleway', sans-serif", letterSpacing: "0.4px" }}>
                  Used only to track studio visits. Never shared.
                </p>
              </div>

              <button
                type="submit"
                disabled={emailLoading}
                style={{
                  marginTop: "0.3rem",
                  width: "100%",
                  padding: "1.05rem",
                  background: emailLoading ? "rgba(80,40,120,0.3)" : "linear-gradient(135deg, #6D28D9 0%, #9333EA 40%, #7C3AED 70%, #6D28D9 100%)",
                  backgroundSize: "200% auto",
                  border: `1px solid ${emailLoading ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.6)"}`,
                  borderRadius: "13px",
                  color: emailLoading ? "rgba(200,180,255,0.4)" : "#F5F0FF",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  letterSpacing: "4px",
                  cursor: emailLoading ? "not-allowed" : "pointer",
                  textTransform: "uppercase",
                  transition: "all 0.3s ease",
                  boxShadow: emailLoading ? "none" : "0 6px 30px rgba(109,40,217,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
                  animation: emailLoading ? "none" : "shimmerSlide 3s linear infinite",
                }}
                onMouseEnter={(e) => { if (!emailLoading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(109,40,217,0.6), 0 0 60px rgba(168,85,247,0.2), inset 0 1px 0 rgba(255,255,255,0.12)"; } }}
                onMouseLeave={(e) => { if (!emailLoading) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 30px rgba(109,40,217,0.45), inset 0 1px 0 rgba(255,255,255,0.12)"; } }}
              >
                {emailLoading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
                    <span style={{ display: "flex", gap: "5px" }}>
                      {[0, 1, 2].map((i) => (
                        <span key={i} style={{ display: "inline-block", width: "5px", height: "5px", borderRadius: "50%", background: "#C084FC", animation: `progressGlow 0.9s ${i * 0.2}s ease-in-out infinite` }} />
                      ))}
                    </span>
                    Entering the Dark…
                  </span>
                ) : "Enter the Studio"}
              </button>
            </form>
          )}

          {/* Bottom card footer */}
          <div style={{ marginTop: "1.6rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(168,85,247,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.52rem", color: "rgba(200,195,240,0.18)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>Venice AI · Uncensored</span>
            {/* ── Admin access (subtle) ── */}
            <button
              onClick={onAdmin}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", fontSize: "0.48rem", color: "rgba(200,195,240,0.12)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", transition: "color 0.3s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(192,132,252,0.5)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(200,195,240,0.12)"; }}
              title="Admin access"
            >
              ⚙ Admin
            </button>
            <span style={{ fontSize: "0.52rem", color: "rgba(200,195,240,0.18)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>Adults Only</span>
          </div>
        </div>

        {/* Below-card tagline */}
        <p style={{ textAlign: "center", marginTop: "1.4rem", fontSize: "0.7rem", color: "rgba(200,195,240,0.22)", fontFamily: "'Crimson Text', Georgia, serif", fontStyle: "italic", letterSpacing: "0.06em" }}>
          Where darkness becomes narrative craft
        </p>
      </div>

      {/* ── BOTTOM MODE PREVIEW STRIP ── */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "68px", display: "flex", alignItems: "stretch", overflow: "hidden", opacity: mounted ? 1 : 0, transition: "opacity 1.2s 0.5s ease" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent, rgba(4,1,12,0.96))", pointerEvents: "none", zIndex: 1 }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.2) 30%, rgba(251,191,36,0.15) 70%, transparent)" }} />
        {ICONS.slice(0, 15).map((src, i) => (
          <div key={i} style={{ flex: 1, overflow: "hidden", filter: "saturate(0.5) brightness(0.5)" }}>
            <img src={src} alt="" style={{ width: "100%", height: "68px", objectFit: "cover", display: "block" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
