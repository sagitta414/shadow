import HeroinePicker from "../components/HeroinePicker";
import VillainPicker from "../components/VillainPicker";
import { ALL_HEROINES } from "../lib/heroines";
import { useState, useRef, useEffect } from "react";
import StoryLengthPicker, { type StoryLength } from "../components/StoryLengthPicker";
import OutfitSelector, { outfitPromptLine } from "../components/OutfitSelector";
import UniversalOptions, { UNIVERSAL_DEFAULTS, universalPromptLines, type UniversalConfig } from "../components/UniversalOptions";
import { getAiProvider } from "../lib/aiProvider";
import { saveStoryToArchive, updateArchiveStory, exportStoryAsTXT, exportStoryAsPDF } from "../lib/archive";

const HEROINES = ALL_HEROINES.map(h => h.name);

interface Props { onBack: () => void; }



const SETTINGS = [
  "A vast underground fortress — multiple cells, one master","An orbiting space station — no rescue possible",
  "A conquered city — he rules openly and absolutely","A hidden island compound — escape is the ocean",
  "A towering villain's penthouse — the city watches below","A ancient dungeon beneath a ruined keep",
  "A sterile mega-laboratory — clinical, cold, systematic",
];
const GROUP_DYNAMICS = [
  "They are close allies who will die before betraying each other",
  "Rivals forced together — their distrust weakens their resistance",
  "One protects the others fiercely — she becomes his primary leverage",
  "He plays them against each other — compliance earns mercy for the group",
  "Strangers — building trust is their only hope and his greatest weapon",
  "One breaks first and is turned against the others",
  "They have a chain of command — he dismantles it systematically",
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const acc = "#FF6060";
const accRgb = "255,96,96";

export default function MassCaptureMode({ onBack }: Props) {
  const [step, setStep] = useState<1|2|3>(1);
  const [selectedHeroines, setSelectedHeroines] = useState<string[]>([]);
  const [customHeroine, setCustomHeroine] = useState("");
  const [villain, setVillain] = useState("");
  const [customVillain, setCustomVillain] = useState("");
  const [setting, setSetting] = useState("");
  const [groupDynamic, setGroupDynamic] = useState("");
  const [chapters, setChapters] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [continueDir, setContinueDir] = useState("");
  const [savedId, setSavedId] = useState<string|null>(null);
  const [error, setError] = useState("");
  const [outfitId, setOutfitId] = useState("");
  const [universalConfig, setUniversalConfig] = useState<UniversalConfig>(UNIVERSAL_DEFAULTS);
  const [groupDynamicType, setGroupDynamicType] = useState("");
  const [outfitDamage, setOutfitDamage] = useState(0);
  const [storyLength, setStoryLength] = useState<StoryLength>("standard");
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  function stopGeneration() {
    abortRef.current?.abort();
  }

  const fVillain = customVillain || villain;
  const allHeroines = [...selectedHeroines, ...(customHeroine.trim() ? [customHeroine.trim()] : [])];
  const canGen = allHeroines.length >= 3 && allHeroines.length <= 5 && fVillain && setting && groupDynamic;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  function toggleHeroine(h: string) {
    setSelectedHeroines(prev =>
      prev.includes(h) ? prev.filter(x => x !== h) : prev.length < 5 ? [...prev, h] : prev
    );
  }

  async function generate(isFirst: boolean) {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    if (isFirst) { setLoading(true); setChapters([]); setSavedId(null); }
    else setContinuing(true);
    setStreamingText(""); setError("");
    let final = "";
    try {
      const resp = await fetch(`${BASE}/api/story/mass-capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: getAiProvider(), outfitContext: outfitPromptLine(outfitId, outfitDamage), universalContext: universalPromptLines(universalConfig), modeContext: (() => { const _groupDynamicMap: Record<string,string> = {"isolated":"Isolated","forced_interact":"Forced to Interact","made_to_compete":"Made to Compete","ranked_hierarchy":"Ranked Hierarchy","collective_break":"Collectively Broken"}; return [groupDynamicType ? `Group Dynamic: ${_groupDynamicMap[groupDynamicType] ?? groupDynamicType}` : ""].filter(Boolean).join("\n"); })(), groupDynamicType, heroines: allHeroines, villain: fVillain, setting, groupDynamic, chapters: isFirst ? [] : chapters, storyLength, continueDir }),
        signal: ctrl.signal,
      });
      const reader = resp.body!.getReader();
      const dec = new TextDecoder();
      let buf = "";
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
        const id = saveStoryToArchive({ title: `${fVillain} — The Mass Capture`, universe: "Mass Capture", tool: "Mass Capture Mode", characters: [...allHeroines, fVillain], chapters: newChapters });
        setSavedId(id);
      } else if (savedId) {
        updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
      }
    } catch(e) {
      const isAbort = e instanceof Error && (e.name === "AbortError" || e.message.includes("aborted"));
      if (isAbort) {
        if (final.trim()) {
          const newChapters = isFirst ? [final] : [...chapters, final];
          setChapters(newChapters); setStreamingText("");
        }
      } else { setError(String(e)); }
    }
    finally { setLoading(false); setContinuing(false); abortRef.current = null; }
  }

  function buildExport() {
    return { id: savedId ?? "tmp", title: `${fVillain} — The Mass Capture`, createdAt: Date.now(), universe: "Mass Capture", tool: "Mass Capture Mode", characters: [...allHeroines, fVillain], chapters, tags: [], favourite: false, wordCount: chapters.join(" ").split(/\s+/).filter(Boolean).length };
  }

  const pill = (label: string, active: boolean, onClick: () => void, disabled = false) => (
    <button key={label} onClick={onClick} disabled={disabled} style={{ padding: "0.4rem 0.85rem", borderRadius: "20px", border: `1px solid ${active ? acc : `rgba(${accRgb},0.2)`}`, background: active ? `rgba(${accRgb},0.18)` : "transparent", color: active ? acc : disabled ? "rgba(200,195,225,0.2)" : "rgba(200,195,225,0.5)", fontSize: "0.72rem", cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.2s", fontFamily: "'Raleway', sans-serif" }}>
      {label}
    </button>
  );

  if (step === 3 && chapters.length > 0) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <button onClick={() => { setStep(1); setChapters([]); }} style={btnSt(acc, accRgb)}>← NEW SESSION</button>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: acc, letterSpacing: "3px", margin: 0, flex: 1 }}>MASS CAPTURE</h1>
          <button onClick={() => exportStoryAsTXT(buildExport())} style={expBt(accRgb)}>TXT</button>
          <button onClick={() => exportStoryAsPDF(buildExport())} style={expBt(accRgb)}>PDF</button>
        </div>

        <div style={{ background: `rgba(${accRgb},0.04)`, border: `1px solid rgba(${accRgb},0.15)`, borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.5rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.5rem" }}>CAPTURED ({allHeroines.length})</div>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
            {allHeroines.map(h => <span key={h} style={{ padding: "0.2rem 0.6rem", background: `rgba(${accRgb},0.12)`, border: `1px solid rgba(${accRgb},0.3)`, borderRadius: "12px", fontSize: "0.7rem", color: acc, fontFamily: "'Cinzel', serif" }}>{h}</span>)}
          </div>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            {[[fVillain,"Villain"],[setting,"Setting"]].map(([v,l]) => (
              <div key={l}><div style={{ fontSize: "0.5rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif" }}>{l}</div><div style={{ fontSize: "0.75rem", color: "#EEE", fontFamily: "'Raleway', sans-serif" }}>{v}</div></div>
            ))}
          </div>
        </div>

        {chapters.map((ch, i) => (
          <div key={i}>
            {chapters.length > 1 && <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0 1rem" }}><div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.15)` }} /><span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px" }}>— CHAPTER {i + 1} —</span><div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.15)` }} /></div>}
            {ch.split("\n").filter(Boolean).map((p, j) => <p key={j} style={proseSt}>{p}</p>)}
          </div>
        ))}
        {streamingText && streamingText.split("\n").filter(Boolean).map((p, j) => <p key={j} style={{ ...proseSt, opacity: 0.75 }}>{p}</p>)}
        {(loading || continuing) && (
          <div style={{ textAlign: "center", margin: "1.5rem 0" }}>
            <button onClick={stopGeneration} style={{ padding: "0.45rem 1.4rem", background: "rgba(200,40,40,0.15)", border: `1px solid rgba(200,40,40,0.5)`, borderRadius: "10px", color: "#FF5555", fontFamily: "'Cinzel', serif", fontSize: "0.72rem", letterSpacing: "2px", cursor: "pointer" }}>■ Stop</button>
          </div>
        )}
        <div ref={bottomRef} />

        {!loading && !continuing && (
          <div style={{ marginTop: "2rem", background: "rgba(0,0,0,0.4)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "12px", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.6)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.5rem" }}>CHAPTER {chapters.length + 1} — NEXT WAVE</div>
            <textarea value={continueDir} onChange={e => setContinueDir(e.target.value)} placeholder="Steer the next chapter… (optional)" rows={2} style={textSt(accRgb)} />
            <button onClick={() => generate(false)} style={{ width: "100%", padding: "0.85rem", background: `rgba(${accRgb},0.12)`, border: `1px solid rgba(${accRgb},0.4)`, color: acc, borderRadius: "8px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" }}>
              {continuing ? "WRITING..." : `CHAPTER ${chapters.length + 1} →`}
            </button>
          </div>
        )}
                {error && <div style={{ color: "#FF6060", fontSize: "0.75rem", marginTop: "1rem" }}>Error: {error}</div>}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "680px", margin: "0 auto" }}>
        <button onClick={() => setStep(1)} style={btnSt(acc, accRgb)}>← BACK</button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", color: acc, letterSpacing: "3px", margin: "2rem 0" }}>CONFIGURE THE MASS CAPTURE</h1>

        <Sec title="DOMINANT VILLAIN" acc={acc} rgb={accRgb}>
          <VillainPicker value={villain || customVillain} onChange={name => { setVillain(name); setCustomVillain(""); }} accentColor={acc} accentRgb={accRgb} />
        </Sec>
        <Sec title="SETTING" acc={acc} rgb={accRgb}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>{SETTINGS.map(s => pill(s, setting === s, () => setSetting(s)))}</div>
        </Sec>
        <Sec title="GROUP DYNAMIC" acc={acc} rgb={accRgb}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>{GROUP_DYNAMICS.map(d => pill(d, groupDynamic === d, () => setGroupDynamic(d)))}</div>
        </Sec>

        {error && <div style={{ color: "#FF6060", fontSize: "0.75rem", marginBottom: "1rem" }}>{error}</div>}
        {/* ── Outfit, Scene & Narrative Controls ── */}
        <OutfitSelector outfitId={outfitId} damage={outfitDamage} onOutfitChange={setOutfitId} onDamageChange={setOutfitDamage} accentColor="#F87171" accentRgb="248,113,113" />
        <div style={{marginTop:"1.25rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"0.875rem"}}>
            <div style={{width:"3px",height:"18px",borderRadius:"2px",background:"linear-gradient(180deg, #F87171, transparent)"}} />
            <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.72rem",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"#F87171"}}>Scene Parameters</span>
            <div style={{flex:1,height:"1px",background:"linear-gradient(90deg, rgba(248,113,113,0.25), transparent)"}} />
            <span style={{fontSize:"0.62rem",color:"rgba(200,195,240,0.3)",fontStyle:"italic"}}>optional</span>
          </div>
          <div style={{background:"rgba(15,10,30,0.5)",border:"1px solid rgba(248,113,113,0.18)",borderRadius:"12px",padding:"1rem",backdropFilter:"blur(8px)"}}>

          <div style={{marginBottom:"0.875rem"}}>
            <div style={{fontSize:"0.57rem",fontFamily:"'Montserrat',sans-serif",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(200,195,240,0.35)",marginBottom:"0.5rem"}}>GROUP DYNAMIC</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
              {[{"id":"isolated","icon":"🚫","label":"Isolated from Each Other"},{"id":"forced_interact","icon":"👥","label":"Forced to Interact"},{"id":"made_to_compete","icon":"⚔️","label":"Made to Compete"},{"id":"ranked_hierarchy","icon":"📊","label":"Ranked Hierarchy"},{"id":"collective_break","icon":"💔","label":"Collectively Broken Together"}].map((opt:{id:string;icon:string;label:string}) => (<button key={opt.id} onClick={() => setGroupDynamicType(groupDynamicType === opt.id ? "" : opt.id)} style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.4rem 0.8rem",borderRadius:"20px",border:`1px solid ${groupDynamicType === opt.id ? "#F87171" : "rgba(200,195,240,0.15)"}`,background:groupDynamicType === opt.id ? "rgba(248,113,113,0.16)" : "rgba(255,255,255,0.03)",color:groupDynamicType === opt.id ? "#F87171" : "rgba(200,195,240,0.55)",fontSize:"0.7rem",fontFamily:"'Montserrat',sans-serif",fontWeight:groupDynamicType === opt.id ? 700:400,cursor:"pointer",transition:"all 0.18s",minHeight:"36px"}}><span>{opt.icon}</span><span>{opt.label}</span></button>))}
            </div>
          </div>
          </div>
        </div>
        <UniversalOptions config={universalConfig} onChange={setUniversalConfig} accentColor="#F87171" accentRgb="248,113,113" />
        <StoryLengthPicker value={storyLength} onChange={setStoryLength} accentColor="#F87171" accentRgb="248,113,113" />

        <button onClick={() => { if (canGen) { setStep(3); generate(true); } }} disabled={!canGen} style={{ width: "100%", padding: "1rem", background: canGen ? `rgba(${accRgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${canGen ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: canGen ? acc : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: canGen ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" }}>
          {loading ? "GENERATING..." : "SPRING THE TRAP"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "960px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "3rem" }}>
        <button onClick={onBack} style={btnSt(acc, accRgb)}>← HOME</button>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.3rem,3vw,1.8rem)", color: acc, letterSpacing: "4px", margin: 0 }}>MASS CAPTURE MODE</h1>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginTop: "0.25rem" }}>3–5 HEROINES · ONE VILLAIN · GROUP DYNAMICS</div>
        </div>
      </div>

      <Sec title="SELECT 3–5 HEROINES" acc={acc} rgb={accRgb}>
        <div style={{ marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.65rem", color: selectedHeroines.length >= 3 ? acc : `rgba(${accRgb},0.4)`, fontFamily: "'Cinzel', serif" }}>
            {selectedHeroines.length === 0 ? "Select at least 3" : `${selectedHeroines.length}/5 selected${selectedHeroines.length >= 3 ? " ✓" : ""}`}
          </span>
        </div>
        {selectedHeroines.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>
            {selectedHeroines.map(h => (
              <button key={h} onClick={() => toggleHeroine(h)} style={{ padding: "0.25rem 0.6rem", background: `rgba(${accRgb},0.18)`, border: `1px solid rgba(${accRgb},0.5)`, borderRadius: "20px", color: acc, fontSize: "0.72rem", cursor: "pointer", fontFamily: "'Raleway', sans-serif", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                {h} <span style={{ fontSize: "0.6rem", opacity: 0.6 }}>✕</span>
              </button>
            ))}
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>
          {HEROINES.map(h => pill(h, selectedHeroines.includes(h), () => toggleHeroine(h), !selectedHeroines.includes(h) && selectedHeroines.length >= 5))}
        </div>
        <input value={customHeroine} onChange={e => setCustomHeroine(e.target.value)} placeholder="Or add a custom heroine name (counts toward the 5 max)…" style={inSt(accRgb)} />
      </Sec>

      <button onClick={() => { if (allHeroines.length >= 3) setStep(2); }} disabled={allHeroines.length < 3} style={{ marginTop: "2rem", width: "100%", padding: "1rem", background: allHeroines.length >= 3 ? `rgba(${accRgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${allHeroines.length >= 3 ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: allHeroines.length >= 3 ? acc : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: allHeroines.length >= 3 ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" }}>
        CONFIGURE THE TRAP → {allHeroines.length >= 3 ? `(${allHeroines.length} heroines selected)` : `(need ${3 - allHeroines.length} more)`}
      </button>
    </div>
  );
}

function Sec({ title, children, acc, rgb }: { title: string; children: React.ReactNode; acc: string; rgb: string }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ fontSize: "0.55rem", color: `rgba(${rgb},0.6)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginBottom: "0.75rem", borderBottom: `1px solid rgba(${rgb},0.12)`, paddingBottom: "0.5rem" }}>{title}</div>
      {children}
    </div>
  );
}

const proseSt: React.CSSProperties = { fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1.02rem", lineHeight: 1.9, color: "rgba(230,225,255,0.85)", marginBottom: "1rem" };
const btnSt = (acc: string, rgb: string): React.CSSProperties => ({ background: "transparent", border: `1px solid rgba(${rgb},0.3)`, color: acc, borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px" });
const expBt = (rgb: string): React.CSSProperties => ({ background: "transparent", border: `1px solid rgba(${rgb},0.3)`, color: "rgba(200,195,225,0.6)", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px" });
const inSt = (rgb: string): React.CSSProperties => ({ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${rgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.6rem 0.85rem", outline: "none", boxSizing: "border-box" });
const textSt = (rgb: string): React.CSSProperties => ({ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${rgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.82rem", padding: "0.75rem", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" });
