import HeroinePicker from "../components/HeroinePicker";
import ReadingProgressBar from "../components/ReadingProgressBar";
import { useState, useRef, useEffect } from "react";
import StoryLengthPicker, { type StoryLength } from "../components/StoryLengthPicker";
import OutfitSelector, { outfitPromptLine } from "../components/OutfitSelector";
import UniversalOptions, { UNIVERSAL_DEFAULTS, universalPromptLines, type UniversalConfig } from "../components/UniversalOptions";
import { getAiProvider } from "../lib/aiProvider";
import { saveStoryToArchive, updateArchiveStory, exportStoryAsTXT, exportStoryAsPDF } from "../lib/archive";
import PsycheMeter, { type PsycheEvent } from "../components/PsycheMeter";

interface Props { onBack: () => void; }


const TRAINERS = [
  "Lex Luthor","Red Skull","Baron Zemo","Ra's al Ghul","Sinister","Doctor Doom",
  "Magneto","Deathstroke","Maxwell Lord","Norman Osborn","The Controller","Mephisto",
];
const LOCATIONS = [
  "A purpose-built conditioning chamber beneath his base",
  "An isolated cabin — no outside contact",
  "A converted laboratory with restraint equipment",
  "His private residence — normalcy used as a tool",
  "A moving transport — she never knows where she is",
  "A sealed room with one-way glass — she's always watched",
];
const METHODS = [
  { id: "reward-punishment", label: "Reward & Punishment",    desc: "Compliance earns comfort. Defiance earns pain." },
  { id: "repetition",        label: "Repetitive Command",     desc: "Commands repeated until response becomes reflex." },
  { id: "identity",          label: "Identity Replacement",   desc: "Her name, history, and self are systematically overwritten." },
  { id: "dependency",        label: "Manufactured Dependency",desc: "She is made to need him — food, warmth, human contact." },
  { id: "exposure",          label: "Desensitisation",        desc: "Repeated exposure until shame, resistance, and will erode." },
  { id: "isolation",         label: "Total Isolation",        desc: "Contact rationed. He becomes her only reality." },
];

const SESSIONS = [
  { label: "Session 1", compliance: 5,  resistance: 95, commands: 0,  note: "Fully unbroken. Total defiance." },
  { label: "Session 2", compliance: 18, resistance: 82, commands: 2,  note: "First cracks. Pain stimulus effective." },
  { label: "Session 3", compliance: 38, resistance: 62, commands: 5,  note: "Conditioning taking hold. She hesitates." },
  { label: "Session 4", compliance: 60, resistance: 40, commands: 9,  note: "Compliance increasingly reflexive." },
  { label: "Session 5", compliance: 80, resistance: 20, commands: 13, note: "Near-complete conditioning. Minimal resistance." },
  { label: "Session 6", compliance: 96, resistance: 4,  commands: 17, note: "Training complete. She responds without thinking." },
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const acc = "#2DD4BF";
const accRgb = "45,212,191";

export default function ObedienceTrainingMode({ onBack }: Props) {
  const [step, setStep] = useState<1|2|3>(1);
  const [heroine, setHeroine] = useState("");
  const [customHeroine, setCustomHeroine] = useState("");
  const [trainer, setTrainer] = useState("");
  const [customTrainer, setCustomTrainer] = useState("");
  const [location, setLocation] = useState("");
  const [method, setMethod] = useState("");
  const [chapters, setChapters] = useState<string[]>([]);
  const [psycheLog, setPsycheLog] = useState<PsycheEvent[]>([]);
  const psycheLogRef = useRef<PsycheEvent[]>([]);
  const psycheChapRef = useRef(0);
  useEffect(() => { psycheLogRef.current = psycheLog; }, [psycheLog]);
  useEffect(() => {
    if (chapters.length === 0) { psycheChapRef.current = 0; setPsycheLog([]); return; }
    if (chapters.length <= psycheChapRef.current) return;
    psycheChapRef.current = chapters.length;
    const _ch = chapters[chapters.length - 1]; if (!_ch?.trim()) return;
    const _log = psycheLogRef.current;
    const _s = Math.max(0, 100 + _log.reduce((a, e) => a + e.sanityDelta, 0));
    const _r = Math.max(0, 100 + _log.reduce((a, e) => a + (e.resistanceDelta ?? 0), 0));
    fetch("/api/story/psyche-update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chapterText: _ch.slice(0, 2500), heroineName: fH || undefined, currentSanity: _s, currentResistance: _r }) })
      .then(r => r.ok ? r.json() : null).then((d: { sanityDelta: number; resistanceDelta: number; event: string } | null) => { if (d) setPsycheLog(prev => [...prev, { sanityDelta: d.sanityDelta, resistanceDelta: d.resistanceDelta, event: d.event }]); }).catch(() => {});
  }, [chapters]);
  const psycheSanity = Math.max(0, 100 + psycheLog.reduce((s, e) => s + e.sanityDelta, 0));
  const psycheResistance = Math.max(0, 100 + psycheLog.reduce((s, e) => s + (e.resistanceDelta ?? 0), 0));
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [continueDir, setContinueDir] = useState("");
  const [savedId, setSavedId] = useState<string|null>(null);
  const [error, setError] = useState("");
  const [outfitId, setOutfitId] = useState("");
  const [universalConfig, setUniversalConfig] = useState<UniversalConfig>(UNIVERSAL_DEFAULTS);
  const [trainingPhilosophy, setTrainingPhilosophy] = useState("");
  const [complianceMilestone, setComplianceMilestone] = useState("");
  const [breakingTool, setBreakingTool] = useState("");
  const [defianceConsequence, setDefianceConsequence] = useState("");
  const [outfitDamage, setOutfitDamage] = useState(0);
  const [storyLength, setStoryLength] = useState<StoryLength>("standard");
  const bottomRef = useRef<HTMLDivElement>(null);

  const fH = customHeroine.trim() || heroine;
  const fT = customTrainer.trim() || trainer;
  const canStep2 = !!fH;
  const canGen = fH && fT && location && method;
  const sessionIdx = Math.min(chapters.length, SESSIONS.length - 1);
  const currentSession = SESSIONS[sessionIdx];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  async function generate(isFirst: boolean) {
    if (isFirst) { setLoading(true); setChapters([]); setSavedId(null); }
    else setContinuing(true);
    setStreamingText(""); setError("");
    try {
      const resp = await fetch(`${BASE}/api/story/obedience-training`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: getAiProvider(), outfitContext: outfitPromptLine(outfitId, outfitDamage), universalContext: universalPromptLines(universalConfig), modeContext: (() => { const _trainingPhilosophyMap: Record<string,string> = {"pure_punishment":"Pure Punishment","reward_conditioning":"Reward Conditioning","psychological":"Psychological Erosion","mixed":"Mixed Approach"};
      const _complianceMilestoneMap: Record<string,string> = {"verbal_acknowledgment":"Verbal Acknowledgment","behavioral_compliance":"Behavioral Compliance","total_submission":"Total Submission","genuine_cooperation":"Genuine Cooperation"}; return [trainingPhilosophy ? `Training Philosophy: ${_trainingPhilosophyMap[trainingPhilosophy] ?? trainingPhilosophy}` : "", complianceMilestone ? `Compliance Goal: ${_complianceMilestoneMap[complianceMilestone] ?? complianceMilestone}` : "", breakingTool ? `Primary Breaking Tool: ${breakingTool.replace(/_/g," ")}` : "", defianceConsequence ? `Defiance Consequence (what happens when she refuses): ${defianceConsequence.replace(/_/g," ")}` : ""].filter(Boolean).join("\n"); })(), trainingPhilosophy, complianceMilestone, breakingTool, defianceConsequence, heroine: fH, trainer: fT, location, method, chapters: isFirst ? [] : chapters, sessionNumber: isFirst ? 1 : chapters.length + 1, storyLength, continueDir }),
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
        const id = saveStoryToArchive({ title: `${fH} — ${fT}'s Training`, universe: "Obedience Training", tool: "Obedience Training", characters: [fH, fT], chapters: newChapters });
        setSavedId(id);
      } else if (savedId) {
        updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
      }
    } catch(e) { setError(String(e)); }
    finally { setLoading(false); setContinuing(false); }
  }

  function buildExport() {
    return { id: savedId ?? "tmp", title: `${fH} — ${fT}'s Training`, createdAt: Date.now(), universe: "Obedience Training", tool: "Obedience Training", characters: [fH, fT], chapters, tags: [], favourite: false, wordCount: chapters.join(" ").split(/\s+/).filter(Boolean).length };
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
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", color: acc, letterSpacing: "4px", animation: "pulse 2s ease-in-out infinite" }}>Preparing the first session…</div>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.4)`, fontFamily: "'Raleway', sans-serif", letterSpacing: "2px" }}>Compliance: 0%</div>
        </div>
      );
    }

    const displaySession = SESSIONS[Math.min(chapters.length - 1, SESSIONS.length - 1)];

    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "940px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <button onClick={() => { setStep(1); setChapters([]); }} style={backBtn}>← NEW SUBJECT</button>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: acc, letterSpacing: "3px", margin: 0, flex: 1 }}>OBEDIENCE TRAINING</h1>
          <button onClick={() => exportStoryAsTXT(buildExport())} style={exportBtn}>TXT</button>
          <button onClick={() => exportStoryAsPDF(buildExport())} style={exportBtn}>PDF</button>
        </div>

        {/* Training Log Panel */}
        <div style={{ background: `rgba(${accRgb},0.06)`, border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "12px", padding: "1.25rem 1.5rem", marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.5rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginBottom: "0.875rem" }}>TRAINING LOG — {fT.toUpperCase()}'S PROGRAMME</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem" }}>
            <LogMetric label="SESSION" value={`${chapters.length} / 6`} rgb={accRgb} acc={acc} />
            <LogMetric label="SUBJECT" value={fH} rgb={accRgb} acc={acc} />
            <LogMetric label="METHOD" value={METHODS.find(m => m.id === method)?.label ?? method} rgb={accRgb} acc={acc} />
          </div>
          {chapters.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <div style={{ display: "flex", gap: "1.5rem", marginBottom: "0.625rem" }}>
                <BarMetric label="COMPLIANCE" value={displaySession.compliance} color={acc} rgb={accRgb} />
                <BarMetric label="RESISTANCE" value={displaySession.resistance} color="#EF4444" rgb="239,68,68" />
              </div>
              <div style={{ display: "flex", gap: "2rem" }}>
                <LogMetric label="COMMANDS INTERNALISED" value={`${displaySession.commands}`} rgb={accRgb} acc={acc} />
                <LogMetric label="STATUS" value={displaySession.note} rgb={accRgb} acc={acc} />
              </div>
            </div>
          )}
        </div>

        <ReadingProgressBar current={chapters.length} max={6} accentColor={acc} accentRgb={accRgb} />


        {psycheLog.length > 0 && <PsycheMeter sanity={psycheSanity} resistance={psycheResistance} log={psycheLog} heroineName={fH || undefined} />}
        {chapters.map((ch, i) => (
          <div key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0 1.25rem" }}>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", color: `rgba(${accRgb},0.55)`, letterSpacing: "3px" }}>{SESSIONS[i]?.label?.toUpperCase() ?? `SESSION ${i + 1}`}</span>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
            </div>
            <p style={prosestyle}>{ch}</p>
            <div style={{ fontSize: "0.58rem", color: `rgba(${accRgb},0.3)`, fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px", textAlign: "right", marginTop: "-0.5rem", marginBottom: "0.5rem" }}>{ch.split(/\s+/).filter(Boolean).length.toLocaleString()} words</div>
          </div>
        ))}
        {streamingText && <p style={{ ...prosestyle, opacity: 0.85 }}>{streamingText}</p>}
        <div ref={bottomRef} />

        {!loading && !continuing && chapters.length < 6 && (
          <div style={{ marginTop: "2rem", background: "rgba(0,0,0,0.85)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "12px", padding: "1.5rem", position: "sticky", bottom: "1rem", backdropFilter: "blur(16px)" }}>
            <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.6)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.5rem" }}>
              {SESSIONS[chapters.length]?.label?.toUpperCase() ?? "NEXT SESSION"}
            </div>
            <textarea value={continueDir} onChange={e => setContinueDir(e.target.value)} placeholder="Steer this session… (optional — e.g. 'she almost breaks', 'new command introduced', 'she cries but complies')" rows={2} style={taStyle} />
            <button onClick={() => generate(false)} disabled={continuing} style={continueBtn(accRgb, acc)}>
              {continuing ? "SESSION IN PROGRESS…" : "📋 BEGIN SESSION " + (chapters.length + 1)}
            </button>
          </div>
        )}
        {chapters.length >= 6 && <div style={endLabel(accRgb)}>— TRAINING COMPLETE. SHE RESPONDS WITHOUT THINKING. —</div>}
        {continuing && <div style={loadLabel(accRgb)}>Session in progress…</div>}
                {error && <div style={errStyle}>Error: {error}</div>}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "720px", margin: "0 auto" }}>
        <button onClick={() => setStep(1)} style={backBtn}>← BACK</button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", color: acc, letterSpacing: "3px", margin: "0 0 2rem" }}>CONFIGURE TRAINING</h1>

        <Section title="TRAINER" rgb={accRgb}>
          <div style={pillRow}>{TRAINERS.map(t => pill(t, trainer === t, () => { setTrainer(t); setCustomTrainer(""); }))}</div>
          <input value={customTrainer} onChange={e => { setCustomTrainer(e.target.value); setTrainer(""); }} placeholder="Or type any villain…" style={inputStyle} />
        </Section>
        <Section title="LOCATION" rgb={accRgb}>
          <div style={pillRow}>{LOCATIONS.map(l => pill(l, location === l, () => setLocation(l)))}</div>
        </Section>
        <Section title="TRAINING METHOD" rgb={accRgb}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "0.625rem" }}>
            {METHODS.map(m => {
              const sel = method === m.id;
              return (
                <button key={m.id} onClick={() => setMethod(m.id)} style={{ background: sel ? `rgba(${accRgb},0.16)` : "rgba(0,0,0,0.4)", border: `1px solid ${sel ? `rgba(${accRgb},0.55)` : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", padding: "0.875rem", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.72rem", color: sel ? acc : "#DDD", marginBottom: "0.3rem" }}>{m.label}</div>
                  <div style={{ fontSize: "0.6rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Montserrat',sans-serif" }}>{m.desc}</div>
                </button>
              );
            })}
          </div>
        </Section>

        {error && <div style={errStyle}>{error}</div>}
        {/* ── Outfit, Scene & Narrative Controls ── */}
        <OutfitSelector outfitId={outfitId} damage={outfitDamage} onOutfitChange={setOutfitId} onDamageChange={setOutfitDamage} accentColor="#E879F9" accentRgb="232,121,249" />
        <div style={{marginTop:"1.25rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"0.875rem"}}>
            <div style={{width:"3px",height:"18px",borderRadius:"2px",background:"linear-gradient(180deg, #E879F9, transparent)"}} />
            <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.72rem",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"#E879F9"}}>Scene Parameters</span>
            <div style={{flex:1,height:"1px",background:"linear-gradient(90deg, rgba(232,121,249,0.25), transparent)"}} />
            <span style={{fontSize:"0.62rem",color:"rgba(200,195,240,0.3)",fontStyle:"italic"}}>optional</span>
          </div>
          <div style={{background:"rgba(15,10,30,0.5)",border:"1px solid rgba(232,121,249,0.18)",borderRadius:"12px",padding:"1rem",backdropFilter:"blur(8px)"}}>

          <div style={{marginBottom:"0.875rem"}}>
            <div style={{fontSize:"0.57rem",fontFamily:"'Montserrat',sans-serif",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(200,195,240,0.35)",marginBottom:"0.5rem"}}>TRAINING PHILOSOPHY</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
              {[{"id":"pure_punishment","icon":"⚡","label":"Pure Punishment"},{"id":"reward_conditioning","icon":"🌟","label":"Reward Conditioning"},{"id":"psychological","icon":"🧠","label":"Psychological Erosion"},{"id":"mixed","icon":"⚖️","label":"Mixed Approach"}].map((opt:{id:string;icon:string;label:string}) => (<button key={opt.id} onClick={() => setTrainingPhilosophy(trainingPhilosophy === opt.id ? "" : opt.id)} style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.4rem 0.8rem",borderRadius:"20px",border:`1px solid ${trainingPhilosophy === opt.id ? "#E879F9" : "rgba(200,195,240,0.15)"}`,background:trainingPhilosophy === opt.id ? "rgba(232,121,249,0.16)" : "rgba(255,255,255,0.03)",color:trainingPhilosophy === opt.id ? "#E879F9" : "rgba(200,195,240,0.55)",fontSize:"0.7rem",fontFamily:"'Montserrat',sans-serif",fontWeight:trainingPhilosophy === opt.id ? 700:400,cursor:"pointer",transition:"all 0.18s",minHeight:"36px"}}><span>{opt.icon}</span><span>{opt.label}</span></button>))}
            </div>
          </div>
          <div style={{marginBottom:"0.875rem"}}>
            <div style={{fontSize:"0.57rem",fontFamily:"'Montserrat',sans-serif",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(200,195,240,0.35)",marginBottom:"0.5rem"}}>COMPLIANCE GOAL</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
              {[{"id":"verbal_acknowledgment","icon":"💬","label":"Verbal Acknowledgment"},{"id":"behavioral_compliance","icon":"🎯","label":"Behavioral Compliance"},{"id":"total_submission","icon":"⛓️","label":"Total Submission"},{"id":"genuine_cooperation","icon":"🤝","label":"Genuine Cooperation"}].map((opt:{id:string;icon:string;label:string}) => (<button key={opt.id} onClick={() => setComplianceMilestone(complianceMilestone === opt.id ? "" : opt.id)} style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.4rem 0.8rem",borderRadius:"20px",border:`1px solid ${complianceMilestone === opt.id ? "#E879F9" : "rgba(200,195,240,0.15)"}`,background:complianceMilestone === opt.id ? "rgba(232,121,249,0.16)" : "rgba(255,255,255,0.03)",color:complianceMilestone === opt.id ? "#E879F9" : "rgba(200,195,240,0.55)",fontSize:"0.7rem",fontFamily:"'Montserrat',sans-serif",fontWeight:complianceMilestone === opt.id ? 700:400,cursor:"pointer",transition:"all 0.18s",minHeight:"36px"}}><span>{opt.icon}</span><span>{opt.label}</span></button>))}
            </div>
          </div>
          <div style={{marginBottom:"0.875rem"}}>
            <div style={{fontSize:"0.57rem",fontFamily:"'Montserrat',sans-serif",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(200,195,240,0.35)",marginBottom:"0.5rem"}}>BREAKING TOOL</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
              {[{id:"physical_conditioning",icon:"⚡",label:"Physical Conditioning"},{id:"solitary_confinement",icon:"🌑",label:"Solitary Confinement"},{id:"verbal_deconstruction",icon:"💬",label:"Verbal Deconstruction"},{id:"forced_performance",icon:"🎭",label:"Forced Degrading Performance"},{id:"clinical_indifference",icon:"🧊",label:"Clinical Indifference"},{id:"pharmacological",icon:"💊",label:"Pharmacological Assistance"}].map((opt:{id:string;icon:string;label:string}) => (<button key={opt.id} onClick={() => setBreakingTool(breakingTool === opt.id ? "" : opt.id)} style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.4rem 0.8rem",borderRadius:"20px",border:`1px solid ${breakingTool === opt.id ? "#E879F9" : "rgba(200,195,240,0.15)"}`,background:breakingTool === opt.id ? "rgba(232,121,249,0.16)" : "rgba(255,255,255,0.03)",color:breakingTool === opt.id ? "#E879F9" : "rgba(200,195,240,0.55)",fontSize:"0.7rem",fontFamily:"'Montserrat',sans-serif",fontWeight:breakingTool === opt.id ? 700:400,cursor:"pointer",transition:"all 0.18s",minHeight:"36px"}}><span>{opt.icon}</span><span>{opt.label}</span></button>))}
            </div>
          </div>
          <div style={{marginBottom:"0"}}>
            <div style={{fontSize:"0.57rem",fontFamily:"'Montserrat',sans-serif",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(200,195,240,0.35)",marginBottom:"0.5rem"}}>DEFIANCE CONSEQUENCE</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
              {[{id:"increased_restraint",icon:"😤",label:"Increased Restraint"},{id:"public_witnessed_failure",icon:"👁",label:"Publicly Witnessed Failure"},{id:"extended_sessions",icon:"⏳",label:"Extended Training Sessions"},{id:"sensory_withdrawal",icon:"🔕",label:"Total Sensory Withdrawal"},{id:"permanent_failure_record",icon:"📊",label:"Permanent Failure on Record"},{id:"atonement_performance",icon:"🙇",label:"Compulsory Atonement Performance"}].map((opt:{id:string;icon:string;label:string}) => (<button key={opt.id} onClick={() => setDefianceConsequence(defianceConsequence === opt.id ? "" : opt.id)} style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.4rem 0.8rem",borderRadius:"20px",border:`1px solid ${defianceConsequence === opt.id ? "#E879F9" : "rgba(200,195,240,0.15)"}`,background:defianceConsequence === opt.id ? "rgba(232,121,249,0.16)" : "rgba(255,255,255,0.03)",color:defianceConsequence === opt.id ? "#E879F9" : "rgba(200,195,240,0.55)",fontSize:"0.7rem",fontFamily:"'Montserrat',sans-serif",fontWeight:defianceConsequence === opt.id ? 700:400,cursor:"pointer",transition:"all 0.18s",minHeight:"36px"}}><span>{opt.icon}</span><span>{opt.label}</span></button>))}
            </div>
          </div>
          </div>
        </div>
        <UniversalOptions config={universalConfig} onChange={setUniversalConfig} accentColor="#E879F9" accentRgb="232,121,249" />
        <StoryLengthPicker value={storyLength} onChange={setStoryLength} accentColor="#E879F9" accentRgb="232,121,249" />

        <button onClick={() => { if (canGen) { setStep(3); generate(true); } }} disabled={!canGen} style={primBtn(canGen, accRgb, acc)}>
          {loading ? "BEGINNING…" : "📋 BEGIN TRAINING"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
        <button onClick={onBack} style={backBtn}>← HOME</button>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.2rem,3vw,1.8rem)", color: acc, letterSpacing: "4px", margin: 0 }}>OBEDIENCE TRAINING</h1>
          <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginTop: "0.2rem" }}>6 SESSIONS — COMPLIANCE TRACKED IN REAL TIME</div>
        </div>
      </div>
      <Section title="SELECT SUBJECT" rgb={accRgb}>
        <HeroinePicker value={heroine || customHeroine} onChange={name => { setHeroine(name); setCustomHeroine(""); }} accentColor={acc} accentRgb={accRgb} />
      </Section>
      <button onClick={() => { if (canStep2) setStep(2); }} disabled={!canStep2} style={primBtn(canStep2, accRgb, acc)}>
        CONFIGURE TRAINING →
      </button>
    </div>
  );
}

function Section({ title, subtitle, children, rgb }: { title: string; subtitle?: string; children: React.ReactNode; rgb: string }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "baseline", borderBottom: `1px solid rgba(${rgb},0.12)`, paddingBottom: "0.4rem", marginBottom: "0.875rem" }}>
        <div style={{ fontSize: "0.55rem", color: `rgba(${rgb},0.6)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif" }}>{title}</div>
        {subtitle && <div style={{ fontSize: "0.55rem", color: "rgba(200,195,225,0.3)", fontFamily: "'Raleway', sans-serif" }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}
function LogMetric({ label, value, rgb, acc }: { label: string; value: string; rgb: string; acc: string }) {
  return <div><div style={{ fontSize: "0.48rem", color: `rgba(${rgb},0.45)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.2rem" }}>{label}</div><div style={{ fontSize: "0.78rem", color: acc, fontFamily: "'Raleway', sans-serif" }}>{value}</div></div>;
}
function BarMetric({ label, value, color, rgb }: { label: string; value: number; color: string; rgb: string }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
        <span style={{ fontSize: "0.48rem", color: `rgba(${rgb},0.45)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif" }}>{label}</span>
        <span style={{ fontSize: "0.6rem", color, fontFamily: "'Raleway', sans-serif" }}>{value}%</span>
      </div>
      <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: "2px", transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

const prosestyle: React.CSSProperties = { fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1rem", color: "rgba(230,225,255,0.85)", lineHeight: 1.9 };
const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(45,212,191,0.2)", borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.6rem 0.85rem", outline: "none", boxSizing: "border-box", marginTop: "0.5rem" };
const pillRow: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" };
const taStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(45,212,191,0.2)", borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.82rem", padding: "0.75rem", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" };
const backBtn: React.CSSProperties = { background: "transparent", border: "1px solid rgba(45,212,191,0.3)", color: "#2DD4BF", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", marginBottom: "2rem" };
const exportBtn: React.CSSProperties = { background: "transparent", border: "1px solid rgba(45,212,191,0.3)", color: "rgba(200,195,225,0.6)", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif" };
const primBtn = (active: boolean, rgb: string, ac: string): React.CSSProperties => ({ width: "100%", padding: "1rem", background: active ? `rgba(${rgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${active ? `rgba(${rgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: active ? ac : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: active ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" });
const continueBtn = (rgb: string, ac: string): React.CSSProperties => ({ width: "100%", padding: "0.85rem", background: `rgba(${rgb},0.14)`, border: `1px solid rgba(${rgb},0.45)`, color: ac, borderRadius: "8px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" });
const endLabel = (rgb: string): React.CSSProperties => ({ marginTop: "2rem", textAlign: "center", fontFamily: "'Cinzel', serif", color: `rgba(${rgb},0.5)`, fontSize: "0.7rem", letterSpacing: "3px" });
const loadLabel = (rgb: string): React.CSSProperties => ({ textAlign: "center", padding: "1.5rem", color: `rgba(${rgb},0.5)`, fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" });
const errStyle: React.CSSProperties = { color: "#FF6060", fontSize: "0.75rem", marginTop: "1rem", fontFamily: "'Raleway', sans-serif" };
