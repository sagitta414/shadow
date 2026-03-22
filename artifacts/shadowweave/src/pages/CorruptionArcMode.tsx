import { useState, useRef, useEffect } from "react";
import { saveStoryToArchive, updateArchiveStory, exportStoryAsTXT, exportStoryAsPDF } from "../lib/archive";

interface Props { onBack: () => void; }

const HEROINES = [
  "Wonder Woman","Black Widow","Supergirl","Scarlet Witch","Captain Marvel","Storm",
  "Black Canary","Zatanna","Batgirl","Jean Grey","Rogue","Psylocke","Emma Frost",
  "Starfire","Raven","Huntress","She-Hulk","Invisible Woman","Power Girl","Stargirl",
  "Gamora","Ahsoka Tano","Rey","Jessica Jones","Silk Spectre","Starlight","Kimiko",
];
const VILLAINS = [
  "Lex Luthor","Thanos","Darkseid","Doctor Doom","Red Skull","Magneto","Loki","Trigon",
  "Baron Zemo","Ra's al Ghul","Sinister","Maxwell Lord","Circe","Enchantress",
  "The Corinthian","The Collector","Killgrave","The Governor","A.I.M. Director",
];
const SETTINGS = [
  "A long-term private facility — he has months to work on her","A hidden throne room — she is kept as his prize",
  "A luxury compound — comfort and pleasure are the weapons","An underground sanctum — ritual and ideology reshape her",
  "A remote monastery — isolation erodes everything she knew","A high-tech conditioning facility — scientific and precise",
  "A living quarters within his own stronghold — intimate and inescapable",
];
const CORRUPTION_METHODS = [
  "Psychological manipulation — love-bombing, gaslighting, manufactured dependency",
  "Pleasure conditioning — her body is rewired to associate him with reward",
  "Ideological corruption — slowly reveals that her 'heroes' were the true villains",
  "Pain and mercy cycles — breaking her will, then offering kindness",
  "Isolation and reframing — stripping away her old identity, building a new one",
  "Arcane ritual — magical corruption that rewires her values from within",
  "Technological conditioning — neural reprogramming she barely notices happening",
  "Emotional dependency — manufactured love that becomes genuine, then weaponised",
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const acc = "#FF69B4";
const accRgb = "255,105,180";

const LOYALTY_STAGES = [
  { min: 85, label: "DEVOTED — Still Heroic", color: "#60D0A0" },
  { min: 68, label: "CRACKING — First Doubts", color: "#A0D040" },
  { min: 51, label: "WAVERING — Halfway Gone", color: "#FFB800" },
  { min: 34, label: "CORRUPTED — Mostly Fallen", color: "#FF9030" },
  { min: 17, label: "NEARLY TURNED — On the Edge", color: "#FF5030" },
  { min: 0,  label: "FALLEN — Side Switched", color: "#FF2020" },
];

function getLoyaltyStage(pct: number) {
  return LOYALTY_STAGES.find(s => pct >= s.min) ?? LOYALTY_STAGES[LOYALTY_STAGES.length - 1];
}

export default function CorruptionArcMode({ onBack }: Props) {
  const [step, setStep] = useState<1|2|3>(1);
  const [heroine, setHeroine] = useState("");
  const [customHeroine, setCustomHeroine] = useState("");
  const [villain, setVillain] = useState("");
  const [customVillain, setCustomVillain] = useState("");
  const [setting, setSetting] = useState("");
  const [corruptionMethod, setCorruptionMethod] = useState("");
  const [customMethod, setCustomMethod] = useState("");
  const [chapters, setChapters] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [continueDir, setContinueDir] = useState("");
  const [savedId, setSavedId] = useState<string|null>(null);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  function stopGeneration() {
    abortRef.current?.abort();
  }

  const fHeroine = customHeroine || heroine;
  const fVillain = customVillain || villain;
  const fMethod = customMethod || corruptionMethod;
  const canGen = fHeroine && fVillain && setting && fMethod;

  const loyalty = Math.max(0, 100 - chapters.length * 17);
  const nextLoyalty = Math.max(0, loyalty - 17);
  const isComplete = loyalty <= 0 || chapters.length >= 7;
  const stage = getLoyaltyStage(loyalty);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  async function generate(isFirst: boolean) {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    if (isFirst) { setLoading(true); setChapters([]); setSavedId(null); }
    else setContinuing(true);
    setStreamingText(""); setError("");
    let final = "";
    try {
      const resp = await fetch(`${BASE}/api/story/corruption-arc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroine: fHeroine, villain: fVillain, setting, corruptionMethod: fMethod, chapters: isFirst ? [] : chapters, continueDir }),
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
        const id = saveStoryToArchive({ title: `${fVillain} Corrupts ${fHeroine}`, universe: "Corruption Arc", tool: "Corruption Arc", characters: [fHeroine, fVillain], chapters: newChapters });
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
    return { id: savedId ?? "tmp", title: `${fVillain} Corrupts ${fHeroine}`, createdAt: Date.now(), universe: "Corruption Arc", tool: "Corruption Arc", characters: [fHeroine, fVillain], chapters, tags: [], favourite: false, wordCount: chapters.join(" ").split(/\s+/).filter(Boolean).length };
  }

  const pill = (label: string, active: boolean, onClick: () => void) => (
    <button key={label} onClick={onClick} style={{ padding: "0.4rem 0.85rem", borderRadius: "20px", border: `1px solid ${active ? acc : `rgba(${accRgb},0.2)`}`, background: active ? `rgba(${accRgb},0.18)` : "transparent", color: active ? acc : "rgba(200,195,225,0.5)", fontSize: "0.72rem", cursor: "pointer", transition: "all 0.2s", fontFamily: "'Raleway', sans-serif" }}>
      {label}
    </button>
  );

  if (step === 3 && chapters.length > 0) {
    const chapterLoyalties = Array.from({ length: chapters.length }, (_, i) => Math.max(0, 100 - i * 17));
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <button onClick={() => { setStep(1); setChapters([]); }} style={btnSt(acc, accRgb)}>← NEW SESSION</button>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: acc, letterSpacing: "3px", margin: 0, flex: 1 }}>CORRUPTION ARC</h1>
          <button onClick={() => exportStoryAsTXT(buildExport())} style={expBt(accRgb)}>TXT</button>
          <button onClick={() => exportStoryAsPDF(buildExport())} style={expBt(accRgb)}>PDF</button>
        </div>

        {/* Loyalty meter */}
        <div style={{ background: "rgba(0,0,0,0.5)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "14px", padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <div>
              <div style={{ fontSize: "0.5rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.2rem" }}>LOYALTY TO HEROISM</div>
              <div style={{ fontSize: "0.68rem", color: stage.color, fontFamily: "'Cinzel', serif", letterSpacing: "1.5px" }}>{stage.label}</div>
            </div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "2rem", fontWeight: 900, color: stage.color, lineHeight: 1 }}>{loyalty}%</div>
          </div>
          <div style={{ height: "8px", background: "rgba(255,255,255,0.07)", borderRadius: "4px", overflow: "hidden", marginBottom: "0.75rem" }}>
            <div style={{ height: "100%", width: `${loyalty}%`, background: `linear-gradient(90deg, ${stage.color}AA, ${stage.color})`, borderRadius: "4px", transition: "width 1.2s ease" }} />
          </div>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            {[[fHeroine,"Heroine"],[fVillain,"Corruptor"],[setting,"Setting"]].map(([v,l]) => (
              <div key={l}><div style={{ fontSize: "0.5rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif" }}>{l}</div><div style={{ fontSize: "0.75rem", color: "#EEE", fontFamily: "'Raleway', sans-serif" }}>{v}</div></div>
            ))}
          </div>
        </div>

        {chapters.map((ch, i) => {
          const chLoyalty = chapterLoyalties[i];
          const chStage = getLoyaltyStage(Math.max(0, chLoyalty - 17));
          return (
            <div key={i}>
              {chapters.length > 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0 1rem" }}>
                  <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.15)` }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", whiteSpace: "nowrap" }}>— CHAPTER {i + 1} —</span>
                    <span style={{ fontSize: "0.55rem", padding: "0.15rem 0.5rem", background: `${chStage.color}22`, border: `1px solid ${chStage.color}55`, borderRadius: "10px", color: chStage.color, fontFamily: "'Cinzel', serif", letterSpacing: "1px", whiteSpace: "nowrap" }}>
                      {Math.max(0, chLoyalty - 17)}% loyalty
                    </span>
                  </div>
                  <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.15)` }} />
                </div>
              )}
              {ch.split("\n").filter(Boolean).map((p, j) => <p key={j} style={proseSt}>{p}</p>)}
            </div>
          );
        })}

        {streamingText && streamingText.split("\n").filter(Boolean).map((p, j) => <p key={j} style={{ ...proseSt, opacity: 0.75 }}>{p}</p>)}
        {(loading || continuing) && (
          <div style={{ textAlign: "center", margin: "1.5rem 0" }}>
            <button onClick={stopGeneration} style={{ padding: "0.45rem 1.4rem", background: "rgba(200,40,40,0.15)", border: `1px solid rgba(200,40,40,0.5)`, borderRadius: "10px", color: "#FF5555", fontFamily: "'Cinzel', serif", fontSize: "0.72rem", letterSpacing: "2px", cursor: "pointer" }}>■ Stop</button>
          </div>
        )}
        <div ref={bottomRef} />

        {!loading && !continuing && !isComplete && (
          <div style={{ marginTop: "2rem", background: "rgba(0,0,0,0.4)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "12px", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.6)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.5rem" }}>
              CHAPTER {chapters.length + 1} — LOYALTY {loyalty}% → ~{nextLoyalty}%
            </div>
            <textarea value={continueDir} onChange={e => setContinueDir(e.target.value)} placeholder="Steer the corruption… (optional)" rows={2} style={textSt(accRgb)} />
            <button onClick={() => generate(false)} style={{ width: "100%", padding: "0.85rem", background: `rgba(${accRgb},0.12)`, border: `1px solid rgba(${accRgb},0.4)`, color: acc, borderRadius: "8px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" }}>
              {continuing ? "CORRUPTING..." : `DEEPEN THE CORRUPTION →`}
            </button>
          </div>
        )}
        {isComplete && (
          <div style={{ marginTop: "2rem", textAlign: "center", padding: "1.5rem", background: "rgba(255,20,20,0.06)", border: "1px solid rgba(255,20,20,0.2)", borderRadius: "12px" }}>
            <div style={{ fontFamily: "'Cinzel', serif", color: "#FF2020", fontSize: "0.75rem", letterSpacing: "3px" }}>— {fHeroine.toUpperCase()} HAS FALLEN —</div>
            <div style={{ fontSize: "0.62rem", color: "rgba(200,195,225,0.4)", marginTop: "0.5rem", fontFamily: "'Raleway', sans-serif" }}>The corruption arc is complete. She serves him now.</div>
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
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", color: acc, letterSpacing: "3px", margin: "2rem 0" }}>CONFIGURE THE FALL</h1>

        <Sec title="VILLAIN / CORRUPTOR" acc={acc} rgb={accRgb}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>{VILLAINS.map(v => pill(v, villain === v, () => { setVillain(v); setCustomVillain(""); }))}</div>
          <input value={customVillain} onChange={e => { setCustomVillain(e.target.value); setVillain(""); }} placeholder="Or type a villain…" style={inSt(accRgb)} />
        </Sec>
        <Sec title="SETTING" acc={acc} rgb={accRgb}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>{SETTINGS.map(s => pill(s, setting === s, () => setSetting(s)))}</div>
        </Sec>
        <Sec title="METHOD OF CORRUPTION" acc={acc} rgb={accRgb}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>{CORRUPTION_METHODS.map(m => pill(m, corruptionMethod === m, () => { setCorruptionMethod(m); setCustomMethod(""); }))}</div>
          <input value={customMethod} onChange={e => { setCustomMethod(e.target.value); setCorruptionMethod(""); }} placeholder="Or describe a custom corruption method…" style={inSt(accRgb)} />
        </Sec>

        {error && <div style={{ color: "#FF6060", fontSize: "0.75rem", marginBottom: "1rem" }}>{error}</div>}
        <button onClick={() => { if (canGen) { setStep(3); generate(true); } }} disabled={!canGen} style={{ width: "100%", padding: "1rem", background: canGen ? `rgba(${accRgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${canGen ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: canGen ? acc : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: canGen ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" }}>
          {loading ? "BEGINNING..." : "BEGIN THE CORRUPTION"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "860px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "3rem" }}>
        <button onClick={onBack} style={btnSt(acc, accRgb)}>← HOME</button>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.3rem,3vw,1.8rem)", color: acc, letterSpacing: "4px", margin: 0 }}>CORRUPTION ARC</h1>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginTop: "0.25rem" }}>LONG-FORM FALL — LOYALTY % METER — UP TO 7 CHAPTERS</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <Sec title="THE HEROINE" acc={acc} rgb={accRgb}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>{HEROINES.map(h => pill(h, heroine === h, () => { setHeroine(h); setCustomHeroine(""); }))}</div>
          <input value={customHeroine} onChange={e => { setCustomHeroine(e.target.value); setHeroine(""); }} placeholder="Or type any heroine name…" style={inSt(accRgb)} />
        </Sec>
        <div>
          <div style={{ background: "rgba(0,0,0,0.4)", border: `1px solid rgba(${accRgb},0.15)`, borderRadius: "12px", padding: "1.25rem", marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.75rem" }}>LOYALTY ARC PREVIEW</div>
            {[100, 83, 66, 49, 32, 15, 0].map((pct, i) => {
              const s = getLoyaltyStage(pct);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
                  <div style={{ fontSize: "0.55rem", color: "rgba(200,195,225,0.35)", fontFamily: "'Cinzel', serif", width: "60px" }}>Ch. {i + 1}</div>
                  <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: s.color, borderRadius: "2px" }} />
                  </div>
                  <div style={{ fontSize: "0.5rem", color: s.color, fontFamily: "'Cinzel', serif", width: "32px", textAlign: "right" }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <button onClick={() => { if (fHeroine) setStep(2); }} disabled={!fHeroine} style={{ marginTop: "2rem", width: "100%", padding: "1rem", background: fHeroine ? `rgba(${accRgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${fHeroine ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: fHeroine ? acc : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: fHeroine ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" }}>
        CHOOSE HER CORRUPTOR →
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
