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
}

// ─── Three primary story modes ────────────────────────────────────────────────
const PRIMARY_MODES = [
  {
    id: "superhero",
    icon: "⚡",
    num: "I",
    title: "HEROINE FORGE",
    tagline: "Superhero Universe",
    desc: "131+ heroines across Marvel, DC, CW, The Boys, Power Rangers, Animated, and Star Wars universes. Pick your heroine, choose your villain, and generate a multi-chapter dark thriller.",
    stats: [["131+", "Heroines"], ["67", "Villains"], ["7", "Universes"]] as [string,string][],
    features: ["Marvel · DC · CW · The Boys", "Power Rangers · Animated · Star Wars", "Multi-chapter AI story engine"],
    cta: "Enter the Forge",
    grad: "linear-gradient(150deg, rgba(8,2,28,0.99) 0%, rgba(22,4,56,0.97) 55%, rgba(4,10,44,0.97) 100%)",
    accent: "#9B59FF",
    accentLight: "#C084FC",
    border: "rgba(155,89,255,0.18)",
    borderHov: "rgba(155,89,255,0.7)",
    glow: "rgba(100,40,255,0.25)",
    r: 155, g: 89, b: 255,
  },
  {
    id: "celebrity",
    icon: "★",
    num: "II",
    title: "CELEBRITY CAPTIVE",
    tagline: "Real World Mode",
    desc: "100 real-world actresses. Build a captor or captor team — 6 archetypes or fully custom. Set the encounter, tone, and scene. Generate an uncensored dark thriller.",
    stats: [["100+", "Actresses"], ["6", "Archetypes"], ["8", "Encounters"]] as [string,string][],
    features: ["Solo or team captors", "10 settings · 6 tones", "Streaming chapter continuation"],
    cta: "Enter the Room",
    grad: "linear-gradient(150deg, rgba(18,9,0,0.99) 0%, rgba(38,18,0,0.97) 55%, rgba(24,10,0,0.97) 100%)",
    accent: "#C8A84B",
    accentLight: "#E8C870",
    border: "rgba(200,168,75,0.18)",
    borderHov: "rgba(200,168,75,0.7)",
    glow: "rgba(180,130,0,0.22)",
    r: 200, g: 168, b: 75,
  },
  {
    id: "custom",
    icon: "◈",
    num: "III",
    title: "CUSTOM SCENARIO",
    tagline: "Build From Scratch",
    desc: "Create your own heroine — psychology, traumas, breaking points. Profile a captor with 8 configuration questions. Set the scene and let the AI write your story.",
    stats: [["7", "Heroine Q's"], ["8", "Captor Q's"], ["∞", "Outcomes"]] as [string,string][],
    features: ["Full character builder", "Captor profiler", "AI-powered story engine"],
    cta: "Start Building",
    grad: "linear-gradient(150deg, rgba(20,2,2,0.99) 0%, rgba(44,4,4,0.97) 55%, rgba(26,4,6,0.97) 100%)",
    accent: "#CC2222",
    accentLight: "#FF6060",
    border: "rgba(200,40,40,0.18)",
    borderHov: "rgba(200,40,40,0.7)",
    glow: "rgba(180,0,0,0.22)",
    r: 200, g: 40, b: 40,
  },
] as const;

// ─── Utility tools (secondary grid) ──────────────────────────────────────────
const UTIL_TOOLS = [
  { id: "scenario",      icon: "⚡", title: "Scenario Engine",     desc: "Generate 8 tailored narrative questions from 4 config inputs.",   hex: "#1E8449", r: 0,   g: 140, b: 60  },
  { id: "interrogation", icon: "◉", title: "Interrogation Room",   desc: "Live captor-vs-heroine dialogue, AI-escalated in real time.",     hex: "#8B0000", r: 180, g: 0,   b: 0   },
  { id: "captor-logic",  icon: "◈", title: "Captor Logic Sim",     desc: "Set rules and goals. AI simulates behaviour and consequences.",    hex: "#7D3C98", r: 120, g: 20,  b: 160 },
  { id: "sounding",      icon: "✦", title: "Sounding Board",       desc: "Chat with an AI co-writer. Break blocks, get twists, ask anything.", hex: "#0E8C75", r: 0, g: 140, b: 120 },
  { id: "mapper",        icon: "◎", title: "Relationship Map",     desc: "Visual node map of characters and their dynamics.",               hex: "#6C3483", r: 100, g: 30,  b: 150 },
  { id: "captor",        icon: "🎭", title: "Captor Configuration", desc: "Full antagonist profiling — motive, methods, endgame.",           hex: "#3D5A8A", r: 60,  g: 80,  b: 140 },
  { id: "themes",        icon: "◼", title: "Mood Lighting",        desc: "Switch the studio atmosphere: Void, Isolation, Candlelight, Glitch.", hex: "#B7770D", r: 180, g: 120, b: 0 },
  { id: "archive",       icon: "◈", title: "Story Archive",        desc: "Browse, tag, favourite, and export every story you've saved.",    hex: "#2C5F8A", r: 44,  g: 95,  b: 138 },
];

// ─── Daily scenario ───────────────────────────────────────────────────────────
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

function handleUtilClick(id: string, fns: HomepageProps) {
  if (id === "captor")        fns.onCaptorPortal();
  if (id === "scenario")      fns.onScenarioGenerator();
  if (id === "mapper")        fns.onCharacterMapper();
  if (id === "sounding")      fns.onSoundingBoard();
  if (id === "captor-logic")  fns.onCaptorLogic();
  if (id === "interrogation") fns.onInterrogationRoom();
  if (id === "archive")       fns.onStoryArchive();
  if (id === "themes") {
    const btn = document.querySelector("[title='Change theme']") as HTMLButtonElement | null;
    btn?.click();
  }
}

function handlePrimaryClick(id: string, fns: HomepageProps) {
  if (id === "superhero") fns.onSuperheroMode();
  if (id === "celebrity") fns.onCelebrityMode();
  if (id === "custom")    fns.onEnter();
}

// ─── Primary mode card ────────────────────────────────────────────────────────
function ModeCard({ mode, mounted, index, onClick }: {
  mode: typeof PRIMARY_MODES[number];
  mounted: boolean;
  index: number;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${mode.r},${mode.g},${mode.b}`;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1,
        minWidth: "260px",
        position: "relative",
        background: mode.grad,
        border: `1px solid ${hov ? mode.borderHov : mode.border}`,
        borderTop: `3px solid ${hov ? mode.accent : `rgba(${rgb},0.35)`}`,
        borderRadius: "14px",
        padding: "2rem 1.75rem 1.75rem",
        cursor: "pointer",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        transition: "border-color 0.3s ease, box-shadow 0.35s ease, transform 0.25s ease",
        boxShadow: hov ? `0 12px 60px ${mode.glow}, 0 0 0 1px rgba(${rgb},0.08)` : `0 4px 20px rgba(0,0,0,0.4)`,
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        opacity: mounted ? 1 : 0,
        transitionDelay: `${index * 0.1}s`,
      }}
    >
      {/* Particle field */}
      {[...Array(18)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: i % 4 === 0 ? "2px" : "1px",
          height: i % 4 === 0 ? "2px" : "1px",
          borderRadius: "50%",
          background: `rgba(${rgb},${0.15 + (i % 5) * 0.08})`,
          top: `${5 + (i * 37) % 90}%`,
          left: `${2 + (i * 61) % 96}%`,
          pointerEvents: "none",
        }} />
      ))}

      {/* Shimmer sweep on hover */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `linear-gradient(110deg, transparent 25%, rgba(${rgb},0.06) 50%, transparent 75%)`,
        backgroundSize: "200% 100%",
        animation: hov ? "shimmer 2s linear infinite" : "none",
      }} />

      {/* Mode number */}
      <div style={{
        position: "absolute", top: "1.25rem", right: "1.5rem",
        fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "3px",
        color: `rgba(${rgb},${hov ? 0.6 : 0.2})`,
        transition: "color 0.3s",
      }}>
        {mode.num}
      </div>

      {/* Icon */}
      <div style={{
        fontSize: "2.75rem", lineHeight: 1, flexShrink: 0,
        filter: hov
          ? `drop-shadow(0 0 18px rgba(${rgb},0.9)) drop-shadow(0 0 40px rgba(${rgb},0.5))`
          : `drop-shadow(0 0 6px rgba(${rgb},0.4))`,
        transition: "filter 0.35s ease",
        transform: hov ? "scale(1.08)" : "scale(1)",
      }}>
        {mode.icon}
      </div>

      {/* Title block */}
      <div>
        <div style={{ fontSize: "0.52rem", letterSpacing: "4px", color: `rgba(${rgb},${hov ? 0.8 : 0.45})`, fontFamily: "'Cinzel', serif", marginBottom: "0.45rem", textTransform: "uppercase", transition: "color 0.3s" }}>
          {mode.tagline}
        </div>
        <h2 style={{ margin: 0, fontFamily: "'Cinzel', serif", fontSize: "clamp(1.2rem, 2.5vw, 1.65rem)", fontWeight: 900, letterSpacing: "0.06em", lineHeight: 1.1, color: hov ? "#FFFFFF" : "rgba(238,236,255,0.82)", transition: "color 0.3s" }}>
          {mode.title}
        </h2>
      </div>

      {/* Description */}
      <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(200,195,225,0.45)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.7, flex: 1 }}>
        {mode.desc}
      </p>

      {/* Stats */}
      <div style={{ display: "flex", gap: "1.5rem" }}>
        {mode.stats.map(([v, l]) => (
          <div key={l}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1.15rem", fontWeight: 900, color: `rgba(${rgb},${hov ? 1 : 0.7})`, lineHeight: 1, transition: "color 0.3s" }}>{v}</div>
            <div style={{ fontSize: "0.48rem", color: "rgba(200,200,220,0.25)", letterSpacing: "2px", textTransform: "uppercase", marginTop: "2px" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        {mode.features.map((f) => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: `rgba(${rgb},${hov ? 0.8 : 0.3})`, flexShrink: 0, transition: "background 0.3s" }} />
            <span style={{ fontSize: "0.68rem", color: "rgba(200,195,225,0.38)", fontFamily: "'Raleway', sans-serif", letterSpacing: "0.3px" }}>{f}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.75rem 1.25rem",
        background: hov ? `rgba(${rgb},0.14)` : `rgba(${rgb},0.06)`,
        border: `1px solid ${hov ? `rgba(${rgb},0.5)` : `rgba(${rgb},0.15)`}`,
        borderRadius: "8px",
        transition: "all 0.3s ease",
        marginTop: "0.25rem",
      }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase", color: hov ? mode.accentLight : `rgba(${rgb},0.55)`, transition: "color 0.3s", fontWeight: 700 }}>
          {mode.cta}
        </span>
        <span style={{ color: hov ? mode.accentLight : `rgba(${rgb},0.3)`, transition: "color 0.3s", fontSize: "1rem" }}>→</span>
      </div>
    </div>
  );
}

// ─── Utility grid tile ────────────────────────────────────────────────────────
function UtilTile({ tool, onClick }: { tool: typeof UTIL_TOOLS[0]; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const rgb = `${tool.r},${tool.g},${tool.b}`;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? `rgba(${rgb},0.06)` : "rgba(10,6,20,0.6)",
        border: `1px solid ${hov ? `rgba(${rgb},0.35)` : "rgba(255,255,255,0.05)"}`,
        borderLeft: `2px solid ${hov ? tool.hex : "rgba(255,255,255,0.08)"}`,
        borderRadius: "8px", padding: "0.85rem 1rem",
        cursor: "pointer", transition: "all 0.25s ease",
        display: "flex", alignItems: "flex-start", gap: "0.75rem",
      }}
    >
      <span style={{
        fontSize: "1.1rem", flexShrink: 0,
        filter: hov ? `drop-shadow(0 0 8px rgba(${rgb},0.8))` : "none",
        transition: "filter 0.25s",
      }}>{tool.icon}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", fontWeight: 700, color: hov ? "#FFFFFF" : "rgba(220,215,240,0.6)", letterSpacing: "0.04em", transition: "color 0.25s", marginBottom: "0.2rem" }}>
          {tool.title}
        </div>
        <div style={{ fontSize: "0.66rem", color: "rgba(200,195,225,0.3)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.5 }}>
          {tool.desc}
        </div>
      </div>
      <span style={{ fontSize: "0.75rem", color: hov ? `rgba(${rgb},0.8)` : "rgba(255,255,255,0.1)", transition: "all 0.25s", flexShrink: 0, alignSelf: "center" }}>→</span>
    </div>
  );
}

// ─── Homepage ─────────────────────────────────────────────────────────────────
export default function Homepage(props: HomepageProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const { heroine, villain, setting, title: dailyTitle } = getDailyScenario();
  const [dailyHov, setDailyHov] = useState(false);
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "transparent" }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
        @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(0.65); } }
        @keyframes slowFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @media (max-width: 800px) {
          .hp-nav-stats { display: none !important; }
          .mode-grid { flex-direction: column !important; }
          .util-grid { grid-template-columns: 1fr !important; }
          .hp-nav { padding: 0 1rem !important; }
        }
        @media (max-width: 560px) {
          .util-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Ambient glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", left: "15%", width: "700px", height: "600px", background: "radial-gradient(ellipse, rgba(60,0,120,0.09) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", top: "30%", right: "-5%",  width: "500px", height: "500px", background: "radial-gradient(ellipse, rgba(120,60,0,0.07) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", bottom: "0%", left: "35%",  width: "600px", height: "400px", background: "radial-gradient(ellipse, rgba(80,0,0,0.06) 0%, transparent 60%)" }} />
      </div>

      {/* ══ NAV ══ */}
      <nav className="hp-nav" style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2.5rem", height: "58px", flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        backdropFilter: "blur(16px)", background: "rgba(3,0,8,0.85)",
      }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,0,0,0.4) 25%, rgba(184,134,11,0.3) 50%, rgba(139,0,0,0.4) 75%, transparent)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8B0000", boxShadow: "0 0 10px #8B0000", animation: "pulseDot 3s ease-in-out infinite" }} />
          <span className="font-cinzel" style={{ fontSize: "0.95rem", fontWeight: 900, letterSpacing: "4.5px", background: "linear-gradient(135deg, #E8D08A, #C8A830, #A07030)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            SHADOWWEAVE
          </span>
        </div>

        <div className="hp-nav-stats" style={{ display: "flex", gap: "2.25rem", alignItems: "center" }}>
          {[["3", "Story Modes"], ["131+", "Heroines"], ["Venice AI", "Engine"], ["4", "Themes"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div className="font-cinzel" style={{ fontSize: "0.82rem", fontWeight: 900, color: "rgba(212,175,55,0.7)", lineHeight: 1 }}>{v}</div>
              <div className="font-montserrat" style={{ fontSize: "0.42rem", color: "rgba(200,200,220,0.2)", letterSpacing: "2px", textTransform: "uppercase", marginTop: "2px" }}>{l}</div>
            </div>
          ))}
        </div>

        <button
          onClick={props.onStoryArchive}
          style={{ display: "flex", alignItems: "center", gap: "0.45rem", padding: "0.4rem 1rem", background: "rgba(20,5,40,0.9)", border: "1px solid rgba(106,173,228,0.2)", borderRadius: "30px", cursor: "pointer", color: "inherit", transition: "all 0.3s ease" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(106,173,228,0.5)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(106,173,228,0.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(106,173,228,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <span style={{ fontSize: "0.7rem" }}>◈</span>
          <span className="font-cinzel" style={{ fontSize: "0.58rem", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(106,173,228,0.7)", fontWeight: 700 }}>Archive</span>
        </button>
      </nav>

      {/* ══ STUDIO HEADER ══ */}
      <div style={{
        textAlign: "center", padding: "3rem 2rem 2rem",
        opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-16px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
        position: "relative", zIndex: 2,
      }}>
        <div style={{ fontSize: "0.52rem", letterSpacing: "6px", color: "rgba(200,168,75,0.4)", fontFamily: "'Cinzel', serif", marginBottom: "0.65rem" }}>
          PROFESSIONAL DARK NARRATIVE STUDIO
        </div>
        <h1 style={{ margin: "0 0 0.5rem", fontFamily: "'Cinzel', serif", fontSize: "clamp(1.6rem, 5vw, 2.8rem)", fontWeight: 900, letterSpacing: "0.08em", background: "linear-gradient(135deg, #E8D08A 0%, #C8A830 45%, #A07030 70%, #E8D08A 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer 5s linear infinite" }}>
          CHOOSE YOUR MODE
        </h1>
        <p style={{ margin: 0, fontSize: "0.82rem", color: "rgba(200,195,220,0.35)", fontFamily: "'Raleway', sans-serif", letterSpacing: "1px" }}>
          Select a story mode — each one generates a fully uncensored AI-written dark narrative
        </p>
      </div>

      {/* ══ THREE PRIMARY MODE CARDS ══ */}
      <div
        className="mode-grid"
        style={{
          display: "flex", gap: "1.25rem",
          padding: "0 2rem 2rem",
          position: "relative", zIndex: 2,
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.7s 0.1s ease",
        }}
      >
        {PRIMARY_MODES.map((mode, i) => (
          <ModeCard
            key={mode.id}
            mode={mode}
            mounted={mounted}
            index={i}
            onClick={() => handlePrimaryClick(mode.id, props)}
          />
        ))}
      </div>

      {/* ══ DAILY DARK SCENARIO ══ */}
      <div style={{ padding: "0 2rem 2rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, transition: "opacity 0.7s 0.3s ease" }}>
        <div
          onClick={props.onSuperheroMode}
          onMouseEnter={() => setDailyHov(true)}
          onMouseLeave={() => setDailyHov(false)}
          style={{
            padding: "1.25rem 1.75rem",
            background: "rgba(6,2,16,0.92)",
            border: `1px solid ${dailyHov ? "rgba(200,168,75,0.4)" : "rgba(200,168,75,0.1)"}`,
            borderLeft: `3px solid rgba(200,168,75,${dailyHov ? 0.8 : 0.3})`,
            borderRadius: "10px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap",
            position: "relative", overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 30%, rgba(200,168,75,0.02) 50%, transparent 70%)", backgroundSize: "200% 100%", animation: dailyHov ? "shimmer 3s linear infinite" : "none", pointerEvents: "none" }} />
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: "0.48rem", letterSpacing: "4px", color: "rgba(200,168,75,0.45)", fontFamily: "'Cinzel', serif", marginBottom: "0.35rem" }}>DAILY DARK SCENARIO · {today}</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(0.9rem, 2vw, 1.2rem)", fontWeight: 700, color: dailyHov ? "#E8D898" : "rgba(220,205,150,0.7)", transition: "color 0.3s" }}>{dailyTitle}</div>
          </div>
          <div style={{ display: "flex", gap: "1.25rem", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.48rem", color: "rgba(200,168,75,0.35)", letterSpacing: "2px", marginBottom: "0.2rem" }}>HEROINE</div>
              <div style={{ fontSize: "0.78rem", color: heroine.color, fontFamily: "'Cinzel', serif" }}>{heroine.name}</div>
            </div>
            <div style={{ color: "rgba(200,168,75,0.25)", fontSize: "1rem" }}>vs</div>
            <div>
              <div style={{ fontSize: "0.48rem", color: "rgba(200,168,75,0.35)", letterSpacing: "2px", marginBottom: "0.2rem" }}>VILLAIN</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(200,195,220,0.55)", fontFamily: "'Cinzel', serif" }}>{villain}</div>
            </div>
            <div style={{ width: "1px", height: "2rem", background: "rgba(255,255,255,0.06)" }} />
            <div>
              <div style={{ fontSize: "0.48rem", color: "rgba(200,168,75,0.35)", letterSpacing: "2px", marginBottom: "0.2rem" }}>SETTING</div>
              <div style={{ fontSize: "0.72rem", color: "rgba(200,195,220,0.4)", fontFamily: "'Raleway', sans-serif", maxWidth: "200px" }}>{setting}</div>
            </div>
          </div>
          <div style={{ marginLeft: "auto", flexShrink: 0, display: "flex", alignItems: "center", gap: "0.4rem", color: dailyHov ? "rgba(200,168,75,0.8)" : "rgba(200,168,75,0.3)", transition: "color 0.3s", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "1.5px" }}>
            Open in Hero Forge →
          </div>
        </div>
      </div>

      {/* ══ STUDIO UTILITIES ══ */}
      <div style={{ padding: "0 2rem 3rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, transition: "opacity 0.7s 0.4s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.25rem" }}>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(139,0,0,0.3), rgba(184,134,11,0.15) 60%, transparent)" }} />
          <span className="font-montserrat" style={{ fontSize: "0.45rem", letterSpacing: "5px", textTransform: "uppercase", color: "rgba(184,134,11,0.3)", fontWeight: 700, whiteSpace: "nowrap" }}>Studio Utilities</span>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(184,134,11,0.15) 40%, rgba(139,0,0,0.3))" }} />
        </div>

        <div
          className="util-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.65rem" }}
        >
          {UTIL_TOOLS.map((tool) => (
            <UtilTile key={tool.id} tool={tool} onClick={() => handleUtilClick(tool.id, props)} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
        padding: "1.25rem 2rem", borderTop: "1px solid rgba(255,255,255,0.03)",
        opacity: mounted ? 1 : 0, transition: "opacity 0.6s 0.7s ease",
        position: "relative", zIndex: 2,
      }}>
        <span className="font-montserrat" style={{ fontSize: "0.48rem", color: "rgba(200,200,220,0.1)", letterSpacing: "2px", textTransform: "uppercase" }}>For adult dark fiction writers only</span>
        <span className="font-montserrat" style={{ fontSize: "0.48rem", color: "rgba(200,200,220,0.1)", letterSpacing: "2px", textTransform: "uppercase" }}>Venice AI · llama-3.3-70b · Uncensored</span>
      </div>
    </div>
  );
}
