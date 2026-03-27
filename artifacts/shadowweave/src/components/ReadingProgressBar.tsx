interface Props {
  current: number;
  max: number;
  accentColor: string;
  accentRgb: string;
  label?: string;
}

export default function ReadingProgressBar({ current, max, accentColor, accentRgb, label }: Props) {
  const pct = Math.min(100, (current / max) * 100);
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
        <span style={{ fontSize: "0.5rem", letterSpacing: "2.5px", fontFamily: "'Cinzel', serif", color: `rgba(${accentRgb},0.4)`, textTransform: "uppercase" }}>
          {label ?? "STORY PROGRESS"}
        </span>
        <span style={{ fontSize: "0.5rem", letterSpacing: "2px", fontFamily: "'Montserrat', sans-serif", color: `rgba(${accentRgb},0.45)` }}>
          {current} / {max}
        </span>
      </div>
      <div style={{ height: "3px", background: `rgba(${accentRgb},0.1)`, borderRadius: "99px", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: `linear-gradient(90deg, rgba(${accentRgb},0.5), ${accentColor})`,
          borderRadius: "99px",
          transition: "width 0.6s ease",
          boxShadow: `0 0 8px rgba(${accentRgb},0.4)`,
        }} />
      </div>
    </div>
  );
}
