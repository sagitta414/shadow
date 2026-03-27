import { useState } from "react";
import { getAiProvider } from "../lib/aiProvider";

const CATEGORIES = [
  { id: "betrayal",    icon: "🗡", label: "Betrayal",     desc: "A trusted ally turns" },
  { id: "revelation", icon: "👁", label: "Revelation",   desc: "Hidden truth exposed" },
  { id: "power_shift",icon: "⚖", label: "Power Shift",  desc: "Control reverses" },
  { id: "unknown",    icon: "🌑", label: "The Unknown",  desc: "Something enters" },
  { id: "corruption", icon: "🩸", label: "Corruption",   desc: "The rot within" },
  { id: "sacrifice",  icon: "🔥", label: "Sacrifice",    desc: "Irreplaceable loss" },
  { id: "deception",  icon: "🎭", label: "Deception",    desc: "Layers of lies" },
  { id: "escalation", icon: "⚡", label: "Escalation",   desc: "Stakes shatter" },
];

export default function PlotTwistInjector() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("betrayal");
  const [loading, setLoading] = useState(false);
  const [twist, setTwist] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [btnHov, setBtnHov] = useState(false);

  async function generate() {
    setLoading(true);
    setTwist(null);
    setCopied(false);
    try {
      const res = await fetch("/api/plot-twist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: getAiProvider(), category: selected }),
      });
      const data = await res.json();
      setTwist(data.twist ?? "The story breaks — nothing is what it seemed.");
    } catch {
      setTwist("The signal is lost. Try again when the darkness settles.");
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    if (!twist) return;
    navigator.clipboard.writeText(twist).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const cat = CATEGORIES.find(c => c.id === selected)!;

  return (
    <>
      {/* Floating trigger button — bottom-left */}
      <button
        onClick={() => { setOpen(true); if (!twist) generate(); }}
        onMouseEnter={() => setBtnHov(true)}
        onMouseLeave={() => setBtnHov(false)}
        title="Plot Twist Injector"
        style={{
          position: "fixed",
          bottom: "1.2rem",
          left: "1.2rem",
          zIndex: 900,
          width: "46px",
          height: "46px",
          borderRadius: "14px",
          background: btnHov ? "rgba(180,0,30,0.18)" : "rgba(4,1,12,0.88)",
          border: `1px solid ${btnHov ? "rgba(220,0,40,0.55)" : "rgba(180,0,30,0.22)"}`,
          backdropFilter: "blur(14px)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
          transition: "all 0.22s ease",
          boxShadow: btnHov
            ? "0 0 22px rgba(180,0,30,0.45), 0 4px 16px rgba(0,0,0,0.6)"
            : "0 4px 16px rgba(0,0,0,0.5)",
        }}
      >
        ⚡
      </button>

      {/* Modal */}
      {open && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1200,
            background: "rgba(0,0,0,0.82)",
            backdropFilter: "blur(18px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem",
            animation: "fadeIn 0.18s ease",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "600px",
              background: "rgba(6,1,14,0.97)",
              border: "1px solid rgba(180,0,30,0.25)",
              borderRadius: "20px",
              padding: "2rem",
              boxShadow: "0 0 80px rgba(140,0,20,0.3), 0 30px 80px rgba(0,0,0,0.8)",
              animation: "twistReveal 0.28s cubic-bezier(0.22,1,0.36,1)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top shimmer line */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(220,0,40,0.7), rgba(180,0,30,0.4), transparent)",
            }} />

            {/* Header */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>⚡</span>
                  <span style={{
                    fontFamily: "'Cinzel', serif", fontSize: "0.85rem", fontWeight: 700,
                    letterSpacing: "4px", color: "#FF3050", textTransform: "uppercase",
                  }}>Plot Twist Injector</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(200,200,220,0.3)", fontSize: "1rem", lineHeight: 1,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(200,200,220,0.3)"}
                >✕</button>
              </div>
              <p style={{
                fontFamily: "'Raleway', sans-serif", fontSize: "0.6rem",
                color: "rgba(200,190,220,0.4)", letterSpacing: "1.5px",
              }}>
                Choose a category. Inject chaos into your narrative.
              </p>
            </div>

            {/* Category grid */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem",
              marginBottom: "1.5rem",
            }}>
              {CATEGORIES.map(cat => {
                const isActive = cat.id === selected;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setSelected(cat.id); setTwist(null); setCopied(false); }}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      gap: "0.35rem", padding: "0.65rem 0.3rem",
                      background: isActive ? "rgba(180,0,30,0.15)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isActive ? "rgba(220,0,40,0.5)" : "rgba(255,255,255,0.06)"}`,
                      borderRadius: "10px", cursor: "pointer", transition: "all 0.18s ease",
                      boxShadow: isActive ? "0 0 16px rgba(180,0,30,0.2)" : "none",
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; } }}
                  >
                    <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{cat.icon}</span>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.42rem", fontWeight: 700, letterSpacing: "1.5px", color: isActive ? "#FF3050" : "rgba(210,205,240,0.7)", textAlign: "center", textTransform: "uppercase" }}>{cat.label}</span>
                    <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.38rem", color: "rgba(180,175,210,0.4)", textAlign: "center", letterSpacing: "0.5px" }}>{cat.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(180,0,30,0.3), transparent)", marginBottom: "1.25rem" }} />

            {/* Twist output box */}
            <div style={{
              minHeight: "100px",
              background: "rgba(2,0,6,0.9)",
              border: "1px solid rgba(180,0,30,0.2)",
              borderRadius: "12px",
              padding: "1.2rem 1.4rem",
              marginBottom: "1.25rem",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Corner ornament */}
              <div style={{ position: "absolute", top: "0.5rem", left: "0.7rem", fontFamily: "'Cinzel', serif", fontSize: "0.38rem", color: "rgba(180,0,30,0.35)", letterSpacing: "2px", textTransform: "uppercase" }}>
                {cat.icon} {cat.label}
              </div>

              {loading && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70px", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{
                        width: "6px", height: "6px", borderRadius: "50%",
                        background: "#DC0028",
                        animation: `sessionPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }} />
                    ))}
                  </div>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.42rem", color: "rgba(180,0,30,0.5)", letterSpacing: "3px" }}>GENERATING TWIST</span>
                </div>
              )}

              {!loading && twist && (
                <p style={{
                  fontFamily: "'Crimson Text', serif",
                  fontSize: "1.05rem",
                  lineHeight: 1.75,
                  color: "rgba(230,220,240,0.9)",
                  marginTop: "1rem",
                  animation: "twistReveal 0.4s ease",
                  fontStyle: "italic",
                }}>
                  {twist}
                </p>
              )}

              {!loading && !twist && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70px" }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.5rem", color: "rgba(180,0,30,0.28)", letterSpacing: "3px" }}>SELECT CATEGORY · GENERATE</span>
                </div>
              )}
            </div>

            {/* Actions row */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={generate}
                disabled={loading}
                style={{
                  flex: 1, padding: "0.75rem 1rem",
                  background: loading ? "rgba(180,0,30,0.07)" : "rgba(180,0,30,0.15)",
                  border: "1px solid rgba(220,0,40,0.4)",
                  borderRadius: "10px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.6rem", fontWeight: 700,
                  letterSpacing: "3px", textTransform: "uppercase",
                  color: loading ? "rgba(220,0,40,0.35)" : "#FF3050",
                  transition: "all 0.2s ease",
                  boxShadow: loading ? "none" : "0 0 20px rgba(180,0,30,0.15)",
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "rgba(180,0,30,0.25)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(180,0,30,0.3)"; } }}
                onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = "rgba(180,0,30,0.15)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(180,0,30,0.15)"; } }}
              >
                {loading ? "Generating…" : twist ? "⚡ Regenerate" : "⚡ Generate Twist"}
              </button>

              {twist && (
                <button
                  onClick={copy}
                  style={{
                    padding: "0.75rem 1.1rem",
                    background: copied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${copied ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: "10px", cursor: "pointer",
                    fontFamily: "'Cinzel', serif",
                    fontSize: "0.6rem", fontWeight: 700,
                    letterSpacing: "2px", textTransform: "uppercase",
                    color: copied ? "#10b981" : "rgba(200,200,220,0.5)",
                    transition: "all 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes sessionPulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.3;transform:scale(0.5);} }
      `}</style>
    </>
  );
}
