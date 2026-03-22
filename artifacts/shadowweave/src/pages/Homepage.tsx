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

const TOOLS = [
  {
    id: "victim",       num: "01",
    icon: "🫀",
    title: "Victim Profile",
    subtitle: "Character Builder",
    desc: "Build a complete psychological portrait — trauma, fears, breaking points — through 7 deep guided questions.",
    features: ["7 Questions", "AI Story", "Psyche Meters"],
    hex: "#C0392B", light: "#E8A070", r: 160, g: 30, b: 20,
  },
  {
    id: "captor",       num: "02",
    icon: "🎭",
    title: "Captor Configuration",
    subtitle: "Antagonist System",
    desc: "Define the antagonist's full operational profile — motive, methods, and endgame — via 8 configuration questions.",
    features: ["8 Questions", "Operational Profile", "JSON Export"],
    hex: "#3D5A8A", light: "#90B4D8", r: 60, g: 80, b: 140,
  },
  {
    id: "scenario",     num: "03",
    icon: "⚡",
    title: "Scenario Engine",
    subtitle: "Question Generator",
    desc: "Choose motive, control, violence level, and psychology to generate 8 tailored narrative questions instantly.",
    features: ["4 Config Inputs", "Instant Output", "AI Questions"],
    hex: "#1E8449", light: "#52D68A", r: 0, g: 140, b: 60,
  },
  {
    id: "mapper",       num: "04",
    icon: "◎",
    title: "Relationship Map",
    subtitle: "Character Dynamics",
    desc: "Build a visual node map of every character. Draw connections: Hates, Loves, Blackmails, Manipulates.",
    features: ["Drag & Drop", "10 Relation Types", "SVG Export"],
    hex: "#6C3483", light: "#C39BD3", r: 100, g: 30, b: 150,
  },
  {
    id: "themes",       num: "05",
    icon: "◼",
    title: "Mood Lighting",
    subtitle: "Interface Atmosphere",
    desc: "Transform the studio's visual palette — Void darkness, Cold isolation, Candlelight, Static Glitch distress.",
    features: ["4 Live Themes", "Instant Preview", "Persists Session"],
    hex: "#B7770D", light: "#F4D03F", r: 180, g: 120, b: 0,
  },
  {
    id: "sounding",     num: "06",
    icon: "✦",
    title: "Sounding Board",
    subtitle: "AI Co-Writer",
    desc: "Chat with an AI narrative collaborator. Ask questions, get plot twists, break creative blocks in real time.",
    features: ["Streaming AI", "8 Quick Prompts", "Story Context"],
    hex: "#0E8C75", light: "#48C9B0", r: 0, g: 140, b: 120,
  },
  {
    id: "captor-logic", num: "07",
    icon: "◈",
    title: "Captor Logic Sim",
    subtitle: "Behaviour Simulator",
    desc: "Set inviolable rules and goals. The AI acts as a behavioural simulator — actions, risks, psychological effects.",
    features: ["Rules Engine", "Goal Mapping", "Risk Analysis"],
    hex: "#7D3C98", light: "#C39BD3", r: 120, g: 20, b: 160,
  },
  {
    id: "interrogation", num: "08",
    icon: "◉",
    title: "Interrogation Room",
    subtitle: "Dialogue Simulator",
    desc: "The captor questions. You answer as the heroine. The AI escalates each exchange — a live back-and-forth with mounting pressure.",
    features: ["Live Dialogue", "AI Captor", "Streaming Responses"],
    hex: "#8B0000", light: "#FF6060", r: 180, g: 0, b: 0,
  },
  {
    id: "celebrity",     num: "09",
    icon: "★",
    title: "Celebrity Captive",
    subtitle: "Actress Archive Mode",
    desc: "100+ real-world actresses. Build a captor or captor team, set the scene, and generate an uncensored dark thriller starring the star of your choice.",
    features: ["100 Actresses", "Captor Builder", "Scenario Engine"],
    hex: "#7B5E2A", light: "#C8A84B", r: 123, g: 94, b: 42,
  },
  {
    id: "archive",       num: "10",
    icon: "◈",
    title: "Story Archive",
    subtitle: "Narrative Library",
    desc: "Every story you save, collected in one place. Browse, search, tag, favourite, and export as formatted PDF or plain text.",
    features: ["Browse & Search", "Tags & Favourites", "PDF / TXT Export"],
    hex: "#2C5F8A", light: "#6AADE4", r: 44, g: 95, b: 138,
  },
];

function handleClick(id: string, fns: HomepageProps) {
  if (id === "victim")        fns.onEnter();
  if (id === "captor")        fns.onCaptorPortal();
  if (id === "scenario")      fns.onScenarioGenerator();
  if (id === "mapper")        fns.onCharacterMapper();
  if (id === "sounding")      fns.onSoundingBoard();
  if (id === "captor-logic")  fns.onCaptorLogic();
  if (id === "interrogation") fns.onInterrogationRoom();
  if (id === "celebrity")     fns.onCelebrityMode();
  if (id === "archive")       fns.onStoryArchive();
  if (id === "themes") {
    const btn = document.querySelector("[title='Change theme']") as HTMLButtonElement | null;
    btn?.click();
  }
}

// ─── Daily Dark Scenario ──────────────────────────────────────────────────────
const DAILY_HEROINES = [
  { name: "Black Widow",    universe: "MARVEL", color: "#FF6060" },
  { name: "Scarlet Witch",  universe: "MARVEL", color: "#FF6060" },
  { name: "Wonder Woman",   universe: "DC",     color: "#60A0FF" },
  { name: "Zatanna",        universe: "DC",     color: "#60A0FF" },
  { name: "Black Canary",   universe: "CW",     color: "#40E090" },
  { name: "Supergirl",      universe: "CW",     color: "#40E090" },
  { name: "Elsa",           universe: "ANIMATED", color: "#C084FC" },
  { name: "Megara",         universe: "ANIMATED", color: "#C084FC" },
  { name: "Mulan",          universe: "ANIMATED", color: "#C084FC" },
  { name: "Starlight",      universe: "TB",     color: "#FF3D00" },
  { name: "Kimiko",         universe: "TB",     color: "#FF3D00" },
  { name: "Trini Kwan",     universe: "PR",     color: "#FF69B4" },
];

const DAILY_VILLAINS = [
  "The Red Room Director", "Baron Mordo", "Graviton", "HYDRA Commander",
  "Lex Luthor", "The Riddler", "Deathstroke", "Circe",
  "Malcolm Merlyn", "Prometheus", "Damien Darhk",
  "Maleficent", "Ursula", "Hades", "Mother Gothel",
  "Homelander", "Black Noir", "The Deep",
];

const DAILY_SETTINGS = [
  "A subterranean black site — no signals in or out",
  "An abandoned cathedral at midnight",
  "A luxury penthouse with no exits",
  "A classified research vessel mid-ocean",
  "A forest compound deep in winter",
  "A disused Cold War bunker",
  "A remote mountain stronghold above the clouds",
  "A decommissioned satellite station",
  "The ruins of a fallen empire palace",
  "A silent manor surrounded by fog",
];

const TITLE_TEMPLATES = [
  "{villain} Claims {heroine}",
  "The Last Night — {villain} vs {heroine}",
  "{heroine} at Zero Hour",
  "No Escape: {heroine} & {villain}",
  "{villain}'s Trophy",
  "Into the Dark — {heroine} Falls",
  "The Hour of {villain}",
  "{heroine} Undone",
  "Shattered: {heroine} & {villain}",
  "The Reckoning — {heroine}",
];

function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function dailySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function getDailyScenario() {
  const seed = dailySeed();
  const heroine = DAILY_HEROINES[Math.floor(seededRand(seed) * DAILY_HEROINES.length)];
  const villain = DAILY_VILLAINS[Math.floor(seededRand(seed + 3) * DAILY_VILLAINS.length)];
  const setting = DAILY_SETTINGS[Math.floor(seededRand(seed + 7) * DAILY_SETTINGS.length)];
  const template = TITLE_TEMPLATES[Math.floor(seededRand(seed + 11) * TITLE_TEMPLATES.length)];
  const title = template
    .replace("{heroine}", heroine.name)
    .replace("{villain}", villain);
  return { heroine, villain, setting, title };
}

function DailyScenario({ onSuperheroMode }: { onSuperheroMode: () => void }) {
  const { heroine, villain, setting, title } = getDailyScenario();
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const [hov, setHov] = useState(false);

  return (
    <div
      onClick={onSuperheroMode}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        margin: "1.25rem 2.5rem 0",
        padding: "1.5rem 2rem",
        background: "linear-gradient(130deg, rgba(6,0,18,0.96) 0%, rgba(16,4,36,0.94) 100%)",
        border: `1px solid ${hov ? "rgba(200,168,75,0.4)" : "rgba(200,168,75,0.14)"}`,
        borderLeft: `3px solid rgba(200,168,75,${hov ? 0.8 : 0.45})`,
        borderRadius: "10px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: hov ? "0 4px 40px rgba(200,168,75,0.06)" : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 30%, rgba(200,168,75,0.025) 50%, transparent 70%)", backgroundSize: "200% 100%", animation: "shimmer 5s linear infinite", pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", position: "relative", zIndex: 1, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "260px" }}>
          <div style={{ fontSize: "0.55rem", letterSpacing: "4px", color: "rgba(200,168,75,0.5)", fontFamily: "'Cinzel', serif", marginBottom: "0.5rem", textTransform: "uppercase" }}>
            Daily Dark Scenario · {today}
          </div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1rem, 2.5vw, 1.4rem)", fontWeight: 700, color: "#E8D898", marginBottom: "0.75rem", letterSpacing: "0.03em", lineHeight: 1.3 }}>
            {title}
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", color: heroine.color, fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>{heroine.name}</span>
            <span style={{ color: "rgba(200,168,75,0.3)", fontSize: "0.7rem" }}>vs</span>
            <span style={{ fontSize: "0.72rem", color: "rgba(200,200,220,0.55)", fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>{villain}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flexShrink: 0 }}>
          <div style={{ fontSize: "0.65rem", color: "rgba(200,168,75,0.45)", letterSpacing: "0.5px", fontFamily: "'Cinzel', serif" }}>SETTING</div>
          <div style={{ fontSize: "0.78rem", color: "rgba(200,195,220,0.5)", fontFamily: "'Raleway', sans-serif", maxWidth: "220px", lineHeight: 1.5 }}>{setting}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.25rem", color: hov ? "rgba(200,168,75,0.8)" : "rgba(200,168,75,0.4)", transition: "color 0.2s", fontFamily: "'Cinzel', serif", fontSize: "0.68rem", letterSpacing: "1.5px" }}>
            Open in Hero Forge →
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Homepage(props: HomepageProps) {
  const { onSuperheroMode } = props;
  const [hov, setHov] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "transparent" }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes pulseDot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.4; transform:scale(0.65); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes scanline {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .tool-row {
          transition:
            background 0.38s cubic-bezier(0.4,0,0.2,1),
            border-left-color 0.28s ease,
            padding-left 0.3s ease;
        }
        .tool-row:hover { background: var(--row-bg) !important; border-left-color: var(--row-accent) !important; }
        .row-title      { transition: color 0.3s ease, letter-spacing 0.35s ease; }
        .row-arrow      { transition: transform 0.3s ease, color 0.3s ease; }
        .row-icon       { transition: filter 0.3s ease, transform 0.35s ease; }
        .row-desc       { transition: opacity 0.35s ease, max-height 0.4s cubic-bezier(0.4,0,0.2,1); overflow: hidden; }
        @media (max-width: 700px) {
          .hp-nav { padding: 0 1rem !important; }
          .hp-nav-stats { display: none !important; }
          .hp-banner { flex-direction: column !important; gap: 0.75rem !important; padding: 1.25rem !important; margin: 0.75rem !important; }
          .hp-banner-cta { display: none !important; }
          .tool-row { padding: 1rem 1.25rem !important; }
          .row-features { display: none !important; }
          .row-num { display: none !important; }
          .row-desc { max-height: 3rem !important; opacity: 1 !important; margin-top: 0.35rem !important; }
        }
      `}</style>

      {/* Ambient glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-5%", left: "20%", width: "800px", height: "600px", background: "radial-gradient(ellipse, rgba(80,0,0,0.09) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: "0%", right: "10%", width: "600px", height: "500px", background: "radial-gradient(ellipse, rgba(40,0,70,0.07) 0%, transparent 65%)" }} />
      </div>

      {/* ══════════════ NAV ══════════════ */}
      <nav className="hp-nav" style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2.5rem", height: "58px", flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        backdropFilter: "blur(16px)", background: "rgba(3,0,8,0.8)",
      }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,0,0,0.45) 25%, rgba(184,134,11,0.3) 50%, rgba(139,0,0,0.45) 75%, transparent)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8B0000", boxShadow: "0 0 10px #8B0000", animation: "pulseDot 3s ease-in-out infinite" }} />
          <span className="font-cinzel" style={{ fontSize: "0.95rem", fontWeight: 900, letterSpacing: "4.5px", background: "linear-gradient(135deg, #E8D08A, #C8A830, #A07030)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            SHADOWWEAVE
          </span>
        </div>

        <div className="hp-nav-stats" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {[["10", "Tools"], ["118+", "Heroines"], ["Venice AI", "Powered by"], ["4", "Themes"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div className="font-cinzel" style={{ fontSize: "0.8rem", fontWeight: 900, color: "rgba(212,175,55,0.7)", lineHeight: 1 }}>{v}</div>
              <div className="font-montserrat" style={{ fontSize: "0.42rem", color: "rgba(200,200,220,0.2)", letterSpacing: "2px", textTransform: "uppercase", marginTop: "2px" }}>{l}</div>
            </div>
          ))}
        </div>

        <button
          onClick={onSuperheroMode}
          style={{ display: "flex", alignItems: "center", gap: "0.45rem", padding: "0.4rem 1rem", background: "rgba(20,5,40,0.9)", border: "1px solid rgba(255,184,0,0.2)", borderRadius: "30px", cursor: "pointer", color: "inherit", transition: "all 0.3s ease" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,184,0,0.5)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,184,0,0.12)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,184,0,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <span style={{ fontSize: "0.75rem" }}>⚡</span>
          <span className="font-cinzel" style={{ fontSize: "0.58rem", letterSpacing: "2px", textTransform: "uppercase", background: "linear-gradient(90deg, #FFB800, #FF4080, #60A0FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontWeight: 700 }}>Hero Mode</span>
        </button>
      </nav>

      {/* ══════════════ HEROINE FORGE BANNER ══════════════ */}
      <div
        className="hp-banner"
        onClick={onSuperheroMode}
        style={{
          position: "relative", zIndex: 2,
          margin: "1.5rem 2.5rem 0",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "2rem", padding: "1.75rem 2.5rem",
          background: "linear-gradient(130deg, rgba(18,4,48,0.97) 0%, rgba(36,0,72,0.93) 50%, rgba(0,16,52,0.93) 100%)",
          border: "1px solid rgba(255,184,0,0.15)", borderRadius: "14px", cursor: "pointer",
          overflow: "hidden",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(-12px)",
          transition: "opacity 0.5s ease, transform 0.5s ease, border-color 0.3s, box-shadow 0.3s",
          boxShadow: "0 4px 40px rgba(80,0,180,0.1)",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,184,0,0.38)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 60px rgba(80,0,180,0.2)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,184,0,0.15)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 40px rgba(80,0,180,0.1)"; }}
      >
        {/* Shimmer sweep */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 25%, rgba(255,184,0,0.035) 50%, transparent 75%)", backgroundSize: "200% 100%", animation: "shimmer 6s linear infinite", pointerEvents: "none" }} />
        {/* Scan line */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "30%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.015), transparent)", animation: "scanline 8s linear infinite", pointerEvents: "none" }} />
        {/* Stars */}
        {[...Array(16)].map((_, i) => (
          <div key={i} style={{ position: "absolute", width: i % 3 === 0 ? "2px" : "1px", height: i % 3 === 0 ? "2px" : "1px", borderRadius: "50%", background: `rgba(255,${180 + (i * 13) % 75},${40 + (i * 29) % 60},${0.25 + (i % 4) * 0.12})`, top: `${8 + (i * 41) % 84}%`, left: `${3 + (i * 67) % 94}%`, pointerEvents: "none" }} />
        ))}

        <div style={{ display: "flex", alignItems: "center", gap: "1.75rem", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "3rem", lineHeight: 1, filter: "drop-shadow(0 0 20px rgba(255,184,0,0.7))", flexShrink: 0 }}>⚡</div>
          <div>
            <div className="font-montserrat" style={{ fontSize: "0.48rem", letterSpacing: "4px", textTransform: "uppercase", color: "rgba(255,184,0,0.55)", marginBottom: "0.35rem", fontWeight: 700 }}>Superhero Mode · Featured</div>
            <div className="font-cinzel" style={{ fontSize: "clamp(1.2rem, 2.8vw, 1.9rem)", fontWeight: 900, letterSpacing: "0.06em", background: "linear-gradient(90deg, #FFD700 0%, #FF6090 40%, #60A0FF 70%, #FFD700 100%)", backgroundSize: "300% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer 4s linear infinite" }}>
              HEROINE FORGE
            </div>
            <div style={{ fontSize: "0.75rem", color: "rgba(200,195,230,0.42)", fontFamily: "'Raleway', sans-serif", marginTop: "0.25rem" }}>Choose from 118+ heroines · select villain · forge a multi-chapter story</div>
          </div>
        </div>

        <div className="hp-banner-cta" style={{ display: "flex", alignItems: "center", gap: "2rem", position: "relative", zIndex: 1, flexShrink: 0 }}>
          {[["118+", "Heroines"], ["53", "Villains"], ["AI", "Chapters"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div className="font-cinzel" style={{ fontSize: "1.25rem", fontWeight: 900, color: "rgba(255,210,60,0.82)", lineHeight: 1 }}>{v}</div>
              <div className="font-montserrat" style={{ fontSize: "0.45rem", color: "rgba(200,200,220,0.22)", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: "3px" }}>{l}</div>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.5rem", background: "rgba(255,184,0,0.1)", border: "1px solid rgba(255,184,0,0.3)", borderRadius: "8px" }}>
            <span className="font-cinzel" style={{ fontSize: "0.7rem", letterSpacing: "2.5px", color: "#FFD060", textTransform: "uppercase", fontWeight: 700 }}>Launch</span>
            <span style={{ color: "#FFD060" }}>→</span>
          </div>
        </div>
      </div>

      {/* ══════════════ DAILY DARK SCENARIO ══════════════ */}
      <DailyScenario onSuperheroMode={onSuperheroMode} />

      {/* ══════════════ EDITORIAL TOOL LIST ══════════════ */}
      <main style={{ flex: 1, position: "relative", zIndex: 2, paddingBottom: "3rem" }}>

        {/* Section label */}
        <div style={{
          display: "flex", alignItems: "center", gap: "1.5rem",
          padding: "2.25rem 2.5rem 1.5rem",
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.6s 0.15s ease",
        }}>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(139,0,0,0.4), rgba(184,134,11,0.2) 60%, transparent)" }} />
          <span className="font-montserrat" style={{ fontSize: "0.48rem", letterSpacing: "5px", textTransform: "uppercase", color: "rgba(184,134,11,0.38)", fontWeight: 700, whiteSpace: "nowrap" }}>
            Narrative Modules
          </span>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(184,134,11,0.2) 40%, rgba(139,0,0,0.4))" }} />
        </div>

        {/* Tool rows */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          {TOOLS.map((tool, i) => (
            <ToolRow
              key={tool.id}
              tool={tool}
              isHov={hov === tool.id}
              mounted={mounted}
              index={i}
              onEnter={() => setHov(tool.id)}
              onLeave={() => setHov(null)}
              onClick={() => handleClick(tool.id, props)}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
          padding: "1.75rem 2.5rem 0",
          borderTop: "1px solid rgba(255,255,255,0.03)",
          marginTop: "0.5rem",
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.6s 0.8s ease",
        }}>
          <span className="font-montserrat" style={{ fontSize: "0.5rem", color: "rgba(200,200,220,0.12)", letterSpacing: "2px", textTransform: "uppercase" }}>For adult dark fiction writers only</span>
          <span className="font-montserrat" style={{ fontSize: "0.5rem", color: "rgba(200,200,220,0.12)", letterSpacing: "2px", textTransform: "uppercase" }}>Venice AI · llama-3.3-70b</span>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOOL ROW  — editorial list item
// ─────────────────────────────────────────────────────────────────────────────
function ToolRow({ tool, isHov, mounted, index, onEnter, onLeave, onClick }: {
  tool: typeof TOOLS[0];
  isHov: boolean;
  mounted: boolean;
  index: number;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const rgb = `${tool.r},${tool.g},${tool.b}`;

  return (
    <div
      role="button"
      tabIndex={0}
      className="tool-row"
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "1.5rem 2.5rem",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        borderLeft: `3px solid ${isHov ? tool.hex : "transparent"}`,
        background: isHov ? `rgba(${rgb},0.045)` : "transparent",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        gap: "1.5rem",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.5s ${0.18 + index * 0.07}s ease, transform 0.5s ${0.18 + index * 0.07}s ease, background 0.35s ease, border-left-color 0.28s ease`,
      } as React.CSSProperties}
    >
      {/* Ghost watermark number */}
      <div className="font-cinzel" style={{
        position: "absolute", right: "5rem", top: "50%", transform: "translateY(-50%)",
        fontSize: "9rem", fontWeight: 900, lineHeight: 1,
        color: `rgba(${rgb},${isHov ? 0.07 : 0.025})`,
        userSelect: "none", pointerEvents: "none", letterSpacing: "-0.05em",
        transition: "color 0.4s ease",
      }}>
        {tool.num}
      </div>

      {/* Scan sweep on hover */}
      {isHov && (
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: `linear-gradient(90deg, transparent 0%, rgba(${rgb},0.04) 50%, transparent 100%)`, pointerEvents: "none", animation: "scanline 1.8s ease-in-out" }} />
      )}

      {/* Ordinal */}
      <div className="row-num font-cinzel" style={{
        width: "2.5rem", flexShrink: 0,
        fontSize: "0.5rem", letterSpacing: "3px",
        color: isHov ? tool.hex : "rgba(255,255,255,0.12)",
        fontWeight: 700, transition: "color 0.3s ease",
        textAlign: "right",
      }}>
        {tool.num}
      </div>

      {/* Icon */}
      <div className="row-icon" style={{
        fontSize: "1.35rem", flexShrink: 0, lineHeight: 1,
        filter: isHov ? `drop-shadow(0 0 12px rgba(${rgb},0.9))` : `drop-shadow(0 0 2px rgba(${rgb},0.25))`,
        transform: isHov ? "scale(1.15)" : "scale(1)",
      }}>
        {tool.icon}
      </div>

      {/* Title + description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "1.5rem", flexWrap: "wrap" }}>
          <h2 className="row-title font-cinzel" style={{
            margin: 0, fontSize: "clamp(1rem, 2vw, 1.4rem)", fontWeight: 900,
            letterSpacing: "0.04em", lineHeight: 1.1,
            color: isHov ? "#FFFFFF" : "rgba(238,236,255,0.7)",
          }}>
            {tool.title}
          </h2>
          <span className="font-montserrat" style={{
            fontSize: "0.48rem", letterSpacing: "2.5px", textTransform: "uppercase",
            color: isHov ? tool.hex : "rgba(200,200,220,0.2)",
            fontWeight: 700, flexShrink: 0,
            transition: "color 0.3s ease",
          }}>
            {tool.subtitle}
          </span>
        </div>

        {/* Description — fades in on hover */}
        <div className="row-desc" style={{
          fontSize: "0.78rem", color: "rgba(200,195,230,0.48)",
          fontFamily: "'Raleway', sans-serif", lineHeight: 1.65,
          marginTop: isHov ? "0.45rem" : 0,
          maxHeight: isHov ? "3rem" : 0,
          opacity: isHov ? 1 : 0,
        }}>
          {tool.desc}
        </div>
      </div>

      {/* Feature tags */}
      <div className="row-features" style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
        {tool.features.map((f) => (
          <span key={f} style={{
            padding: "0.2rem 0.55rem",
            background: `rgba(${rgb},${isHov ? 0.14 : 0.04})`,
            border: `1px solid rgba(${rgb},${isHov ? 0.38 : 0.12})`,
            borderRadius: "3px",
            fontSize: "0.52rem", letterSpacing: "0.5px",
            color: isHov ? tool.light : "rgba(200,200,220,0.2)",
            fontFamily: "'Montserrat', sans-serif",
            transition: "all 0.3s ease",
            whiteSpace: "nowrap",
          }}>
            {f}
          </span>
        ))}
      </div>

      {/* Arrow */}
      <div className="row-arrow" style={{
        fontSize: "1.05rem", flexShrink: 0,
        color: isHov ? tool.light : "rgba(255,255,255,0.12)",
        transform: isHov ? "translateX(6px)" : "translateX(0)",
      }}>
        →
      </div>
    </div>
  );
}
