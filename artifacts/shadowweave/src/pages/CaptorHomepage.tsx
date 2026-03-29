interface CaptorHomepageProps {
  onEnter: () => void;
  onBack: () => void;
}

const features = [
  { icon: "🎯", title: "Tactical Profiles", desc: "Configure operational structure, background, and resources with precision." },
  { icon: "🧠", title: "Psychological Config", desc: "Define motivation, approach methods, and psychological warfare capabilities." },
  { icon: "⚙️", title: "Strategic Planning", desc: "Map out equipment, risk tolerance, and endgame strategy." },
  { icon: "📋", title: "Full Export", desc: "Export the complete antagonist configuration as a reference document." },
];

export default function CaptorHomepage({ onEnter, onBack }: CaptorHomepageProps) {
  return (
    <div
      className="fade-in"
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
      <div style={{ marginBottom: "0.75rem" }}>
        <span
          className="badge"
          style={{ background: "rgba(44,62,80,0.3)", borderColor: "rgba(44,62,80,0.6)", color: "#7F8C8D" }}
        >
          Antagonist System
        </span>
      </div>

      <div className="captor-logo-text" style={{ marginBottom: "0.5rem" }}>
        SHADOWWEAVE
      </div>

      <p
        className="font-cinzel"
        style={{ fontSize: "clamp(0.9rem, 2vw, 1.2rem)", color: "#7F8C8D", marginBottom: "0.5rem", letterSpacing: "3px", textTransform: "uppercase" }}
      >
        Captor Configuration System
      </p>

      <div className="divider" style={{ maxWidth: "400px", margin: "1rem auto 1.5rem" }}>
        <span className="divider-symbol" style={{ color: "#7F8C8D" }}>✦</span>
      </div>

      <div
        style={{
          background: "rgba(139,0,0,0.12)",
          border: "1px solid rgba(139,0,0,0.35)",
          borderRadius: "14px",
          padding: "1.25rem 1.75rem",
          marginBottom: "2.5rem",
          maxWidth: "580px",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="font-cinzel" style={{ fontSize: "0.9rem", color: "#FF6666", marginBottom: "0.5rem", letterSpacing: "1px" }}>
          ⚠ Content Warning
        </div>
        <div style={{ fontSize: "0.88rem", color: "rgba(200,200,220,0.7)", lineHeight: 1.6 }}>
          This tool is designed for dark fiction writing and contains content related to captivity,
          psychological manipulation, and violence. For use by adult writers of dark narratives only.
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginBottom: "3rem",
          maxWidth: "950px",
          width: "100%",
        }}
      >
        {features.map((f) => (
          <div
            key={f.title}
            style={{
              background: "rgba(10,15,25,0.65)",
              backdropFilter: "blur(15px)",
              border: "1px solid rgba(44,62,80,0.45)",
              borderRadius: "16px",
              padding: "1.5rem",
              transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)",
              textAlign: "left",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = "translateY(-5px)";
              el.style.boxShadow = "0 20px 40px rgba(0,0,0,0.6)";
              el.style.borderColor = "rgba(127,140,141,0.55)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "none";
              el.style.borderColor = "rgba(44,62,80,0.45)";
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: "rgba(44,62,80,0.5)",
                border: "1px solid rgba(44,62,80,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                marginBottom: "1rem",
              }}
            >
              {f.icon}
            </div>
            <div className="font-cinzel" style={{ fontSize: "0.95rem", color: "#7F8C8D", marginBottom: "0.5rem", fontWeight: 600 }}>
              {f.title}
            </div>
            <div style={{ fontSize: "0.82rem", color: "rgba(200,200,220,0.6)", lineHeight: 1.6 }}>
              {f.desc}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          className="enter-button"
          onClick={onEnter}
          style={{ background: "linear-gradient(135deg, #2C3E50, #8B0000)", fontSize: "1.1rem", padding: "1.25rem 2.5rem" }}
        >
          Begin Configuration
        </button>
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "1px solid rgba(44,62,80,0.5)",
            borderRadius: "50px",
            padding: "1.25rem 2rem",
            color: "rgba(200,200,220,0.6)",
            fontFamily: "'Cinzel', serif",
            fontSize: "0.9rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            letterSpacing: "1px",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(127,140,141,0.6)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,200,220,0.9)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(44,62,80,0.5)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,200,220,0.6)";
          }}
        >
          ← Main Studio
        </button>
      </div>
    </div>
  );
}
