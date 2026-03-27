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

// ── PRIMARY CARD ──────────────────────────────────────────────────────────────
function PrimaryCard({
  num, icon, iconImg, tagline, title, desc, stats, cta,
  accent, r, g, b, onClick,
}: {
  num: string; icon: string; iconImg?: string; tagline: string; title: string; desc: string;
  stats: [string, string][]; features: string[]; cta: string;
  accent: string; r: number; g: number; b: number; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${r},${g},${b}`;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="hp-primary-card"
      style={{
        position: "relative", borderRadius: "22px", overflow: "hidden",
        cursor: "pointer", height: "420px", flexShrink: 0,
        border: `1px solid ${hov ? `rgba(${rgb},0.7)` : `rgba(${rgb},0.14)`}`,
        boxShadow: hov
          ? `0 0 0 1px rgba(${rgb},0.2), 0 40px 100px rgba(${rgb},0.32), 0 0 120px rgba(${rgb},0.07) inset`
          : `0 8px 48px rgba(0,0,0,0.75)`,
        transition: "box-shadow 0.45s, border-color 0.45s, transform 0.4s cubic-bezier(0.22,1,0.36,1)",
        transform: hov ? "translateY(-8px) scale(1.012)" : "translateY(0) scale(1)",
      }}
    >
      {iconImg && (
        <img src={iconImg} alt={icon} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", opacity: hov ? 0.65 : 0.32, transform: hov ? "scale(1.07)" : "scale(1)", transition: "opacity 0.55s, transform 0.65s ease" }} />
      )}
      {/* Gradient stack */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, rgba(4,1,14,1) 0%, rgba(4,1,14,0.95) 22%, rgba(4,1,14,0.6) 50%, rgba(4,1,14,0.12) 75%, transparent 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: hov ? `radial-gradient(ellipse at 50% 0%, rgba(${rgb},0.16) 0%, transparent 60%)` : "none", transition: "opacity 0.5s" }} />
      {/* Shimmer sweep */}
      {hov && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.04) 50%, transparent 65%)", animation: "shimmerSweep 1.2s ease forwards", pointerEvents: "none" }} />}
      {/* Top accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, transparent, rgba(${rgb},${hov ? 1 : 0.3}) 25%, rgba(${rgb},${hov ? 1 : 0.3}) 75%, transparent)`, transition: "all 0.4s", boxShadow: hov ? `0 0 20px rgba(${rgb},0.6)` : "none" }} />
      {/* Corner glow */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "120px", background: `linear-gradient(to bottom, rgba(${rgb},${hov ? 0.06 : 0}), transparent)`, transition: "opacity 0.4s" }} />
      {/* Top meta */}
      <div style={{ position: "absolute", top: "1.2rem", left: "1.3rem", right: "1.3rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", fontWeight: 900, color: `rgba(${rgb},${hov ? 0.65 : 0.18})`, letterSpacing: "2px", transition: "color 0.4s", textShadow: hov ? `0 0 30px rgba(${rgb},0.7)` : "none" }}>{num}</span>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.42rem", letterSpacing: "3px", color: `rgba(${rgb},${hov ? 0.9 : 0.5})`, textTransform: "uppercase", background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},${hov ? 0.4 : 0.15})`, borderRadius: "30px", padding: "4px 12px", backdropFilter: "blur(14px)", transition: "all 0.35s", boxShadow: hov ? `0 0 16px rgba(${rgb},0.25)` : "none" }}>{tagline}</span>
      </div>
      {/* Bottom content */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "2rem 1.7rem 1.6rem" }}>
        <h2 style={{ margin: "0 0 0.6rem", fontFamily: "'Cinzel', serif", fontSize: "clamp(1.25rem, 2.4vw, 1.7rem)", fontWeight: 900, letterSpacing: "0.07em", lineHeight: 1.05, color: hov ? "#FFF" : "rgba(240,235,255,0.92)", transition: "all 0.3s", textShadow: hov ? `0 0 60px rgba(${rgb},0.65)` : "none" }}>{title}</h2>
        <p style={{ margin: "0 0 1.2rem", fontSize: "0.7rem", color: hov ? "rgba(220,215,248,0.58)" : "rgba(200,195,230,0.28)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.72, transition: "color 0.3s" }}>{desc}</p>
        <div style={{ display: "flex", gap: "1.8rem", marginBottom: "1.1rem", paddingBottom: "0.9rem", borderBottom: `1px solid rgba(${rgb},${hov ? 0.2 : 0.07})`, transition: "border-color 0.3s" }}>
          {stats.map(([v, l]) => (
            <div key={l}>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1.2rem", fontWeight: 900, color: hov ? accent : `rgba(${rgb},0.68)`, lineHeight: 1, transition: "all 0.3s", textShadow: hov ? `0 0 28px rgba(${rgb},0.85)` : "none" }}>{v}</div>
              <div style={{ fontSize: "0.37rem", color: `rgba(${rgb},0.38)`, letterSpacing: "2.5px", textTransform: "uppercase", marginTop: "4px", fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.78rem 1.2rem", background: hov ? `rgba(${rgb},0.22)` : `rgba(${rgb},0.06)`, border: `1px solid ${hov ? `rgba(${rgb},0.65)` : `rgba(${rgb},0.11)`}`, borderRadius: "13px", transition: "all 0.32s", backdropFilter: "blur(18px)", boxShadow: hov ? `0 0 30px rgba(${rgb},0.18)` : "none" }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.67rem", letterSpacing: "2.5px", textTransform: "uppercase", color: hov ? accent : `rgba(${rgb},0.48)`, transition: "color 0.3s", fontWeight: 700, textShadow: hov ? `0 0 20px rgba(${rgb},1)` : "none" }}>{cta}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: hov ? accent : `rgba(${rgb},0.22)`, transition: "all 0.3s", transform: hov ? "translateX(5px)" : "none" }}>
            <span style={{ fontSize: "1rem", textShadow: hov ? `0 0 16px rgba(${rgb},1)` : "none" }}>→</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SUB CARD ─────────────────────────────────────────────────────────────────
function SubCard({ icon, iconImg, title, desc, accent, r, g, b, badge, onClick }: {
  icon: string; iconImg?: string; title: string; desc: string; accent: string;
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
        position: "relative", background: hov ? `rgba(${rgb},0.1)` : "rgba(5,1,15,0.8)",
        border: `1px solid ${hov ? `rgba(${rgb},0.48)` : `rgba(${rgb},0.09)`}`,
        borderRadius: "15px", padding: "1rem 1.1rem 1rem 1.15rem",
        cursor: "pointer", transition: "all 0.28s cubic-bezier(0.22,1,0.36,1)",
        overflow: "hidden", display: "flex", alignItems: "center", gap: "0.9rem",
        boxShadow: hov ? `0 10px 36px rgba(${rgb},0.18)` : "none",
        backdropFilter: "blur(16px)",
        transform: hov ? "translateX(3px)" : "translateX(0)",
      }}
    >
      <div style={{ position: "absolute", left: 0, top: "12%", bottom: "12%", width: "3px", background: hov ? `linear-gradient(to bottom, transparent, ${accent} 40%, transparent)` : `rgba(${rgb},0.16)`, transition: "all 0.32s", borderRadius: "0 3px 3px 0", boxShadow: hov ? `0 0 12px ${accent}` : "none" }} />
      {hov && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.022) 50%, transparent 70%)", animation: "shimmerSweep 0.9s ease forwards", pointerEvents: "none" }} />}
      <div style={{ width: "50px", height: "50px", borderRadius: "13px", overflow: "hidden", border: `1px solid rgba(${rgb},${hov ? 0.55 : 0.13})`, flexShrink: 0, transition: "all 0.28s", boxShadow: hov ? `0 0 24px rgba(${rgb},0.45)` : "none" }}>
        {iconImg
          ? <img src={iconImg} alt={icon} style={{ width: "50px", height: "50px", objectFit: "cover", display: "block", transition: "transform 0.35s", transform: hov ? "scale(1.08)" : "scale(1)" }} />
          : <div style={{ width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.35rem", background: `rgba(${rgb},0.1)` }}>{icon}</div>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.28rem" }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.76rem", fontWeight: 700, color: hov ? "#FFF" : "rgba(232,228,255,0.78)", transition: "color 0.22s", letterSpacing: "0.04em" }}>{title}</span>
          {badge && <span style={{ fontSize: "0.38rem", letterSpacing: "1.5px", padding: "2px 8px", borderRadius: "6px", background: `rgba(${rgb},0.2)`, color: accent, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "uppercase", flexShrink: 0, border: `1px solid rgba(${rgb},0.28)`, boxShadow: hov ? `0 0 10px rgba(${rgb},0.3)` : "none" }}>{badge}</span>}
        </div>
        <div style={{ fontSize: "0.62rem", color: "rgba(200,195,228,0.28)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{desc}</div>
      </div>
      <div style={{ flexShrink: 0, width: "26px", height: "26px", borderRadius: "8px", background: hov ? `rgba(${rgb},0.22)` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s", border: hov ? `1px solid rgba(${rgb},0.35)` : "1px solid transparent" }}>
        <span style={{ fontSize: "0.75rem", color: hov ? accent : `rgba(${rgb},0.18)`, transition: "all 0.22s", transform: hov ? "translateX(2px)" : "none", display: "inline-block", textShadow: hov ? `0 0 12px rgba(${rgb},0.9)` : "none" }}>→</span>
      </div>
    </div>
  );
}

// ── SPECIALIST CHIP ───────────────────────────────────────────────────────────
function SpecialistChip({ icon, title, badge, accent, r, g, b, completed, onClick, animIdx }: {
  icon: string; title: string; badge: string; accent: string;
  r: number; g: number; b: number; completed?: boolean; onClick: () => void; animIdx?: number;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${r},${g},${b}`;
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        position: "relative", display: "flex", alignItems: "center", gap: "0.7rem",
        padding: "0.7rem 0.9rem 0.7rem 1rem",
        background: hov ? `rgba(${rgb},0.13)` : `rgba(${rgb},0.03)`,
        border: `1px solid rgba(${rgb},${hov ? 0.5 : 0.12})`,
        borderLeft: `3.5px solid ${hov ? accent : `rgba(${rgb},${completed ? 0.5 : 0.25})`}`,
        borderRadius: "12px", cursor: "pointer", textAlign: "left",
        transition: "all 0.24s cubic-bezier(0.22,1,0.36,1)",
        transform: hov ? "translateX(4px)" : "translateX(0)",
        boxShadow: hov ? `0 6px 28px rgba(${rgb},0.22), 0 0 0 1px rgba(${rgb},0.08)` : "none",
        width: "100%", overflow: "hidden", backdropFilter: "blur(10px)",
        animationDelay: animIdx !== undefined ? `${0.05 + animIdx * 0.035}s` : "0s",
        animationFillMode: "both",
      }}
    >
      {/* Shimmer on hover */}
      {hov && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%)", animation: "shimmerSweep 0.8s ease forwards", pointerEvents: "none" }} />}
      {/* Glow wash */}
      {hov && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 0% 50%, rgba(${rgb},0.12) 0%, transparent 60%)`, pointerEvents: "none" }} />}
      {/* Icon */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: "34px", height: "34px", borderRadius: "10px",
          background: hov ? `rgba(${rgb},0.25)` : completed ? `rgba(${rgb},0.14)` : `rgba(${rgb},0.07)`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.05rem",
          transition: "all 0.24s",
          filter: hov ? `drop-shadow(0 0 10px rgba(${rgb},0.9))` : completed ? `drop-shadow(0 0 5px rgba(${rgb},0.45))` : "none",
          border: `1px solid rgba(${rgb},${hov ? 0.45 : completed ? 0.28 : 0.1})`,
          boxShadow: hov ? `0 0 20px rgba(${rgb},0.3)` : "none",
        }}>{icon}</div>
        {completed && (
          <div style={{
            position: "absolute", top: "-3px", right: "-3px", width: "12px", height: "12px",
            borderRadius: "50%", background: accent, border: "2px solid rgba(4,1,14,0.95)",
            boxShadow: `0 0 8px ${accent}`, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "0.38rem", color: "#000", fontWeight: 900,
            animation: "pulseDot 2.5s ease-in-out infinite",
          }}>✓</div>
        )}
      </div>
      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.69rem", fontWeight: 700, letterSpacing: "0.04em", color: hov ? "#FFF" : "rgba(230,225,255,0.75)", transition: "color 0.22s", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textShadow: hov ? `0 0 20px rgba(${rgb},0.6)` : "none" }}>{title}</div>
        <div style={{ fontSize: "0.41rem", letterSpacing: "1.5px", color: hov ? accent : `rgba(${rgb},0.38)`, fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", marginTop: "3px", transition: "color 0.22s", fontWeight: 700 }}>{badge}</div>
      </div>
      {/* Badge + arrow */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
        <span style={{ fontSize: "0.67rem", color: hov ? accent : `rgba(${rgb},0.18)`, transition: "all 0.22s", transform: hov ? "translateX(3px)" : "none", display: "inline-block", textShadow: hov ? `0 0 12px rgba(${rgb},1)` : "none" }}>→</span>
      </div>
    </button>
  );
}

// ── SECTION LABEL ─────────────────────────────────────────────────────────────
function SectionLabel({ label, count, r, g, b }: { label: string; count?: number; r: number; g: number; b: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1rem 0 0.65rem" }}>
      <div style={{ width: "4px", height: "18px", borderRadius: "2px", background: `linear-gradient(to bottom, rgba(${r},${g},${b},0.9), rgba(${r},${g},${b},0.15))`, flexShrink: 0, boxShadow: `0 0 8px rgba(${r},${g},${b},0.35)` }} />
      <span style={{ fontSize: "0.46rem", letterSpacing: "4px", textTransform: "uppercase", color: `rgba(${r},${g},${b},0.75)`, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", whiteSpace: "nowrap" }}>{label}</span>
      {count !== undefined && <span style={{ fontSize: "0.38rem", padding: "2px 8px", borderRadius: "20px", background: `rgba(${r},${g},${b},0.12)`, border: `1px solid rgba(${r},${g},${b},0.22)`, color: `rgba(${r},${g},${b},0.6)`, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, letterSpacing: "1px" }}>{count}</span>}
      <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, rgba(${r},${g},${b},0.22), transparent)` }} />
    </div>
  );
}

// ── TOOL TILE ─────────────────────────────────────────────────────────────────
function ToolTile({ icon, title, desc, hex, r, g, b, onClick }: {
  icon: string; title: string; desc: string; hex: string; r: number; g: number; b: number; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${r},${g},${b}`;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", background: hov ? `rgba(${rgb},0.1)` : "rgba(4,1,12,0.72)",
        border: `1px solid ${hov ? `rgba(${rgb},0.42)` : `rgba(${rgb},0.08)`}`,
        borderRadius: "16px", padding: "1.1rem 1.2rem",
        cursor: "pointer", transition: "all 0.28s cubic-bezier(0.22,1,0.36,1)",
        display: "flex", alignItems: "center", gap: "0.9rem", overflow: "hidden",
        backdropFilter: "blur(14px)",
        boxShadow: hov ? `0 10px 36px rgba(${rgb},0.18), 0 0 0 1px rgba(${rgb},0.06)` : "none",
        transform: hov ? "translateY(-3px)" : "none",
      }}
    >
      <div style={{ position: "absolute", left: 0, top: "18%", bottom: "18%", width: "2px", background: hov ? `linear-gradient(to bottom, transparent, ${hex} 40%, transparent)` : "transparent", transition: "all 0.3s", borderRadius: "0 2px 2px 0", boxShadow: hov ? `0 0 10px ${hex}` : "none" }} />
      {hov && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.025) 50%, transparent 70%)", animation: "shimmerSweep 0.9s ease forwards", pointerEvents: "none" }} />}
      <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: hov ? `rgba(${rgb},0.22)` : `rgba(${rgb},0.07)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.15rem", flexShrink: 0, transition: "all 0.28s", filter: hov ? `drop-shadow(0 0 12px rgba(${rgb},0.85))` : "none", border: `1px solid rgba(${rgb},${hov ? 0.35 : 0.07})`, boxShadow: hov ? `0 0 20px rgba(${rgb},0.3)` : "none" }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.74rem", fontWeight: 700, color: hov ? "#FFF" : "rgba(222,218,248,0.58)", letterSpacing: "0.04em", transition: "color 0.25s", marginBottom: "0.22rem", textShadow: hov ? `0 0 20px rgba(${rgb},0.5)` : "none" }}>{title}</div>
        <div style={{ fontSize: "0.61rem", color: "rgba(200,195,228,0.2)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.45, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{desc}</div>
      </div>
      <span style={{ fontSize: "0.72rem", color: hov ? `rgba(${rgb},0.75)` : "rgba(255,255,255,0.05)", transition: "all 0.25s", flexShrink: 0, transform: hov ? "translateX(3px)" : "none", display: "inline-block", textShadow: hov ? `0 0 10px rgba(${rgb},0.8)` : "none" }}>→</span>
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
    <div onClick={onGenerate} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", borderRadius: "18px", overflow: "hidden",
        border: `1px solid ${hov ? "rgba(251,191,36,0.48)" : "rgba(251,191,36,0.1)"}`,
        background: hov ? "rgba(12,6,28,0.97)" : "rgba(7,3,16,0.96)",
        cursor: "pointer", transition: "all 0.32s",
        boxShadow: hov ? "0 0 60px rgba(251,191,36,0.1), 0 12px 50px rgba(0,0,0,0.55)" : "0 4px 28px rgba(0,0,0,0.55)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, rgba(251,191,36,${hov ? 0.85 : 0.25}), rgba(251,191,36,${hov ? 0.85 : 0.25}), transparent)`, transition: "all 0.32s", boxShadow: hov ? "0 0 20px rgba(251,191,36,0.4)" : "none" }} />
      {hov && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 30%, rgba(251,191,36,0.025) 50%, transparent 70%)", animation: "shimmerSweep 1.4s ease forwards", pointerEvents: "none" }} />}
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <div style={{ width: "4px", flexShrink: 0, background: hov ? "linear-gradient(to bottom, #F59E0B, #D97706)" : "rgba(251,191,36,0.18)", transition: "all 0.32s", borderRadius: "18px 0 0 0", boxShadow: hov ? "2px 0 20px rgba(251,191,36,0.3)" : "none" }} />
        <div style={{ flex: 1, padding: "1.15rem 1.6rem", display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: "0.4rem", letterSpacing: "4px", color: "rgba(251,191,36,0.42)", fontFamily: "'Cinzel', serif", marginBottom: "0.3rem", textTransform: "uppercase" }}>Today's Dispatch · {today}</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(0.88rem, 1.7vw, 1.12rem)", fontWeight: 700, color: hov ? "#FCD34D" : "rgba(251,191,36,0.82)", transition: "all 0.3s", maxWidth: "290px", lineHeight: 1.3, textShadow: hov ? "0 0 36px rgba(251,191,36,0.55)" : "none" }}>{title}</div>
          </div>
          <div style={{ width: "1px", height: "2.5rem", background: "rgba(251,191,36,0.09)", flexShrink: 0 }} />
          <div style={{ display: "flex", gap: "1.1rem", alignItems: "center", flexWrap: "wrap" }}>
            <div><div style={{ fontSize: "0.38rem", color: "rgba(251,191,36,0.32)", letterSpacing: "2.5px", marginBottom: "0.2rem", textTransform: "uppercase" }}>Heroine</div><div style={{ fontSize: "0.82rem", color: heroine.color, fontFamily: "'Cinzel', serif", fontWeight: 700, textShadow: `0 0 18px ${heroine.color}` }}>{heroine.name}</div></div>
            <div style={{ fontSize: "0.65rem", color: "rgba(251,191,36,0.18)" }}>✕</div>
            <div><div style={{ fontSize: "0.38rem", color: "rgba(251,191,36,0.32)", letterSpacing: "2.5px", marginBottom: "0.2rem", textTransform: "uppercase" }}>Villain</div><div style={{ fontSize: "0.82rem", color: "rgba(215,205,245,0.72)", fontFamily: "'Cinzel', serif" }}>{villain}</div></div>
            <div style={{ width: "1px", height: "2rem", background: "rgba(255,255,255,0.05)", flexShrink: 0 }} />
            <div><div style={{ fontSize: "0.38rem", color: "rgba(251,191,36,0.32)", letterSpacing: "2.5px", marginBottom: "0.2rem", textTransform: "uppercase" }}>Setting</div><div style={{ fontSize: "0.66rem", color: "rgba(200,195,224,0.42)", fontFamily: "'Raleway', sans-serif", maxWidth: "200px", lineHeight: 1.35 }}>{setting}</div></div>
          </div>
          <div style={{ marginLeft: "auto", flexShrink: 0, display: "flex", alignItems: "center", gap: "0.55rem", color: hov ? "#FCD34D" : "rgba(251,191,36,0.38)", transition: "all 0.3s", fontFamily: "'Cinzel', serif", fontSize: "0.62rem", letterSpacing: "1.5px", textShadow: hov ? "0 0 24px rgba(251,191,36,0.75)" : "none" }}>
            ◆ Generate Today's Story
            <button onClick={(e) => { e.stopPropagation(); onChronicle(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(251,191,36,0.28)", fontFamily: "'Cinzel', serif", fontSize: "0.52rem", letterSpacing: "1.5px", padding: "0 0 0 1rem", transition: "color 0.2s", borderLeft: "1px solid rgba(251,191,36,0.1)" }} onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(251,191,36,0.75)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(251,191,36,0.28)"; }}>Chronicle →</button>
          </div>
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()} style={{ borderTop: "1px solid rgba(251,191,36,0.06)", padding: "0.45rem 1.6rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.9rem", background: "rgba(0,0,0,0.18)" }}>
        <div style={{ width: "28px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.18))" }} />
        <span style={{ fontSize: "0.36rem", letterSpacing: "4px", color: "rgba(251,191,36,0.25)", fontFamily: "'Cinzel', serif", textTransform: "uppercase" }}>Next Dispatch In</span>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.82rem", fontWeight: 700, color: "rgba(251,191,36,0.62)", letterSpacing: "5px", textShadow: "0 0 20px rgba(251,191,36,0.28)", minWidth: "76px", textAlign: "center" }}>{clock}</span>
        <span style={{ fontSize: "0.36rem", letterSpacing: "4px", color: "rgba(251,191,36,0.16)", fontFamily: "'Cinzel', serif", textTransform: "uppercase" }}>Ritual Resets at Midnight</span>
        <div style={{ width: "28px", height: "1px", background: "linear-gradient(90deg, rgba(251,191,36,0.18), transparent)" }} />
      </div>
    </div>
  );
}

// ── RECENT MODE CHIP ──────────────────────────────────────────────────────────
function RecentModeChip({ rm, onClick }: { rm: RecentMode; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: "0.4rem",
        padding: "0.32rem 0.75rem",
        background: hov ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.06)",
        border: `1px solid ${hov ? "rgba(168,85,247,0.55)" : "rgba(168,85,247,0.2)"}`,
        borderRadius: "30px", cursor: "pointer", transition: "all 0.2s",
        boxShadow: hov ? "0 0 16px rgba(168,85,247,0.2)" : "none",
      }}
    >
      <span style={{ fontSize: "0.72rem" }}>{rm.icon}</span>
      <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.52rem", color: hov ? "rgba(220,190,255,0.95)" : "rgba(192,132,252,0.65)", letterSpacing: "0.5px", fontWeight: 700, whiteSpace: "nowrap", transition: "color 0.2s" }}>{rm.label}</span>
    </button>
  );
}

// ── HOMEPAGE ──────────────────────────────────────────────────────────────────
export default function Homepage(props: HomepageProps) {
  const isMobile = useIsMobile(768);
  const [mounted, setMounted] = useState(false);
  const [surpriseHov, setSurpriseHov] = useState(false);
  const [showDice, setShowDice] = useState(false);
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

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "transparent" }}>
      {showDice && <StoryDice onClose={() => setShowDice(false)} />}

      <style>{`
        @keyframes shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
        @keyframes shimmerSweep { 0% { transform: translateX(-100%); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateX(100%); opacity: 0; } }
        @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.55; transform:scale(0.6); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeSlideIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
        @keyframes hdrShimmer { 0% { background-position: 0% center; } 100% { background-position: 200% center; } }
        @keyframes floatOrb { 0%,100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-22px) scale(1.04); } }
        @keyframes floatOrb2 { 0%,100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(16px) scale(0.97); } }
        @keyframes surpriseGlow { 0%,100% { box-shadow: 0 0 24px rgba(168,85,247,0.38), 0 0 60px rgba(168,85,247,0.1); } 50% { box-shadow: 0 0 40px rgba(168,85,247,0.7), 0 0 90px rgba(168,85,247,0.22); } }
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(200vh); } }
        @keyframes chipIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
        @keyframes titleReveal { from { opacity:0; letter-spacing:0.22em; } to { opacity:1; letter-spacing:0.12em; } }
        @keyframes borderGlow { 0%,100% { opacity:0.35; } 50% { opacity:1; } }
        @keyframes toolIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .hp-chip-animate { animation: chipIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .hp-tool-animate { animation: toolIn 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        @media (max-width: 900px) {
          .hp-cols { grid-template-columns: 1fr !important; }
          .hp-primary-card { height: auto !important; min-height: 300px !important; }
          .hp-nav-stats { display: none !important; }
          .hp-nav { padding: 0 1rem !important; }
          .hp-pad { padding-left: 1rem !important; padding-right: 1rem !important; }
          .hp-surprise { flex-direction: column !important; gap: 0.5rem !important; text-align: center !important; }
        }
        @media (max-width: 640px) {
          .hp-general { grid-template-columns: 1fr !important; }
          .hp-cols { gap: 1rem !important; }
        }
        @media (max-width: 480px) {
          .hp-pad { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
        }
      `}</style>

      {/* ── AMBIENT ORBS ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-15%", left: "-8%", width: "950px", height: "850px", background: "radial-gradient(ellipse, rgba(110,0,210,0.16) 0%, transparent 60%)", animation: "floatOrb 16s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "5%", right: "-12%", width: "750px", height: "750px", background: "radial-gradient(ellipse, rgba(220,40,90,0.12) 0%, transparent 60%)", animation: "floatOrb2 20s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-8%", left: "20%", width: "850px", height: "550px", background: "radial-gradient(ellipse, rgba(50,15,150,0.11) 0%, transparent 60%)", animation: "floatOrb 24s ease-in-out infinite 2s" }} />
        <div style={{ position: "absolute", top: "38%", left: "38%", width: "550px", height: "550px", background: "radial-gradient(ellipse, rgba(190,90,20,0.065) 0%, transparent 60%)", animation: "floatOrb2 18s ease-in-out infinite 4s" }} />
        {/* Scanline */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.08) 30%, rgba(168,85,247,0.08) 70%, transparent)", animation: "scanline 12s linear infinite", pointerEvents: "none", opacity: 0.4 }} />
      </div>

      {/* ── NAV ── */}
      <nav className="hp-nav" style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2.5rem", height: "58px", flexShrink: 0, background: "rgba(3,0,9,0.92)", backdropFilter: "blur(28px)", borderBottom: "1px solid rgba(255,255,255,0.038)" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.65) 20%, rgba(251,191,36,0.55) 50%, rgba(239,68,68,0.65) 80%, transparent)", animation: "borderGlow 4s ease-in-out infinite" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#A855F7", boxShadow: "0 0 16px #A855F7, 0 0 35px rgba(168,85,247,0.45)", animation: "pulseDot 2.5s ease-in-out infinite" }} />
          <span style={{ fontSize: "0.95rem", fontWeight: 900, letterSpacing: "5.5px", background: "linear-gradient(135deg, #F5D67A 0%, #E8B830 35%, #D4A017 55%, #E8C840 75%, #F5D67A 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontFamily: "'Cinzel', serif", animation: "hdrShimmer 5s linear infinite" }}>SHADOWWEAVE</span>
        </div>
        <div className="hp-nav-stats" style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
          {[["27+", "Story Modes"], ["181+", "Heroines"], ["Venice AI", "Engine"], ["Uncensored", "Model"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "rgba(235,195,65,0.85)", lineHeight: 1, fontFamily: "'Cinzel', serif" }}>{v}</div>
              <div style={{ fontSize: "0.4rem", color: "rgba(200,200,220,0.28)", letterSpacing: "2.5px", textTransform: "uppercase", marginTop: "2px", fontFamily: "'Montserrat', sans-serif" }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          {streak.count >= 2 && (
            <div title={`${streak.count}-day streak · Best: ${streak.best}`} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.32rem 0.8rem", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "20px", cursor: "default", boxShadow: "0 0 12px rgba(245,158,11,0.12)" }}>
              <span style={{ fontSize: "0.82rem" }}>🔥</span>
              <span style={{ fontSize: "0.6rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", color: "rgba(253,186,69,0.88)", fontWeight: 700 }}>{streak.count}</span>
            </div>
          )}
          <button onClick={props.onAchievements} style={{ display: "flex", alignItems: "center", gap: "0.48rem", padding: "0.44rem 0.95rem", background: "rgba(245,214,122,0.07)", border: "1px solid rgba(245,214,122,0.2)", borderRadius: "30px", cursor: "pointer", color: "inherit", transition: "all 0.28s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(245,214,122,0.16)"; e.currentTarget.style.borderColor = "rgba(245,214,122,0.58)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(245,214,122,0.18)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(245,214,122,0.07)"; e.currentTarget.style.borderColor = "rgba(245,214,122,0.2)"; e.currentTarget.style.boxShadow = "none"; }}>
            <span style={{ fontSize: "0.68rem" }}>🏆</span>
            {!isMobile && <span style={{ fontSize: "0.54rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(245,214,122,0.78)", fontWeight: 700, fontFamily: "'Cinzel', serif" }}>{achCount > 0 ? `${achCount} · ${achXP} XP` : "Trophies"}</span>}
          </button>
          <button onClick={props.onStoryArchive} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.44rem 1rem", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.28)", borderRadius: "30px", cursor: "pointer", color: "inherit", transition: "all 0.28s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.22)"; e.currentTarget.style.borderColor = "rgba(168,85,247,0.68)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(168,85,247,0.28)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.1)"; e.currentTarget.style.borderColor = "rgba(168,85,247,0.28)"; e.currentTarget.style.boxShadow = "none"; }}>
            <span style={{ fontSize: "0.68rem", color: "rgba(192,132,252,0.88)" }}>◈</span>
            {!isMobile && <span style={{ fontSize: "0.57rem", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(192,132,252,0.88)", fontWeight: 700, fontFamily: "'Cinzel', serif" }}>Archive</span>}
          </button>
        </div>
      </nav>

      {/* ── HERO HEADER ── */}
      <div className="hp-pad" style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "3rem 2rem 1.6rem", opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.7s ease both" : "none" }}>
        <div style={{ fontSize: "0.46rem", letterSpacing: "9px", color: "rgba(168,85,247,0.5)", fontFamily: "'Cinzel', serif", marginBottom: "0.9rem", textTransform: "uppercase", animation: mounted ? "fadeUp 0.55s 0.05s ease both" : "none" }}>Professional Dark Narrative Studio</div>
        <h1 style={{ margin: "0 0 0.65rem", fontFamily: "'Cinzel', serif", fontSize: "clamp(2rem, 5.5vw, 3.6rem)", fontWeight: 900, letterSpacing: "0.12em", background: "linear-gradient(135deg, #F5D67A 0%, #E8B830 28%, #FFFFFF 50%, #E8B830 72%, #F5D67A 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "hdrShimmer 6s linear infinite, titleReveal 0.9s cubic-bezier(0.22,1,0.36,1) both", lineHeight: 1.05, textShadow: "none" }}>CHOOSE YOUR MODE</h1>
        <p style={{ margin: 0, fontSize: "0.82rem", color: "rgba(200,195,240,0.35)", fontFamily: "'Raleway', sans-serif", letterSpacing: "2.5px" }}>Each mode generates a fully uncensored AI-written dark narrative</p>
        {/* Divider */}
        <div style={{ marginTop: "1.3rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1.2rem" }}>
          <div style={{ flex: 1, maxWidth: "180px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.45))" }} />
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#A855F7", boxShadow: "0 0 14px #A855F7, 0 0 30px rgba(168,85,247,0.35)" }} />
          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(168,85,247,0.4)" }} />
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#A855F7", boxShadow: "0 0 14px #A855F7, 0 0 30px rgba(168,85,247,0.35)" }} />
          <div style={{ flex: 1, maxWidth: "180px", height: "1px", background: "linear-gradient(90deg, rgba(168,85,247,0.45), transparent)" }} />
        </div>
        {/* Action buttons */}
        <div style={{ marginTop: "1.6rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }} className="hp-surprise">
          <button
            onClick={props.onSurpriseMe}
            onMouseEnter={() => setSurpriseHov(true)}
            onMouseLeave={() => setSurpriseHov(false)}
            style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.82rem 2.2rem",
              background: surpriseHov
                ? "linear-gradient(135deg, rgba(109,40,217,0.6), rgba(147,51,234,0.6))"
                : "linear-gradient(135deg, rgba(109,40,217,0.22), rgba(147,51,234,0.22))",
              border: `1px solid ${surpriseHov ? "rgba(168,85,247,0.8)" : "rgba(168,85,247,0.32)"}`,
              borderRadius: "50px", cursor: "pointer", transition: "all 0.32s",
              animation: "surpriseGlow 3s ease-in-out infinite",
              boxShadow: surpriseHov ? "0 10px 40px rgba(109,40,217,0.5), 0 0 70px rgba(168,85,247,0.18)" : "0 0 24px rgba(168,85,247,0.2)",
              transform: surpriseHov ? "translateY(-3px) scale(1.05)" : "none",
            }}
          >
            <span style={{ fontSize: "1.05rem", filter: surpriseHov ? "drop-shadow(0 0 10px rgba(168,85,247,1))" : "none", transition: "filter 0.3s" }}>⚡</span>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.76rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: surpriseHov ? "#EDE9FF" : "rgba(192,132,252,0.82)", transition: "color 0.3s", textShadow: surpriseHov ? "0 0 22px rgba(168,85,247,0.9)" : "none" }}>Surprise Me</span>
            <span style={{ fontSize: "0.64rem", color: surpriseHov ? "rgba(192,132,252,0.65)" : "rgba(168,85,247,0.28)", transition: "color 0.3s", letterSpacing: "1px", fontFamily: "'Montserrat', sans-serif" }}>Random Mode</span>
          </button>
          <button
            onClick={() => setShowDice(true)}
            style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.82rem 1.8rem", background: "linear-gradient(135deg, rgba(28,38,88,0.38), rgba(48,28,88,0.38))", border: "1px solid rgba(90,110,210,0.32)", borderRadius: "50px", cursor: "pointer", transition: "all 0.28s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(28,38,88,0.65), rgba(48,28,88,0.65))"; e.currentTarget.style.borderColor = "rgba(90,110,210,0.72)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(60,80,200,0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(28,38,88,0.38), rgba(48,28,88,0.38))"; e.currentTarget.style.borderColor = "rgba(90,110,210,0.32)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
          >
            <span style={{ fontSize: "1rem" }}>⚄</span>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.76rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(140,168,255,0.82)" }}>Story Dice</span>
            <span style={{ fontSize: "0.62rem", color: "rgba(110,135,215,0.38)", letterSpacing: "1px", fontFamily: "'Montserrat', sans-serif" }}>Idea Fuel</span>
          </button>
        </div>
      </div>

      {/* ── RECENTLY VISITED ── */}
      {recentModes.length > 0 && (
        <div className="hp-pad" style={{ padding: "0 2rem 1.5rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.6s 0.07s ease both" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.6rem" }}>
            <div style={{ width: "3px", height: "14px", borderRadius: "2px", background: "linear-gradient(to bottom, rgba(168,85,247,0.85), rgba(168,85,247,0.15))", boxShadow: "0 0 6px rgba(168,85,247,0.3)" }} />
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.42rem", letterSpacing: "4px", color: "rgba(168,85,247,0.5)", textTransform: "uppercase", fontWeight: 700 }}>Jump Back In</span>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(168,85,247,0.14), transparent)" }} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {recentModes.map((rm) => (
              <RecentModeChip key={rm.page} rm={rm} onClick={() => {
                const map: Record<string, keyof HomepageProps> = {
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
                const propKey = map[rm.page];
                if (propKey) (props[propKey] as () => void)();
              }} />
            ))}
          </div>
        </div>
      )}

      {/* ── DAILY DISPATCH ── */}
      <div className="hp-pad" style={{ padding: "0 2rem 2rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.65s 0.09s ease both" : "none" }}>
        <DailyDispatch heroine={heroine} villain={villain} setting={setting} title={dailyTitle} today={today} onGenerate={props.onDailyScenario} onChronicle={props.onDailyChronicle} />
      </div>

      {/* ── ACTIVITY + STATS ROW ── */}
      <div className="hp-pad" style={{ padding: "0 2rem 1.8rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.6s 0.1s ease both" : "none", display: "flex", gap: "1.2rem", flexWrap: "wrap" }}>
        {/* Heatmap */}
        <div style={{ flex: "2 1 400px", padding: "0.85rem 1.3rem", background: "rgba(5,2,13,0.88)", border: "1px solid rgba(34,197,94,0.1)", borderRadius: "16px", backdropFilter: "blur(16px)" }}>
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
        {/* Archive stats */}
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
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", fontWeight: 900, color: `rgba(${color},0.9)`, letterSpacing: "0.5px", textShadow: `0 0 18px rgba(${color},0.3)`, minWidth: "36px" }}>{value}</div>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.38rem", letterSpacing: "2px", color: `rgba(${color},0.33)`, textTransform: "uppercase", fontWeight: 700 }}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── INFAMY BOARD ── */}
      {topVillains.length > 0 && (
        <div className="hp-pad" style={{ padding: "0 2rem 1.8rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.65s 0.11s ease both" : "none" }}>
          <div style={{ border: "1px solid rgba(239,68,68,0.12)", borderRadius: "18px", overflow: "hidden", background: "rgba(5,2,14,0.88)", backdropFilter: "blur(18px)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.7rem 1.5rem", borderBottom: "1px solid rgba(239,68,68,0.07)", background: "rgba(239,68,68,0.035)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#EF4444", boxShadow: "0 0 12px rgba(239,68,68,0.75)", animation: "pulseDot 2.5s ease-in-out infinite" }} />
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.44rem", letterSpacing: "5px", color: "rgba(239,68,68,0.58)", textTransform: "uppercase", fontWeight: 700 }}>Infamy Board</span>
                <span style={{ fontSize: "0.37rem", color: "rgba(200,200,220,0.18)", letterSpacing: "2px", fontFamily: "'Montserrat', sans-serif" }}>· Most Feared Adversaries ·</span>
              </div>
              <span style={{ fontSize: "0.37rem", letterSpacing: "2px", color: "rgba(239,68,68,0.2)", fontFamily: "'Cinzel', serif", textTransform: "uppercase" }}>Based on your archive</span>
            </div>
            <div style={{ display: "flex", alignItems: "stretch", gap: 0, overflowX: isMobile ? "auto" : "visible" }}>
              {topVillains.map((vs, i) => (
                <div key={vs.name} style={{ flex: isMobile ? "0 0 150px" : 1, minWidth: isMobile ? "150px" : undefined, padding: "1rem 1.2rem", borderRight: i < topVillains.length - 1 ? "1px solid rgba(239,68,68,0.06)" : "none", display: "flex", flexDirection: "column", gap: "0.38rem", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 110%, rgba(${vs.level.rgb},0.07) 0%, transparent 70%)`, pointerEvents: "none" }} />
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.58rem", fontWeight: 900, color: `rgba(${vs.level.rgb},0.22)`, letterSpacing: "1px" }}>#{i + 1}</div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.8rem", fontWeight: 700, color: i === 0 ? vs.level.color : "rgba(222,218,248,0.72)", letterSpacing: "0.5px", lineHeight: 1.2, textShadow: i === 0 ? `0 0 24px ${vs.level.glow}` : "none" }}>{vs.name}</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.16rem 0.6rem", borderRadius: "10px", background: `rgba(${vs.level.rgb},0.1)`, border: `1px solid rgba(${vs.level.rgb},0.22)`, alignSelf: "flex-start" }}>
                    <span style={{ fontSize: "0.38rem", letterSpacing: "2px", color: vs.level.color, fontFamily: "'Cinzel', serif", textTransform: "uppercase", fontWeight: 700 }}>{vs.level.title}</span>
                  </div>
                  <div style={{ fontSize: "0.38rem", color: "rgba(200,200,220,0.24)", letterSpacing: "2px", fontFamily: "'Montserrat', sans-serif" }}>{vs.count} {vs.count === 1 ? "story" : "stories"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── THREE COLUMNS ── */}
      <div className="hp-pad hp-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.7rem", padding: "0 2rem 2.5rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.7s 0.14s ease both" : "none" }}>

        {/* ══ COL 1: HEROINE FORGE ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          <PrimaryCard
            num="I" icon="🔱" iconImg="/icons/heroine-forge.png" tagline="Superhero Universe" title="HEROINE FORGE"
            desc="181+ heroines across Marvel, DC, CW, The Boys, Power Rangers, Animated, Star Wars, and TV universes. Choose your villain and generate a multi-chapter dark thriller."
            stats={[["181+", "Heroines"], ["18", "Modes"], ["8", "Universes"]]}
            features={[]} cta="Enter the Forge" accent="#C084FC" r={168} g={85} b={247}
            onClick={props.onSuperheroMode}
          />
          <SectionLabel label="Specialist Modes" count={18} r={168} g={85} b={247} />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.48rem" }}>
            {([
              { icon: "🌀", title: "Mind Break", badge: "Psych · 5 phases", accent: "#C084FC", r: 192, g: 132, b: 252, mode: "Mind Break Chamber", onClick: props.onMindBreak },
              { icon: "⛓", title: "Two Heroines", badge: "Duo · Shared Cell", accent: "#34D399", r: 52, g: 211, b: 153, mode: "Two Heroines One Cell", onClick: props.onDualCapture },
              { icon: "🕸", title: "Rescue Gone Wrong", badge: "Trap · Ambush", accent: "#FB923C", r: 251, g: 146, b: 60, mode: "Rescue Gone Wrong", onClick: props.onRescueGoneWrong },
              { icon: "⚡", title: "Power Drain", badge: "Meter · Drain", accent: "#60A5FA", r: 96, g: 165, b: 250, mode: "Power Drain Mode", onClick: props.onPowerDrain },
              { icon: "🗡", title: "Mass Capture", badge: "Group · 3–5", accent: "#F87171", r: 248, g: 113, b: 113, mode: "Mass Capture Mode", onClick: props.onMassCapture },
              { icon: "🌑", title: "Corruption Arc", badge: "Arc · 7 chapters", accent: "#F472B6", r: 244, g: 114, b: 182, mode: "Corruption Arc", onClick: props.onCorruptionArc },
              { icon: "⚖", title: "Hero Auction", badge: "Bid · Live", accent: "#FCA311", r: 252, g: 163, b: 17, mode: "Hero Auction", onClick: props.onHeroAuction },
              { icon: "👁", title: "Trophy Display", badge: "Display · Visits", accent: "#EF4444", r: 239, g: 68, b: 68, mode: "Trophy Display", onClick: props.onTrophyDisplay },
              { icon: "📋", title: "Obedience Training", badge: "Session · Track", accent: "#2DD4BF", r: 45, g: 212, b: 191, mode: "Obedience Training", onClick: props.onObedienceTraining },
              { icon: "🎭", title: "The Showcase", badge: "Style · Staged", accent: "#E879F9", r: 232, g: 121, b: 249, mode: "The Showcase", onClick: props.onShowcase },
              { icon: "🔓", title: "Public Property", badge: "Exposed · Open", accent: "#FBBF24", r: 251, g: 191, b: 36, mode: "Public Property", onClick: props.onPublicProperty },
              { icon: "🎲", title: "Betting Pool", badge: "Wager · 2–6", accent: "#A78BFA", r: 167, g: 139, b: 250, mode: "Betting Pool", onClick: props.onBettingPool },
              { icon: "⚔", title: "Villain Team-Up", badge: "Duo · Ego", accent: "#FB7185", r: 251, g: 113, b: 133, mode: "Villain Team-Up", onClick: props.onVillainTeamUp },
              { icon: "🔗", title: "Chain of Custody", badge: "Chain · Transfer", accent: "#94A3B8", r: 148, g: 163, b: 184, mode: "Chain of Custody", onClick: props.onChainOfCustody },
              { icon: "⏳", title: "The Long Game", badge: "Slow Burn · Weeks", accent: "#34D399", r: 52, g: 211, b: 153, mode: "The Long Game", onClick: props.onLongGame },
              { icon: "🪞", title: "Dark Mirror", badge: "Identity · Clone", accent: "#818CF8", r: 129, g: 140, b: 248, mode: "Dark Mirror", onClick: props.onDarkMirror },
              { icon: "🏟", title: "Arena Mode", badge: "Fight · Crowd", accent: "#F97316", r: 249, g: 115, b: 22, mode: "Arena Mode", onClick: props.onArenaMode },
              { icon: "📁", title: "The Handler", badge: "Protocol · Pro", accent: "#D4A76A", r: 212, g: 167, b: 106, mode: "The Handler", onClick: props.onTheHandler },
            ] as const).map((chip, i) => (
              <SpecialistChip
                key={chip.title}
                icon={chip.icon} title={chip.title} badge={chip.badge}
                accent={chip.accent} r={chip.r} g={chip.g} b={chip.b}
                completed={completedModes.includes(chip.mode)}
                onClick={chip.onClick}
                animIdx={i}
              />
            ))}
          </div>
        </div>

        {/* ══ COL 2: CELEBRITY CAPTIVE ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          <PrimaryCard
            num="II" icon="👁" iconImg="/icons/celebrity-captive.png" tagline="Real World Mode" title="CELEBRITY CAPTIVE"
            desc="100 real-world actresses. Build a captor or captor team — 6 archetypes or fully custom. Set the encounter, tone, and scene. Generate an uncensored dark thriller."
            stats={[["100+", "Actresses"], ["6", "Archetypes"], ["8", "Encounters"]]}
            features={[]} cta="Enter the Room" accent="#FCD34D" r={234} g={179} b={8}
            onClick={props.onCelebrityMode}
          />
          <SectionLabel label="Scene Tools" r={234} g={179} b={8} />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            <SubCard icon="🔦" iconImg="/icons/interrogation-room.png" title="Interrogation Room" desc="Live captor-vs-celebrity dialogue, AI-escalated in real time." accent="#FCD34D" r={234} g={179} b={8} badge="Live" onClick={props.onInterrogationRoom} />
            <SubCard icon="🎭" iconImg="/icons/captor-config.png" title="Captor Configuration" desc="Full antagonist profiling — motive, methods, endgame goals." accent="#FBBF24" r={251} g={191} b={36} badge="Profile" onClick={props.onCaptorPortal} />
            <SubCard icon="♟" iconImg="/icons/captor-logic.png" title="Captor Logic Sim" desc="Set rules and goals. AI simulates captor behaviour and consequences." accent="#F59E0B" r={245} g={158} b={11} badge="Sim" onClick={props.onCaptorLogic} />
          </div>
        </div>

        {/* ══ COL 3: CUSTOM SCENARIO ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          <PrimaryCard
            num="III" icon="🔮" iconImg="/icons/custom-scenario.png" tagline="Build From Scratch" title="CUSTOM SCENARIO"
            desc="Create your own heroine — psychology, traumas, breaking points. Profile a captor with 8 configuration questions. Set the scene and let the AI write your story."
            stats={[["7", "Heroine Q's"], ["8", "Captor Q's"], ["∞", "Outcomes"]]}
            features={[]} cta="Start Building" accent="#F87171" r={239} g={68} b={68}
            onClick={props.onEnter}
          />
          <SectionLabel label="Writing Tools" r={239} g={68} b={68} />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            <SubCard icon="⚙" iconImg="/icons/scenario-engine.png" title="Scenario Engine" desc="Generate 8 tailored narrative questions from 4 config inputs." accent="#F87171" r={239} g={68} b={68} badge="Questions" onClick={props.onScenarioGenerator} />
            <SubCard icon="🗺" iconImg="/icons/relationship-map.png" title="Relationship Map" desc="Visual node map of characters and their dynamics." accent="#FC8181" r={252} g={129} b={129} badge="Visual" onClick={props.onCharacterMapper} />
            <SubCard icon="💬" iconImg="/icons/sounding-board.png" title="Sounding Board" desc="Chat with an AI co-writer. Break blocks, get twists, ask anything." accent="#FCA5A5" r={252} g={165} b={165} badge="AI Chat" onClick={props.onSoundingBoard} />
          </div>
        </div>
      </div>

      {/* ── STUDIO TOOLS ── */}
      <div className="hp-pad" style={{ padding: "0 2rem 3.5rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.7s 0.22s ease both" : "none" }}>
        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.4rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.28) 60%, transparent)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(168,85,247,0.45)" }} />
            <span style={{ fontSize: "0.44rem", letterSpacing: "5.5px", textTransform: "uppercase", color: "rgba(168,85,247,0.45)", fontWeight: 700, fontFamily: "'Montserrat', sans-serif", whiteSpace: "nowrap" }}>Studio Tools</span>
            <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(168,85,247,0.45)" }} />
          </div>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.28) 60%, transparent)" }} />
        </div>
        <div className="hp-general" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
          {([
            { icon: "🏆", title: "Trophy Vault", desc: achCount > 0 ? `${achCount} trophies · ${achXP} XP earned` : "Track achievements and unlock dark trophies.", hex: "#E8B830", r: 232, g: 184, b: 48, onClick: props.onAchievements },
            { icon: "📜", title: "Story Archive", desc: "Browse, tag, favourite, and export every story you've saved.", hex: "#3B82F6", r: 59, g: 130, b: 246, onClick: props.onStoryArchive },
            { icon: "⛓", title: "Story Arcs", desc: "Group stories into named arcs and series — Black Widow Saga, Chapter 1, 2, 3…", hex: "#A855F7", r: 168, g: 85, b: 247, onClick: props.onStoryArcs },
            { icon: "🗂", title: "Heroine Dossier", desc: "Per-heroine stats: stories, villains faced, words written, private notes.", hex: "#EC4899", r: 236, g: 72, b: 153, onClick: props.onHeroineDossier },
            { icon: "🕯", title: "Mood Lighting", desc: "Switch atmosphere: Void, Isolation, Candlelight, Glitch.", hex: "#D97706", r: 217, g: 119, b: 6, onClick: () => { const btn = document.querySelector("[title='Change theme']") as HTMLButtonElement | null; btn?.click(); } },
            { icon: "🌙", title: "Daily Chronicle", desc: "The full collection of past daily dark scenarios.", hex: "#8B5CF6", r: 139, g: 92, b: 246, onClick: props.onDailyChronicle },
            { icon: "☠", title: "Villain Builder", desc: "Create custom villains with powers, faction, personality — they appear in all modes.", hex: "#EF4444", r: 239, g: 68, b: 68, onClick: props.onVillainBuilder },
            { icon: "🕸", title: "Character Web", desc: "Visual SVG map: which heroines and villains have crossed paths across your archive.", hex: "#14B8A6", r: 20, g: 184, b: 166, onClick: props.onRelationshipMap },
          ] as const).map((t, i) => (
            <div key={t.title} className="hp-tool-animate" style={{ animationDelay: `${0.05 + i * 0.04}s`, animationFillMode: "both" }}>
              <ToolTile icon={t.icon} title={t.title} desc={t.desc} hex={t.hex} r={t.r} g={t.g} b={t.b} onClick={t.onClick} />
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="hp-pad" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", padding: "0.9rem 2rem", borderTop: "1px solid rgba(168,85,247,0.07)", opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.6s 0.38s ease both" : "none", position: "relative", zIndex: 2 }}>
        <span style={{ fontSize: "0.43rem", color: "rgba(200,200,220,0.12)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>For adult dark fiction writers only</span>
        <span style={{ fontSize: "0.43rem", color: "rgba(200,200,220,0.12)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>Venice AI · venice-uncensored-role-play · Uncensored</span>
      </div>
    </div>
  );
}
