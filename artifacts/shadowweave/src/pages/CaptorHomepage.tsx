interface CaptorHomepageProps {
  onEnter: () => void;
  onBack: () => void;
}

export default function CaptorHomepage({ onEnter, onBack }: CaptorHomepageProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1C2833 0%, #0A0015 50%, #000000 100%)",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div className="captor-logo-text" style={{ marginBottom: "1.5rem" }}>
        SHADOWWEAVE
      </div>
      <div
        className="font-montserrat"
        style={{
          fontSize: "clamp(1rem, 2.5vw, 1.8rem)",
          color: "#7F8C8D",
          marginBottom: "2rem",
          opacity: 0.9,
          textShadow: "0 0 30px rgba(127,140,141,0.6)",
        }}
      >
        Captor Configuration System
      </div>

      <div
        style={{
          background: "rgba(139,0,0,0.2)",
          border: "2px solid #8B0000",
          borderRadius: "15px",
          padding: "1.5rem",
          marginBottom: "2.5rem",
          maxWidth: "600px",
        }}
      >
        <div className="font-cinzel" style={{ fontSize: "1.2rem", color: "#8B0000", marginBottom: "0.5rem" }}>
          ⚠ Content Warning
        </div>
        <div style={{ fontSize: "0.95rem", color: "#C0C0C0", lineHeight: 1.5 }}>
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
          maxWidth: "900px",
          width: "100%",
        }}
      >
        {[
          { icon: "🎯", title: "Tactical Profiles", desc: "Configure operational structure, background, and resources with precision." },
          { icon: "🧠", title: "Psychological Config", desc: "Define motivation, approach methods, and psychological warfare capabilities." },
          { icon: "⚙️", title: "Strategic Planning", desc: "Map out equipment, risk tolerance, and endgame strategy." },
          { icon: "📋", title: "Full Summary Export", desc: "Export complete antagonist configuration as a reference document." },
        ].map((f) => (
          <div
            key={f.title}
            style={{
              background: "rgba(44,62,80,0.3)",
              border: "2px solid #2C3E50",
              borderRadius: "15px",
              padding: "1.5rem",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 15px 30px rgba(139,0,0,0.4)";
              (e.currentTarget as HTMLDivElement).style.borderColor = "#8B0000";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              (e.currentTarget as HTMLDivElement).style.borderColor = "#2C3E50";
            }}
          >
            <div style={{ fontSize: "2.2rem", marginBottom: "0.75rem" }}>{f.icon}</div>
            <div className="font-cinzel" style={{ fontSize: "1.1rem", color: "#7F8C8D", marginBottom: "0.5rem" }}>
              {f.title}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#C0C0C0", opacity: 0.8, lineHeight: 1.5 }}>
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
          className="enter-button"
          onClick={onBack}
          style={{ background: "linear-gradient(135deg, #2D1B69, #3D0A4A)", fontSize: "1rem", padding: "1.25rem 2rem" }}
        >
          ← Main Studio
        </button>
      </div>
    </div>
  );
}
