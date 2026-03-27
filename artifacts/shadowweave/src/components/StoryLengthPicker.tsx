export type StoryLength = "short" | "standard" | "long";

const OPTIONS: { id: StoryLength; icon: string; label: string; desc: string }[] = [
  { id: "short",    icon: "⚡", label: "Short",    desc: "~600 words" },
  { id: "standard", icon: "📖", label: "Standard", desc: "~1000 words" },
  { id: "long",     icon: "📜", label: "Long",     desc: "~1500 words" },
];

interface Props {
  value: StoryLength;
  onChange: (v: StoryLength) => void;
  accentColor?: string;
  accentRgb?: string;
}

export default function StoryLengthPicker({ value, onChange, accentColor = "#A78BFA", accentRgb = "167,139,250" }: Props) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ fontSize: "0.58rem", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(200,195,240,0.4)", marginBottom: "0.6rem" }}>
        CHAPTER LENGTH
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.5rem" }}>
        {OPTIONS.map(opt => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              style={{
                padding: "0.65rem 0.5rem",
                borderRadius: "10px",
                border: `1px solid ${active ? accentColor : "rgba(200,195,240,0.1)"}`,
                background: active ? `rgba(${accentRgb},0.15)` : "rgba(255,255,255,0.02)",
                color: active ? accentColor : "rgba(200,195,240,0.5)",
                cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem",
                transition: "all 0.18s",
                boxShadow: active ? `0 0 14px rgba(${accentRgb},0.25)` : "none",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{opt.icon}</span>
              <span style={{ fontSize: "0.65rem", fontFamily: "'Montserrat',sans-serif", fontWeight: active ? 800 : 500, letterSpacing: "0.5px" }}>{opt.label}</span>
              <span style={{ fontSize: "0.55rem", color: active ? `rgba(${accentRgb},0.7)` : "rgba(200,195,240,0.3)", fontFamily: "'Raleway',sans-serif" }}>{opt.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
