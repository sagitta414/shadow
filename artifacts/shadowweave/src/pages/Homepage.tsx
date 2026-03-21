interface HomepageProps {
  onEnter: () => void;
  onCaptorPortal: () => void;
}

export default function Homepage({ onEnter, onCaptorPortal }: HomepageProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #000000 0%, #0A0015 50%, #000000 100%)",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div className="logo-text" style={{ marginBottom: "1.5rem" }}>
        SHADOWWEAVE
      </div>
      <div
        className="font-montserrat"
        style={{
          fontSize: "clamp(1.2rem, 3vw, 2rem)",
          color: "#F0F0FF",
          marginBottom: "3rem",
          opacity: 0.9,
          textShadow: "0 0 30px rgba(240,240,255,0.6)",
        }}
      >
        Professional Dark Narrative Studio
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          marginBottom: "3rem",
          maxWidth: "1000px",
          width: "100%",
        }}
      >
        {[
          {
            icon: "🌑",
            title: "Psychological Depths",
            desc: "Craft characters with complex psychological profiles, trauma, and dark motivations that drive compelling narratives.",
          },
          {
            icon: "⛓️",
            title: "Dark Themes",
            desc: "Explore taboo subjects, moral ambiguity, and the darkest corners of human nature in your storytelling.",
          },
          {
            icon: "🩸",
            title: "Professional Tools",
            desc: "Advanced character builders, story editors, and narrative tools designed for serious dark fiction writers.",
          },
        ].map((card) => (
          <div
            key={card.title}
            style={{
              background: "rgba(10,0,21,0.8)",
              border: "2px solid #8B0000",
              borderRadius: "20px",
              padding: "2rem",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 40px rgba(139,0,0,0.5)";
              (e.currentTarget as HTMLDivElement).style.borderColor = "#B8860B";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              (e.currentTarget as HTMLDivElement).style.borderColor = "#8B0000";
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{card.icon}</div>
            <div
              className="font-cinzel"
              style={{ fontSize: "1.3rem", color: "#B8860B", marginBottom: "0.75rem" }}
            >
              {card.title}
            </div>
            <div style={{ fontSize: "0.95rem", lineHeight: "1.6", opacity: 0.8 }}>
              {card.desc}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button className="enter-button" onClick={onEnter}>
          Enter the Studio
        </button>
        <button
          className="enter-button"
          onClick={onCaptorPortal}
          style={{
            background: "linear-gradient(135deg, #2C3E50, #8B0000)",
          }}
        >
          Captor Configuration
        </button>
      </div>
    </div>
  );
}
