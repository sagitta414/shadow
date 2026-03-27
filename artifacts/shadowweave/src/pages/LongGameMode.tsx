import { useState, useRef, useEffect } from "react";
import StoryLengthPicker, { type StoryLength } from "../components/StoryLengthPicker";
import OutfitSelector, { outfitPromptLine } from "../components/OutfitSelector";
import UniversalOptions, { UNIVERSAL_DEFAULTS, universalPromptLines, type UniversalConfig } from "../components/UniversalOptions";
import { getAiProvider } from "../lib/aiProvider";
import { saveStoryToArchive, updateArchiveStory, exportStoryAsTXT, exportStoryAsPDF } from "../lib/archive";

interface Props { onBack: () => void; }

const HEROINES = [
  "Wonder Woman","Black Widow","Supergirl","Scarlet Witch","Captain Marvel","Storm",
  "Black Canary","Zatanna","Batgirl","Jean Grey","Rogue","Psylocke","Emma Frost",
  "Starlight","Kimiko","Starfire","Raven","Huntress","She-Hulk","Invisible Woman",
  "Jessica Jones","Leia Organa","Ahsoka Tano","Black Cat","Spider-Woman","Valkyrie","Power Girl",
];
const VILLAINS = [
  "Lex Luthor","Baron Zemo","Ra's al Ghul","Sinister","Doctor Doom","Magneto",
  "Maxwell Lord","Mephisto","Norman Osborn","The Collector","Purple Man","Kingpin",
  "Thanos","Loki","Deathstroke","Red Skull","Apocalypse",
];
const ENDGAMES = [
  "Complete psychological dependency — she cannot function without him",
  "Voluntary defection — she switches sides and means it",
  "She forgets who she was before",
  "She stops wanting to escape — and isn't sure when that changed",
  "She becomes his weapon — against her own former allies",
  "She falls in love. Genuinely.",
];
const COVER_STORIES = [
  "She is presumed dead — no one is looking",
  "She's on an extended undercover mission",
  "Her teammates believe she betrayed them",
  "She vanished without a trace — the case went cold",
  "A decoy is living her life — the world thinks she's fine",
  "She's on compassionate leave — a convenient story",
];
const SETTINGS = [
  "His private residence — given every comfort, a gilded cage",
  "A remote property — rural, no contact with the outside world",
  "A purpose-built environment — everything designed to shape her",
  "An urban location — she can see the city she can't reach",
  "A facility that looks almost like a home",
];

const TIMESTAMPS = [
  "Day 4", "Two Weeks Later", "One Month Later",
  "Two Months Later", "Four Months Later", "Six Months Later", "One Year Later",
];
const EROSION = [
  { pct: 5,  note: "No change. Defiant." },
  { pct: 14, note: "First uncertainty. Small doubts." },
  { pct: 28, note: "Questioning herself." },
  { pct: 44, note: "Comfort-seeking. She accepts small gestures." },
  { pct: 60, note: "Dependency forming. She notices his absence." },
  { pct: 76, note: "She stops fighting. She isn't sure when." },
  { pct: 90, note: "She can't remember wanting to leave." },
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const acc = "#34D399";
const accRgb = "52,211,153";

export default function LongGameMode({ onBack }: Props) {
  const [step, setStep] = useState<1|2|3>(1);
  const [heroine, setHeroine] = useState("");
  const [customHeroine, setCustomHeroine] = useState("");
  const [villain, setVillain] = useState("");
  const [customVillain, setCustomVillain] = useState("");
  const [endgame, setEndgame] = useState("");
  const [coverStory, setCoverStory] = useState("");
  const [setting, setSetting] = useState("");
  const [chapters, setChapters] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [continueDir, setContinueDir] = useState("");
  const [savedId, setSavedId] = useState<string|null>(null);
  const [error, setError] = useState("");
  const [outfitId, setOutfitId] = useState("");
  const [universalConfig, setUniversalConfig] = useState<UniversalConfig>(UNIVERSAL_DEFAULTS);
  const [timelineScale, setTimelineScale] = useState("");
  const [coverStoryType, setCoverStoryType] = useState("");
  const [outfitDamage, setOutfitDamage] = useState(0);
  const [storyLength, setStoryLength] = useState<StoryLength>("standard");
  const bottomRef = useRef<HTMLDivElement>(null);

  const fH = customHeroine.trim() || heroine;
  const fV = customVillain.trim() || villain;
  const canStep2 = !!fH;
  const canGen = fH && fV && endgame && coverStory && setting;
  const erosionData = EROSION[Math.min(chapters.length, EROSION.length - 1)];
  const timestamp = TIMESTAMPS[Math.min(chapters.length, TIMESTAMPS.length - 1)];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  async function generate(isFirst: boolean) {
    if (isFirst) { setLoading(true); setChapters([]); setSavedId(null); }
    else setContinuing(true);
    setStreamingText(""); setError("");
    try {
      const resp = await fetch(`${BASE}/api/story/long-game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: getAiProvider(), outfitContext: outfitPromptLine(outfitId, outfitDamage), universalContext: universalPromptLines(universalConfig), modeContext: (() => { const _timelineScaleMap: Record<string,string> = {"days":"Days","weeks":"Weeks","months":"Months"};
      const _coverStoryTypeMap: Record<string,string> = {"missing_hero":"Missing / Gone Dark","retired":"Retired from Heroics","undercover_op":"On Classified Operation","personal_leave":"Personal Leave","no_cover":"No Cover — Publicly Vanished"}; return [timelineScale ? `Timeline Scale: ${_timelineScaleMap[timelineScale] ?? timelineScale}` : "", coverStoryType ? `Public Cover Story: ${_coverStoryTypeMap[coverStoryType] ?? coverStoryType}` : ""].filter(Boolean).join("\n"); })(), timelineScale, coverStoryType, heroine: fH, villain: fV, endgame, coverStory, setting, chapters: isFirst ? [] : chapters, chapterNumber: isFirst ? 1 : chapters.length + 1, timestamp: isFirst ? TIMESTAMPS[0] : timestamp, storyLength, continueDir }),
      });
      const reader = resp.body!.getReader();
      const dec = new TextDecoder();
      let buf = ""; let final = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop()!;
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const d = JSON.parse(line.slice(5).trim());
          if (d.chunk) { final += d.chunk; setStreamingText(p => p + d.chunk); }
          if (d.done) final = d.text;
          if (d.error) setError(d.error);
        }
      }
      const newChapters = isFirst ? [final] : [...chapters, final];
      setChapters(newChapters); setStreamingText(""); setContinueDir("");
      if (isFirst) {
        const id = saveStoryToArchive({ title: `${fH} — The Long Game`, universe: "The Long Game", tool: "The Long Game", characters: [fH, fV], chapters: newChapters });
        setSavedId(id);
      } else if (savedId) {
        updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
      }
    } catch(e) { setError(String(e)); }
    finally { setLoading(false); setContinuing(false); }
  }

  function buildExport() {
    return { id: savedId ?? "tmp", title: `${fH} — The Long Game`, createdAt: Date.now(), universe: "The Long Game", tool: "The Long Game", characters: [fH, fV], chapters, tags: [], favourite: false, wordCount: chapters.join(" ").split(/\s+/).filter(Boolean).length };
  }

  const pill = (label: string, active: boolean, onClick: () => void) => (
    <button key={label} onClick={onClick} style={{ padding: "0.4rem 0.85rem", borderRadius: "20px", border: `1px solid ${active ? acc : `rgba(${accRgb},0.2)`}`, background: active ? `rgba(${accRgb},0.18)` : "transparent", color: active ? acc : "rgba(200,195,225,0.5)", fontSize: "0.72rem", cursor: "pointer", transition: "all 0.2s", fontFamily: "'Raleway', sans-serif" }}>
      {label}
    </button>
  );

  if (step === 3) {
    if (loading && chapters.length === 0) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
          <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", color: acc, letterSpacing: "4px", animation: "pulse 2s ease-in-out infinite" }}>Time begins to pass…</div>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.4)`, fontFamily: "'Raleway', sans-serif", letterSpacing: "2px" }}>Day 1</div>
        </div>
      );
    }

    const prevErosion = EROSION[Math.max(0, chapters.length - 1)];

    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "920px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <button onClick={() => { setStep(1); setChapters([]); }} style={bB2}>← NEW</button>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: acc, letterSpacing: "3px", margin: 0, flex: 1 }}>THE LONG GAME</h1>
          <button onClick={() => exportStoryAsTXT(buildExport())} style={eB2}>TXT</button>
          <button onClick={() => exportStoryAsPDF(buildExport())} style={eB2}>PDF</button>
        </div>

        {/* Erosion meter */}
        <div style={{ background: `rgba(${accRgb},0.06)`, border: `1px solid rgba(${accRgb},0.18)`, borderRadius: "12px", padding: "1.25rem 1.5rem", marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.5rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginBottom: "0.875rem" }}>PSYCHOLOGICAL EROSION — {fH.toUpperCase()}</div>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: "180px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span style={{ fontSize: "0.5rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif" }}>EROSION</span>
                <span style={{ fontSize: "0.7rem", color: acc, fontFamily: "'Raleway', sans-serif", fontWeight: 700 }}>{prevErosion.pct}%</span>
              </div>
              <div style={{ height: "5px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${prevErosion.pct}%`, background: acc, borderRadius: "3px", transition: "width 0.8s ease" }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.48rem", color: `rgba(${accRgb},0.45)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.2rem" }}>STATUS</div>
              <div style={{ fontSize: "0.75rem", color: acc, fontFamily: "'Raleway', sans-serif" }}>{prevErosion.note}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.48rem", color: `rgba(${accRgb},0.45)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.2rem" }}>VILLAIN</div>
              <div style={{ fontSize: "0.75rem", color: "#DDD", fontFamily: "'Raleway', sans-serif" }}>{fV}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.48rem", color: `rgba(${accRgb},0.45)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.2rem" }}>ENDGAME</div>
              <div style={{ fontSize: "0.7rem", color: "#DDD", fontFamily: "'Raleway', sans-serif", maxWidth: "200px" }}>{endgame}</div>
            </div>
          </div>
        </div>

        {chapters.map((ch, i) => (
          <div key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0 1.25rem" }}>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", color: `rgba(${accRgb},0.55)`, letterSpacing: "3px" }}>{(TIMESTAMPS[i] ?? `CHAPTER ${i+1}`).toUpperCase()}</span>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
            </div>
            <p style={ps2}>{ch}</p>
          </div>
        ))}
        {streamingText && <p style={{ ...ps2, opacity: 0.85 }}>{streamingText}</p>}
        <div ref={bottomRef} />

        {!loading && !continuing && chapters.length < 7 && (
          <div style={{ marginTop: "2rem", background: "rgba(0,0,0,0.4)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "12px", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.6)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.5rem" }}>
              {(TIMESTAMPS[chapters.length] ?? "LATER").toUpperCase()}
            </div>
            <textarea value={continueDir} onChange={e => setContinueDir(e.target.value)} placeholder="What has changed since last time? (optional — e.g. 'she accepts a small kindness', 'she stops asking about escape')" rows={2} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.82rem", padding: "0.75rem", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" }} />
            <button onClick={() => generate(false)} disabled={continuing} style={{ width: "100%", padding: "0.85rem", background: `rgba(${accRgb},0.14)`, border: `1px solid rgba(${accRgb},0.45)`, color: acc, borderRadius: "8px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" }}>
              {continuing ? "TIME PASSING…" : `⏳ ${(TIMESTAMPS[chapters.length] ?? "CONTINUE").toUpperCase()}`}
            </button>
          </div>
        )}
        {chapters.length >= 7 && <div style={{ marginTop: "2rem", textAlign: "center", fontFamily: "'Cinzel', serif", color: `rgba(${accRgb},0.5)`, fontSize: "0.7rem", letterSpacing: "3px" }}>— TIME HAS DONE ITS WORK. —</div>}
        {continuing && <div style={{ textAlign: "center", padding: "1.5rem", color: `rgba(${accRgb},0.5)`, fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" }}>Time passes…</div>}
                {error && <div style={{ color: "#FF6060", fontSize: "0.75rem", marginTop: "1rem" }}>Error: {error}</div>}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "720px", margin: "0 auto" }}>
        <button onClick={() => setStep(1)} style={bB2}>← BACK</button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", color: acc, letterSpacing: "3px", margin: "0 0 2rem" }}>CONFIGURE THE LONG GAME</h1>
        <Sec2 title="THE PATIENT VILLAIN" rgb={accRgb}>
          <div style={prr}>{VILLAINS.map(v => pill(v, villain === v, () => { setVillain(v); setCustomVillain(""); }))}</div>
          <input value={customVillain} onChange={e => { setCustomVillain(e.target.value); setVillain(""); }} placeholder="Or type any villain…" style={iS(accRgb)} />
        </Sec2>
        <Sec2 title="ENDGAME — WHAT HE IS WORKING TOWARD" rgb={accRgb}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {ENDGAMES.map(e => (
              <button key={e} onClick={() => setEndgame(e)} style={{ background: endgame === e ? `rgba(${accRgb},0.16)` : "rgba(0,0,0,0.4)", border: `1px solid ${endgame === e ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.06)"}`, borderRadius: "10px", padding: "0.75rem", cursor: "pointer", textAlign: "left", color: endgame === e ? acc : "#CCC", fontFamily: "'Raleway', sans-serif", fontSize: "0.72rem" }}>{e}</button>
            ))}
          </div>
        </Sec2>
        <Sec2 title="THE COVER STORY — WHY NO ONE IS LOOKING" rgb={accRgb}>
          <div style={prr}>{COVER_STORIES.map(c => pill(c, coverStory === c, () => setCoverStory(c)))}</div>
        </Sec2>
        <Sec2 title="SETTING" rgb={accRgb}>
          <div style={prr}>{SETTINGS.map(s => pill(s, setting === s, () => setSetting(s)))}</div>
        </Sec2>
        {error && <div style={{ color: "#FF6060", fontSize: "0.75rem", marginBottom: "1rem" }}>{error}</div>}
        {/* ── Outfit, Scene & Narrative Controls ── */}
        <OutfitSelector outfitId={outfitId} damage={outfitDamage} onOutfitChange={setOutfitId} onDamageChange={setOutfitDamage} accentColor="#C084FC" accentRgb="192,132,252" />
        <div style={{marginTop:"1.25rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"0.875rem"}}>
            <div style={{width:"3px",height:"18px",borderRadius:"2px",background:"linear-gradient(180deg, #C084FC, transparent)"}} />
            <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.72rem",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"#C084FC"}}>Scene Parameters</span>
            <div style={{flex:1,height:"1px",background:"linear-gradient(90deg, rgba(192,132,252,0.25), transparent)"}} />
            <span style={{fontSize:"0.62rem",color:"rgba(200,195,240,0.3)",fontStyle:"italic"}}>optional</span>
          </div>
          <div style={{background:"rgba(15,10,30,0.5)",border:"1px solid rgba(192,132,252,0.18)",borderRadius:"12px",padding:"1rem",backdropFilter:"blur(8px)"}}>

          <div style={{marginBottom:"0.875rem"}}>
            <div style={{fontSize:"0.57rem",fontFamily:"'Montserrat',sans-serif",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(200,195,240,0.35)",marginBottom:"0.5rem"}}>TIMELINE SCALE</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
              {[{"id":"days","icon":"📅","label":"Days"},{"id":"weeks","icon":"🗓️","label":"Weeks"},{"id":"months","icon":"📆","label":"Months"}].map((opt:{id:string;icon:string;label:string}) => (<button key={opt.id} onClick={() => setTimelineScale(timelineScale === opt.id ? "" : opt.id)} style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.4rem 0.8rem",borderRadius:"20px",border:`1px solid ${timelineScale === opt.id ? "#C084FC" : "rgba(200,195,240,0.15)"}`,background:timelineScale === opt.id ? "rgba(192,132,252,0.16)" : "rgba(255,255,255,0.03)",color:timelineScale === opt.id ? "#C084FC" : "rgba(200,195,240,0.55)",fontSize:"0.7rem",fontFamily:"'Montserrat',sans-serif",fontWeight:timelineScale === opt.id ? 700:400,cursor:"pointer",transition:"all 0.18s",minHeight:"36px"}}><span>{opt.icon}</span><span>{opt.label}</span></button>))}
            </div>
          </div>
          <div style={{marginBottom:"0.875rem"}}>
            <div style={{fontSize:"0.57rem",fontFamily:"'Montserrat',sans-serif",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(200,195,240,0.35)",marginBottom:"0.5rem"}}>PUBLIC COVER STORY</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
              {[{"id":"missing_hero","icon":"❓","label":"Missing / Gone Dark"},{"id":"retired","icon":"🏠","label":"Retired from Heroics"},{"id":"undercover_op","icon":"🎭","label":"On Classified Operation"},{"id":"personal_leave","icon":"✈️","label":"Personal Leave"},{"id":"no_cover","icon":"🌑","label":"No Cover — Publicly Vanished"}].map((opt:{id:string;icon:string;label:string}) => (<button key={opt.id} onClick={() => setCoverStoryType(coverStoryType === opt.id ? "" : opt.id)} style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.4rem 0.8rem",borderRadius:"20px",border:`1px solid ${coverStoryType === opt.id ? "#C084FC" : "rgba(200,195,240,0.15)"}`,background:coverStoryType === opt.id ? "rgba(192,132,252,0.16)" : "rgba(255,255,255,0.03)",color:coverStoryType === opt.id ? "#C084FC" : "rgba(200,195,240,0.55)",fontSize:"0.7rem",fontFamily:"'Montserrat',sans-serif",fontWeight:coverStoryType === opt.id ? 700:400,cursor:"pointer",transition:"all 0.18s",minHeight:"36px"}}><span>{opt.icon}</span><span>{opt.label}</span></button>))}
            </div>
          </div>
          </div>
        </div>
        <UniversalOptions config={universalConfig} onChange={setUniversalConfig} accentColor="#C084FC" accentRgb="192,132,252" />
        <StoryLengthPicker value={storyLength} onChange={setStoryLength} accentColor="#C084FC" accentRgb="192,132,252" />

        <button onClick={() => { if (canGen) { setStep(3); generate(true); } }} disabled={!canGen} style={pB2(canGen, accRgb, acc)}>
          ⏳ BEGIN THE LONG GAME
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
        <button onClick={onBack} style={bB2}>← HOME</button>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.2rem,3vw,1.8rem)", color: acc, letterSpacing: "4px", margin: 0 }}>THE LONG GAME</h1>
          <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginTop: "0.2rem" }}>PATIENCE. TIME SKIPS. GRADUAL EROSION.</div>
        </div>
      </div>
      <Sec2 title="SELECT SUBJECT" rgb={accRgb}>
        <div style={prr}>{HEROINES.map(h => pill(h, heroine === h, () => { setHeroine(h); setCustomHeroine(""); }))}</div>
        <input value={customHeroine} onChange={e => { setCustomHeroine(e.target.value); setHeroine(""); }} placeholder="Or type a custom name…" style={iS(accRgb)} />
      </Sec2>
      <button onClick={() => { if (canStep2) setStep(2); }} disabled={!canStep2} style={pB2(canStep2, accRgb, acc)}>CONFIGURE →</button>
    </div>
  );
}

function Sec2({ title, children, rgb }: { title: string; children: React.ReactNode; rgb: string }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ borderBottom: `1px solid rgba(${rgb},0.12)`, paddingBottom: "0.4rem", marginBottom: "0.875rem" }}>
        <div style={{ fontSize: "0.55rem", color: `rgba(${rgb},0.6)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif" }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

const ps2: React.CSSProperties = { fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1rem", color: "rgba(230,225,255,0.85)", lineHeight: 1.9 };
const prr: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" };
const iS = (rgb: string): React.CSSProperties => ({ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${rgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.6rem 0.85rem", outline: "none", boxSizing: "border-box", marginTop: "0.5rem" });
const bB2: React.CSSProperties = { background: "transparent", border: "1px solid rgba(52,211,153,0.3)", color: "#34D399", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", marginBottom: "2rem" };
const eB2: React.CSSProperties = { background: "transparent", border: "1px solid rgba(52,211,153,0.3)", color: "rgba(200,195,225,0.6)", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif" };
const pB2 = (active: boolean, rgb: string, ac: string): React.CSSProperties => ({ width: "100%", padding: "1rem", background: active ? `rgba(${rgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${active ? `rgba(${rgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: active ? ac : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: active ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" });
