import { useState, useEffect } from "react";
import StoryDice from "../components/StoryDice";
import { getStreak } from "../lib/streak";
import { getUnlockCount, getTotalXP } from "../lib/achievements";
import { getWritingActivitySet, buildActivitySlots } from "../lib/activityMap";
import { useIsMobile } from "../hooks/useIsMobile";
import { getArchive } from "../lib/archive";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

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
  onHeroAuction: () => void;
  onTrophyDisplay: () => void;
  onObedienceTraining: () => void;
  onShowcase: () => void;
  onPublicProperty: () => void;
  onBettingPool: () => void;
  onVillainTeamUp: () => void;
  onChainOfCustody: () => void;
  onLongGame: () => void;
  onDarkMirror: () => void;
  onArenaMode: () => void;
  onTheHandler: () => void;
  onSurpriseMe: () => void;
  onStoryArcs: () => void;
  onHeroineDossier: () => void;
  onVillainBuilder: () => void;
  onRelationshipMap: () => void;
  onAchievements: () => void;
  onTimeLoop: () => void;
  onDreamSequence: () => void;
  onSequelGenerator: () => void;
  onStoryContinuation: () => void;
}

const DAILY_HEROINES = [
  { name: "Black Widow", color: "#F87171" }, { name: "Scarlet Witch", color: "#F87171" },
  { name: "Wonder Woman", color: "#60A5FA" }, { name: "Zatanna", color: "#60A5FA" },
  { name: "Black Canary", color: "#34D399" }, { name: "Supergirl", color: "#34D399" },
  { name: "Elsa", color: "#C084FC" }, { name: "Megara", color: "#C084FC" },
  { name: "Mulan", color: "#C084FC" }, { name: "Starlight", color: "#FB923C" },
  { name: "Kimiko", color: "#FB923C" }, { name: "Pocahontas", color: "#C084FC" },
];
const DAILY_VILLAINS = [
  "The Red Room Director", "Baron Mordo", "HYDRA Commander", "Lex Luthor", "Deathstroke", "Circe",
  "Malcolm Merlyn", "Damien Darhk", "Maleficent", "Ursula", "Hades", "Homelander", "Black Noir",
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
  "{villain} Claims {heroine}", "The Last Night — {villain} vs {heroine}",
  "{heroine} at Zero Hour", "No Escape: {heroine} & {villain}",
  "{villain}'s Trophy", "Into the Dark — {heroine} Falls",
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

// ── HERO CARD (the three flagship modes) ──────────────────────────────────────
function HeroCard({
  title, desc, badge, tag, accent, r, g, b, onClick, gradient, stat, imgSrc,
}: {
  title: string; desc: string; badge: string; tag: string; accent: string; stat: string;
  r: number; g: number; b: number; onClick: () => void; gradient: string; imgSrc?: string;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${r},${g},${b}`;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", cursor: "pointer", borderRadius: "20px", overflow: "hidden",
        flex: "1 1 0", minWidth: 0, height: "clamp(380px, 46vh, 520px)",
        border: `1px solid rgba(${rgb},${hov ? 0.72 : 0.18})`,
        transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)",
        boxShadow: hov
          ? `0 0 0 1px rgba(${rgb},0.22), 0 32px 100px rgba(${rgb},0.42), 0 60px 120px rgba(0,0,0,0.65)`
          : `0 8px 40px rgba(0,0,0,0.65), 0 0 0 1px rgba(${rgb},0.06)`,
        transform: hov ? "translateY(-10px) scale(1.018)" : "none",
      }}
    >
      {/* AI-generated background image */}
      {imgSrc && (
        <img
          src={imgSrc}
          alt=""
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center top",
            opacity: hov ? 0.55 : 0.38,
            transition: "opacity 0.5s",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Background gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: gradient,
        transition: "opacity 0.5s",
        opacity: hov ? 0.72 : 0.85,
      }} />

      {/* Noise texture overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E\")",
        backgroundSize: "180px",
        opacity: 0.55, pointerEvents: "none",
      }} />

      {/* Top accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: hov
          ? `linear-gradient(90deg, transparent 0%, rgba(${rgb},1) 30%, rgba(${rgb},1) 70%, transparent 100%)`
          : `linear-gradient(90deg, transparent, rgba(${rgb},0.45) 50%, transparent)`,
        boxShadow: hov ? `0 0 30px rgba(${rgb},0.9), 0 0 80px rgba(${rgb},0.3)` : `0 0 8px rgba(${rgb},0.2)`,
        transition: "all 0.4s",
      }} />

      {/* Bottom edge glow on hover */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "2px",
        background: hov ? `linear-gradient(90deg, transparent, rgba(${rgb},0.5) 50%, transparent)` : "none",
        transition: "all 0.4s",
      }} />

      {/* Top-left: Venice AI badge */}
      <div style={{
        position: "absolute", top: "1rem", left: "1rem", zIndex: 4,
        display: "flex", alignItems: "center", gap: "0.4rem",
        padding: "3px 9px", borderRadius: "20px",
        background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(16px)",
      }}>
        <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px rgba(34,197,94,0.9)", animation: "pulseDot 2s ease-in-out infinite" }} />
        <span style={{ fontSize: "0.32rem", letterSpacing: "2.5px", color: "rgba(100,255,150,0.72)", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>Venice AI</span>
      </div>

      {/* Top-right: Uncensored badge */}
      <div style={{
        position: "absolute", top: "1rem", right: "1rem", zIndex: 4,
        padding: "3px 9px", borderRadius: "5px",
        background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.5)",
        backdropFilter: "blur(12px)",
        boxShadow: hov ? "0 0 18px rgba(239,68,68,0.35)" : "none",
        transition: "box-shadow 0.4s",
      }}>
        <span style={{ fontSize: "0.31rem", letterSpacing: "3px", color: "#F87171", fontFamily: "'Montserrat', sans-serif", fontWeight: 900, textTransform: "uppercase" }}>◉ UNCENSORED</span>
      </div>

      {/* Scan-line on hover */}
      {hov && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3,
          background: `linear-gradient(to bottom, transparent 0%, rgba(${rgb},0.1) 46%, rgba(255,255,255,0.06) 50%, rgba(${rgb},0.1) 54%, transparent 100%)`,
          animation: "scanReveal 0.7s ease forwards",
        }} />
      )}

      {/* Bottom dark veil */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: "75%",
        background: `linear-gradient(to top, rgba(2,0,8,${hov ? 0.97 : 0.88}) 0%, rgba(2,0,8,${hov ? 0.75 : 0.55}) 40%, transparent 100%)`,
        transition: "all 0.5s",
      }} />

      {/* Bottom content */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.8rem 1.6rem 1.5rem", zIndex: 5 }}>
        {/* Badge pill */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.7rem",
          padding: "4px 11px", borderRadius: "22px",
          background: `rgba(${rgb},0.16)`, border: `1px solid rgba(${rgb},0.42)`,
          backdropFilter: "blur(14px)",
        }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: accent, boxShadow: `0 0 10px rgba(${rgb},1)`, animation: "pulseDot 2.5s ease-in-out infinite" }} />
          <span style={{ fontSize: "0.34rem", letterSpacing: "2.5px", color: accent, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>{badge}</span>
          <span style={{ width: "1px", height: "10px", background: `rgba(${rgb},0.3)` }} />
          <span style={{ fontSize: "0.3rem", letterSpacing: "1px", color: `rgba(${rgb},0.55)`, fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>{stat}</span>
        </div>

        {/* Tag */}
        <div style={{ fontSize: "0.33rem", letterSpacing: "4px", color: `rgba(${rgb},0.55)`, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.45rem" }}>{tag}</div>

        {/* Title */}
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: hov ? "2rem" : "1.55rem",
          fontWeight: 900, color: "#fff",
          letterSpacing: "0.08em", lineHeight: 1.0,
          marginBottom: "0.6rem",
          textShadow: hov
            ? `0 0 60px rgba(${rgb},0.75), 0 0 120px rgba(${rgb},0.3), 0 2px 20px rgba(0,0,0,1)`
            : "0 2px 14px rgba(0,0,0,0.95)",
          transition: "all 0.45s cubic-bezier(0.22,1,0.36,1)",
        }}>{title}</div>

        {/* Desc — reveals on hover */}
        <div style={{
          fontSize: "0.64rem", color: "rgba(215,210,245,0.72)",
          fontFamily: "'Raleway', sans-serif", lineHeight: 1.65,
          maxHeight: hov ? "72px" : "0px",
          opacity: hov ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.45s ease, opacity 0.38s ease",
          marginBottom: hov ? "0.95rem" : "0",
        }}>{desc}</div>

        {/* CTA */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: hov ? "0.75rem" : "0",
          borderTop: `1px solid rgba(${rgb},${hov ? 0.28 : 0})`,
          opacity: hov ? 1 : 0,
          transform: hov ? "translateY(0)" : "translateY(8px)",
          transition: "all 0.4s ease",
        }}>
          <span style={{
            fontFamily: "'Cinzel', serif", fontSize: "0.56rem", letterSpacing: "4px",
            color: accent, fontWeight: 900, textTransform: "uppercase",
            textShadow: `0 0 24px rgba(${rgb},0.9)`,
          }}>Enter the Dark →</span>
          <div style={{ display: "flex", gap: "5px" }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: `rgba(${rgb},${1.1 - i * 0.32})`, boxShadow: `0 0 12px rgba(${rgb},0.85)` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── COMPACT SUB-MODE ROW ───────────────────────────────────────────────────────
function CompactMode({ icon, title, badge, accent, r, g, b, onClick }: {
  icon: string; title: string; badge: string; accent: string;
  r: number; g: number; b: number; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${r},${g},${b}`;
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: "0.7rem",
        padding: "0.65rem 0.85rem",
        background: hov ? `rgba(${rgb},0.1)` : "rgba(4,1,12,0.72)",
        border: `1px solid ${hov ? `rgba(${rgb},0.45)` : `rgba(${rgb},0.08)`}`,
        borderRadius: "12px", cursor: "pointer",
        transition: "all 0.24s cubic-bezier(0.22,1,0.36,1)",
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? `0 6px 22px rgba(${rgb},0.2)` : "none",
        backdropFilter: "blur(14px)", position: "relative", overflow: "hidden",
      }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "2px", background: `linear-gradient(to bottom, transparent, rgba(${rgb},${hov ? 0.75 : 0.1}) 40%, rgba(${rgb},${hov ? 0.75 : 0.1}) 60%, transparent)`, transition: "all 0.24s" }} />
      <div style={{
        width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
        background: hov ? `rgba(${rgb},0.2)` : `rgba(${rgb},0.06)`,
        border: `1px solid rgba(${rgb},${hov ? 0.4 : 0.1})`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem",
        filter: hov ? `drop-shadow(0 0 7px rgba(${rgb},0.85))` : "none",
        transition: "all 0.22s",
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", fontWeight: 700, color: hov ? "#fff" : "rgba(210,205,248,0.65)", letterSpacing: "0.03em", transition: "color 0.2s", textShadow: hov ? `0 0 18px rgba(${rgb},0.65)` : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        <div style={{ fontSize: "0.3rem", letterSpacing: "2px", color: hov ? `rgba(${rgb},0.65)` : `rgba(${rgb},0.25)`, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "uppercase", marginTop: "2px", transition: "color 0.2s" }}>{badge}</div>
      </div>
      <span style={{ fontSize: "0.5rem", color: hov ? `rgba(${rgb},0.85)` : `rgba(${rgb},0.16)`, transition: "color 0.2s", flexShrink: 0 }}>→</span>
    </div>
  );
}

// ── HOMEPAGE ──────────────────────────────────────────────────────────────────
export default function Homepage(props: HomepageProps) {
  const isMobile = useIsMobile(768);
  const [mounted, setMounted] = useState(false);
  const [showDice, setShowDice] = useState(false);
  const [showAllModes, setShowAllModes] = useState(false);
  const [clock, setClock] = useState("");
  const [streak] = useState(() => getStreak());
  const [achCount] = useState(() => getUnlockCount());
  const [achXP] = useState(() => getTotalXP());
  const [activitySlots] = useState(() => buildActivitySlots(91));
  const [activitySet] = useState(() => getWritingActivitySet(91));
  const [archiveStats] = useState(() => {
    const archive = getArchive();
    const totalWords = archive.reduce((sum, s) => sum + s.wordCount, 0);
    const uniqueHeroines = new Set(archive.flatMap((s) => s.characters)).size;
    const modesTried = new Set(archive.map((s) => s.tool)).size;
    return { total: archive.length, totalWords, uniqueHeroines, modesTried };
  });

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);
  useEffect(() => {
    function tick() {
      const now = new Date();
      const midnight = new Date(now); midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setClock(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  const { heroine, villain, setting, title: dailyTitle } = getDailyScenario();
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const specialtyModes = [
    { icon: "🔦", title: "INTERROGATION ROOM", badge: "Psych · High Tension", r: 248, g: 113, b: 113, accent: "#F87171", onClick: props.onInterrogationRoom },
    { icon: "🌀", title: "MIND BREAK", badge: "5 Phases · Deep Psych", r: 192, g: 132, b: 252, accent: "#C084FC", onClick: props.onMindBreak },
    { icon: "⛓", title: "DUAL CAPTURE", badge: "Duo · Shared Cell", r: 52, g: 211, b: 153, accent: "#34D399", onClick: props.onDualCapture },
    { icon: "🕸", title: "RESCUE GONE WRONG", badge: "Trap · Ambush", r: 251, g: 146, b: 60, accent: "#FB923C", onClick: props.onRescueGoneWrong },
    { icon: "⚡", title: "POWER DRAIN", badge: "Meter · Drain Arc", r: 96, g: 165, b: 250, accent: "#60A5FA", onClick: props.onPowerDrain },
    { icon: "🗡", title: "MASS CAPTURE", badge: "Group · 3–5 Heroines", r: 248, g: 113, b: 113, accent: "#F87171", onClick: props.onMassCapture },
    { icon: "🌑", title: "CORRUPTION ARC", badge: "7 Chapters · Arc", r: 244, g: 114, b: 182, accent: "#F472B6", onClick: props.onCorruptionArc },
    { icon: "📋", title: "OBEDIENCE TRAINING", badge: "Session · Tracked", r: 45, g: 212, b: 191, accent: "#2DD4BF", onClick: props.onObedienceTraining },
    { icon: "🤝", title: "VILLAIN TEAM-UP", badge: "Duo Villain · Conflict", r: 248, g: 113, b: 113, accent: "#F87171", onClick: props.onVillainTeamUp },
    { icon: "🔗", title: "CHAIN OF CUSTODY", badge: "Transfer · Multi-Arc", r: 96, g: 165, b: 250, accent: "#60A5FA", onClick: props.onChainOfCustody },
    { icon: "⏳", title: "THE LONG GAME", badge: "Long Burn · Chapters", r: 168, g: 85, b: 247, accent: "#C084FC", onClick: props.onLongGame },
    { icon: "🪞", title: "DARK MIRROR", badge: "Duality · Psych", r: 232, g: 121, b: 249, accent: "#E879F9", onClick: props.onDarkMirror },
    { icon: "🏛", title: "ARENA MODE", badge: "Combat · Versus", r: 239, g: 68, b: 68, accent: "#EF4444", onClick: props.onArenaMode },
    { icon: "🕵", title: "THE HANDLER", badge: "Covert · Intimate", r: 252, g: 163, b: 17, accent: "#FCA311", onClick: props.onTheHandler },
    { icon: "⚖", title: "HERO AUCTION", badge: "Bid · Live Auction", r: 252, g: 163, b: 17, accent: "#FCA311", onClick: props.onHeroAuction },
    { icon: "👁", title: "TROPHY DISPLAY", badge: "Display · Public", r: 239, g: 68, b: 68, accent: "#EF4444", onClick: props.onTrophyDisplay },
    { icon: "🎭", title: "THE SHOWCASE", badge: "Staged · Audience", r: 232, g: 121, b: 249, accent: "#E879F9", onClick: props.onShowcase },
    { icon: "🔓", title: "PUBLIC PROPERTY", badge: "Exposed · Open Access", r: 251, g: 191, b: 36, accent: "#FBBF24", onClick: props.onPublicProperty },
    { icon: "🎲", title: "BETTING POOL", badge: "Wager · Live Odds", r: 52, g: 211, b: 153, accent: "#34D399", onClick: props.onBettingPool },
    { icon: "⟳", title: "TIME LOOP", badge: "Loop · Villain Knows All", r: 56, g: 189, b: 248, accent: "#38BDF8", onClick: props.onTimeLoop },
    { icon: "◈", title: "DREAM SEQUENCE", badge: "5 Depths · Nightmare", r: 167, g: 139, b: 250, accent: "#A78BFA", onClick: props.onDreamSequence },
    { icon: "⟴", title: "SEQUEL GENERATOR", badge: "Archive · New Chapter", r: 245, g: 158, b: 11, accent: "#F59E0B", onClick: props.onSequelGenerator },
    { icon: "▶", title: "STORY CONTINUATION", badge: "Continue Any Story", r: 52, g: 211, b: 153, accent: "#34D399", onClick: props.onStoryContinuation },
  ];

  const studioTools = [
    { icon: "🏰", title: "CAPTOR PORTAL", badge: "Customise · Build", r: 248, g: 113, b: 113, accent: "#F87171", onClick: props.onCaptorPortal },
    { icon: "🗺", title: "CHARACTER MAPPER", badge: "Visualise · Network", r: 96, g: 165, b: 250, accent: "#60A5FA", onClick: props.onCharacterMapper },
    { icon: "💬", title: "SOUNDING BOARD", badge: "AI Partner · Brainstorm", r: 192, g: 132, b: 252, accent: "#C084FC", onClick: props.onSoundingBoard },
    { icon: "⚙", title: "CAPTOR LOGIC", badge: "Psych Profile · Deep", r: 251, g: 191, b: 36, accent: "#FBBF24", onClick: props.onCaptorLogic },
    { icon: "📚", title: "STORY ARCS", badge: "Arcs · Structured", r: 232, g: 121, b: 249, accent: "#E879F9", onClick: props.onStoryArcs },
    { icon: "📁", title: "HEROINE DOSSIER", badge: "210+ Profiles", r: 248, g: 113, b: 113, accent: "#F87171", onClick: props.onHeroineDossier },
    { icon: "🔮", title: "VILLAIN BUILDER", badge: "Custom · Original", r: 96, g: 165, b: 250, accent: "#60A5FA", onClick: props.onVillainBuilder },
    { icon: "🕸", title: "RELATIONSHIP MAP", badge: "Network · Web", r: 52, g: 211, b: 153, accent: "#34D399", onClick: props.onRelationshipMap },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "transparent" }}>
      {showDice && <StoryDice onClose={() => setShowDice(false)} />}

      <style>{`
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(0.55);} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
        @keyframes hdrShimmer { 0%{background-position:0% center;}100%{background-position:200% center;} }
        @keyframes floatOrb { 0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-28px) scale(1.04);} }
        @keyframes floatOrb2 { 0%,100%{transform:translateY(0);}50%{transform:translateY(20px);} }
        @keyframes scanReveal { 0%{transform:translateY(110%);opacity:0;}30%{opacity:1;}100%{transform:translateY(-110%);opacity:0;} }
        @keyframes shimmer { 0%{transform:translateX(-100%);opacity:0;}25%{opacity:1;}100%{transform:translateX(100%);opacity:0;} }
        @keyframes borderGlow { 0%,100%{opacity:0.4;}50%{opacity:1;} }
        @keyframes surpriseGlow { 0%,100%{box-shadow:0 0 28px rgba(168,85,247,0.38),0 0 70px rgba(168,85,247,0.1);}50%{box-shadow:0 0 50px rgba(168,85,247,0.75),0 0 110px rgba(168,85,247,0.22);} }
        @keyframes statPop { from{opacity:0;transform:scale(0.85) translateY(6px);}to{opacity:1;transform:scale(1) translateY(0);} }
        @keyframes cardIn { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
        @keyframes accordionOpen { from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);} }
        .cm-in { animation: cardIn 0.42s cubic-bezier(0.22,1,0.36,1) both; }
        .ac-in { animation: accordionOpen 0.38s cubic-bezier(0.22,1,0.36,1) both; }
        @media(max-width:900px){ .hp-hero{ flex-direction:column !important; } .hp-hero > div { height: clamp(240px,38vw,320px) !important; } .hp-sub{grid-template-columns:repeat(2,1fr)!important;} .hp-tools{grid-template-columns:repeat(2,1fr)!important;} }
        @media(max-width:600px){ .hp-hero > div { height: 240px !important; } .hp-sub{grid-template-columns:1fr 1fr!important;} .hp-actions{flex-wrap:wrap!important;gap:0.55rem!important;} }
      `}</style>

      {/* ── AMBIENT ORBS ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-18%", left: "-8%", width: "1000px", height: "900px", background: "radial-gradient(ellipse, rgba(100,0,200,0.16) 0%, transparent 55%)", animation: "floatOrb 20s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "5%", right: "-12%", width: "800px", height: "800px", background: "radial-gradient(ellipse, rgba(200,30,80,0.11) 0%, transparent 55%)", animation: "floatOrb2 24s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-8%", left: "28%", width: "800px", height: "550px", background: "radial-gradient(ellipse, rgba(40,10,130,0.1) 0%, transparent 55%)", animation: "floatOrb 28s ease-in-out infinite 4s" }} />
      </div>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isMobile ? "0 1rem" : "0 2.5rem",
        height: "58px", flexShrink: 0,
        background: "rgba(2,0,7,0.96)", backdropFilter: "blur(32px)",
        borderBottom: "1px solid rgba(255,255,255,0.032)",
      }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.6) 20%, rgba(251,191,36,0.5) 50%, rgba(239,68,68,0.6) 80%, transparent)", animation: "borderGlow 4s ease-in-out infinite" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#A855F7", boxShadow: "0 0 14px #A855F7, 0 0 32px rgba(168,85,247,0.4)", animation: "pulseDot 2.5s ease-in-out infinite" }} />
          <span style={{ fontSize: "0.9rem", fontWeight: 900, letterSpacing: "5.5px", background: "linear-gradient(135deg, #F5D67A 0%, #E8B830 35%, #D4A017 55%, #E8C840 75%, #F5D67A 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontFamily: "'Cinzel', serif", animation: "hdrShimmer 5s linear infinite" }}>SHADOWWEAVE</span>
        </div>

        {/* Stats — desktop only */}
        {!isMobile && (
          <div style={{ display: "flex", gap: "2.2rem", alignItems: "center" }}>
            {[["31+", "Story Modes"], ["210+", "Heroines"], ["Venice AI", "Engine"], ["Uncensored", "Model"]].map(([v, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 900, color: "rgba(230,190,60,0.82)", lineHeight: 1, fontFamily: "'Cinzel', serif" }}>{v}</div>
                <div style={{ fontSize: "0.36rem", color: "rgba(200,200,220,0.26)", letterSpacing: "2.5px", textTransform: "uppercase", marginTop: "2px", fontFamily: "'Montserrat', sans-serif" }}>{l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Nav actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
          {streak.count >= 2 && (
            <div title={`${streak.count}-day streak`} style={{ display: "flex", alignItems: "center", gap: "0.32rem", padding: "0.28rem 0.7rem", background: "rgba(245,158,11,0.09)", border: "1px solid rgba(245,158,11,0.28)", borderRadius: "20px" }}>
              <span style={{ fontSize: "0.75rem" }}>🔥</span>
              <span style={{ fontSize: "0.58rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", color: "rgba(253,186,69,0.85)", fontWeight: 700 }}>{streak.count}</span>
            </div>
          )}
          <button onClick={props.onAchievements}
            style={{ display: "flex", alignItems: "center", gap: "0.42rem", padding: "0.38rem 0.85rem", background: "rgba(245,214,122,0.06)", border: "1px solid rgba(245,214,122,0.18)", borderRadius: "30px", cursor: "pointer", transition: "all 0.22s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,214,122,0.14)"; e.currentTarget.style.boxShadow = "0 0 18px rgba(245,214,122,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(245,214,122,0.06)"; e.currentTarget.style.boxShadow = "none"; }}>
            <span style={{ fontSize: "0.65rem" }}>🏆</span>
            {!isMobile && <span style={{ fontSize: "0.5rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(245,214,122,0.75)", fontWeight: 700, fontFamily: "'Cinzel', serif" }}>{achCount > 0 ? `${achCount} · ${achXP} XP` : "Trophies"}</span>}
          </button>
          <button onClick={props.onStoryArchive}
            style={{ display: "flex", alignItems: "center", gap: "0.42rem", padding: "0.38rem 0.9rem", background: "rgba(168,85,247,0.09)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: "30px", cursor: "pointer", transition: "all 0.22s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,85,247,0.2)"; e.currentTarget.style.boxShadow = "0 0 22px rgba(168,85,247,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(168,85,247,0.09)"; e.currentTarget.style.boxShadow = "none"; }}>
            <span style={{ fontSize: "0.65rem", color: "rgba(192,132,252,0.85)" }}>◈</span>
            {!isMobile && <span style={{ fontSize: "0.52rem", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(192,132,252,0.85)", fontWeight: 700, fontFamily: "'Cinzel', serif" }}>Archive</span>}
          </button>
        </div>
      </nav>

      {/* ── DAILY DISPATCH STRIP ── */}
      <div style={{
        padding: isMobile ? "0.65rem 1rem" : "0.65rem 2.5rem",
        background: "rgba(10,5,25,0.88)", borderBottom: "1px solid rgba(251,191,36,0.08)",
        backdropFilter: "blur(20px)", position: "relative", zIndex: 5,
        display: "flex", alignItems: "center", gap: "1.4rem", flexWrap: "wrap",
        opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.45s 0.05s ease both" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", flexShrink: 0 }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FBB924", boxShadow: "0 0 10px rgba(251,185,36,0.85)", animation: "pulseDot 2.5s ease-in-out infinite" }} />
          <span style={{ fontSize: "0.36rem", letterSpacing: "4px", color: "rgba(251,191,36,0.4)", fontFamily: "'Cinzel', serif", textTransform: "uppercase", fontWeight: 700 }}>Daily Dispatch</span>
          <span style={{ fontSize: "0.34rem", color: "rgba(255,255,255,0.1)", letterSpacing: "1px", fontFamily: "'Montserrat', sans-serif" }}>{today}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "1.2rem", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.68rem", fontWeight: 700, color: "rgba(240,235,255,0.82)", letterSpacing: "0.04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: isMobile ? "180px" : "360px" }}>{dailyTitle.toUpperCase()}</span>
          {!isMobile && (
            <div style={{ display: "flex", gap: "1rem" }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.58rem", fontWeight: 700, color: heroine.color }}>{heroine.name}</span>
              <span style={{ fontSize: "0.38rem", color: "rgba(251,191,36,0.2)", alignSelf: "center" }}>vs</span>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.58rem", fontWeight: 700, color: "rgba(239,68,68,0.8)" }}>{villain}</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.72rem", fontWeight: 700, color: "rgba(251,191,36,0.55)", letterSpacing: "3px" }}>{clock}</span>
          <button onClick={props.onDailyScenario} style={{
            padding: "0.38rem 0.95rem", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.35)", borderRadius: "8px",
            cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.48rem", letterSpacing: "2px",
            color: "rgba(251,191,36,0.82)", fontWeight: 700, textTransform: "uppercase", transition: "all 0.22s",
            whiteSpace: "nowrap",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(251,191,36,0.18)"; e.currentTarget.style.boxShadow = "0 0 16px rgba(251,191,36,0.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(251,191,36,0.1)"; e.currentTarget.style.boxShadow = "none"; }}>
            Generate Story
          </button>
          <button onClick={props.onDailyChronicle} style={{
            padding: "0.38rem 0.85rem", background: "transparent", border: "1px solid rgba(251,191,36,0.12)", borderRadius: "8px",
            cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.44rem", letterSpacing: "2px",
            color: "rgba(251,191,36,0.38)", fontWeight: 700, textTransform: "uppercase", transition: "all 0.22s",
            whiteSpace: "nowrap",
          }}>Chronicle</button>
        </div>
      </div>

      {/* ══ HERO SECTION — THREE MAIN MODES ══════════════════════════════════════ */}
      <div style={{
        padding: isMobile ? "1.5rem 1rem 0" : "2rem 2.5rem 0",
        position: "relative", zIndex: 2,
        opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.6s 0.12s ease both" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "1.1rem" }}>
          <div style={{ width: "3px", height: "16px", borderRadius: "2px", background: "linear-gradient(to bottom, rgba(251,191,36,0.95), rgba(251,191,36,0.08))", boxShadow: "0 0 12px rgba(251,191,36,0.45)" }} />
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.4rem", letterSpacing: "5px", color: "rgba(251,191,36,0.48)", textTransform: "uppercase", fontWeight: 700 }}>Choose Your Mode</span>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(251,191,36,0.16), transparent)" }} />
        </div>

        {/* Three hero cards */}
        <div className="hp-hero" style={{ display: "flex", gap: "1.1rem" }}>
          <HeroCard
            title="HEROINE FORGE"
            desc="210+ heroines across 8 universes. Choose your captor, set the scene, and generate a fully uncensored multi-chapter dark thriller."
            badge="Core Mode · Flagship"
            tag="Dark Fiction Engine"
            stat="210+ Heroines"
            accent="#C084FC"
            r={168} g={85} b={247}
            onClick={props.onSuperheroMode}
            gradient="radial-gradient(ellipse at 60% 20%, rgba(90,0,180,0.85) 0%, rgba(30,0,80,0.92) 45%, rgba(4,1,14,0.98) 100%)"
            imgSrc={`${BASE}/heroes/card-heroine-forge.png`}
          />
          <HeroCard
            title="CELEBRITY CAPTURE"
            desc="Real-world fame meets dark fantasy. Celebrities and villains in an uncensored narrative that shatters the fourth wall."
            badge="Celebrity · Adults Only"
            tag="Real World · No Filter"
            stat="100% Uncensored"
            accent="#FCA311"
            r={252} g={163} b={17}
            onClick={props.onCelebrityMode}
            gradient="radial-gradient(ellipse at 55% 25%, rgba(160,80,0,0.88) 0%, rgba(80,30,0,0.93) 45%, rgba(4,1,12,0.98) 100%)"
            imgSrc={`${BASE}/heroes/card-celebrity-capture.png`}
          />
          <HeroCard
            title="CUSTOM SCENARIO"
            desc="Build any premise from scratch. Your heroine, your captor, your rules. No filters. No limits. Pure dark narrative."
            badge="Custom · No Limits"
            tag="Infinite Possibilities"
            stat="Infinite Scenarios"
            accent="#34D399"
            r={52} g={211} b={153}
            onClick={props.onScenarioGenerator}
            gradient="radial-gradient(ellipse at 50% 20%, rgba(0,90,70,0.88) 0%, rgba(0,35,30,0.93) 45%, rgba(2,4,12,0.98) 100%)"
            imgSrc={`${BASE}/heroes/card-custom-scenario.png`}
          />
        </div>
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div style={{
        padding: isMobile ? "1.2rem 1rem 0" : "1.4rem 2.5rem 0",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
        position: "relative", zIndex: 2,
        opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.55s 0.22s ease both" : "none",
      }}>
        <button className="hp-actions" onClick={props.onSurpriseMe} style={{
          display: "flex", alignItems: "center", gap: "0.55rem", padding: "0.65rem 1.7rem",
          background: "rgba(168,85,247,0.1)", border: "1.5px solid rgba(168,85,247,0.38)", borderRadius: "50px",
          cursor: "pointer", transition: "all 0.24s", animation: "surpriseGlow 3.5s ease-in-out infinite",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,85,247,0.24)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(168,85,247,0.1)"; e.currentTarget.style.transform = "none"; }}>
          <span style={{ fontSize: "0.9rem" }}>⚡</span>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "2.5px", color: "rgba(200,160,255,0.88)", textTransform: "uppercase" }}>Surprise Me</span>
        </button>
        <button onClick={() => setShowDice(true)} style={{
          display: "flex", alignItems: "center", gap: "0.55rem", padding: "0.65rem 1.4rem",
          background: "rgba(96,165,250,0.07)", border: "1.5px solid rgba(96,165,250,0.22)", borderRadius: "50px",
          cursor: "pointer", transition: "all 0.24s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(96,165,250,0.16)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(96,165,250,0.07)"; e.currentTarget.style.transform = "none"; }}>
          <span style={{ fontSize: "0.85rem" }}>⚄</span>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "2px", color: "rgba(130,165,255,0.78)", textTransform: "uppercase" }}>Story Dice</span>
        </button>
        <button onClick={props.onStoryArchive} style={{
          display: "flex", alignItems: "center", gap: "0.55rem", padding: "0.65rem 1.4rem",
          background: "rgba(34,197,94,0.05)", border: "1.5px solid rgba(34,197,94,0.2)", borderRadius: "50px",
          cursor: "pointer", transition: "all 0.24s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,197,94,0.12)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(34,197,94,0.05)"; e.currentTarget.style.transform = "none"; }}>
          <span style={{ fontSize: "0.85rem" }}>◈</span>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.58rem", fontWeight: 700, letterSpacing: "2px", color: "rgba(90,220,135,0.72)", textTransform: "uppercase" }}>Story Archive</span>
        </button>
      </div>

      {/* ── STATS STRIP ── */}
      <div style={{
        padding: isMobile ? "1.2rem 1rem 0" : "1.4rem 2.5rem 0",
        position: "relative", zIndex: 2,
        opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.52s 0.28s ease both" : "none",
      }}>
        <div style={{
          display: "flex", gap: "0.55rem", flexWrap: "wrap",
          padding: "0.85rem 1.4rem", borderRadius: "14px",
          background: "rgba(4,1,12,0.72)", border: "1px solid rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          alignItems: "center",
        }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.36rem", letterSpacing: "4px", color: "rgba(168,85,247,0.38)", textTransform: "uppercase", fontWeight: 700, marginRight: "0.4rem" }}>Your Record</span>
          {[
            { v: streak.count >= 1 ? `${streak.count}🔥` : "—", l: "Streak", c: "245,158,11" },
            { v: archiveStats.total > 0 ? `${archiveStats.total}` : "0", l: "Stories", c: "168,85,247" },
            { v: archiveStats.totalWords >= 1000 ? `${(archiveStats.totalWords / 1000).toFixed(1)}k` : `${archiveStats.totalWords}`, l: "Words", c: "251,191,36" },
            { v: `${archiveStats.uniqueHeroines}`, l: "Heroines", c: "249,115,22" },
            { v: `${archiveStats.modesTried}`, l: "Modes", c: "52,211,153" },
            { v: achXP > 0 ? `${achXP}` : "0", l: "XP", c: "232,121,249" },
          ].map(({ v, l, c }, idx) => (
            <div key={l} style={{
              display: "flex", alignItems: "center", gap: "0.4rem",
              padding: "0.32rem 0.85rem", background: `rgba(${c},0.05)`,
              border: `1px solid rgba(${c},0.12)`, borderRadius: "30px",
              animation: mounted ? `statPop 0.45s ${idx * 0.05}s cubic-bezier(0.22,1,0.36,1) both` : "none",
            }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", fontWeight: 900, color: `rgba(${c},0.85)`, letterSpacing: "0.5px" }}>{v}</span>
              <span style={{ fontSize: "0.32rem", letterSpacing: "2px", color: `rgba(${c},0.32)`, fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", fontWeight: 700 }}>{l}</span>
            </div>
          ))}
          {/* Activity dots */}
          {!isMobile && (
            <div style={{ marginLeft: "auto", display: "flex", gap: "2px", flexWrap: "wrap", maxWidth: "280px", alignContent: "center" }}>
              {activitySlots.slice(-63).map((slot) => {
                const has = activitySet.has(slot.key);
                return (
                  <div key={slot.key} title={slot.key + (has ? " · Story written" : "")}
                    style={{ width: "8px", height: "8px", borderRadius: "2px", background: slot.isToday ? (has ? "rgba(34,197,94,0.9)" : "rgba(34,197,94,0.25)") : has ? "rgba(34,197,94,0.52)" : "rgba(255,255,255,0.032)", border: slot.isToday ? "1px solid rgba(34,197,94,0.6)" : "none", flexShrink: 0, transition: "transform 0.1s", cursor: "default" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.6)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ══ SPECIALTY MODES — ACCORDION ════════════════════════════════════════ */}
      <div style={{
        padding: isMobile ? "1.4rem 1rem 0" : "1.8rem 2.5rem 0",
        position: "relative", zIndex: 2,
        opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.55s 0.34s ease both" : "none",
      }}>
        {/* Toggle header */}
        <button onClick={() => setShowAllModes(v => !v)} style={{
          width: "100%", display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.85rem 1.2rem", borderRadius: showAllModes ? "16px 16px 0 0" : "16px",
          background: showAllModes ? "rgba(168,85,247,0.1)" : "rgba(4,1,12,0.78)",
          border: `1px solid rgba(168,85,247,${showAllModes ? 0.38 : 0.1})`,
          borderBottom: showAllModes ? "1px solid rgba(168,85,247,0.15)" : undefined,
          cursor: "pointer", transition: "all 0.28s", backdropFilter: "blur(18px)",
        }}
          onMouseEnter={e => { if (!showAllModes) { e.currentTarget.style.background = "rgba(168,85,247,0.07)"; e.currentTarget.style.borderColor = "rgba(168,85,247,0.22)"; } }}
          onMouseLeave={e => { if (!showAllModes) { e.currentTarget.style.background = "rgba(4,1,12,0.78)"; e.currentTarget.style.borderColor = "rgba(168,85,247,0.1)"; } }}>
          <div style={{ width: "3px", height: "16px", borderRadius: "2px", background: "linear-gradient(to bottom, rgba(192,132,252,0.95), rgba(192,132,252,0.08))", boxShadow: "0 0 10px rgba(192,132,252,0.5)", flexShrink: 0 }} />
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.42rem", letterSpacing: "4px", color: "rgba(192,132,252,0.62)", textTransform: "uppercase", fontWeight: 700 }}>Heroine Forge · Specialist Modes</span>
          <div style={{ padding: "0.15rem 0.6rem", background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.18)", borderRadius: "18px" }}>
            <span style={{ fontSize: "0.32rem", letterSpacing: "2px", color: "rgba(192,132,252,0.5)", fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>19 MODES</span>
          </div>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(168,85,247,0.14), transparent)" }} />
          <span style={{
            fontSize: "0.9rem", color: "rgba(192,132,252,0.5)",
            transform: showAllModes ? "rotate(180deg)" : "none",
            transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
            display: "inline-block",
          }}>⌄</span>
        </button>

        {/* Accordion content */}
        {showAllModes && (
          <div className="ac-in" style={{
            padding: "1.1rem",
            background: "rgba(4,1,12,0.78)",
            border: "1px solid rgba(168,85,247,0.1)", borderTop: "none",
            borderRadius: "0 0 16px 16px",
            backdropFilter: "blur(18px)",
          }}>
            {/* Specialty modes */}
            <div style={{ fontSize: "0.32rem", letterSpacing: "3.5px", color: "rgba(192,132,252,0.32)", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.7rem", paddingLeft: "0.2rem" }}>Specialty Modes</div>
            <div className="hp-sub" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.45rem", marginBottom: "1.1rem" }}>
              {specialtyModes.map((m, i) => (
                <div key={m.title} className="cm-in" style={{ animationDelay: `${i * 0.025}s` }}>
                  <CompactMode {...m} />
                </div>
              ))}
            </div>
            {/* Studio tools */}
            <div style={{ fontSize: "0.32rem", letterSpacing: "3.5px", color: "rgba(52,211,153,0.32)", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.7rem", paddingLeft: "0.2rem", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "1rem" }}>Studio Tools</div>
            <div className="hp-tools" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.45rem" }}>
              {studioTools.map((m, i) => (
                <div key={m.title} className="cm-in" style={{ animationDelay: `${(specialtyModes.length + i) * 0.02}s` }}>
                  <CompactMode {...m} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ height: "2.5rem" }} />
    </div>
  );
}
