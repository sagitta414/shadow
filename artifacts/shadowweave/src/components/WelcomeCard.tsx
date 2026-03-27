import { useState, useEffect } from "react";

const STORAGE_KEY = "sw_welcome_seen_v1";

export default function WelcomeCard() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setTimeout(() => { setVisible(true); setTimeout(() => setMounted(true), 40); }, 600);
    }
  }, []);

  function dismiss() {
    setMounted(false);
    setTimeout(() => setVisible(false), 350);
    localStorage.setItem(STORAGE_KEY, "1");
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1400,
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(20px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}
    >
      <div
        style={{
          width: "100%", maxWidth: "660px",
          background: "rgba(5,1,12,0.98)",
          border: "1px solid rgba(168,85,247,0.22)",
          borderRadius: "22px",
          overflow: "hidden",
          boxShadow: "0 0 100px rgba(100,0,200,0.2), 0 40px 100px rgba(0,0,0,0.8)",
          transform: mounted ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
          transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Top shimmer bar */}
        <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.7) 20%, rgba(245,214,122,0.6) 50%, rgba(239,68,68,0.6) 80%, transparent)" }} />

        {/* Header */}
        <div style={{ padding: "2rem 2rem 1.25rem", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#A855F7", boxShadow: "0 0 14px #A855F7" }} />
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "1.35rem", fontWeight: 900, letterSpacing: "6px", background: "linear-gradient(135deg, #F5D67A 0%, #E8B830 35%, #FFF 50%, #E8B830 70%, #F5D67A 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>SHADOWWEAVE</span>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#A855F7", boxShadow: "0 0 14px #A855F7" }} />
          </div>
          <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.72rem", color: "rgba(200,195,240,0.5)", letterSpacing: "1.5px", margin: 0 }}>
            A dark narrative studio powered by uncensored AI
          </p>
        </div>

        {/* Four feature blocks */}
        <div style={{ padding: "1.5rem 2rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>

          <FeatureBlock
            icon="⚡" color="168,85,247"
            title="What is SHADOWWEAVE?"
            desc="A professional dark fiction writing studio with 20+ story modes, 181+ heroines from Marvel, DC, The Boys and more — all powered by fully uncensored Venice AI. Every story generates explicit, uncensored adult narrative with no content limits."
          />

          <FeatureBlock
            icon="🎭" color="245,214,122"
            title="How to Use It"
            desc="Pick any story mode from the homepage grid. Choose your heroine, villain, setting and tone. Hit Generate — the AI writes a multi-chapter dark narrative. Save it to your Archive, continue with new chapters, or remix it anytime."
          />

          <FeatureBlock
            icon="🏆" color="239,68,68"
            title="Track Your Progress"
            desc="Your writing streak, infamy board, activity heatmap, trophy vault and heroine dossier all update automatically as you write. Earn achievements for milestones. Build your villain roster in the Villain Builder."
          />

          <FeatureBlock
            icon="🌑" color="96,165,250"
            title="Studio Tools"
            desc="Use the Sounding Board to chat with an AI co-writer, Story Dice for idea sparks, the Plot Twist Injector (⚡ bottom-left in any story mode), and Nightmare Mode for visual immersion. The theme switcher (bottom-right) changes the atmosphere."
          />
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.2), transparent)", margin: "0 2rem" }} />

        {/* Footer / dismiss */}
        <div style={{ padding: "1.25rem 2rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.45rem", color: "rgba(180,175,210,0.28)", letterSpacing: "2px", textTransform: "uppercase" }}>
            For adult dark fiction writers only · 18+
          </span>
          <button
            onClick={dismiss}
            style={{
              padding: "0.65rem 2rem",
              background: "rgba(168,85,247,0.15)",
              border: "1px solid rgba(168,85,247,0.4)",
              borderRadius: "30px",
              cursor: "pointer",
              fontFamily: "'Cinzel', serif",
              fontSize: "0.6rem", fontWeight: 700,
              letterSpacing: "3px", textTransform: "uppercase",
              color: "rgba(192,132,252,0.9)",
              transition: "all 0.22s ease",
              boxShadow: "0 0 20px rgba(168,85,247,0.12)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,85,247,0.28)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(168,85,247,0.28)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(168,85,247,0.15)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(168,85,247,0.12)"; }}
          >
            Enter the Studio →
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureBlock({ icon, color, title, desc }: { icon: string; color: string; title: string; desc: string }) {
  return (
    <div style={{
      display: "flex", gap: "1rem", alignItems: "flex-start",
      padding: "0.9rem 1rem",
      background: `rgba(${color},0.05)`,
      border: `1px solid rgba(${color},0.12)`,
      borderRadius: "12px",
    }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
        background: `rgba(${color},0.12)`,
        border: `1px solid rgba(${color},0.22)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.1rem",
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.72rem", fontWeight: 700, color: `rgba(${color},0.9)`, letterSpacing: "0.5px", marginBottom: "0.3rem" }}>{title}</div>
        <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.65rem", color: "rgba(200,195,230,0.6)", lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}
