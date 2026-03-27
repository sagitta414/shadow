import { useState, useEffect, useRef } from "react";

interface Props {
  pageKey: string;
}

export default function SessionTimer({ pageKey }: Props) {
  const [seconds, setSeconds] = useState(0);
  const [visible, setVisible] = useState(true);
  const startRef = useRef(Date.now());

  // Reset when page changes
  useEffect(() => {
    startRef.current = Date.now();
    setSeconds(0);
    setVisible(true);
  }, [pageKey]);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [pageKey]);

  if (!visible) return null;

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const display = h > 0
    ? `${h}h ${String(m).padStart(2, "0")}m`
    : m > 0
      ? `${m}m ${String(s).padStart(2, "0")}s`
      : `${s}s`;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.2rem",
        right: "1.2rem",
        zIndex: 900,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.38rem 0.85rem",
        background: "rgba(4,1,12,0.88)",
        border: "1px solid rgba(168,85,247,0.18)",
        borderRadius: "30px",
        backdropFilter: "blur(14px)",
        cursor: "default",
        userSelect: "none",
        transition: "opacity 0.3s",
      }}
      title="Writing session duration"
    >
      <div style={{
        width: "5px", height: "5px", borderRadius: "50%",
        background: "#A855F7",
        boxShadow: "0 0 8px rgba(168,85,247,0.8)",
        animation: "sessionPulse 2.8s ease-in-out infinite",
        flexShrink: 0,
      }} />
      <span style={{
        fontFamily: "'Cinzel', serif",
        fontSize: "0.45rem",
        letterSpacing: "3px",
        color: "rgba(168,85,247,0.45)",
        textTransform: "uppercase",
      }}>Session</span>
      <span style={{
        fontFamily: "'Cinzel', serif",
        fontSize: "0.65rem",
        fontWeight: 700,
        color: "rgba(192,132,252,0.75)",
        letterSpacing: "1px",
        minWidth: "38px",
        textAlign: "right",
      }}>{display}</span>
      <button
        onClick={() => setVisible(false)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "rgba(168,85,247,0.22)", fontSize: "0.55rem",
          padding: "0 0 0 0.2rem", lineHeight: 1,
          transition: "color 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "rgba(168,85,247,0.55)"}
        onMouseLeave={e => e.currentTarget.style.color = "rgba(168,85,247,0.22)"}
        title="Dismiss"
      >✕</button>
      <style>{`
        @keyframes sessionPulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(0.6);} }
      `}</style>
    </div>
  );
}
