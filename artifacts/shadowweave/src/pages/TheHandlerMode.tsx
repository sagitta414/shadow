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
const HANDLER_TYPES = [
  { id: "admin",       label: "Bureaucratic Administrator", desc: "Protocols, paperwork, schedules. Normalcy as the primary instrument of control." },
  { id: "contractor",  label: "Private Contractor",         desc: "Former military. Efficient, detached, professional. This is a job, and he is very good at it." },
  { id: "researcher",  label: "Academic Researcher",        desc: "Studies her like a specimen. Scientific curiosity. Clinical, never cruel — which makes it worse." },
  { id: "analyst",     label: "Systems Analyst",            desc: "Frames everything as processes and optimisation. She is a system to be reconfigured." },
  { id: "correctional",label: "Correctional Specialist",    desc: "Applies facility management techniques developed for high-value detainees. Method over malice." },
  { id: "intel",       label: "Intelligence Asset Manager", desc: "Years of experience managing human assets. Knows exactly what he is doing and why it works." },
  { id: "medical",     label: "Medical Professional",       desc: "Her care is weaponised as dependency. He controls what she needs to function." },
];
const FACILITIES = [
  "A converted office building — completely mundane from the outside",
  "A private medical facility — sterile, clinical, apparently legitimate",
  "A research institute — she is filed as a study subject with a case number",
  "A secure residential property — looks like a home, functions like a cell",
  "A government-adjacent facility — the paperwork all checks out",
  "A corporate campus — her presence is a classified internal project",
];
const PROTOCOLS = [
  "Scheduled interactions only — all contact is strictly timetabled",
  "Minimal dialogue protocol — he speaks only when functionally necessary",
  "Reward and restriction cycle — compliance earns small freedoms, withdrawn on defiance",
  "Full monitoring — everything is logged, reviewed, and referenced later",
  "Managed dependency — basic needs controlled as leverage",
  "Identity management — her self-concept is administratively overwritten, step by step",
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const acc = "#D4A76A";
const accRgb = "212,167,106";

export default function TheHandlerMode({ onBack }: Props) {
  const [step, setStep] = useState<1|2|3>(1);
  const [heroine, setHeroine] = useState("");
  const [customHeroine, setCustomHeroine] = useState("");
  const [handlerType, setHandlerType] = useState("");
  const [handlerName, setHandlerName] = useState("");
  const [facility, setFacility] = useState("");
  const [protocol, setProtocol] = useState("");
  const [chapters, setChapters] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [continueDir, setContinueDir] = useState("");
  const [savedId, setSavedId] = useState<string|null>(null);
  const [error, setError] = useState("");
  const [outfitId, setOutfitId] = useState("");
  const [universalConfig, setUniversalConfig] = useState<UniversalConfig>(UNIVERSAL_DEFAULTS);
  const [handlerTone, setHandlerTone] = useState("");
  const [complianceTracking, setComplianceTracking] = useState("");
  const [outfitDamage, setOutfitDamage] = useState(0);
  const [storyLength, setStoryLength] = useState<StoryLength>("standard");
  const bottomRef = useRef<HTMLDivElement>(null);

  const fH = customHeroine.trim() || heroine;
  const fHT = HANDLER_TYPES.find(h => h.id === handlerType);
  const handlerDisplayName = handlerName.trim() || `The ${fHT?.label ?? "Handler"}`;
  const canStep2 = !!fH;
  const canGen = fH && handlerType && facility && protocol;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  async function generate(isFirst: boolean) {
    if (isFirst) { setLoading(true); setChapters([]); setSavedId(null); }
    else setContinuing(true);
    setStreamingText(""); setError("");
    try {
      const resp = await fetch(`${BASE}/api/story/the-handler`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: getAiProvider(), outfitContext: outfitPromptLine(outfitId, outfitDamage), universalContext: universalPromptLines(universalConfig), modeContext: (() => { const _handlerToneMap: Record<string,string> = {"clinical":"Clinical Detachment","obsessive":"Obsessive Attachment","professional":"Professional Ownership","cold":"Cold Efficiency"};
      const _complianceTrackingMap: Record<string,string> = {"logged":"Logged & Filed","verbal":"Verbal Reporting","inspection":"Physical Inspection","behavioral":"Behavioral Observation"}; return [handlerTone ? `Handler Tone: ${_handlerToneMap[handlerTone] ?? handlerTone}` : "", complianceTracking ? `Compliance Tracking: ${_complianceTrackingMap[complianceTracking] ?? complianceTracking}` : ""].filter(Boolean).join("\n"); })(), handlerTone, complianceTracking, heroine: fH, handlerType, handlerName: handlerDisplayName, handlerDesc: fHT?.desc ?? "", facility, protocol, chapters: isFirst ? [] : chapters, sessionNumber: isFirst ? 1 : chapters.length + 1, storyLength, continueDir }),
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
        const id = saveStoryToArchive({ title: `${fH} — The Handler`, universe: "The Handler", tool: "The Handler", characters: [fH, handlerDisplayName], chapters: newChapters });
        setSavedId(id);
      } else if (savedId) {
        updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
      }
    } catch(e) { setError(String(e)); }
    finally { setLoading(false); setContinuing(false); }
  }

  function buildExport() {
    return { id: savedId ?? "tmp", title: `${fH} — The Handler`, createdAt: Date.now(), universe: "The Handler", tool: "The Handler", characters: [fH, handlerDisplayName], chapters, tags: [], favourite: false, wordCount: chapters.join(" ").split(/\s+/).filter(Boolean).length };
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
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", color: acc, letterSpacing: "4px", animation: "pulse 2s ease-in-out infinite" }}>Case file opened…</div>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.4)`, fontFamily: "'Raleway', sans-serif", letterSpacing: "2px" }}>Subject: {fH}</div>
        </div>
      );
    }
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "920px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <button onClick={() => { setStep(1); setChapters([]); }} style={hB}>← NEW CASE</button>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: acc, letterSpacing: "3px", margin: 0, flex: 1 }}>THE HANDLER</h1>
          <button onClick={() => exportStoryAsTXT(buildExport())} style={hE}>TXT</button>
          <button onClick={() => exportStoryAsPDF(buildExport())} style={hE}>PDF</button>
        </div>
        <div style={{ background: `rgba(${accRgb},0.06)`, border: `1px solid rgba(${accRgb},0.18)`, borderRadius: "12px", padding: "1rem 1.5rem", marginBottom: "2rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <hMi label="SUBJECT" value={fH} />
          <hMi label="HANDLER" value={handlerDisplayName} />
          <hMi label="TYPE" value={fHT?.label ?? ""} />
          <hMi label="FACILITY" value={facility.split("—")[0].trim()} />
          <hMi label="PROTOCOL" value={protocol.split("—")[0].trim()} />
          <hMi label="SESSIONS" value={`${chapters.length}`} />
        </div>
        {chapters.map((ch, i) => (
          <div key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0 1.25rem" }}>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", color: `rgba(${accRgb},0.55)`, letterSpacing: "3px" }}>SESSION {i+1}</span>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
            </div>
            <p style={hP}>{ch}</p>
          </div>
        ))}
        {streamingText && <p style={{ ...hP, opacity: 0.85 }}>{streamingText}</p>}
        <div ref={bottomRef} />
        {!loading && !continuing && chapters.length < 6 && (
          <div style={{ marginTop: "2rem", background: "rgba(0,0,0,0.4)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "12px", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.6)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.5rem" }}>SESSION {chapters.length + 1}</div>
            <textarea value={continueDir} onChange={e => setContinueDir(e.target.value)} placeholder="Steer this session… (optional — e.g. 'she asks about going outside', 'he introduces a new protocol', 'she cries and he logs it')" rows={2} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.82rem", padding: "0.75rem", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" }} />
            <button onClick={() => generate(false)} disabled={continuing} style={{ width: "100%", padding: "0.85rem", background: `rgba(${accRgb},0.14)`, border: `1px solid rgba(${accRgb},0.45)`, color: acc, borderRadius: "8px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" }}>
              {continuing ? "SESSION IN PROGRESS…" : "📁 NEXT SESSION"}
            </button>
          </div>
        )}
        {chapters.length >= 6 && <div style={{ marginTop: "2rem", textAlign: "center", fontFamily: "'Cinzel', serif", color: `rgba(${accRgb},0.5)`, fontSize: "0.7rem", letterSpacing: "3px" }}>— THE CASE REMAINS OPEN INDEFINITELY. —</div>}
        {continuing && <div style={{ textAlign: "center", padding: "1.5rem", color: `rgba(${accRgb},0.5)`, fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" }}>Logging session…</div>}
                {error && <div style={{ color: "#FF6060", fontSize: "0.75rem", marginTop: "1rem" }}>Error: {error}</div>}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "740px", margin: "0 auto" }}>
        <button onClick={() => setStep(1)} style={hB}>← BACK</button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", color: acc, letterSpacing: "3px", margin: "0 0 2rem" }}>CONFIGURE THE HANDLER</h1>
        <hS title="HANDLER TYPE" rgb={accRgb}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "0.625rem", marginBottom: "0.875rem" }}>
            {HANDLER_TYPES.map(ht => {
              const sel = handlerType === ht.id;
              return (
                <button key={ht.id} onClick={() => setHandlerType(ht.id)} style={{ background: sel ? `rgba(${accRgb},0.16)` : "rgba(0,0,0,0.4)", border: `1px solid ${sel ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", padding: "0.875rem", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.72rem", color: sel ? acc : "#DDD", marginBottom: "0.3rem" }}>{ht.label}</div>
                  <div style={{ fontSize: "0.6rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Montserrat',sans-serif" }}>{ht.desc}</div>
                </button>
              );
            })}
          </div>
          <input value={handlerName} onChange={e => setHandlerName(e.target.value)} placeholder="Handler's name (optional — leave blank for 'The Handler')" style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.6rem 0.85rem", outline: "none", boxSizing: "border-box" }} />
        </hS>
        <hS title="FACILITY" rgb={accRgb}>
          <div style={hR}>{FACILITIES.map(f => pill(f, facility === f, () => setFacility(f)))}</div>
        </hS>
        <hS title="PRIMARY PROTOCOL" rgb={accRgb}>
          <div style={hR}>{PROTOCOLS.map(p => pill(p, protocol === p, () => setProtocol(p)))}</div>
        </hS>
        {error && <div style={{ color: "#FF6060", fontSize: "0.75rem", marginBottom: "1rem" }}>{error}</div>}
        {/* ── Outfit, Scene & Narrative Controls ── */}
        <OutfitSelector outfitId={outfitId} damage={outfitDamage} onOutfitChange={setOutfitId} onDamageChange={setOutfitDamage} accentColor="#34D399" accentRgb="52,211,153" />
        <div style={{marginTop:"1.25rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"0.875rem"}}>
            <div style={{width:"3px",height:"18px",borderRadius:"2px",background:"linear-gradient(180deg, #34D399, transparent)"}} />
            <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.72rem",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"#34D399"}}>Scene Parameters</span>
            <div style={{flex:1,height:"1px",background:"linear-gradient(90deg, rgba(52,211,153,0.25), transparent)"}} />
            <span style={{fontSize:"0.62rem",color:"rgba(200,195,240,0.3)",fontStyle:"italic"}}>optional</span>
          </div>
          <div style={{background:"rgba(15,10,30,0.5)",border:"1px solid rgba(52,211,153,0.18)",borderRadius:"12px",padding:"1rem",backdropFilter:"blur(8px)"}}>

          <div style={{marginBottom:"0.875rem"}}>
            <div style={{fontSize:"0.57rem",fontFamily:"'Montserrat',sans-serif",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(200,195,240,0.35)",marginBottom:"0.5rem"}}>HANDLER'S RELATIONSHIP TONE</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
              {[{"id":"clinical","icon":"🧪","label":"Clinical Detachment"},{"id":"obsessive","icon":"🌹","label":"Obsessive Attachment"},{"id":"professional","icon":"💼","label":"Professional Ownership"},{"id":"cold","icon":"🧊","label":"Cold Efficiency"}].map((opt:{id:string;icon:string;label:string}) => (<button key={opt.id} onClick={() => setHandlerTone(handlerTone === opt.id ? "" : opt.id)} style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.4rem 0.8rem",borderRadius:"20px",border:`1px solid ${handlerTone === opt.id ? "#34D399" : "rgba(200,195,240,0.15)"}`,background:handlerTone === opt.id ? "rgba(52,211,153,0.16)" : "rgba(255,255,255,0.03)",color:handlerTone === opt.id ? "#34D399" : "rgba(200,195,240,0.55)",fontSize:"0.7rem",fontFamily:"'Montserrat',sans-serif",fontWeight:handlerTone === opt.id ? 700:400,cursor:"pointer",transition:"all 0.18s",minHeight:"36px"}}><span>{opt.icon}</span><span>{opt.label}</span></button>))}
            </div>
          </div>
          <div style={{marginBottom:"0.875rem"}}>
            <div style={{fontSize:"0.57rem",fontFamily:"'Montserrat',sans-serif",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(200,195,240,0.35)",marginBottom:"0.5rem"}}>COMPLIANCE TRACKING METHOD</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
              {[{"id":"logged","icon":"📋","label":"Logged & Filed"},{"id":"verbal","icon":"🎙️","label":"Verbal Reporting"},{"id":"inspection","icon":"🔍","label":"Physical Inspection"},{"id":"behavioral","icon":"👁️","label":"Behavioral Observation"}].map((opt:{id:string;icon:string;label:string}) => (<button key={opt.id} onClick={() => setComplianceTracking(complianceTracking === opt.id ? "" : opt.id)} style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.4rem 0.8rem",borderRadius:"20px",border:`1px solid ${complianceTracking === opt.id ? "#34D399" : "rgba(200,195,240,0.15)"}`,background:complianceTracking === opt.id ? "rgba(52,211,153,0.16)" : "rgba(255,255,255,0.03)",color:complianceTracking === opt.id ? "#34D399" : "rgba(200,195,240,0.55)",fontSize:"0.7rem",fontFamily:"'Montserrat',sans-serif",fontWeight:complianceTracking === opt.id ? 700:400,cursor:"pointer",transition:"all 0.18s",minHeight:"36px"}}><span>{opt.icon}</span><span>{opt.label}</span></button>))}
            </div>
          </div>
          </div>
        </div>
        <UniversalOptions config={universalConfig} onChange={setUniversalConfig} accentColor="#34D399" accentRgb="52,211,153" />
        <StoryLengthPicker value={storyLength} onChange={setStoryLength} accentColor="#34D399" accentRgb="52,211,153" />

        <button onClick={() => { if (canGen) { setStep(3); generate(true); } }} disabled={!canGen} style={{ width: "100%", padding: "1rem", background: canGen ? `rgba(${accRgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${canGen ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: canGen ? acc : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: canGen ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" }}>
          📁 OPEN THE CASE FILE
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
        <button onClick={onBack} style={hB}>← HOME</button>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.2rem,3vw,1.8rem)", color: acc, letterSpacing: "4px", margin: 0 }}>THE HANDLER</h1>
          <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginTop: "0.2rem" }}>NO SUPERVILLAIN. JUST A PROFESSIONAL. JUST PROCEDURES.</div>
        </div>
      </div>
      <hS title="SELECT SUBJECT" rgb={accRgb}>
        <div style={hR}>{HEROINES.map(h => pill(h, heroine === h, () => { setHeroine(h); setCustomHeroine(""); }))}</div>
        <input value={customHeroine} onChange={e => { setCustomHeroine(e.target.value); setHeroine(""); }} placeholder="Or type a custom name…" style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.6rem 0.85rem", outline: "none", boxSizing: "border-box", marginTop: "0.5rem" }} />
      </hS>
      <button onClick={() => { if (canStep2) setStep(2); }} disabled={!canStep2} style={{ width: "100%", padding: "1rem", background: canStep2 ? `rgba(${accRgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${canStep2 ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: canStep2 ? acc : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: canStep2 ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" }}>
        CONFIGURE THE HANDLER →
      </button>
    </div>
  );
}

function hS({ title, children, rgb }: { title: string; children: React.ReactNode; rgb: string }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ borderBottom: `1px solid rgba(${rgb},0.12)`, paddingBottom: "0.4rem", marginBottom: "0.875rem" }}>
        <div style={{ fontSize: "0.55rem", color: `rgba(${rgb},0.6)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif" }}>{title}</div>
      </div>
      {children}
    </div>
  );
}
function hMi({ label, value }: { label: string; value: string }) {
  return <div><div style={{ fontSize: "0.48rem", color: "rgba(212,167,106,0.5)", letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.15rem" }}>{label}</div><div style={{ fontSize: "0.75rem", color: "#EEE", fontFamily: "'Raleway', sans-serif" }}>{value}</div></div>;
}

const hP: React.CSSProperties = { fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1rem", color: "rgba(230,225,255,0.85)", lineHeight: 1.9 };
const hR: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" };
const hB: React.CSSProperties = { background: "transparent", border: "1px solid rgba(212,167,106,0.3)", color: "#D4A76A", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", marginBottom: "2rem" };
const hE: React.CSSProperties = { background: "transparent", border: "1px solid rgba(212,167,106,0.3)", color: "rgba(200,195,225,0.6)", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif" };
