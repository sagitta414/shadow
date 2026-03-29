import { useState, useRef } from "react";
import { useDirector } from "../contexts/DirectorContext";

export default function DirectorPanel() {
  const { safeMode, setSafeMode, directorNote, setDirectorNote } = useDirector();
  const [expanded, setExpanded] = useState(false);
  const [noteInput, setNoteInput] = useState(directorNote);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const accent = safeMode ? "#34D399" : "#C084FC";
  const accentDim = safeMode ? "rgba(52,211,153,0.12)" : "rgba(192,132,252,0.12)";
  const accentBorder = safeMode ? "rgba(52,211,153,0.3)" : "rgba(192,132,252,0.3)";

  function applyNote() {
    setDirectorNote(noteInput);
    setExpanded(false);
  }

  function toggleExpanded() {
    setExpanded((e) => {
      if (!e) setNoteInput(directorNote);
      return !e;
    });
    setTimeout(() => noteRef.current?.focus(), 120);
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "8px",
        pointerEvents: "none",
      }}
    >
      {expanded && (
        <div
          style={{
            pointerEvents: "all",
            background: "rgba(8,8,18,0.97)",
            border: `1px solid ${accentBorder}`,
            borderRadius: "14px",
            padding: "18px 18px 14px",
            width: "min(320px, calc(100vw - 40px))",
            boxShadow: `0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px ${accentBorder}`,
            backdropFilter: "blur(20px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <span style={{ color: accent, fontSize: "0.62rem", letterSpacing: "2.5px", fontFamily: "'Cinzel', serif" }}>
              🎬 DIRECTOR
            </span>
            <button
              onClick={() => setExpanded(false)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "1rem", lineHeight: 1, padding: 0 }}
            >
              ×
            </button>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.58rem", letterSpacing: "2px", marginBottom: "8px" }}>CONTENT MODE</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setSafeMode(false)}
                style={{
                  flex: 1, padding: "8px 6px",
                  borderRadius: "8px", cursor: "pointer", fontSize: "0.65rem", letterSpacing: "1.2px",
                  border: !safeMode ? "1px solid rgba(192,132,252,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  background: !safeMode ? "rgba(192,132,252,0.12)" : "rgba(255,255,255,0.03)",
                  color: !safeMode ? "#C084FC" : "rgba(255,255,255,0.35)",
                  transition: "all 0.2s",
                }}
              >
                ◈ EXPLICIT
              </button>
              <button
                onClick={() => setSafeMode(true)}
                style={{
                  flex: 1, padding: "8px 6px",
                  borderRadius: "8px", cursor: "pointer", fontSize: "0.65rem", letterSpacing: "1.2px",
                  border: safeMode ? "1px solid rgba(52,211,153,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  background: safeMode ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.03)",
                  color: safeMode ? "#34D399" : "rgba(255,255,255,0.35)",
                  transition: "all 0.2s",
                }}
              >
                ◉ NON-SEXUAL
              </button>
            </div>
          </div>

          <div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.58rem", letterSpacing: "2px", marginBottom: "6px" }}>
              SCENE DIRECTION
              {directorNote && <span style={{ color: accent, marginLeft: "6px" }}>● ACTIVE</span>}
            </div>
            <textarea
              ref={noteRef}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder={`Inject a direction into every generation…\n\ne.g. "Focus on her fear, not her actions"\n"He keeps his voice low and controlled"\n"She tries to bargain"`}
              rows={4}
              style={{
                width: "100%", boxSizing: "border-box",
                resize: "none",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid rgba(255,255,255,0.1)`,
                borderRadius: "8px", color: "#fff",
                padding: "10px 12px", fontSize: "0.78rem",
                lineHeight: "1.5", outline: "none",
                fontFamily: "'Inter', sans-serif",
              }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              {directorNote && (
                <button
                  onClick={() => { setNoteInput(""); setDirectorNote(""); }}
                  style={{
                    padding: "7px 12px", borderRadius: "7px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)",
                    color: "rgba(255,255,255,0.35)",
                    cursor: "pointer", fontSize: "0.65rem", letterSpacing: "1px",
                  }}
                >
                  CLEAR
                </button>
              )}
              <button
                onClick={applyNote}
                style={{
                  flex: 1, padding: "7px 12px", borderRadius: "7px",
                  border: `1px solid ${accentBorder}`,
                  background: accentDim,
                  color: accent,
                  cursor: "pointer", fontSize: "0.65rem", letterSpacing: "1px",
                  fontFamily: "'Cinzel', serif",
                }}
              >
                APPLY →
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={toggleExpanded}
        style={{
          pointerEvents: "all",
          display: "flex", alignItems: "center", gap: "8px",
          padding: "9px 16px",
          background: expanded ? accentDim : "rgba(8,8,18,0.92)",
          border: `1px solid ${expanded ? accentBorder : "rgba(255,255,255,0.1)"}`,
          borderRadius: "30px",
          cursor: "pointer",
          backdropFilter: "blur(16px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          transition: "all 0.2s",
        }}
      >
        <span style={{ fontSize: "0.9rem" }}>🎬</span>
        <span style={{
          fontSize: "0.6rem", letterSpacing: "2px",
          fontFamily: "'Cinzel', serif",
          color: accent,
        }}>
          {safeMode ? "NON-SEXUAL" : "EXPLICIT"}
        </span>
        {directorNote && (
          <span style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: accent, display: "inline-block", flexShrink: 0,
          }} />
        )}
      </button>
    </div>
  );
}
