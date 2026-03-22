import { useState, useEffect } from "react";

interface HomepageProps {
  onEnter: () => void;
  onCaptorPortal: () => void;
  onScenarioGenerator: () => void;
  onCharacterMapper: () => void;
  onSoundingBoard: () => void;
  onCaptorLogic: () => void;
  onSuperheroMode: () => void;
  onInterrogationRoom: () => void;
  onCelebrityMode: () => void;
  onStoryArchive: () => void;
  onDailyScenario: () => void;
  onDailyChronicle: () => void;
  onMindBreak: () => void;
  onDualCapture: () => void;
  onRescueGoneWrong: () => void;
  onPowerDrain: () => void;
  onMassCapture: () => void;
  onCorruptionArc: () => void;
}

const DAILY_HEROINES = [
  { name: "Black Widow",   color: "#FF6060" }, { name: "Scarlet Witch", color: "#FF6060" },
  { name: "Wonder Woman",  color: "#60A0FF" }, { name: "Zatanna",       color: "#60A0FF" },
  { name: "Black Canary",  color: "#40E090" }, { name: "Supergirl",     color: "#40E090" },
  { name: "Elsa",          color: "#C084FC" }, { name: "Megara",        color: "#C084FC" },
  { name: "Mulan",         color: "#C084FC" }, { name: "Starlight",     color: "#FF3D00" },
  { name: "Kimiko",        color: "#FF3D00" }, { name: "Pocahontas",    color: "#C084FC" },
];
const DAILY_VILLAINS = [
  "The Red Room Director","Baron Mordo","HYDRA Commander","Lex Luthor","Deathstroke","Circe",
  "Malcolm Merlyn","Damien Darhk","Maleficent","Ursula","Hades","Homelander","Black Noir",
];
const DAILY_SETTINGS = [
  "A subterranean black site — no signals in or out",
  "An abandoned cathedral at midnight",
  "A classified research vessel mid-ocean",
  "A forest compound deep in winter",
  "A disused Cold War bunker",
  "The ruins of a fallen empire palace",
  "A silent manor surrounded by fog",
];
const TITLE_TEMPLATES = [
  "{villain} Claims {heroine}","The Last Night — {villain} vs {heroine}",
  "{heroine} at Zero Hour","No Escape: {heroine} & {villain}",
  "{villain}'s Trophy","Into the Dark — {heroine} Falls",
];

function seededRand(seed: number) { const x = Math.sin(seed + 1) * 10000; return x - Math.floor(x); }
function dailySeed() { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }
function getDailyScenario() {
  const s = dailySeed();
  const heroine = DAILY_HEROINES[Math.floor(seededRand(s) * DAILY_HEROINES.length)];
  const villain = DAILY_VILLAINS[Math.floor(seededRand(s + 3) * DAILY_VILLAINS.length)];
  const setting = DAILY_SETTINGS[Math.floor(seededRand(s + 7) * DAILY_SETTINGS.length)];
  const t = TITLE_TEMPLATES[Math.floor(seededRand(s + 11) * TITLE_TEMPLATES.length)];
  return { heroine, villain, setting, title: t.replace("{heroine}", heroine.name).replace("{villain}", villain) };
}

// ─── PRIMARY CARD ──────────────────────────────────────────────────────────────
function PrimaryCard({
  num, icon, tagline, title, desc, stats, features, cta,
  accent, r, g, b, onClick,
}: {
  num: string; icon: string; tagline: string; title: string; desc: string;
  stats: [string, string][]; features: string[]; cta: string;
  accent: string; r: number; g: number; b: number;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${r},${g},${b}`;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        background: `radial-gradient(ellipse at 30% 0%, rgba(${rgb},0.17) 0%, rgba(0,0,0,0) 55%), linear-gradient(175deg, rgba(6,2,14,1) 0%, rgba(10,4,22,1) 100%)`,
        border: `1px solid ${hov ? `rgba(${rgb},0.5)` : `rgba(${rgb},0.1)`}`,
        borderRadius: "14px",
        padding: "1.75rem 1.6rem 1.5rem",
        cursor: "pointer",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        transition: "border-color 0.3s, box-shadow 0.35s, transform 0.25s",
        boxShadow: hov
          ? `0 16px 70px rgba(${rgb},0.2), 0 0 0 1px rgba(${rgb},0.05), inset 0 1px 0 rgba(${rgb},0.08)`
          : `0 4px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.025)`,
        transform: hov ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      {/* Top shimmer line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: hov ? `linear-gradient(90deg, transparent, rgba(${rgb},0.9) 40%, rgba(${rgb},1) 60%, transparent)` : `linear-gradient(90deg, transparent, rgba(${rgb},0.2) 50%, transparent)`, transition: "opacity 0.35s" }} />
      {/* Light ray */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `linear-gradient(140deg, rgba(${rgb},${hov ? 0.08 : 0.03}) 0%, transparent 50%)`, transition: "opacity 0.35s" }} />
      {/* Watermark numeral */}
      <div style={{ position: "absolute", bottom: "-0.5rem", right: "1rem", fontFamily: "'Cinzel', serif", fontSize: "6.5rem", fontWeight: 900, color: `rgba(${rgb},${hov ? 0.065 : 0.03})`, lineHeight: 1, pointerEvents: "none", transition: "color 0.35s", userSelect: "none" }}>{num}</div>
      {/* Shimmer sweep */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `linear-gradient(110deg, transparent 30%, rgba(${rgb},0.05) 50%, transparent 70%)`, backgroundSize: "200% 100%", animation: hov ? "shimmer 2.5s linear infinite" : "none" }} />

      {/* Icon + tagline */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ fontSize: "2.25rem", lineHeight: 1, filter: hov ? `drop-shadow(0 0 22px rgba(${rgb},1)) drop-shadow(0 0 50px rgba(${rgb},0.5))` : `drop-shadow(0 0 7px rgba(${rgb},0.45))`, transition: "filter 0.35s", transform: hov ? "scale(1.1) rotate(-5deg)" : "scale(1)", transitionDuration: "0.28s", display: "inline-block" }}>{icon}</div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.49rem", letterSpacing: "3.5px", color: `rgba(${rgb},${hov ? 0.7 : 0.3})`, transition: "color 0.3s", paddingTop: "0.2rem", textTransform: "uppercase" }}>{tagline}</div>
      </div>

      {/* Title + underline */}
      <div>
        <h2 style={{ margin: 0, fontFamily: "'Cinzel', serif", fontSize: "clamp(1.15rem, 2vw, 1.5rem)", fontWeight: 900, letterSpacing: "0.05em", lineHeight: 1.1, color: hov ? "#FFF" : "rgba(235,230,255,0.78)", transition: "color 0.3s" }}>{title}</h2>
        <div style={{ marginTop: "0.5rem", width: hov ? "44px" : "18px", height: "1.5px", background: `rgba(${rgb},${hov ? 0.9 : 0.3})`, transition: "all 0.4s ease", borderRadius: "2px" }} />
      </div>

      {/* Desc */}
      <p style={{ margin: 0, fontSize: "0.77rem", color: "rgba(200,195,225,0.38)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.72, flex: 1 }}>{desc}</p>

      {/* Stats */}
      <div style={{ display: "flex", gap: "1.5rem", paddingTop: "0.6rem", borderTop: `1px solid rgba(${rgb},0.07)` }}>
        {stats.map(([v, l]) => (
          <div key={l}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1.15rem", fontWeight: 900, color: hov ? accent : `rgba(${rgb},0.6)`, lineHeight: 1, transition: "color 0.3s" }}>{v}</div>
            <div style={{ fontSize: "0.43rem", color: "rgba(200,200,220,0.2)", letterSpacing: "2.5px", textTransform: "uppercase", marginTop: "3px" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.28rem" }}>
        {features.map((f) => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
            <div style={{ width: "4px", height: "1px", background: `rgba(${rgb},${hov ? 0.65 : 0.22})`, flexShrink: 0, transition: "background 0.3s" }} />
            <span style={{ fontSize: "0.67rem", color: "rgba(200,195,230,0.32)", fontFamily: "'Raleway', sans-serif" }}>{f}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.78rem 1.2rem", background: hov ? `rgba(${rgb},0.11)` : `rgba(${rgb},0.04)`, border: `1px solid ${hov ? `rgba(${rgb},0.4)` : `rgba(${rgb},0.09)`}`, borderRadius: "9px", transition: "all 0.3s ease" }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.68rem", letterSpacing: "2.5px", textTransform: "uppercase", color: hov ? accent : `rgba(${rgb},0.45)`, transition: "color 0.3s", fontWeight: 700 }}>{cta}</span>
        <span style={{ color: hov ? accent : `rgba(${rgb},0.22)`, transition: "all 0.3s", fontSize: "1rem", transform: hov ? "translateX(3px)" : "none", display: "inline-block" }}>→</span>
      </div>
    </div>
  );
}

// ─── SUB-MODE CARD (specialist / utility under a primary) ──────────────────────
function SubCard({ icon, title, desc, accent, r, g, b, badge, onClick }: {
  icon: string; title: string; desc: string; accent: string;
  r: number; g: number; b: number; badge?: string; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${r},${g},${b}`;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        background: hov ? `rgba(${rgb},0.07)` : "rgba(5,2,12,0.75)",
        border: `1px solid ${hov ? `rgba(${rgb},0.38)` : `rgba(${rgb},0.09)`}`,
        borderRadius: "10px",
        padding: "0.9rem 1rem",
        cursor: "pointer",
        transition: "all 0.25s ease",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        boxShadow: hov ? `0 6px 30px rgba(${rgb},0.12)` : "none",
      }}
    >
      {/* Top shimmer */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: hov ? `linear-gradient(90deg, transparent, rgba(${rgb},0.7), transparent)` : `linear-gradient(90deg, transparent, rgba(${rgb},0.18), transparent)`, transition: "opacity 0.25s" }} />

      {/* Icon box */}
      <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: `rgba(${rgb},${hov ? 0.18 : 0.07})`, border: `1px solid rgba(${rgb},${hov ? 0.35 : 0.12})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0, transition: "all 0.25s", filter: hov ? `drop-shadow(0 0 10px rgba(${rgb},0.7))` : "none" }}>{icon}</div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.18rem" }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.73rem", fontWeight: 700, color: hov ? "#FFF" : `rgba(${rgb},0.72)`, transition: "color 0.25s", letterSpacing: "0.03em" }}>{title}</span>
          {badge && <span style={{ fontSize: "0.38rem", letterSpacing: "1.5px", padding: "1px 5px", borderRadius: "3px", background: `rgba(${rgb},0.14)`, color: accent, fontFamily: "'Cinzel', serif", textTransform: "uppercase", flexShrink: 0 }}>{badge}</span>}
        </div>
        <div style={{ fontSize: "0.63rem", color: "rgba(200,195,225,0.27)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{desc}</div>
      </div>

      {/* Arrow */}
      <span style={{ fontSize: "0.75rem", color: hov ? `rgba(${rgb},0.7)` : "rgba(255,255,255,0.07)", transition: "all 0.25s", flexShrink: 0, transform: hov ? "translateX(2px)" : "none", display: "inline-block" }}>→</span>
    </div>
  );
}

// ─── GENERAL TOOL TILE ─────────────────────────────────────────────────────────
function ToolTile({ icon, title, desc, hex, r, g, b, onClick }: {
  icon: string; title: string; desc: string; hex: string;
  r: number; g: number; b: number; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${r},${g},${b}`;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? `rgba(${rgb},0.05)` : "rgba(8,4,18,0.7)",
        border: `1px solid ${hov ? `rgba(${rgb},0.28)` : "rgba(255,255,255,0.04)"}`,
        borderRadius: "10px", padding: "0.9rem 1rem",
        cursor: "pointer", transition: "all 0.25s",
        display: "flex", alignItems: "center", gap: "0.85rem",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "2px", background: hov ? hex : "transparent", transition: "background 0.25s", borderRadius: "2px 0 0 2px" }} />
      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `rgba(${rgb},${hov ? 0.15 : 0.07})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0, transition: "all 0.25s", filter: hov ? `drop-shadow(0 0 8px rgba(${rgb},0.7))` : "none" }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.7rem", fontWeight: 700, color: hov ? "#FFF" : "rgba(220,215,240,0.52)", letterSpacing: "0.03em", transition: "color 0.25s", marginBottom: "0.15rem" }}>{title}</div>
        <div style={{ fontSize: "0.61rem", color: "rgba(200,195,225,0.22)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.4 }}>{desc}</div>
      </div>
      <span style={{ fontSize: "0.75rem", color: hov ? `rgba(${rgb},0.7)` : "rgba(255,255,255,0.07)", transition: "all 0.25s", flexShrink: 0 }}>→</span>
    </div>
  );
}

// ─── DAILY DISPATCH ────────────────────────────────────────────────────────────
function DailyDispatch({ heroine, villain, setting, title, today, onGenerate, onChronicle }: {
  heroine: { name: string; color: string }; villain: string; setting: string;
  title: string; today: string; onGenerate: () => void; onChronicle: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", display: "flex" }}>
      {/* Film strip edge */}
      <div style={{ width: "30px", flexShrink: 0, background: "rgba(200,168,75,0.035)", borderRight: "1px solid rgba(200,168,75,0.07)", display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", padding: "10px 0" }}>
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{ width: "13px", height: "9px", borderRadius: "2px", border: "1px solid rgba(200,168,75,0.1)" }} />
        ))}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          onClick={onGenerate}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            padding: "1.2rem 1.6rem",
            background: "rgba(6,2,16,0.95)",
            borderTop: `1px solid ${hov ? "rgba(200,168,75,0.32)" : "rgba(200,168,75,0.09)"}`,
            borderRight: `1px solid ${hov ? "rgba(200,168,75,0.32)" : "rgba(200,168,75,0.09)"}`,
            borderBottom: `1px solid ${hov ? "rgba(200,168,75,0.32)" : "rgba(200,168,75,0.09)"}`,
            borderLeft: "none",
            cursor: "pointer", transition: "all 0.3s",
            display: "flex", alignItems: "center", gap: "1.75rem", flexWrap: "wrap",
            position: "relative", overflow: "hidden",
            borderRadius: "0 10px 0 0",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 30%, rgba(200,168,75,0.025) 50%, transparent 70%)", backgroundSize: "200% 100%", animation: hov ? "shimmer 3s linear infinite" : "none", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "0.85rem", right: "1.25rem", fontSize: "0.42rem", letterSpacing: "3px", color: "rgba(200,168,75,0.28)", fontFamily: "'Cinzel', serif", textTransform: "uppercase" }}>Daily Dark Scenario · {today}</div>
          <div style={{ flexShrink: 0, paddingRight: "1.75rem", borderRight: "1px solid rgba(200,168,75,0.07)" }}>
            <div style={{ fontSize: "0.43rem", letterSpacing: "4px", color: "rgba(200,168,75,0.38)", fontFamily: "'Cinzel', serif", marginBottom: "0.35rem", textTransform: "uppercase" }}>Today's Dispatch</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(0.9rem, 1.8vw, 1.15rem)", fontWeight: 700, color: hov ? "#E8D898" : "rgba(220,205,150,0.72)", transition: "color 0.3s", maxWidth: "260px", lineHeight: 1.3 }}>{title}</div>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.42rem", color: "rgba(200,168,75,0.28)", letterSpacing: "2.5px", marginBottom: "0.2rem", textTransform: "uppercase" }}>Heroine</div>
              <div style={{ fontSize: "0.8rem", color: heroine.color, fontFamily: "'Cinzel', serif", fontWeight: 700 }}>{heroine.name}</div>
            </div>
            <div style={{ fontSize: "0.7rem", color: "rgba(200,168,75,0.18)" }}>✕</div>
            <div>
              <div style={{ fontSize: "0.42rem", color: "rgba(200,168,75,0.28)", letterSpacing: "2.5px", marginBottom: "0.2rem", textTransform: "uppercase" }}>Villain</div>
              <div style={{ fontSize: "0.8rem", color: "rgba(200,195,225,0.48)", fontFamily: "'Cinzel', serif" }}>{villain}</div>
            </div>
            <div style={{ width: "1px", height: "2.2rem", background: "rgba(255,255,255,0.04)" }} />
            <div>
              <div style={{ fontSize: "0.42rem", color: "rgba(200,168,75,0.28)", letterSpacing: "2.5px", marginBottom: "0.2rem", textTransform: "uppercase" }}>Setting</div>
              <div style={{ fontSize: "0.69rem", color: "rgba(200,195,220,0.33)", fontFamily: "'Raleway', sans-serif", maxWidth: "200px", lineHeight: 1.35 }}>{setting}</div>
            </div>
          </div>
          <div style={{ marginLeft: "auto", flexShrink: 0, display: "flex", alignItems: "center", gap: "0.45rem", color: hov ? "rgba(200,168,75,0.92)" : "rgba(200,168,75,0.28)", transition: "color 0.3s", fontFamily: "'Cinzel', serif", fontSize: "0.62rem", letterSpacing: "1.5px" }}>
            ◆ Generate Today's Story →
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 1.4rem", background: "rgba(4,2,10,0.96)", borderRight: "1px solid rgba(200,168,75,0.06)", borderBottom: "1px solid rgba(200,168,75,0.06)", borderTop: "none", borderLeft: "none", borderRadius: "0 0 10px 0" }}>
          <span style={{ fontSize: "0.45rem", color: "rgba(200,168,75,0.18)", letterSpacing: "2px", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase" }}>One story generated and saved each day automatically</span>
          <button onClick={(e) => { e.stopPropagation(); onChronicle(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(200,168,75,0.32)", fontFamily: "'Cinzel', serif", fontSize: "0.58rem", letterSpacing: "1.5px", padding: "0", transition: "color 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(200,168,75,0.78)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(200,168,75,0.32)"; }}>View Chronicle →</button>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION DIVIDER ──────────────────────────────────────────────────────────
function SectionLabel({ label, r, g, b }: { label: string; r: number; g: number; b: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.65rem", marginTop: "0.25rem" }}>
      <div style={{ width: "16px", height: "1px", background: `rgba(${r},${g},${b},0.3)` }} />
      <span style={{ fontSize: "0.42rem", letterSpacing: "4px", textTransform: "uppercase", color: `rgba(${r},${g},${b},0.35)`, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, rgba(${r},${g},${b},0.15), transparent)` }} />
    </div>
  );
}

// ─── HOMEPAGE ──────────────────────────────────────────────────────────────────
export default function Homepage(props: HomepageProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);
  const { heroine, villain, setting, title: dailyTitle } = getDailyScenario();
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "transparent" }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
        @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(0.6); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width: 900px) {
          .hp-cols { grid-template-columns: 1fr !important; }
          .hp-nav-stats { display: none !important; }
          .hp-nav { padding: 0 1rem !important; }
          .hp-pad { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
        }
        @media (max-width: 560px) {
          .hp-general { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Ambient glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-15%", left: "8%",  width: "800px", height: "700px", background: "radial-gradient(ellipse, rgba(80,0,160,0.07) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", top: "20%", right: "-8%", width: "600px", height: "600px", background: "radial-gradient(ellipse, rgba(150,80,0,0.06) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", bottom: "0%", left: "30%", width: "700px", height: "400px", background: "radial-gradient(ellipse, rgba(100,0,0,0.05) 0%, transparent 60%)" }} />
      </div>

      {/* ─── NAV ─── */}
      <nav className="hp-nav" style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2.5rem", height: "54px", flexShrink: 0, background: "rgba(3,0,8,0.93)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.03)", boxShadow: "0 1px 0 rgba(139,0,0,0.14)" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,0,0,0.5) 20%, rgba(184,134,11,0.35) 50%, rgba(139,0,0,0.5) 80%, transparent)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8B0000", boxShadow: "0 0 12px #8B0000", animation: "pulseDot 3s ease-in-out infinite" }} />
          <span style={{ fontSize: "0.9rem", fontWeight: 900, letterSpacing: "5px", background: "linear-gradient(135deg, #E8D08A 0%, #C8A830 50%, #A07030 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontFamily: "'Cinzel', serif" }}>SHADOWWEAVE</span>
        </div>
        <div className="hp-nav-stats" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {[["7", "Story Modes"], ["181+", "Heroines"], ["Venice AI", "Engine"], ["Uncensored", "Model"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 900, color: "rgba(212,175,55,0.62)", lineHeight: 1, fontFamily: "'Cinzel', serif" }}>{v}</div>
              <div style={{ fontSize: "0.41rem", color: "rgba(200,200,220,0.17)", letterSpacing: "2.5px", textTransform: "uppercase", marginTop: "2px", fontFamily: "'Montserrat', sans-serif" }}>{l}</div>
            </div>
          ))}
        </div>
        <button onClick={props.onStoryArchive} style={{ display: "flex", alignItems: "center", gap: "0.45rem", padding: "0.38rem 0.9rem", background: "rgba(20,5,40,0.9)", border: "1px solid rgba(106,173,228,0.17)", borderRadius: "30px", cursor: "pointer", color: "inherit", transition: "all 0.3s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(106,173,228,0.42)"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(106,173,228,0.17)"; }}>
          <span style={{ fontSize: "0.65rem" }}>◈</span>
          <span style={{ fontSize: "0.56rem", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(106,173,228,0.62)", fontWeight: 700, fontFamily: "'Cinzel', serif" }}>Archive</span>
        </button>
      </nav>

      {/* ─── HERO HEADER ─── */}
      <div className="hp-pad" style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "3.5rem 2rem 2rem", opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.65s ease both" : "none" }}>
        <div style={{ fontSize: "0.48rem", letterSpacing: "7px", color: "rgba(200,168,75,0.32)", fontFamily: "'Cinzel', serif", marginBottom: "0.7rem", textTransform: "uppercase" }}>Professional Dark Narrative Studio</div>
        <h1 style={{ margin: "0 0 0.5rem", fontFamily: "'Cinzel', serif", fontSize: "clamp(1.4rem, 4vw, 2.5rem)", fontWeight: 900, letterSpacing: "0.1em", background: "linear-gradient(135deg, #E8D08A 0%, #C8A830 40%, #A07030 65%, #C8A830 85%, #E8D08A 100%)", backgroundSize: "250% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer 6s linear infinite" }}>CHOOSE YOUR MODE</h1>
        <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(200,195,220,0.25)", fontFamily: "'Raleway', sans-serif", letterSpacing: "1.5px" }}>Each mode generates a fully uncensored AI-written dark narrative</p>
      </div>

      {/* ─── THREE COLUMNS ─── */}
      <div className="hp-pad hp-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.15rem", padding: "0 2rem 2rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.65s 0.08s ease both" : "none" }}>

        {/* ══ COL 1: HEROINE FORGE ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <PrimaryCard
            num="I" icon="⚡" tagline="Superhero Universe" title="HEROINE FORGE"
            desc="181+ heroines across Marvel, DC, CW, The Boys, Power Rangers, Animated, Star Wars, and TV universes. Choose your villain and generate a multi-chapter dark thriller."
            stats={[["181+", "Heroines"], ["67", "Villains"], ["8", "Universes"]]}
            features={["Marvel · DC · CW · The Boys", "Power Rangers · Animated · Star Wars", "Multi-chapter AI story engine"]}
            cta="Enter the Forge" accent="#B084FC" r={155} g={89} b={255}
            onClick={props.onSuperheroMode}
          />
          <SectionLabel label="Specialist Modes" r={155} g={89} b={255} />
          <SubCard icon="◉" title="Mind Break Chamber" desc="5 phases of psychological dismantling. Track the breaking of her will." accent="#C084FC" r={192} g={132} b={252} badge="Psych" onClick={props.onMindBreak} />
          <SubCard icon="⊕" title="Two Heroines, One Cell" desc="Two captives, one villain. Their bond becomes both hope and weapon." accent="#40E090" r={64} g={224} b={144} badge="Duo" onClick={props.onDualCapture} />
          <SubCard icon="✗" title="Rescue Gone Wrong" desc="A second heroine comes to save the first — and falls into the trap herself." accent="#FF9640" r={255} g={150} b={64} badge="Trap" onClick={props.onRescueGoneWrong} />
          <SubCard icon="↓" title="Power Drain Mode" desc="Systematic stripping of powers, one by one. A live drain meter tracks her fall." accent="#60A0FF" r={96} g={160} b={255} badge="Meter" onClick={props.onPowerDrain} />
          <SubCard icon="≡" title="Mass Capture Mode" desc="3–5 heroines, one dominant villain. Group dynamics, divided loyalty, collective submission." accent="#FF6060" r={255} g={60} b={60} badge="Group" onClick={props.onMassCapture} />
          <SubCard icon="↘" title="Corruption Arc" desc="7 chapters, 100% → 0% loyalty. Watch a heroine fall and genuinely switch sides." accent="#FF69B4" r={255} g={105} b={180} badge="Arc" onClick={props.onCorruptionArc} />
        </div>

        {/* ══ COL 2: CELEBRITY CAPTIVE ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <PrimaryCard
            num="II" icon="★" tagline="Real World Mode" title="CELEBRITY CAPTIVE"
            desc="100 real-world actresses. Build a captor or captor team — 6 archetypes or fully custom. Set the encounter, tone, and scene. Generate an uncensored dark thriller."
            stats={[["100+", "Actresses"], ["6", "Archetypes"], ["8", "Encounters"]]}
            features={["Solo or team captors", "10 settings · 6 tones", "Streaming chapter continuation"]}
            cta="Enter the Room" accent="#E8C870" r={200} g={168} b={75}
            onClick={props.onCelebrityMode}
          />
          <SectionLabel label="Scene Tools" r={200} g={168} b={75} />
          <SubCard icon="◉" title="Interrogation Room" desc="Live captor-vs-celebrity dialogue, AI-escalated in real time." accent="#E8C870" r={200} g={168} b={75} badge="Live" onClick={props.onInterrogationRoom} />
          <SubCard icon="🎭" title="Captor Configuration" desc="Full antagonist profiling — motive, methods, endgame goals." accent="#C8A84B" r={180} g={130} b={40} badge="Profile" onClick={props.onCaptorPortal} />
          <SubCard icon="◈" title="Captor Logic Sim" desc="Set rules and goals. AI simulates captor behaviour and consequences." accent="#B89030" r={160} g={110} b={20} badge="Sim" onClick={props.onCaptorLogic} />
        </div>

        {/* ══ COL 3: CUSTOM SCENARIO ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <PrimaryCard
            num="III" icon="◈" tagline="Build From Scratch" title="CUSTOM SCENARIO"
            desc="Create your own heroine — psychology, traumas, breaking points. Profile a captor with 8 configuration questions. Set the scene and let the AI write your story."
            stats={[["7", "Heroine Q's"], ["8", "Captor Q's"], ["∞", "Outcomes"]]}
            features={["Full character builder", "Captor profiler", "AI-powered story engine"]}
            cta="Start Building" accent="#FF6060" r={200} g={40} b={40}
            onClick={props.onEnter}
          />
          <SectionLabel label="Writing Tools" r={200} g={40} b={40} />
          <SubCard icon="⚡" title="Scenario Engine" desc="Generate 8 tailored narrative questions from 4 config inputs." accent="#FF6060" r={200} g={40} b={40} badge="Questions" onClick={props.onScenarioGenerator} />
          <SubCard icon="◎" title="Relationship Map" desc="Visual node map of characters and their dynamics." accent="#CC4444" r={180} g={30} b={30} badge="Visual" onClick={props.onCharacterMapper} />
          <SubCard icon="✦" title="Sounding Board" desc="Chat with an AI co-writer. Break blocks, get twists, ask anything." accent="#AA3333" r={160} g={20} b={20} badge="AI Chat" onClick={props.onSoundingBoard} />
        </div>
      </div>

      {/* ─── DAILY DISPATCH ─── */}
      <div className="hp-pad" style={{ padding: "0 2rem 2rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.65s 0.18s ease both" : "none" }}>
        <DailyDispatch heroine={heroine} villain={villain} setting={setting} title={dailyTitle} today={today} onGenerate={props.onDailyScenario} onChronicle={props.onDailyChronicle} />
      </div>

      {/* ─── GENERAL TOOLS ─── */}
      <div className="hp-pad" style={{ padding: "0 2rem 3rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.65s 0.26s ease both" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "0.9rem" }}>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(139,0,0,0.22), rgba(184,134,11,0.1) 60%, transparent)" }} />
          <span style={{ fontSize: "0.43rem", letterSpacing: "5px", textTransform: "uppercase", color: "rgba(184,134,11,0.25)", fontWeight: 700, fontFamily: "'Montserrat', sans-serif", whiteSpace: "nowrap" }}>Studio Tools</span>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(184,134,11,0.1) 40%, rgba(139,0,0,0.22))" }} />
        </div>
        <div className="hp-general" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.65rem" }}>
          <ToolTile icon="◼" title="Mood Lighting" desc="Switch atmosphere: Void, Isolation, Candlelight, Glitch." hex="#B7770D" r={180} g={120} b={0} onClick={() => { const btn = document.querySelector("[title='Change theme']") as HTMLButtonElement | null; btn?.click(); }} />
          <ToolTile icon="◈" title="Story Archive" desc="Browse, tag, favourite, and export every story you've saved." hex="#2C5F8A" r={44} g={95} b={138} onClick={props.onStoryArchive} />
          <ToolTile icon="◈" title="Daily Chronicle" desc="The full collection of past daily dark scenarios." hex="#8A6A20" r={138} g={106} b={32} onClick={props.onDailyChronicle} />
        </div>
      </div>

      {/* Footer */}
      <div className="hp-pad" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", padding: "0.9rem 2rem", borderTop: "1px solid rgba(255,255,255,0.025)", opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.6s 0.4s ease both" : "none", position: "relative", zIndex: 2 }}>
        <span style={{ fontSize: "0.44rem", color: "rgba(200,200,220,0.09)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>For adult dark fiction writers only</span>
        <span style={{ fontSize: "0.44rem", color: "rgba(200,200,220,0.09)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>Venice AI · venice-uncensored-role-play · Uncensored</span>
      </div>
    </div>
  );
}
