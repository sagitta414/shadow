import { useState, useEffect } from "react";
import StoryDice from "../components/StoryDice";
import { getStreak } from "../lib/streak";
import { getUnlockCount, getTotalXP } from "../lib/achievements";
import { getTopVillains, type VillainStat } from "../lib/infamy";
import { getWritingActivitySet, buildActivitySlots } from "../lib/activityMap";
import { useIsMobile } from "../hooks/useIsMobile";
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

// ── FEATURED CARD ─────────────────────────────────────────────────────────────
function FeaturedCard({ title, desc, badge, accent, r, g, b, onClick, img, stat }: {
  title: string; desc: string; badge: string; accent: string; stat: string;
  r: number; g: number; b: number; onClick: () => void; img: string;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${r},${g},${b}`;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", cursor: "pointer", borderRadius: "22px", overflow: "hidden",
        height: "460px",
        border: `1px solid rgba(${rgb},${hov ? 0.78 : 0.22})`,
        transition: "all 0.45s cubic-bezier(0.22,1,0.36,1)",
        boxShadow: hov
          ? `0 0 0 1px rgba(${rgb},0.2), 0 40px 120px rgba(${rgb},0.45), 0 0 200px rgba(${rgb},0.12), inset 0 0 80px rgba(${rgb},0.08)`
          : `0 8px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(${rgb},0.08)`,
        transform: hov ? "translateY(-12px) scale(1.025)" : "none",
        animation: hov ? "none" : "featBorderPulse 4s ease-in-out infinite",
      }}
    >
      {/* Full-bleed image */}
      <img src={img} alt="" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", objectPosition: "center top",
        opacity: hov ? 0.92 : 0.38,
        transform: hov ? "scale(1.14)" : "scale(1.04)",
        filter: hov
          ? `saturate(1.5) brightness(1.2) contrast(1.1) drop-shadow(0 0 40px rgba(${rgb},0.4))`
          : "saturate(0.4) brightness(0.5)",
        transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)",
      }} />

      {/* Gradient overlays */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(to top, rgba(4,1,12,${hov ? 0.97 : 0.85}) 0%, rgba(4,1,12,${hov ? 0.6 : 0.88}) 35%, rgba(4,1,12,${hov ? 0.0 : 0.38}) 68%, transparent 100%)`,
        transition: "all 0.55s",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "70%",
        background: `radial-gradient(ellipse at 50% 120%, rgba(${rgb},${hov ? 0.3 : 0.0}) 0%, transparent 60%)`,
        transition: "all 0.6s",
      }} />

      {/* Top accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "3px",
        background: hov
          ? `linear-gradient(90deg, transparent, rgba(${rgb},1) 20%, rgba(${rgb},1) 80%, transparent)`
          : `linear-gradient(90deg, transparent, rgba(${rgb},0.35) 50%, transparent)`,
        boxShadow: hov ? `0 0 35px rgba(${rgb},0.85), 0 0 80px rgba(${rgb},0.35)` : `0 0 12px rgba(${rgb},0.2)`,
        transition: "all 0.45s",
      }} />
      {/* Bottom accent bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "2px",
        background: hov ? `linear-gradient(90deg, transparent, rgba(${rgb},0.7) 50%, transparent)` : "none",
        boxShadow: hov ? `0 0 20px rgba(${rgb},0.5)` : "none",
        transition: "all 0.45s",
      }} />
      {/* Left edge */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "2px",
        background: `linear-gradient(to bottom, transparent, rgba(${rgb},${hov ? 0.8 : 0.15}) 35%, rgba(${rgb},${hov ? 0.8 : 0.15}) 65%, transparent)`,
        boxShadow: hov ? `0 0 25px rgba(${rgb},0.7)` : "none",
        transition: "all 0.45s",
      }} />
      {/* Right edge */}
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: "2px",
        background: `linear-gradient(to bottom, transparent, rgba(${rgb},${hov ? 0.8 : 0.15}) 35%, rgba(${rgb},${hov ? 0.8 : 0.15}) 65%, transparent)`,
        boxShadow: hov ? `0 0 25px rgba(${rgb},0.7)` : "none",
        transition: "all 0.45s",
      }} />

      {/* Scan-line reveal */}
      {hov && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `linear-gradient(to bottom, transparent 0%, rgba(${rgb},0.14) 47%, rgba(255,255,255,0.1) 50%, rgba(${rgb},0.14) 53%, transparent 100%)`,
          animation: "imgScanReveal 0.75s ease forwards",
        }} />
      )}
      {/* Shimmer sweep */}
      {hov && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(108deg, transparent 25%, rgba(255,255,255,0.08) 50%, transparent 75%)",
          animation: "shimmerSweep 1.2s ease forwards",
        }} />
      )}

      {/* ── TOP-LEFT: Venice AI live badge ── */}
      <div style={{
        position: "absolute", top: "1.1rem", left: "1.1rem", zIndex: 4,
        display: "flex", alignItems: "center", gap: "0.45rem",
        padding: "4px 10px", borderRadius: "20px",
        background: "rgba(4,1,12,0.75)", border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 10px rgba(34,197,94,0.9)", animation: "pulseDot 2s ease-in-out infinite" }} />
        <span style={{ fontSize: "0.34rem", letterSpacing: "2px", color: "rgba(100,255,150,0.7)", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>Venice AI</span>
      </div>

      {/* ── TOP-RIGHT: UNCENSORED stamp ── */}
      <div style={{
        position: "absolute", top: "1.1rem", right: "1.1rem", zIndex: 4,
        display: "flex", alignItems: "center", gap: "0.4rem",
        padding: "4px 10px", borderRadius: "6px",
        background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.55)",
        backdropFilter: "blur(10px)",
        boxShadow: hov ? "0 0 20px rgba(239,68,68,0.4)" : "none",
        transition: "box-shadow 0.4s",
      }}>
        <span style={{ fontSize: "0.34rem", letterSpacing: "3px", color: "#F87171", fontFamily: "'Montserrat', sans-serif", fontWeight: 900, textTransform: "uppercase" }}>◉ UNCENSORED</span>
      </div>

      {/* ── STAT COUNTER (mid-card, shows when hovered) ── */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: `translate(-50%, -50%) scale(${hov ? 1 : 0.5})`,
        opacity: hov ? 0 : 0,
        pointerEvents: "none", zIndex: 3,
        fontFamily: "'Cinzel', serif", fontSize: "3rem", fontWeight: 900,
        color: `rgba(${rgb},0.08)`, letterSpacing: "0.1em",
        whiteSpace: "nowrap", textAlign: "center",
        transition: "all 0.4s",
        userSelect: "none",
      }}>{stat}</div>

      {/* ── BOTTOM CONTENT ── */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "2rem 1.8rem 1.7rem", zIndex: 2 }}>
        {/* Badge pill */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem",
          padding: "5px 13px", borderRadius: "24px",
          background: `rgba(${rgb},0.18)`, border: `1px solid rgba(${rgb},0.45)`,
          backdropFilter: "blur(12px)",
        }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: accent, boxShadow: `0 0 12px rgba(${rgb},1)`, animation: "pulseDot 2.5s ease-in-out infinite" }} />
          <span style={{ fontSize: "0.38rem", letterSpacing: "2.5px", color: accent, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>{badge}</span>
          <span style={{ fontSize: "0.34rem", letterSpacing: "1px", color: `rgba(${rgb},0.55)`, fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>· {stat}</span>
        </div>
        {/* Title */}
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: hov ? "1.9rem" : "1.45rem",
          fontWeight: 900, color: "#FFFFFF",
          letterSpacing: "0.08em", lineHeight: 1.0,
          marginBottom: "0.6rem",
          textShadow: hov
            ? `0 0 60px rgba(${rgb},0.8), 0 0 120px rgba(${rgb},0.35), 0 2px 30px rgba(0,0,0,0.95)`
            : "0 2px 18px rgba(0,0,0,0.9)",
          transition: "all 0.42s cubic-bezier(0.22,1,0.36,1)",
        }}>{title}</div>
        {/* Desc */}
        <div style={{
          fontSize: "0.66rem", color: "rgba(210,205,240,0.68)",
          fontFamily: "'Raleway', sans-serif", lineHeight: 1.62,
          maxWidth: "88%",
          maxHeight: hov ? "80px" : "0px",
          opacity: hov ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.42s ease, opacity 0.38s ease",
          marginBottom: hov ? "1rem" : "0",
        }}>{desc}</div>
        {/* CTA row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: hov ? "0.8rem" : "0",
          borderTop: `1px solid rgba(${rgb},${hov ? 0.32 : 0})`,
          opacity: hov ? 1 : 0,
          transform: hov ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.42s ease",
        }}>
          <span style={{
            fontFamily: "'Cinzel', serif", fontSize: "0.58rem", letterSpacing: "4px",
            color: accent, fontWeight: 900, textTransform: "uppercase",
            textShadow: `0 0 28px rgba(${rgb},0.9)`,
          }}>Enter the Dark →</span>
          <div style={{ display: "flex", gap: "5px" }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: `rgba(${rgb},${1.1 - i * 0.32})`, boxShadow: `0 0 14px rgba(${rgb},0.9)` }} />
            ))}
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

// ── SUB-MODE CARD ─────────────────────────────────────────────────────────────
function SubModeCard({ icon, title, badge, accent, r, g, b, onClick }: {
  icon: string; title: string; badge: string; accent: string;
  r: number; g: number; b: number; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${r},${g},${b}`;
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: "0.8rem",
        padding: "0.72rem 0.95rem",
        background: hov ? `rgba(${rgb},0.11)` : "rgba(5,2,14,0.78)",
        border: `1px solid ${hov ? `rgba(${rgb},0.48)` : `rgba(${rgb},0.09)`}`,
        borderRadius: "14px", cursor: "pointer",
        transition: "all 0.26s cubic-bezier(0.22,1,0.36,1)",
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? `0 8px 28px rgba(${rgb},0.22), 0 0 0 1px rgba(${rgb},0.08)` : "none",
        backdropFilter: "blur(16px)", position: "relative", overflow: "hidden",
      }}>
      {/* Left glow line */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "2px", background: `linear-gradient(to bottom, transparent, rgba(${rgb},${hov ? 0.75 : 0.1}) 40%, rgba(${rgb},${hov ? 0.75 : 0.1}) 60%, transparent)`, transition: "all 0.26s" }} />
      {/* Shimmer on hover */}
      {hov && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.03) 50%, transparent 65%)", animation: "shimmerSweep 0.7s ease forwards", pointerEvents: "none" }} />}
      {/* Icon box */}
      <div style={{
        width: "34px", height: "34px", borderRadius: "9px", flexShrink: 0,
        background: hov ? `rgba(${rgb},0.22)` : `rgba(${rgb},0.06)`,
        border: `1px solid rgba(${rgb},${hov ? 0.42 : 0.1})`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem",
        filter: hov ? `drop-shadow(0 0 8px rgba(${rgb},0.9))` : "none",
        boxShadow: hov ? `0 0 18px rgba(${rgb},0.28)` : "none",
        transition: "all 0.22s",
      }}>{icon}</div>
      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.66rem", fontWeight: 700, color: hov ? "#fff" : "rgba(216,210,252,0.68)", letterSpacing: "0.03em", transition: "color 0.2s", textShadow: hov ? `0 0 20px rgba(${rgb},0.7)` : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        <div style={{ fontSize: "0.33rem", letterSpacing: "2px", color: hov ? `rgba(${rgb},0.68)` : `rgba(${rgb},0.28)`, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "uppercase", marginTop: "2px", transition: "color 0.2s" }}>{badge}</div>
      </div>
      <span style={{ fontSize: "0.55rem", color: hov ? `rgba(${rgb},0.85)` : `rgba(${rgb},0.18)`, transition: "color 0.2s", flexShrink: 0, textShadow: hov ? `0 0 10px rgba(${rgb},0.8)` : "none" }}>→</span>
    </div>
  );
}

// ── HOMEPAGE ──────────────────────────────────────────────────────────────────
export default function Homepage(props: HomepageProps) {
  const isMobile = useIsMobile(768);
  const [mounted, setMounted] = useState(false);
  const [showDice, setShowDice] = useState(false);
  const [streak] = useState(() => getStreak());
  const [achCount] = useState(() => getUnlockCount());
  const [achXP] = useState(() => getTotalXP());
  const [topVillains] = useState<VillainStat[]>(() => getTopVillains(5));
  const [activitySlots] = useState(() => buildActivitySlots(91));
  const [activitySet] = useState(() => getWritingActivitySet(91));
  const activeDays = activitySet.size;
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
        @keyframes featBorderPulse { 0%,100% { box-shadow: 0 8px 50px rgba(0,0,0,0.7); } 50% { box-shadow: 0 8px 50px rgba(0,0,0,0.7), 0 0 40px rgba(168,85,247,0.08); } }
        @keyframes particleFloat { 0%,100% { transform: translateY(0px) scale(1); opacity: 0.55; } 50% { transform: translateY(-14px) scale(1.15); opacity: 1; } }
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
        @media (max-width: 900px) { .hp-grid { grid-template-columns: 1fr 1fr !important; } .hp-hero-stats { flex-wrap: wrap !important; } .hp-feat-grid { grid-template-columns: 1fr !important; } .hp-sub-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 640px) { .hp-grid { grid-template-columns: 1fr !important; } .hp-tabs { gap: 0.35rem !important; } .hp-tabs button { padding: 0.55rem 0.8rem !important; font-size: 0.5rem !important; } .hp-feat-grid { grid-template-columns: 1fr !important; } }
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

      {/* ══ DAILY CHRONICLE ════════════════════════════════════════════════════════ */}
      <div className="hp-pad" style={{ padding: isMobile ? "1.4rem 1rem 1.2rem" : "1.4rem 2rem 1.2rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.58s 0.05s ease both" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.85rem" }}>
          <div style={{ width: "3px", height: "14px", borderRadius: "2px", background: "linear-gradient(to bottom, rgba(251,191,36,0.9), rgba(251,191,36,0.1))", boxShadow: "0 0 10px rgba(251,191,36,0.4)" }} />
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.44rem", letterSpacing: "4.5px", color: "rgba(251,191,36,0.55)", textTransform: "uppercase", fontWeight: 700 }}>Daily Chronicle</span>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(251,191,36,0.18), transparent)" }} />
          <span style={{ fontSize: "0.36rem", letterSpacing: "2px", color: "rgba(200,200,220,0.22)", fontFamily: "'Montserrat', sans-serif" }}>{today}</span>
        </div>
        <DailyDispatch heroine={heroine} villain={villain} setting={setting} title={dailyTitle} today={today} onGenerate={props.onDailyScenario} onChronicle={props.onDailyChronicle} />
      </div>

      {/* ══ USER STATS ═════════════════════════════════════════════════════════════ */}
      <div className="hp-pad" style={{ padding: isMobile ? "0 1rem 1.5rem" : "0 2rem 1.5rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.58s 0.12s ease both" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.85rem" }}>
          <div style={{ width: "3px", height: "14px", borderRadius: "2px", background: "linear-gradient(to bottom, rgba(168,85,247,0.85), rgba(168,85,247,0.1))", boxShadow: "0 0 8px rgba(168,85,247,0.3)" }} />
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.44rem", letterSpacing: "4.5px", color: "rgba(168,85,247,0.52)", textTransform: "uppercase", fontWeight: 700 }}>Your Record</span>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(168,85,247,0.15), transparent)" }} />
        </div>
        <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
          {[
            { v: streak.count >= 1 ? `${streak.count}🔥` : "—",     l: "Day Streak", c: "245,158,11" },
            { v: archiveStats.total > 0 ? `${archiveStats.total}` : "0", l: "Stories",  c: "168,85,247" },
            { v: archiveStats.totalWords >= 1000 ? `${(archiveStats.totalWords/1000).toFixed(1)}k` : `${archiveStats.totalWords}`, l: "Words",    c: "251,191,36" },
            { v: `${archiveStats.uniqueHeroines}`,  l: "Heroines",   c: "249,115,22" },
            { v: `${archiveStats.modesTried}`,      l: "Modes",      c: "52,211,153"  },
            { v: achXP > 0 ? `${achXP}` : "0",     l: "XP",         c: "232,121,249" },
          ].map(({ v, l, c }, idx) => (
            <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0.55rem 1.1rem", background: `rgba(${c},0.055)`, border: `1px solid rgba(${c},0.14)`, borderRadius: "40px", backdropFilter: "blur(16px)", gap: "1px", animation: mounted ? `statPop 0.5s ${idx * 0.06}s cubic-bezier(0.22,1,0.36,1) both` : "none" }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.9rem", fontWeight: 900, color: `rgba(${c},0.88)`, textShadow: `0 0 18px rgba(${c},0.3)`, letterSpacing: "0.5px" }}>{v}</span>
              <span style={{ fontSize: "0.36rem", letterSpacing: "2.5px", color: `rgba(${c},0.36)`, fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", fontWeight: 700 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ CHOOSE YOUR MODE ═══════════════════════════════════════════════════════ */}
      <div className="hp-pad" style={{ padding: isMobile ? "0 1rem 2rem" : "0 2rem 2rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.62s 0.2s ease both" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "1.1rem" }}>
          <div style={{ width: "3px", height: "14px", borderRadius: "2px", background: "linear-gradient(to bottom, rgba(251,191,36,0.9), rgba(251,191,36,0.1))", boxShadow: "0 0 10px rgba(251,191,36,0.4)" }} />
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.44rem", letterSpacing: "4.5px", color: "rgba(251,191,36,0.52)", textTransform: "uppercase", fontWeight: 700 }}>Choose Your Mode</span>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(251,191,36,0.18), transparent)" }} />
        </div>
        <div className="hp-feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.2rem" }}>
          <FeaturedCard title="HEROINE FORGE" desc="181+ heroines across 8 universes. Choose your captor, set the scene, generate a fully uncensored multi-chapter dark thriller." badge="Core Mode · Flagship" stat="181+ Heroines" accent="#C084FC" r={168} g={85} b={247} onClick={props.onSuperheroMode} img="/icons/heroine-forge.png" />
          <FeaturedCard title="CELEBRITY CAPTURE" desc="Real-world fame meets dark fantasy. Celebrities and villains in an uncensored narrative that shatters the fourth wall." badge="Celebrity · Adults Only" stat="100% Uncensored" accent="#FCA311" r={252} g={163} b={17} onClick={props.onCelebrityMode} img="/icons/celebrity-captive.png" />
          <FeaturedCard title="CUSTOM SCENARIO" desc="Build any premise from scratch. Your heroine, your captor, your rules. No filters. No limits. Pure dark narrative." badge="Custom · No Limits" stat="Infinite Scenarios" accent="#34D399" r={52} g={211} b={153} onClick={props.onScenarioGenerator} img="/icons/custom-scenario.png" />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.8rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <button onClick={props.onSurpriseMe} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.7rem 1.8rem", background: "rgba(168,85,247,0.12)", border: "1.5px solid rgba(168,85,247,0.4)", borderRadius: "50px", cursor: "pointer", transition: "all 0.25s", animation: "surpriseGlow 3.5s ease-in-out infinite" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,85,247,0.28)"; e.currentTarget.style.transform = "translateY(-3px)"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(168,85,247,0.12)"; e.currentTarget.style.transform = "none"; }}>
            <span style={{ fontSize: "1rem" }}>⚡</span>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "2.5px", color: "rgba(200,160,255,0.88)", textTransform: "uppercase" }}>Surprise Me</span>
          </button>
          <button onClick={() => setShowDice(true)} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.7rem 1.5rem", background: "rgba(96,165,250,0.08)", border: "1.5px solid rgba(96,165,250,0.25)", borderRadius: "50px", cursor: "pointer", transition: "all 0.25s" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(96,165,250,0.18)"; e.currentTarget.style.transform = "translateY(-3px)"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(96,165,250,0.08)"; e.currentTarget.style.transform = "none"; }}>
            <span style={{ fontSize: "0.9rem" }}>⚄</span>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "2px", color: "rgba(140,168,255,0.8)", textTransform: "uppercase" }}>Story Dice</span>
          </button>
          <button onClick={props.onStoryArchive} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.7rem 1.5rem", background: "rgba(34,197,94,0.06)", border: "1.5px solid rgba(34,197,94,0.22)", borderRadius: "50px", cursor: "pointer", transition: "all 0.25s" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,197,94,0.14)"; e.currentTarget.style.transform = "translateY(-3px)"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(34,197,94,0.06)"; e.currentTarget.style.transform = "none"; }}>
            <span style={{ fontSize: "0.9rem" }}>◈</span>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "2px", color: "rgba(100,220,140,0.75)", textTransform: "uppercase" }}>Story Archive</span>
          </button>
        </div>
      </div>

      {/* ══ HEROINE FORGE · SPECIALIST MODES ══════════════════════════════════════ */}
      <div className="hp-pad" style={{ padding: isMobile ? "0 1rem 1.8rem" : "0 2rem 1.8rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.62s 0.28s ease both" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.95rem" }}>
          <div style={{ width: "3px", height: "18px", borderRadius: "2px", background: "linear-gradient(to bottom, rgba(192,132,252,1), rgba(192,132,252,0.08))", boxShadow: "0 0 14px rgba(192,132,252,0.6)" }} />
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.44rem", letterSpacing: "4px", color: "rgba(192,132,252,0.65)", textTransform: "uppercase", fontWeight: 700 }}>Heroine Forge · Specialist Modes</span>
          <div style={{ padding: "0.18rem 0.65rem", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "20px" }}>
            <span style={{ fontSize: "0.35rem", letterSpacing: "2px", color: "rgba(192,132,252,0.55)", fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>14 MODES</span>
          </div>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(168,85,247,0.18), transparent)" }} />
        </div>
        <div className="hp-sub-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.52rem" }}>
          {([
            { icon: "🔦", title: "INTERROGATION ROOM", badge: "Psych · High Tension",   r: 248, g: 113, b: 113, accent: "#F87171", onClick: props.onInterrogationRoom },
            { icon: "🌀", title: "MIND BREAK",         badge: "5 Phases · Deep Psych",  r: 192, g: 132, b: 252, accent: "#C084FC", onClick: props.onMindBreak },
            { icon: "⛓", title: "DUAL CAPTURE",       badge: "Duo · Shared Cell",      r: 52,  g: 211, b: 153, accent: "#34D399", onClick: props.onDualCapture },
            { icon: "🕸", title: "RESCUE GONE WRONG",  badge: "Trap · Ambush",          r: 251, g: 146, b: 60,  accent: "#FB923C", onClick: props.onRescueGoneWrong },
            { icon: "⚡", title: "POWER DRAIN",         badge: "Meter · Drain Arc",      r: 96,  g: 165, b: 250, accent: "#60A5FA", onClick: props.onPowerDrain },
            { icon: "🗡", title: "MASS CAPTURE",       badge: "Group · 3–5 Heroines",   r: 248, g: 113, b: 113, accent: "#F87171", onClick: props.onMassCapture },
            { icon: "🌑", title: "CORRUPTION ARC",     badge: "7 Chapters · Arc",        r: 244, g: 114, b: 182, accent: "#F472B6", onClick: props.onCorruptionArc },
            { icon: "📋", title: "OBEDIENCE TRAINING", badge: "Session · Tracked",       r: 45,  g: 212, b: 191, accent: "#2DD4BF", onClick: props.onObedienceTraining },
            { icon: "🤝", title: "VILLAIN TEAM-UP",    badge: "Duo Villain · Conflict",  r: 248, g: 113, b: 113, accent: "#F87171", onClick: props.onVillainTeamUp },
            { icon: "🔗", title: "CHAIN OF CUSTODY",   badge: "Transfer · Multi-Arc",    r: 96,  g: 165, b: 250, accent: "#60A5FA", onClick: props.onChainOfCustody },
            { icon: "⏳", title: "THE LONG GAME",      badge: "Long Burn · Chapters",    r: 168, g: 85,  b: 247, accent: "#C084FC", onClick: props.onLongGame },
            { icon: "🪞", title: "DARK MIRROR",        badge: "Duality · Psych",         r: 232, g: 121, b: 249, accent: "#E879F9", onClick: props.onDarkMirror },
            { icon: "🏛", title: "ARENA MODE",         badge: "Combat · Versus",         r: 239, g: 68,  b: 68,  accent: "#EF4444", onClick: props.onArenaMode },
            { icon: "🕵", title: "THE HANDLER",        badge: "Covert · Intimate",       r: 252, g: 163, b: 17,  accent: "#FCA311", onClick: props.onTheHandler },
          ] as const).map((m, i) => (
            <div key={m.title} className="hp-card-animate" style={{ animationDelay: `${i * 0.03}s` }}>
              <SubModeCard {...m} />
            </div>
          ))}
        </div>
      </div>

      {/* ══ CELEBRITY CAPTURE · SCENARIOS ═════════════════════════════════════════ */}
      <div className="hp-pad" style={{ padding: isMobile ? "0 1rem 1.8rem" : "0 2rem 1.8rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.62s 0.34s ease both" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.95rem" }}>
          <div style={{ width: "3px", height: "18px", borderRadius: "2px", background: "linear-gradient(to bottom, rgba(252,163,17,1), rgba(252,163,17,0.08))", boxShadow: "0 0 14px rgba(252,163,17,0.5)" }} />
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.44rem", letterSpacing: "4px", color: "rgba(252,163,17,0.65)", textTransform: "uppercase", fontWeight: 700 }}>Celebrity Capture · Scenarios</span>
          <div style={{ padding: "0.18rem 0.65rem", background: "rgba(252,163,17,0.08)", border: "1px solid rgba(252,163,17,0.2)", borderRadius: "20px" }}>
            <span style={{ fontSize: "0.35rem", letterSpacing: "2px", color: "rgba(252,163,17,0.55)", fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>5 MODES</span>
          </div>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(252,163,17,0.18), transparent)" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(5,1fr)", gap: "0.52rem" }}>
          {([
            { icon: "⚖", title: "HERO AUCTION",    badge: "Bid · Live Auction",    r: 252, g: 163, b: 17,  accent: "#FCA311", onClick: props.onHeroAuction },
            { icon: "👁", title: "TROPHY DISPLAY",  badge: "Display · Public",      r: 239, g: 68,  b: 68,  accent: "#EF4444", onClick: props.onTrophyDisplay },
            { icon: "🎭", title: "THE SHOWCASE",    badge: "Staged · Audience",     r: 232, g: 121, b: 249, accent: "#E879F9", onClick: props.onShowcase },
            { icon: "🔓", title: "PUBLIC PROPERTY", badge: "Exposed · Open Access", r: 251, g: 191, b: 36,  accent: "#FBBF24", onClick: props.onPublicProperty },
            { icon: "🎲", title: "BETTING POOL",    badge: "Wager · Live Odds",     r: 52,  g: 211, b: 153, accent: "#34D399", onClick: props.onBettingPool },
          ] as const).map((m, i) => (
            <div key={m.title} className="hp-card-animate" style={{ animationDelay: `${i * 0.045}s` }}>
              <SubModeCard {...m} />
            </div>
          ))}
        </div>
      </div>

      {/* ══ STUDIO TOOLS ═══════════════════════════════════════════════════════════ */}
      <div className="hp-pad" style={{ padding: isMobile ? "0 1rem 2rem" : "0 2rem 2rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.62s 0.4s ease both" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.95rem" }}>
          <div style={{ width: "3px", height: "18px", borderRadius: "2px", background: "linear-gradient(to bottom, rgba(52,211,153,1), rgba(52,211,153,0.08))", boxShadow: "0 0 14px rgba(52,211,153,0.45)" }} />
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.44rem", letterSpacing: "4px", color: "rgba(52,211,153,0.62)", textTransform: "uppercase", fontWeight: 700 }}>Studio Tools</span>
          <div style={{ padding: "0.18rem 0.65rem", background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.18)", borderRadius: "20px" }}>
            <span style={{ fontSize: "0.35rem", letterSpacing: "2px", color: "rgba(52,211,153,0.5)", fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>9 TOOLS</span>
          </div>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(52,211,153,0.15), transparent)" }} />
        </div>
        <div className="hp-sub-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.52rem" }}>
          {toolModes.map((m, i) => (
            <div key={m.id} className="hp-card-animate" style={{ animationDelay: `${i * 0.035}s` }}>
              <SubModeCard icon={m.icon} title={m.title} badge={m.badge} accent={m.accent} r={m.r} g={m.g} b={m.b} onClick={m.onClick} />
            </div>
          ))}
        </div>
      </div>

      {/* ══ WRITING ACTIVITY ═══════════════════════════════════════════════════════ */}
      <div className="hp-pad" style={{ padding: isMobile ? "0 1rem 2rem" : "0 2rem 2rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.6s 0.46s ease both" : "none" }}>
        <div style={{ padding: "0.9rem 1.3rem", background: "rgba(5,2,13,0.88)", border: "1px solid rgba(34,197,94,0.1)", borderRadius: "18px", backdropFilter: "blur(16px)" }}>
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
      </div>

      {/* ══ INFAMY BOARD ═══════════════════════════════════════════════════════════ */}
      {topVillains.length > 0 && (
        <div className="hp-pad" style={{ padding: isMobile ? "0 1rem 2.5rem" : "0 2rem 2.5rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.65s 0.52s ease both" : "none" }}>
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

      <div style={{ height: "2rem" }} />
    </div>
  );
}
