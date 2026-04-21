import { useState, useEffect } from "react";

const LINES = [
  "The door seals behind her with a sound like a verdict.",
  "Somewhere above, the city moves on, unaware.",
  "He counts her breaths. He has time.",
  "The restraints hold. They always hold.",
  "She tries to remember her name. It feels further away than it should.",
  "The room has no windows. She has already checked.",
  "He hasn't spoken in twenty minutes. That is worse than anything he could say.",
  "Her hands remember the sequence — but her body won't obey.",
  "The light hasn't changed. She can't tell how long she's been here.",
  "Every breath is a negotiation.",
  "He sets something down on the table. She doesn't look.",
  "She tells herself this is temporary. She told herself that last time, too.",
  "The silence is a pressure. It accumulates.",
  "There is no clock. That is deliberate.",
  "He moves through the room with the patience of someone who has never been refused.",
  "She is cataloguing exits. There are none.",
  "The darkness between his words is the most dangerous part.",
  "He knows exactly how long she can endure. She doesn't.",
  "Outside, rain. She can hear it. She cannot reach it.",
  "She is becoming something she doesn't have a name for yet.",
  "He watches. He is always watching.",
  "The story is writing itself now.",
  "Something irreversible is about to happen.",
  "The pen moves through the dark…",
];

interface Props {
  isActive: boolean;
  onStop?: () => void;
  accentColor?: string;
  label?: string;
  chapterNum?: number;
}

export default function AtmosphericLoader({
  isActive,
  onStop,
  accentColor = "#FFB800",
  label = "Writing your story…",
  chapterNum,
}: Props) {
  const [lineIdx, setLineIdx] = useState(() => Math.floor(Math.random() * LINES.length));
  const [fade, setFade] = useState(true);
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setLineIdx((i) => (i + 1) % LINES.length);
        setFade(true);
      }, 600);
    }, 4200);
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setDotCount((d) => (d % 3) + 1);
    }, 500);
    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  const dots = ".".repeat(dotCount);

  return (
    <div style={{
      position: "relative",
      margin: "0 0 1.5rem",
      padding: "2.5rem 2rem",
      background: "rgba(0,0,0,0.55)",
      border: `1px solid ${accentColor}18`,
      borderRadius: "20px",
      textAlign: "center",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes alPulse { 0%,100%{opacity:0.18;}50%{opacity:0.32;} }
        @keyframes alFadeIn { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);} }
        @keyframes alScan { 0%{transform:translateY(-100%);}100%{transform:translateY(400%);} }
        @keyframes alDot { 0%,100%{transform:scale(1);opacity:0.5;}50%{transform:scale(1.6);opacity:1;} }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at center, ${accentColor}08 0%, transparent 70%)`,
        animation: "alPulse 3s ease-in-out infinite",
      }} />

      {/* Scan line */}
      <div style={{
        position: "absolute", left: 0, right: 0, height: "1px",
        background: `linear-gradient(90deg, transparent, ${accentColor}22, transparent)`,
        animation: "alScan 3s linear infinite",
        pointerEvents: "none",
      }} />

      {/* Chapter label */}
      {chapterNum !== undefined && (
        <div style={{
          fontSize: "0.5rem", letterSpacing: "3px",
          color: `${accentColor}55`,
          fontFamily: "'Cinzel', serif",
          marginBottom: "1.25rem",
          textTransform: "uppercase",
        }}>
          Chapter {chapterNum}
        </div>
      )}

      {/* Main label */}
      <div style={{
        fontSize: "0.75rem", letterSpacing: "2.5px",
        color: accentColor,
        fontFamily: "'Cinzel', serif",
        marginBottom: "1.75rem",
        fontWeight: 600,
      }}>
        {label}{dots}
      </div>

      {/* Rotating prose line */}
      <div style={{
        minHeight: "3rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "1.75rem",
        padding: "0 1rem",
      }}>
        <p style={{
          fontFamily: "'EB Garamond', Georgia, serif",
          fontSize: "1.05rem",
          lineHeight: 1.7,
          color: "rgba(220,210,230,0.65)",
          fontStyle: "italic",
          margin: 0,
          opacity: fade ? 1 : 0,
          transform: fade ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.55s ease, transform 0.55s ease",
          maxWidth: "540px",
        }}>
          "{LINES[lineIdx]}"
        </p>
      </div>

      {/* Dots */}
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: onStop ? "1.5rem" : "0" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            width: "5px", height: "5px", borderRadius: "50%",
            background: i % 2 === 0 ? accentColor : "#FF4060",
            animation: `alDot 1.4s ${i * 0.18}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      {/* Stop button */}
      {onStop && (
        <button
          onClick={onStop}
          style={{
            marginTop: "1.25rem",
            padding: "0.4rem 1.5rem",
            background: "rgba(200,40,40,0.12)",
            border: "1px solid rgba(200,40,40,0.4)",
            borderRadius: "10px",
            color: "#FF6060",
            fontFamily: "'Cinzel', serif",
            fontSize: "0.65rem",
            letterSpacing: "2px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          ■ Stop
        </button>
      )}
    </div>
  );
}
