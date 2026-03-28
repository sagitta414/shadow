import HeroinePicker from "../components/HeroinePicker";
import ReadingProgressBar from "../components/ReadingProgressBar";
import VillainPicker from "../components/VillainPicker";
import { useState, useRef, useEffect } from "react";
import StoryLengthPicker, { type StoryLength } from "../components/StoryLengthPicker";
import OutfitSelector, { outfitPromptLine } from "../components/OutfitSelector";
import UniversalOptions, { UNIVERSAL_DEFAULTS, universalPromptLines, type UniversalConfig } from "../components/UniversalOptions";
import { getAiProvider } from "../lib/aiProvider";
import { saveStoryToArchive, updateArchiveStory, exportStoryAsTXT, exportStoryAsPDF } from "../lib/archive";
import { VILLAINS } from "../lib/villains";

interface Props { onBack: () => void; }



const TRANSFER_TYPES = [
  "Sold — financial transaction, no questions asked",
  "Won — the prize in a bet or contest",
  "Gifted — a favour, a payment, an alliance gesture",
  "Stolen — the new captor took her without permission",
  "Forced handoff — the previous captor was compromised",
  "Loaned — temporary, supposedly returned after use",
  "Auctioned — highest bidder, among a small group",
];
const FIRST_SETTINGS = [
  "A hidden transfer point — loading dock, no witnesses",
  "The original captor's stronghold",
  "A neutral criminal location — mid-point between territories",
  "Delivered directly to the new captor's residence",
  "A vehicle — she arrives not knowing where she's going",
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const acc = "#94A3B8";
const accRgb = "148,163,184";

export default function ChainOfCustodyMode({ onBack }: Props) {
  const [step, setStep] = useState<1|2|3>(1);
  const [heroine, setHeroine] = useState("");
  const [customHeroine, setCustomHeroine] = useState("");
  const [firstCaptor, setFirstCaptor] = useState("");
  const [transferType, setTransferType] = useState("");
  const [firstSetting, setFirstSetting] = useState("");
  const [chain, setChain] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [nextCaptor, setNextCaptor] = useState("");
  const [customNext, setCustomNext] = useState("");
  const [savedId, setSavedId] = useState<string|null>(null);
  const [error, setError] = useState("");
  const [outfitId, setOutfitId] = useState("");
  const [universalConfig, setUniversalConfig] = useState<UniversalConfig>(UNIVERSAL_DEFAULTS);
  const [transferMethod, setTransferMethod] = useState("");
  const [conditionsProgression, setConditionsProgression] = useState("");
  const [outfitDamage, setOutfitDamage] = useState(0);
  const [storyLength, setStoryLength] = useState<StoryLength>("standard");
  const bottomRef = useRef<HTMLDivElement>(null);

  const fH = customHeroine.trim() || heroine;
  const canStep2 = !!fH;
  const canGen = fH && firstCaptor && transferType && firstSetting;
  const currentOwner = chain[chain.length - 1] ?? firstCaptor;
  const fNext = customNext.trim() || nextCaptor;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  async function generate(isFirst: boolean) {
    if (isFirst) { setLoading(true); setChapters([]); setChain([firstCaptor]); setSavedId(null); }
    else setContinuing(true);
    setStreamingText(""); setError("");
    const newChain = isFirst ? [firstCaptor] : [...chain, fNext || "AI-chosen captor"];
    try {
      const resp = await fetch(`${BASE}/api/story/chain-of-custody`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: getAiProvider(), outfitContext: outfitPromptLine(outfitId, outfitDamage), universalContext: universalPromptLines(universalConfig), modeContext: (() => { const _transferMethodMap: Record<string,string> = {"sold":"Sold","traded":"Traded","gifted":"Gifted","stolen":"Stolen","won_bet":"Won in a Bet","extortion":"Extortion Payment"};
      const _conditionsProgressionMap: Record<string,string> = {"steadily_worse":"Steadily Worse","unpredictable":"Unpredictable","briefly_better":"Brief Reprieve Then Worse","escalating":"Rapidly Escalating"}; return [transferMethod ? `Transfer Method: ${_transferMethodMap[transferMethod] ?? transferMethod}` : "", conditionsProgression ? `Conditions Progression: ${_conditionsProgressionMap[conditionsProgression] ?? conditionsProgression}` : ""].filter(Boolean).join("\n"); })(), transferMethod, conditionsProgression, heroine: fH, currentCaptor: isFirst ? firstCaptor : (fNext || ""), previousChain: isFirst ? [] : chain, transferType, firstSetting, storyLength, chapters: isFirst ? [] : chapters, chapterNumber: isFirst ? 1 : chapters.length + 1 }),
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
      setChapters(newChapters);
      if (!isFirst) setChain(newChain);
      setStreamingText(""); setNextCaptor(""); setCustomNext("");
      if (isFirst) {
        const id = saveStoryToArchive({ title: `${fH} — Chain of Custody`, universe: "Chain of Custody", tool: "Chain of Custody", characters: [fH, firstCaptor], storyLength, chapters: newChapters });
        setSavedId(id);
      } else if (savedId) {
        updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
      }
    } catch(e) { setError(String(e)); }
    finally { setLoading(false); setContinuing(false); }
  }

  function buildExport() {
    return { id: savedId ?? "tmp", title: `${fH} — Chain of Custody`, createdAt: Date.now(), universe: "Chain of Custody", tool: "Chain of Custody", characters: [fH, ...chain], chapters, tags: [], favourite: false, wordCount: chapters.join(" ").split(/\s+/).filter(Boolean).length };
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
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", color: acc, letterSpacing: "4px", animation: "pulse 2s ease-in-out infinite" }}>The transfer is arranged…</div>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.4)`, fontFamily: "'Raleway', sans-serif", letterSpacing: "2px" }}>First Captor: {firstCaptor}</div>
        </div>
      );
    }
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <button onClick={() => { setStep(1); setChapters([]); setChain([]); }} style={bB(acc, accRgb)}>← NEW</button>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: acc, letterSpacing: "3px", margin: 0, flex: 1 }}>CHAIN OF CUSTODY</h1>
          <button onClick={() => exportStoryAsTXT(buildExport())} style={eB(accRgb)}>TXT</button>
          <button onClick={() => exportStoryAsPDF(buildExport())} style={eB(accRgb)}>PDF</button>
        </div>

        {/* Chain tracker */}
        <div style={{ background: `rgba(${accRgb},0.06)`, border: `1px solid rgba(${accRgb},0.18)`, borderRadius: "12px", padding: "1rem 1.5rem", marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.5rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginBottom: "0.75rem" }}>CHAIN OF CUSTODY — {fH.toUpperCase()}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {chain.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ background: i === chain.length - 1 ? `rgba(${accRgb},0.18)` : "rgba(0,0,0,0.3)", border: `1px solid ${i === chain.length - 1 ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.08)"}`, borderRadius: "8px", padding: "0.35rem 0.75rem" }}>
                  <div style={{ fontSize: "0.6rem", color: i === chain.length - 1 ? acc : "rgba(200,195,225,0.4)", fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>{c}</div>
                  <div style={{ fontSize: "0.48rem", color: "rgba(200,195,225,0.25)", fontFamily: "'Raleway', sans-serif" }}>Chapter {i + 1}</div>
                </div>
                {i < chain.length - 1 && <div style={{ color: `rgba(${accRgb},0.3)`, fontSize: "0.8rem" }}>→</div>}
              </div>
            ))}
            <div style={{ color: `rgba(${accRgb},0.2)`, fontSize: "0.8rem" }}>→ ?</div>
          </div>
        </div>

        <ReadingProgressBar current={chapters.length} max={5} accentColor={acc} accentRgb={accRgb} />


        {chapters.map((ch, i) => (
          <div key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0 1.25rem" }}>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", color: `rgba(${accRgb},0.55)`, letterSpacing: "3px" }}>OWNER {i+1}: {chain[i]?.toUpperCase()}</span>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
            </div>
            <p style={ps}>{ch}</p>
            <div style={{ fontSize: "0.58rem", color: `rgba(${accRgb},0.3)`, fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px", textAlign: "right", marginTop: "-0.5rem", marginBottom: "0.5rem" }}>{ch.split(/\s+/).filter(Boolean).length.toLocaleString()} words</div>
          </div>
        ))}
        {streamingText && <p style={{ ...ps, opacity: 0.85 }}>{streamingText}</p>}
        <div ref={bottomRef} />

        {!loading && !continuing && chapters.length < 6 && (
          <div style={{ marginTop: "2rem", background: "rgba(0,0,0,0.85)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "12px", padding: "1.5rem", position: "sticky", bottom: "1rem", backdropFilter: "blur(16px)" }}>
            <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.6)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.875rem" }}>NEXT TRANSFER — WHO TAKES HER NOW?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
              {VILLAINS.filter(v => !chain.includes(v)).slice(0, 14).map(v => (
                <button key={v} onClick={() => { setNextCaptor(v); setCustomNext(""); }} style={{ padding: "0.35rem 0.75rem", borderRadius: "20px", border: `1px solid ${nextCaptor === v ? acc : "rgba(255,255,255,0.08)"}`, background: nextCaptor === v ? `rgba(${accRgb},0.18)` : "transparent", color: nextCaptor === v ? acc : "rgba(200,195,225,0.4)", fontSize: "0.68rem", cursor: "pointer", fontFamily: "'Raleway', sans-serif" }}>{v}</button>
              ))}
            </div>
            <input value={customNext} onChange={e => { setCustomNext(e.target.value); setNextCaptor(""); }} placeholder="Or type any name — or leave blank for AI to choose…" style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.6rem 0.85rem", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" }} />
            <button onClick={() => generate(false)} disabled={continuing} style={{ width: "100%", padding: "0.85rem", background: `rgba(${accRgb},0.14)`, border: `1px solid rgba(${accRgb},0.45)`, color: acc, borderRadius: "8px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" }}>
              {continuing ? "TRANSFER IN PROGRESS…" : `🔗 TRANSFER TO ${(fNext || "NEXT CAPTOR").toUpperCase()}`}
            </button>
          </div>
        )}
        {chapters.length >= 6 && <div style={{ marginTop: "2rem", textAlign: "center", fontFamily: "'Cinzel', serif", color: `rgba(${accRgb},0.5)`, fontSize: "0.7rem", letterSpacing: "3px" }}>— THE CHAIN EXTENDS INDEFINITELY. —</div>}
        {continuing && <div style={{ textAlign: "center", padding: "1.5rem", color: `rgba(${accRgb},0.5)`, fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" }}>Transfer in progress…</div>}
                {error && <div style={{ color: "#FF6060", fontSize: "0.75rem", marginTop: "1rem" }}>Error: {error}</div>}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "720px", margin: "0 auto" }}>
        <button onClick={() => setStep(1)} style={bB(acc, accRgb)}>← BACK</button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", color: acc, letterSpacing: "3px", margin: "0 0 2rem" }}>CONFIGURE THE CHAIN</h1>
        <Sec title="FIRST CAPTOR" rgb={accRgb}>
          <VillainPicker value={firstCaptor} onChange={name => setFirstCaptor(name)} accentColor={acc} accentRgb={accRgb} />
        </Sec>
        <Sec title="HOW SHE IS TRANSFERRED" rgb={accRgb}>
          <div style={prw}>{TRANSFER_TYPES.map(t => pill(t, transferType === t, () => setTransferType(t)))}</div>
        </Sec>
        <Sec title="INITIAL SETTING" rgb={accRgb}>
          <div style={prw}>{FIRST_SETTINGS.map(s => pill(s, firstSetting === s, () => setFirstSetting(s)))}</div>
        </Sec>
        {error && <div style={{ color: "#FF6060", fontSize: "0.75rem", marginBottom: "1rem" }}>{error}</div>}
        {/* ── Outfit, Scene & Narrative Controls ── */}
        <OutfitSelector outfitId={outfitId} damage={outfitDamage} onOutfitChange={setOutfitId} onDamageChange={setOutfitDamage} accentColor="#38BDF8" accentRgb="56,189,248" />
        <div style={{marginTop:"1.25rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"0.875rem"}}>
            <div style={{width:"3px",height:"18px",borderRadius:"2px",background:"linear-gradient(180deg, #38BDF8, transparent)"}} />
            <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.72rem",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"#38BDF8"}}>Scene Parameters</span>
            <div style={{flex:1,height:"1px",background:"linear-gradient(90deg, rgba(56,189,248,0.25), transparent)"}} />
            <span style={{fontSize:"0.62rem",color:"rgba(200,195,240,0.3)",fontStyle:"italic"}}>optional</span>
          </div>
          <div style={{background:"rgba(15,10,30,0.5)",border:"1px solid rgba(56,189,248,0.18)",borderRadius:"12px",padding:"1rem",backdropFilter:"blur(8px)"}}>

          <div style={{marginBottom:"0.875rem"}}>
            <div style={{fontSize:"0.57rem",fontFamily:"'Montserrat',sans-serif",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(200,195,240,0.35)",marginBottom:"0.5rem"}}>TRANSFER METHOD</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
              {[{"id":"sold","icon":"💸","label":"Sold"},{"id":"traded","icon":"🔄","label":"Traded"},{"id":"gifted","icon":"🎁","label":"Gifted"},{"id":"stolen","icon":"🌑","label":"Stolen"},{"id":"won_bet","icon":"🎲","label":"Won in a Bet"},{"id":"extortion","icon":"📜","label":"Extortion Payment"}].map((opt:{id:string;icon:string;label:string}) => (<button key={opt.id} onClick={() => setTransferMethod(transferMethod === opt.id ? "" : opt.id)} style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.4rem 0.8rem",borderRadius:"20px",border:`1px solid ${transferMethod === opt.id ? "#38BDF8" : "rgba(200,195,240,0.15)"}`,background:transferMethod === opt.id ? "rgba(56,189,248,0.16)" : "rgba(255,255,255,0.03)",color:transferMethod === opt.id ? "#38BDF8" : "rgba(200,195,240,0.55)",fontSize:"0.7rem",fontFamily:"'Montserrat',sans-serif",fontWeight:transferMethod === opt.id ? 700:400,cursor:"pointer",transition:"all 0.18s",minHeight:"36px"}}><span>{opt.icon}</span><span>{opt.label}</span></button>))}
            </div>
          </div>
          <div style={{marginBottom:"0.875rem"}}>
            <div style={{fontSize:"0.57rem",fontFamily:"'Montserrat',sans-serif",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(200,195,240,0.35)",marginBottom:"0.5rem"}}>CONDITIONS ACROSS THE CHAIN</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
              {[{"id":"steadily_worse","icon":"📉","label":"Steadily Worse"},{"id":"unpredictable","icon":"🌀","label":"Unpredictable"},{"id":"briefly_better","icon":"📈","label":"Brief Reprieve Then Worse"},{"id":"escalating","icon":"🔥","label":"Rapidly Escalating"}].map((opt:{id:string;icon:string;label:string}) => (<button key={opt.id} onClick={() => setConditionsProgression(conditionsProgression === opt.id ? "" : opt.id)} style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.4rem 0.8rem",borderRadius:"20px",border:`1px solid ${conditionsProgression === opt.id ? "#38BDF8" : "rgba(200,195,240,0.15)"}`,background:conditionsProgression === opt.id ? "rgba(56,189,248,0.16)" : "rgba(255,255,255,0.03)",color:conditionsProgression === opt.id ? "#38BDF8" : "rgba(200,195,240,0.55)",fontSize:"0.7rem",fontFamily:"'Montserrat',sans-serif",fontWeight:conditionsProgression === opt.id ? 700:400,cursor:"pointer",transition:"all 0.18s",minHeight:"36px"}}><span>{opt.icon}</span><span>{opt.label}</span></button>))}
            </div>
          </div>
          </div>
        </div>
        <UniversalOptions config={universalConfig} onChange={setUniversalConfig} accentColor="#38BDF8" accentRgb="56,189,248" />
        <StoryLengthPicker value={storyLength} onChange={setStoryLength} accentColor="#38BDF8" accentRgb="56,189,248" />

        <button onClick={() => { if (canGen) { setStep(3); generate(true); } }} disabled={!canGen} style={pB(canGen, accRgb, acc)}>
          🔗 BEGIN THE CHAIN
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
        <button onClick={onBack} style={bB(acc, accRgb)}>← HOME</button>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.2rem,3vw,1.8rem)", color: acc, letterSpacing: "4px", margin: 0 }}>CHAIN OF CUSTODY</h1>
          <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginTop: "0.2rem" }}>DIFFERENT OWNER EVERY CHAPTER — YOU CHOOSE WHO'S NEXT</div>
        </div>
      </div>
      <Sec title="SELECT SUBJECT" rgb={accRgb}>
        <HeroinePicker value={heroine || customHeroine} onChange={name => { setHeroine(name); setCustomHeroine(""); }} accentColor={acc} accentRgb={accRgb} />
      </Sec>
      <button onClick={() => { if (canStep2) setStep(2); }} disabled={!canStep2} style={pB(canStep2, accRgb, acc)}>CONFIGURE THE CHAIN →</button>
    </div>
  );
}

function Sec({ title, subtitle, children, rgb }: { title: string; subtitle?: string; children: React.ReactNode; rgb: string }) {
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

const ps: React.CSSProperties = { fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1rem", color: "rgba(230,225,255,0.85)", lineHeight: 1.9 };
const prw: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" };
const bB = (ac: string, rgb: string): React.CSSProperties => ({ background: "transparent", border: `1px solid rgba(${rgb},0.3)`, color: ac, borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", marginBottom: "2rem" });
const eB = (rgb: string): React.CSSProperties => ({ background: "transparent", border: `1px solid rgba(${rgb},0.3)`, color: "rgba(200,195,225,0.6)", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif" });
const pB = (active: boolean, rgb: string, ac: string): React.CSSProperties => ({ width: "100%", padding: "1rem", background: active ? `rgba(${rgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${active ? `rgba(${rgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: active ? ac : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: active ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" });
