import { useState, useEffect } from "react";
import { getDailyArchive, DailyEntry } from "../lib/archive";

// ── Data mirrors (must match DailyScenarioPage.tsx) ──────────────────────────
const DAILY_HEROINES = [
  { name: "Black Widow",   color: "#FF6060", power: "master spy, acrobat, martial artist, and weapons expert trained by the Red Room since childhood" },
  { name: "Scarlet Witch", color: "#FF6060", power: "chaos magic wielder capable of rewriting reality on a whim, Avenger-level threat even alone" },
  { name: "Wonder Woman",  color: "#60A0FF", power: "demi-goddess with godlike strength, speed, lasso of truth, and indestructible bracers" },
  { name: "Zatanna",       color: "#60A0FF", power: "reality-bending backwards-spoken magic, one of the most powerful sorcerers in the DC universe" },
  { name: "Black Canary",  color: "#40E090", power: "sonic Canary Cry capable of destroying steel, elite martial artist, and street-level combatant" },
  { name: "Supergirl",     color: "#40E090", power: "Kryptonian power set — flight, heat vision, freeze breath, near-indestructibility under yellow sun" },
  { name: "Elsa",          color: "#C084FC", power: "ice and snow manipulation on a continental scale, immune to cold, capable of creating life from frozen matter" },
  { name: "Megara",        color: "#C084FC", power: "exceptional cunning and psychological insight, survivor of the underworld, leverage over Hercules himself" },
  { name: "Mulan",         color: "#C084FC", power: "elite military strategist, expert warrior, physically trained to surpass every male soldier in the army" },
  { name: "Starlight",     color: "#FF3D00", power: "photon energy blasts, flight, near-invulnerability — and the only moral compass left in the Seven" },
  { name: "Kimiko",        color: "#FF3D00", power: "Compound-V enhanced speed and strength with regenerative healing — and complete silence as her weapon" },
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

function friendlyDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// Build all calendar slots from DAYS_BACK ago → today (newest first)
const DAYS_BACK = 90;
function buildCalendar(): { dateKey: string; date: string; isToday: boolean; scenario: ReturnType<typeof getScenarioForDate> }[] {
  const slots = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i <= DAYS_BACK; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    slots.push({
      dateKey: dateKeyFromDate(d),
      date: friendlyDate(d),
      isToday: i === 0,
      scenario: getScenarioForDate(d),
    });
  }
  return slots;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  onBack: () => void;
}

export default function DailyChronicle({ onBack }: Props) {
  const [savedMap, setSavedMap] = useState<Record<string, DailyEntry>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "generated" | "unplayed">("all");
  const [calendar] = useState(buildCalendar);

  useEffect(() => {
    const archive = getDailyArchive();
    const map: Record<string, DailyEntry> = {};
    archive.forEach((e) => { map[e.dateKey] = e; });
    setSavedMap(map);
  }, []);

  const generatedCount = calendar.filter((s) => savedMap[s.dateKey]?.story?.trim()).length;

  const visible = calendar.filter((slot) => {
    if (filter === "generated") return !!savedMap[slot.dateKey]?.story?.trim();
    if (filter === "unplayed")  return !savedMap[slot.dateKey]?.story?.trim();
    return true;
  });

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem", minHeight: "100vh" }}>
      <style>{`
        @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.3; transform:scale(0.5); } }
        @keyframes fadeSlide { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .dc-row:hover { border-color: rgba(200,168,75,0.22) !important; }
        .dc-filter-btn { background:none; border:1px solid rgba(200,168,75,0.15); border-radius:20px; padding:0.3rem 0.9rem; font-family:'Cinzel',serif; font-size:0.6rem; letter-spacing:1.5px; cursor:pointer; transition:all 0.18s; }
        .dc-filter-btn:hover { border-color:rgba(200,168,75,0.4); }
        .dc-filter-btn.active { background:rgba(200,168,75,0.12); border-color:rgba(200,168,75,0.5); color:rgba(228,208,120,0.9) !important; }
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1.75rem", flexWrap:"wrap", gap:"0.75rem" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.5rem" }}>
            <div style={{ padding:"0.25rem 0.85rem", background:"rgba(200,168,75,0.12)", border:"1px solid rgba(200,168,75,0.35)", borderRadius:"20px", fontSize:"0.6rem", color:"rgba(200,168,75,0.9)", fontFamily:"'Montserrat',sans-serif", letterSpacing:"2px", textTransform:"uppercase" }}>
              ◆ Daily Chronicle
            </div>
          </div>
          <h1 style={{ margin:0, fontFamily:"'Cinzel',serif", fontSize:"clamp(1.3rem,3vw,2rem)", fontWeight:900, background:"linear-gradient(135deg,#E8D08A 0%,#C8A830 45%,#A07030 80%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
            THE DARK CHRONICLE
          </h1>
          <p style={{ margin:"0.4rem 0 0", fontFamily:"'Raleway',sans-serif", fontSize:"0.73rem", color:"rgba(200,168,75,0.35)", letterSpacing:"1px" }}>
            {DAYS_BACK + 1} daily scenarios — every night a new story is seeded
          </p>
        </div>
        <button onClick={onBack} style={{ background:"none", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"8px", padding:"0.5rem 1rem", color:"rgba(200,200,220,0.4)", fontFamily:"'Cinzel',serif", fontSize:"0.72rem", cursor:"pointer", letterSpacing:"1px", transition:"all 0.2s", flexShrink:0 }}>
          ← Back
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display:"flex", gap:"2rem", marginBottom:"1.5rem", padding:"0.85rem 1.5rem", background:"rgba(8,4,20,0.7)", border:"1px solid rgba(200,168,75,0.08)", borderRadius:"10px", flexWrap:"wrap", alignItems:"center" }}>
        <Stat n={calendar.length} label="Total Days" />
        <Divider />
        <Stat n={generatedCount} label="Generated" accent />
        <Divider />
        <Stat n={calendar.length - generatedCount} label="Unplayed" />
        <Divider />
        <Stat n={new Set(calendar.map((s) => savedMap[s.dateKey]?.heroine).filter(Boolean)).size} label="Heroines" />
        <Divider />
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.72rem", color:"rgba(200,168,75,0.5)", lineHeight:1.4 }}>Latest Story</div>
          <div style={{ fontSize:"0.68rem", color:"rgba(200,195,220,0.5)", fontFamily:"'Raleway',sans-serif" }}>
            {calendar.find((s) => savedMap[s.dateKey]?.story?.trim())?.date ?? "—"}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1.5rem", flexWrap:"wrap" }}>
        {(["all","generated","unplayed"] as const).map((f) => (
          <button
            key={f}
            className={`dc-filter-btn${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
            style={{ color: filter === f ? "rgba(228,208,120,0.9)" : "rgba(200,168,75,0.4)", textTransform:"uppercase" }}
          >
            {f === "all" ? `All (${calendar.length})` : f === "generated" ? `Generated (${generatedCount})` : `Unplayed (${calendar.length - generatedCount})`}
          </button>
        ))}
      </div>

      {/* Entry list */}
      <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
        {visible.map((slot, idx) => {
          const saved = savedMap[slot.dateKey];
          const hasStory = !!saved?.story?.trim();
          const isOpen = expanded === slot.dateKey;
          const wordCount = hasStory ? saved.story.trim().split(/\s+/).filter(Boolean).length : 0;
          const paragraphs = hasStory ? saved.story.split(/\n+/).filter(Boolean) : [];
          const { heroine, villain, setting, title } = hasStory ? saved as any : slot.scenario;
          const heroineColor = hasStory ? saved.heroineColor : slot.scenario.heroine.color;

          return (
            <div
              key={slot.dateKey}
              className="dc-row"
              style={{
                background: isOpen ? "rgba(8,4,20,0.95)" : hasStory ? "rgba(6,2,14,0.85)" : "rgba(4,2,10,0.5)",
                border: `1px solid ${isOpen ? "rgba(200,168,75,0.28)" : hasStory ? "rgba(200,168,75,0.1)" : "rgba(255,255,255,0.04)"}`,
                borderLeft: `3px solid ${slot.isToday ? "rgba(200,168,75,0.9)" : hasStory ? "rgba(200,168,75,0.35)" : "rgba(255,255,255,0.06)"}`,
                borderRadius:"10px",
                overflow:"hidden",
                transition:"border-color 0.25s ease",
                animation:`fadeSlide 0.35s ease ${Math.min(idx, 20) * 0.03}s both`,
                opacity: hasStory ? 1 : 0.62,
              }}
            >
              {/* Row header — always clickable to expand */}
              <div
                onClick={() => setExpanded(isOpen ? null : slot.dateKey)}
                style={{ padding:"0.9rem 1.25rem", cursor:"pointer", display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap" }}
              >
                {/* Date col */}
                <div style={{ flexShrink:0, minWidth:"120px" }}>
                  {slot.isToday && (
                    <div style={{ fontSize:"0.42rem", color:"rgba(200,168,75,0.9)", letterSpacing:"3px", fontFamily:"'Montserrat',sans-serif", textTransform:"uppercase", marginBottom:"0.2rem", display:"flex", alignItems:"center", gap:"0.3rem" }}>
                      <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:"rgba(200,168,75,0.9)", animation:"pulseDot 2s ease-in-out infinite" }} />
                      TODAY
                    </div>
                  )}
                  <div style={{ fontSize:"0.6rem", color: slot.isToday ? "rgba(200,168,75,0.7)" : "rgba(200,168,75,0.3)", fontFamily:"'Montserrat',sans-serif", letterSpacing:"0.5px" }}>
                    {slot.date}
                  </div>
                </div>

                {/* Title + cast */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.88rem", fontWeight:700, color: isOpen ? "rgba(228,215,160,0.95)" : hasStory ? "rgba(220,205,150,0.7)" : "rgba(200,190,140,0.38)", transition:"color 0.2s", marginBottom:"0.25rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {title}
                  </div>
                  <div style={{ display:"flex", gap:"0.85rem", flexWrap:"wrap", alignItems:"center" }}>
                    <span style={{ fontSize:"0.63rem", color: heroineColor, fontFamily:"'Cinzel',serif", opacity: hasStory ? 1 : 0.5 }}>
                      {hasStory ? saved.heroine : slot.scenario.heroine.name}
                    </span>
                    <span style={{ fontSize:"0.6rem", color:"rgba(200,195,220,0.25)" }}>vs</span>
                    <span style={{ fontSize:"0.63rem", color:"rgba(200,195,220,0.4)", fontFamily:"'Cinzel',serif", opacity: hasStory ? 1 : 0.5 }}>
                      {villain}
                    </span>
                    {hasStory && (
                      <span style={{ fontSize:"0.55rem", color:"rgba(200,168,75,0.22)", fontFamily:"'Montserrat',sans-serif" }}>
                        · {wordCount.toLocaleString()} words
                      </span>
                    )}
                  </div>
                </div>

                {/* Right badges */}
                <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", flexShrink:0 }}>
                  {hasStory ? (
                    <span style={{ fontSize:"0.42rem", letterSpacing:"1.5px", padding:"0.18rem 0.55rem", borderRadius:"20px", border:"1px solid rgba(0,180,80,0.25)", color:"rgba(0,200,80,0.55)", fontFamily:"'Montserrat',sans-serif", textTransform:"uppercase" }}>
                      ✓ Generated
                    </span>
                  ) : (
                    <span style={{ fontSize:"0.42rem", letterSpacing:"1.5px", padding:"0.18rem 0.55rem", borderRadius:"20px", border:"1px solid rgba(200,168,75,0.1)", color:"rgba(200,168,75,0.2)", fontFamily:"'Montserrat',sans-serif", textTransform:"uppercase" }}>
                      Not Played
                    </span>
                  )}
                  <div style={{ color: isOpen ? "rgba(200,168,75,0.7)" : hasStory ? "rgba(200,168,75,0.25)" : "rgba(255,255,255,0.08)", fontSize:"0.75rem", transition:"all 0.3s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>
                    ▾
                  </div>
                </div>
              </div>

              {/* Expanded panel */}
              {isOpen && (
                <div style={{ borderTop:`1px solid ${hasStory ? "rgba(200,168,75,0.1)" : "rgba(255,255,255,0.04)"}`, padding:"1.25rem 1.5rem 1.5rem", animation:"fadeSlide 0.25s ease both" }}>
                  {/* Setting card */}
                  <div style={{ marginBottom:"1.25rem", padding:"0.6rem 1rem", background:"rgba(200,168,75,0.04)", border:"1px solid rgba(200,168,75,0.08)", borderRadius:"8px", fontSize:"0.7rem", color:"rgba(200,195,220,0.4)", fontFamily:"'Raleway',sans-serif", fontStyle:"italic" }}>
                    📍 {setting}
                  </div>

                  {hasStory ? (
                    <div style={{ fontFamily:"'EB Garamond',Georgia,serif", fontSize:"1rem", lineHeight:1.85, color:"rgba(220,215,200,0.82)" }}>
                      {paragraphs.map((p, i) => (
                        <p key={i} style={{ margin:"0 0 1.1em", textIndent:"1.5em" }}>{p}</p>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign:"center", padding:"2rem 1rem" }}>
                      <div style={{ fontSize:"1.8rem", marginBottom:"0.75rem", opacity:0.18 }}>◆</div>
                      <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.78rem", color:"rgba(200,168,75,0.25)", marginBottom:"0.4rem" }}>
                        Story not generated
                      </div>
                      <p style={{ fontFamily:"'Raleway',sans-serif", fontSize:"0.68rem", color:"rgba(200,195,220,0.18)", lineHeight:1.7, maxWidth:"300px", margin:"0 auto" }}>
                        {slot.isToday
                          ? "Visit today's Daily Dark Scenario to generate and save this story."
                          : "This day's scenario was never played. Its story is lost to the dark."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer count */}
      <div style={{ textAlign:"center", marginTop:"2.5rem", paddingBottom:"2rem" }}>
        <span style={{ fontSize:"0.5rem", color:"rgba(200,168,75,0.18)", letterSpacing:"3px", fontFamily:"'Montserrat',sans-serif", textTransform:"uppercase" }}>
          — {visible.length} of {calendar.length} daily scenarios shown —
        </span>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Stat({ n, label, accent }: { n: number; label: string; accent?: boolean }) {
  return (
    <div style={{ textAlign:"center" }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1.35rem", fontWeight:900, color: accent ? "rgba(228,215,160,0.9)" : "rgba(200,168,75,0.7)", lineHeight:1 }}>{n}</div>
      <div style={{ fontSize:"0.42rem", color:"rgba(200,168,75,0.3)", letterSpacing:"3px", textTransform:"uppercase", marginTop:"4px", fontFamily:"'Montserrat',sans-serif" }}>{label}</div>
    </div>
  );
}
function Divider() {
  return <div style={{ width:"1px", background:"rgba(255,255,255,0.05)", alignSelf:"stretch" }} />;
}
