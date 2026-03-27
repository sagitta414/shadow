import { useState } from "react";

/* ─── Types ─────────────────────────────────────────────────────────────────── */
export interface UniversalConfig {
  tone: string;
  pacing: string;
  pov: string;
  restraintType: string;
  dialogueStyle: string;
}

export const UNIVERSAL_DEFAULTS: UniversalConfig = {
  tone: "",
  pacing: "",
  pov: "",
  restraintType: "",
  dialogueStyle: "",
};

/* ─── Data ──────────────────────────────────────────────────────────────────── */
const TONES = [
  { id: "psychological", icon: "🧠", label: "Psychological",  desc: "Mental games, manipulation, slow erosion of will" },
  { id: "mixed",         icon: "⚖️",  label: "Mixed",          desc: "Balanced blend of mind and body" },
  { id: "physical",      icon: "💥", label: "Physical",       desc: "Raw dominance, endurance, physicality-first" },
];

const PACINGS = [
  { id: "slow_burn",   icon: "🕯️",  label: "Slow Burn",        desc: "Deliberate, atmospheric, drawn-out tension" },
  { id: "standard",    icon: "⏱️",  label: "Standard",         desc: "Balanced escalation, measured pacing" },
  { id: "intense",     icon: "⚡", label: "Intense",           desc: "Fast escalation, relentless forward motion" },
];

const POVS = [
  { id: "third_person",   icon: "📖", label: "Third Person",        desc: "Classic omniscient narrator — wide and cinematic" },
  { id: "heroine_inner",  icon: "💭", label: "Heroine's Inner Voice", desc: "Her thoughts in real-time — intimate, visceral" },
  { id: "villain_woven",  icon: "👁️", label: "Villain's Perspective", desc: "What the villain sees, thinks, and feels" },
];

const RESTRAINTS = [
  { id: "tech_collar",      icon: "📡", label: "Tech Collar" },
  { id: "energy_cuffs",     icon: "🔵", label: "Energy Cuffs" },
  { id: "rope_cable",       icon: "🪢", label: "Rope / Cable" },
  { id: "chemical",         icon: "💉", label: "Chemical Sedation" },
  { id: "psychological",    icon: "🧠", label: "Psychological Compliance" },
  { id: "power_suppressed", icon: "🚫", label: "Power Suppression Only" },
  { id: "unrestrained",     icon: "🔓", label: "Unrestrained (No Escape Possible)" },
];

const DIALOGUE_STYLES = [
  { id: "cold_clinical",   icon: "🧊", label: "Cold & Clinical" },
  { id: "taunting_cruel",  icon: "😈", label: "Taunting & Cruel" },
  { id: "obsessive",       icon: "🌹", label: "Obsessive & Possessive" },
  { id: "silent",          icon: "🤫", label: "Silent & Methodical" },
  { id: "mixture",         icon: "🎭", label: "Mixed / Shifts" },
];

/* ─── Helper to build the AI prompt line ─────────────────────────────────────── */
export function universalPromptLines(cfg: UniversalConfig): string {
  const lines: string[] = [];
  const tone = TONES.find(t => t.id === cfg.tone);
  const pacing = PACINGS.find(p => p.id === cfg.pacing);
  const pov = POVS.find(p => p.id === cfg.pov);
  const restraint = RESTRAINTS.find(r => r.id === cfg.restraintType);
  const dialogue = DIALOGUE_STYLES.find(d => d.id === cfg.dialogueStyle);
  if (tone) lines.push(`STORY TONE: ${tone.label} — ${tone.desc}.`);
  if (pacing) lines.push(`PACING: ${pacing.label} — ${pacing.desc}.`);
  if (pov) lines.push(`NARRATIVE POV: ${pov.label} — ${pov.desc}.`);
  if (restraint) lines.push(`RESTRAINT METHOD: ${restraint.label}.`);
  if (dialogue) lines.push(`VILLAIN DIALOGUE STYLE: ${dialogue.label}.`);
  return lines.length ? "\n\nNARRATIVE DIRECTIVES:\n" + lines.join("\n") : "";
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
interface TrioOption { id: string; icon: string; label: string; desc: string; }
function TrioToggle({ options, value, onChange, accent, rgb }: {
  options: TrioOption[];
  value: string;
  onChange: (id: string) => void;
  accent: string;
  rgb: string;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
      {options.map(opt => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(active ? "" : opt.id)}
            title={opt.desc}
            style={{
              padding: "0.55rem 0.4rem",
              borderRadius: "10px",
              border: `1px solid ${active ? accent : "rgba(200,195,240,0.1)"}`,
              background: active ? `rgba(${rgb},0.16)` : "rgba(255,255,255,0.03)",
              color: active ? accent : "rgba(200,195,240,0.55)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.2rem",
              transition: "all 0.18s",
              boxShadow: active ? `0 0 12px rgba(${rgb},0.25)` : "none",
            }}
          >
            <span style={{ fontSize: "1rem" }}>{opt.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: active ? 800 : 500, fontFamily: "'Montserrat',sans-serif", letterSpacing: "0.5px" }}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

interface PillOption { id: string; icon: string; label: string; }
function PillRow({ options, value, onChange, accent, rgb }: {
  options: PillOption[];
  value: string;
  onChange: (id: string) => void;
  accent: string;
  rgb: string;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
      {options.map(opt => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(active ? "" : opt.id)}
            style={{
              display: "flex", alignItems: "center", gap: "0.35rem",
              padding: "0.35rem 0.7rem",
              borderRadius: "20px",
              border: `1px solid ${active ? accent : "rgba(200,195,240,0.15)"}`,
              background: active ? `rgba(${rgb},0.16)` : "rgba(255,255,255,0.03)",
              color: active ? accent : "rgba(200,195,240,0.55)",
              fontSize: "0.68rem",
              fontFamily: "'Montserrat',sans-serif",
              fontWeight: active ? 700 : 400,
              cursor: "pointer",
              transition: "all 0.18s",
              boxShadow: active ? `0 0 8px rgba(${rgb},0.2)` : "none",
            }}
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ fontSize: "0.58rem", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(200,195,240,0.35)", marginBottom: "0.5rem" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

interface Props {
  config: UniversalConfig;
  onChange: (cfg: UniversalConfig) => void;
  accentColor?: string;
  accentRgb?: string;
}

export default function UniversalOptions({ config, onChange, accentColor = "#A78BFA", accentRgb = "167,139,250" }: Props) {
  const [open, setOpen] = useState(false);
  const hasAny = Object.values(config).some(Boolean);

  function set(key: keyof UniversalConfig, val: string) {
    onChange({ ...config, [key]: val });
  }

  return (
    <div style={{ marginTop: "1.5rem" }}>
      {/* Collapsible header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.6rem 0.85rem",
          borderRadius: open ? "10px 10px 0 0" : "10px",
          border: `1px solid rgba(${accentRgb},${open ? "0.3" : "0.15"})`,
          background: open ? `rgba(${accentRgb},0.08)` : "rgba(255,255,255,0.03)",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        <div style={{ width: "3px", height: "16px", borderRadius: "2px", background: `linear-gradient(180deg, ${accentColor}, transparent)` }} />
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: accentColor }}>
          Narrative Controls
        </span>
        {hasAny && (
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: accentColor, boxShadow: `0 0 6px ${accentColor}`, marginLeft: "2px" }} />
        )}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: "0.65rem", color: "rgba(200,195,240,0.35)", fontStyle: "italic", marginRight: "0.4rem" }}>optional</span>
        <span style={{ color: accentColor, fontSize: "0.8rem", transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(180deg)" : "none" }}>▾</span>
      </button>

      {open && (
        <div style={{
          padding: "1rem",
          border: `1px solid rgba(${accentRgb},0.2)`,
          borderTop: "none",
          borderRadius: "0 0 10px 10px",
          background: "rgba(15,10,30,0.55)",
          backdropFilter: "blur(10px)",
        }}>
          <Row label="Tone Focus">
            <TrioToggle options={TONES} value={config.tone} onChange={v => set("tone", v)} accent={accentColor} rgb={accentRgb} />
          </Row>
          <Row label="Pacing">
            <TrioToggle options={PACINGS} value={config.pacing} onChange={v => set("pacing", v)} accent={accentColor} rgb={accentRgb} />
          </Row>
          <Row label="Narrative POV">
            <TrioToggle options={POVS} value={config.pov} onChange={v => set("pov", v)} accent={accentColor} rgb={accentRgb} />
          </Row>
          <Row label="Restraint Method">
            <PillRow options={RESTRAINTS} value={config.restraintType} onChange={v => set("restraintType", v)} accent={accentColor} rgb={accentRgb} />
          </Row>
          <Row label="Villain Dialogue Style">
            <PillRow options={DIALOGUE_STYLES} value={config.dialogueStyle} onChange={v => set("dialogueStyle", v)} accent={accentColor} rgb={accentRgb} />
          </Row>
        </div>
      )}
    </div>
  );
}
