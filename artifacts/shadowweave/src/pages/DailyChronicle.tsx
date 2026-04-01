import { useState, useEffect, useRef } from "react";
import { getDailyArchive, DailyEntry } from "../lib/archive";

// ── Data mirrors (must match DailyScenarioPage.tsx) ──────────────────────────
const DAILY_HEROINES = [
  { name: "Black Widow",   color: "#F87171", power: "master spy, acrobat, martial artist, and weapons expert trained by the Red Room since childhood" },
  { name: "Scarlet Witch", color: "#F87171", power: "chaos magic wielder capable of rewriting reality on a whim, Avenger-level threat even alone" },
  { name: "Wonder Woman",  color: "#60A5FA", power: "demi-goddess with godlike strength, speed, lasso of truth, and indestructible bracers" },
  { name: "Zatanna",       color: "#60A5FA", power: "reality-bending backwards-spoken magic, one of the most powerful sorcerers in the DC universe" },
  { name: "Black Canary",  color: "#34D399", power: "sonic Canary Cry capable of destroying steel, elite martial artist, and street-level combatant" },
  { name: "Supergirl",     color: "#34D399", power: "Kryptonian power set — flight, heat vision, freeze breath, near-indestructibility under yellow sun" },
  { name: "Elsa",          color: "#C084FC", power: "ice and snow manipulation on a continental scale, immune to cold, capable of creating life from frozen matter" },
  { name: "Megara",        color: "#C084FC", power: "exceptional cunning and psychological insight, survivor of the underworld, leverage over Hercules himself" },
  { name: "Mulan",         color: "#C084FC", power: "elite military strategist, expert warrior, physically trained to surpass every male soldier in the army" },
  { name: "Starlight",     color: "#FB923C", power: "photon energy blasts, flight, near-invulnerability — and the only moral compass left in the Seven" },
  { name: "Kimiko",        color: "#FB923C", power: "Compound-V enhanced speed and strength with regenerative healing — and complete silence as her weapon" },
  { name: "Pocahontas",    color: "#C084FC", power: "nature communication, preternatural empathy and wisdom, runs with the wind and understands all living things" },
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
function seedForDate(d: Date) { return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }

function getScenarioForDate(d: Date) {
  const s = seedForDate(d);
  const heroine = DAILY_HEROINES[Math.floor(seededRand(s) * DAILY_HEROINES.length)];
  const villain = DAILY_VILLAINS[Math.floor(seededRand(s + 3) * DAILY_VILLAINS.length)];
  const setting = DAILY_SETTINGS[Math.floor(seededRand(s + 7) * DAILY_SETTINGS.length)];
  const tmpl   = TITLE_TEMPLATES[Math.floor(seededRand(s + 11) * TITLE_TEMPLATES.length)];
  const title  = tmpl.replace("{heroine}", heroine.name).replace("{villain}", villain);
  return { heroine, villain, setting, title };
}

function dateKeyFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function shortDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function friendlyDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function readingTime(words: number): string {
  const mins = Math.ceil(words / 220);
  return mins === 1 ? "1 min read" : `${mins} min read`;
}

const DAYS_BACK = 90;
function buildCalendar() {
  const slots = [];
  const today = new Date(); today.setHours(0,0,0,0);
  for (let i = 0; i <= DAYS_BACK; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    slots.push({
      dateKey: dateKeyFromDate(d),
      date: friendlyDate(d),
      shortDate: shortDate(d),
      isToday: i === 0,
      dayIndex: i,
      scenario: getScenarioForDate(d),
    });
  }
  return slots;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface ScenarioData {
  heroine: { name: string; color: string; power: string };
  villain: string;
  setting: string;
  title: string;
}
interface Props {
  onBack: () => void;
  onPlayDate: (dateKey: string, scenario: ScenarioData, mode: "start" | "continue" | "redo") => void;
}

export default function DailyChronicle({ onBack, onPlayDate }: Props) {
  const [savedMap, setSavedMap] = useState<Record<string, DailyEntry>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "generated" | "unplayed">("all");
  const [calendar] = useState(buildCalendar);
  const [mounted, setMounted] = useState(false);
  const expandedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const archive = getDailyArchive();
    const map: Record<string, DailyEntry> = {};
    archive.forEach((e) => { map[e.dateKey] = e; });
    setSavedMap(map);
    setTimeout(() => setMounted(true), 40);
  }, []);

  useEffect(() => {
    if (expanded && expandedRef.current) {
      setTimeout(() => expandedRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
    }
  }, [expanded]);

  const generatedCount = calendar.filter((s) => savedMap[s.dateKey]?.story?.trim()).length;
  const totalWords = calendar.reduce((acc, s) => {
    const story = savedMap[s.dateKey]?.story?.trim();
    if (!story) return acc;
    return acc + story.split(/\s+/).filter(Boolean).length;
  }, 0);

  const visible = calendar.filter((slot) => {
    if (filter === "generated") return !!savedMap[slot.dateKey]?.story?.trim();
    if (filter === "unplayed")  return !savedMap[slot.dateKey]?.story?.trim();
    return true;
  });

  const pct = calendar.length > 0 ? Math.round((generatedCount / calendar.length) * 100) : 0;

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", minHeight: "100vh", padding: "0 1.5rem 4rem" }}>
      <style>{`
        @keyframes pulseDot  { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.35;transform:scale(0.55);} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
        @keyframes shimmerG  { 0%{background-position:0% center;}100%{background-position:200% center;} }
        @keyframes floatOrb  { 0%,100%{transform:translateY(0);}50%{transform:translateY(-16px);} }
        @keyframes expandIn  { from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 18px rgba(200,168,75,0.18);}50%{box-shadow:0 0 38px rgba(200,168,75,0.42);} }
        .dc-entry { transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s; }
        .dc-entry:hover { transform: translateX(2px); }
        .dc-filter { background:none; border:1px solid rgba(200,168,75,0.14); border-radius:20px; padding:0.32rem 1rem; font-family:'Cinzel',serif; font-size:0.58rem; letter-spacing:1.5px; cursor:pointer; transition:all 0.18s; color:rgba(200,168,75,0.38); text-transform:uppercase; }
        .dc-filter:hover { border-color:rgba(200,168,75,0.38); color:rgba(200,168,75,0.65); }
        .dc-filter.on { background:rgba(200,168,75,0.11); border-color:rgba(200,168,75,0.52); color:rgba(228,208,120,0.92) !important; }
        .drop-cap::first-letter { font-family:'Cinzel',serif; font-size:3em; font-weight:900; float:left; line-height:0.75; margin:0.08em 0.08em 0 0; color:rgba(200,168,75,0.85); }
      `}</style>

      {/* Ambient glows */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", top:"-10%", left:"-8%", width:"700px", height:"600px", background:"radial-gradient(ellipse, rgba(150,100,10,0.1) 0%, transparent 60%)", animation:"floatOrb 18s ease-in-out infinite" }} />
        <div style={{ position:"absolute", top:"30%", right:"-10%", width:"500px", height:"500px", background:"radial-gradient(ellipse, rgba(120,0,200,0.07) 0%, transparent 60%)", animation:"floatOrb 24s ease-in-out infinite reverse" }} />
        <div style={{ position:"absolute", bottom:"0", left:"20%", width:"600px", height:"400px", background:"radial-gradient(ellipse, rgba(100,60,0,0.08) 0%, transparent 60%)" }} />
      </div>

      {/* ── HEADER ── */}
      <div style={{ position:"relative", zIndex:2, paddingTop:"2.5rem", paddingBottom:"1.8rem", opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.55s ease both" : "none" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"rgba(200,168,75,0.3)", fontFamily:"'Cinzel',serif", fontSize:"0.68rem", letterSpacing:"2px", cursor:"pointer", padding:0, marginBottom:"1.6rem", transition:"color 0.2s" }} onMouseEnter={e=>e.currentTarget.style.color="rgba(200,168,75,0.7)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(200,168,75,0.3)"}>
          ← RETURN
        </button>

        {/* Title block */}
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"0.6rem", padding:"0.3rem 1.1rem", background:"rgba(200,168,75,0.07)", border:"1px solid rgba(200,168,75,0.2)", borderRadius:"30px", marginBottom:"1.1rem" }}>
            <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"#C8A830", boxShadow:"0 0 10px rgba(200,168,75,0.8)", animation:"pulseDot 2.5s ease-in-out infinite" }} />
            <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"5px", color:"rgba(200,168,75,0.7)", textTransform:"uppercase" }}>Shadowweave · Sealed Records</span>
          </div>
          <h1 style={{ margin:"0 0 0.5rem", fontFamily:"'Cinzel',serif", fontSize:"clamp(2rem, 5vw, 3.4rem)", fontWeight:900, letterSpacing:"0.14em", background:"linear-gradient(135deg, #E8D08A 0%, #C8A830 30%, #FFFFFF 50%, #C8A830 70%, #E8D08A 100%)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmerG 7s linear infinite", lineHeight:1.05 }}>
            THE DARK CHRONICLE
          </h1>
          <p style={{ margin:0, fontFamily:"'Raleway',serif", fontSize:"0.72rem", color:"rgba(200,168,75,0.28)", letterSpacing:"3px", textTransform:"uppercase" }}>
            91 nights · every seal holds a story
          </p>

          {/* Ornamental rule */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"1rem", marginTop:"1.4rem" }}>
            <div style={{ flex:1, maxWidth:"200px", height:"1px", background:"linear-gradient(90deg, transparent, rgba(200,168,75,0.3))" }} />
            <div style={{ display:"flex", gap:"0.5rem" }}>
              {["◆","◇","◆"].map((s,i) => <span key={i} style={{ fontSize: i===1?"0.7rem":"0.45rem", color: i===1?"rgba(200,168,75,0.6)":"rgba(200,168,75,0.25)" }}>{s}</span>)}
            </div>
            <div style={{ flex:1, maxWidth:"200px", height:"1px", background:"linear-gradient(90deg, rgba(200,168,75,0.3), transparent)" }} />
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="chronicle-stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"0.8rem", marginBottom:"1.4rem" }}>
          {[
            { value: calendar.length, label:"Total Seals", sub:"days in the archive" },
            { value: generatedCount, label:"Stories Written", sub:`${pct}% completion`, accent:true },
            { value: calendar.length - generatedCount, label:"Unbroken Seals", sub:"stories not yet told" },
            { value: totalWords > 0 ? `${(totalWords/1000).toFixed(1)}k` : "0", label:"Words Sealed", sub:"across all entries" },
          ].map(({ value, label, sub, accent }) => (
            <div key={label} style={{ padding:"1rem 1.2rem", background:"rgba(6,3,14,0.88)", border:`1px solid rgba(200,168,75,${accent ? 0.22 : 0.08})`, borderRadius:"14px", textAlign:"center", backdropFilter:"blur(12px)" }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.3rem,3vw,1.8rem)", fontWeight:900, color: accent ? "#E8D08A" : "rgba(200,168,75,0.6)", lineHeight:1, marginBottom:"0.3rem", textShadow: accent ? "0 0 24px rgba(200,168,75,0.35)" : "none" }}>{value}</div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"3px", color:"rgba(200,168,75,0.45)", textTransform:"uppercase", marginBottom:"0.2rem" }}>{label}</div>
              <div style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.38rem", color:"rgba(200,168,75,0.2)", letterSpacing:"1px" }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* ── COMPLETION BAR ── */}
        <div style={{ marginBottom:"1.4rem", padding:"0.75rem 1.2rem", background:"rgba(6,3,14,0.88)", border:"1px solid rgba(200,168,75,0.08)", borderRadius:"12px", backdropFilter:"blur(12px)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.5rem" }}>
            <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"4px", color:"rgba(200,168,75,0.4)", textTransform:"uppercase" }}>Chronicle Completion</span>
            <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.65rem", fontWeight:700, color:"rgba(200,168,75,0.7)" }}>{pct}%</span>
          </div>
          <div style={{ height:"5px", background:"rgba(255,255,255,0.04)", borderRadius:"3px", overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg, #7A5010, #C8A830, #E8D08A, #C8A830)", backgroundSize:"200% auto", animation:"shimmerG 4s linear infinite", borderRadius:"3px", transition:"width 0.8s ease", boxShadow:"0 0 12px rgba(200,168,75,0.4)" }} />
          </div>
        </div>

        {/* ── DOT HEATMAP ── */}
        <div style={{ marginBottom:"1.5rem", padding:"1rem 1.2rem", background:"rgba(6,3,14,0.88)", border:"1px solid rgba(200,168,75,0.08)", borderRadius:"12px", backdropFilter:"blur(12px)" }}>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.4rem", letterSpacing:"4px", color:"rgba(200,168,75,0.35)", textTransform:"uppercase", marginBottom:"0.75rem" }}>91-Night Activity Map</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"3px" }}>
            {[...calendar].reverse().map((slot) => {
              const has = !!savedMap[slot.dateKey]?.story?.trim();
              return (
                <div
                  key={slot.dateKey}
                  title={`${slot.shortDate}${has ? " · Written" : " · Not played"}`}
                  onClick={() => { setFilter("all"); setExpanded(slot.dateKey); }}
                  style={{
                    width:"10px", height:"10px", borderRadius:"2px", cursor:"pointer",
                    background: slot.isToday
                      ? "rgba(200,168,75,0.9)"
                      : has
                        ? "rgba(200,168,75,0.52)"
                        : "rgba(255,255,255,0.05)",
                    border: slot.isToday ? "1px solid rgba(200,168,75,0.9)" : "none",
                    boxShadow: slot.isToday ? "0 0 8px rgba(200,168,75,0.7)" : has ? "0 0 4px rgba(200,168,75,0.25)" : "none",
                    transition:"transform 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform="scale(1.5)"; e.currentTarget.style.zIndex="10"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.zIndex="1"; }}
                />
              );
            })}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"1.2rem", marginTop:"0.75rem" }}>
            {[
              { color:"rgba(200,168,75,0.9)", label:"Today" },
              { color:"rgba(200,168,75,0.52)", label:"Written" },
              { color:"rgba(255,255,255,0.05)", label:"Unplayed" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
                <div style={{ width:"8px", height:"8px", borderRadius:"2px", background:color }} />
                <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.38rem", color:"rgba(200,168,75,0.28)", letterSpacing:"1.5px", textTransform:"uppercase" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── FILTER TABS ── */}
        <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.4rem", flexWrap:"wrap" }}>
          {([
            ["all",       `All Seals (${calendar.length})`],
            ["generated", `Written (${generatedCount})`],
            ["unplayed",  `Unbroken (${calendar.length - generatedCount})`],
          ] as const).map(([f, label]) => (
            <button key={f} className={`dc-filter${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── ENTRY LIST ── */}
      <div style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", gap:"0.7rem", opacity: mounted ? 1 : 0, animation: mounted ? "fadeUp 0.6s 0.1s ease both" : "none" }}>
        {visible.map((slot, idx) => {
          const saved   = savedMap[slot.dateKey];
          const hasStory = !!saved?.story?.trim();
          const isOpen  = expanded === slot.dateKey;
          const wordCount = hasStory ? saved.story.trim().split(/\s+/).filter(Boolean).length : 0;
          const paragraphs = hasStory ? saved.story.split(/\n+/).filter(Boolean) : [];
          const title      = hasStory ? (saved as any).title   ?? slot.scenario.title   : slot.scenario.title;
          const villain    = hasStory ? (saved as any).villain  ?? slot.scenario.villain : slot.scenario.villain;
          const setting    = hasStory ? (saved as any).setting  ?? slot.scenario.setting : slot.scenario.setting;
          const heroineName  = hasStory ? saved.heroine : slot.scenario.heroine.name;
          const heroineColor = hasStory ? saved.heroineColor : slot.scenario.heroine.color;
          const chapterCount = hasStory ? (saved.story.match(/---/g)?.length ?? 0) + 1 : 0;
          const preview    = hasStory && paragraphs.length > 0
            ? paragraphs[0].slice(0, 120) + (paragraphs[0].length > 120 ? "…" : "")
            : null;

          return (
            <div
              key={slot.dateKey}
              className="dc-entry"
              style={{
                borderRadius:"14px",
                overflow:"hidden",
                background: isOpen
                  ? "rgba(10,5,22,0.98)"
                  : hasStory
                    ? "rgba(7,3,16,0.9)"
                    : "rgba(4,2,10,0.55)",
                border: `1px solid ${
                  isOpen
                    ? `rgba(200,168,75,0.32)`
                    : hasStory
                      ? `rgba(200,168,75,0.12)`
                      : "rgba(255,255,255,0.04)"
                }`,
                borderLeft: `3px solid ${
                  slot.isToday
                    ? "#C8A830"
                    : hasStory
                      ? (heroineColor ?? "rgba(200,168,75,0.45)")
                      : "rgba(255,255,255,0.06)"
                }`,
                boxShadow: slot.isToday
                  ? "0 0 28px rgba(200,168,75,0.12)"
                  : isOpen
                    ? "0 8px 40px rgba(0,0,0,0.5)"
                    : "none",
                animation: `fadeUp 0.38s ease ${Math.min(idx,18)*0.025}s both`,
                opacity: hasStory ? 1 : 0.55,
              }}
            >
              {/* ── Row header ── */}
              <div
                onClick={() => setExpanded(isOpen ? null : slot.dateKey)}
                style={{ padding:"0.95rem 1.3rem", cursor:"pointer", display:"flex", alignItems:"center", gap:"1.1rem", flexWrap:"wrap" }}
              >
                {/* Date block */}
                <div style={{ flexShrink:0, minWidth:"108px" }}>
                  {slot.isToday && (
                    <div style={{ display:"flex", alignItems:"center", gap:"0.3rem", marginBottom:"0.2rem" }}>
                      <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"#C8A830", boxShadow:"0 0 8px rgba(200,168,75,0.9)", animation:"pulseDot 2s ease-in-out infinite" }} />
                      <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.4rem", letterSpacing:"4px", color:"rgba(200,168,75,0.9)", textTransform:"uppercase" }}>Today</span>
                    </div>
                  )}
                  <div style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.58rem", color: slot.isToday ? "rgba(200,168,75,0.75)" : "rgba(200,168,75,0.3)", letterSpacing:"0.5px", lineHeight:1.3 }}>
                    {slot.shortDate}
                  </div>
                </div>

                {/* Vertical divider */}
                <div style={{ width:"1px", height:"2.8rem", background:`rgba(200,168,75,${hasStory ? 0.12 : 0.04})`, flexShrink:0 }} />

                {/* Main content */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.9rem", fontWeight:700, color: isOpen ? "rgba(232,218,160,0.98)" : hasStory ? "rgba(220,205,150,0.78)" : "rgba(200,185,130,0.32)", marginBottom:"0.28rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", transition:"color 0.2s", textShadow: isOpen ? "0 0 30px rgba(200,168,75,0.3)" : "none" }}>
                    {title}
                  </div>
                  <div style={{ display:"flex", gap:"0.8rem", alignItems:"center", flexWrap:"wrap", marginBottom: preview ? "0.3rem" : 0 }}>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.65rem", color: heroineColor ?? "rgba(200,168,75,0.5)", fontWeight:700, textShadow: hasStory ? `0 0 12px ${heroineColor}66` : "none" }}>
                      {heroineName}
                    </span>
                    <span style={{ fontSize:"0.5rem", color:"rgba(200,168,75,0.2)" }}>✕</span>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.65rem", color:"rgba(210,200,240,0.45)" }}>{villain}</span>
                    {hasStory && wordCount > 0 && (
                      <span style={{ fontSize:"0.48rem", color:"rgba(200,168,75,0.22)", fontFamily:"'Montserrat',sans-serif", letterSpacing:"1px" }}>
                        · {wordCount.toLocaleString()} words · {readingTime(wordCount)}
                      </span>
                    )}
                  </div>
                  {preview && !isOpen && (
                    <div style={{ fontSize:"0.62rem", color:"rgba(200,190,160,0.32)", fontFamily:"'EB Garamond',Georgia,serif", fontStyle:"italic", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"520px" }}>
                      {preview}
                    </div>
                  )}
                </div>

                {/* Right badges */}
                <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", flexShrink:0 }}>
                  {hasStory ? (
                    <span style={{ fontSize:"0.4rem", letterSpacing:"2px", padding:"0.2rem 0.65rem", borderRadius:"20px", background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.22)", color:"rgba(74,222,128,0.65)", fontFamily:"'Cinzel',serif", textTransform:"uppercase", fontWeight:700 }}>
                      ✓ Sealed
                    </span>
                  ) : (
                    <span style={{ fontSize:"0.4rem", letterSpacing:"2px", padding:"0.2rem 0.65rem", borderRadius:"20px", border:"1px solid rgba(200,168,75,0.08)", color:"rgba(200,168,75,0.2)", fontFamily:"'Cinzel',serif", textTransform:"uppercase" }}>
                      Unbroken
                    </span>
                  )}
                  <div style={{ color: isOpen ? "rgba(200,168,75,0.75)" : hasStory ? "rgba(200,168,75,0.28)" : "rgba(255,255,255,0.08)", fontSize:"0.75rem", transition:"all 0.3s", transform: isOpen ? "rotate(180deg)" : "rotate(0)", display:"inline-block" }}>▾</div>
                </div>
              </div>

              {/* ── Expanded panel ── */}
              {isOpen && (
                <div ref={expandedRef} style={{ borderTop:`1px solid rgba(200,168,75,${hasStory ? 0.1 : 0.04})`, animation:"expandIn 0.28s ease both" }}>
                  {/* Setting card */}
                  <div style={{ margin:"1.2rem 1.5rem 0", padding:"0.65rem 1.1rem", background:"rgba(200,168,75,0.04)", border:"1px solid rgba(200,168,75,0.1)", borderRadius:"10px", display:"flex", alignItems:"flex-start", gap:"0.65rem" }}>
                    <span style={{ fontSize:"0.75rem", flexShrink:0 }}>📍</span>
                    <div>
                      <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.38rem", letterSpacing:"3px", color:"rgba(200,168,75,0.35)", textTransform:"uppercase", marginBottom:"0.2rem" }}>Setting</div>
                      <div style={{ fontFamily:"'Raleway',sans-serif", fontSize:"0.72rem", color:"rgba(200,195,220,0.48)", fontStyle:"italic", lineHeight:1.5 }}>{setting}</div>
                    </div>
                  </div>

                  {hasStory ? (
                    <div style={{ padding:"1.5rem 1.5rem 2rem" }}>
                      {/* Chapter ornament */}
                      <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.5rem" }}>
                        <div style={{ flex:1, height:"1px", background:"linear-gradient(90deg, rgba(200,168,75,0.22), transparent)" }} />
                        <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.4rem", letterSpacing:"5px", color:"rgba(200,168,75,0.4)", textTransform:"uppercase" }}>Chronicle Entry · {slot.shortDate}</span>
                        <div style={{ flex:1, height:"1px", background:"linear-gradient(90deg, transparent, rgba(200,168,75,0.22))" }} />
                      </div>

                      {/* Story text */}
                      <div className="drop-cap" style={{ fontFamily:"'EB Garamond',Georgia,serif", fontSize:"1.05rem", lineHeight:1.95, color:"rgba(228,220,200,0.84)", maxWidth:"720px" }}>
                        {paragraphs.map((p, i) => (
                          <p key={i} style={{ margin:"0 0 1.15em", textIndent: i === 0 ? 0 : "1.8em" }}>{p}</p>
                        ))}
                      </div>

                      {/* Footer meta + actions */}
                      <div style={{ marginTop:"2rem", paddingTop:"1rem", borderTop:"1px solid rgba(200,168,75,0.07)" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"1.5rem", flexWrap:"wrap", marginBottom:"1.25rem" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
                            <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.38rem", letterSpacing:"3px", color:"rgba(200,168,75,0.3)", textTransform:"uppercase" }}>Words</span>
                            <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.65rem", color:"rgba(200,168,75,0.55)", fontWeight:700 }}>{wordCount.toLocaleString()}</span>
                          </div>
                          <div style={{ width:"1px", height:"1rem", background:"rgba(200,168,75,0.1)" }} />
                          <div style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
                            <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.38rem", letterSpacing:"3px", color:"rgba(200,168,75,0.3)", textTransform:"uppercase" }}>Reading Time</span>
                            <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.65rem", color:"rgba(200,168,75,0.55)", fontWeight:700 }}>{readingTime(wordCount)}</span>
                          </div>
                          <div style={{ width:"1px", height:"1rem", background:"rgba(200,168,75,0.1)" }} />
                          <div style={{ display:"flex", alignItems:"center", gap:"0.4rem" }}>
                            <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.38rem", letterSpacing:"3px", color:"rgba(200,168,75,0.3)", textTransform:"uppercase" }}>Heroine</span>
                            <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.65rem", color: heroineColor ?? "rgba(200,168,75,0.55)", fontWeight:700, textShadow:`0 0 12px ${heroineColor}66` }}>{heroineName}</span>
                          </div>
                        </div>
                        {/* Action buttons for played entries */}
                        <div style={{ display:"flex", gap:"0.6rem", flexWrap:"wrap" }}>
                          <button
                            onClick={() => onPlayDate(slot.dateKey, slot.scenario, "continue")}
                            style={{ display:"flex", alignItems:"center", gap:"0.4rem", padding:"0.5rem 1.1rem", background:"rgba(200,168,75,0.1)", border:"1px solid rgba(200,168,75,0.3)", borderRadius:"8px", color:"rgba(200,168,75,0.85)", fontFamily:"'Cinzel',serif", fontSize:"0.62rem", letterSpacing:"1.5px", cursor:"pointer", fontWeight:700, transition:"all 0.18s" }}
                            onMouseEnter={e => { e.currentTarget.style.background="rgba(200,168,75,0.2)"; e.currentTarget.style.borderColor="rgba(200,168,75,0.6)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background="rgba(200,168,75,0.1)"; e.currentTarget.style.borderColor="rgba(200,168,75,0.3)"; }}
                          >
                            ▶ Continue — Chapter {chapterCount + 1}
                          </button>
                          <button
                            onClick={() => onPlayDate(slot.dateKey, slot.scenario, "redo")}
                            style={{ display:"flex", alignItems:"center", gap:"0.4rem", padding:"0.5rem 1.1rem", background:"rgba(100,0,200,0.08)", border:"1px solid rgba(120,60,220,0.25)", borderRadius:"8px", color:"rgba(160,120,255,0.75)", fontFamily:"'Cinzel',serif", fontSize:"0.62rem", letterSpacing:"1.5px", cursor:"pointer", fontWeight:700, transition:"all 0.18s" }}
                            onMouseEnter={e => { e.currentTarget.style.background="rgba(100,0,200,0.16)"; e.currentTarget.style.borderColor="rgba(120,60,220,0.55)"; e.currentTarget.style.color="rgba(180,150,255,0.95)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background="rgba(100,0,200,0.08)"; e.currentTarget.style.borderColor="rgba(120,60,220,0.25)"; e.currentTarget.style.color="rgba(160,120,255,0.75)"; }}
                          >
                            ↺ Redo This Night
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding:"2rem 1.5rem", textAlign:"center" }}>
                      <div style={{ fontSize:"2.2rem", marginBottom:"1rem", opacity:0.12 }}>◆</div>
                      <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.88rem", color:"rgba(200,168,75,0.22)", marginBottom:"0.5rem", letterSpacing:"2px" }}>
                        {slot.isToday ? "This Seal Awaits You" : "This Seal Was Never Broken"}
                      </div>
                      <p style={{ fontFamily:"'Raleway',sans-serif", fontSize:"0.7rem", color:"rgba(200,195,220,0.18)", lineHeight:1.75, maxWidth:"340px", margin:"0 auto 1.5rem" }}>
                        {slot.isToday
                          ? "Today's scenario has been seeded — enter the darkness and seal this chapter."
                          : "The scenario was seeded, but no one answered the dark's call that night. Its story remains unwritten."}
                      </p>
                      {/* Start button */}
                      <button
                        onClick={() => onPlayDate(slot.dateKey, slot.scenario, "start")}
                        style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", padding:"0.65rem 1.8rem", background:"linear-gradient(135deg, rgba(200,168,75,0.82), rgba(150,110,30,0.82))", border:"none", borderRadius:"10px", color:"#0a0808", fontFamily:"'Cinzel',serif", fontSize:"0.7rem", fontWeight:900, letterSpacing:"2.5px", textTransform:"uppercase", cursor:"pointer", boxShadow:"0 0 22px rgba(200,168,75,0.22)", transition:"filter 0.18s" }}
                        onMouseEnter={e => { e.currentTarget.style.filter="brightness(1.2)"; }}
                        onMouseLeave={e => { e.currentTarget.style.filter=""; }}
                      >
                        ▶ {slot.isToday ? "Begin Today's Chronicle" : "Write This Night"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ textAlign:"center", marginTop:"3rem", position:"relative", zIndex:2 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"1rem", marginBottom:"0.6rem" }}>
          <div style={{ flex:1, maxWidth:"140px", height:"1px", background:"linear-gradient(90deg, transparent, rgba(200,168,75,0.18))" }} />
          <span style={{ fontSize:"0.4rem", color:"rgba(200,168,75,0.2)", letterSpacing:"3px", fontFamily:"'Montserrat',sans-serif", textTransform:"uppercase" }}>
            {visible.length} of {calendar.length} seals shown
          </span>
          <div style={{ flex:1, maxWidth:"140px", height:"1px", background:"linear-gradient(90deg, rgba(200,168,75,0.18), transparent)" }} />
        </div>
        <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.38rem", color:"rgba(200,168,75,0.1)", letterSpacing:"4px", textTransform:"uppercase" }}>
          Every night a new seal is broken · Every story is sealed forever
        </span>
      </div>
    </div>
  );
}
