import { useState, useEffect, useCallback } from "react";
import StoryDice from "../components/StoryDice";
import { getStreak } from "../lib/streak";
import { getUnlockCount, getTotalXP } from "../lib/achievements";
import { useIsMobile } from "../hooks/useIsMobile";
import { getArchive } from "../lib/archive";
import DarknessRankBadge from "../components/DarknessRankBadge";
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

const FEATURED_HEROINES = [
  "Wonder Woman", "Supergirl", "Black Canary", "Batgirl",
  "Zatanna", "Starfire", "Power Girl", "Huntress",
  "Black Widow", "Scarlet Witch", "Rogue", "Jean Grey",
  "Psylocke", "Storm", "Carol Danvers", "She-Hulk",
  "Spider-Woman", "Hawkgirl", "Catwoman", "Artemis",
];

function seededRand(seed: number) { const x = Math.sin(seed + 1) * 10000; return x - Math.floor(x); }
function dailySeed() { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }
function getDailyHeroine() { const s = dailySeed(); return FEATURED_HEROINES[Math.floor(seededRand(s) * FEATURED_HEROINES.length)]; }

const DAILY_VILLAINS = ["Lex Luthor","Joker","Deathstroke","Ra's al Ghul","Damien Darhk","Homelander","Baron Mordo","HYDRA Commander"];
const DAILY_SETTINGS = ["a sub-level black site","an abandoned cathedral","a classified research vessel","a deep winter compound","a Cold War bunker"];
const DAILY_TITLES = ["{v} Claims {h}","The Last Night of {h}","{h} at Zero Hour","No Exit — {h} Falls","{v}'s New Prize","Into the Dark — {h}"];
function getDailyScenario() {
  const s = dailySeed();
  const h = FEATURED_HEROINES[Math.floor(seededRand(s) * FEATURED_HEROINES.length)];
  const v = DAILY_VILLAINS[Math.floor(seededRand(s+3) * DAILY_VILLAINS.length)];
  const setting = DAILY_SETTINGS[Math.floor(seededRand(s+7) * DAILY_SETTINGS.length)];
  const t = DAILY_TITLES[Math.floor(seededRand(s+11) * DAILY_TITLES.length)];
  return { h, v, setting, title: t.replace("{h}", h).replace("{v}", v) };
}

// ── DARK CARD ─────────────────────────────────────────────────────────────────
function DarkCard({ icon, title, tag, desc, accent, r, g, b, onClick, isNew, isFeatured }: {
  icon: string; title: string; tag: string; desc: string;
  accent: string; r: number; g: number; b: number;
  onClick?: () => void; isNew?: boolean; isFeatured?: boolean;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${r},${g},${b}`;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", cursor: "pointer", borderRadius: isFeatured ? "20px" : "14px",
        padding: isFeatured ? "1.5rem 1.4rem" : "1rem 1.1rem",
        background: hov
          ? `linear-gradient(145deg, rgba(${rgb},0.18) 0%, rgba(3,0,10,0.95) 100%)`
          : isFeatured
            ? `linear-gradient(145deg, rgba(${rgb},0.1) 0%, rgba(3,0,10,0.92) 100%)`
            : "rgba(5,1,14,0.8)",
        border: `1px solid rgba(${rgb},${hov ? 0.6 : isFeatured ? 0.2 : 0.09})`,
        transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
        transform: hov ? `translateY(${isFeatured ? -7 : -3}px)` : "none",
        boxShadow: hov
          ? `0 ${isFeatured ? 24 : 12}px ${isFeatured ? 70 : 36}px rgba(${rgb},0.28), 0 0 0 1px rgba(${rgb},0.08), inset 0 1px 0 rgba(255,255,255,0.04)`
          : isFeatured ? `0 4px 24px rgba(0,0,0,0.6)` : "none",
        backdropFilter: "blur(18px)",
        display: "flex", flexDirection: "column", gap: isFeatured ? "0.9rem" : "0.5rem",
        minHeight: isFeatured ? "auto" : "105px",
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: isFeatured ? "2px" : "1px",
        borderRadius: "inherit",
        background: `linear-gradient(90deg, transparent, rgba(${rgb},${hov ? 1 : isFeatured ? 0.5 : 0.25}), transparent)`,
        boxShadow: hov && isFeatured ? `0 0 24px rgba(${rgb},0.7)` : "none",
        transition: "all 0.3s",
      }} />

      {isNew && (
        <div style={{
          position: "absolute", top: "0.65rem", right: "0.75rem",
          padding: "2px 8px", borderRadius: "6px",
          background: `rgba(${rgb},0.22)`, border: `1px solid rgba(${rgb},0.55)`,
          fontSize: "0.27rem", letterSpacing: "2.5px", color: accent,
          fontFamily: "'Montserrat', sans-serif", fontWeight: 800, textTransform: "uppercase",
        }}>NEW</div>
      )}

      {/* Icon + title row */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <div style={{
          width: isFeatured ? "42px" : "32px", height: isFeatured ? "42px" : "32px",
          borderRadius: isFeatured ? "12px" : "9px", flexShrink: 0,
          background: hov ? `rgba(${rgb},0.25)` : `rgba(${rgb},0.08)`,
          border: `1px solid rgba(${rgb},${hov ? 0.5 : 0.15})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: isFeatured ? "1rem" : "0.8rem",
          boxShadow: hov ? `0 0 18px rgba(${rgb},0.6)` : "none",
          transition: "all 0.26s",
        }}>{icon}</div>
        <div>
          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: isFeatured ? "0.88rem" : "0.6rem",
            fontWeight: 700, letterSpacing: "0.04em",
            color: hov ? "#fff" : "rgba(225,218,255,0.82)",
            textShadow: hov ? `0 0 22px rgba(${rgb},0.6)` : "none",
            transition: "all 0.22s", lineHeight: 1.15,
          }}>{title}</div>
          <div style={{
            fontSize: "0.29rem", letterSpacing: "2px",
            color: hov ? `rgba(${rgb},0.75)` : `rgba(${rgb},0.3)`,
            fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
            textTransform: "uppercase", marginTop: "2px", transition: "color 0.22s",
          }}>{tag}</div>
        </div>
      </div>

      {/* Desc — always visible on featured, hover-reveal on compact */}
      <div style={{
        fontSize: "0.63rem",
        color: hov ? "rgba(210,202,248,0.72)" : isFeatured ? "rgba(200,192,240,0.48)" : "rgba(200,192,240,0.48)",
        fontFamily: "'Raleway', sans-serif", lineHeight: 1.58,
        maxHeight: isFeatured ? "none" : (hov ? "72px" : "0px"),
        opacity: isFeatured ? 1 : (hov ? 1 : 0),
        overflow: "hidden",
        transition: isFeatured ? "none" : "max-height 0.3s ease, opacity 0.25s ease",
      }}>{desc}</div>

      {/* CTA */}
      {hov && (
        <div style={{
          fontSize: "0.48rem", color: accent, fontFamily: "'Cinzel', serif",
          letterSpacing: "2.5px", fontWeight: 700, textTransform: "uppercase",
          textShadow: `0 0 20px rgba(${rgb},0.8)`,
        }}>
          Enter →
        </div>
      )}
    </div>
  );
}

// ── HUB CARD ──────────────────────────────────────────────────────────────────
function HubCard({ icon, title, badge, desc, count, accent, r, g, b, onClick }: {
  icon: string; title: string; badge: string; desc: string; count: string;
  accent: string; r: number; g: number; b: number; onClick?: () => void;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${r},${g},${b}`;
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        cursor: "pointer", borderRadius: "18px", padding: "1.4rem",
        background: hov
          ? `linear-gradient(135deg, rgba(${rgb},0.2) 0%, rgba(3,0,10,0.96) 100%)`
          : `linear-gradient(135deg, rgba(${rgb},0.07) 0%, rgba(3,0,10,0.9) 100%)`,
        border: `1px solid rgba(${rgb},${hov ? 0.55 : 0.12})`,
        transition: "all 0.32s cubic-bezier(0.22,1,0.36,1)",
        transform: hov ? "translateY(-6px) scale(1.01)" : "none",
        boxShadow: hov ? `0 20px 60px rgba(${rgb},0.3), 0 0 0 1px rgba(${rgb},0.08)` : "0 4px 20px rgba(0,0,0,0.5)",
        backdropFilter: "blur(20px)", position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column", gap: "0.75rem",
      }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: `linear-gradient(90deg, transparent, rgba(${rgb},${hov ? 1 : 0.3}), transparent)`,
        boxShadow: hov ? `0 0 20px rgba(${rgb},0.6)` : "none", transition: "all 0.32s" }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{
          width: "42px", height: "42px", borderRadius: "11px",
          background: hov ? `rgba(${rgb},0.28)` : `rgba(${rgb},0.1)`,
          border: `1px solid rgba(${rgb},${hov ? 0.55 : 0.2})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.05rem",
          boxShadow: hov ? `0 0 22px rgba(${rgb},0.55)` : "none", transition: "all 0.28s",
        }}>{icon}</div>
        <div style={{
          padding: "0.2rem 0.65rem", borderRadius: "20px",
          background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.3)`,
          fontSize: "0.35rem", letterSpacing: "2px", color: accent,
          fontFamily: "'Montserrat', sans-serif", fontWeight: 800, textTransform: "uppercase",
        }}>{count}</div>
      </div>
      <div>
        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: "0.9rem", fontWeight: 900,
          color: hov ? "#fff" : "rgba(228,222,255,0.88)",
          letterSpacing: "0.05em", marginBottom: "0.28rem",
          textShadow: hov ? `0 0 30px rgba(${rgb},0.65)` : "none", transition: "all 0.28s",
        }}>{title}</div>
        <div style={{
          fontSize: "0.3rem", letterSpacing: "2.5px",
          color: `rgba(${rgb},${hov ? 0.72 : 0.3})`,
          fontFamily: "'Montserrat', sans-serif", fontWeight: 700,
          textTransform: "uppercase", marginBottom: "0.55rem", transition: "color 0.25s",
        }}>{badge}</div>
        <div style={{ fontSize: "0.63rem", color: "rgba(198,192,238,0.55)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.55 }}>{desc}</div>
      </div>
      <div style={{
        display: "flex", alignItems: "center", paddingTop: "0.65rem",
        borderTop: `1px solid rgba(${rgb},${hov ? 0.25 : 0.06})`, transition: "border-color 0.28s",
      }}>
        <span style={{
          fontFamily: "'Cinzel', serif", fontSize: "0.49rem", letterSpacing: "3px",
          color: hov ? accent : `rgba(${rgb},0.3)`, fontWeight: 900,
          textShadow: hov ? `0 0 18px rgba(${rgb},0.8)` : "none", transition: "all 0.25s",
          textTransform: "uppercase",
        }}>Enter Hub →</span>
      </div>
    </div>
  );
}

// ── SECTION HEADER ────────────────────────────────────────────────────────────
function SH({ label, accent, sub }: { label: string; accent: string; sub?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "1.2rem" }}>
      <div style={{ width: "3px", height: "18px", borderRadius: "2px",
        background: `linear-gradient(to bottom, ${accent}, transparent)`,
        boxShadow: `0 0 14px ${accent}`, flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.42rem", letterSpacing: "4.5px", color: accent, textTransform: "uppercase", fontWeight: 700 }}>{label}</div>
        {sub && <div style={{ fontSize: "0.3rem", letterSpacing: "2px", color: "rgba(180,170,220,0.3)", fontFamily: "'Montserrat', sans-serif", marginTop: "2px", textTransform: "uppercase" }}>{sub}</div>}
      </div>
      <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, ${accent}33, transparent)` }} />
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function Homepage(props: HomepageProps) {
  const isMobile = useIsMobile(768);
  const [mounted, setMounted] = useState(false);
  const [showDice, setShowDice] = useState(false);
  const [activeTab, setActiveTab] = useState<"modes" | "tools">("modes");
  const [clock, setClock] = useState("");
  const [heroImg, setHeroImg] = useState<string | null>(null);
  const [heroImgLoading, setHeroImgLoading] = useState(true);
  const [heroImgHeroine, setHeroImgHeroine] = useState(getDailyHeroine());

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

  // Clock countdown
  useEffect(() => {
    function tick() {
      const now = new Date(), midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
      setClock(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  // Venice AI hero image load on mount
  useEffect(() => {
    const heroine = getDailyHeroine();
    setHeroImgHeroine(heroine);
    setHeroImgLoading(true);
    fetch(`${BASE}/api/story/homepage-heroine-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroine, style: "realistic" }),
    })
      .then(r => r.json())
      .then((data: { imageBase64?: string }) => {
        if (data.imageBase64) setHeroImg(`data:image/jpeg;base64,${data.imageBase64}`);
      })
      .catch(() => {})
      .finally(() => setHeroImgLoading(false));
  }, []);

  const regenerateHeroImg = useCallback(() => {
    const heroines = FEATURED_HEROINES.filter(h => h !== heroImgHeroine);
    const next = heroines[Math.floor(Math.random() * heroines.length)];
    setHeroImgHeroine(next);
    setHeroImgLoading(true);
    setHeroImg(null);
    fetch(`${BASE}/api/story/homepage-heroine-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroine: next, style: "realistic" }),
    })
      .then(r => r.json())
      .then((data: { imageBase64?: string }) => {
        if (data.imageBase64) setHeroImg(`data:image/jpeg;base64,${data.imageBase64}`);
      })
      .catch(() => {})
      .finally(() => setHeroImgLoading(false));
  }, [heroImgHeroine]);

  const { h: dailyH, v: dailyV, title: dailyTitle } = getDailyScenario();
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const pad = isMobile ? "0 1rem" : "0 2.5rem";

  const coreModes = [
    {
      icon: "⚔️", title: "HEROINE FORGE", tag: "Flagship · 210+ Targets",
      desc: "Choose your heroine from 210+ across Marvel, DC, Arrowverse, Disney and beyond. Set the villain, the location, the tone. Watch her broken across multi-chapter dark narrative — uncensored, relentless, explicit.",
      r: 168, g: 85, b: 247, accent: "#C084FC", onClick: props.onSuperheroMode, isFeatured: true,
    },
    {
      icon: "🌟", title: "CELEBRITY CAPTURE", tag: "Real World · No Filter",
      desc: "No face too famous to fall. Real-world names, fictional darkness — explicit scenarios with no content ceiling.",
      r: 252, g: 163, b: 17, accent: "#FCA311", onClick: props.onCelebrityMode, isFeatured: true,
    },
    {
      icon: "🔧", title: "CUSTOM SCENARIO", tag: "Build From Scratch",
      desc: "She is exactly who you design her to be. So is he. No presets, no filters, no apologies — infinite.",
      r: 192, g: 132, b: 252, accent: "#C084FC", onClick: props.onCivilianCapture, isFeatured: true,
    },
  ];

  const storyModes = [
    { icon: "🎬", title: "Director Mode", tag: "You Control Every Beat", desc: "Every scene direction is yours. The AI plays the heroine exactly as commanded — no deviation, no softening.", r: 52, g: 211, b: 153, accent: "#34D399", onClick: props.onDirectorMode },
    { icon: "💀", title: "Villain Mode", tag: "You Are the Villain", desc: "Type every line. She responds — frightened, defiant, cracking. Real-time psychological demolition.", r: 220, g: 38, b: 38, accent: "#DC2626", onClick: props.onVillainInterrogation },
    { icon: "🕸", title: "Rescue Gone Wrong", tag: "Trap · Ambush · Betrayal", desc: "The rescue fails. The rescuer becomes the next prisoner. No cavalry. No exit.", r: 251, g: 146, b: 60, accent: "#FB923C", onClick: props.onRescueGoneWrong },
    { icon: "⚡", title: "Power Drain", tag: "Meter · Slow Fall", desc: "Watch her abilities bleed away. Each hour she weakens. By the end, nothing remains but surrender.", r: 96, g: 165, b: 250, accent: "#60A5FA", onClick: props.onPowerDrain },
    { icon: "🕵", title: "The Handler", tag: "Covert · Intimate Control", desc: "Closeness is the weapon. She stops fighting because escape starts to feel like betrayal.", r: 252, g: 163, b: 17, accent: "#FCA311", onClick: props.onTheHandler },
    { icon: "⟳", title: "Time Loop", tag: "Repeat · He Remembers", desc: "She resets. He doesn't. Each loop he knows exactly how to push her further. No iteration is wasted.", r: 56, g: 189, b: 248, accent: "#38BDF8", onClick: props.onTimeLoop },
    { icon: "🏃", title: "Escape Attempt", tag: "Turn-Based · 8 Beats", desc: "One shot at freedom. You choose each move — the AI plays out the consequences with brutal honesty.", r: 251, g: 146, b: 60, accent: "#FB923C", onClick: props.onEscapeAttempt },
    { icon: "▶", title: "Story Continuation", tag: "Continue Any Archive Story", desc: "No story has to end. Return to any archived chapter and push it further into the dark.", r: 52, g: 211, b: 153, accent: "#34D399", onClick: props.onStoryContinuation },
    { icon: "📖", title: "Campaign Sagas", tag: "Multi-Chapter · Persistent", desc: "Linked chapters. Conditioning deepens. Voice degrades. The heroine who starts is not the one who ends.", r: 192, g: 132, b: 252, accent: "#C084FC", onClick: props.onCampaignMode, isNew: true },
    { icon: "♟", title: "Villain Hub", tag: "8 Villains · Method-First", desc: "Joker's chaos. Talia's conditioning. Lena's clinical coldness. The story flows from who he is.", r: 239, g: 68, b: 68, accent: "#EF4444", onClick: props.onVillainHub, isNew: true },
    { icon: "⚗️", title: "Research Facility", tag: "Clinical · Classified", desc: "Behavioral modification as formal research log. Hypothesis, procedure, results — and a private note that breaks protocol.", r: 6, g: 182, b: 212, accent: "#06B6D4", onClick: props.onResearchFacility, isNew: true },
  ];

  const hubs = [
    { icon: "🏛", title: "Spectacle Hub", badge: "Public Dominance", count: "9 Modes", desc: "Hero auctions. Gladiator arenas. Trophy displays. Betting pools. Villain team-ups. Defeat made into spectacle.", r: 252, g: 163, b: 17, accent: "#FCA311", onClick: props.onSpectacleHub },
    { icon: "⛓", title: "Captivity Arcs", badge: "Long-Form Captivity", count: "11 Modes", desc: "Corruption. Conditioning. Slow burn. The Witness. Sleeper Protocol. Dual captures. Faction wars. The grip deepens across time.", r: 52, g: 211, b: 153, accent: "#34D399", onClick: props.onCaptivityHub },
    { icon: "🧠", title: "Psych Dark", badge: "Psychological Warfare", count: "6 Modes", desc: "Mind break. Dark mirror. Dream sequences. Confined spaces. The mind is where she truly loses.", r: 192, g: 132, b: 252, accent: "#C084FC", onClick: props.onPsychDark },
    { icon: "⚡", title: "CW Specialist", badge: "Arrow · The Flash · Canon", count: "3 Tools", desc: "Darkest Arrowverse episodes, pivotal canon rewrites, full villain season arcs. The CW universe with no limits.", r: 74, g: 222, b: 128, accent: "#4ADE80", onClick: props.onCWSpecialist },
  ];

  const tools = [
    { icon: "🏰", title: "Captor Portal", tag: "Build Your Villain", desc: "Design your ideal captor — methodology, psychology, control architecture, trigger points. Built to last.", r: 248, g: 113, b: 113, accent: "#F87171", onClick: props.onCaptorPortal },
    { icon: "🗺", title: "Character Mapper", tag: "Power Web", desc: "Who controls whom. Who is expendable. Who breaks first. Every dynamic mapped.", r: 96, g: 165, b: 250, accent: "#60A5FA", onClick: props.onCharacterMapper },
    { icon: "💬", title: "Sounding Board", tag: "AI Co-Writer", desc: "Pressure-test your scenario with a strategic AI partner. Plot angles, escalation paths, narrative tension.", r: 192, g: 132, b: 252, accent: "#C084FC", onClick: props.onSoundingBoard },
    { icon: "⚙", title: "Captor Logic", tag: "Forensic Psych Profile", desc: "Build a clinical psychological dossier on your captor. Every motivation, method, and pressure point dissected.", r: 251, g: 191, b: 36, accent: "#FBBF24", onClick: props.onCaptorLogic },
    { icon: "📚", title: "Story Arcs", tag: "Arc Blueprints", desc: "Design multi-chapter arc structures with consistent narrative threads and villain methodology.", r: 232, g: 121, b: 249, accent: "#E879F9", onClick: props.onStoryArcs },
    { icon: "📁", title: "Heroine Dossier", tag: "210+ Profiles", desc: "Every target catalogued. Powers, weaknesses, psychological vulnerabilities, and ideal captor pairings.", r: 248, g: 113, b: 113, accent: "#F87171", onClick: props.onHeroineDossier },
    { icon: "🔮", title: "Villain Builder", tag: "Create Your Villain", desc: "Build an original villain from nothing — their darkness, their methods, the wound that made them.", r: 96, g: 165, b: 250, accent: "#60A5FA", onClick: props.onVillainBuilder },
    { icon: "🕸", title: "Relationship Map", tag: "Power Dynamics", desc: "Plot the web of control, desire, leverage, and betrayal. Every connection laid bare.", r: 52, g: 211, b: 153, accent: "#34D399", onClick: props.onRelationshipMap },
    { icon: "🎨", title: "Image Generator", tag: "Venice AI · Uncensored", desc: "Describe any scene. Venice AI renders it uncensored. Full explicit imagery, no restrictions.", r: 192, g: 132, b: 252, accent: "#C084FC", onClick: props.onHeroineImageGen },
    { icon: "🎯", title: "Bounty Board", tag: "Weekly Contracts", desc: "Six rotating contracts across modes. Complete them. Earn exclusive locked scenarios.", r: 245, g: 158, b: 11, accent: "#F59E0B", onClick: props.onBountyBoard },
    { icon: "📜", title: "Heroine Lore", tag: "Living Chronicle", desc: "How she changed. What cracked first. What finally broke. Every heroine's descent, catalogued.", r: 168, g: 85, b: 247, accent: "#A855F7", onClick: props.onHeroineLore },
    { icon: "🗓", title: "Story Timeline", tag: "Visual Archive", desc: "Every story laid out chronologically. Click any entry to return to it in full.", r: 96, g: 165, b: 250, accent: "#60A5FA", onClick: props.onStoryTimeline },
    { icon: "📊", title: "Dark Dossier", tag: "Your Shadow Record", desc: "Total stories. Words written. Modes used. Heroines claimed. Five hidden milestones gate locked content.", r: 168, g: 85, b: 247, accent: "#A855F7", onClick: props.onDarkDossier },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "transparent" }}>
      {showDice && <StoryDice onClose={() => setShowDice(false)} />}

      <style>{`
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(0.55);}}
        @keyframes shimmerGold{0%{background-position:0% center;}100%{background-position:200% center;}}
        @keyframes floatOrb{0%,100%{transform:translateY(0);}50%{transform:translateY(-28px);}}
        @keyframes floatOrb2{0%,100%{transform:translateY(0);}50%{transform:translateY(22px);}}
        @keyframes borderPulse{0%,100%{opacity:0.4;}50%{opacity:1;}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes heroReveal{from{opacity:0;transform:scale(1.04);}to{opacity:1;transform:scale(1);}}
        @keyframes scanLine{0%{transform:translateY(-100%);opacity:0;}15%{opacity:0.6;}85%{opacity:0.6;}100%{transform:translateY(200%);opacity:0;}}
        @keyframes imgShimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
        @keyframes surprisePulse{0%,100%{box-shadow:0 0 24px rgba(168,85,247,0.35);}50%{box-shadow:0 0 48px rgba(168,85,247,0.7);}}
        .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:0.8rem;}
        .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:0.9rem;}
        @media(max-width:1100px){.g4{grid-template-columns:repeat(2,1fr)!important;}}
        @media(max-width:900px){.g3{grid-template-columns:repeat(2,1fr)!important;}.core-row{flex-direction:column!important;}}
        @media(max-width:580px){.g3{grid-template-columns:1fr!important;}.g4{grid-template-columns:1fr!important;}}
      `}</style>

      {/* AMBIENT ORBS */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "1100px", height: "1000px", background: "radial-gradient(ellipse, rgba(120,0,220,0.14) 0%, transparent 55%)", animation: "floatOrb 22s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "8%", right: "-14%", width: "900px", height: "850px", background: "radial-gradient(ellipse, rgba(220,20,60,0.1) 0%, transparent 55%)", animation: "floatOrb2 26s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "30%", width: "750px", height: "600px", background: "radial-gradient(ellipse, rgba(30,8,120,0.1) 0%, transparent 55%)", animation: "floatOrb 30s ease-in-out infinite 5s" }} />
      </div>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isMobile ? "0 1rem" : "0 2.5rem",
        height: "58px",
        background: "rgba(2,0,7,0.97)", backdropFilter: "blur(32px)",
        borderBottom: "1px solid rgba(255,255,255,0.03)",
      }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.55) 20%, rgba(220,20,60,0.45) 50%, rgba(251,191,36,0.55) 80%, transparent)",
          animation: "borderPulse 4s ease-in-out infinite" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#A855F7", boxShadow: "0 0 14px #A855F7, 0 0 32px rgba(168,85,247,0.4)", animation: "pulseDot 2.5s ease-in-out infinite" }} />
          <span style={{ fontSize: "0.9rem", fontWeight: 900, letterSpacing: "5.5px", background: "linear-gradient(135deg,#F5D67A 0%,#E8B830 35%,#D4A017 55%,#E8C840 75%,#F5D67A 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontFamily: "'Cinzel',serif", animation: "shimmerGold 5s linear infinite" }}>SHADOWWEAVE</span>
        </div>

        {!isMobile && (
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            {[["31+","Story Modes"],["210+","Heroines"],["Venice AI","Engine"],["Uncensored","Model"]].map(([v,l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 900, color: "rgba(230,190,60,0.82)", lineHeight: 1, fontFamily: "'Cinzel',serif" }}>{v}</div>
                <div style={{ fontSize: "0.34rem", color: "rgba(200,200,220,0.24)", letterSpacing: "2.5px", textTransform: "uppercase", marginTop: "2px", fontFamily: "'Montserrat',sans-serif" }}>{l}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {streak.count >= 2 && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.28rem 0.65rem", background: "rgba(245,158,11,0.09)", border: "1px solid rgba(245,158,11,0.28)", borderRadius: "20px" }}>
              <span style={{ fontSize: "0.72rem" }}>🔥</span>
              <span style={{ fontSize: "0.56rem", fontFamily: "'Cinzel',serif", color: "rgba(253,186,69,0.85)", fontWeight: 700 }}>{streak.count}</span>
            </div>
          )}
          <button onClick={props.onAchievements} style={{ display: "flex", alignItems: "center", gap: "0.38rem", padding: "0.38rem 0.8rem", background: "rgba(245,214,122,0.06)", border: "1px solid rgba(245,214,122,0.18)", borderRadius: "30px", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,214,122,0.14)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(245,214,122,0.06)"; }}>
            <span style={{ fontSize: "0.62rem" }}>🏆</span>
            {!isMobile && <span style={{ fontSize: "0.48rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(245,214,122,0.72)", fontWeight: 700, fontFamily: "'Cinzel',serif" }}>{achCount > 0 ? `${achCount} · ${achXP} XP` : "Trophies"}</span>}
          </button>
          {props.onVault && (
            <button onClick={props.onVault} style={{ display: "flex", alignItems: "center", gap: "0.38rem", padding: "0.38rem 0.8rem", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "30px", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.18)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(124,58,237,0.08)"; }}>
              <span style={{ fontSize: "0.62rem", color: "#C084FC" }}>🜏</span>
              {!isMobile && <span style={{ fontSize: "0.48rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "#C084FC", fontWeight: 700, fontFamily: "'Cinzel',serif" }}>Vault{vaultKeyValue > 0 ? ` · ${vaultKeyValue}🔑` : ""}</span>}
            </button>
          )}
          <button onClick={props.onStoryArchive} style={{ display: "flex", alignItems: "center", gap: "0.38rem", padding: "0.38rem 0.85rem", background: "rgba(168,85,247,0.09)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: "30px", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,85,247,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(168,85,247,0.09)"; }}>
            <span style={{ fontSize: "0.62rem", color: "rgba(192,132,252,0.85)" }}>◈</span>
            {!isMobile && <span style={{ fontSize: "0.5rem", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(192,132,252,0.85)", fontWeight: 700, fontFamily: "'Cinzel',serif" }}>Archive</span>}
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION WITH VENICE AI IMAGE ── */}
      <div style={{
        position: "relative", overflow: "hidden", zIndex: 2,
        minHeight: isMobile ? "60vh" : "72vh",
        display: "flex", flexDirection: "column",
        opacity: mounted ? 1 : 0,
        animation: mounted ? "heroReveal 0.8s 0.05s ease both" : "none",
      }}>
        {/* Venice AI image as background */}
        {heroImg ? (
          <img src={heroImg} alt={heroImgHeroine}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center 20%",
              opacity: 0.38,
              animation: "heroReveal 1.2s ease both",
            }}
          />
        ) : heroImgLoading ? (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, rgba(30,8,60,0.8) 0%, rgba(60,8,30,0.6) 50%, rgba(30,8,60,0.8) 100%)",
            backgroundSize: "200% 100%",
            animation: "imgShimmer 2.2s ease-in-out infinite",
          }} />
        ) : null}

        {/* Dramatic gradient overlays */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(2,0,8,0.65) 0%, rgba(2,0,8,0.3) 35%, rgba(2,0,8,0.85) 75%, rgba(2,0,8,1) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(2,0,8,0.85) 0%, transparent 50%, rgba(2,0,8,0.6) 100%)" }} />

        {/* Scan-line */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.6) 30%, rgba(220,20,60,0.5) 70%, transparent)", animation: "scanLine 10s linear infinite" }} />
        </div>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 5, flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: isMobile ? "2rem 1rem 2.5rem" : "3rem 2.5rem 2.8rem" }}>

          {/* Darkness Rank */}
          <div style={{ marginBottom: "1.2rem" }}>
            <DarknessRankBadge />
          </div>

          {/* Main headline */}
          <div style={{ fontFamily: "'Cinzel',serif", fontWeight: 900, fontSize: isMobile ? "2.4rem" : "clamp(3rem,5.5vw,4.8rem)", lineHeight: 0.95, letterSpacing: "0.06em", marginBottom: "0.8rem" }}>
            <div style={{ color: "#fff", textShadow: "0 0 100px rgba(168,85,247,0.5), 0 0 200px rgba(168,85,247,0.15), 0 4px 50px rgba(0,0,0,1)" }}>
              THEY FALL.
            </div>
            <div style={{
              background: "linear-gradient(135deg, #F5D67A 0%, #E8B830 30%, #DC143C 60%, #C084FC 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              animation: "shimmerGold 6s linear infinite",
            }}>
              WE WRITE IT.
            </div>
          </div>

          {/* Tagline */}
          <div style={{ fontSize: isMobile ? "0.78rem" : "0.92rem", color: "rgba(200,195,245,0.52)", fontFamily: "'Raleway',sans-serif", letterSpacing: "0.1em", marginBottom: "2rem", lineHeight: 1.5, maxWidth: "550px" }}>
            Uncensored dark fiction. Superheroines defeated, degraded, conditioned. 31 modes. 210+ heroines. Venice AI — no limits.
          </div>

          {/* Hero image heroine tag + refresh */}
          {(heroImg || heroImgLoading) && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.4rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", padding: "0.3rem 0.85rem", borderRadius: "20px", background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)", backdropFilter: "blur(10px)" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: heroImgLoading ? "#FCA311" : "#22C55E", boxShadow: `0 0 8px ${heroImgLoading ? "rgba(252,163,17,0.9)" : "rgba(34,197,94,0.9)"}`, animation: "pulseDot 2s ease-in-out infinite" }} />
                <span style={{ fontSize: "0.32rem", letterSpacing: "2.5px", color: "rgba(192,132,252,0.8)", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, textTransform: "uppercase" }}>{heroImgLoading ? "Generating..." : `Today's Capture — ${heroImgHeroine}`}</span>
              </div>
              {!heroImgLoading && (
                <button onClick={regenerateHeroImg} style={{ padding: "0.3rem 0.75rem", background: "rgba(220,20,60,0.1)", border: "1px solid rgba(220,20,60,0.3)", borderRadius: "20px", cursor: "pointer", fontSize: "0.3rem", letterSpacing: "2px", color: "rgba(248,113,113,0.75)", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, textTransform: "uppercase", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,20,60,0.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(220,20,60,0.1)"; }}>
                  ↺ New Heroine
                </button>
              )}
            </div>
          )}

          {/* Daily scenario bar */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "1rem", padding: "0.75rem 1.2rem", borderRadius: "12px", background: "rgba(6,2,16,0.9)", border: "1px solid rgba(251,191,36,0.1)", backdropFilter: "blur(20px)", flexWrap: "wrap", marginBottom: "1.8rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#FBB924", boxShadow: "0 0 8px rgba(251,185,36,0.85)", animation: "pulseDot 2.5s ease-in-out infinite" }} />
              <span style={{ fontSize: "0.29rem", letterSpacing: "3.5px", color: "rgba(251,191,36,0.35)", fontFamily: "'Montserrat',sans-serif", fontWeight: 700, textTransform: "uppercase" }}>Daily · {today}</span>
            </div>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.72rem", fontWeight: 700, color: "rgba(240,235,255,0.85)", letterSpacing: "0.04em" }}>{dailyTitle.toUpperCase()}</span>
            {!isMobile && (
              <>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.62rem", fontWeight: 700, color: "#C084FC" }}>{dailyH}</span>
                <span style={{ fontSize: "0.38rem", color: "rgba(251,191,36,0.18)" }}>vs</span>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.62rem", fontWeight: 700, color: "rgba(239,68,68,0.85)" }}>{dailyV}</span>
              </>
            )}
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.68rem", fontWeight: 700, color: "rgba(251,191,36,0.42)", letterSpacing: "3px" }}>{clock}</span>
            <button onClick={props.onDailyScenario} style={{ padding: "0.38rem 0.95rem", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.35)", borderRadius: "8px", cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: "0.44rem", letterSpacing: "2px", color: "rgba(251,191,36,0.85)", fontWeight: 700, textTransform: "uppercase", transition: "all 0.2s", whiteSpace: "nowrap" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(251,191,36,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(251,191,36,0.1)"; }}>
              Generate →
            </button>
          </div>

          {/* CTA row */}
          <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
            <button onClick={props.onSurpriseMe} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.7rem", background: "rgba(168,85,247,0.14)", border: "1.5px solid rgba(168,85,247,0.45)", borderRadius: "50px", cursor: "pointer", transition: "all 0.24s", animation: "surprisePulse 3.5s ease-in-out infinite" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,85,247,0.26)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(168,85,247,0.14)"; e.currentTarget.style.transform = "none"; }}>
              <span style={{ fontSize: "0.85rem" }}>⚡</span>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.56rem", fontWeight: 700, letterSpacing: "2.5px", color: "rgba(200,158,255,0.92)", textTransform: "uppercase" }}>Surprise Me</span>
            </button>
            <button onClick={() => setShowDice(true)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.35rem", background: "rgba(96,165,250,0.07)", border: "1.5px solid rgba(96,165,250,0.22)", borderRadius: "50px", cursor: "pointer", transition: "all 0.24s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(96,165,250,0.16)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(96,165,250,0.07)"; e.currentTarget.style.transform = "none"; }}>
              <span style={{ fontSize: "0.82rem" }}>⚄</span>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.56rem", fontWeight: 700, letterSpacing: "2px", color: "rgba(130,165,255,0.78)", textTransform: "uppercase" }}>Story Dice</span>
            </button>
            <button onClick={props.onHeroineImageGen} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.35rem", background: "rgba(220,20,60,0.07)", border: "1.5px solid rgba(220,20,60,0.25)", borderRadius: "50px", cursor: "pointer", transition: "all 0.24s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,20,60,0.16)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(220,20,60,0.07)"; e.currentTarget.style.transform = "none"; }}>
              <span style={{ fontSize: "0.82rem" }}>🎨</span>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.56rem", fontWeight: 700, letterSpacing: "2px", color: "rgba(248,113,113,0.78)", textTransform: "uppercase" }}>Generate Image</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS STRIP ── */}
      {(archiveStats.total > 0 || streak.count > 0) && (
        <div style={{ padding: isMobile ? "1.2rem 1rem" : "1.4rem 2.5rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.55s 0.2s ease both" : "none" }}>
          <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", padding: "0.7rem 1.1rem", borderRadius: "12px", background: "rgba(4,1,12,0.75)", border: "1px solid rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", alignItems: "center" }}>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.33rem", letterSpacing: "3.5px", color: "rgba(168,85,247,0.32)", textTransform: "uppercase", fontWeight: 700, marginRight: "0.3rem" }}>Your Record</span>
            {[
              { v: streak.count >= 1 ? `${streak.count}🔥` : "—", l: "Streak", c: "245,158,11" },
              { v: String(archiveStats.total), l: "Heroines Claimed", c: "168,85,247" },
              { v: archiveStats.totalWords >= 1000 ? `${(archiveStats.totalWords/1000).toFixed(1)}k` : String(archiveStats.totalWords), l: "Words Written", c: "251,191,36" },
              { v: String(archiveStats.uniqueHeroines), l: "Heroines Broken", c: "249,115,22" },
              { v: String(archiveStats.modesTried), l: "Modes Tried", c: "52,211,153" },
            ].map(({ v, l, c }) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: "0.32rem", padding: "0.2rem 0.72rem", borderRadius: "8px", background: `rgba(${c},0.06)`, border: `1px solid rgba(${c},0.09)` }}>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.64rem", fontWeight: 800, color: `rgba(${c},0.82)`, letterSpacing: "0.03em" }}>{v}</span>
                <span style={{ fontSize: "0.27rem", color: `rgba(${c},0.3)`, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat',sans-serif", fontWeight: 600 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CORE MODES ── */}
      <section style={{ padding: pad, zIndex: 2, position: "relative", marginBottom: isMobile ? "2.5rem" : "3rem", opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.6s 0.15s ease both" : "none" }}>
        <SH label="Core Modes" accent="rgba(251,191,36,0.5)" sub="Choose your heroine — she doesn't choose you" />
        <div className="core-row" style={{ display: "flex", gap: "0.9rem" }}>
          {coreModes.map(m => <DarkCard key={m.title} {...m} />)}
        </div>
      </section>

      {/* ── HUBS ── */}
      <section style={{ padding: pad, zIndex: 2, position: "relative", marginBottom: isMobile ? "2.5rem" : "3rem", opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.6s 0.22s ease both" : "none" }}>
        <SH label="Story Hubs" accent="rgba(220,20,60,0.55)" sub="Collections of related dark modes" />
        <div className="g4">
          {hubs.map(h => <HubCard key={h.title} {...h} />)}
        </div>
      </section>

      {/* ── TABBED MODES / TOOLS ── */}
      <section style={{ padding: pad, zIndex: 2, position: "relative", marginBottom: isMobile ? "2rem" : "3rem", opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.6s 0.3s ease both" : "none" }}>
        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          {(["modes","tools"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "0.65rem 1.35rem", background: "none", border: "none",
              borderBottom: `2px solid ${activeTab === tab ? "rgba(168,85,247,0.85)" : "transparent"}`,
              color: activeTab === tab ? "rgba(200,158,255,0.95)" : "rgba(155,148,200,0.32)",
              fontFamily: "'Cinzel',serif", fontSize: "0.5rem", letterSpacing: "3px",
              textTransform: "uppercase", fontWeight: 700, cursor: "pointer",
              transition: "all 0.22s", marginBottom: "-1px",
              textShadow: activeTab === tab ? "0 0 18px rgba(168,85,247,0.5)" : "none",
            }}>
              {tab === "modes" ? "Story Modes" : "Studio Tools"}
              <span style={{
                marginLeft: "0.5rem", padding: "1px 7px", borderRadius: "10px",
                background: activeTab === tab ? "rgba(168,85,247,0.14)" : "rgba(255,255,255,0.03)",
                border: activeTab === tab ? "1px solid rgba(168,85,247,0.3)" : "1px solid rgba(255,255,255,0.05)",
                fontSize: "0.27rem", letterSpacing: "1px",
                color: activeTab === tab ? "rgba(192,132,252,0.65)" : "rgba(140,135,185,0.25)",
                fontFamily: "'Montserrat',sans-serif",
              }}>{tab === "modes" ? "11" : "13"}</span>
            </button>
          ))}
        </div>

        {activeTab === "modes" && (
          <div className="g3">
            {storyModes.map(m => <DarkCard key={m.title} {...m} />)}
          </div>
        )}
        {activeTab === "tools" && (
          <div className="g3">
            {tools.map(t => <DarkCard key={t.title} {...t} />)}
          </div>
        )}
      </section>

      <div style={{ height: "3rem" }} />
    </div>
  );
}
