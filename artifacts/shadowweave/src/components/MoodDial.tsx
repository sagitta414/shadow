interface Props {
  value: number;
  onChange: (v: number) => void;
  heroineColor?: string;
}

const MOOD_LABELS = [
  { min: 0,  max: 20,  label: "Pure Psychological",  color: "#60A5FA", desc: "Internal, atmospheric, no physical content" },
  { min: 21, max: 45,  label: "Tense",                color: "#34D399", desc: "Psychological with mounting physical tension" },
  { min: 46, max: 65,  label: "Charged",              color: "#F59E0B", desc: "Explicit undertones, charged physical contact" },
  { min: 66, max: 85,  label: "Explicit",             color: "#F87171", desc: "Fully explicit content, graphic detail" },
  { min: 86, max: 100, label: "Unhinged",             color: "#A855F7", desc: "Maximum intensity — nothing held back" },
];

function getLabel(v: number) {
  return MOOD_LABELS.find(m => v >= m.min && v <= m.max) ?? MOOD_LABELS[2];
}

export default function MoodDial({ value, onChange, heroineColor }: Props) {
  const mood = getLabel(value);
  const trackColor = `linear-gradient(90deg, #60A5FA 0%, #34D399 25%, #F59E0B 50%, #F87171 75%, #A855F7 100%)`;

  return (
    <div style={{ padding: "0.85rem 1rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px" }}>
      <style>{`
        .mood-slider::-webkit-slider-thumb { appearance: none; width: 18px; height: 18px; border-radius: 50%; background: ${mood.color}; border: 2px solid rgba(255,255,255,0.3); cursor: pointer; box-shadow: 0 0 8px ${mood.color}88; transition: all 0.2s; }
        .mood-slider::-webkit-slider-thumb:hover { transform: scale(1.2); }
        .mood-slider::-webkit-slider-runnable-track { height: 4px; border-radius: 2px; background: ${trackColor}; }
        .mood-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; background: ${trackColor}; border-radius: 2px; outline: none; cursor: pointer; }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.48rem", letterSpacing: "3px", color: "rgba(200,195,215,0.5)", textTransform: "uppercase" }}>Mood Dial</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.55rem", color: mood.color, fontWeight: 700, letterSpacing: "1px", textShadow: `0 0 12px ${mood.color}66` }}>{mood.label}</div>
      </div>

      <input
        type="range" min={0} max={100} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="mood-slider"
      />

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.35rem" }}>
        <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.38rem", color: "rgba(200,195,215,0.25)", letterSpacing: "1px" }}>Psychological</span>
        <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.38rem", color: "rgba(200,195,215,0.25)", letterSpacing: "1px", fontStyle: "italic" }}>{mood.desc}</span>
        <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.38rem", color: "rgba(200,195,215,0.25)", letterSpacing: "1px" }}>Explicit</span>
      </div>
    </div>
  );
}
