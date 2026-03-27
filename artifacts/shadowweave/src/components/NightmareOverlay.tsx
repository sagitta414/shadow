import { useTheme } from "../context/ThemeContext";

export default function NightmareOverlay() {
  const { nightmareMode } = useTheme();
  if (!nightmareMode) return null;

  return (
    <>
      {/* Heavy vignette — breathes slowly */}
      <div
        style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 600,
          boxShadow: "inset 0 0 160px 60px rgba(90,0,10,0.82), inset 0 0 60px 20px rgba(0,0,0,0.9)",
          animation: "nightmareVignette 4s ease-in-out infinite",
        }}
      />

      {/* Chromatic edge fringe — red left / cyan right */}
      <div
        style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 601,
          background: `
            linear-gradient(90deg, rgba(180,0,20,0.07) 0%, transparent 8%, transparent 92%, rgba(0,200,220,0.05) 100%),
            linear-gradient(180deg, rgba(180,0,20,0.05) 0%, transparent 6%, transparent 94%, rgba(0,200,220,0.04) 100%)
          `,
        }}
      />

      {/* Scanline drift — very faint, slow */}
      <div
        style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 602, overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute", left: 0, right: 0,
            height: "120px",
            background: "linear-gradient(180deg, transparent 0%, rgba(180,0,20,0.03) 40%, rgba(180,0,20,0.06) 50%, rgba(180,0,20,0.03) 60%, transparent 100%)",
            animation: "nightmareScan 9s linear infinite",
          }}
        />
      </div>

      {/* Scanlines texture */}
      <div
        style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 603,
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
          animation: "nightmareFlicker 11s ease-in-out infinite",
        }}
      />

      {/* Glitch layer — rare horizontal jitter */}
      <div
        style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 604,
          animation: "nightmareGlitch 13s ease-in-out infinite",
          mixBlendMode: "overlay",
          opacity: 0.4,
          background: "transparent",
        }}
      />

      {/* NIGHTMARE ACTIVE pill — top-center */}
      <div
        style={{
          position: "fixed", top: "0.85rem", left: "50%", transform: "translateX(-50%)",
          zIndex: 700, pointerEvents: "none",
          display: "flex", alignItems: "center", gap: "0.5rem",
          padding: "0.3rem 0.9rem",
          background: "rgba(10,0,4,0.9)",
          border: "1px solid rgba(180,0,30,0.45)",
          borderRadius: "30px",
          backdropFilter: "blur(12px)",
          animation: "nightmarePillPulse 2.5s ease-in-out infinite",
        }}
      >
        <div style={{
          width: "5px", height: "5px", borderRadius: "50%",
          background: "#DC0028", boxShadow: "0 0 10px rgba(220,0,40,1)",
        }} />
        <span style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "0.38rem",
          letterSpacing: "4px",
          color: "rgba(220,60,80,0.9)",
          textTransform: "uppercase",
        }}>
          Nightmare Active
        </span>
      </div>
    </>
  );
}
