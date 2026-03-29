import { useState, useRef, useEffect, useMemo } from "react";
import StoryLengthPicker, { type StoryLength } from "../components/StoryLengthPicker";
import OutfitSelector, { outfitPromptLine } from "../components/OutfitSelector";
import UniversalOptions, { UNIVERSAL_DEFAULTS, universalPromptLines, type UniversalConfig } from "../components/UniversalOptions";
import HeroinePicker from "../components/HeroinePicker";
import VillainPicker from "../components/VillainPicker";
import PsycheMeter, { type PsycheEvent } from "../components/PsycheMeter";
import ReadingProgressBar from "../components/ReadingProgressBar";
import { getAiProvider } from "../lib/aiProvider";
import { saveStoryToArchive, exportStoryAsTXT, exportStoryAsPDF } from "../lib/archive";

interface Props { onBack: () => void; }

const PHASE_PSYCHE: { sanityDelta: number; resistanceDelta: number; event: string }[] = [
  { sanityDelta: -5,  resistanceDelta: -8,  event: "Isolated and restrained — the weight of helplessness settles in" },
  { sanityDelta: -12, resistanceDelta: -10, event: "Psychological pressure intensifies — her will fractures" },
  { sanityDelta: -18, resistanceDelta: -15, event: "Physical submission — her body betrays her convictions" },
  { sanityDelta: -22, resistanceDelta: -20, event: "Her will wavers — the breaking point draws near" },
  { sanityDelta: -28, resistanceDelta: -22, event: "Complete surrender — the last barrier falls" },
];
const SETTINGS = [
  "A sensory-deprivation chamber deep underground",
  "A mirrored interrogation room — she sees herself at all times",
  "A gilded cage in the villain's penthouse",
  "A remote military facility — no outside contact",
  "An ancient dungeon beneath a crumbling castle",
  "A sleek high-tech laboratory with restraint harnesses",
  "A warm, deceptively comfortable room — the comfort is the weapon",
];
const BREAKING_POINTS = [
  "Fear of total helplessness","Shame and public humiliation","Her loved ones being threatened",
  "Physical pain she cannot endure indefinitely","Slow erosion of her sense of identity",
  "Being made to enjoy what she resists","Isolation and sensory deprivation",
  "A secret she's desperate to protect","Her own body betraying her",
];
const PHASE_LABELS = ["","Isolation & Intimidation","Psychological Pressure","Physical Submission","Will Broken","Complete Surrender"];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function MindBreakMode({ onBack }: Props) {
  const [step, setStep] = useState<1|2|3>(1);
  const [heroine, setHeroine] = useState("");
  const [customHeroine, setCustomHeroine] = useState("");
  const [villain, setVillain] = useState("");
  const [customVillain, setCustomVillain] = useState("");
  const [setting, setSetting] = useState("");
  const [customSetting, setCustomSetting] = useState("");
  const [breakingPoint, setBreakingPoint] = useState("");
  const [customBreakingPoint, setCustomBreakingPoint] = useState("");
  const [chapters, setChapters] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [continueDir, setContinueDir] = useState("");
  const [savedId, setSavedId] = useState<string|null>(null);
  const [error, setError] = useState("");
  const [outfitId, setOutfitId] = useState("");
  const [universalConfig, setUniversalConfig] = useState<UniversalConfig>(UNIVERSAL_DEFAULTS);
  const [methodFocus, setMethodFocus] = useState("");
  const [outfitDamage, setOutfitDamage] = useState(0);
  const [storyLength, setStoryLength] = useState<StoryLength>("standard");
  const bottomRef = useRef<HTMLDivElement>(null);
  const phase = Math.min(chapters.length + 1, 5);

  const finalHeroine = customHeroine || heroine;
  const finalVillain = customVillain || villain;
  const finalSetting = customSetting || setting;
  const finalBreaking = customBreakingPoint || breakingPoint;

  const psycheLog: PsycheEvent[] = useMemo(() =>
    chapters.map((_, i) => ({ ...PHASE_PSYCHE[i] ?? PHASE_PSYCHE[PHASE_PSYCHE.length - 1] })),
    [chapters]
  );
  const psycheSanity     = Math.max(0, 100 + psycheLog.reduce((s, e) => s + e.sanityDelta, 0));
  const psycheResistance = Math.max(0, 100 + psycheLog.reduce((s, e) => s + (e.resistanceDelta ?? 0), 0));

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  const canGenerate = finalHeroine && finalVillain && finalSetting && finalBreaking;

  async function generate(isFirst: boolean) {
    if (isFirst) { setLoading(true); setChapters([]); setSavedId(null); }
    else setContinuing(true);
    setStreamingText("");
    setError("");
    try {
      const resp = await fetch(`${BASE}/api/story/mind-break`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: getAiProvider(), outfitContext: outfitPromptLine(outfitId, outfitDamage), universalContext: universalPromptLines(universalConfig), modeContext: (() => { const _methodFocusMap: Record<string,string> = {"physical_exhaustion":"Physical Exhaustion","psychological":"Psychological Manipulation","sensory_overload":"Sensory Overload","chemical_assistance":"Chemical Assistance","combined":"Combined / All Methods"}; return [methodFocus ? `Primary Breaking Method: ${_methodFocusMap[methodFocus] ?? methodFocus}` : ""].filter(Boolean).join("\n"); })(), methodFocus, heroine: finalHeroine, villain: finalVillain, setting: finalSetting,
          breakingPoint: finalBreaking, currentPhase: isFirst ? 1 : phase, storyLength, chapters: isFirst ? [] : chapters, continueDir, }),
      });
      const reader = resp.body!.getReader();
      const dec = new TextDecoder();
      let buf = ""; let final = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop()!;
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const d = JSON.parse(line.slice(5).trim());
          if (d.chunk) { final += d.chunk; setStreamingText((p) => p + d.chunk); }
          if (d.done) final = d.text;
          if (d.error) setError(d.error);
        }
      }
      const newChapters = isFirst ? [final] : [...chapters, final];
      setChapters(newChapters);
      setStreamingText("");
      setContinueDir("");
      if (isFirst) {
        const id = saveStoryToArchive({ title: `${finalVillain} Breaks ${finalHeroine}`, universe: "Mind Break", tool: "Mind Break Chamber", characters: [finalHeroine, finalVillain], storyLength, chapters: newChapters });
        setSavedId(id);
      } else if (savedId) {
        const { updateArchiveStory } = await import("../lib/archive");
        updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
      }
    } catch (e) { setError(String(e)); }
    finally { setLoading(false); setContinuing(false); }
  }

  function buildExportStory() {
    return { id: savedId ?? "tmp", title: `${finalVillain} Breaks ${finalHeroine}`, createdAt: Date.now(), universe: "Mind Break", tool: "Mind Break Chamber", characters: [finalHeroine, finalVillain], chapters, tags: [], favourite: false, wordCount: chapters.join(" ").split(/\s+/).filter(Boolean).length };
  }

  const acc = "#C084FC";
  const accRgb = "192,132,252";

  const pill = (label: string, active: boolean, onClick: () => void) => (
    <button key={label} onClick={onClick} style={{ padding: "0.4rem 0.85rem", borderRadius: "20px", border: `1px solid ${active ? acc : "rgba(192,132,252,0.2)"}`, background: active ? `rgba(${accRgb},0.18)` : "transparent", color: active ? acc : "rgba(200,195,225,0.5)", fontSize: "0.72rem", cursor: "pointer", transition: "all 0.2s", fontFamily: "'Raleway', sans-serif" }}>
      {label}
    </button>
  );

  if (step === 3) {
    if (loading && chapters.length === 0) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", color: acc, letterSpacing: "4px", textTransform: "uppercase", animation: "pulse 2s ease-in-out infinite" }}>Initiating Phase 1…</div>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.4)`, fontFamily: "'Raleway', sans-serif", letterSpacing: "2px" }}>Isolation &amp; Intimidation</div>
          <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>
        </div>
      );
    }

    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <button onClick={() => { setStep(1); setChapters([]); }} style={{ background: "transparent", border: `1px solid rgba(${accRgb},0.3)`, color: acc, borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>← NEW SESSION</button>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: acc, letterSpacing: "3px", margin: 0, flex: 1 }}>MIND BREAK CHAMBER</h1>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => exportStoryAsTXT(buildExportStory())} style={{ background: "transparent", border: `1px solid rgba(${accRgb},0.3)`, color: "rgba(200,195,225,0.6)", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>TXT</button>
            <button onClick={() => exportStoryAsPDF(buildExportStory())} style={{ background: "transparent", border: `1px solid rgba(${accRgb},0.3)`, color: "rgba(200,195,225,0.6)", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>PDF</button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {PHASE_LABELS.slice(1).map((l, i) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: i < chapters.length ? acc : "rgba(255,255,255,0.1)", border: i === chapters.length - 1 ? `2px solid ${acc}` : "1px solid rgba(255,255,255,0.1)" }} />
              <span style={{ fontSize: "0.6rem", color: i < chapters.length ? "rgba(200,195,225,0.7)" : "rgba(200,195,225,0.25)", fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>{l.toUpperCase()}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "rgba(192,132,252,0.03)", border: `1px solid rgba(${accRgb},0.12)`, borderRadius: "12px", padding: "0.75rem 1.25rem", marginBottom: "1.5rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {[[finalHeroine,"Captive"],[finalVillain,"Breaker"],[finalSetting,"Setting"]].map(([v,l]) => (
            <div key={l}><div style={{ fontSize: "0.5rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif" }}>{l}</div><div style={{ fontSize: "0.8rem", color: "#EEE", fontFamily: "'Raleway', sans-serif" }}>{v}</div></div>
          ))}
        </div>

        <ReadingProgressBar current={chapters.length} max={5} accentColor={acc} accentRgb={accRgb} label="PHASES COMPLETE" />

        {psycheLog.length > 0 && <PsycheMeter sanity={psycheSanity} resistance={psycheResistance} log={psycheLog} heroineName={finalHeroine || undefined} />}

        {chapters.map((ch, i) => {
          const wc = ch.split(/\s+/).filter(Boolean).length;
          return (
            <div key={i}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0 1rem" }}><div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.15)` }} /><span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", whiteSpace: "nowrap" }}>— PHASE {i + 1}: {PHASE_LABELS[i + 1]?.toUpperCase() ?? "BEYOND"} —</span><div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.15)` }} /></div>
              {ch.split("\n").filter(Boolean).map((p, j) => <p key={j} style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1.02rem", lineHeight: 1.9, color: "rgba(230,225,255,0.85)", marginBottom: "1rem" }}>{p}</p>)}
              <div style={{ fontSize: "0.58rem", color: `rgba(${accRgb},0.3)`, fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px", textAlign: "right", marginTop: "-0.5rem", marginBottom: "0.5rem" }}>{wc.toLocaleString()} words</div>
            </div>
          );
        })}

        {streamingText && (
          <div>
            {streamingText.split("\n").filter(Boolean).map((p, j) => <p key={j} style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1.02rem", lineHeight: 1.9, color: "rgba(230,225,255,0.75)", marginBottom: "1rem", opacity: 0.8 }}>{p}</p>)}
          </div>
        )}

        <div ref={bottomRef} />

        {!loading && !continuing && chapters.length < 5 && (
          <div style={{ marginTop: "2rem", background: "rgba(0,0,0,0.85)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "12px", padding: "1.5rem", position: "sticky", bottom: "1rem", backdropFilter: "blur(16px)" }}>
            <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.6)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.5rem" }}>PHASE {phase} — {PHASE_LABELS[phase]?.toUpperCase()}</div>
            <textarea value={continueDir} onChange={e => setContinueDir(e.target.value)} placeholder={`Steer Phase ${phase}... (optional)`} rows={2} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.82rem", padding: "0.75rem", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" }} />
            <button onClick={() => generate(false)} disabled={continuing} style={{ width: "100%", padding: "0.85rem", background: `rgba(${accRgb},0.12)`, border: `1px solid rgba(${accRgb},0.4)`, color: acc, borderRadius: "8px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" }}>
              {continuing ? "BREAKING..." : `CONTINUE TO PHASE ${phase}`}
            </button>
          </div>
        )}
        {chapters.length >= 5 && <div style={{ marginTop: "2rem", textAlign: "center", fontFamily: "'Cinzel', serif", color: `rgba(${accRgb},0.5)`, fontSize: "0.7rem", letterSpacing: "3px" }}>— COMPLETE SURRENDER ACHIEVED —</div>}
                {error && <div style={{ color: "#FF6060", fontSize: "0.75rem", marginTop: "1rem", fontFamily: "'Raleway', sans-serif" }}>Error: {error}</div>}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "680px", margin: "0 auto" }}>
        <button onClick={() => setStep(1)} style={{ background: "transparent", border: `1px solid rgba(${accRgb},0.3)`, color: acc, borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", marginBottom: "2rem" }}>← BACK</button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", color: acc, letterSpacing: "3px", marginBottom: "2rem" }}>CONFIGURE THE CHAMBER</h1>

        <Section title="SETTING" rgb={accRgb} acc={acc}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
            {SETTINGS.map(s => pill(s, setting === s, () => { setSetting(s); setCustomSetting(""); }))}
          </div>
          <input value={customSetting} onChange={e => { setCustomSetting(e.target.value); setSetting(""); }} placeholder="Or describe your own setting…" style={inputStyle} />
        </Section>

        <Section title="HER BREAKING POINT" rgb={accRgb} acc={acc}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
            {BREAKING_POINTS.map(b => pill(b, breakingPoint === b, () => { setBreakingPoint(b); setCustomBreakingPoint(""); }))}
          </div>
          <input value={customBreakingPoint} onChange={e => { setCustomBreakingPoint(e.target.value); setBreakingPoint(""); }} placeholder="Or describe her specific vulnerability…" style={inputStyle} />
        </Section>

        {error && <div style={{ color: "#FF6060", fontSize: "0.75rem", marginBottom: "1rem" }}>Error: {error}</div>}
        {/* ── Outfit, Scene & Narrative Controls ── */}
        <OutfitSelector outfitId={outfitId} damage={outfitDamage} onOutfitChange={setOutfitId} onDamageChange={setOutfitDamage} accentColor="#A78BFA" accentRgb="167,139,250" />
        <div style={{marginTop:"1.25rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"0.875rem"}}>
            <div style={{width:"3px",height:"18px",borderRadius:"2px",background:"linear-gradient(180deg, #A78BFA, transparent)"}} />
            <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.72rem",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"#A78BFA"}}>Scene Parameters</span>
            <div style={{flex:1,height:"1px",background:"linear-gradient(90deg, rgba(167,139,250,0.25), transparent)"}} />
            <span style={{fontSize:"0.62rem",color:"rgba(200,195,240,0.3)",fontStyle:"italic"}}>optional</span>
          </div>
          <div style={{background:"rgba(15,10,30,0.5)",border:"1px solid rgba(167,139,250,0.18)",borderRadius:"12px",padding:"1rem",backdropFilter:"blur(8px)"}}>

          <div style={{marginBottom:"0.875rem"}}>
            <div style={{fontSize:"0.57rem",fontFamily:"'Montserrat',sans-serif",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(200,195,240,0.35)",marginBottom:"0.5rem"}}>PRIMARY BREAKING METHOD</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
              {[{"id":"physical_exhaustion","icon":"💪","label":"Physical Exhaustion"},{"id":"psychological","icon":"🧠","label":"Psychological Manipulation"},{"id":"sensory_overload","icon":"🌀","label":"Sensory Overload"},{"id":"chemical_assistance","icon":"💉","label":"Chemical Assistance"},{"id":"combined","icon":"⚡","label":"Combined / All Methods"}].map((opt:{id:string;icon:string;label:string}) => (<button key={opt.id} onClick={() => setMethodFocus(methodFocus === opt.id ? "" : opt.id)} style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.4rem 0.8rem",borderRadius:"20px",border:`1px solid ${methodFocus === opt.id ? "#A78BFA" : "rgba(200,195,240,0.15)"}`,background:methodFocus === opt.id ? "rgba(167,139,250,0.16)" : "rgba(255,255,255,0.03)",color:methodFocus === opt.id ? "#A78BFA" : "rgba(200,195,240,0.55)",fontSize:"0.7rem",fontFamily:"'Montserrat',sans-serif",fontWeight:methodFocus === opt.id ? 700:400,cursor:"pointer",transition:"all 0.18s",minHeight:"36px"}}><span>{opt.icon}</span><span>{opt.label}</span></button>))}
            </div>
          </div>
          </div>
        </div>
        <UniversalOptions config={universalConfig} onChange={setUniversalConfig} accentColor="#A78BFA" accentRgb="167,139,250" />
        <StoryLengthPicker value={storyLength} onChange={setStoryLength} accentColor="#A78BFA" accentRgb="167,139,250" />

        <button onClick={() => { if (canGenerate) { setStep(3); generate(true); } }} disabled={!canGenerate || loading} style={{ width: "100%", padding: "1rem", background: canGenerate ? `rgba(${accRgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${canGenerate ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: canGenerate ? acc : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: canGenerate ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px", transition: "all 0.2s" }}>
          {loading ? "INITIATING..." : "BEGIN THE BREAKING"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "860px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "3rem" }}>
        <button onClick={onBack} style={{ background: "transparent", border: `1px solid rgba(${accRgb},0.3)`, color: acc, borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>← HOME</button>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.3rem,3vw,1.8rem)", color: acc, letterSpacing: "4px", margin: 0 }}>MIND BREAK CHAMBER</h1>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginTop: "0.25rem" }}>PSYCHOLOGICAL BREAKING — 5 PHASES</div>
        </div>
      </div>

      <Section title="CAPTIVE HEROINE" rgb={accRgb} acc={acc}>
        <HeroinePicker
          value={heroine || customHeroine}
          onChange={name => { setHeroine(name); setCustomHeroine(""); }}
          accentColor={acc}
          accentRgb={accRgb}
        />
      </Section>

      <Section title="THE BREAKER (VILLAIN)" rgb={accRgb} acc={acc}>
        <VillainPicker
          value={villain || customVillain}
          onChange={name => { setVillain(name); setCustomVillain(""); }}
          accentColor={acc}
          accentRgb={accRgb}
          label=""
        />
      </Section>

      <div style={{ marginTop: "2rem" }}>
        <button onClick={() => { if (finalHeroine && finalVillain) setStep(2); }} disabled={!finalHeroine || !finalVillain} style={{ width: "100%", padding: "1rem", background: finalHeroine && finalVillain ? `rgba(${accRgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${finalHeroine && finalVillain ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: finalHeroine && finalVillain ? acc : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: finalHeroine && finalVillain ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px", transition: "all 0.2s" }}>
          CONFIGURE THE CHAMBER →
        </button>
      </div>
    </div>
  );
}

function Section({ title, children, rgb, acc }: { title: string; children: React.ReactNode; rgb: string; acc: string }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ fontSize: "0.55rem", color: `rgba(${rgb},0.6)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginBottom: "0.75rem", borderBottom: `1px solid rgba(${rgb},0.12)`, paddingBottom: "0.5rem" }}>{title}</div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(192,132,252,0.2)", borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.6rem 0.85rem", outline: "none", boxSizing: "border-box" };
