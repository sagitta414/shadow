import { useState, useEffect } from "react";
import StoryDice from "../components/StoryDice";
import { getStreak } from "../lib/streak";
import { getCompletedModes, getUnlockCount, getTotalXP } from "../lib/achievements";
import { getTopVillains, type VillainStat } from "../lib/infamy";
import { getWritingActivitySet, buildActivitySlots } from "../lib/activityMap";
import { useIsMobile } from "../hooks/useIsMobile";

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

function PrimaryCard({
  num, icon, iconImg, tagline, title, desc, stats, features, cta,
  accent, r, g, b, onClick,
}: {
  num: string; icon: string; iconImg?: string; tagline: string; title: string; desc: string;
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
      className="hp-primary-card"
      style={{
        position: "relative",
        borderRadius: "18px",
        overflow: "hidden",
        cursor: "pointer",
        height: "340px",
        flexShrink: 0,
        border: `1px solid ${hov ? `rgba(${rgb},0.7)` : `rgba(${rgb},0.18)` }`,
        boxShadow: hov
          ? `0 0 0 1px rgba(${rgb},0.25), 0 24px 80px rgba(${rgb},0.35), 0 0 120px rgba(${rgb},0.1) inset`
          : `0 4px 32px rgba(0,0,0,0.6), 0 0 0 0px rgba(${rgb},0)`,
        transition: "box-shadow 0.35s, border-color 0.35s, transform 0.3s",
        transform: hov ? "translateY(-5px) scale(1.01)" : "translateY(0) scale(1)",
      }}
    >
      {/* Full-bleed background image */}
      {iconImg && (
        <img
          src={iconImg}
          alt={icon}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            opacity: hov ? 0.62 : 0.42,
            transform: hov ? "scale(1.08)" : "scale(1)",
            transition: "opacity 0.4s, transform 0.5s ease",
          }}
        />
      )}

      {/* Gradient overlays */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, rgba(4,1,12,0.98) 0%, rgba(4,1,12,0.75) 38%, rgba(4,1,12,0.15) 70%, transparent 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: hov ? `radial-gradient(ellipse at 50% 0%, rgba(${rgb},0.18) 0%, transparent 65%)` : "none", transition: "opacity 0.4s" }} />

      {/* Top shimmer line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, rgba(${rgb},${hov ? 1 : 0.4}) 40%, rgba(${rgb},${hov ? 1 : 0.4}) 60%, transparent)`, transition: "opacity 0.4s" }} />

      {/* Tagline badge top-right */}
      <div style={{ position: "absolute", top: "1rem", right: "1rem", fontFamily: "'Cinzel', serif", fontSize: "0.44rem", letterSpacing: "3px", color: `rgba(${rgb},${hov ? 0.9 : 0.55})`, textTransform: "uppercase", background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.2)`, borderRadius: "30px", padding: "3px 10px", backdropFilter: "blur(8px)", transition: "color 0.3s" }}>{tagline}</div>

      {/* Roman numeral watermark */}
      <div style={{ position: "absolute", top: "0.8rem", left: "1.1rem", fontFamily: "'Cinzel', serif", fontSize: "0.8rem", fontWeight: 900, color: `rgba(${rgb},${hov ? 0.55 : 0.28})`, letterSpacing: "2px", transition: "color 0.35s" }}>{num}</div>

      {/* Bottom content */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.4rem 1.5rem 1.3rem" }}>
        <h2 style={{ margin: "0 0 0.4rem", fontFamily: "'Cinzel', serif", fontSize: "clamp(1.1rem, 2vw, 1.45rem)", fontWeight: 900, letterSpacing: "0.06em", lineHeight: 1.1, color: hov ? "#FFF" : `rgba(230,225,255,0.88)`, transition: "color 0.3s", textShadow: hov ? `0 0 40px rgba(${rgb},0.8)` : "none" }}>{title}</h2>
        <p style={{ margin: "0 0 0.9rem", fontSize: "0.68rem", color: hov ? "rgba(220,215,240,0.55)" : "rgba(200,195,225,0.35)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.65, transition: "color 0.3s" }}>{desc}</p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "1.2rem", marginBottom: "0.9rem", paddingBottom: "0.75rem", borderBottom: `1px solid rgba(${rgb},${hov ? 0.2 : 0.08})`, transition: "border-color 0.3s" }}>
          {stats.map(([v, l]) => (
            <div key={l}>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", fontWeight: 900, color: hov ? accent : `rgba(${rgb},0.75)`, lineHeight: 1, transition: "color 0.3s", textShadow: hov ? `0 0 20px rgba(${rgb},0.9)` : "none" }}>{v}</div>
              <div style={{ fontSize: "0.38rem", color: `rgba(${rgb},0.38)`, letterSpacing: "2px", textTransform: "uppercase", marginTop: "3px" }}>{l}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.62rem 1rem", background: hov ? `rgba(${rgb},0.18)` : `rgba(${rgb},0.07)`, border: `1px solid ${hov ? `rgba(${rgb},0.55)` : `rgba(${rgb},0.14)`}`, borderRadius: "10px", transition: "all 0.3s", backdropFilter: "blur(10px)" }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.62rem", letterSpacing: "2.5px", textTransform: "uppercase", color: hov ? accent : `rgba(${rgb},0.55)`, transition: "color 0.3s", fontWeight: 700, textShadow: hov ? `0 0 16px rgba(${rgb},1)` : "none" }}>{cta}</span>
          <span style={{ color: hov ? accent : `rgba(${rgb},0.3)`, transition: "all 0.3s", fontSize: "0.9rem", transform: hov ? "translateX(4px)" : "none", display: "inline-block", textShadow: hov ? `0 0 12px rgba(${rgb},1)` : "none" }}>→</span>
        </div>
      </div>
    </div>
  );
}

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
        position: "relative",
        background: hov ? `rgba(${rgb},0.1)` : "rgba(8,3,18,0.7)",
        border: `1px solid ${hov ? `rgba(${rgb},0.5)` : `rgba(${rgb},0.12)`}`,
        borderRadius: "12px",
        padding: "0.75rem 0.9rem",
        cursor: "pointer",
        transition: "all 0.22s ease",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        gap: "0.7rem",
        boxShadow: hov ? `0 4px 24px rgba(${rgb},0.18), 0 0 0 1px rgba(${rgb},0.08)` : "none",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: hov ? `linear-gradient(to bottom, transparent, rgba(${rgb},0.9), transparent)` : `rgba(${rgb},0.2)`, transition: "all 0.25s", borderRadius: "12px 0 0 12px" }} />

      <div style={{ width: "38px", height: "38px", borderRadius: "10px", overflow: "hidden", border: `1px solid rgba(${rgb},${hov ? 0.4 : 0.15})`, flexShrink: 0, transition: "border-color 0.25s, box-shadow 0.25s", boxShadow: hov ? `0 0 16px rgba(${rgb},0.5)` : "none" }}>
        {iconImg
          ? <img src={iconImg} alt={icon} style={{ width: "38px", height: "38px", objectFit: "cover", display: "block" }} />
          : <div style={{ width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", background: `rgba(${rgb},0.1)` }}>{icon}</div>
        }
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.14rem" }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.7rem", fontWeight: 700, color: hov ? "#FFF" : `rgba(225,220,245,0.72)`, transition: "color 0.22s", letterSpacing: "0.02em" }}>{title}</span>
          {badge && <span style={{ fontSize: "0.36rem", letterSpacing: "1.5px", padding: "2px 6px", borderRadius: "4px", background: `rgba(${rgb},0.18)`, color: accent, fontFamily: "'Cinzel', serif", textTransform: "uppercase", flexShrink: 0, border: `1px solid rgba(${rgb},0.22)` }}>{badge}</span>}
        </div>
        <div style={{ fontSize: "0.6rem", color: "rgba(200,195,225,0.3)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.45, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{desc}</div>
      </div>

      <span style={{ fontSize: "0.7rem", color: hov ? accent : "rgba(255,255,255,0.1)", transition: "all 0.22s", flexShrink: 0, transform: hov ? "translateX(3px)" : "none", display: "inline-block", textShadow: hov ? `0 0 10px rgba(${rgb},1)` : "none" }}>→</span>
    </div>
  );
}

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
      style={{ position: "relative", background: hov ? `rgba(${rgb},0.1)` : "rgba(6,2,14,0.6)", border: `1px solid ${hov ? `rgba(${rgb},0.4)` : `rgba(${rgb},0.1)`}`, borderRadius: "12px", padding: "0.85rem 1rem", cursor: "pointer", transition: "all 0.22s", display: "flex", alignItems: "center", gap: "0.7rem", overflow: "hidden", backdropFilter: "blur(8px)", boxShadow: hov ? `0 0 24px rgba(${rgb},0.15)` : "none" }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "2px", background: hov ? hex : "transparent", transition: "background 0.25s", borderRadius: "12px 0 0 12px" }} />
      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `rgba(${rgb},${hov ? 0.15 : 0.07})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0, transition: "all 0.25s", filter: hov ? `drop-shadow(0 0 8px rgba(${rgb},0.7))` : "none" }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.7rem", fontWeight: 700, color: hov ? "#FFF" : "rgba(220,215,240,0.52)", letterSpacing: "0.03em", transition: "color 0.25s", marginBottom: "0.15rem" }}>{title}</div>
        <div style={{ fontSize: "0.61rem", color: "rgba(200,195,225,0.22)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.4 }}>{desc}</div>
      </div>
      <span style={{ fontSize: "0.75rem", color: hov ? `rgba(${rgb},0.7)` : "rgba(255,255,255,0.07)", transition: "all 0.25s", flexShrink: 0 }}>→</span>
    </div>
  );
}

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
      onClick={onGenerate}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        borderRadius: "16px",
        overflow: "hidden",
        border: `1px solid ${hov ? "rgba(251,191,36,0.45)" : "rgba(251,191,36,0.12)"}`,
        background: hov ? "rgba(12,6,28,0.97)" : "rgba(8,3,18,0.95)",
        cursor: "pointer",
        transition: "all 0.3s",
        boxShadow: hov ? "0 0 60px rgba(251,191,36,0.12), 0 8px 40px rgba(0,0,0,0.5)" : "0 4px 24px rgba(0,0,0,0.5)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Top glow line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, rgba(251,191,36,${hov ? 0.8 : 0.28}), rgba(251,191,36,${hov ? 0.8 : 0.28}), transparent)`, transition: "opacity 0.3s" }} />
      {/* Shimmer */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 30%, rgba(251,191,36,0.025) 50%, transparent 70%)", backgroundSize: "200% 100%", animation: hov ? "shimmer 2.5s linear infinite" : "none", pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "stretch" }}>
        {/* Left accent strip */}
        <div style={{ width: "4px", flexShrink: 0, background: hov ? "linear-gradient(to bottom, #F59E0B, #D97706)" : "rgba(251,191,36,0.2)", transition: "background 0.3s", borderRadius: "16px 0 0 16px" }} />

        <div style={{ flex: 1, padding: "1.1rem 1.5rem", display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
          {/* Label + title */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: "0.4rem", letterSpacing: "4px", color: "rgba(251,191,36,0.45)", fontFamily: "'Cinzel', serif", marginBottom: "0.3rem", textTransform: "uppercase" }}>Today's Dispatch · {today}</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(0.85rem, 1.6vw, 1.1rem)", fontWeight: 700, color: hov ? "#FCD34D" : "rgba(251,191,36,0.8)", transition: "color 0.3s", maxWidth: "280px", lineHeight: 1.3, textShadow: hov ? "0 0 30px rgba(251,191,36,0.5)" : "none" }}>{title}</div>
          </div>

          {/* Divider */}
          <div style={{ width: "1px", height: "2.5rem", background: "rgba(251,191,36,0.1)", flexShrink: 0 }} />

          {/* Meta chips */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "0.38rem", color: "rgba(251,191,36,0.35)", letterSpacing: "2.5px", marginBottom: "0.2rem", textTransform: "uppercase" }}>Heroine</div>
              <div style={{ fontSize: "0.78rem", color: heroine.color, fontFamily: "'Cinzel', serif", fontWeight: 700, textShadow: `0 0 16px ${heroine.color}88` }}>{heroine.name}</div>
            </div>
            <div style={{ fontSize: "0.65rem", color: "rgba(251,191,36,0.2)" }}>✕</div>
            <div>
              <div style={{ fontSize: "0.38rem", color: "rgba(251,191,36,0.35)", letterSpacing: "2.5px", marginBottom: "0.2rem", textTransform: "uppercase" }}>Villain</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(210,200,240,0.7)", fontFamily: "'Cinzel', serif" }}>{villain}</div>
            </div>
            <div style={{ width: "1px", height: "2rem", background: "rgba(255,255,255,0.05)", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "0.38rem", color: "rgba(251,191,36,0.35)", letterSpacing: "2.5px", marginBottom: "0.2rem", textTransform: "uppercase" }}>Setting</div>
              <div style={{ fontSize: "0.66rem", color: "rgba(200,195,220,0.45)", fontFamily: "'Raleway', sans-serif", maxWidth: "200px", lineHeight: 1.35 }}>{setting}</div>
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginLeft: "auto", flexShrink: 0, display: "flex", alignItems: "center", gap: "0.5rem", color: hov ? "#FCD34D" : "rgba(251,191,36,0.4)", transition: "all 0.3s", fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "1.5px", textShadow: hov ? "0 0 20px rgba(251,191,36,0.7)" : "none" }}>
            ◆ Generate Today's Story
            <button onClick={(e) => { e.stopPropagation(); onChronicle(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(251,191,36,0.28)", fontFamily: "'Cinzel', serif", fontSize: "0.52rem", letterSpacing: "1.5px", padding: "0 0 0 1rem", transition: "color 0.2s", borderLeft: "1px solid rgba(251,191,36,0.12)" }} onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(251,191,36,0.72)"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(251,191,36,0.28)"; }}>Chronicle →</button>
          </div>
        </div>
      </div>

      {/* ── Ritual Clock strip ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ borderTop: "1px solid rgba(251,191,36,0.07)", padding: "0.42rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.9rem", background: "rgba(0,0,0,0.2)" }}
      >
        <div style={{ width: "28px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.2))" }} />
        <span style={{ fontSize: "0.36rem", letterSpacing: "4px", color: "rgba(251,191,36,0.28)", fontFamily: "'Cinzel', serif", textTransform: "uppercase" }}>Next Dispatch In</span>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.78rem", fontWeight: 700, color: "rgba(251,191,36,0.6)", letterSpacing: "5px", textShadow: "0 0 18px rgba(251,191,36,0.25)", minWidth: "72px", textAlign: "center" }}>{clock}</span>
        <span style={{ fontSize: "0.36rem", letterSpacing: "4px", color: "rgba(251,191,36,0.18)", fontFamily: "'Cinzel', serif", textTransform: "uppercase" }}>Ritual Resets at Midnight</span>
        <div style={{ width: "28px", height: "1px", background: "linear-gradient(90deg, rgba(251,191,36,0.2), transparent)" }} />
      </div>
    </div>
  );
}

function SpecialistChip({ icon, title, badge, accent, r, g, b, completed, onClick }: {
  icon: string; title: string; badge: string;
  accent: string; r: number; g: number; b: number;
  completed?: boolean; onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${r},${g},${b}`;
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.52rem 0.7rem 0.52rem 0.85rem",
        background: hov ? `rgba(${rgb},0.12)` : `rgba(${rgb},0.045)`,
        border: `1px solid rgba(${rgb},${hov ? 0.5 : 0.16})`,
        borderLeft: `3px solid ${hov ? accent : `rgba(${rgb},0.35)`}`,
        borderRadius: "9px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.2s cubic-bezier(0.25,0.46,0.45,0.94)",
        transform: hov ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hov ? `0 6px 20px rgba(${rgb},0.2)` : "none",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Icon + completion badge */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "7px",
          background: hov ? `rgba(${rgb},0.2)` : (completed ? `rgba(${rgb},0.14)` : `rgba(${rgb},0.09)`),
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.9rem", transition: "all 0.2s",
          filter: hov ? `drop-shadow(0 0 6px rgba(${rgb},0.8))` : (completed ? `drop-shadow(0 0 4px rgba(${rgb},0.45))` : "none"),
          border: `1px solid rgba(${rgb},${hov ? 0.35 : completed ? 0.28 : 0.12})`,
        }}>{icon}</div>
        {completed && (
          <div style={{
            position: "absolute", top: "-4px", right: "-4px",
            width: "10px", height: "10px", borderRadius: "50%",
            background: accent,
            border: "1.5px solid rgba(4,1,12,0.9)",
            boxShadow: `0 0 6px ${accent}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.35rem", color: "#000", fontWeight: 900,
          }}>✓</div>
        )}
      </div>
      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.02em",
          color: hov ? "#FFF" : `rgba(225,220,248,0.68)`, transition: "color 0.2s",
          lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{title}</div>
        <div style={{
          fontSize: "0.4rem", letterSpacing: "1.5px", color: hov ? accent : `rgba(${rgb},0.45)`,
          fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", marginTop: "2px",
          transition: "color 0.2s", fontWeight: 700,
        }}>{badge}</div>
      </div>
      {/* Arrow */}
      <span style={{
        fontSize: "0.6rem", color: hov ? accent : `rgba(${rgb},0.2)`,
        flexShrink: 0, transition: "all 0.2s",
        transform: hov ? "translateX(2px)" : "none", display: "inline-block",
      }}>→</span>
    </button>
  );
}

function SectionLabel({ label, r, g, b }: { label: string; r: number; g: number; b: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", margin: "0.4rem 0 0.5rem" }}>
      <div style={{ width: "20px", height: "1px", background: `rgba(${r},${g},${b},0.4)` }} />
      <span style={{ fontSize: "0.4rem", letterSpacing: "4px", textTransform: "uppercase", color: `rgba(${r},${g},${b},0.5)`, fontWeight: 700, fontFamily: "'Montserrat', sans-serif", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, rgba(${r},${g},${b},0.22), transparent)` }} />
    </div>
  );
}

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
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);
  const { heroine, villain, setting, title: dailyTitle } = getDailyScenario();
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "transparent" }}>
      {showDice && <StoryDice onClose={() => setShowDice(false)} />}
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
        @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.65); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes hdrShimmer { 0% { background-position: 0% center; } 100% { background-position: 200% center; } }
        @keyframes floatOrb { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-18px); } }
        @keyframes surpriseGlow { 0%,100% { box-shadow: 0 0 20px rgba(168,85,247,0.35), 0 0 60px rgba(168,85,247,0.08); } 50% { box-shadow: 0 0 35px rgba(168,85,247,0.65), 0 0 80px rgba(168,85,247,0.18); } }
        @media (max-width: 900px) {
          .hp-cols { grid-template-columns: 1fr !important; }
          .hp-primary-card { height: auto !important; min-height: 280px !important; }
          .hp-nav-stats { display: none !important; }
          .hp-nav { padding: 0 1rem !important; }
          .hp-pad { padding-left: 1rem !important; padding-right: 1rem !important; }
          .hp-surprise { flex-direction: column !important; gap: 0.5rem !important; text-align: center !important; }
          .hp-daily { flex-direction: column !important; gap: 0.75rem !important; }
          .hp-daily-meta { flex-wrap: wrap !important; gap: 0.6rem !important; }
        }
        @media (max-width: 640px) {
          .hp-general { grid-template-columns: 1fr !important; }
          .hp-cols { gap: 1rem !important; }
        }
        @media (max-width: 480px) {
          .hp-pad { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
        }
      `}</style>

      {/* Vivid ambient glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", left: "-5%",  width: "900px", height: "800px", background: "radial-gradient(ellipse, rgba(120,0,220,0.14) 0%, transparent 60%)", animation: "floatOrb 14s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "10%",  right: "-10%", width: "700px", height: "700px", background: "radial-gradient(ellipse, rgba(220,50,100,0.11) 0%, transparent 60%)", animation: "floatOrb 18s ease-in-out infinite reverse" }} />
        <div style={{ position: "absolute", bottom: "-5%", left: "25%",  width: "800px", height: "500px", background: "radial-gradient(ellipse, rgba(60,20,160,0.1) 0%, transparent 60%)", animation: "floatOrb 22s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "40%",  left: "35%",   width: "500px", height: "500px", background: "radial-gradient(ellipse, rgba(200,100,20,0.06) 0%, transparent 60%)" }} />
      </div>

      {/* ─── NAV ─── */}
      <nav className="hp-nav" style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2.5rem", height: "56px", flexShrink: 0, background: "rgba(4,1,10,0.9)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.6) 20%, rgba(251,191,36,0.5) 50%, rgba(239,68,68,0.6) 80%, transparent)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#A855F7", boxShadow: "0 0 14px #A855F7, 0 0 30px rgba(168,85,247,0.4)", animation: "pulseDot 2.5s ease-in-out infinite" }} />
          <span style={{ fontSize: "0.92rem", fontWeight: 900, letterSpacing: "5.5px", background: "linear-gradient(135deg, #F5D67A 0%, #E8B830 35%, #D4A017 55%, #E8C840 75%, #F5D67A 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", fontFamily: "'Cinzel', serif", animation: "hdrShimmer 5s linear infinite" }}>SHADOWWEAVE</span>
        </div>

        <div className="hp-nav-stats" style={{ display: "flex", gap: "2.2rem", alignItems: "center" }}>
          {[["9", "Story Modes"], ["181+", "Heroines"], ["Venice AI", "Engine"], ["Uncensored", "Model"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 900, color: "rgba(230,190,60,0.82)", lineHeight: 1, fontFamily: "'Cinzel', serif" }}>{v}</div>
              <div style={{ fontSize: "0.4rem", color: "rgba(200,200,220,0.3)", letterSpacing: "2.5px", textTransform: "uppercase", marginTop: "2px", fontFamily: "'Montserrat', sans-serif" }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {streak.count >= 2 && (
            <div title={`${streak.count}-day streak · Best: ${streak.best}`} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.75rem", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "20px", cursor: "default" }}>
              <span style={{ fontSize: "0.8rem" }}>🔥</span>
              <span style={{ fontSize: "0.58rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", color: "rgba(253,186,69,0.85)", fontWeight: 700 }}>{streak.count}</span>
            </div>
          )}
          <button onClick={props.onAchievements} style={{ display: "flex", alignItems: "center", gap: "0.45rem", padding: "0.42rem 0.9rem", background: "rgba(245,214,122,0.07)", border: "1px solid rgba(245,214,122,0.22)", borderRadius: "30px", cursor: "pointer", color: "inherit", transition: "all 0.3s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(245,214,122,0.14)"; e.currentTarget.style.borderColor = "rgba(245,214,122,0.55)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(245,214,122,0.07)"; e.currentTarget.style.borderColor = "rgba(245,214,122,0.22)"; }}>
            <span style={{ fontSize: "0.65rem" }}>🏆</span>
            {!isMobile && <span style={{ fontSize: "0.52rem", letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(245,214,122,0.75)", fontWeight: 700, fontFamily: "'Cinzel', serif" }}>{achCount > 0 ? `${achCount} · ${achXP} XP` : "Trophies"}</span>}
          </button>
          <button onClick={props.onStoryArchive} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.42rem 1rem", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "30px", cursor: "pointer", color: "inherit", transition: "all 0.3s", boxShadow: "0 0 0 0 rgba(168,85,247,0)" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.2)"; e.currentTarget.style.borderColor = "rgba(168,85,247,0.65)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(168,85,247,0.25)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.1)"; e.currentTarget.style.borderColor = "rgba(168,85,247,0.3)"; e.currentTarget.style.boxShadow = "none"; }}>
            <span style={{ fontSize: "0.65rem", color: "rgba(192,132,252,0.85)" }}>◈</span>
            {!isMobile && <span style={{ fontSize: "0.56rem", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(192,132,252,0.85)", fontWeight: 700, fontFamily: "'Cinzel', serif" }}>Archive</span>}
          </button>
        </div>
      </nav>

      {/* ─── HERO HEADER ─── */}
      <div className="hp-pad" style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "2.5rem 2rem 1.5rem", opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.6s ease both" : "none" }}>
        <div style={{ fontSize: "0.46rem", letterSpacing: "8px", color: "rgba(168,85,247,0.55)", fontFamily: "'Cinzel', serif", marginBottom: "0.8rem", textTransform: "uppercase" }}>Professional Dark Narrative Studio</div>
        <h1 style={{ margin: "0 0 0.6rem", fontFamily: "'Cinzel', serif", fontSize: "clamp(1.8rem, 5vw, 3.2rem)", fontWeight: 900, letterSpacing: "0.12em", background: "linear-gradient(135deg, #F5D67A 0%, #E8B830 30%, #FFFFFF 50%, #E8B830 70%, #F5D67A 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "hdrShimmer 6s linear infinite", lineHeight: 1.1 }}>CHOOSE YOUR MODE</h1>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(200,195,240,0.4)", fontFamily: "'Raleway', sans-serif", letterSpacing: "2px" }}>Each mode generates a fully uncensored AI-written dark narrative</p>
        <div style={{ marginTop: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
          <div style={{ flex: 1, maxWidth: "160px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.4))" }} />
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#A855F7", boxShadow: "0 0 10px #A855F7" }} />
          <div style={{ flex: 1, maxWidth: "160px", height: "1px", background: "linear-gradient(90deg, rgba(168,85,247,0.4), transparent)" }} />
        </div>

        {/* ── SURPRISE ME + STORY DICE ── */}
        <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.85rem", flexWrap: "wrap" }} className="hp-surprise">
          <div style={{ flex: 1, maxWidth: "80px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.2))" }} />
          <button
            onClick={props.onSurpriseMe}
            onMouseEnter={() => setSurpriseHov(true)}
            onMouseLeave={() => setSurpriseHov(false)}
            style={{
              display: "flex", alignItems: "center", gap: "0.7rem",
              padding: "0.75rem 2rem",
              background: surpriseHov
                ? "linear-gradient(135deg, rgba(109,40,217,0.55), rgba(147,51,234,0.55))"
                : "linear-gradient(135deg, rgba(109,40,217,0.25), rgba(147,51,234,0.25))",
              border: `1px solid ${surpriseHov ? "rgba(168,85,247,0.75)" : "rgba(168,85,247,0.35)"}`,
              borderRadius: "50px",
              cursor: "pointer",
              transition: "all 0.3s",
              animation: "surpriseGlow 3s ease-in-out infinite",
              boxShadow: surpriseHov
                ? "0 8px 32px rgba(109,40,217,0.45), 0 0 60px rgba(168,85,247,0.15)"
                : "0 0 20px rgba(168,85,247,0.2)",
              transform: surpriseHov ? "translateY(-2px) scale(1.04)" : "none",
            }}
          >
            <span style={{ fontSize: "1rem", filter: surpriseHov ? "drop-shadow(0 0 8px rgba(168,85,247,1))" : "none", transition: "filter 0.3s" }}>⚡</span>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: surpriseHov ? "#E9D5FF" : "rgba(192,132,252,0.8)", transition: "color 0.3s", textShadow: surpriseHov ? "0 0 20px rgba(168,85,247,0.9)" : "none" }}>Surprise Me</span>
            <span style={{ fontSize: "0.65rem", color: surpriseHov ? "rgba(192,132,252,0.7)" : "rgba(168,85,247,0.3)", transition: "color 0.3s", letterSpacing: "1px", fontFamily: "'Montserrat', sans-serif" }}>Random Story</span>
          </button>
          <button
            onClick={() => setShowDice(true)}
            style={{
              display: "flex", alignItems: "center", gap: "0.6rem",
              padding: "0.75rem 1.6rem",
              background: "linear-gradient(135deg, rgba(30,40,90,0.35), rgba(50,30,90,0.35))",
              border: "1px solid rgba(99,120,220,0.35)",
              borderRadius: "50px", cursor: "pointer", transition: "all 0.3s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(30,40,90,0.6), rgba(50,30,90,0.6))"; e.currentTarget.style.borderColor = "rgba(99,120,220,0.7)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(30,40,90,0.35), rgba(50,30,90,0.35))"; e.currentTarget.style.borderColor = "rgba(99,120,220,0.35)"; }}
          >
            <span style={{ fontSize: "0.95rem" }}>⚄</span>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(147,175,255,0.8)" }}>Story Dice</span>
            <span style={{ fontSize: "0.6rem", color: "rgba(120,140,220,0.4)", letterSpacing: "1px", fontFamily: "'Montserrat', sans-serif" }}>Idea Fuel</span>
          </button>
          <div style={{ flex: 1, maxWidth: "80px", height: "1px", background: "linear-gradient(90deg, rgba(168,85,247,0.2), transparent)" }} />
        </div>
      </div>

      {/* ─── DAILY DISPATCH ─── */}
      <div className="hp-pad" style={{ padding: "0 2rem 1.8rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.65s 0.08s ease both" : "none" }}>
        <DailyDispatch heroine={heroine} villain={villain} setting={setting} title={dailyTitle} today={today} onGenerate={props.onDailyScenario} onChronicle={props.onDailyChronicle} />
      </div>

      {/* ─── WRITING HEATMAP ─── */}
      <div className="hp-pad" style={{ padding: "0 2rem 1.2rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.65s 0.09s ease both" : "none" }}>
        <div style={{ padding: "0.7rem 1.2rem", background: "rgba(6,3,14,0.85)", border: "1px solid rgba(34,197,94,0.1)", borderRadius: "14px", backdropFilter: "blur(12px)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px rgba(34,197,94,0.7)" }} />
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.4rem", letterSpacing: "4px", color: "rgba(34,197,94,0.5)", textTransform: "uppercase" }}>Writing Activity · 91 Days</span>
            </div>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.55rem", color: "rgba(34,197,94,0.6)", fontWeight: 700 }}>
              {activeDays > 0 ? `${activeDays} active day${activeDays !== 1 ? "s" : ""}` : "No stories yet"}
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? "2px" : "3px" }}>
            {activitySlots.map((slot) => {
              const has = activitySet.has(slot.key);
              const dotSize = isMobile ? "7px" : "9px";
              return (
                <div
                  key={slot.key}
                  title={slot.key + (has ? " · Story written" : " · No story")}
                  style={{
                    width: dotSize, height: dotSize, borderRadius: "2px",
                    background: slot.isToday
                      ? (has ? "rgba(34,197,94,0.95)" : "rgba(34,197,94,0.3)")
                      : has
                        ? "rgba(34,197,94,0.6)"
                        : "rgba(255,255,255,0.04)",
                    border: slot.isToday ? "1px solid rgba(34,197,94,0.7)" : "none",
                    boxShadow: slot.isToday && has ? "0 0 8px rgba(34,197,94,0.6)" : "none",
                    transition: "transform 0.12s",
                    cursor: "default",
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.55)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.1rem", marginTop: "0.55rem" }}>
            {[
              { color: "rgba(34,197,94,0.6)", label: "Story written" },
              { color: "rgba(34,197,94,0.3)", label: "Today" },
              { color: "rgba(255,255,255,0.04)", label: "No story" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "2px", background: color }} />
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.36rem", color: "rgba(34,197,94,0.25)", letterSpacing: "1.5px", textTransform: "uppercase" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── INFAMY BOARD ─── */}
      {topVillains.length > 0 && (
        <div className="hp-pad" style={{ padding: "0 2rem 1.6rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.65s 0.1s ease both" : "none" }}>
          <div style={{ border: "1px solid rgba(239,68,68,0.12)", borderRadius: "16px", overflow: "hidden", background: "rgba(6,2,16,0.85)", backdropFilter: "blur(16px)" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.65rem 1.4rem", borderBottom: "1px solid rgba(239,68,68,0.08)", background: "rgba(239,68,68,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#EF4444", boxShadow: "0 0 10px rgba(239,68,68,0.7)", animation: "pulseDot 2.5s ease-in-out infinite" }} />
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.42rem", letterSpacing: "5px", color: "rgba(239,68,68,0.55)", textTransform: "uppercase", fontWeight: 700 }}>Infamy Board</span>
                <span style={{ fontSize: "0.36rem", color: "rgba(200,200,220,0.2)", letterSpacing: "2px", fontFamily: "'Montserrat', sans-serif" }}>· Most Feared Adversaries ·</span>
              </div>
              <span style={{ fontSize: "0.36rem", letterSpacing: "2px", color: "rgba(239,68,68,0.2)", fontFamily: "'Cinzel', serif", textTransform: "uppercase" }}>Based on your archive</span>
            </div>
            {/* Villain row */}
            <div className="infamy-scroll" style={{ display: "flex", alignItems: "stretch", gap: 0, overflowX: isMobile ? "auto" : "visible" }}>
              {topVillains.map((vs, i) => (
                <div key={vs.name} style={{ flex: isMobile ? "0 0 140px" : 1, minWidth: isMobile ? "140px" : undefined, padding: "0.85rem 1rem", borderRight: i < topVillains.length - 1 ? "1px solid rgba(239,68,68,0.06)" : "none", display: "flex", flexDirection: "column", gap: "0.35rem", position: "relative", overflow: "hidden" }}>
                  {/* rank glow bg */}
                  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 100%, rgba(${vs.level.rgb},0.06) 0%, transparent 70%)`, pointerEvents: "none" }} />
                  {/* rank */}
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.55rem", fontWeight: 900, color: `rgba(${vs.level.rgb},0.25)`, letterSpacing: "1px" }}>#{i + 1}</div>
                  {/* name */}
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", fontWeight: 700, color: i === 0 ? vs.level.color : "rgba(220,215,245,0.72)", letterSpacing: "0.5px", lineHeight: 1.2, textShadow: i === 0 ? `0 0 20px ${vs.level.glow}` : "none" }}>{vs.name}</div>
                  {/* infamy title */}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.15rem 0.55rem", borderRadius: "10px", background: `rgba(${vs.level.rgb},0.1)`, border: `1px solid rgba(${vs.level.rgb},0.22)`, alignSelf: "flex-start" }}>
                    <span style={{ fontSize: "0.38rem", letterSpacing: "2px", color: vs.level.color, fontFamily: "'Cinzel', serif", textTransform: "uppercase", fontWeight: 700 }}>{vs.level.title}</span>
                  </div>
                  {/* count */}
                  <div style={{ fontSize: "0.38rem", color: "rgba(200,200,220,0.28)", letterSpacing: "2px", fontFamily: "'Montserrat', sans-serif" }}>{vs.count} {vs.count === 1 ? "story" : "stories"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── THREE COLUMNS ─── */}
      <div className="hp-pad hp-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.4rem", padding: "0 2rem 2rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.65s 0.14s ease both" : "none" }}>

        {/* ══ COL 1: HEROINE FORGE + SPECIALIST MODES ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
          <PrimaryCard
            num="I" icon="🔱" iconImg="/icons/heroine-forge.png" tagline="Superhero Universe" title="HEROINE FORGE"
            desc="181+ heroines across Marvel, DC, CW, The Boys, Power Rangers, Animated, Star Wars, and TV universes. Choose your villain and generate a multi-chapter dark thriller."
            stats={[["181+", "Heroines"], ["18", "Modes"], ["8", "Universes"]]}
            features={["Marvel · DC · CW · The Boys", "Power Rangers · Animated · Star Wars", "Multi-chapter AI story engine"]}
            cta="Enter the Forge" accent="#C084FC" r={168} g={85} b={247}
            onClick={props.onSuperheroMode}
          />
          <SectionLabel label="Specialist Modes" r={168} g={85} b={247} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
            <SpecialistChip icon="🌀" title="Mind Break" badge="Psych · 5 phases" accent="#C084FC" r={192} g={132} b={252} completed={completedModes.includes("Mind Break Chamber")} onClick={props.onMindBreak} />
            <SpecialistChip icon="⛓" title="Two Heroines" badge="Duo · Shared Cell" accent="#34D399" r={52} g={211} b={153} completed={completedModes.includes("Two Heroines One Cell")} onClick={props.onDualCapture} />
            <SpecialistChip icon="🕸" title="Rescue Gone Wrong" badge="Trap · Ambush" accent="#FB923C" r={251} g={146} b={60} completed={completedModes.includes("Rescue Gone Wrong")} onClick={props.onRescueGoneWrong} />
            <SpecialistChip icon="⚡" title="Power Drain" badge="Meter · Drain" accent="#60A5FA" r={96} g={165} b={250} completed={completedModes.includes("Power Drain Mode")} onClick={props.onPowerDrain} />
            <SpecialistChip icon="🗡" title="Mass Capture" badge="Group · 3–5" accent="#F87171" r={248} g={113} b={113} completed={completedModes.includes("Mass Capture Mode")} onClick={props.onMassCapture} />
            <SpecialistChip icon="🌑" title="Corruption Arc" badge="Arc · 7 chapters" accent="#F472B6" r={244} g={114} b={182} completed={completedModes.includes("Corruption Arc")} onClick={props.onCorruptionArc} />
            <SpecialistChip icon="⚖" title="Hero Auction" badge="Bid · Live" accent="#FCA311" r={252} g={163} b={17} completed={completedModes.includes("Hero Auction")} onClick={props.onHeroAuction} />
            <SpecialistChip icon="👁" title="Trophy Display" badge="Display · Visits" accent="#EF4444" r={239} g={68} b={68} completed={completedModes.includes("Trophy Display")} onClick={props.onTrophyDisplay} />
            <SpecialistChip icon="📋" title="Obedience Training" badge="Session · Track" accent="#2DD4BF" r={45} g={212} b={191} completed={completedModes.includes("Obedience Training")} onClick={props.onObedienceTraining} />
            <SpecialistChip icon="🎭" title="The Showcase" badge="Style · Staged" accent="#E879F9" r={232} g={121} b={249} completed={completedModes.includes("The Showcase")} onClick={props.onShowcase} />
            <SpecialistChip icon="🔓" title="Public Property" badge="Exposed · Open" accent="#FBBF24" r={251} g={191} b={36} completed={completedModes.includes("Public Property")} onClick={props.onPublicProperty} />
            <SpecialistChip icon="🎲" title="Betting Pool" badge="Wager · 2–6" accent="#A78BFA" r={167} g={139} b={250} completed={completedModes.includes("Betting Pool")} onClick={props.onBettingPool} />
            <SpecialistChip icon="⚔" title="Villain Team-Up" badge="Duo · Ego" accent="#FB7185" r={251} g={113} b={133} completed={completedModes.includes("Villain Team-Up")} onClick={props.onVillainTeamUp} />
            <SpecialistChip icon="🔗" title="Chain of Custody" badge="Chain · Transfer" accent="#94A3B8" r={148} g={163} b={184} completed={completedModes.includes("Chain of Custody")} onClick={props.onChainOfCustody} />
            <SpecialistChip icon="⏳" title="The Long Game" badge="Slow Burn · Weeks" accent="#34D399" r={52} g={211} b={153} completed={completedModes.includes("The Long Game")} onClick={props.onLongGame} />
            <SpecialistChip icon="🪞" title="Dark Mirror" badge="Identity · Clone" accent="#818CF8" r={129} g={140} b={248} completed={completedModes.includes("Dark Mirror")} onClick={props.onDarkMirror} />
            <SpecialistChip icon="🏟" title="Arena Mode" badge="Fight · Crowd" accent="#F97316" r={249} g={115} b={22} completed={completedModes.includes("Arena Mode")} onClick={props.onArenaMode} />
            <SpecialistChip icon="📁" title="The Handler" badge="Protocol · Pro" accent="#D4A76A" r={212} g={167} b={106} completed={completedModes.includes("The Handler")} onClick={props.onTheHandler} />
          </div>
        </div>

        {/* ══ COL 2: CELEBRITY CAPTIVE ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
          <PrimaryCard
            num="II" icon="👁" iconImg="/icons/celebrity-captive.png" tagline="Real World Mode" title="CELEBRITY CAPTIVE"
            desc="100 real-world actresses. Build a captor or captor team — 6 archetypes or fully custom. Set the encounter, tone, and scene. Generate an uncensored dark thriller."
            stats={[["100+", "Actresses"], ["6", "Archetypes"], ["8", "Encounters"]]}
            features={["Solo or team captors", "10 settings · 6 tones", "Streaming chapter continuation"]}
            cta="Enter the Room" accent="#FCD34D" r={234} g={179} b={8}
            onClick={props.onCelebrityMode}
          />
          <SectionLabel label="Scene Tools" r={234} g={179} b={8} />
          <SubCard icon="🔦" iconImg="/icons/interrogation-room.png" title="Interrogation Room" desc="Live captor-vs-celebrity dialogue, AI-escalated in real time." accent="#FCD34D" r={234} g={179} b={8} badge="Live" onClick={props.onInterrogationRoom} />
          <SubCard icon="🎭" iconImg="/icons/captor-config.png" title="Captor Configuration" desc="Full antagonist profiling — motive, methods, endgame goals." accent="#FBBF24" r={251} g={191} b={36} badge="Profile" onClick={props.onCaptorPortal} />
          <SubCard icon="♟" iconImg="/icons/captor-logic.png" title="Captor Logic Sim" desc="Set rules and goals. AI simulates captor behaviour and consequences." accent="#F59E0B" r={245} g={158} b={11} badge="Sim" onClick={props.onCaptorLogic} />
        </div>

        {/* ══ COL 3: CUSTOM SCENARIO ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
          <PrimaryCard
            num="III" icon="🔮" iconImg="/icons/custom-scenario.png" tagline="Build From Scratch" title="CUSTOM SCENARIO"
            desc="Create your own heroine — psychology, traumas, breaking points. Profile a captor with 8 configuration questions. Set the scene and let the AI write your story."
            stats={[["7", "Heroine Q's"], ["8", "Captor Q's"], ["∞", "Outcomes"]]}
            features={["Full character builder", "Captor profiler", "AI-powered story engine"]}
            cta="Start Building" accent="#F87171" r={239} g={68} b={68}
            onClick={props.onEnter}
          />
          <SectionLabel label="Writing Tools" r={239} g={68} b={68} />
          <SubCard icon="⚙" iconImg="/icons/scenario-engine.png" title="Scenario Engine" desc="Generate 8 tailored narrative questions from 4 config inputs." accent="#F87171" r={239} g={68} b={68} badge="Questions" onClick={props.onScenarioGenerator} />
          <SubCard icon="🗺" iconImg="/icons/relationship-map.png" title="Relationship Map" desc="Visual node map of characters and their dynamics." accent="#FC8181" r={252} g={129} b={129} badge="Visual" onClick={props.onCharacterMapper} />
          <SubCard icon="💬" iconImg="/icons/sounding-board.png" title="Sounding Board" desc="Chat with an AI co-writer. Break blocks, get twists, ask anything." accent="#FCA5A5" r={252} g={165} b={165} badge="AI Chat" onClick={props.onSoundingBoard} />
        </div>
      </div>

      {/* ─── STUDIO TOOLS ─── */}
      <div className="hp-pad" style={{ padding: "0 2rem 3rem", position: "relative", zIndex: 2, opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.65s 0.22s ease both" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginBottom: "0.85rem" }}>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.25) 60%, transparent)" }} />
          <span style={{ fontSize: "0.4rem", letterSpacing: "5px", textTransform: "uppercase", color: "rgba(168,85,247,0.4)", fontWeight: 700, fontFamily: "'Montserrat', sans-serif", whiteSpace: "nowrap" }}>Studio Tools</span>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.25) 60%, transparent)" }} />
        </div>
        <div className="hp-general" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.7rem" }}>
          <ToolTile icon="🏆" title="Trophy Vault" desc={achCount > 0 ? `${achCount} trophies · ${achXP} XP earned` : "Track achievements and unlock dark trophies."} hex="#E8B830" r={232} g={184} b={48} onClick={props.onAchievements} />
          <ToolTile icon="🕯" title="Mood Lighting" desc="Switch atmosphere: Void, Isolation, Candlelight, Glitch." hex="#D97706" r={217} g={119} b={6} onClick={() => { const btn = document.querySelector("[title='Change theme']") as HTMLButtonElement | null; btn?.click(); }} />
          <ToolTile icon="📜" title="Story Archive" desc="Browse, tag, favourite, and export every story you've saved." hex="#3B82F6" r={59} g={130} b={246} onClick={props.onStoryArchive} />
          <ToolTile icon="🌙" title="Daily Chronicle" desc="The full collection of past daily dark scenarios." hex="#8B5CF6" r={139} g={92} b={246} onClick={props.onDailyChronicle} />
          <ToolTile icon="⛓" title="Story Arcs" desc="Group stories into named arcs and series — Black Widow Saga, Chapter 1, 2, 3…" hex="#A855F7" r={168} g={85} b={247} onClick={props.onStoryArcs} />
          <ToolTile icon="🗂" title="Heroine Dossier" desc="Per-heroine stats: stories, villains faced, words written, private notes." hex="#EC4899" r={236} g={72} b={153} onClick={props.onHeroineDossier} />
          <ToolTile icon="☠" title="Villain Builder" desc="Create custom villains with powers, faction, personality — they appear in all modes." hex="#EF4444" r={239} g={68} b={68} onClick={props.onVillainBuilder} />
          <ToolTile icon="🕸" title="Character Web" desc="Visual SVG map: which heroines and villains have crossed paths across your archive." hex="#14B8A6" r={20} g={184} b={166} onClick={props.onRelationshipMap} />
        </div>
      </div>

      {/* Footer */}
      <div className="hp-pad" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", padding: "0.85rem 2rem", borderTop: "1px solid rgba(168,85,247,0.08)", opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.6s 0.38s ease both" : "none", position: "relative", zIndex: 2 }}>
        <span style={{ fontSize: "0.43rem", color: "rgba(200,200,220,0.14)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>For adult dark fiction writers only</span>
        <span style={{ fontSize: "0.43rem", color: "rgba(200,200,220,0.14)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>Venice AI · venice-uncensored-role-play · Uncensored</span>
      </div>
    </div>
  );
}

