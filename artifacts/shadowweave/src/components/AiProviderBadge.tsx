import { useState } from "react";
import { getAiProvider, setAiProvider, type AiProvider } from "../lib/aiProvider";

export default function AiProviderBadge() {
  const [provider, setProvider] = useState<AiProvider>(getAiProvider);
  const [transitioning, setTransitioning] = useState(false);

  function toggle() {
    if (transitioning) return;
    setTransitioning(true);
    const next: AiProvider = provider === "venice" ? "novelai" : "venice";
    setAiProvider(next);
    setProvider(next);
    setTimeout(() => setTransitioning(false), 600);
  }

  const isNovelAI = provider === "novelai";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "1.5rem",
        zIndex: 200,
      }}
    >
      <style>{`
        @keyframes badgePulse { 0%,100%{opacity:1} 50%{opacity:0.65} }
        @keyframes switchSpin { from{transform:rotate(0deg)} to{transform:rotate(180deg)} }
      `}</style>
      <button
        onClick={toggle}
        title={`Switch AI engine (currently: ${isNovelAI ? "NovelAI" : "Venice AI"})`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.45rem 0.85rem 0.45rem 0.6rem",
          background: isNovelAI
            ? "rgba(16,185,129,0.12)"
            : "rgba(168,85,247,0.1)",
          border: `1px solid ${isNovelAI ? "rgba(16,185,129,0.35)" : "rgba(168,85,247,0.3)"}`,
          borderRadius: "30px",
          cursor: "pointer",
          transition: "all 0.3s ease",
          backdropFilter: "blur(12px)",
          boxShadow: isNovelAI
            ? "0 4px 20px rgba(16,185,129,0.15)"
            : "0 4px 20px rgba(168,85,247,0.12)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.background = isNovelAI
            ? "rgba(16,185,129,0.2)"
            : "rgba(168,85,247,0.18)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.background = isNovelAI
            ? "rgba(16,185,129,0.12)"
            : "rgba(168,85,247,0.1)";
        }}
      >
        {/* Status dot */}
        <div
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: isNovelAI ? "#10B981" : "#A855F7",
            boxShadow: isNovelAI
              ? "0 0 8px #10B981, 0 0 16px rgba(16,185,129,0.5)"
              : "0 0 8px #A855F7, 0 0 16px rgba(168,85,247,0.5)",
            animation: transitioning ? "none" : "badgePulse 2.5s ease-in-out infinite",
            flexShrink: 0,
          }}
        />

        {/* Label stack */}
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
              color: isNovelAI ? "#6EE7B7" : "#C084FC",
              lineHeight: 1,
              transition: "color 0.3s",
            }}
          >
            {isNovelAI ? "NovelAI" : "Venice AI"}
          </div>
        </div>

        {/* Switch arrow */}
        <div
          style={{
            fontSize: "0.65rem",
            color: isNovelAI ? "rgba(110,231,183,0.6)" : "rgba(192,132,252,0.5)",
            animation: transitioning ? "switchSpin 0.5s ease" : "none",
            marginLeft: "2px",
          }}
        >
          ⇄
        </div>
      </button>
    </div>
  );
}
