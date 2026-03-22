import { useState } from "react";
import { THEMES, useTheme, type ThemeName } from "../context/ThemeContext";

export default function ThemeSwitcher() {
  const { theme, setTheme, typewriterMode, toggleTypewriter } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 200 }}>
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 12px)",
            right: 0,
            background: "rgba(4,0,10,0.97)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "1.25rem",
            minWidth: "230px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(139,0,0,0.1)",
            animation: "slideIn 0.2s ease",
          }}
        >
          <div
            className="font-cinzel"
            style={{ fontSize: "0.65rem", color: "rgba(184,134,11,0.6)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "1rem" }}
          >
            Interface Mood
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {THEMES.map((t) => {
              const isActive = t.name === theme.name;
              return (
                <button
                  key={t.name}
                  onClick={() => { setTheme(t.name as ThemeName); setOpen(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.875rem",
                    padding: "0.65rem 0.875rem",
                    background: isActive ? "rgba(184,134,11,0.1)" : "transparent",
                    border: `1px solid ${isActive ? "rgba(184,134,11,0.35)" : "rgba(255,255,255,0.04)"}`,
                    borderRadius: "10px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    color: "inherit",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)";
                    }
                  }}
                >
                  <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{t.icon}</span>
                  <div>
                    <div className="font-cinzel" style={{ fontSize: "0.8rem", color: isActive ? "#D4AF37" : "#C8C8D8", fontWeight: 700, letterSpacing: "1px" }}>{t.label}</div>
                    <div style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.35)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px", marginTop: "1px" }}>{t.desc}</div>
                  </div>
                  {isActive && (
                    <span style={{ marginLeft: "auto", color: "#B8860B", fontSize: "0.7rem" }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)", margin: "0.9rem 0 0.75rem" }} />
          <div className="font-cinzel" style={{ fontSize: "0.55rem", color: "rgba(184,134,11,0.45)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.6rem" }}>
            Story Effect
          </div>
          <button
            onClick={toggleTypewriter}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.875rem",
              padding: "0.65rem 0.875rem",
              background: typewriterMode ? "rgba(168,85,247,0.1)" : "transparent",
              border: `1px solid ${typewriterMode ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.06)"}`,
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              color: "inherit",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
              <span style={{ fontSize: "1rem", lineHeight: 1 }}>⌨</span>
              <div>
                <div className="font-cinzel" style={{ fontSize: "0.8rem", color: typewriterMode ? "#C084FC" : "#C8C8D8", fontWeight: 700, letterSpacing: "1px" }}>Typewriter</div>
                <div style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.35)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px", marginTop: "1px" }}>Char-by-char stream</div>
              </div>
            </div>
            <div style={{ width: "32px", height: "18px", borderRadius: "9px", background: typewriterMode ? "rgba(168,85,247,0.7)" : "rgba(255,255,255,0.1)", border: `1px solid ${typewriterMode ? "rgba(168,85,247,0.8)" : "rgba(255,255,255,0.15)"}`, position: "relative", transition: "all 0.25s", flexShrink: 0 }}>
              <div style={{ position: "absolute", width: "12px", height: "12px", borderRadius: "50%", background: typewriterMode ? "#C084FC" : "rgba(255,255,255,0.4)", top: "2px", left: typewriterMode ? "16px" : "2px", transition: "left 0.25s, background 0.25s", boxShadow: typewriterMode ? "0 0 8px rgba(192,132,252,0.8)" : "none" }} />
            </div>
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "44px", height: "44px", borderRadius: "12px",
          background: open ? "rgba(184,134,11,0.15)" : "rgba(4,0,10,0.9)",
          backdropFilter: "blur(16px)",
          border: `1px solid ${open ? "rgba(184,134,11,0.4)" : "rgba(255,255,255,0.08)"}`,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.1rem", transition: "all 0.25s ease",
          boxShadow: open ? "0 0 20px rgba(184,134,11,0.2)" : "0 4px 16px rgba(0,0,0,0.5)",
          color: "inherit",
        }}
        title="Change theme"
        onMouseEnter={(e) => { if (!open) { e.currentTarget.style.borderColor = "rgba(184,134,11,0.3)"; e.currentTarget.style.background = "rgba(184,134,11,0.08)"; } }}
        onMouseLeave={(e) => { if (!open) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(4,0,10,0.9)"; } }}
      >
        {theme.icon}
      </button>
    </div>
  );
}
