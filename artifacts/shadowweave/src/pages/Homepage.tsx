import { useState, useEffect, useRef } from "react";
import StoryDice from "../components/StoryDice";
import { getStreak } from "../lib/streak";
import { getCompletedModes, getUnlockCount, getTotalXP } from "../lib/achievements";
import { getTopVillains, type VillainStat } from "../lib/infamy";
import { getWritingActivitySet, buildActivitySlots } from "../lib/activityMap";
import { useIsMobile } from "../hooks/useIsMobile";
import { getRecentModes, type RecentMode } from "../lib/recentModes";
import { getArchive } from "../lib/archive";

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
}

const DAILY_HEROINES = [
  { name: "Black Widow",   color: "#F87171" }, { name: "Scarlet Witch", color: "#F87171" },
  { name: "Wonder Woman",  color: "#60A5FA" }, { name: "Zatanna",       color: "#60A5FA" },
  { name: "Black Canary",  color: "#34D399" }, { name: "Supergirl",     color: "#34D399" },
  { name: "Elsa",          color: "#C084FC" }, { name: "Megara",        color: "#C084FC" },
  { name: "Mulan",         color: "#C084FC" }, { name: "Starlight",     color: "#FB923C" },
  { name: "Kimiko",        color: "#FB923C" }, { name: "Pocahontas",    color: "#C084FC" },
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

// ── MODE CARD ─────────────────────────────────────────────────────────────────
function ModeCard({ icon, title, desc, badge, accent, r, g, b, onClick, size = "normal", tag, img }: {
  icon: string; title: string; desc: string; badge: string; accent: string;
  r: number; g: number; b: number; onClick: () => void; size?: "normal" | "large"; tag?: string; img?: string;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${r},${g},${b}`;
  const hasImg = !!img;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", cursor: "pointer", borderRadius: "18px", overflow: "hidden",
        background: "rgba(6,2,18,0.92)",
        border: `1px solid ${hov ? `rgba(${rgb},0.65)` : `rgba(${rgb},0.12)`}`,
        minHeight: hasImg ? (size === "large" ? "200px" : "165px") : undefined,
        transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
        boxShadow: hov
          ? `0 0 0 1px rgba(${rgb},0.15), 0 24px 70px rgba(${rgb},0.28), 0 0 120px rgba(${rgb},0.08), 0 40px 80px rgba(0,0,0,0.5)`
          : "0 4px 24px rgba(0,0,0,0.5)",
        transform: hov ? "translateY(-6px) scale(1.012)" : "none",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* ── PORTRAIT PANEL (right side, only when img provided) ── */}
      {hasImg && (
        <>
          {/* Image */}
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "46%", overflow: "hidden" }}>
            <img
              src={img}
              alt=""
              style={{
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center top",
                opacity: hov ? 0.82 : 0.28,
                transform: hov ? "scale(1.12) translateY(-2%)" : "scale(1.03)",
                filter: hov
                  ? `saturate(1.35) brightness(1.15) contrast(1.05)`
                  : "saturate(0.5) brightness(0.55)",
                transition: "opacity 0.6s ease, transform 0.75s cubic-bezier(0.22,1,0.36,1), filter 0.6s ease",
              }}
            />
            {/* Left bleed gradient */}
            <div style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(to right, rgba(6,2,18,1) 0%, rgba(6,2,18,0.82) 22%, rgba(6,2,18,${hov ? 0.08 : 0.6}) 65%, rgba(6,2,18,0) 100%)`,
              transition: "all 0.55s ease",
            }} />
            {/* Bottom vignette */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
              background: `linear-gradient(to top, rgba(6,2,18,${hov ? 0.75 : 0.92}), transparent)`,
              transition: "all 0.45s",
            }} />
            {/* Accent tint overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(ellipse at 75% 40%, rgba(${rgb},${hov ? 0.18 : 0.0}) 0%, transparent 65%)`,
              transition: "all 0.55s",
            }} />
            {/* Scan-line reveal on hover */}
            {hov && (
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: `linear-gradient(to bottom, transparent 0%, rgba(${rgb},0.12) 48%, rgba(255,255,255,0.06) 50%, rgba(${rgb},0.12) 52%, transparent 100%)`,
                animation: "imgScanReveal 0.65s ease forwards",
              }} />
            )}
            {/* Right edge glow */}
            <div style={{
              position: "absolute", right: 0, top: 0, bottom: 0, width: "2px",
              background: `linear-gradient(to bottom, transparent, rgba(${rgb},${hov ? 0.9 : 0.15}) 40%, rgba(${rgb},${hov ? 0.9 : 0.15}) 60%, transparent)`,
              boxShadow: hov ? `0 0 22px rgba(${rgb},0.7)` : "none",
              transition: "all 0.4s",
            }} />
          </div>
          {/* Corner tag over portrait */}
          {hov && (
            <div style={{
              position: "absolute", top: "0.7rem", right: "0.7rem", zIndex: 5,
              fontSize: "0.36rem", letterSpacing: "2.5px", padding: "3px 9px",
              borderRadius: "20px", background: `rgba(${rgb},0.22)`,
              border: `1px solid rgba(${rgb},0.5)`, color: accent,
              fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "uppercase",
              backdropFilter: "blur(8px)",
            }}>UNCENSORED</div>
          )}
        </>
      )}

      {/* ── TEXT CONTENT ── */}
      <div style={{
        position: "relative", zIndex: 2,
        padding: size === "large" ? "1.55rem 1.5rem 1.35rem" : "1.1rem 1.2rem 1rem",
        maxWidth: hasImg ? "58%" : "100%",
        display: "flex", flexDirection: "column",
        gap: size === "large" ? "0.85rem" : "0.55rem",
        minHeight: hasImg ? (size === "large" ? "200px" : "165px") : undefined,
      }}>
        {/* Top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: hov ? `linear-gradient(90deg, transparent, rgba(${rgb},0.95) 35%, rgba(${rgb},0.95) 65%, transparent)` : `linear-gradient(90deg, transparent, rgba(${rgb},0.2) 50%, transparent)`, transition: "all 0.35s", boxShadow: hov ? `0 0 18px rgba(${rgb},0.6)` : "none" }} />
        {/* Radial glow */}
        {hov && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 30% 0%, rgba(${rgb},0.12) 0%, transparent 65%)`, pointerEvents: "none" }} />}
        {/* Shimmer */}
        {hov && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.04) 50%, transparent 65%)", animation: "shimmerSweep 0.9s ease forwards", pointerEvents: "none" }} />}
        {/* Tag (non-image cards) */}
        {tag && !hasImg && <div style={{ position: "absolute", top: "0.75rem", right: "0.85rem", fontSize: "0.38rem", letterSpacing: "2px", padding: "2px 8px", borderRadius: "20px", background: `rgba(${rgb},0.18)`, border: `1px solid rgba(${rgb},0.3)`, color: accent, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>{tag}</div>}
        {/* Tag (image cards, visible always) */}
        {tag && hasImg && !hov && <div style={{ position: "absolute", top: "0.75rem", right: "0.85rem", zIndex: 4, fontSize: "0.38rem", letterSpacing: "2px", padding: "2px 8px", borderRadius: "20px", background: `rgba(${rgb},0.18)`, border: `1px solid rgba(${rgb},0.3)`, color: accent, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>{tag}</div>}
        {/* Icon + title row */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <div style={{
            width: size === "large" ? "52px" : "42px", height: size === "large" ? "52px" : "42px",
            borderRadius: "14px", flexShrink: 0,
            background: hov ? `rgba(${rgb},0.28)` : `rgba(${rgb},0.08)`,
            border: `1px solid rgba(${rgb},${hov ? 0.5 : 0.12})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: size === "large" ? "1.6rem" : "1.2rem",
            transition: "all 0.28s",
            filter: hov ? `drop-shadow(0 0 12px rgba(${rgb},0.9))` : "none",
            boxShadow: hov ? `0 0 24px rgba(${rgb},0.35)` : "none",
          }}>{icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: size === "large" ? "1rem" : "0.8rem", fontWeight: 700, color: hov ? "#fff" : "rgba(232,228,255,0.82)", letterSpacing: "0.05em", transition: "color 0.25s", lineHeight: 1.2, textShadow: hov ? `0 0 30px rgba(${rgb},0.7)` : "none" }}>{title}</div>
            <div style={{ fontSize: "0.42rem", letterSpacing: "2px", color: hov ? accent : `rgba(${rgb},0.42)`, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "uppercase", marginTop: "3px", transition: "color 0.25s" }}>{badge}</div>
          </div>
        </div>
        {/* Desc */}
        <div style={{ fontSize: "0.66rem", color: hov ? "rgba(210,205,240,0.6)" : "rgba(200,195,230,0.26)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.65, transition: "color 0.25s" }}>{desc}</div>
        {/* CTA row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "0.4rem", borderTop: `1px solid rgba(${rgb},${hov ? 0.22 : 0.06})`, transition: "border-color 0.3s" }}>
          <span style={{ fontSize: "0.44rem", letterSpacing: "3px", color: hov ? `rgba(${rgb},0.9)` : `rgba(${rgb},0.28)`, fontFamily: "'Cinzel', serif", textTransform: "uppercase", fontWeight: 700, transition: "color 0.25s", textShadow: hov ? `0 0 16px rgba(${rgb},0.85)` : "none" }}>Enter →</span>
          <div style={{ display: "flex", gap: "3px" }}>
            {[1,2,3].map(i => <div key={i} style={{ width: "4px", height: "4px", borderRadius: "50%", background: hov ? `rgba(${rgb},${1 - i * 0.25})` : `rgba(${rgb},0.1)`, transition: "all 0.25s", boxShadow: hov ? `0 0 8px rgba(${rgb},0.8)` : "none" }} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DAILY DISPATCH ────────────────────────────────────────────────────────────
function DailyDispatch({ heroine, villain, setting, title, today, onGenerate, onChronicle }: {
  heroine: { name: string; color: string }; villain: string; setting: string;
  title: string; today: string; onGenerate: () => void; onChronicle: () => void;
}) {
  const [hov, setHov] = useState(false);
  const [clock, setClock] = useState("");
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
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", borderRadius: "20px", overflow: "hidden",
        border: `1px solid ${hov ? "rgba(251,191,36,0.42)" : "rgba(251,191,36,0.09)"}`,
        background: "rgba(7,3,16,0.94)", cursor: "pointer",
        transition: "all 0.32s", boxShadow: hov ? "0 0 60px rgba(251,191,36,0.1), 0 12px 50px rgba(0,0,0,0.55)" : "0 4px 28px rgba(0,0,0,0.55)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, rgba(251,191,36,${hov ? 0.9 : 0.22}), rgba(251,191,36,${hov ? 0.9 : 0.22}), transparent)`, transition: "all 0.32s", boxShadow: hov ? "0 0 20px rgba(251,191,36,0.4)" : "none" }} />
      {hov && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 30%, rgba(251,191,36,0.025) 50%, transparent 70%)", animation: "shimmerSweep 1.4s ease forwards", pointerEvents: "none" }} />}
      <div style={{ display: "flex", alignItems: "stretch", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", padding: "1.4rem 1.8rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.9rem" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#FBB924", boxShadow: "0 0 14px rgba(251,185,36,0.9)", animation: "pulseDot 2.5s ease-in-out infinite", flexShrink: 0 }} />
            <span style={{ fontSize: "0.44rem", letterSpacing: "5px", color: "rgba(251,191,36,0.45)", fontFamily: "'Cinzel', serif", textTransform: "uppercase", fontWeight: 700 }}>Daily Dispatch</span>
            <span style={{ fontSize: "0.38rem", color: "rgba(255,255,255,0.12)", letterSpacing: "1.5px", fontFamily: "'Montserrat', sans-serif" }}>{today}</span>
          </div>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1rem, 2.5vw, 1.35rem)", fontWeight: 900, color: hov ? "#FFF" : "rgba(240,235,255,0.88)", letterSpacing: "0.06em", lineHeight: 1.15, marginBottom: "0.85rem", textShadow: hov ? "0 0 40px rgba(251,191,36,0.35)" : "none", transition: "all 0.3s" }}>{title.toUpperCase()}</div>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.38rem", letterSpacing: "3px", color: "rgba(251,191,36,0.28)", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", marginBottom: "3px" }}>Heroine</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.82rem", fontWeight: 700, color: heroine.color }}>{heroine.name}</div>
            </div>
            <div style={{ width: "1px", background: "rgba(251,191,36,0.1)", alignSelf: "stretch" }} />
            <div>
              <div style={{ fontSize: "0.38rem", letterSpacing: "3px", color: "rgba(251,191,36,0.28)", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", marginBottom: "3px" }}>Captor</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.82rem", fontWeight: 700, color: "rgba(239,68,68,0.85)" }}>{villain}</div>
            </div>
            <div style={{ width: "1px", background: "rgba(251,191,36,0.1)", alignSelf: "stretch" }} />
            <div style={{ flex: 1, minWidth: "160px" }}>
              <div style={{ fontSize: "0.38rem", letterSpacing: "3px", color: "rgba(251,191,36,0.28)", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", marginBottom: "3px" }}>Setting</div>
              <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.72rem", color: "rgba(200,195,240,0.55)", lineHeight: 1.4 }}>{setting}</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", borderLeft: "1px solid rgba(251,191,36,0.07)", padding: "1.4rem 1.5rem", gap: "0.7rem", minWidth: "180px", justifyContent: "center", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", marginBottom: "0.2rem" }}>
            <span style={{ fontSize: "0.38rem", letterSpacing: "4px", color: "rgba(251,191,36,0.25)", fontFamily: "'Cinzel', serif", textTransform: "uppercase" }}>Resets In</span>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", fontWeight: 700, color: "rgba(251,191,36,0.7)", letterSpacing: "4px", textShadow: "0 0 20px rgba(251,191,36,0.28)" }}>{clock}</span>
          </div>
          <button onClick={onGenerate} style={{ width: "100%", padding: "0.65rem 1.1rem", background: hov ? "rgba(251,191,36,0.2)" : "rgba(251,191,36,0.09)", border: "1px solid rgba(251,191,36,0.38)", borderRadius: "12px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "2px", color: "rgba(251,191,36,0.88)", fontWeight: 700, textTransform: "uppercase", transition: "all 0.25s", boxShadow: hov ? "0 0 20px rgba(251,191,36,0.18)" : "none" }}>Generate Story</button>
          <button onClick={(e) => { e.stopPropagation(); onChronicle(); }} style={{ width: "100%", padding: "0.55rem 1.1rem", background: "transparent", border: "1px solid rgba(251,191,36,0.14)", borderRadius: "12px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.55rem", letterSpacing: "2px", color: "rgba(251,191,36,0.42)", fontWeight: 700, textTransform: "uppercase", transition: "all 0.25s" }}>Daily Chronicle</button>
        </div>
      </div>
    </div>
  );
}

// ── RECENT CHIP ───────────────────────────────────────────────────────────────
function RecentModeChip({ rm, onClick }: { rm: RecentMode; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.85rem", background: hov ? "rgba(168,85,247,0.18)" : "rgba(168,85,247,0.07)", border: `1px solid ${hov ? "rgba(168,85,247,0.55)" : "rgba(168,85,247,0.2)"}`, borderRadius: "30px", cursor: "pointer", transition: "all 0.2s", boxShadow: hov ? "0 0 18px rgba(168,85,247,0.22)" : "none" }}>
      <span style={{ fontSize: "0.75rem" }}>{rm.icon}</span>
      <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.55rem", color: hov ? "rgba(222,192,255,0.95)" : "rgba(192,132,252,0.68)", letterSpacing: "0.5px", fontWeight: 700, whiteSpace: "nowrap", transition: "color 0.2s" }}>{rm.label}</span>
    </button>
  );
}

// ── HOMEPAGE ──────────────────────────────────────────────────────────────────
export default function Homepage(props: HomepageProps) {
  const isMobile = useIsMobile(768);
  const [mounted, setMounted] = useState(false);
  const [surpriseHov, setSurpriseHov] = useState(false);
  const [showDice, setShowDice] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [streak] = useState(() => getStreak());
  const [completedModes] = useState(() => getCompletedModes());
  const [achCount] = useState(() => getUnlockCount());
  const [achXP] = useState(() => getTotalXP());
  const [topVillains] = useState<VillainStat[]>(() => getTopVillains(5));
  const [activitySlots] = useState(() => buildActivitySlots(91));
  const [activitySet] = useState(() => getWritingActivitySet(91));
  const activeDays = activitySet.size;
  const [recentModes] = useState<RecentMode[]>(() => getRecentModes());
  const [archiveStats] = useState(() => {
    const archive = getArchive();
    const totalWords = archive.reduce((sum, s) => sum + s.wordCount, 0);
    const uniqueHeroines = new Set(archive.flatMap((s) => s.characters)).size;
    const modesTried = new Set(archive.map((s) => s.tool)).size;
    return { total: archive.length, totalWords, uniqueHeroines, modesTried };
  });
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);
  const { heroine, villain, setting, title: dailyTitle } = getDailyScenario();
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const allModes = [
    { id: "forge",    icon: "⚔", title: "HEROINE FORGE", desc: "181+ heroines across 8 universes. Choose your captor, set the scene, generate a multi-chapter dark thriller.", badge: "Core Mode · 8 Universes", accent: "#C084FC", r: 168, g: 85,  b: 247, onClick: props.onSuperheroMode, tag: "Flagship", size: "large" as const, cat: "forge", img: "/icons/heroine-forge.png" },
    { id: "int",      icon: "🔦", title: "INTERROGATION ROOM", desc: "Psychological pressure chamber. Extract information through fear, isolation, and manipulation.", badge: "Psych · High Tension", accent: "#F87171", r: 248, g: 113, b: 113, onClick: props.onInterrogationRoom, cat: "capture", img: "/icons/interrogation-room.png" },
    { id: "celeb",    icon: "🎬", title: "CELEBRITY CAPTURE", desc: "Real-world fame meets dark fantasy. Celebrities and villains in a narrative that breaks the fourth wall.", badge: "Celebrity · Premium", accent: "#FCA311", r: 252, g: 163, b: 17, onClick: props.onCelebrityMode, tag: "Premium", cat: "celebrity", img: "/icons/celebrity-captive.png" },
    { id: "daily",    icon: "📅", title: "DAILY SCENARIO", desc: "A fresh AI-crafted scenario every 24 hours. New heroine, captor, and setting at midnight.", badge: "Daily · Refreshes 00:00", accent: "#FCD34D", r: 251, g: 191, b: 36, onClick: props.onDailyScenario, cat: "all" },
    { id: "mb",       icon: "🌀", title: "MIND BREAK", desc: "Five-phase psychological deconstruction. Patience, trust, isolation, dependency, and surrender.", badge: "5 Phases · Deep Psych", accent: "#C084FC", r: 192, g: 132, b: 252, onClick: props.onMindBreak, cat: "capture" },
    { id: "dc",       icon: "⛓", title: "DUAL CAPTURE", desc: "Two heroines, one cell. A shared ordeal that tests loyalty, friendship, and individual resolve.", badge: "Duo · Shared Cell", accent: "#34D399", r: 52,  g: 211, b: 153, onClick: props.onDualCapture, cat: "capture" },
    { id: "rgw",      icon: "🕸", title: "RESCUE GONE WRONG", desc: "The rescue team walks into a trap. Ambush, betrayal, and a reversal that no one anticipated.", badge: "Trap · Ambush", accent: "#FB923C", r: 251, g: 146, b: 60, onClick: props.onRescueGoneWrong, cat: "capture" },
    { id: "pd",       icon: "⚡", title: "POWER DRAIN", desc: "A metahuman's abilities slowly suppressed. Watch the power fade and the heroine adapt.", badge: "Meter · Drain Arc", accent: "#60A5FA", r: 96,  g: 165, b: 250, onClick: props.onPowerDrain, cat: "capture" },
    { id: "mc",       icon: "🗡", title: "MASS CAPTURE", desc: "Three to five heroines swept up in one coordinated operation. Logistics of scale.", badge: "Group · 3–5 Heroines", accent: "#F87171", r: 248, g: 113, b: 113, onClick: props.onMassCapture, cat: "capture" },
    { id: "ca",       icon: "🌑", title: "CORRUPTION ARC", desc: "Seven chapters. A heroine slowly turned. Ideology, identity, and the point of no return.", badge: "7 Chapters · Arc", accent: "#F472B6", r: 244, g: 114, b: 182, onClick: props.onCorruptionArc, cat: "capture" },
    { id: "ha",       icon: "⚖", title: "HERO AUCTION", desc: "A captured superhuman put up for bid. High stakes, dark buyers, and a gavel that decides fate.", badge: "Bid · Live Auction", accent: "#FCA311", r: 252, g: 163, b: 17, onClick: props.onHeroAuction, cat: "celebrity" },
    { id: "td",       icon: "👁", title: "TROPHY DISPLAY", desc: "The heroine as a prize. Visits, viewers, and a captor proud of their collection.", badge: "Display · Public", accent: "#EF4444", r: 239, g: 68, b: 68, onClick: props.onTrophyDisplay, cat: "celebrity" },
    { id: "ot",       icon: "📋", title: "OBEDIENCE TRAINING", desc: "Session-based compliance arc. Rewards, punishments, routines, and measured progress.", badge: "Session · Tracked", accent: "#2DD4BF", r: 45,  g: 212, b: 191, onClick: props.onObedienceTraining, cat: "capture" },
    { id: "show",     icon: "🎭", title: "THE SHOWCASE", desc: "A staged performance. The heroine on display before an audience, every movement scrutinised.", badge: "Staged · Audience", accent: "#E879F9", r: 232, g: 121, b: 249, onClick: props.onShowcase, cat: "celebrity" },
    { id: "pp",       icon: "🔓", title: "PUBLIC PROPERTY", desc: "Jurisdiction removed. The heroine declared shared — open to any who find her.", badge: "Exposed · Open Access", accent: "#FBBF24", r: 251, g: 191, b: 36, onClick: props.onPublicProperty, cat: "celebrity" },
    { id: "bp",       icon: "🎲", title: "BETTING POOL", desc: "Gamblers wager on outcomes while the heroine fights to influence the odds in her favour.", badge: "Wager · Live Odds", accent: "#34D399", r: 52,  g: 211, b: 153, onClick: props.onBettingPool, cat: "celebrity" },
    { id: "vtu",      icon: "🤝", title: "VILLAIN TEAM-UP", desc: "Two villains. One captive. Irreconcilable differences between the captors create chaos.", badge: "Duo Villain · Conflict", accent: "#F87171", r: 248, g: 113, b: 113, onClick: props.onVillainTeamUp, cat: "capture" },
    { id: "coc",      icon: "🔗", title: "CHAIN OF CUSTODY", desc: "The heroine transferred through multiple hands. Each captor adds a chapter to the story.", badge: "Transfer · Multi-Arc", accent: "#60A5FA", r: 96,  g: 165, b: 250, onClick: props.onChainOfCustody, cat: "capture" },
    { id: "lg",       icon: "⏳", title: "THE LONG GAME", desc: "Months compressed into chapters. A slow burn narrative across seasons of captivity.", badge: "Long Burn · Chapters", accent: "#C084FC", r: 168, g: 85,  b: 247, onClick: props.onLongGame, cat: "capture" },
    { id: "dm",       icon: "🪞", title: "DARK MIRROR", desc: "The heroine confronts an evil version of herself. Identity fractures in the encounter.", badge: "Duality · Psychological", accent: "#E879F9", r: 232, g: 121, b: 249, onClick: props.onDarkMirror, cat: "capture" },
    { id: "am",       icon: "🏛", title: "ARENA MODE", desc: "Pit multiple heroines against each other under villain-enforced rules. Only one stands.", badge: "Combat · Versus", accent: "#EF4444", r: 239, g: 68, b: 68, onClick: props.onArenaMode, cat: "capture" },
    { id: "th",       icon: "🕵", title: "THE HANDLER", desc: "A clandestine operative assigned to manage the heroine. Covert. Personal. Possessive.", badge: "Covert · Intimate", accent: "#FCA311", r: 252, g: 163, b: 17, onClick: props.onTheHandler, cat: "capture" },
  ];

  const toolModes = [
    { id: "cp", icon: "🏰", title: "CAPTOR PORTAL", desc: "Full customisation suite for your captor character. Build a villain from the ground up.", badge: "Customise · Build", accent: "#F87171", r: 248, g: 113, b: 113, onClick: props.onCaptorPortal },
    { id: "sg", icon: "🎲", title: "SCENARIO GENERATOR", desc: "Random scenario prompt engine. Spin a premise in seconds and jump straight into writing.", badge: "Generator · Instant", accent: "#34D399", r: 52,  g: 211, b: 153, onClick: props.onScenarioGenerator },
    { id: "cm", icon: "🗺", title: "CHARACTER MAPPER", desc: "Visualise relationships between heroines and villains across your entire story archive.", badge: "Visualise · Network", accent: "#60A5FA", r: 96,  g: 165, b: 250, onClick: props.onCharacterMapper },
    { id: "sb", icon: "💬", title: "SOUNDING BOARD", desc: "AI writing partner for plot ideas, dialogue, and narrative decisions. Brainstorm freely.", badge: "AI Partner · Brainstorm", accent: "#C084FC", r: 192, g: 132, b: 252, onClick: props.onSoundingBoard },
    { id: "cl", icon: "⚙", title: "CAPTOR LOGIC", desc: "Define the psychological model of your captor. Motivations, methods, and moral limits.", badge: "Psych Profile · Deep", accent: "#FBBF24", r: 251, g: 191, b: 36, onClick: props.onCaptorLogic },
    { id: "sa", icon: "📚", title: "STORY ARCS", desc: "Browse pre-built narrative arcs and select a structured storyline to anchor your sessions.", badge: "Arcs · Structured", accent: "#E879F9", r: 232, g: 121, b: 249, onClick: props.onStoryArcs },
    { id: "hd", icon: "📁", title: "HEROINE DOSSIER", desc: "Deep profiles for every heroine — powers, weaknesses, history, and captured artwork.", badge: "181+ Profiles · Art", accent: "#F87171", r: 248, g: 113, b: 113, onClick: props.onHeroineDossier },
    { id: "vb", icon: "🔮", title: "VILLAIN BUILDER", desc: "Craft a fully original villain from scratch with personality, powers, and backstory.", badge: "Custom · Original", accent: "#60A5FA", r: 96,  g: 165, b: 250, onClick: props.onVillainBuilder },
    { id: "rm", icon: "🕸", title: "RELATIONSHIP MAP", desc: "Map alliances, rivalries, and grudges across your entire cast of characters.", badge: "Network · Web", accent: "#34D399", r: 52,  g: 211, b: 153, onClick: props.onRelationshipMap },
  ];

  const tabs = [
    { id: "all",      label: "All Modes",    icon: "◈" },
    { id: "forge",    label: "Forge",        icon: "⚔" },
    { id: "capture",  label: "Capture",      icon: "⛓" },
    { id: "celebrity",label: "Celebrity",    icon: "🎬" },
    { id: "tools",    label: "Tools",        icon: "⚙" },
  ];

  const visibleModes = activeTab === "tools"
    ? []
    : activeTab === "all"
      ? allModes
      : allModes.filter(m => m.cat === activeTab || m.cat === "all");

  const PAGE_MAP: Record<string, keyof HomepageProps> = {
    "superhero-mode": "onSuperheroMode", "celebrity-mode": "onCelebrityMode",
    "daily-scenario": "onDailyScenario", "character-params": "onEnter",
    "mind-break": "onMindBreak", "dual-capture": "onDualCapture",
    "rescue-gone-wrong": "onRescueGoneWrong", "power-drain": "onPowerDrain",
    "mass-capture": "onMassCapture", "corruption-arc": "onCorruptionArc",
    "hero-auction": "onHeroAuction", "trophy-display": "onTrophyDisplay",
    "obedience-training": "onObedienceTraining", "showcase": "onShowcase",
    "public-property": "onPublicProperty", "betting-pool": "onBettingPool",
    "villain-team-up": "onVillainTeamUp", "chain-of-custody": "onChainOfCustody",
    "long-game": "onLongGame", "dark-mirror": "onDarkMirror",
    "arena-mode": "onArenaMode", "the-handler": "onTheHandler",
    "interrogation-room": "onInterrogationRoom", "captor-home": "onCaptorPortal",
    "captor-logic": "onCaptorLogic", "scenario-generator": "onScenarioGenerator",
    "character-mapper": "onCharacterMapper", "sounding-board": "onSoundingBoard",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "transparent" }}>
      {showDice && <StoryDice onClose={() => setShowDice(false)} />}

      <style>{`
        @keyframes shimmerSweep { 0% { transform: translateX(-100%); opacity:0; } 20% { opacity:1; } 100% { transform: translateX(100%); opacity:0; } }
        @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.55; transform:scale(0.6); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes hdrShimmer { 0% { background-position: 0% center; } 100% { background-position: 200% center; } }
        @keyframes floatOrb { 0%,100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-28px) scale(1.05); } }
        @keyframes imgScanReveal { 0% { transform: translateY(120%); opacity: 0; } 30% { opacity: 1; } 100% { transform: translateY(-120%); opacity: 0; } }
        @keyframes floatOrb2 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(20px); } }
        @keyframes surpriseGlow { 0%,100% { box-shadow: 0 0 30px rgba(168,85,247,0.45), 0 0 80px rgba(168,85,247,0.12); } 50% { box-shadow: 0 0 55px rgba(168,85,247,0.85), 0 0 120px rgba(168,85,247,0.28); } }
        @keyframes borderGlow { 0%,100% { opacity:0.35; } 50% { opacity:1; } }
        @keyframes beamPulse { 0%,100% { opacity:0.06; } 50% { opacity:0.12; } }
        @keyframes particleFloat { 0% { transform:translateY(0) scale(1); opacity:0.4; } 50% { transform:translateY(-30px) scale(1.1); opacity:0.8; } 100% { transform:translateY(0) scale(1); opacity:0.4; } }
        @keyframes titleReveal { from { opacity:0; letter-spacing:0.22em; } to { opacity:1; letter-spacing:0.12em; } }
        @keyframes cardIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scanline { 0% { transform:translateY(-100%); } 100% { transform:translateY(200vh); } }
        @keyframes statPop { from { opacity:0; transform:scale(0.85) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes chipIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
        .hp-card-animate { animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .hp-chip-animate { animation: chipIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        @media (max-width: 900px) { .hp-grid { grid-template-columns: 1fr 1fr !important; } .hp-hero-stats { flex-wrap: wrap !important; } }
        @media (max-width: 640px) { .hp-grid { grid-template-columns: 1fr !important; } .hp-tabs { gap: 0.35rem !important; } .hp-tabs button { padding: 0.55rem 0.8rem !important; font-size: 0.5rem !important; } }
        @media (max-width: 480px) { .hp-pad { padding-left: 0.9rem !important; padding-right: 0.9rem !important; } }
      `}</style>

      {/* ── AMBIENT ORBS ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "1100px", height: "950px", background: "radial-gradient(ellipse, rgba(110,0,210,0.18) 0%, transparent 55%)", animation: "floatOrb 18s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "0%", right: "-15%", width: "850px", height: "850px", background: "radial-gradient(ellipse, rgba(220,40,90,0.13) 0%, transparent 55%)", animation: "floatOrb2 22s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "25%", width: "900px", height: "600px", background: "radial-gradient(ellipse, rgba(50,15,150,0.12) 0%, transparent 55%)", animation: "floatOrb 26s ease-in-out infinite 3s" }} />
        <div style={{ position: "absolute", top: "35%", left: "35%", width: "600px", height: "600px", background: "radial-gradient(ellipse, rgba(190,90,20,0.07) 0%, transparent 55%)", animation: "floatOrb2 20s ease-in-out infinite 6s" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.07) 30%, rgba(168,85,247,0.07) 70%, transparent)", animation: "scanline 14s linear infinite", opacity: 0.4 }} />
      </div>

      {/* ── NAV ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "0 1rem" : "0 2.5rem", height: "58px", flexShrink: 0, background: "rgba(3,0,9,0.94)", backdropFilter: "blur(30px)", borderBottom: "1px solid rgba(255,255,255,0.036)" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.65) 20%, rgba(251,191,36,0.55) 50%, rgba(239,68,68,0.65) 80%, transparent)", animation: "borderGlow 4s ease-in-out infinite" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#A855F7", boxShadow: "0 0 16px #A855F7, 0 0 35px rgba(168,85,247,0.45)", animation: "pulseDot 2.5s ease-in-out infinite" }} />
          <span style={{ fontSize: "0.95rem", fontWeight: 900, letterSpacing: "5.5px", background: "linear-gradient(135deg, #F5D67A 0%, #E8B830 35%, #D4A017 55%, #E8C840 75%, #F5D67A 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontFamily: "'Cinzel', serif", animation: "hdrShimmer 5s linear infinite" }}>SHADOWWEAVE</span>
        </div>
        {!isMobile && (
          <div style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
            {[["27+", "Story Modes"], ["181+", "Heroines"], ["Venice AI", "Engine"], ["Uncensored", "Model"]].map(([v, l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "rgba(235,195,65,0.85)", lineHeight: 1, fontFamily: "'Cinzel', serif" }}>{v}</div>
                <div style={{ fontSize: "0.4rem", color: "rgba(200,200,220,0.28)", letterSpacing: "2.5px", textTransform: "uppercase", marginTop: "2px", fontFamily: "'Montserrat', sans-serif" }}>{l}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {streak.count >= 2 && (
            <div title={`${streak.count}-day streak`} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.75rem", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "20px", boxShadow: "0 0 12px rgba(245,158,11,0.12)" }}>
              <span style={{ fontSize: "0.8rem" }}>🔥</span>
              <span style={{ fontSize: "0.6rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", color: "rgba(253,186,69,0.88)", fontWeight: 700 }}>{streak.count}</span>
            </div>
          )}
          <button onClick={props.onAchievements} style={{ display: "flex", alignItems: "center", gap: "0.45rem", padding: "0.42rem 0.9rem", background: "rgba(245,214,122,0.07)", border: "1px solid rgba(245,214,122,0.2)", borderRadius: "30px", cursor: "pointer", color: "inherit", transition: "all 0.25s" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,214,122,0.16)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(245,214,122,0.18)"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(245,214,122,0.07)"; e.currentTarget.style.boxShadow = "none"; }}>
            <span style={{ fontSize: "0.68rem" }}>🏆</span>
            {!isMobile && <span style={{ fontSize: "0.54rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(245,214,122,0.78)", fontWeight: 700, fontFamily: "'Cinzel', serif" }}>{achCount > 0 ? `${achCount} · ${achXP} XP` : "Trophies"}</span>}
          </button>
          <button onClick={props.onStoryArchive} style={{ display: "flex", alignItems: "center", gap: "0.45rem", padding: "0.42rem 0.95rem", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.28)", borderRadius: "30px", cursor: "pointer", color: "inherit", transition: "all 0.25s" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,85,247,0.22)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(168,85,247,0.28)"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(168,85,247,0.1)"; e.currentTarget.style.boxShadow = "none"; }}>
            <span style={{ fontSize: "0.68rem", color: "rgba(192,132,252,0.88)" }}>◈</span>
            {!isMobile && <span style={{ fontSize: "0.57rem", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(192,132,252,0.88)", fontWeight: 700, fontFamily: "'Cinzel', serif" }}>Archive</span>}
          </button>
        </div>
      </nav>

      {/* ══ HERO SECTION ══════════════════════════════════════════════════════════ */}
      <div style={{ position: "relative", zIndex: 2, padding: isMobile ? "3.5rem 1rem 2.5rem" : "5rem 2rem 3rem", textAlign: "center", overflow: "hidden" }}>
        {/* Spotlight beams */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "2px", height: "100%", background: "linear-gradient(to bottom, rgba(168,85,247,0.35) 0%, rgba(168,85,247,0.04) 60%, transparent 100%)", filter: "blur(1px)" }} />
          <div style={{ position: "absolute", top: 0, left: "50%", marginLeft: "-200px", width: "400px", height: "320px", background: "radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.22) 0%, transparent 70%)", animation: "beamPulse 4s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: 0, left: "30%", width: "0", height: "0", borderLeft: "280px solid transparent", borderRight: "280px solid transparent", borderTop: "420px solid rgba(168,85,247,0.03)", filter: "blur(8px)", animation: "beamPulse 6s ease-in-out infinite 1s" }} />
          <div style={{ position: "absolute", top: 0, left: "55%", width: "0", height: "0", borderLeft: "220px solid transparent", borderRight: "220px solid transparent", borderTop: "340px solid rgba(220,40,90,0.025)", filter: "blur(10px)", animation: "beamPulse 7s ease-in-out infinite 2s" }} />
          {/* Floating particles */}
          {[
            { top: "20%", left: "12%", s: "6px", d: "3s" }, { top: "55%", left: "8%", s: "4px", d: "5s" },
            { top: "30%", left: "88%", s: "5px", d: "4s" }, { top: "65%", left: "85%", s: "7px", d: "6s" },
            { top: "45%", left: "22%", s: "3px", d: "3.5s" }, { top: "15%", left: "75%", s: "4px", d: "4.5s" },
            { top: "70%", left: "60%", s: "5px", d: "5.5s" }, { top: "25%", left: "50%", s: "3px", d: "2.5s" },
          ].map((p, i) => (
            <div key={i} style={{ position: "absolute", top: p.top, left: p.left, width: p.s, height: p.s, borderRadius: "50%", background: i % 2 === 0 ? "rgba(168,85,247,0.55)" : "rgba(251,191,36,0.45)", boxShadow: `0 0 ${parseInt(p.s) * 3}px ${i % 2 === 0 ? "rgba(168,85,247,0.8)" : "rgba(251,191,36,0.7)"}`, animation: `particleFloat ${p.d} ease-in-out infinite`, animationDelay: `${i * 0.4}s` }} />
          ))}
        </div>

        {/* Eyebrow */}
        <div style={{ fontSize: "0.46rem", letterSpacing: "9px", color: "rgba(168,85,247,0.5)", fontFamily: "'Cinzel', serif", marginBottom: "1rem", textTransform: "uppercase", opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.55s 0.05s ease both" : "none" }}>Professional Dark Narrative Studio</div>

        {/* Main title */}
        <h1 style={{ margin: "0 0 0.5rem", fontFamily: "'Cinzel', serif", fontSize: "clamp(2.2rem, 7vw, 5rem)", fontWeight: 900, letterSpacing: "0.12em", background: "linear-gradient(135deg, #F5D67A 0%, #E8B830 28%, #FFFFFF 50%, #E8B830 72%, #F5D67A 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "hdrShimmer 6s linear infinite, titleReveal 0.9s cubic-bezier(0.22,1,0.36,1) both", lineHeight: 1.05, opacity: mounted ? 1 : 0 }}>CHOOSE YOUR MODE</h1>

        {/* Subtitle */}
        <p style={{ margin: "0 0 2.5rem", fontSize: "0.82rem", color: "rgba(200,195,240,0.35)", fontFamily: "'Raleway', sans-serif", letterSpacing: "2.5px", opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.7s 0.2s ease both" : "none" }}>Each mode generates a fully uncensored AI-written dark narrative</p>

        {/* Divider line */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.2rem", marginBottom: "2.5rem", opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.6s 0.25s ease both" : "none" }}>
          <div style={{ flex: 1, maxWidth: "220px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.5))" }} />
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(168,85,247,0.45)" }} />
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#A855F7", boxShadow: "0 0 18px #A855F7, 0 0 40px rgba(168,85,247,0.4)" }} />
            <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(168,85,247,0.45)" }} />
          </div>
          <div style={{ flex: 1, maxWidth: "220px", height: "1px", background: "linear-gradient(90deg, rgba(168,85,247,0.5), transparent)" }} />
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", flexWrap: "wrap", opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.65s 0.3s ease both" : "none" }}>
          <button
            onClick={props.onSurpriseMe}
            onMouseEnter={() => setSurpriseHov(true)}
            onMouseLeave={() => setSurpriseHov(false)}
            style={{ display: "flex", alignItems: "center", gap: "0.85rem", padding: "1rem 2.8rem", background: surpriseHov ? "linear-gradient(135deg, rgba(109,40,217,0.75), rgba(147,51,234,0.75))" : "linear-gradient(135deg, rgba(109,40,217,0.28), rgba(147,51,234,0.28))", border: `1.5px solid ${surpriseHov ? "rgba(168,85,247,0.9)" : "rgba(168,85,247,0.38)"}`, borderRadius: "60px", cursor: "pointer", transition: "all 0.32s", animation: "surpriseGlow 3s ease-in-out infinite", boxShadow: surpriseHov ? "0 12px 50px rgba(109,40,217,0.55), 0 0 90px rgba(168,85,247,0.22)" : "0 0 30px rgba(168,85,247,0.22)", transform: surpriseHov ? "translateY(-4px) scale(1.04)" : "none" }}>
            <span style={{ fontSize: "1.3rem", filter: surpriseHov ? "drop-shadow(0 0 12px rgba(168,85,247,1))" : "none", transition: "filter 0.3s" }}>⚡</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.9rem", fontWeight: 900, letterSpacing: "3.5px", textTransform: "uppercase", color: surpriseHov ? "#F0EDFF" : "rgba(200,160,255,0.85)", transition: "color 0.3s", textShadow: surpriseHov ? "0 0 28px rgba(168,85,247,0.9)" : "none" }}>Surprise Me</div>
              <div style={{ fontSize: "0.5rem", color: surpriseHov ? "rgba(192,132,252,0.65)" : "rgba(168,85,247,0.32)", transition: "color 0.3s", letterSpacing: "2px", fontFamily: "'Montserrat', sans-serif", marginTop: "2px" }}>Launch Random Mode</div>
            </div>
          </button>
          <button onClick={() => setShowDice(true)}
            style={{ display: "flex", alignItems: "center", gap: "0.7rem", padding: "1rem 2rem", background: "rgba(28,38,88,0.35)", border: "1.5px solid rgba(90,110,210,0.3)", borderRadius: "60px", cursor: "pointer", transition: "all 0.28s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(28,38,88,0.65)"; e.currentTarget.style.borderColor = "rgba(90,110,210,0.72)"; e.currentTarget.style.boxShadow = "0 10px 36px rgba(60,80,200,0.22)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(28,38,88,0.35)"; e.currentTarget.style.borderColor = "rgba(90,110,210,0.3)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
            <span style={{ fontSize: "1.1rem" }}>⚄</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(140,168,255,0.82)" }}>Story Dice</div>
              <div style={{ fontSize: "0.48rem", color: "rgba(110,135,215,0.38)", letterSpacing: "2px", fontFamily: "'Montserrat', sans-serif", marginTop: "2px" }}>Spark an Idea</div>
            </div>
          </button>
        </div>

        {/* Floating stat pills */}
        <div className="hp-hero-stats" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginTop: "2.8rem", flexWrap: "wrap", opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.65s 0.38s ease both" : "none" }}>
          {[
            { v: "27+", l: "Story Modes", c: "168,85,247", d: "0s" },
            { v: "181+", l: "Heroines", c: "251,191,36", d: "0.06s" },
            { v: "8", l: "Universes", c: "52,211,153", d: "0.12s" },
            { v: "Venice AI", l: "Powered By", c: "248,113,113", d: "0.18s" },
            { v: "100%", l: "Uncensored", c: "232,121,249", d: "0.24s" },
          ].map(({ v, l, c, d }) => (
            <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0.55rem 1.1rem", background: `rgba(${c},0.06)`, border: `1px solid rgba(${c},0.18)`, borderRadius: "40px", backdropFilter: "blur(16px)", animation: mounted ? `statPop 0.5s ${d} cubic-bezier(0.22,1,0.36,1) both` : "none", gap: "1px" }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.88rem", fontWeight: 900, color: `rgba(${c},0.9)`, textShadow: `0 0 20px rgba(${c},0.35)`, letterSpacing: "1px" }}>{v}</span>
              <span style={{ fontSize: "0.38rem", letterSpacing: "2.5px", color: `rgba(${c},0.38)`, fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", fontWeight: 700 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── JUMP BACK IN ── */}
      {recentModes.length > 0 && (
        <div className="hp-pad" style={{ padding: "0 2rem 1.5rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.6s 0.4s ease both" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.7rem" }}>
            <div style={{ width: "3px", height: "14px", borderRadius: "2px", background: "linear-gradient(to bottom, rgba(168,85,247,0.85), rgba(168,85,247,0.1))", boxShadow: "0 0 8px rgba(168,85,247,0.3)" }} />
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.44rem", letterSpacing: "4.5px", color: "rgba(168,85,247,0.52)", textTransform: "uppercase", fontWeight: 700 }}>Jump Back In</span>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(168,85,247,0.15), transparent)" }} />
          </div>
          <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap" }}>
            {recentModes.map((rm, i) => (
              <div key={rm.page} className="hp-chip-animate" style={{ animationDelay: `${i * 0.04}s` }}>
                <RecentModeChip rm={rm} onClick={() => { const k = PAGE_MAP[rm.page]; if (k) (props[k] as () => void)(); }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DAILY DISPATCH ── */}
      <div className="hp-pad" style={{ padding: "0 2rem 2.2rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.65s 0.42s ease both" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.8rem" }}>
          <div style={{ width: "3px", height: "14px", borderRadius: "2px", background: "linear-gradient(to bottom, rgba(251,191,36,0.85), rgba(251,191,36,0.1))", boxShadow: "0 0 8px rgba(251,191,36,0.35)" }} />
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.44rem", letterSpacing: "4.5px", color: "rgba(251,191,36,0.5)", textTransform: "uppercase", fontWeight: 700 }}>Today's Ritual</span>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(251,191,36,0.18), transparent)" }} />
        </div>
        <DailyDispatch heroine={heroine} villain={villain} setting={setting} title={dailyTitle} today={today} onGenerate={props.onDailyScenario} onChronicle={props.onDailyChronicle} />
      </div>

      {/* ══ MODE CATALOGUE ════════════════════════════════════════════════════════ */}
      <div className="hp-pad" style={{ padding: "0 2rem 2.5rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.7s 0.45s ease both" : "none" }}>
        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "1.2rem" }}>
          <div style={{ width: "3px", height: "14px", borderRadius: "2px", background: "linear-gradient(to bottom, rgba(168,85,247,0.9), rgba(168,85,247,0.1))", boxShadow: "0 0 10px rgba(168,85,247,0.4)" }} />
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.44rem", letterSpacing: "4.5px", color: "rgba(168,85,247,0.55)", textTransform: "uppercase", fontWeight: 700 }}>Mode Catalogue</span>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(168,85,247,0.2), transparent)" }} />
        </div>

        {/* Tab bar */}
        <div className="hp-tabs" style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.1rem", background: active ? "rgba(168,85,247,0.22)" : "rgba(168,85,247,0.05)", border: `1px solid ${active ? "rgba(168,85,247,0.65)" : "rgba(168,85,247,0.14)"}`, borderRadius: "40px", cursor: "pointer", transition: "all 0.22s", boxShadow: active ? "0 0 22px rgba(168,85,247,0.25)" : "none", position: "relative" }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(168,85,247,0.12)"; e.currentTarget.style.borderColor = "rgba(168,85,247,0.35)"; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "rgba(168,85,247,0.05)"; e.currentTarget.style.borderColor = "rgba(168,85,247,0.14)"; } }}
              >
                <span style={{ fontSize: "0.8rem" }}>{tab.icon}</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "1.5px", color: active ? "rgba(220,190,255,0.95)" : "rgba(168,85,247,0.52)", transition: "color 0.2s", whiteSpace: "nowrap" }}>{tab.label}</span>
                {active && <div style={{ position: "absolute", bottom: "-1px", left: "20%", right: "20%", height: "2px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.9), transparent)", borderRadius: "2px", boxShadow: "0 0 10px rgba(168,85,247,0.6)" }} />}
              </button>
            );
          })}
        </div>

        {/* Mode grid — Story Modes */}
        {activeTab !== "tools" && (
          <div className="hp-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.9rem" }}>
            {visibleModes.map((m, i) => (
              <div key={m.id} className="hp-card-animate" style={{ animationDelay: `${i * 0.04}s`, gridColumn: (m.size === "large" && !isMobile) ? "span 1" : undefined }}>
                <ModeCard {...m} size={m.size ?? "normal"} />
              </div>
            ))}
          </div>
        )}

        {/* Tools grid */}
        {activeTab === "tools" && (
          <div className="hp-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.9rem" }}>
            {toolModes.map((m, i) => (
              <div key={m.id} className="hp-card-animate" style={{ animationDelay: `${i * 0.045}s` }}>
                <ModeCard {...m} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ACTIVITY + STATS ── */}
      <div className="hp-pad" style={{ padding: "0 2rem 2rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.6s 0.5s ease both" : "none", display: "flex", gap: "1.2rem", flexWrap: "wrap" }}>
        <div style={{ flex: "2 1 400px", padding: "0.9rem 1.3rem", background: "rgba(5,2,13,0.88)", border: "1px solid rgba(34,197,94,0.1)", borderRadius: "18px", backdropFilter: "blur(16px)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.65rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 10px rgba(34,197,94,0.75)", animation: "pulseDot 2.5s ease-in-out infinite" }} />
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.42rem", letterSpacing: "4px", color: "rgba(34,197,94,0.52)", textTransform: "uppercase" }}>Writing Activity · 91 Days</span>
            </div>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.58rem", color: "rgba(34,197,94,0.62)", fontWeight: 700 }}>{activeDays > 0 ? `${activeDays} active day${activeDays !== 1 ? "s" : ""}` : "No stories yet"}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
            {activitySlots.map((slot) => {
              const has = activitySet.has(slot.key);
              return (
                <div key={slot.key} title={slot.key + (has ? " · Story written" : "")}
                  style={{ width: "9px", height: "9px", borderRadius: "2px", background: slot.isToday ? (has ? "rgba(34,197,94,0.95)" : "rgba(34,197,94,0.28)") : has ? "rgba(34,197,94,0.58)" : "rgba(255,255,255,0.038)", border: slot.isToday ? "1px solid rgba(34,197,94,0.65)" : "none", boxShadow: slot.isToday && has ? "0 0 10px rgba(34,197,94,0.65)" : "none", transition: "transform 0.12s", cursor: "default", flexShrink: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.6)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                />
              );
            })}
          </div>
        </div>
        {archiveStats.total > 0 && (
          <div style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              { value: archiveStats.total.toString(), label: "Stories Written", color: "168,85,247", icon: "📖" },
              { value: archiveStats.totalWords >= 1000 ? `${(archiveStats.totalWords / 1000).toFixed(1)}k` : archiveStats.totalWords.toString(), label: "Total Words", color: "251,191,36", icon: "✍" },
              { value: archiveStats.uniqueHeroines.toString(), label: "Heroines Used", color: "249,115,22", icon: "⚡" },
              { value: archiveStats.modesTried.toString(), label: "Modes Tried", color: "52,211,153", icon: "🎭" },
            ].map(({ value, label, color, icon }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.55rem 0.9rem", background: "rgba(5,2,13,0.78)", border: `1px solid rgba(${color},0.1)`, borderRadius: "12px", backdropFilter: "blur(12px)" }}>
                <span style={{ fontSize: "0.78rem" }}>{icon}</span>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", fontWeight: 900, color: `rgba(${color},0.9)`, textShadow: `0 0 18px rgba(${color},0.3)`, minWidth: "36px" }}>{value}</div>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.38rem", letterSpacing: "2px", color: `rgba(${color},0.33)`, textTransform: "uppercase", fontWeight: 700 }}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── INFAMY BOARD ── */}
      {topVillains.length > 0 && (
        <div className="hp-pad" style={{ padding: "0 2rem 2.5rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.65s 0.52s ease both" : "none" }}>
          <div style={{ border: "1px solid rgba(239,68,68,0.12)", borderRadius: "20px", overflow: "hidden", background: "rgba(5,2,14,0.9)", backdropFilter: "blur(20px)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.5rem", borderBottom: "1px solid rgba(239,68,68,0.07)", background: "rgba(239,68,68,0.035)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#EF4444", boxShadow: "0 0 12px rgba(239,68,68,0.75)", animation: "pulseDot 2.5s ease-in-out infinite" }} />
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.44rem", letterSpacing: "5px", color: "rgba(239,68,68,0.58)", textTransform: "uppercase", fontWeight: 700 }}>Infamy Board</span>
                <span style={{ fontSize: "0.37rem", color: "rgba(200,200,220,0.18)", letterSpacing: "2px", fontFamily: "'Montserrat', sans-serif" }}>· Most Feared Adversaries ·</span>
              </div>
              <span style={{ fontSize: "0.37rem", letterSpacing: "2px", color: "rgba(239,68,68,0.2)", fontFamily: "'Cinzel', serif", textTransform: "uppercase" }}>Based on your archive</span>
            </div>
            <div style={{ display: "flex", alignItems: "stretch", overflowX: isMobile ? "auto" : "visible" }}>
              {topVillains.map((vs, i) => (
                <div key={vs.name} style={{ flex: isMobile ? "0 0 155px" : 1, minWidth: isMobile ? "155px" : undefined, padding: "1.1rem 1.3rem", borderRight: i < topVillains.length - 1 ? "1px solid rgba(239,68,68,0.06)" : "none", display: "flex", flexDirection: "column", gap: "0.4rem", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 110%, rgba(${vs.level.rgb},0.07) 0%, transparent 70%)`, pointerEvents: "none" }} />
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.58rem", fontWeight: 900, color: `rgba(${vs.level.rgb},0.22)`, letterSpacing: "1px" }}>#{i + 1}</div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.8rem", fontWeight: 700, color: i === 0 ? vs.level.color : "rgba(222,218,248,0.72)", letterSpacing: "0.5px", lineHeight: 1.2, textShadow: i === 0 ? `0 0 24px ${vs.level.glow}` : "none" }}>{vs.name}</div>
                  <div style={{ display: "inline-flex", alignItems: "center", padding: "0.16rem 0.6rem", borderRadius: "10px", background: `rgba(${vs.level.rgb},0.1)`, border: `1px solid rgba(${vs.level.rgb},0.22)`, alignSelf: "flex-start" }}>
                    <span style={{ fontSize: "0.38rem", letterSpacing: "2px", color: vs.level.color, fontFamily: "'Cinzel', serif", textTransform: "uppercase", fontWeight: 700 }}>{vs.level.title}</span>
                  </div>
                  <div style={{ fontSize: "0.38rem", color: "rgba(200,200,220,0.24)", letterSpacing: "2px", fontFamily: "'Montserrat', sans-serif" }}>{vs.count} {vs.count === 1 ? "story" : "stories"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer gap */}
      <div style={{ height: "2rem" }} />
    </div>
  );
}
