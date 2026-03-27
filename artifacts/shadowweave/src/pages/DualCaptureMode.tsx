import { useState, useRef, useEffect } from "react";
import { getAiProvider } from "../lib/aiProvider";
import { saveStoryToArchive, updateArchiveStory, exportStoryAsTXT, exportStoryAsPDF } from "../lib/archive";

interface Props { onBack: () => void; }

const HEROINES = [
  "Wonder Woman","Black Widow","Supergirl","Scarlet Witch","Captain Marvel","Storm",
  "Black Canary","Zatanna","Batgirl","Catwoman","Jean Grey","Rogue","Psylocke","Emma Frost",
  "Starlight","Kimiko","Silk Spectre","Starfire","Raven","Huntress","She-Hulk","Invisible Woman",
  "Jessica Jones","Daenerys Targaryen","Sansa Stark","Leia Organa","Ahsoka Tano","Rey",
];
const VILLAINS = [
  "Lex Luthor","Joker","Red Skull","Baron Zemo","Loki","Thanos","Deathstroke","Ra's al Ghul",
  "HYDRA Commander","Sinister","Magneto","Doctor Doom","Homelander","Black Noir","Gorilla Grodd",
  "Darkseid","Trigon","Enchantress","Maxwell Lord","Circe","Ares","The Collector",
];
const SETTINGS = [
  "A hidden fortress — no way out","A luxury prison above the clouds",
  "An underground arena","A deserted island compound","A stolen S.H.I.E.L.D. helicarrier bay",
  "A dungeon beneath a conquered city","A bunker surviving a warzone above",
];
const DYNAMICS = [
  "Allies who protect each other fiercely",
  "Former rivals forced together by circumstance",
  "One is stronger — she shields the other instinctively",
  "They are used against each other — compliance for mercy",
  "One breaks first and is made to help break the other",
  "Deep trust — but the villain exploits their bond as a weapon",
  "Strangers — they must build trust fast or both fall",
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const acc = "#40E090";
const accRgb = "64,224,144";

export default function DualCaptureMode({ onBack }: Props) {
  const [step, setStep] = useState<1|2|3>(1);
  const [heroine1, setHeroine1] = useState("");
  const [heroine2, setHeroine2] = useState("");
  const [customH1, setCustomH1] = useState("");
  const [customH2, setCustomH2] = useState("");
  const [villain, setVillain] = useState("");
  const [customVillain, setCustomVillain] = useState("");
  const [setting, setSetting] = useState("");
  const [dynamic, setDynamic] = useState("");
  const [chapters, setChapters] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [continueDir, setContinueDir] = useState("");
  const [savedId, setSavedId] = useState<string|null>(null);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const fH1 = customH1 || heroine1;
  const fH2 = customH2 || heroine2;
  const fV = customVillain || villain;
  const canGen = fH1 && fH2 && fV && setting && dynamic;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  async function generate(isFirst: boolean) {
    if (isFirst) { setLoading(true); setChapters([]); setSavedId(null); }
    else setContinuing(true);
    setStreamingText(""); setError("");
    try {
      const resp = await fetch(`${BASE}/api/story/dual-capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: getAiProvider(), heroine1: fH1, heroine2: fH2, villain: fV, setting, dynamic, chapters: isFirst ? [] : chapters, continueDir }),
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
        const id = saveStoryToArchive({ title: `${fH1} & ${fH2} — ${fV}'s Cell`, universe: "Dual Capture", tool: "Two Heroines One Cell", characters: [fH1, fH2, fV], chapters: newChapters });
        setSavedId(id);
      } else if (savedId) {
        updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
      }
    } catch(e) { setError(String(e)); }
    finally { setLoading(false); setContinuing(false); }
  }

  function buildExport() {
    return { id: savedId ?? "tmp", title: `${fH1} & ${fH2} — ${fV}'s Cell`, createdAt: Date.now(), universe: "Dual Capture", tool: "Two Heroines One Cell", characters: [fH1, fH2, fV], chapters, tags: [], favourite: false, wordCount: chapters.join(" ").split(/\s+/).filter(Boolean).length };
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
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", color: acc, letterSpacing: "4px", textTransform: "uppercase", animation: "pulse 2s ease-in-out infinite" }}>Locking them in…</div>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.4)`, fontFamily: "'Raleway', sans-serif", letterSpacing: "2px" }}>Writing the opening scene</div>
        </div>
      );
    }

    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <button onClick={() => { setStep(1); setChapters([]); }} style={btnStyle(acc, accRgb)}>← NEW SESSION</button>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: acc, letterSpacing: "3px", margin: 0, flex: 1 }}>TWO HEROINES, ONE CELL</h1>
          <button onClick={() => exportStoryAsTXT(buildExport())} style={exportBtnStyle(accRgb)}>TXT</button>
          <button onClick={() => exportStoryAsPDF(buildExport())} style={exportBtnStyle(accRgb)}>PDF</button>
        </div>
        <div style={{ background: `rgba(${accRgb},0.03)`, border: `1px solid rgba(${accRgb},0.12)`, borderRadius: "12px", padding: "0.75rem 1.25rem", marginBottom: "1.5rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {[[fH1,"Captive 1"],[fH2,"Captive 2"],[fV,"Villain"],[setting,"Setting"],[dynamic,"Dynamic"]].map(([v,l]) => (
            <div key={l}><div style={{ fontSize: "0.5rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif" }}>{l}</div><div style={{ fontSize: "0.75rem", color: "#EEE", fontFamily: "'Raleway', sans-serif" }}>{v}</div></div>
          ))}
        </div>
        {chapters.map((ch, i) => (
          <div key={i}>
            {chapters.length > 1 && <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0 1rem" }}><div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.15)` }} /><span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px" }}>— CHAPTER {i + 1} —</span><div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.15)` }} /></div>}
            {ch.split("\n").filter(Boolean).map((p, j) => <p key={j} style={proseStyle}>{p}</p>)}
          </div>
        ))}
        {streamingText && streamingText.split("\n").filter(Boolean).map((p, j) => <p key={j} style={{ ...proseStyle, opacity: 0.75 }}>{p}</p>)}
        <div ref={bottomRef} />
        {!loading && !continuing && (
          <div style={{ marginTop: "2rem", background: "rgba(0,0,0,0.4)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "12px", padding: "1.5rem" }}>
            <textarea value={continueDir} onChange={e => setContinueDir(e.target.value)} placeholder="Steer the next chapter… (optional)" rows={2} style={textareaStyle(accRgb)} />
            <button onClick={() => generate(false)} disabled={continuing} style={{ width: "100%", padding: "0.85rem", background: `rgba(${accRgb},0.12)`, border: `1px solid rgba(${accRgb},0.4)`, color: acc, borderRadius: "8px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" }}>
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
        <button onClick={() => setStep(1)} style={btnStyle(acc, accRgb)}>← BACK</button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", color: acc, letterSpacing: "3px", margin: "2rem 0" }}>CONFIGURE THE CELL</h1>

        <Sec title="VILLAIN" acc={acc} rgb={accRgb}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>{VILLAINS.map(v => pill(v, villain === v, () => { setVillain(v); setCustomVillain(""); }))}</div>
          <input value={customVillain} onChange={e => { setCustomVillain(e.target.value); setVillain(""); }} placeholder="Or type a villain…" style={inputStyle(accRgb)} />
        </Sec>
        <Sec title="SETTING" acc={acc} rgb={accRgb}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>{SETTINGS.map(s => pill(s, setting === s, () => setSetting(s)))}</div>
        </Sec>
        <Sec title="DYNAMIC BETWEEN THEM" acc={acc} rgb={accRgb}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>{DYNAMICS.map(d => pill(d, dynamic === d, () => setDynamic(d)))}</div>
        </Sec>

        {error && <div style={{ color: "#FF6060", fontSize: "0.75rem", marginBottom: "1rem" }}>{error}</div>}
        <button onClick={() => { if (canGen) { setStep(3); generate(true); } }} disabled={!canGen} style={{ width: "100%", padding: "1rem", background: canGen ? `rgba(${accRgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${canGen ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: canGen ? acc : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: canGen ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" }}>
          {loading ? "GENERATING..." : "LOCK THEM IN"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "3rem" }}>
        <button onClick={onBack} style={btnStyle(acc, accRgb)}>← HOME</button>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.3rem,3vw,1.8rem)", color: acc, letterSpacing: "4px", margin: 0 }}>TWO HEROINES, ONE CELL</h1>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginTop: "0.25rem" }}>DUAL CAPTIVE — SHARED ORDEAL</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <Sec title="FIRST CAPTIVE" acc={acc} rgb={accRgb}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>{HEROINES.filter(h => h !== (customH2 || heroine2)).map(h => pill(h, heroine1 === h, () => { setHeroine1(h); setCustomH1(""); }))}</div>
          <input value={customH1} onChange={e => { setCustomH1(e.target.value); setHeroine1(""); }} placeholder="Or type a name…" style={inputStyle(accRgb)} />
        </Sec>
        <Sec title="SECOND CAPTIVE" acc={acc} rgb={accRgb}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>{HEROINES.filter(h => h !== (customH1 || heroine1)).map(h => pill(h, heroine2 === h, () => { setHeroine2(h); setCustomH2(""); }))}</div>
          <input value={customH2} onChange={e => { setCustomH2(e.target.value); setHeroine2(""); }} placeholder="Or type a name…" style={inputStyle(accRgb)} />
        </Sec>
      </div>
      <button onClick={() => { if (fH1 && fH2) setStep(2); }} disabled={!fH1 || !fH2} style={{ marginTop: "2rem", width: "100%", padding: "1rem", background: fH1 && fH2 ? `rgba(${accRgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${fH1 && fH2 ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: fH1 && fH2 ? acc : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: fH1 && fH2 ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" }}>
        CONFIGURE THEIR FATE →
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

const proseStyle: React.CSSProperties = { fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1.02rem", lineHeight: 1.9, color: "rgba(230,225,255,0.85)", marginBottom: "1rem" };
const btnStyle = (acc: string, rgb: string): React.CSSProperties => ({ background: "transparent", border: `1px solid rgba(${rgb},0.3)`, color: acc, borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px" });
const exportBtnStyle = (rgb: string): React.CSSProperties => ({ background: "transparent", border: `1px solid rgba(${rgb},0.3)`, color: "rgba(200,195,225,0.6)", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px" });
const inputStyle = (rgb: string): React.CSSProperties => ({ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${rgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.6rem 0.85rem", outline: "none", boxSizing: "border-box" });
const textareaStyle = (rgb: string): React.CSSProperties => ({ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${rgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.82rem", padding: "0.75rem", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" });
