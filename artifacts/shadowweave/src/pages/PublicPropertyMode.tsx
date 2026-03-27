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
  "Jessica Jones","Leia Organa","Ahsoka Tano","Black Cat","Spider-Woman",
  "Valkyrie","Power Girl","Catwoman","Poison Ivy","Silk Spectre","Hawkgirl",
];
const ORCHESTRATORS = [
  "Lex Luthor","Joker","Red Skull","Baron Zemo","Kingpin","Doctor Doom",
  "Homelander","Darkseid","Magneto","Mephisto","The Collector","Ra's al Ghul",
];
const EXPOSURE_METHODS = [
  "A live broadcast interrupted across every news channel",
  "Leaked files sent throughout the villain underground",
  "Publicly announced at a villain syndicate summit",
  "Posted to every social media platform simultaneously",
  "Printed in criminal underground press with photos",
  "Sent directly to her former teammates as a warning",
  "Displayed across city screens while she watched",
];
const ACCESS_TERMS = [
  "Payment — any criminal who meets the price",
  "Allegiance — proof of loyalty to the orchestrator",
  "Open access — anyone who shows up to the location",
  "Referral only — existing clients vouch for new ones",
  "Timed windows — a new person every hour",
  "Contest — they compete for time with her",
];
const LOCATIONS = [
  "A rented facility — address distributed to clients",
  "His base of operations — visitors are escorted in",
  "Rotating locations — she never knows where she's going",
  "A public-facing venue with a back room",
  "Different client premises — she is delivered to them",
  "An online-accessible location — remote viewing included",
];
const ENCOUNTER_TYPES = [
  "Complete stranger — fan of her heroics",
  "Former villain she once defeated",
  "Criminal client — treats this as a transaction",
  "Someone she used to protect",
  "A former ally — now corrupted",
  "A rival villain collecting on an old grudge",
  "An anonymous figure — identity never revealed",
  "A collector — cold and appraising",
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const acc = "#FBBF24";
const accRgb = "251,191,36";

export default function PublicPropertyMode({ onBack }: Props) {
  const [step, setStep] = useState<1|2|3>(1);
  const [heroine, setHeroine] = useState("");
  const [customHeroine, setCustomHeroine] = useState("");
  const [orchestrator, setOrchestrator] = useState("");
  const [customOrchestrator, setCustomOrchestrator] = useState("");
  const [exposureMethod, setExposureMethod] = useState("");
  const [accessTerms, setAccessTerms] = useState("");
  const [location, setLocation] = useState("");
  const [encounterPool, setEncounterPool] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [continueDir, setContinueDir] = useState("");
  const [savedId, setSavedId] = useState<string|null>(null);
  const [error, setError] = useState("");
  const [outfitId, setOutfitId] = useState("");
  const [universalConfig, setUniversalConfig] = useState<UniversalConfig>(UNIVERSAL_DEFAULTS);
  const [exposureLevel, setExposureLevel] = useState("");
  const [anonymityLevel, setAnonymityLevel] = useState("");
  const [outfitDamage, setOutfitDamage] = useState(0);
  const [storyLength, setStoryLength] = useState<StoryLength>("standard");
  const bottomRef = useRef<HTMLDivElement>(null);

  const fH = customHeroine.trim() || heroine;
  const fO = customOrchestrator.trim() || orchestrator;
  const canStep2 = !!fH;
  const canGen = fH && fO && exposureMethod && accessTerms && location;
  const encounterNum = chapters.length + 1;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  function toggleEncounter(e: string) {
    setEncounterPool(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  }

  async function generate(isFirst: boolean) {
    if (isFirst) { setLoading(true); setChapters([]); setSavedId(null); }
    else setContinuing(true);
    setStreamingText(""); setError("");
    try {
      const resp = await fetch(`${BASE}/api/story/public-property`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: getAiProvider(), outfitContext: outfitPromptLine(outfitId, outfitDamage), universalContext: universalPromptLines(universalConfig), modeContext: (() => { const _exposureLevelMap: Record<string,string> = {"semi_controlled":"Semi-Public / Controlled","fully_public":"Fully Public","identity_partly_known":"Identity Partially Revealed"};
      const _anonymityLevelMap: Record<string,string> = {"fully_masked":"Fully Masked","civilian_name":"Civilian Name Known","hero_identity_exposed":"Hero Identity Exposed"}; return [exposureLevel ? `Exposure Level: ${_exposureLevelMap[exposureLevel] ?? exposureLevel}` : "", anonymityLevel ? `Anonymity: ${_anonymityLevelMap[anonymityLevel] ?? anonymityLevel}` : ""].filter(Boolean).join("\n"); })(), exposureLevel, anonymityLevel, heroine: fH, orchestrator: fO, exposureMethod, accessTerms, location, encounterPool, chapters: isFirst ? [] : chapters, encounterNumber: isFirst ? 1 : encounterNum, storyLength, continueDir }),
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
        const id = saveStoryToArchive({ title: `${fH} — Public Property`, universe: "Public Property", tool: "Public Property", characters: [fH, fO], chapters: newChapters });
        setSavedId(id);
      } else if (savedId) {
        updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
      }
    } catch(e) { setError(String(e)); }
    finally { setLoading(false); setContinuing(false); }
  }

  function buildExport() {
    return { id: savedId ?? "tmp", title: `${fH} — Public Property`, createdAt: Date.now(), universe: "Public Property", tool: "Public Property", characters: [fH, fO], chapters, tags: [], favourite: false, wordCount: chapters.join(" ").split(/\s+/).filter(Boolean).length };
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
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", color: acc, letterSpacing: "4px", animation: "pulse 2s ease-in-out infinite" }}>The word is spreading…</div>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.4)`, fontFamily: "'Raleway', sans-serif", letterSpacing: "2px" }}>First Encounter Incoming</div>
        </div>
      );
    }

    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "880px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <button onClick={() => { setStep(1); setChapters([]); }} style={backBtn}>← NEW SUBJECT</button>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: acc, letterSpacing: "3px", margin: 0, flex: 1 }}>PUBLIC PROPERTY</h1>
          <button onClick={() => exportStoryAsTXT(buildExport())} style={exportBtn}>TXT</button>
          <button onClick={() => exportStoryAsPDF(buildExport())} style={exportBtn}>PDF</button>
        </div>

        <div style={{ background: `rgba(${accRgb},0.05)`, border: `1px solid rgba(${accRgb},0.15)`, borderRadius: "12px", padding: "0.875rem 1.25rem", marginBottom: "2rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <MetaItem label="SUBJECT" value={fH} rgb={accRgb} />
          <MetaItem label="ARRANGED BY" value={fO} rgb={accRgb} />
          <MetaItem label="ENCOUNTERS" value={`${chapters.length} so far`} rgb={accRgb} />
          <MetaItem label="ACCESS" value={accessTerms} rgb={accRgb} />
        </div>

        {chapters.map((ch, i) => (
          <div key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0 1.25rem" }}>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", color: `rgba(${accRgb},0.55)`, letterSpacing: "3px" }}>ENCOUNTER {i + 1}</span>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
            </div>
            <p style={prosestyle}>{ch}</p>
          </div>
        ))}
        {streamingText && <p style={{ ...prosestyle, opacity: 0.85 }}>{streamingText}</p>}
        <div ref={bottomRef} />

        {!loading && !continuing && chapters.length < 6 && (
          <div style={{ marginTop: "2rem", background: "rgba(0,0,0,0.4)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "12px", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.6)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.5rem" }}>ENCOUNTER {encounterNum}</div>
            <textarea value={continueDir} onChange={e => setContinueDir(e.target.value)} placeholder="Describe this visitor or what happens… (optional — e.g. 'a former villain she defeated', 'someone she once saved')" rows={2} style={taStyle} />
            <button onClick={() => generate(false)} disabled={continuing} style={continueBtn(accRgb, acc)}>
              {continuing ? "ARRIVING…" : "🔓 NEXT ENCOUNTER"}
            </button>
          </div>
        )}
        {chapters.length >= 6 && <div style={endLabel(accRgb)}>— THEY KEEP COMING. SHE IS PUBLIC PROPERTY. —</div>}
        {continuing && <div style={loadLabel(accRgb)}>Another one approaches…</div>}
                {error && <div style={errStyle}>Error: {error}</div>}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "720px", margin: "0 auto" }}>
        <button onClick={() => setStep(1)} style={backBtn}>← BACK</button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", color: acc, letterSpacing: "3px", margin: "0 0 2rem" }}>CONFIGURE THE TERMS</h1>

        <Section title="ORCHESTRATING VILLAIN" rgb={accRgb}>
          <div style={pillRow}>{ORCHESTRATORS.map(o => pill(o, orchestrator === o, () => { setOrchestrator(o); setCustomOrchestrator(""); }))}</div>
          <input value={customOrchestrator} onChange={e => { setCustomOrchestrator(e.target.value); setOrchestrator(""); }} placeholder="Or type any villain…" style={inputStyle} />
        </Section>
        <Section title="HOW HER IDENTITY WAS EXPOSED" rgb={accRgb}>
          <div style={pillRow}>{EXPOSURE_METHODS.map(e => pill(e, exposureMethod === e, () => setExposureMethod(e)))}</div>
        </Section>
        <Section title="ACCESS TERMS" rgb={accRgb}>
          <div style={pillRow}>{ACCESS_TERMS.map(a => pill(a, accessTerms === a, () => setAccessTerms(a)))}</div>
        </Section>
        <Section title="LOCATION" rgb={accRgb}>
          <div style={pillRow}>{LOCATIONS.map(l => pill(l, location === l, () => setLocation(l)))}</div>
        </Section>
        <Section title="ENCOUNTER POOL" rgb={accRgb} subtitle="(optional — types of visitors AI will draw from)">
          <div style={pillRow}>{ENCOUNTER_TYPES.map(e => pill(e, encounterPool.includes(e), () => toggleEncounter(e)))}</div>
        </Section>

        {error && <div style={errStyle}>{error}</div>}
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
            <div style={{fontSize:"0.57rem",fontFamily:"'Montserrat',sans-serif",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(200,195,240,0.35)",marginBottom:"0.5rem"}}>EXPOSURE LEVEL</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
              {[{"id":"semi_controlled","icon":"🔒","label":"Semi-Public / Controlled"},{"id":"fully_public","icon":"🌍","label":"Fully Public"},{"id":"identity_partly_known","icon":"🎭","label":"Identity Partially Revealed"}].map((opt:{id:string;icon:string;label:string}) => (<button key={opt.id} onClick={() => setExposureLevel(exposureLevel === opt.id ? "" : opt.id)} style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.4rem 0.8rem",borderRadius:"20px",border:`1px solid ${exposureLevel === opt.id ? "#F87171" : "rgba(200,195,240,0.15)"}`,background:exposureLevel === opt.id ? "rgba(248,113,113,0.16)" : "rgba(255,255,255,0.03)",color:exposureLevel === opt.id ? "#F87171" : "rgba(200,195,240,0.55)",fontSize:"0.7rem",fontFamily:"'Montserrat',sans-serif",fontWeight:exposureLevel === opt.id ? 700:400,cursor:"pointer",transition:"all 0.18s",minHeight:"36px"}}><span>{opt.icon}</span><span>{opt.label}</span></button>))}
            </div>
          </div>
          <div style={{marginBottom:"0.875rem"}}>
            <div style={{fontSize:"0.57rem",fontFamily:"'Montserrat',sans-serif",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(200,195,240,0.35)",marginBottom:"0.5rem"}}>IDENTITY ANONYMITY</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
              {[{"id":"fully_masked","icon":"😷","label":"Fully Masked"},{"id":"civilian_name","icon":"📋","label":"Civilian Name Known"},{"id":"hero_identity_exposed","icon":"💥","label":"Hero Identity Exposed"}].map((opt:{id:string;icon:string;label:string}) => (<button key={opt.id} onClick={() => setAnonymityLevel(anonymityLevel === opt.id ? "" : opt.id)} style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.4rem 0.8rem",borderRadius:"20px",border:`1px solid ${anonymityLevel === opt.id ? "#F87171" : "rgba(200,195,240,0.15)"}`,background:anonymityLevel === opt.id ? "rgba(248,113,113,0.16)" : "rgba(255,255,255,0.03)",color:anonymityLevel === opt.id ? "#F87171" : "rgba(200,195,240,0.55)",fontSize:"0.7rem",fontFamily:"'Montserrat',sans-serif",fontWeight:anonymityLevel === opt.id ? 700:400,cursor:"pointer",transition:"all 0.18s",minHeight:"36px"}}><span>{opt.icon}</span><span>{opt.label}</span></button>))}
            </div>
          </div>
          </div>
        </div>
        <UniversalOptions config={universalConfig} onChange={setUniversalConfig} accentColor="#F87171" accentRgb="248,113,113" />
        <StoryLengthPicker value={storyLength} onChange={setStoryLength} accentColor="#F87171" accentRgb="248,113,113" />

        <button onClick={() => { if (canGen) { setStep(3); generate(true); } }} disabled={!canGen} style={primBtn(canGen, accRgb, acc)}>
          {loading ? "SPREADING THE WORD…" : "🔓 OPEN THE DOORS"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
        <button onClick={onBack} style={backBtn}>← HOME</button>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.2rem,3vw,1.8rem)", color: acc, letterSpacing: "4px", margin: 0 }}>PUBLIC PROPERTY</h1>
          <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginTop: "0.2rem" }}>IDENTITY EXPOSED — ANYONE CAN COME</div>
        </div>
      </div>
      <Section title="SELECT HEROINE" rgb={accRgb}>
        <div style={pillRow}>{HEROINES.map(h => pill(h, heroine === h, () => { setHeroine(h); setCustomHeroine(""); }))}</div>
        <input value={customHeroine} onChange={e => { setCustomHeroine(e.target.value); setHeroine(""); }} placeholder="Or type a custom name…" style={inputStyle} />
      </Section>
      <button onClick={() => { if (canStep2) setStep(2); }} disabled={!canStep2} style={primBtn(canStep2, accRgb, acc)}>
        CONFIGURE THE TERMS →
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
function MetaItem({ label, value, rgb }: { label: string; value: string; rgb: string }) {
  return <div><div style={{ fontSize: "0.5rem", color: `rgba(${rgb},0.5)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.2rem" }}>{label}</div><div style={{ fontSize: "0.78rem", color: "#EEE", fontFamily: "'Raleway', sans-serif", maxWidth: "200px" }}>{value}</div></div>;
}

const prosestyle: React.CSSProperties = { fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1rem", color: "rgba(230,225,255,0.85)", lineHeight: 1.9 };
const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.6rem 0.85rem", outline: "none", boxSizing: "border-box", marginTop: "0.5rem" };
const pillRow: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" };
const taStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.82rem", padding: "0.75rem", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" };
const backBtn: React.CSSProperties = { background: "transparent", border: "1px solid rgba(251,191,36,0.3)", color: "#FBBF24", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", marginBottom: "2rem" };
const exportBtn: React.CSSProperties = { background: "transparent", border: "1px solid rgba(251,191,36,0.3)", color: "rgba(200,195,225,0.6)", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif" };
const primBtn = (active: boolean, rgb: string, ac: string): React.CSSProperties => ({ width: "100%", padding: "1rem", background: active ? `rgba(${rgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${active ? `rgba(${rgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: active ? ac : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: active ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" });
const continueBtn = (rgb: string, ac: string): React.CSSProperties => ({ width: "100%", padding: "0.85rem", background: `rgba(${rgb},0.14)`, border: `1px solid rgba(${rgb},0.45)`, color: ac, borderRadius: "8px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" });
const endLabel = (rgb: string): React.CSSProperties => ({ marginTop: "2rem", textAlign: "center", fontFamily: "'Cinzel', serif", color: `rgba(${rgb},0.5)`, fontSize: "0.7rem", letterSpacing: "3px" });
const loadLabel = (rgb: string): React.CSSProperties => ({ textAlign: "center", padding: "1.5rem", color: `rgba(${rgb},0.5)`, fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" });
const errStyle: React.CSSProperties = { color: "#FF6060", fontSize: "0.75rem", marginTop: "1rem", fontFamily: "'Raleway', sans-serif" };
