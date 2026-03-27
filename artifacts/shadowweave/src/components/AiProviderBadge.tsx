export default function AiProviderBadge() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "1.5rem",
        zIndex: 200,
      }}
    >
      <style>{`@keyframes badgePulse { 0%,100%{opacity:1} 50%{opacity:0.65} }`}</style>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.45rem 0.85rem 0.45rem 0.6rem",
          background: "rgba(168,85,247,0.1)",
          border: "1px solid rgba(168,85,247,0.3)",
          borderRadius: "30px",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 20px rgba(168,85,247,0.12)",
        }}
      >
        <div
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: "#A855F7",
            boxShadow: "0 0 8px #A855F7, 0 0 16px rgba(168,85,247,0.5)",
            animation: "badgePulse 2.5s ease-in-out infinite",
            flexShrink: 0,
          }}
        />
        <div style={{ textAlign: "left" }}>
          <div
            style={{
              fontSize: "0.48rem",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "rgba(200,195,240,0.4)",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              lineHeight: 1,
              marginBottom: "1px",
            }}
          >
            AI Engine
          </div>
          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 900,
              fontFamily: "'Cinzel', serif",
              letterSpacing: "1.5px",
              color: "#C084FC",
              lineHeight: 1,
            }}
          >
            Venice AI
          </div>
        </div>
      </div>
    </div>
  );
}
