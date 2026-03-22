import { useState, useEffect, useRef } from "react";

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

// ─── PRIMARY MODE CARD ─────────────────────────────────────────────────────────
function PrimaryCard({
  num, icon, tagline, title, desc, stats, features, cta,
  accent, r, g, b, rayAngle, onClick, delay,
}: {
  num: string; icon: string; tagline: string; title: string; desc: string;
  stats: [string, string][]; features: string[]; cta: string;
  accent: string; r: number; g: number; b: number; rayAngle: string;
  onClick: () => void; delay: number;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${r},${g},${b}`;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: "1 1 280px",
        position: "relative",
        background: `radial-gradient(ellipse at 30% 0%, rgba(${rgb},0.18) 0%, rgba(0,0,0,0) 55%), linear-gradient(175deg, rgba(6,2,14,1) 0%, rgba(10,4,22,1) 100%)`,
        border: `1px solid ${hov ? `rgba(${rgb},0.55)` : `rgba(${rgb},0.12)`}`,
        borderRadius: "16px",
        padding: "2rem 1.75rem 1.6rem",
        cursor: "pointer",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "1.1rem",
        transition: "border-color 0.35s, box-shadow 0.4s, transform 0.3s",
        boxShadow: hov
          ? `0 20px 80px rgba(${rgb},0.22), 0 0 0 1px rgba(${rgb},0.06), inset 0 1px 0 rgba(${rgb},0.1)`
          : `0 4px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)`,
        transform: hov ? "translateY(-4px) scale(1.005)" : "translateY(0) scale(1)",
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: hov
          ? `linear-gradient(90deg, transparent 0%, rgba(${rgb},0.8) 40%, rgba(${rgb},1) 60%, transparent 100%)`
          : `linear-gradient(90deg, transparent 0%, rgba(${rgb},0.25) 50%, transparent 100%)`,
        transition: "opacity 0.4s",
      }} />

      {/* Light ray */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `linear-gradient(${rayAngle}, rgba(${rgb},${hov ? 0.09 : 0.04}) 0%, transparent 50%)`,
        transition: "opacity 0.4s",
      }} />

      {/* Large watermark numeral */}
      <div style={{
        position: "absolute", bottom: "-0.5rem", right: "1.25rem",
        fontFamily: "'Cinzel', serif",
        fontSize: "7rem", fontWeight: 900,
        color: `rgba(${rgb},${hov ? 0.07 : 0.035})`,
        lineHeight: 1, pointerEvents: "none",
        transition: "color 0.4s",
        userSelect: "none",
      }}>{num}</div>

      {/* Shimmer on hover */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `linear-gradient(110deg, transparent 30%, rgba(${rgb},0.05) 50%, transparent 70%)`,
        backgroundSize: "200% 100%",
        animation: hov ? "shimmer 2.5s linear infinite" : "none",
      }} />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{
          fontSize: "2.5rem", lineHeight: 1,
          filter: hov
            ? `drop-shadow(0 0 24px rgba(${rgb},1)) drop-shadow(0 0 60px rgba(${rgb},0.5))`
            : `drop-shadow(0 0 8px rgba(${rgb},0.5))`,
          transition: "filter 0.4s",
          transform: hov ? "scale(1.1) rotate(-5deg)" : "scale(1) rotate(0deg)",
          transitionDuration: "0.3s",
          display: "inline-block",
        }}>{icon}</div>
        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: "0.52rem",
          letterSpacing: "3.5px", color: `rgba(${rgb},${hov ? 0.7 : 0.3})`,
          transition: "color 0.3s", paddingTop: "0.25rem",
          textTransform: "uppercase",
        }}>{tagline}</div>
      </div>

      {/* Title */}
      <div>
        <h2 style={{
          margin: 0, fontFamily: "'Cinzel', serif",
          fontSize: "clamp(1.25rem, 2.2vw, 1.6rem)",
          fontWeight: 900, letterSpacing: "0.05em", lineHeight: 1.1,
          color: hov ? "#FFFFFF" : "rgba(235,230,255,0.78)",
          transition: "color 0.3s",
        }}>{title}</h2>
        <div style={{ marginTop: "0.6rem", width: hov ? "48px" : "20px", height: "1.5px", background: `rgba(${rgb},${hov ? 0.9 : 0.35})`, transition: "all 0.4s ease", borderRadius: "2px" }} />
      </div>

      {/* Desc */}
      <p style={{
        margin: 0, fontSize: "0.8rem",
        color: "rgba(200,195,225,0.42)", fontFamily: "'Raleway', sans-serif",
        lineHeight: 1.75, flex: 1,
      }}>{desc}</p>

      {/* Stats */}
      <div style={{ display: "flex", gap: "1.75rem", padding: "0.75rem 0", borderTop: `1px solid rgba(${rgb},0.08)`, borderBottom: `1px solid rgba(${rgb},0.08)` }}>
        {stats.map(([v, l]) => (
          <div key={l}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", fontWeight: 900, color: hov ? accent : `rgba(${rgb},0.65)`, lineHeight: 1, transition: "color 0.3s" }}>{v}</div>
            <div style={{ fontSize: "0.44rem", color: "rgba(200,200,220,0.22)", letterSpacing: "2.5px", textTransform: "uppercase", marginTop: "3px" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        {features.map((f) => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: "4px", height: "1px", background: `rgba(${rgb},${hov ? 0.7 : 0.25})`, flexShrink: 0, transition: "background 0.3s" }} />
            <span style={{ fontSize: "0.69rem", color: "rgba(200,195,230,0.35)", fontFamily: "'Raleway', sans-serif" }}>{f}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.85rem 1.25rem",
        background: hov ? `rgba(${rgb},0.12)` : `rgba(${rgb},0.04)`,
        border: `1px solid ${hov ? `rgba(${rgb},0.45)` : `rgba(${rgb},0.1)`}`,
        borderRadius: "10px",
        transition: "all 0.3s ease",
      }}>
        <span style={{
          fontFamily: "'Cinzel', serif", fontSize: "0.72rem",
          letterSpacing: "2.5px", textTransform: "uppercase",
          color: hov ? accent : `rgba(${rgb},0.5)`,
          transition: "color 0.3s", fontWeight: 700,
        }}>{cta}</span>
        <span style={{
          color: hov ? accent : `rgba(${rgb},0.25)`,
          transition: "all 0.3s", fontSize: "1.1rem",
          transform: hov ? "translateX(3px)" : "none",
          display: "inline-block",
        }}>→</span>
      </div>
    </div>
  );
}

// ─── SPECIALIST CARD ──────────────────────────────────────────────────────────
function SpecialistCard({ icon, title, desc, accent, r, g, b, badge, onClick }: {
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
        background: hov
          ? `linear-gradient(135deg, rgba(${rgb},0.1) 0%, rgba(6,2,14,0.98) 100%)`
          : "rgba(6,2,14,0.85)",
        border: `1px solid ${hov ? `rgba(${rgb},0.4)` : `rgba(${rgb},0.1)`}`,
        borderRadius: "12px",
        padding: "1.2rem 1.3rem",
        cursor: "pointer",
        transition: "all 0.3s ease",
        overflow: "hidden",
        display: "flex", flexDirection: "column", gap: "0.7rem",
        boxShadow: hov ? `0 12px 50px rgba(${rgb},0.16), inset 0 1px 0 rgba(${rgb},0.08)` : `inset 0 1px 0 rgba(255,255,255,0.02)`,
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1.5px", background: hov ? `linear-gradient(90deg, transparent, rgba(${rgb},0.8), transparent)` : `linear-gradient(90deg, transparent, rgba(${rgb},0.2), transparent)`, transition: "opacity 0.3s" }} />

      {badge && (
        <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", fontSize: "0.42rem", letterSpacing: "2px", padding: "2px 6px", borderRadius: "4px", background: `rgba(${rgb},0.15)`, color: accent, fontFamily: "'Cinzel', serif", textTransform: "uppercase" }}>
          {badge}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
        <div style={{
          width: "38px", height: "38px", borderRadius: "10px",
          background: `rgba(${rgb},${hov ? 0.18 : 0.08})`,
          border: `1px solid rgba(${rgb},${hov ? 0.4 : 0.15})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.2rem", flexShrink: 0,
          transition: "all 0.3s",
          filter: hov ? `drop-shadow(0 0 12px rgba(${rgb},0.8))` : "none",
        }}>{icon}</div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.82rem", fontWeight: 700, color: hov ? "#FFF" : `rgba(${rgb},0.7)`, transition: "color 0.25s", letterSpacing: "0.03em", lineHeight: 1.3 }}>{title}</div>
      </div>

      <div style={{ fontSize: "0.68rem", color: "rgba(200,195,228,0.32)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.6, paddingLeft: "calc(38px + 0.8rem)" }}>
        {desc}
      </div>

      <div style={{ paddingLeft: "calc(38px + 0.8rem)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
        <div style={{ width: "16px", height: "1px", background: `rgba(${rgb},${hov ? 0.8 : 0.3})`, transition: "all 0.3s", ...(hov ? { width: "24px" } : {}) }} />
        <span style={{ fontSize: "0.58rem", color: hov ? accent : `rgba(${rgb},0.35)`, fontFamily: "'Cinzel', serif", letterSpacing: "1.5px", transition: "color 0.25s" }}>ENTER</span>
      </div>
    </div>
  );
}

// ─── UTILITY TILE ─────────────────────────────────────────────────────────────
function UtilTile({ icon, title, desc, hex, r, g, b, onClick }: {
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
        border: `1px solid ${hov ? `rgba(${rgb},0.3)` : "rgba(255,255,255,0.04)"}`,
        borderRadius: "10px", padding: "0.9rem 1rem",
        cursor: "pointer", transition: "all 0.25s ease",
        display: "flex", alignItems: "center", gap: "0.85rem",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "2px", background: hov ? hex : "transparent", transition: "background 0.25s", borderRadius: "2px 0 0 2px" }} />
      <div style={{
        width: "32px", height: "32px", borderRadius: "8px",
        background: `rgba(${rgb},${hov ? 0.15 : 0.07})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1rem", flexShrink: 0, transition: "all 0.25s",
        filter: hov ? `drop-shadow(0 0 8px rgba(${rgb},0.7))` : "none",
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.72rem", fontWeight: 700, color: hov ? "#FFF" : "rgba(220,215,240,0.55)", letterSpacing: "0.03em", transition: "color 0.25s", marginBottom: "0.18rem" }}>
          {title}
        </div>
        <div style={{ fontSize: "0.62rem", color: "rgba(200,195,225,0.25)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.45 }}>
          {desc}
        </div>
      </div>
      <span style={{ fontSize: "0.8rem", color: hov ? `rgba(${rgb},0.75)` : "rgba(255,255,255,0.08)", transition: "all 0.25s", flexShrink: 0 }}>→</span>
    </div>
  );
}

// ─── DAILY DISPATCH CARD ──────────────────────────────────────────────────────
function DailyDispatch({ heroine, villain, setting, title, today, onGenerate, onChronicle }: {
  heroine: { name: string; color: string }; villain: string; setting: string;
  title: string; today: string; onGenerate: () => void; onChronicle: () => void;
}) {
  const [hov, setHov] = useState(false);

  return (
    <div style={{ position: "relative", borderRadius: "14px", overflow: "hidden" }}>
      {/* Decorative film strip left edge */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "32px",
        background: "rgba(200,168,75,0.04)",
        borderRight: "1px solid rgba(200,168,75,0.08)",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "6px", padding: "12px 0",
        zIndex: 1,
      }}>
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{ width: "14px", height: "10px", borderRadius: "2px", border: "1px solid rgba(200,168,75,0.12)", background: "transparent" }} />
        ))}
      </div>

      <div
        onClick={onGenerate}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          marginLeft: "32px",
          padding: "1.4rem 1.75rem",
          background: "rgba(6,2,16,0.95)",
          borderTop: `1px solid ${hov ? "rgba(200,168,75,0.35)" : "rgba(200,168,75,0.1)"}`,
          borderRight: `1px solid ${hov ? "rgba(200,168,75,0.35)" : "rgba(200,168,75,0.1)"}`,
          borderBottom: `1px solid ${hov ? "rgba(200,168,75,0.35)" : "rgba(200,168,75,0.1)"}`,
          borderLeft: "none",
          cursor: "pointer",
          transition: "all 0.3s ease",
          display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap",
          position: "relative", overflow: "hidden",
          borderRadius: "0 12px 0 0",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 30%, rgba(200,168,75,0.03) 50%, transparent 70%)", backgroundSize: "200% 100%", animation: hov ? "shimmer 3s linear infinite" : "none", pointerEvents: "none" }} />

        {/* Date badge */}
        <div style={{ position: "absolute", top: "1rem", right: "1.5rem", fontSize: "0.44rem", letterSpacing: "3px", color: "rgba(200,168,75,0.3)", fontFamily: "'Cinzel', serif", textTransform: "uppercase" }}>
          Daily Dark Scenario · {today}
        </div>

        <div style={{ flexShrink: 0, paddingRight: "2rem", borderRight: "1px solid rgba(200,168,75,0.08)" }}>
          <div style={{ fontSize: "0.46rem", letterSpacing: "4px", color: "rgba(200,168,75,0.4)", fontFamily: "'Cinzel', serif", marginBottom: "0.4rem", textTransform: "uppercase" }}>Today's Dispatch</div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(0.95rem, 2vw, 1.25rem)", fontWeight: 700, color: hov ? "#E8D898" : "rgba(220,205,150,0.75)", transition: "color 0.3s", maxWidth: "280px", lineHeight: 1.3 }}>
            {title}
          </div>
        </div>

        <div style={{ display: "flex", gap: "1.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.44rem", color: "rgba(200,168,75,0.3)", letterSpacing: "2.5px", marginBottom: "0.25rem", textTransform: "uppercase" }}>Heroine</div>
            <div style={{ fontSize: "0.82rem", color: heroine.color, fontFamily: "'Cinzel', serif", fontWeight: 700 }}>{heroine.name}</div>
          </div>
          <div style={{ fontSize: "0.75rem", color: "rgba(200,168,75,0.2)" }}>✕</div>
          <div>
            <div style={{ fontSize: "0.44rem", color: "rgba(200,168,75,0.3)", letterSpacing: "2.5px", marginBottom: "0.25rem", textTransform: "uppercase" }}>Villain</div>
            <div style={{ fontSize: "0.82rem", color: "rgba(200,195,225,0.5)", fontFamily: "'Cinzel', serif" }}>{villain}</div>
          </div>
          <div style={{ width: "1px", height: "2.5rem", background: "rgba(255,255,255,0.05)" }} />
          <div>
            <div style={{ fontSize: "0.44rem", color: "rgba(200,168,75,0.3)", letterSpacing: "2.5px", marginBottom: "0.25rem", textTransform: "uppercase" }}>Setting</div>
            <div style={{ fontSize: "0.72rem", color: "rgba(200,195,220,0.37)", fontFamily: "'Raleway', sans-serif", maxWidth: "220px", lineHeight: 1.4 }}>{setting}</div>
          </div>
        </div>

        <div style={{ marginLeft: "auto", flexShrink: 0, display: "flex", alignItems: "center", gap: "0.5rem", color: hov ? "rgba(200,168,75,0.95)" : "rgba(200,168,75,0.3)", transition: "color 0.3s", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "1.5px" }}>
          ◆ Generate Today's Story →
        </div>
      </div>

      <div style={{
        marginLeft: "32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.55rem 1.5rem",
        background: "rgba(4,2,10,0.96)",
        borderRight: "1px solid rgba(200,168,75,0.07)",
        borderBottom: "1px solid rgba(200,168,75,0.07)",
        borderTop: "none", borderLeft: "none",
        borderRadius: "0 0 12px 0",
      }}>
        <span style={{ fontSize: "0.48rem", color: "rgba(200,168,75,0.2)", letterSpacing: "2px", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase" }}>
          One story generated and saved each day automatically
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onChronicle(); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(200,168,75,0.35)", fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "1.5px", padding: "0", transition: "color 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(200,168,75,0.8)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(200,168,75,0.35)"; }}
        >
          View Chronicle →
        </button>
      </div>
    </div>
  );
}

// ─── HOMEPAGE ──────────────────────────────────────────────────────────────────
export default function Homepage(props: HomepageProps) {
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const { heroine, villain, setting, title: dailyTitle } = getDailyScenario();
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  function handleUtilClick(id: string) {
    if (id === "captor")        props.onCaptorPortal();
    if (id === "scenario")      props.onScenarioGenerator();
    if (id === "mapper")        props.onCharacterMapper();
    if (id === "sounding")      props.onSoundingBoard();
    if (id === "captor-logic")  props.onCaptorLogic();
    if (id === "interrogation") props.onInterrogationRoom();
    if (id === "archive")       props.onStoryArchive();
    if (id === "themes") {
      const btn = document.querySelector("[title='Change theme']") as HTMLButtonElement | null;
      btn?.click();
    }
  }

  const PRIMARY = [
    {
      id: "superhero", num: "I", icon: "⚡", tagline: "Superhero Universe", title: "HEROINE FORGE",
      desc: "181+ heroines across Marvel, DC, CW, The Boys, Power Rangers, Animated, Star Wars, and TV universes. Pick your heroine, choose your villain, and generate a multi-chapter dark thriller.",
      stats: [["181+", "Heroines"], ["67", "Villains"], ["8", "Universes"]] as [string, string][],
      features: ["Marvel · DC · CW · The Boys", "Power Rangers · Animated · Star Wars", "Multi-chapter AI story engine"],
      cta: "Enter the Forge", accent: "#B084FC", r: 155, g: 89, b: 255,
      rayAngle: "135deg",
    },
    {
      id: "celebrity", num: "II", icon: "★", tagline: "Real World Mode", title: "CELEBRITY CAPTIVE",
      desc: "100 real-world actresses. Build a captor or captor team — 6 archetypes or fully custom. Set the encounter, tone, and scene. Generate an uncensored dark thriller.",
      stats: [["100+", "Actresses"], ["6", "Archetypes"], ["8", "Encounters"]] as [string, string][],
      features: ["Solo or team captors", "10 settings · 6 tones", "Streaming chapter continuation"],
      cta: "Enter the Room", accent: "#E8C870", r: 200, g: 168, b: 75,
      rayAngle: "145deg",
    },
    {
      id: "custom", num: "III", icon: "◈", tagline: "Build From Scratch", title: "CUSTOM SCENARIO",
      desc: "Create your own heroine — psychology, traumas, breaking points. Profile a captor with 8 configuration questions. Set the scene and let the AI write your story.",
      stats: [["7", "Heroine Q's"], ["8", "Captor Q's"], ["∞", "Outcomes"]] as [string, string][],
      features: ["Full character builder", "Captor profiler", "AI-powered story engine"],
      cta: "Start Building", accent: "#FF6060", r: 200, g: 40, b: 40,
      rayAngle: "140deg",
    },
  ];

  const SPECIALIST = [
    { id: "mind-break",  icon: "◉", title: "Mind Break Chamber",    desc: "5 phases of psychological dismantling. Track the breaking of her will in real time.", accent: "#C084FC", r: 192, g: 132, b: 252, badge: "Psych", onClick: props.onMindBreak },
    { id: "dual",        icon: "⊕", title: "Two Heroines, One Cell", desc: "Two captives, one villain. Their bond becomes both their hope and his weapon.",          accent: "#40E090", r: 64,  g: 224, b: 144, badge: "Duo",   onClick: props.onDualCapture },
    { id: "rescue",      icon: "✗", title: "Rescue Gone Wrong",      desc: "A second heroine comes to save the first — and falls into the trap herself.",             accent: "#FF9640", r: 255, g: 150, b: 64,  badge: "Trap",  onClick: props.onRescueGoneWrong },
    { id: "drain",       icon: "↓", title: "Power Drain Mode",       desc: "Systematic stripping of a heroine's powers, one by one. A live drain meter tracks her fall.", accent: "#60A0FF", r: 96, g: 160, b: 255, badge: "Meter", onClick: props.onPowerDrain },
  ];

  const UTILS = [
    { id: "scenario",      icon: "⚡", title: "Scenario Engine",      desc: "Generate 8 tailored narrative questions from 4 config inputs.",      hex: "#1E8449", r: 0,   g: 140, b: 60  },
    { id: "interrogation", icon: "◉", title: "Interrogation Room",    desc: "Live captor-vs-heroine dialogue, AI-escalated in real time.",        hex: "#8B0000", r: 180, g: 0,   b: 0   },
    { id: "captor-logic",  icon: "◈", title: "Captor Logic Sim",      desc: "Set rules and goals. AI simulates behaviour and consequences.",       hex: "#7D3C98", r: 120, g: 20,  b: 160 },
    { id: "sounding",      icon: "✦", title: "Sounding Board",        desc: "Chat with an AI co-writer. Break blocks, get twists, ask anything.", hex: "#0E8C75", r: 0,   g: 140, b: 120 },
    { id: "mapper",        icon: "◎", title: "Relationship Map",      desc: "Visual node map of characters and their dynamics.",                  hex: "#6C3483", r: 100, g: 30,  b: 150 },
    { id: "captor",        icon: "🎭", title: "Captor Configuration", desc: "Full antagonist profiling — motive, methods, endgame.",              hex: "#3D5A8A", r: 60,  g: 80,  b: 140 },
    { id: "themes",        icon: "◼", title: "Mood Lighting",         desc: "Switch the studio atmosphere: Void, Isolation, Candlelight, Glitch.", hex: "#B7770D", r: 180, g: 120, b: 0   },
    { id: "archive",       icon: "◈", title: "Story Archive",         desc: "Browse, tag, favourite, and export every story you've saved.",       hex: "#2C5F8A", r: 44,  g: 95,  b: 138 },
  ];

  return (
    <div ref={scrollRef} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "transparent", position: "relative" }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
        @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(0.6); } }
        @keyframes titleReveal { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes rotateSlow { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @media (max-width: 820px) {
          .hp-primary-grid { flex-direction: column !important; }
          .hp-specialist-grid { grid-template-columns: 1fr 1fr !important; }
          .hp-util-grid { grid-template-columns: 1fr 1fr !important; }
          .hp-nav-stats { display: none !important; }
          .hp-nav { padding: 0 1rem !important; }
          .hp-hero { padding: 2.5rem 1.25rem 2rem !important; }
          .hp-section { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
        }
        @media (max-width: 520px) {
          .hp-specialist-grid { grid-template-columns: 1fr !important; }
          .hp-util-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── AMBIENT GLOWS ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-15%", left: "10%", width: "800px", height: "700px", background: "radial-gradient(ellipse, rgba(80,0,160,0.07) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", top: "20%", right: "-8%", width: "600px", height: "600px", background: "radial-gradient(ellipse, rgba(150,80,0,0.06) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", bottom: "-5%", left: "25%", width: "700px", height: "500px", background: "radial-gradient(ellipse, rgba(100,0,0,0.05) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", top: "50%", left: "40%", width: "400px", height: "400px", background: "radial-gradient(ellipse, rgba(0,60,120,0.04) 0%, transparent 60%)" }} />
      </div>

      {/* ── NAV ── */}
      <nav className="hp-nav" style={{
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2.5rem", height: "56px", flexShrink: 0,
        background: "rgba(3,0,8,0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.035)",
        boxShadow: "0 1px 0 rgba(139,0,0,0.15)",
      }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,0,0,0.5) 20%, rgba(184,134,11,0.4) 50%, rgba(139,0,0,0.5) 80%, transparent)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8B0000", boxShadow: "0 0 12px #8B0000", animation: "pulseDot 3s ease-in-out infinite" }} />
          <span style={{ fontSize: "0.92rem", fontWeight: 900, letterSpacing: "5px", background: "linear-gradient(135deg, #E8D08A 0%, #C8A830 50%, #A07030 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontFamily: "'Cinzel', serif" }}>
            SHADOWWEAVE
          </span>
        </div>

        <div className="hp-nav-stats" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {[["7", "Story Modes"], ["181+", "Heroines"], ["Venice AI", "Engine"], ["Uncensored", "Model"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 900, color: "rgba(212,175,55,0.65)", lineHeight: 1, fontFamily: "'Cinzel', serif" }}>{v}</div>
              <div style={{ fontSize: "0.42rem", color: "rgba(200,200,220,0.18)", letterSpacing: "2.5px", textTransform: "uppercase", marginTop: "2px", fontFamily: "'Montserrat', sans-serif" }}>{l}</div>
            </div>
          ))}
        </div>

        <button
          onClick={props.onStoryArchive}
          style={{ display: "flex", alignItems: "center", gap: "0.45rem", padding: "0.4rem 1rem", background: "rgba(20,5,40,0.9)", border: "1px solid rgba(106,173,228,0.18)", borderRadius: "30px", cursor: "pointer", color: "inherit", transition: "all 0.3s ease" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(106,173,228,0.45)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(106,173,228,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(106,173,228,0.18)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <span style={{ fontSize: "0.7rem" }}>◈</span>
          <span style={{ fontSize: "0.58rem", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(106,173,228,0.65)", fontWeight: 700, fontFamily: "'Cinzel', serif" }}>Archive</span>
        </button>
      </nav>

      {/* ── HERO HEADER ── */}
      <div className="hp-hero" style={{
        position: "relative", zIndex: 2, textAlign: "center",
        padding: "4rem 2rem 2.5rem",
        opacity: mounted ? 1 : 0,
        animation: mounted ? "fadeUp 0.7s ease both" : "none",
      }}>
        {/* Decorative ring */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: "500px", height: "500px",
          transform: "translate(-50%, -50%)",
          border: "1px solid rgba(200,168,75,0.04)",
          borderRadius: "50%", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: "320px", height: "320px",
          transform: "translate(-50%, -50%)",
          border: "1px solid rgba(139,0,0,0.06)",
          borderRadius: "50%", pointerEvents: "none",
        }} />

        <div style={{ fontSize: "0.5rem", letterSpacing: "7px", color: "rgba(200,168,75,0.35)", fontFamily: "'Cinzel', serif", marginBottom: "0.8rem", textTransform: "uppercase" }}>
          Professional Dark Narrative Studio
        </div>
        <h1 style={{
          margin: "0 0 0.6rem", fontFamily: "'Cinzel', serif",
          fontSize: "clamp(1.5rem, 4.5vw, 2.6rem)", fontWeight: 900,
          letterSpacing: "0.1em",
          background: "linear-gradient(135deg, #E8D08A 0%, #C8A830 40%, #A07030 65%, #C8A830 85%, #E8D08A 100%)",
          backgroundSize: "250% auto",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          animation: "shimmer 6s linear infinite",
        }}>CHOOSE YOUR MODE</h1>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(200,195,220,0.28)", fontFamily: "'Raleway', sans-serif", letterSpacing: "1.5px" }}>
          Select a story mode — each one generates a fully uncensored AI-written dark narrative
        </p>
      </div>

      {/* ── THREE PRIMARY CARDS ── */}
      <div className="hp-section hp-primary-grid" style={{
        display: "flex", gap: "1.25rem",
        padding: "0 2rem 2rem",
        position: "relative", zIndex: 2,
        opacity: mounted ? 1 : 0,
        animation: mounted ? "fadeUp 0.7s 0.1s ease both" : "none",
      }}>
        {PRIMARY.map((m, i) => (
          <PrimaryCard
            key={m.id}
            {...m}
            delay={i * 80}
            onClick={() => {
              if (m.id === "superhero") props.onSuperheroMode();
              if (m.id === "celebrity") props.onCelebrityMode();
              if (m.id === "custom")    props.onEnter();
            }}
          />
        ))}
      </div>

      {/* ── DAILY DISPATCH ── */}
      <div className="hp-section" style={{ padding: "0 2rem 2rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.7s 0.2s ease both" : "none" }}>
        <DailyDispatch
          heroine={heroine} villain={villain} setting={setting}
          title={dailyTitle} today={today}
          onGenerate={props.onDailyScenario}
          onChronicle={props.onDailyChronicle}
        />
      </div>

      {/* ── SPECIALIST MODES ── */}
      <div className="hp-section" style={{ padding: "0 2rem 2rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.7s 0.28s ease both" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.1rem" }}>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(139,0,0,0.25), rgba(120,50,200,0.12) 70%, transparent)" }} />
          <div style={{ display: "flex", align: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.45rem", letterSpacing: "5px", textTransform: "uppercase", color: "rgba(160,100,220,0.4)", fontWeight: 700, fontFamily: "'Montserrat', sans-serif", whiteSpace: "nowrap" }}>Specialist Modes</span>
          </div>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(120,50,200,0.12) 30%, rgba(139,0,0,0.25))" }} />
        </div>
        <div className="hp-specialist-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.8rem" }}>
          {SPECIALIST.map((s) => <SpecialistCard key={s.id} {...s} />)}
        </div>
      </div>

      {/* ── STUDIO UTILITIES ── */}
      <div className="hp-section" style={{ padding: "0 2rem 3rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.7s 0.36s ease both" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.1rem" }}>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(139,0,0,0.25), rgba(184,134,11,0.1) 70%, transparent)" }} />
          <span style={{ fontSize: "0.45rem", letterSpacing: "5px", textTransform: "uppercase", color: "rgba(184,134,11,0.28)", fontWeight: 700, fontFamily: "'Montserrat', sans-serif", whiteSpace: "nowrap" }}>Studio Utilities</span>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(184,134,11,0.1) 30%, rgba(139,0,0,0.25))" }} />
        </div>
        <div className="hp-util-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.7rem" }}>
          {UTILS.map((u) => (
            <UtilTile key={u.id} {...u} onClick={() => handleUtilClick(u.id)} />
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem",
        padding: "1rem 2rem",
        borderTop: "1px solid rgba(255,255,255,0.025)",
        opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.6s 0.5s ease both" : "none",
        position: "relative", zIndex: 2,
      }}>
        <span style={{ fontSize: "0.45rem", color: "rgba(200,200,220,0.1)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>For adult dark fiction writers only</span>
        <span style={{ fontSize: "0.45rem", color: "rgba(200,200,220,0.1)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>Venice AI · venice-uncensored-role-play · Uncensored</span>
      </div>
    </div>
  );
}
