import { useState } from "react";

export type OutfitType = {
  id: string;
  label: string;
  icon: string;
  desc: string;
  category: "suit" | "civilian" | "specialty";
};

export type DamageLevel = {
  pct: number;
  label: string;
  color: string;
  glow: string;
  desc: string;
  symbol: string;
};

export const OUTFIT_OPTIONS: OutfitType[] = [
  // Suit
  { id: "full_costume",  label: "Full Costume",    icon: "🦸‍♀️", desc: "Complete hero suit — fully armored and combat-ready",          category: "suit" },
  { id: "battle_worn",   label: "Battle-Worn",     icon: "⚔️",   desc: "Costume already torn from a prior engagement",               category: "suit" },
  { id: "stealth_suit",  label: "Stealth Suit",    icon: "🌑",   desc: "Form-fitting tactical black — minimal and precise",          category: "suit" },
  { id: "power_armor",   label: "Power Armor",     icon: "🔰",   desc: "Heavy protective suit with integrated power systems",        category: "suit" },
  // Civilian
  { id: "casual",        label: "Casual Wear",     icon: "👕",   desc: "Caught completely off-duty — no advantage, no protection",   category: "civilian" },
  { id: "formal",        label: "Evening Gown",    icon: "👗",   desc: "High-society event that went very wrong",                    category: "civilian" },
  { id: "professional",  label: "Office Attire",   icon: "💼",   desc: "Civilian identity compromised — no preparation",            category: "civilian" },
  { id: "training",      label: "Training Gear",   icon: "🥋",   desc: "Mid-workout — already minimal, already exposed",            category: "civilian" },
  { id: "sleepwear",     label: "Nightwear",       icon: "🌙",   desc: "Caught completely off-guard — maximum vulnerability",       category: "civilian" },
  // Specialty
  { id: "swimsuit",      label: "Swimsuit",        icon: "🌊",   desc: "Minimal coverage from the very beginning",                  category: "specialty" },
  { id: "athletic",      label: "Athletic Wear",   icon: "⚡",   desc: "Sports outfit — fitted, mobile, easily stripped",           category: "specialty" },
  { id: "disguise",      label: "Undercover",      icon: "🎭",   desc: "False-identity outfit — cover blown at the worst moment",   category: "specialty" },
  { id: "prisoner",      label: "Captive Uniform", icon: "⛓️",   desc: "Already stripped to what the captor chose for her",        category: "specialty" },
  { id: "lingerie",      label: "Intimate",        icon: "🌹",   desc: "Absolute minimum — chosen for maximum exposure and effect", category: "specialty" },
];

export const DAMAGE_LEVELS: DamageLevel[] = [
  { pct: 0,   label: "Pristine",    color: "#6EE7B7", glow: "rgba(110,231,183,0.5)", desc: "Completely intact — not a thread out of place",                  symbol: "◆" },
  { pct: 25,  label: "Scuffed",     color: "#FCD34D", glow: "rgba(252,211,77,0.5)",  desc: "Surface damage — minor tears along the edges and seams",         symbol: "◈" },
  { pct: 50,  label: "Torn",        color: "#FB923C", glow: "rgba(251,146,60,0.5)",  desc: "Heavily ripped — significant portions exposed and visible",       symbol: "◉" },
  { pct: 75,  label: "Shredded",    color: "#F87171", glow: "rgba(248,113,113,0.5)", desc: "Barely holding together — decency maintained only just",          symbol: "◊" },
  { pct: 100, label: "Destroyed",   color: "#EF4444", glow: "rgba(239,68,68,0.5)",   desc: "Nothing remains — every layer stripped away completely",          symbol: "✦" },
];

const CAT_LABELS: Record<string, string> = {
  suit: "Hero Suit",
  civilian: "Civilian",
  specialty: "Specialty",
};

interface Props {
  outfitId: string;
  damage: number;
  onOutfitChange: (id: string) => void;
  onDamageChange: (pct: number) => void;
  accentColor?: string;
  accentRgb?: string;
}

export default function OutfitSelector({
  outfitId,
  damage,
  onOutfitChange,
  onDamageChange,
  accentColor = "#A78BFA",
  accentRgb = "167,139,250",
}: Props) {
  const [openCat, setOpenCat] = useState<string | null>("suit");
  const selected = OUTFIT_OPTIONS.find((o) => o.id === outfitId);
  const dmg = DAMAGE_LEVELS.find((d) => d.pct === damage) ?? DAMAGE_LEVELS[0];
  const categories = ["suit", "civilian", "specialty"];

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <style>{`
        @keyframes outfitGlow {
          0%,100% { box-shadow: 0 0 8px var(--og-color); }
          50%      { box-shadow: 0 0 18px var(--og-color); }
        }
        .outfit-pill { transition: all 0.18s ease; cursor: pointer; }
        .outfit-pill:hover { transform: translateY(-2px); }
        .dmg-btn { transition: all 0.18s ease; cursor: pointer; }
        .dmg-btn:hover { transform: scale(1.06); }
      `}</style>

      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.9rem" }}>
        <div style={{
          width: "3px", height: "20px", borderRadius: "2px",
          background: `linear-gradient(180deg, ${accentColor}, transparent)`,
        }} />
        <span style={{
          fontFamily: "'Cinzel', serif", fontSize: "0.75rem", fontWeight: 700,
          letterSpacing: "3px", textTransform: "uppercase",
          color: accentColor, opacity: 0.9,
        }}>Costume & Condition</span>
        <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, rgba(${accentRgb},0.25), transparent)` }} />
        <span style={{ fontSize: "0.65rem", color: "rgba(200,195,240,0.35)", letterSpacing: "1px", fontStyle: "italic" }}>optional</span>
      </div>

      {/* Outfit picker — category tabs */}
      <div style={{
        background: "rgba(15,10,30,0.6)",
        border: `1px solid rgba(${accentRgb},0.18)`,
        borderRadius: "12px",
        overflow: "hidden",
        backdropFilter: "blur(10px)",
      }}>
        {/* Category tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid rgba(${accentRgb},0.12)` }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setOpenCat(openCat === cat ? null : cat)}
              style={{
                flex: 1,
                padding: "0.6rem 0.5rem",
                border: "none",
                background: openCat === cat ? `rgba(${accentRgb},0.12)` : "transparent",
                color: openCat === cat ? accentColor : "rgba(200,195,240,0.45)",
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s",
                borderBottom: openCat === cat ? `2px solid ${accentColor}` : "2px solid transparent",
              }}
            >
              {CAT_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Outfit pills */}
        {openCat && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "0.5rem",
            padding: "0.9rem",
          }}>
            {OUTFIT_OPTIONS.filter((o) => o.category === openCat).map((opt) => {
              const isSelected = outfitId === opt.id;
              return (
                <button
                  key={opt.id}
                  className="outfit-pill"
                  onClick={() => onOutfitChange(isSelected ? "" : opt.id)}
                  title={opt.desc}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.42rem 0.75rem",
                    borderRadius: "30px",
                    border: isSelected ? `1px solid ${accentColor}` : "1px solid rgba(200,195,240,0.15)",
                    background: isSelected ? `rgba(${accentRgb},0.18)` : "rgba(255,255,255,0.04)",
                    color: isSelected ? accentColor : "rgba(200,195,240,0.7)",
                    fontSize: "0.72rem",
                    fontWeight: isSelected ? 700 : 500,
                    fontFamily: "'Montserrat', sans-serif",
                    cursor: "pointer",
                    "--og-color": accentColor,
                    boxShadow: isSelected ? `0 0 10px rgba(${accentRgb},0.3)` : "none",
                    animation: isSelected ? "outfitGlow 2.5s ease infinite" : "none",
                  } as React.CSSProperties}
                >
                  <span style={{ fontSize: "0.85rem", lineHeight: 1 }}>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected outfit description */}
        {selected && (
          <div style={{
            margin: "0 0.9rem",
            padding: "0.5rem 0.75rem",
            borderRadius: "8px",
            background: `rgba(${accentRgb},0.08)`,
            border: `1px solid rgba(${accentRgb},0.2)`,
            marginBottom: "0.75rem",
            marginTop: openCat ? "0" : "0.9rem",
          }}>
            <span style={{ fontSize: "0.85rem" }}>{selected.icon}</span>
            <span style={{
              marginLeft: "0.5rem",
              fontSize: "0.7rem",
              color: accentColor,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
            }}>{selected.label}</span>
            <span style={{
              marginLeft: "0.5rem",
              fontSize: "0.68rem",
              color: "rgba(200,195,240,0.55)",
              fontStyle: "italic",
            }}>{selected.desc}</span>
          </div>
        )}
      </div>

      {/* Damage level — only show if outfit is selected */}
      {outfitId && (
        <div style={{ marginTop: "0.9rem" }}>
          {/* Damage header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.7rem" }}>
            <span style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "0.62rem",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "rgba(200,195,240,0.5)",
            }}>Costume Integrity</span>
            <div style={{
              padding: "0.2rem 0.6rem",
              borderRadius: "20px",
              background: `rgba(${dmg.color.replace("#","").match(/.{2}/g)!.map(h=>parseInt(h,16)).join(",")},0.12)`,
              border: `1px solid ${dmg.color}40`,
            }}>
              <span style={{
                fontSize: "0.68rem",
                fontWeight: 900,
                fontFamily: "'Cinzel', serif",
                color: dmg.color,
                letterSpacing: "1px",
              }}>{dmg.label} — {dmg.pct}% Destroyed</span>
            </div>
          </div>

          {/* Visual integrity bar */}
          <div style={{
            position: "relative",
            height: "6px",
            borderRadius: "3px",
            background: "rgba(255,255,255,0.08)",
            marginBottom: "0.75rem",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: `${damage}%`,
              borderRadius: "3px",
              background: `linear-gradient(90deg, #6EE7B7, ${dmg.color})`,
              boxShadow: `0 0 10px ${dmg.glow}`,
              transition: "width 0.3s ease, background 0.3s ease",
            }} />
          </div>

          {/* 5 damage level buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.45rem" }}>
            {DAMAGE_LEVELS.map((dl) => {
              const isActive = damage === dl.pct;
              return (
                <button
                  key={dl.pct}
                  className="dmg-btn"
                  onClick={() => onDamageChange(dl.pct)}
                  title={dl.desc}
                  style={{
                    padding: "0.55rem 0.3rem",
                    borderRadius: "10px",
                    border: isActive ? `1px solid ${dl.color}` : "1px solid rgba(200,195,240,0.1)",
                    background: isActive ? `rgba(${dl.color.replace("#","").match(/.{2}/g)!.map(h=>parseInt(h,16)).join(",")},0.15)` : "rgba(255,255,255,0.03)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.25rem",
                    boxShadow: isActive ? `0 0 12px ${dl.glow}` : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {/* Costume integrity visual */}
                  <div style={{ position: "relative", width: "28px", height: "34px" }}>
                    {/* Body silhouette */}
                    <svg viewBox="0 0 28 34" style={{ width: "100%", height: "100%" }} fill="none">
                      {/* Full body */}
                      <ellipse cx="14" cy="7" rx="6" ry="6" fill={dl.pct > 0 ? `${dl.color}30` : `${dl.color}80`} />
                      <rect x="7" y="12" width="14" height="14" rx="2" fill={dl.pct > 0 ? `${dl.color}30` : `${dl.color}80`} />
                      <rect x="4" y="12" width="5" height="10" rx="2" fill={dl.pct > 25 ? `${dl.color}15` : `${dl.color}70`} />
                      <rect x="19" y="12" width="5" height="10" rx="2" fill={dl.pct > 25 ? `${dl.color}15` : `${dl.color}70`} />
                      <rect x="9" y="26" width="4" height="7" rx="1" fill={dl.pct > 50 ? `${dl.color}15` : `${dl.color}70`} />
                      <rect x="15" y="26" width="4" height="7" rx="1" fill={dl.pct > 50 ? `${dl.color}15` : `${dl.color}70`} />
                      {/* Damage tears overlay */}
                      {dl.pct >= 25 && (
                        <>
                          <line x1="8" y1="14" x2="11" y2="18" stroke={dl.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                          <line x1="18" y1="16" x2="20" y2="20" stroke={dl.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                        </>
                      )}
                      {dl.pct >= 50 && (
                        <>
                          <line x1="11" y1="12" x2="14" y2="17" stroke={dl.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
                          <line x1="9" y1="22" x2="13" y2="26" stroke={dl.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                        </>
                      )}
                      {dl.pct >= 75 && (
                        <>
                          <line x1="14" y1="14" x2="18" y2="22" stroke={dl.color} strokeWidth="2" strokeLinecap="round" opacity="0.9" />
                          <line x1="7" y1="18" x2="10" y2="24" stroke={dl.color} strokeWidth="2" strokeLinecap="round" opacity="0.9" />
                          <line x1="16" y1="26" x2="18" y2="33" stroke={dl.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                        </>
                      )}
                      {dl.pct >= 100 && (
                        <>
                          <line x1="4" y1="12" x2="24" y2="14" stroke={dl.color} strokeWidth="1.5" opacity="0.6" />
                          <line x1="5" y1="22" x2="23" y2="24" stroke={dl.color} strokeWidth="1.5" opacity="0.6" />
                          <line x1="9" y1="6" x2="19" y2="8" stroke={dl.color} strokeWidth="1" opacity="0.5" />
                        </>
                      )}
                    </svg>
                  </div>
                  <span style={{
                    fontSize: "0.54rem",
                    fontWeight: isActive ? 800 : 500,
                    fontFamily: "'Montserrat', sans-serif",
                    color: isActive ? dl.color : "rgba(200,195,240,0.45)",
                    letterSpacing: "0.5px",
                    textAlign: "center",
                    lineHeight: 1.1,
                  }}>{dl.label}</span>
                  <span style={{
                    fontSize: "0.5rem",
                    color: isActive ? `${dl.color}99` : "rgba(200,195,240,0.25)",
                    fontFamily: "'Montserrat', sans-serif",
                    letterSpacing: "0px",
                  }}>{dl.pct}%</span>
                </button>
              );
            })}
          </div>

          {/* Description of selected damage */}
          <div style={{
            marginTop: "0.6rem",
            padding: "0.45rem 0.75rem",
            borderRadius: "8px",
            background: `rgba(${dmg.color.replace("#","").match(/.{2}/g)!.map(h=>parseInt(h,16)).join(",")},0.07)`,
            border: `1px solid ${dmg.color}30`,
          }}>
            <span style={{
              fontSize: "0.67rem",
              color: "rgba(200,195,240,0.55)",
              fontStyle: "italic",
              fontFamily: "'Montserrat', sans-serif",
            }}>{dmg.desc}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/** Build a short sentence for injection into AI prompts */
export function outfitPromptLine(outfitId: string, damage: number): string {
  const outfit = OUTFIT_OPTIONS.find((o) => o.id === outfitId);
  if (!outfit) return "";
  const dmg = DAMAGE_LEVELS.find((d) => d.pct === damage) ?? DAMAGE_LEVELS[0];
  const statePhrase =
    damage === 0
      ? "pristine and completely intact"
      : damage === 25
      ? `slightly torn — ${dmg.label.toLowerCase()}, with minor surface damage along the seams`
      : damage === 50
      ? `heavily ripped — ${dmg.label.toLowerCase()}, with significant portions exposed`
      : damage === 75
      ? `nearly destroyed — ${dmg.label.toLowerCase()}, barely covering her body`
      : `completely destroyed — ${dmg.label.toLowerCase()}, nothing remains`;
  return `COSTUME: She is wearing ${outfit.label.toLowerCase()} (${outfit.desc.split("—")[0].trim()}). Condition: ${statePhrase} (${damage}% destroyed). Describe this throughout — reference what she's wearing, how the damage progresses, and how her exposure affects her psychologically.`;
}
