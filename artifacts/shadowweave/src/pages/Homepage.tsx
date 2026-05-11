import { useState, useEffect, useRef, useCallback } from "react";
import StoryDice from "../components/StoryDice";
import { getStreak } from "../lib/streak";
import { getUnlockCount, getTotalXP } from "../lib/achievements";
import { getWritingActivitySet, buildActivitySlots } from "../lib/activityMap";
import { useIsMobile } from "../hooks/useIsMobile";
import { getArchive } from "../lib/archive";
import { getThreatLevel } from "../lib/threatLevel";
import DarknessRankBadge from "../components/DarknessRankBadge";
import { getUnlockStatus } from "../lib/modeUnlocks";
import { getTotalUnspentValue } from "../lib/vaultKeys";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface HomepageProps {
  onEnter: () => void;
  onCaptorPortal: () => void;
  onScenarioGenerator: () => void;
  onCharacterMapper: () => void;
  onSoundingBoard: () => void;
  onCaptorLogic: () => void;
  onSuperheroMode: () => void;
  onCelebrityMode: () => void;
  onStoryArchive: () => void;
  onDailyScenario: () => void;
  onDailyChronicle: () => void;
  onRescueGoneWrong: () => void;
  onPowerDrain: () => void;
  onTheHandler: () => void;
  onSurpriseMe: () => void;
  onStoryArcs: () => void;
  onHeroineDossier: () => void;
  onVillainBuilder: () => void;
  onRelationshipMap: () => void;
  onAchievements: () => void;
  onVault?: () => void;
  onTimeLoop: () => void;
  onStoryContinuation: () => void;
  onDirectorMode: () => void;
  onEscapeAttempt: () => void;
  onHeroineImageGen: () => void;
  onVillainInterrogation: () => void;
  onCivilianCapture: () => void;
  onBountyBoard: () => void;
  onHeroineLore: () => void;
  onStoryTimeline: () => void;
  onDarkDossier?: () => void;
  onCWSpecialist?: () => void;
  onPsychDark?: () => void;
  onSpectacleHub?: () => void;
  onCaptivityHub?: () => void;
  onCampaignMode?: () => void;
  onVillainHub?: () => void;
  onResearchFacility?: () => void;
  onGladiatorProtocol?: () => void;
  onTheWitness?: () => void;
  onSleeperProtocol?: () => void;
  onAuctionBlock?: () => void;
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

function ModeCard({ icon, title, desc, badge, accent, r, g, b, onClick, isNew }: {
  icon: string; title: string; desc: string; badge: string;
  accent: string; r: number; g: number; b: number;
  onClick?: () => void; isNew?: boolean;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${r},${g},${b}`;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", cursor: "pointer", borderRadius: "16px", padding: "1.1rem 1.2rem",
        background: hov ? `rgba(${rgb},0.1)` : "rgba(6,2,16,0.75)",
        border: `1px solid rgba(${rgb},${hov ? 0.55 : 0.1})`,
        transition: "all 0.28s cubic-bezier(0.22,1,0.36,1)",
        transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? `0 12px 40px rgba(${rgb},0.22), 0 0 0 1px rgba(${rgb},0.08)` : "none",
        backdropFilter: "blur(14px)",
        display: "flex", flexDirection: "column", gap: "0.55rem",
        minHeight: "110px",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", borderRadius: "16px 16px 0 0",
        background: `linear-gradient(90deg, transparent, rgba(${rgb},${hov ? 0.8 : 0.25}), transparent)`,
        transition: "opacity 0.3s" }} />
      {isNew && (
        <div style={{
          position: "absolute", top: "0.65rem", right: "0.75rem",
          padding: "2px 7px", borderRadius: "6px",
          background: `rgba(${rgb},0.22)`, border: `1px solid rgba(${rgb},0.5)`,
          fontSize: "0.28rem", letterSpacing: "2px", color: accent,
          fontFamily: "'Montserrat', sans-serif", fontWeight: 800, textTransform: "uppercase",
        }}>NEW</div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
        <div style={{
          width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0,
          background: hov ? `rgba(${rgb},0.22)` : `rgba(${rgb},0.07)`,
          border: `1px solid rgba(${rgb},${hov ? 0.45 : 0.12})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.9rem",
          filter: hov ? `drop-shadow(0 0 6px rgba(${rgb},0.8))` : "none",
          transition: "all 0.25s",
        }}>{icon}</div>
        <div>
          <div style={{
            fontFamily: "'Cinzel', serif", fontSize: "0.62rem", fontWeight: 700,
            color: hov ? "#fff" : "rgba(220,215,255,0.78)",
            letterSpacing: "0.04em", lineHeight: 1.15,
            textShadow: hov ? `0 0 20px rgba(${rgb},0.55)` : "none",
            transition: "all 0.22s",
          }}>{title}</div>
          <div style={{
            fontSize: "0.3rem", letterSpacing: "1.8px",
            color: hov ? `rgba(${rgb},0.7)` : `rgba(${rgb},0.28)`,
            fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
            textTransform: "uppercase", marginTop: "2px", transition: "color 0.22s",
          }}>{badge}</div>
        </div>
      </div>
      <div style={{
        fontSize: "0.62rem", color: "rgba(200,195,235,0.52)",
        fontFamily: "'Raleway', sans-serif", lineHeight: 1.55,
        maxHeight: hov ? "60px" : "0",
        opacity: hov ? 1 : 0,
        overflow: "hidden",
        transition: "max-height 0.32s ease, opacity 0.25s ease",
      }}>{desc}</div>
      {hov && (
        <div style={{
          fontSize: "0.48rem", color: accent, fontFamily: "'Cinzel', serif",
          letterSpacing: "2px", fontWeight: 700, textTransform: "uppercase",
          textShadow: `0 0 18px rgba(${rgb},0.7)`,
        }}>Open →</div>
      )}
    </div>
  );
}

function HubCard({ icon, title, badge, desc, count, accent, r, g, b, onClick }: {
  icon: string; title: string; badge: string; desc: string; count: string;
  accent: string; r: number; g: number; b: number; onClick?: () => void;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${r},${g},${b}`;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", cursor: "pointer", borderRadius: "18px", overflow: "hidden",
        padding: "1.5rem 1.4rem 1.4rem",
        background: hov
          ? `linear-gradient(135deg, rgba(${rgb},0.18) 0%, rgba(4,1,12,0.92) 100%)`
          : `linear-gradient(135deg, rgba(${rgb},0.07) 0%, rgba(4,1,12,0.85) 100%)`,
        border: `1px solid rgba(${rgb},${hov ? 0.5 : 0.12})`,
        transition: "all 0.32s cubic-bezier(0.22,1,0.36,1)",
        transform: hov ? "translateY(-6px) scale(1.01)" : "none",
        boxShadow: hov ? `0 20px 60px rgba(${rgb},0.28), 0 0 0 1px rgba(${rgb},0.1)` : "0 4px 20px rgba(0,0,0,0.4)",
        backdropFilter: "blur(20px)",
        display: "flex", flexDirection: "column", gap: "0.8rem",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: `linear-gradient(90deg, transparent, rgba(${rgb},${hov ? 1 : 0.35}), transparent)`,
        boxShadow: hov ? `0 0 20px rgba(${rgb},0.6)` : "none",
        transition: "all 0.32s" }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "12px",
          background: hov ? `rgba(${rgb},0.25)` : `rgba(${rgb},0.1)`,
          border: `1px solid rgba(${rgb},${hov ? 0.5 : 0.2})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.1rem",
          boxShadow: hov ? `0 0 24px rgba(${rgb},0.5)` : "none",
          transition: "all 0.28s",
        }}>{icon}</div>
        <div style={{
          padding: "0.2rem 0.65rem", borderRadius: "20px",
          background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.28)`,
          fontSize: "0.36rem", letterSpacing: "2px", color: accent,
          fontFamily: "'Montserrat', sans-serif", fontWeight: 800, textTransform: "uppercase",
        }}>{count}</div>
      </div>
      <div>
        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: "0.85rem", fontWeight: 900,
          color: hov ? "#fff" : "rgba(230,225,255,0.85)",
          letterSpacing: "0.05em", lineHeight: 1.1, marginBottom: "0.3rem",
          textShadow: hov ? `0 0 30px rgba(${rgb},0.6)` : "none",
          transition: "all 0.28s",
        }}>{title}</div>
        <div style={{
          fontSize: "0.3rem", letterSpacing: "2.5px",
          color: `rgba(${rgb},${hov ? 0.7 : 0.32})`,
          fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
          textTransform: "uppercase", marginBottom: "0.6rem", transition: "color 0.25s",
        }}>{badge}</div>
        <div style={{
          fontSize: "0.64rem", color: "rgba(200,195,240,0.55)",
          fontFamily: "'Raleway', sans-serif", lineHeight: 1.55,
        }}>{desc}</div>
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: "0.5rem",
        paddingTop: "0.75rem",
        borderTop: `1px solid rgba(${rgb},${hov ? 0.25 : 0.06})`,
        transition: "border-color 0.28s",
      }}>
        <span style={{
          fontFamily: "'Cinzel', serif", fontSize: "0.5rem", letterSpacing: "3px",
          color: hov ? accent : `rgba(${rgb},0.35)`,
          fontWeight: 900, textTransform: "uppercase",
          textShadow: hov ? `0 0 18px rgba(${rgb},0.8)` : "none",
          transition: "all 0.25s",
        }}>Enter Hub →</span>
      </div>
    </div>
  );
}

function CoreCard({ title, tag, accent, r, g, b, onClick, children }: {
  title: string; tag: string; accent: string; r: number; g: number; b: number;
  onClick: () => void; children?: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${r},${g},${b}`;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: "1 1 0", minWidth: 0, cursor: "pointer", borderRadius: "18px",
        padding: "1.6rem 1.5rem",
        background: hov
          ? `linear-gradient(140deg, rgba(${rgb},0.22) 0%, rgba(4,1,14,0.95) 100%)`
          : `linear-gradient(140deg, rgba(${rgb},0.08) 0%, rgba(4,1,14,0.9) 100%)`,
        border: `1px solid rgba(${rgb},${hov ? 0.6 : 0.14})`,
        transition: "all 0.32s cubic-bezier(0.22,1,0.36,1)",
        transform: hov ? "translateY(-6px)" : "none",
        boxShadow: hov
          ? `0 24px 70px rgba(${rgb},0.32), 0 0 0 1px rgba(${rgb},0.1)`
          : "0 4px 24px rgba(0,0,0,0.5)",
        backdropFilter: "blur(24px)",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: `linear-gradient(90deg, transparent, rgba(${rgb},${hov ? 1 : 0.4}), transparent)`,
        boxShadow: hov ? `0 0 28px rgba(${rgb},0.7)` : "none",
        transition: "all 0.32s" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px",
        background: `linear-gradient(90deg, transparent, rgba(${rgb},${hov ? 0.3 : 0}), transparent)`,
        transition: "all 0.32s" }} />
      <div style={{
        fontSize: "0.32rem", letterSpacing: "3.5px",
        color: hov ? `rgba(${rgb},0.7)` : `rgba(${rgb},0.3)`,
        fontFamily: "'Montserrat', sans-serif", fontWeight: 800,
        textTransform: "uppercase", marginBottom: "0.6rem", transition: "color 0.25s",
      }}>{tag}</div>
      <div style={{
        fontFamily: "'Cinzel', serif", fontSize: "1.15rem", fontWeight: 900,
        color: hov ? "#fff" : "rgba(235,230,255,0.88)",
        letterSpacing: "0.06em", lineHeight: 1.05, marginBottom: "0.9rem",
        textShadow: hov ? `0 0 40px rgba(${rgb},0.7), 0 0 80px rgba(${rgb},0.2)` : "none",
        transition: "all 0.32s",
      }}>{title}</div>
      {children}
      <div style={{
        marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem",
        paddingTop: "0.85rem",
        borderTop: `1px solid rgba(${rgb},${hov ? 0.3 : 0.07})`,
        transition: "border-color 0.28s",
      }}>
        <span style={{
          fontFamily: "'Cinzel', serif", fontSize: "0.56rem", letterSpacing: "3.5px",
          color: hov ? accent : `rgba(${rgb},0.3)`,
          fontWeight: 900, textTransform: "uppercase",
          textShadow: hov ? `0 0 22px rgba(${rgb},0.9)` : "none",
          transition: "all 0.25s",
        }}>Enter the Dark →</span>
        <div style={{ display: "flex", gap: "4px", marginLeft: "auto" }}>
          {[1,2,3].map(i => (
            <div key={i} style={{
              width: "5px", height: "5px", borderRadius: "50%",
              background: `rgba(${rgb},${hov ? 1.1 - i*0.3 : 0.12})`,
              boxShadow: hov ? `0 0 10px rgba(${rgb},0.8)` : "none",
              transition: "all 0.25s",
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Homepage(props: HomepageProps) {
  const isMobile = useIsMobile(768);
  const [mounted, setMounted] = useState(false);
  const [showDice, setShowDice] = useState(false);
  const [activeTab, setActiveTab] = useState<"modes" | "tools">("modes");
  const [clock, setClock] = useState("");
  const [streak] = useState(() => getStreak());
  const [achCount] = useState(() => getUnlockCount());
  const [achXP] = useState(() => getTotalXP());
  const [vaultKeyValue] = useState(() => { try { return getTotalUnspentValue(); } catch { return 0; } });
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

  const storyModes = [
    { icon: "🎬", title: "Director Mode", badge: "You Control · Scene by Scene", desc: "You write every direction. The AI executes it exactly — no random events, no surprises.", r: 52, g: 211, b: 153, accent: "#34D399", onClick: props.onDirectorMode },
    { icon: "💀", title: "Villain Mode", badge: "Live Dialogue · You're the Villain", desc: "You play the villain. Type every line. The AI plays the heroine — afraid, defiant, cracking.", r: 220, g: 38, b: 38, accent: "#DC2626", onClick: props.onVillainInterrogation },
    { icon: "🕸", title: "Rescue Gone Wrong", badge: "Trap · Ambush", desc: "The cavalry never comes. The would-be rescuer becomes the villain's newest prize.", r: 251, g: 146, b: 60, accent: "#FB923C", onClick: props.onRescueGoneWrong },
    { icon: "⚡", title: "Power Drain", badge: "Meter · Drain Arc", desc: "Watch the meter fall. Her abilities bleed out with every passing hour.", r: 96, g: 165, b: 250, accent: "#60A5FA", onClick: props.onPowerDrain },
    { icon: "🕵", title: "The Handler", badge: "Covert · Intimate Control", desc: "Control through closeness. The villain gets close enough that escape feels like betrayal.", r: 252, g: 163, b: 17, accent: "#FCA311", onClick: props.onTheHandler },
    { icon: "⟳", title: "Time Loop", badge: "Loop · Villain Knows All", desc: "She resets. He remembers. Each loop teaches him exactly how to break her faster.", r: 56, g: 189, b: 248, accent: "#38BDF8", onClick: props.onTimeLoop },
    { icon: "🏃", title: "Escape Attempt", badge: "Turn-Based · 8 Beats", desc: "One shot. You choose every action — the AI plays out brutal consequences.", r: 251, g: 146, b: 60, accent: "#FB923C", onClick: props.onEscapeAttempt },
    { icon: "▶", title: "Story Continuation", badge: "Continue Any Story", desc: "Pick up any saved story and add new chapters. No story ever has to end.", r: 52, g: 211, b: 153, accent: "#34D399", onClick: props.onStoryContinuation },
    { icon: "📖", title: "Campaign Sagas", badge: "Multi-Chapter · Linked", desc: "Linked multi-chapter sagas with persistent continuity — conditioning states and voice profiles carry forward.", r: 192, g: 132, b: 252, accent: "#C084FC", onClick: props.onCampaignMode, isNew: true },
    { icon: "♟", title: "Villain Hub", badge: "8 Villains · Methodology-First", desc: "Choose your villain first. Joker chaos, Talia conditioning, Lena's clinical precision, Ra's inevitability.", r: 239, g: 68, b: 68, accent: "#EF4444", onClick: props.onVillainHub, isNew: true },
    { icon: "⚗️", title: "Research Facility", badge: "Clinical · Classified", desc: "Behavioral research as formal logs — hypothesis, procedure, observations, and a private note that breaks protocol.", r: 6, g: 182, b: 212, accent: "#06B6D4", onClick: props.onResearchFacility, isNew: true },
  ];

  const hubs = [
    { icon: "🏛", title: "Spectacle Hub", badge: "9 Modes", count: "9 Modes", desc: "Hero auctions, arenas, gladiator protocol, auction blocks, betting pools, villain team-ups. Victory as performance.", r: 252, g: 163, b: 17, accent: "#FCA311", onClick: props.onSpectacleHub },
    { icon: "⛓", title: "Captivity Arcs", badge: "11 Modes", count: "11 Modes", desc: "Corruption arcs, conditioning, slow burn, sleeper protocol, the witness, dual captures, faction wars, sequel generation.", r: 52, g: 211, b: 153, accent: "#34D399", onClick: props.onCaptivityHub },
    { icon: "🧠", title: "Psych Dark", badge: "6 Modes", count: "6 Modes", desc: "Interrogation, mind break, dark mirror, dream sequences, negotiation, confined spaces. The mind is the battlefield.", r: 192, g: 132, b: 252, accent: "#C084FC", onClick: props.onPsychDark },
    { icon: "⚡", title: "CW Specialist", badge: "Arrow · The Flash", count: "3 Tools", desc: "The darkest Arrow/Flash episodes, pivotal canon rewrites, or full villain season arcs.", r: 74, g: 222, b: 128, accent: "#4ADE80", onClick: props.onCWSpecialist },
  ];

  const tools = [
    { icon: "🏰", title: "Captor Portal", badge: "Build · Customise", desc: "Design your ideal captor from scratch — profile, methods, and the full architecture of control.", r: 248, g: 113, b: 113, accent: "#F87171", onClick: props.onCaptorPortal },
    { icon: "🗺", title: "Character Mapper", badge: "Network · Visualise", desc: "Chart every connection — loyalty, tension, power, betrayal — as a living visual web.", r: 96, g: 165, b: 250, accent: "#60A5FA", onClick: props.onCharacterMapper },
    { icon: "💬", title: "Sounding Board", badge: "AI Partner · Brainstorm", desc: "Pitch your scenario to a strategic AI partner. Get plot angles and narrative pressure-testing.", r: 192, g: 132, b: 252, accent: "#C084FC", onClick: props.onSoundingBoard },
    { icon: "⚙", title: "Captor Logic", badge: "Psych Profile · Deep", desc: "Build a clinical psychological profile — motivations, methods, and pressure points in forensic detail.", r: 251, g: 191, b: 36, accent: "#FBBF24", onClick: props.onCaptorLogic },
    { icon: "📚", title: "Story Arcs", badge: "Structure · Campaigns", desc: "Design multi-chapter arc blueprints with consistent narrative threads.", r: 232, g: 121, b: 249, accent: "#E879F9", onClick: props.onStoryArcs },
    { icon: "📁", title: "Heroine Dossier", badge: "210+ Profiles", desc: "Browse 210+ captured heroines — full profiles, powers, aliases, and backstories.", r: 248, g: 113, b: 113, accent: "#F87171", onClick: props.onHeroineDossier },
    { icon: "🔮", title: "Villain Builder", badge: "Custom · Original", desc: "Create a completely original villain from scratch — appearance, psychology, history, and darkness.", r: 96, g: 165, b: 250, accent: "#60A5FA", onClick: props.onVillainBuilder },
    { icon: "🕸", title: "Relationship Map", badge: "Network · Web", desc: "Plot who controls whom, who wants what, and who is expendable.", r: 52, g: 211, b: 153, accent: "#34D399", onClick: props.onRelationshipMap },
    { icon: "🎨", title: "Image Generator", badge: "AI Art · Uncensored", desc: "Describe any scene. Venice AI renders it uncensored in stunning detail.", r: 192, g: 132, b: 252, accent: "#C084FC", onClick: props.onHeroineImageGen },
    { icon: "🎯", title: "Bounty Board", badge: "Weekly · Challenges", desc: "Six rotating weekly contracts. Complete them across modes to earn exclusive rewards.", r: 245, g: 158, b: 11, accent: "#F59E0B", onClick: props.onBountyBoard },
    { icon: "📜", title: "Heroine Lore", badge: "Living Record · Portraits", desc: "A living chronicle of every heroine who has passed through the dark — how she changed, what broke her.", r: 168, g: 85, b: 247, accent: "#A855F7", onClick: props.onHeroineLore },
    { icon: "🗓", title: "Story Timeline", badge: "Visual Archive", desc: "Every story laid out as a visual horizontal timeline — grouped by date, mode, or villain.", r: 96, g: 165, b: 250, accent: "#60A5FA", onClick: props.onStoryTimeline },
    { icon: "📊", title: "Dark Dossier", badge: "Stats · Milestones", desc: "Your complete shadow record — total stories, words written, mode breakdown, and unlockable secrets.", r: 168, g: 85, b: 247, accent: "#A855F7", onClick: props.onDarkDossier },
  ];

  const pad = isMobile ? "0 1rem" : "0 2.5rem";

  return (
    <div style={{ minHeight: "100vh", background: "transparent", fontFamily: "'Cinzel', serif" }}>
      {showDice && <StoryDice onClose={() => setShowDice(false)} />}

      <style>{`
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(0.55);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        @keyframes hdrShimmer{0%{background-position:0% center;}100%{background-position:200% center;}}
        @keyframes floatOrb{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-30px) scale(1.04);}}
        @keyframes floatOrb2{0%,100%{transform:translateY(0);}50%{transform:translateY(22px);}}
        @keyframes borderGlow{0%,100%{opacity:0.4;}50%{opacity:1;}}
        @keyframes surpriseGlow{0%,100%{box-shadow:0 0 24px rgba(168,85,247,0.35),0 0 60px rgba(168,85,247,0.08);}50%{box-shadow:0 0 44px rgba(168,85,247,0.7),0 0 100px rgba(168,85,247,0.18);}}
        @keyframes heroIn{from{opacity:0;transform:scale(0.97) translateY(12px);}to{opacity:1;transform:scale(1) translateY(0);}}
        @keyframes scanLine{0%{transform:translateY(-100%);opacity:0;}15%{opacity:0.5;}85%{opacity:0.5;}100%{transform:translateY(200%);opacity:0;}}
        @keyframes counterUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        .hp-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:0.85rem;}
        .hp-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;}
        .hp-grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:0.85rem;}
        @media(max-width:1100px){.hp-grid-4{grid-template-columns:repeat(2,1fr)!important;}}
        @media(max-width:900px){.hp-grid-3{grid-template-columns:repeat(2,1fr)!important;}.hp-core{flex-direction:column!important;}}
        @media(max-width:600px){.hp-grid-3{grid-template-columns:1fr!important;}.hp-grid-4{grid-template-columns:1fr!important;}.hp-grid-2{grid-template-columns:1fr!important;}}
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
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.6) 20%, rgba(251,191,36,0.5) 50%, rgba(239,68,68,0.6) 80%, transparent)",
          animation: "borderGlow 4s ease-in-out infinite" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#A855F7", boxShadow: "0 0 14px #A855F7, 0 0 32px rgba(168,85,247,0.4)", animation: "pulseDot 2.5s ease-in-out infinite" }} />
          <span style={{ fontSize: "0.9rem", fontWeight: 900, letterSpacing: "5.5px", background: "linear-gradient(135deg, #F5D67A 0%, #E8B830 35%, #D4A017 55%, #E8C840 75%, #F5D67A 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontFamily: "'Cinzel', serif", animation: "hdrShimmer 5s linear infinite" }}>SHADOWWEAVE</span>
        </div>

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

        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
          {streak.count >= 2 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.32rem", padding: "0.28rem 0.7rem", background: "rgba(245,158,11,0.09)", border: "1px solid rgba(245,158,11,0.28)", borderRadius: "20px" }}>
              <span style={{ fontSize: "0.75rem" }}>🔥</span>
              <span style={{ fontSize: "0.58rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", color: "rgba(253,186,69,0.85)", fontWeight: 700 }}>{streak.count}</span>
            </div>
          )}
          <button onClick={props.onAchievements}
            style={{ display: "flex", alignItems: "center", gap: "0.42rem", padding: "0.38rem 0.85rem", background: "rgba(245,214,122,0.06)", border: "1px solid rgba(245,214,122,0.18)", borderRadius: "30px", cursor: "pointer", transition: "all 0.22s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,214,122,0.14)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(245,214,122,0.06)"; }}>
            <span style={{ fontSize: "0.65rem" }}>🏆</span>
            {!isMobile && <span style={{ fontSize: "0.5rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(245,214,122,0.75)", fontWeight: 700, fontFamily: "'Cinzel', serif" }}>{achCount > 0 ? `${achCount} · ${achXP} XP` : "Trophies"}</span>}
          </button>
          {props.onVault && (
            <button onClick={props.onVault}
              style={{ display: "flex", alignItems: "center", gap: "0.42rem", padding: "0.38rem 0.85rem", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "30px", cursor: "pointer", transition: "all 0.22s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.18)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(124,58,237,0.08)"; }}>
              <span style={{ fontSize: "0.65rem", color: "#C084FC" }}>🜏</span>
              {!isMobile && <span style={{ fontSize: "0.5rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "#C084FC", fontWeight: 700, fontFamily: "'Cinzel', serif" }}>Vault{vaultKeyValue > 0 ? ` · ${vaultKeyValue}🔑` : ""}</span>}
            </button>
          )}
          <button onClick={props.onStoryArchive}
            style={{ display: "flex", alignItems: "center", gap: "0.42rem", padding: "0.38rem 0.9rem", background: "rgba(168,85,247,0.09)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: "30px", cursor: "pointer", transition: "all 0.22s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,85,247,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(168,85,247,0.09)"; }}>
            <span style={{ fontSize: "0.65rem", color: "rgba(192,132,252,0.85)" }}>◈</span>
            {!isMobile && <span style={{ fontSize: "0.52rem", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(192,132,252,0.85)", fontWeight: 700, fontFamily: "'Cinzel', serif" }}>Archive</span>}
          </button>
        </div>
      </nav>

      {/* ── HERO SPLASH ── */}
      <div style={{
        position: "relative", overflow: "hidden", zIndex: 2,
        padding: isMobile ? "3rem 1rem 2.5rem" : "4rem 2.5rem 3rem",
        opacity: mounted ? 1 : 0,
        animation: mounted ? "heroIn 0.7s 0.05s ease both" : "none",
      }}>
        {/* Scan-line animation */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{
            position: "absolute", left: 0, right: 0, height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.5) 30%, rgba(251,191,36,0.4) 70%, transparent)",
            animation: "scanLine 8s linear infinite",
          }} />
        </div>

        <div style={{ maxWidth: "900px" }}>
          {/* Darkness Rank */}
          <div style={{ marginBottom: "1.4rem" }}>
            <DarknessRankBadge />
          </div>

          {/* Main heading */}
          <div style={{
            fontFamily: "'Cinzel', serif", fontWeight: 900,
            fontSize: isMobile ? "2.2rem" : "clamp(2.8rem, 5vw, 4rem)",
            lineHeight: 1.0, letterSpacing: "0.06em",
            color: "#fff",
            textShadow: "0 0 80px rgba(168,85,247,0.4), 0 0 160px rgba(168,85,247,0.15), 0 4px 40px rgba(0,0,0,1)",
            marginBottom: "0.7rem",
          }}>
            WHERE DARKNESS<br />
            <span style={{
              background: "linear-gradient(135deg, #F5D67A 0%, #E8B830 35%, #D4A017 55%, #E8C840 75%, #F5D67A 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              animation: "hdrShimmer 4s linear infinite",
            }}>BECOMES CRAFT</span>
          </div>

          <div style={{
            fontSize: isMobile ? "0.75rem" : "0.88rem",
            color: "rgba(200,195,245,0.5)",
            fontFamily: "'Raleway', sans-serif",
            letterSpacing: "0.08em",
            marginBottom: "2.2rem",
            maxWidth: "520px",
            lineHeight: 1.6,
          }}>
            31 story modes · 210+ heroines · Venice AI uncensored engine
          </div>

          {/* Daily scenario card */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "1.2rem",
            padding: "0.85rem 1.4rem", borderRadius: "14px",
            background: "rgba(8,3,20,0.88)", border: "1px solid rgba(251,191,36,0.12)",
            backdropFilter: "blur(20px)",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FBB924", boxShadow: "0 0 10px rgba(251,185,36,0.85)", animation: "pulseDot 2.5s ease-in-out infinite" }} />
              <span style={{ fontSize: "0.3rem", letterSpacing: "3.5px", color: "rgba(251,191,36,0.35)", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>Daily · {today}</span>
            </div>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", fontWeight: 700, color: "rgba(240,235,255,0.82)", letterSpacing: "0.04em" }}>{dailyTitle.toUpperCase()}</span>
            {!isMobile && (
              <>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", fontWeight: 700, color: heroine.color }}>{heroine.name}</span>
                <span style={{ fontSize: "0.4rem", color: "rgba(251,191,36,0.2)" }}>vs</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", fontWeight: 700, color: "rgba(239,68,68,0.8)" }}>{villain}</span>
              </>
            )}
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.72rem", fontWeight: 700, color: "rgba(251,191,36,0.45)", letterSpacing: "3px" }}>{clock}</span>
            <button onClick={props.onDailyScenario} style={{
              padding: "0.4rem 1rem", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.35)", borderRadius: "8px",
              cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.46rem", letterSpacing: "2px",
              color: "rgba(251,191,36,0.85)", fontWeight: 700, textTransform: "uppercase", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(251,191,36,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(251,191,36,0.1)"; }}>
              Generate →
            </button>
          </div>

          {/* Quick action row */}
          <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
            <button onClick={props.onSurpriseMe} style={{
              display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.6rem",
              background: "rgba(168,85,247,0.12)", border: "1.5px solid rgba(168,85,247,0.4)", borderRadius: "50px",
              cursor: "pointer", transition: "all 0.24s", animation: "surpriseGlow 3.5s ease-in-out infinite",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,85,247,0.24)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(168,85,247,0.12)"; e.currentTarget.style.transform = "none"; }}>
              <span style={{ fontSize: "0.85rem" }}>⚡</span>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.56rem", fontWeight: 700, letterSpacing: "2px", color: "rgba(200,160,255,0.9)", textTransform: "uppercase" }}>Surprise Me</span>
            </button>
            <button onClick={() => setShowDice(true)} style={{
              display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.3rem",
              background: "rgba(96,165,250,0.07)", border: "1.5px solid rgba(96,165,250,0.22)", borderRadius: "50px",
              cursor: "pointer", transition: "all 0.24s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(96,165,250,0.16)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(96,165,250,0.07)"; e.currentTarget.style.transform = "none"; }}>
              <span style={{ fontSize: "0.8rem" }}>⚄</span>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.56rem", fontWeight: 700, letterSpacing: "2px", color: "rgba(130,165,255,0.78)", textTransform: "uppercase" }}>Story Dice</span>
            </button>
            <button onClick={props.onDailyChronicle} style={{
              display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.3rem",
              background: "rgba(251,191,36,0.05)", border: "1.5px solid rgba(251,191,36,0.16)", borderRadius: "50px",
              cursor: "pointer", transition: "all 0.24s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(251,191,36,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(251,191,36,0.05)"; e.currentTarget.style.transform = "none"; }}>
              <span style={{ fontSize: "0.8rem" }}>📋</span>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.56rem", fontWeight: 700, letterSpacing: "2px", color: "rgba(251,191,36,0.65)", textTransform: "uppercase" }}>Chronicle</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      {(archiveStats.total > 0 || streak.count > 0) && (
        <div style={{
          padding: isMobile ? "0 1rem 1.5rem" : "0 2.5rem 1.8rem",
          position: "relative", zIndex: 2,
          opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.55s 0.2s ease both" : "none",
        }}>
          <div style={{
            display: "flex", gap: "0.5rem", flexWrap: "wrap",
            padding: "0.75rem 1.2rem", borderRadius: "12px",
            background: "rgba(4,1,12,0.7)", border: "1px solid rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)", alignItems: "center",
          }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.34rem", letterSpacing: "3.5px", color: "rgba(168,85,247,0.35)", textTransform: "uppercase", fontWeight: 700, marginRight: "0.3rem" }}>Your Record</span>
            {[
              { v: streak.count >= 1 ? `${streak.count}🔥` : "—", l: "Streak", c: "245,158,11" },
              { v: String(archiveStats.total), l: "Stories", c: "168,85,247" },
              { v: archiveStats.totalWords >= 1000 ? `${(archiveStats.totalWords / 1000).toFixed(1)}k` : String(archiveStats.totalWords), l: "Words", c: "251,191,36" },
              { v: String(archiveStats.uniqueHeroines), l: "Heroines", c: "249,115,22" },
              { v: String(archiveStats.modesTried), l: "Modes", c: "52,211,153" },
            ].map(({ v, l, c }) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.22rem 0.75rem", borderRadius: "8px", background: `rgba(${c},0.06)`, border: `1px solid rgba(${c},0.1)` }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", fontWeight: 800, color: `rgba(${c},0.82)`, letterSpacing: "0.03em" }}>{v}</span>
                <span style={{ fontSize: "0.28rem", color: `rgba(${c},0.32)`, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CORE MODES ── */}
      <section style={{ padding: pad, position: "relative", zIndex: 2, marginBottom: isMobile ? "2.5rem" : "3rem", opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.6s 0.15s ease both" : "none" }}>
        <SectionHeader label="Core Modes" accent="rgba(251,191,36,0.45)" />
        <div className="hp-core" style={{ display: "flex", gap: "1rem" }}>
          <CoreCard title="Heroine Forge" tag="Flagship · 210+ Heroines" accent="#C084FC" r={168} g={85} b={247} onClick={props.onSuperheroMode}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {["Marvel", "DC", "Arrowverse", "Disney", "Anime", "+3 more"].map(u => (
                <span key={u} style={{ fontSize: "0.5rem", padding: "0.2rem 0.65rem", borderRadius: "20px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.22)", color: "rgba(192,132,252,0.7)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px" }}>{u}</span>
              ))}
            </div>
          </CoreCard>
          <CoreCard title="Celebrity Capture" tag="Real World · No Filter" accent="#FCA311" r={252} g={163} b={17} onClick={props.onCelebrityMode}>
            <div style={{ fontSize: "0.68rem", color: "rgba(200,190,240,0.52)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.55 }}>Real-world fame meets dark fantasy. Celebrities and villains in an uncensored narrative that shatters the fourth wall.</div>
          </CoreCard>
          <CoreCard title="Custom Scenario" tag="Fully Custom · No Limits" accent="#C084FC" r={192} g={132} b={252} onClick={props.onCivilianCapture}>
            <div style={{ fontSize: "0.68rem", color: "rgba(200,190,240,0.52)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.55 }}>Build her from scratch — appearance, outfit, background, fears. Then build him. No filters, no presets, no limits.</div>
          </CoreCard>
        </div>
      </section>

      {/* ── HUBS ── */}
      <section style={{ padding: pad, position: "relative", zIndex: 2, marginBottom: isMobile ? "2.5rem" : "3rem", opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.6s 0.22s ease both" : "none" }}>
        <SectionHeader label="Story Hubs" accent="rgba(252,163,17,0.45)" />
        <div className="hp-grid-4">
          {hubs.map(h => (
            <HubCard key={h.title} {...h} />
          ))}
        </div>
      </section>

      {/* ── TAB: STORY MODES / TOOLS ── */}
      <section style={{ padding: pad, position: "relative", zIndex: 2, marginBottom: isMobile ? "2rem" : "3rem", opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.6s 0.3s ease both" : "none" }}>
        {/* Tab switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          {(["modes", "tools"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.65rem 1.4rem", background: "none", border: "none",
                borderBottom: `2px solid ${activeTab === tab ? "rgba(168,85,247,0.8)" : "transparent"}`,
                color: activeTab === tab ? "rgba(200,160,255,0.9)" : "rgba(160,155,200,0.35)",
                fontFamily: "'Cinzel', serif", fontSize: "0.52rem", letterSpacing: "3px",
                textTransform: "uppercase", fontWeight: 700, cursor: "pointer",
                transition: "all 0.22s", marginBottom: "-1px",
                textShadow: activeTab === tab ? "0 0 20px rgba(168,85,247,0.5)" : "none",
              }}
            >
              {tab === "modes" ? "Story Modes" : "Studio Tools"}
              <span style={{
                marginLeft: "0.55rem", padding: "1px 8px", borderRadius: "12px",
                background: activeTab === tab ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.04)",
                border: activeTab === tab ? "1px solid rgba(168,85,247,0.35)" : "1px solid rgba(255,255,255,0.06)",
                fontSize: "0.28rem", letterSpacing: "1px",
                color: activeTab === tab ? "rgba(192,132,252,0.7)" : "rgba(150,145,190,0.3)",
                fontFamily: "'Montserrat', sans-serif",
              }}>{tab === "modes" ? "11" : "13"}</span>
            </button>
          ))}
        </div>

        {activeTab === "modes" && (
          <div className="hp-grid-3">
            {storyModes.map(m => (
              <ModeCard key={m.title} {...m} />
            ))}
          </div>
        )}

        {activeTab === "tools" && (
          <div className="hp-grid-3">
            {tools.map(t => (
              <ModeCard key={t.title} {...t} />
            ))}
          </div>
        )}
      </section>

      <div style={{ height: "2.5rem" }} />
    </div>
  );
}

function SectionHeader({ label, accent }: { label: string; accent: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "1.1rem" }}>
      <div style={{ width: "3px", height: "16px", borderRadius: "2px", background: `linear-gradient(to bottom, ${accent}, transparent)`, boxShadow: `0 0 12px ${accent}` }} />
      <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.4rem", letterSpacing: "4.5px", color: accent, textTransform: "uppercase", fontWeight: 700 }}>{label}</span>
      <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, ${accent.replace(')', ',0.2)').replace('rgba', 'rgba')}, transparent)` }} />
    </div>
  );
}
