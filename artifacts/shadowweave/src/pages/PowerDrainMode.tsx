import HeroinePicker from "../components/HeroinePicker";
import ReadingProgressBar from "../components/ReadingProgressBar";
import VillainPicker from "../components/VillainPicker";
import { useState, useRef, useEffect } from "react";
import StoryLengthPicker, { type StoryLength } from "../components/StoryLengthPicker";
import OutfitSelector, { outfitPromptLine } from "../components/OutfitSelector";
import UniversalOptions, { UNIVERSAL_DEFAULTS, universalPromptLines, type UniversalConfig } from "../components/UniversalOptions";
import { getAiProvider } from "../lib/aiProvider";
import { saveStoryToArchive, updateArchiveStory, exportStoryAsTXT, exportStoryAsPDF } from "../lib/archive";
import PsycheMeter, { type PsycheEvent } from "../components/PsycheMeter";

interface Props { onBack: () => void; }


const SETTINGS = [
  "A sterile laboratory designed specifically to contain and drain her",
  "A villain's private arena — an audience watches her weaken",
  "A Kryptonite-laced containment pod",
  "An ancient temple that siphons magical energy",
  "A high-tech dampening field generator chamber",
  "An enchanted dungeon where her powers feed the villain's growing strength",
  "A medical facility — clinical, cold, precise",
];
const DRAIN_METHODS = [
  "Kryptonite radiation (DC heroes)","Power-dampening collar and cuffs","Magic-siphoning ritual",
  "Neural inhibitor implant","Bio-energy extraction harness","Vibranium restraints",
  "Psychic suppression field","Science-based power negator serum","A device built from her own tech",
  "Enchanted artefact designed for her specific powers","Experimental energy drain cannon",
];
const POWER_PRESETS: Record<string,string> = {
  "Wonder Woman": "Super strength, near-invulnerability, combat skill, Lasso of Truth, flight",
  "Supergirl": "Kryptonian strength, flight, heat vision, freeze breath, invulnerability, super speed",
  "Captain Marvel": "Binary energy projection, super strength, flight, energy absorption, near-invulnerability",
  "Storm": "Weather manipulation, flight, lightning strikes, wind control",
  "Jean Grey": "Telepathy, telekinesis, Phoenix force energy",
  "She-Hulk": "Hulk-level strength and durability, rage amplification",
  "Raven": "Soul self projection, dark energy manipulation, empathy, dimensional travel",
  "Scarlet Witch": "Reality warping, chaos magic, probability manipulation",
};

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const acc = "#60A0FF";
const accRgb = "96,160,255";

export default function PowerDrainMode({ onBack }: Props) {
  const [step, setStep] = useState<1|2|3>(1);
  const [heroine, setHeroine] = useState("");
  const [customHeroine, setCustomHeroine] = useState("");
  const [villain, setVillain] = useState("");
  const [customVillain, setCustomVillain] = useState("");
  const [setting, setSetting] = useState("");
  const [powers, setPowers] = useState("");
  const [drainMethod, setDrainMethod] = useState("");
  const [drainLevel, setDrainLevel] = useState(0);
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
    fetch("/api/story/psyche-update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chapterText: _ch.slice(0, 2500), heroineName: fHeroine || undefined, currentSanity: _s, currentResistance: _r }) })
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
  const [powerReturn, setPowerReturn] = useState("");
  const [drainedPowerUse, setDrainedPowerUse] = useState("");
  const [outfitDamage, setOutfitDamage] = useState(0);
  const [storyLength, setStoryLength] = useState<StoryLength>("standard");
  const bottomRef = useRef<HTMLDivElement>(null);

  const fHeroine = customHeroine || heroine;
  const fVillain = customVillain || villain;
  const canGen = fHeroine && fVillain && setting && powers && drainMethod;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  function pickHeroine(h: string) {
    setHeroine(h); setCustomHeroine("");
    if (POWER_PRESETS[h]) setPowers(POWER_PRESETS[h]);
  }

  async function generate(isFirst: boolean) {
    if (isFirst) { setLoading(true); setChapters([]); setSavedId(null); setDrainLevel(0); }
    else setContinuing(true);
    setStreamingText(""); setError("");
    const currentDrain = isFirst ? 0 : Math.min(80, drainLevel + 20);
    try {
      const resp = await fetch(`${BASE}/api/story/power-drain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: getAiProvider(), outfitContext: outfitPromptLine(outfitId, outfitDamage), universalContext: universalPromptLines(universalConfig), modeContext: (() => { const _powerReturnMap: Record<string,string> = {"permanently_gone":"Gone Permanently","slowly_returning":"Slowly Returning","worst_moments":"Return at Worst Moments","traded_away":"Traded Away"};
      const _drainedPowerUseMap: Record<string,string> = {"villain_absorbs":"Absorbs Them","stored_device":"Stored in Device","sold_to_others":"Sold to Others","destroyed":"Destroyed"}; return [powerReturn ? `Power Return: ${_powerReturnMap[powerReturn] ?? powerReturn}` : "", drainedPowerUse ? `What Villain Does With Powers: ${_drainedPowerUseMap[drainedPowerUse] ?? drainedPowerUse}` : ""].filter(Boolean).join("\n"); })(), powerReturn, drainedPowerUse, heroine: fHeroine, villain: fVillain, setting, powers, drainMethod, drainLevel: currentDrain, chapters: isFirst ? [] : chapters, storyLength, continueDir }),
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
      const newDrain = Math.min(100, currentDrain + 20);
      setChapters(newChapters); setDrainLevel(newDrain); setStreamingText(""); setContinueDir("");
      if (isFirst) {
        const id = saveStoryToArchive({ title: `${fVillain} Drains ${fHeroine}`, universe: "Power Drain", tool: "Power Drain Mode", characters: [fHeroine, fVillain], chapters: newChapters });
        setSavedId(id);
      } else if (savedId) {
        updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
      }
    } catch(e) { setError(String(e)); }
    finally { setLoading(false); setContinuing(false); }
  }

  function buildExport() {
    return { id: savedId ?? "tmp", title: `${fVillain} Drains ${fHeroine}`, createdAt: Date.now(), universe: "Power Drain", tool: "Power Drain Mode", characters: [fHeroine, fVillain], chapters, tags: [], favourite: false, wordCount: chapters.join(" ").split(/\s+/).filter(Boolean).length };
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
          <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", color: acc, letterSpacing: "4px", textTransform: "uppercase", animation: "pulse 2s ease-in-out infinite" }}>Initiating the drain…</div>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.4)`, fontFamily: "'Raleway', sans-serif", letterSpacing: "2px" }}>Writing the opening scene</div>
        </div>
      );
    }

    const drainPct = Math.min(100, drainLevel);
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <button onClick={() => { setStep(1); setChapters([]); setDrainLevel(0); }} style={btnSt(acc, accRgb)}>← NEW SESSION</button>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: acc, letterSpacing: "3px", margin: 0, flex: 1 }}>POWER DRAIN MODE</h1>
          <button onClick={() => exportStoryAsTXT(buildExport())} style={expBt(accRgb)}>TXT</button>
          <button onClick={() => exportStoryAsPDF(buildExport())} style={expBt(accRgb)}>PDF</button>
        </div>

        <div style={{ background: `rgba(${accRgb},0.04)`, border: `1px solid rgba(${accRgb},0.15)`, borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", color: `rgba(${accRgb},0.7)`, letterSpacing: "2px" }}>POWER DRAIN LEVEL</span>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: drainPct >= 80 ? "#FF6060" : drainPct >= 50 ? "#FF9640" : acc }}>{drainPct}%</span>
          </div>
          <div style={{ height: "6px", background: "rgba(255,255,255,0.07)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${drainPct}%`, background: drainPct >= 80 ? `linear-gradient(90deg, ${acc}, #FF6060)` : `rgba(${accRgb},0.8)`, borderRadius: "3px", transition: "width 1s ease" }} />
          </div>
          <div style={{ display: "flex", gap: "2rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
            {[[fHeroine,"Captive"],[fVillain,"Villain"],[drainMethod,"Method"]].map(([v,l]) => (
              <div key={l}><div style={{ fontSize: "0.5rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif" }}>{l}</div><div style={{ fontSize: "0.75rem", color: "#EEE", fontFamily: "'Raleway', sans-serif" }}>{v}</div></div>
            ))}
          </div>
        </div>

        <ReadingProgressBar current={chapters.length} max={5} accentColor={acc} accentRgb={accRgb} />


        {psycheLog.length > 0 && <PsycheMeter sanity={psycheSanity} resistance={psycheResistance} log={psycheLog} heroineName={fHeroine || undefined} />}
        {chapters.map((ch, i) => (
          <div key={i}>
            {chapters.length > 1 && <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0 1rem" }}><div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.15)` }} /><span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px" }}>— DRAIN PHASE {i + 1} — {(i + 1) * 20}% SIPHONED —</span><div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.15)` }} /></div>}
            {ch.split("\n").filter(Boolean).map((p, j) => <p key={j} style={proseSt}>{p}</p>)}
          </div>
        ))}
        {streamingText && streamingText.split("\n").filter(Boolean).map((p, j) => <p key={j} style={{ ...proseSt, opacity: 0.75 }}>{p}</p>)}
        <div ref={bottomRef} />
        {!loading && !continuing && drainLevel < 100 && (
          <div style={{ marginTop: "2rem", background: "rgba(0,0,0,0.85)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "12px", padding: "1.5rem", position: "sticky", bottom: "1rem", backdropFilter: "blur(16px)" }}>
            <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.6)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.5rem" }}>NEXT DRAIN PHASE — {Math.min(100, drainLevel + 20)}% TOTAL DRAINED</div>
            <textarea value={continueDir} onChange={e => setContinueDir(e.target.value)} placeholder="Steer the next phase… (optional)" rows={2} style={textSt(accRgb)} />
            <button onClick={() => generate(false)} disabled={continuing} style={{ width: "100%", padding: "0.85rem", background: `rgba(${accRgb},0.12)`, border: `1px solid rgba(${accRgb},0.4)`, color: acc, borderRadius: "8px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" }}>
              {continuing ? "DRAINING..." : "CONTINUE DRAIN →"}
            </button>
          </div>
        )}
        {drainLevel >= 100 && <div style={{ marginTop: "2rem", textAlign: "center", fontFamily: "'Cinzel', serif", color: "#FF6060", fontSize: "0.7rem", letterSpacing: "3px" }}>— FULLY DRAINED — ALL POWER GONE —</div>}
                {error && <div style={{ color: "#FF6060", fontSize: "0.75rem", marginTop: "1rem" }}>Error: {error}</div>}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "680px", margin: "0 auto" }}>
        <button onClick={() => setStep(1)} style={btnSt(acc, accRgb)}>← BACK</button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", color: acc, letterSpacing: "3px", margin: "2rem 0" }}>CONFIGURE THE DRAIN</h1>
        <Sec title="VILLAIN" acc={acc} rgb={accRgb}>
          <VillainPicker value={villain || customVillain} onChange={name => { setVillain(name); setCustomVillain(""); }} accentColor={acc} accentRgb={accRgb} />
        </Sec>
        <Sec title="SETTING" acc={acc} rgb={accRgb}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>{SETTINGS.map(s => pill(s, setting === s, () => setSetting(s)))}</div>
        </Sec>
        <Sec title="HER POWERS (AUTO-FILLED IF PRESET)" acc={acc} rgb={accRgb}>
          <textarea value={powers} onChange={e => setPowers(e.target.value)} placeholder="List her powers, e.g. super strength, flight, energy projection…" rows={3} style={textSt(accRgb)} />
        </Sec>
        <Sec title="DRAIN METHOD" acc={acc} rgb={accRgb}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>{DRAIN_METHODS.map(d => pill(d, drainMethod === d, () => setDrainMethod(d)))}</div>
        </Sec>
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
            <div style={{fontSize:"0.57rem",fontFamily:"'Montserrat',sans-serif",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(200,195,240,0.35)",marginBottom:"0.5rem"}}>DO HER POWERS RETURN?</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
              {[{"id":"permanently_gone","icon":"💀","label":"Gone Permanently"},{"id":"slowly_returning","icon":"📈","label":"Slowly Regenerating"},{"id":"worst_moments","icon":"⚡","label":"Return at Worst Moments"},{"id":"traded_away","icon":"🤝","label":"Traded Away by Her"}].map((opt:{id:string;icon:string;label:string}) => (<button key={opt.id} onClick={() => setPowerReturn(powerReturn === opt.id ? "" : opt.id)} style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.4rem 0.8rem",borderRadius:"20px",border:`1px solid ${powerReturn === opt.id ? "#34D399" : "rgba(200,195,240,0.15)"}`,background:powerReturn === opt.id ? "rgba(52,211,153,0.16)" : "rgba(255,255,255,0.03)",color:powerReturn === opt.id ? "#34D399" : "rgba(200,195,240,0.55)",fontSize:"0.7rem",fontFamily:"'Montserrat',sans-serif",fontWeight:powerReturn === opt.id ? 700:400,cursor:"pointer",transition:"all 0.18s",minHeight:"36px"}}><span>{opt.icon}</span><span>{opt.label}</span></button>))}
            </div>
          </div>
          <div style={{marginBottom:"0.875rem"}}>
            <div style={{fontSize:"0.57rem",fontFamily:"'Montserrat',sans-serif",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(200,195,240,0.35)",marginBottom:"0.5rem"}}>WHAT THE VILLAIN DOES WITH HER POWERS</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
              {[{"id":"villain_absorbs","icon":"👿","label":"Absorbs Them"},{"id":"stored_device","icon":"🔋","label":"Stored in a Device"},{"id":"sold_to_others","icon":"💰","label":"Sold to Others"},{"id":"destroyed","icon":"💥","label":"Destroyed Permanently"}].map((opt:{id:string;icon:string;label:string}) => (<button key={opt.id} onClick={() => setDrainedPowerUse(drainedPowerUse === opt.id ? "" : opt.id)} style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.4rem 0.8rem",borderRadius:"20px",border:`1px solid ${drainedPowerUse === opt.id ? "#34D399" : "rgba(200,195,240,0.15)"}`,background:drainedPowerUse === opt.id ? "rgba(52,211,153,0.16)" : "rgba(255,255,255,0.03)",color:drainedPowerUse === opt.id ? "#34D399" : "rgba(200,195,240,0.55)",fontSize:"0.7rem",fontFamily:"'Montserrat',sans-serif",fontWeight:drainedPowerUse === opt.id ? 700:400,cursor:"pointer",transition:"all 0.18s",minHeight:"36px"}}><span>{opt.icon}</span><span>{opt.label}</span></button>))}
            </div>
          </div>
          </div>
        </div>
        <UniversalOptions config={universalConfig} onChange={setUniversalConfig} accentColor="#34D399" accentRgb="52,211,153" />
        <StoryLengthPicker value={storyLength} onChange={setStoryLength} accentColor="#34D399" accentRgb="52,211,153" />

        <button onClick={() => { if (canGen) { setStep(3); generate(true); } }} disabled={!canGen} style={{ width: "100%", padding: "1rem", background: canGen ? `rgba(${accRgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${canGen ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: canGen ? acc : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: canGen ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" }}>
          {loading ? "INITIATING..." : "BEGIN THE DRAIN"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "860px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "3rem" }}>
        <button onClick={onBack} style={btnSt(acc, accRgb)}>← HOME</button>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.3rem,3vw,1.8rem)", color: acc, letterSpacing: "4px", margin: 0 }}>POWER DRAIN MODE</h1>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginTop: "0.25rem" }}>SYSTEMATIC POWER STRIPPING — 5 PHASES</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <Sec title="TARGET HEROINE" acc={acc} rgb={accRgb}>
          <HeroinePicker value={heroine || customHeroine} onChange={name => { pickHeroine(name); setCustomHeroine(""); }} accentColor={acc} accentRgb={accRgb} />
        </Sec>
        <Sec title="POWER DETAILS (AUTO-FILLS FOR KNOWN HEROINES)" acc={acc} rgb={accRgb}>
          <textarea value={powers} onChange={e => setPowers(e.target.value)} placeholder="Her powers will auto-fill when you pick a known heroine, or type them here…" rows={6} style={{ ...textSt(accRgb), marginBottom: 0 }} />
        </Sec>
      </div>
      <button onClick={() => { if (fHeroine && powers) setStep(2); }} disabled={!fHeroine || !powers} style={{ marginTop: "2rem", width: "100%", padding: "1rem", background: fHeroine && powers ? `rgba(${accRgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${fHeroine && powers ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: fHeroine && powers ? acc : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: fHeroine && powers ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" }}>
        CONFIGURE THE DRAIN →
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
