import { useState, useRef, useEffect } from "react";
import { saveStoryToArchive, updateArchiveStory, exportStoryAsTXT, exportStoryAsPDF } from "../lib/archive";

interface Props { onBack: () => void; }

const HEROINES = [
  "Wonder Woman","Black Widow","Supergirl","Scarlet Witch","Captain Marvel","Storm",
  "Black Canary","Zatanna","Batgirl","Catwoman","Jean Grey","Rogue","Psylocke","Emma Frost",
  "Starlight","Kimiko","Silk Spectre","Starfire","Raven","Huntress","She-Hulk","Invisible Woman",
  "Jessica Jones","Ahsoka Tano","Rey","Leia Organa","Elektra","Gamora","Nebula",
];
const VILLAINS = [
  "Lex Luthor","Joker","Red Skull","Baron Zemo","Loki","Thanos","Deathstroke","Ra's al Ghul",
  "HYDRA Commander","Sinister","Magneto","Doctor Doom","Homelander","The Dark Lord","Gorilla Grodd",
  "Darkseid","Trigon","Maxwell Lord","Circe","The Collector","Killgrave","The Governor",
];
const SETTINGS = [
  "An underground fortress — the rescuer walked into a trap",
  "A moving train — no escape when it closes in",
  "A skyscraper penthouse sealed from above",
  "A deserted factory with active countermeasures",
  "A luxury compound that looks like a civilian residence",
  "An orbiting space station — no way to call for backup",
  "A sinking submarine — the clock is already running",
];
const FAIL_REASONS = [
  "The villain knew she was coming — the whole thing was bait",
  "She lost her powers at the critical moment",
  "A hostage was used to force her surrender",
  "She was overwhelmed by numbers before she could act",
  "A betrayal from someone she trusted led her into the trap",
  "The captive was used as a weapon against the rescuer",
  "The rescue triggered a deadman's switch — she had to stop or the captive died",
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const acc = "#FF9640";
const accRgb = "255,150,64";

export default function RescueGoneWrongMode({ onBack }: Props) {
  const [step, setStep] = useState<1|2|3>(1);
  const [captive, setCaptive] = useState("");
  const [rescuer, setRescuer] = useState("");
  const [customCaptive, setCustomCaptive] = useState("");
  const [customRescuer, setCustomRescuer] = useState("");
  const [villain, setVillain] = useState("");
  const [customVillain, setCustomVillain] = useState("");
  const [setting, setSetting] = useState("");
  const [failReason, setFailReason] = useState("");
  const [customFailReason, setCustomFailReason] = useState("");
  const [chapters, setChapters] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [continueDir, setContinueDir] = useState("");
  const [savedId, setSavedId] = useState<string|null>(null);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const fCaptive = customCaptive || captive;
  const fRescuer = customRescuer || rescuer;
  const fVillain = customVillain || villain;
  const fFail = customFailReason || failReason;
  const canGen = fCaptive && fRescuer && fVillain && setting && fFail;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  async function generate(isFirst: boolean) {
    if (isFirst) { setLoading(true); setChapters([]); setSavedId(null); }
    else setContinuing(true);
    setStreamingText(""); setError("");
    try {
      const resp = await fetch(`${BASE}/api/story/rescue-failed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captive: fCaptive, rescuer: fRescuer, villain: fVillain, setting, failReason: fFail, chapters: isFirst ? [] : chapters, continueDir }),
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
        const id = saveStoryToArchive({ title: `The Failed Rescue — ${fRescuer} & ${fCaptive}`, universe: "Rescue Gone Wrong", tool: "Rescue Gone Wrong", characters: [fCaptive, fRescuer, fVillain], chapters: newChapters });
        setSavedId(id);
      } else if (savedId) {
        updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
      }
    } catch(e) { setError(String(e)); }
    finally { setLoading(false); setContinuing(false); }
  }

  function buildExport() {
    return { id: savedId ?? "tmp", title: `The Failed Rescue — ${fRescuer} & ${fCaptive}`, createdAt: Date.now(), universe: "Rescue Gone Wrong", tool: "Rescue Gone Wrong", characters: [fCaptive, fRescuer, fVillain], chapters, tags: [], favourite: false, wordCount: chapters.join(" ").split(/\s+/).filter(Boolean).length };
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
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", color: acc, letterSpacing: "4px", textTransform: "uppercase", animation: "pulse 2s ease-in-out infinite" }}>Springing the trap…</div>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.4)`, fontFamily: "'Raleway', sans-serif", letterSpacing: "2px" }}>Writing the opening scene</div>
        </div>
      );
    }

    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <button onClick={() => { setStep(1); setChapters([]); }} style={btnStyle(acc, accRgb)}>← NEW SESSION</button>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: acc, letterSpacing: "3px", margin: 0, flex: 1 }}>RESCUE GONE WRONG</h1>
          <button onClick={() => exportStoryAsTXT(buildExport())} style={exportBtn(accRgb)}>TXT</button>
          <button onClick={() => exportStoryAsPDF(buildExport())} style={exportBtn(accRgb)}>PDF</button>
        </div>
        <div style={{ background: `rgba(${accRgb},0.03)`, border: `1px solid rgba(${accRgb},0.12)`, borderRadius: "12px", padding: "0.75rem 1.25rem", marginBottom: "1.5rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {[[fCaptive,"Captive"],[fRescuer,"Rescuer"],[fVillain,"Villain"],[setting,"Setting"]].map(([v,l]) => (
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
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", color: acc, letterSpacing: "3px", margin: "2rem 0" }}>CONFIGURE THE TRAP</h1>
        <Sec title="VILLAIN" acc={acc} rgb={accRgb}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>{VILLAINS.map(v => pill(v, villain === v, () => { setVillain(v); setCustomVillain(""); }))}</div>
          <input value={customVillain} onChange={e => { setCustomVillain(e.target.value); setVillain(""); }} placeholder="Or type a villain…" style={inputStyle(accRgb)} />
        </Sec>
        <Sec title="SETTING" acc={acc} rgb={accRgb}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>{SETTINGS.map(s => pill(s, setting === s, () => setSetting(s)))}</div>
        </Sec>
        <Sec title="HOW THE RESCUE FAILS" acc={acc} rgb={accRgb}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>{FAIL_REASONS.map(f => pill(f, failReason === f, () => { setFailReason(f); setCustomFailReason(""); }))}</div>
          <input value={customFailReason} onChange={e => { setCustomFailReason(e.target.value); setFailReason(""); }} placeholder="Or describe how it goes wrong…" style={inputStyle(accRgb)} />
        </Sec>
        {error && <div style={{ color: "#FF6060", fontSize: "0.75rem", marginBottom: "1rem" }}>{error}</div>}
        <button onClick={() => { if (canGen) { setStep(3); generate(true); } }} disabled={!canGen} style={{ width: "100%", padding: "1rem", background: canGen ? `rgba(${accRgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${canGen ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: canGen ? acc : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: canGen ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" }}>
          {loading ? "GENERATING..." : "SPRING THE TRAP"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "3rem" }}>
        <button onClick={onBack} style={btnStyle(acc, accRgb)}>← HOME</button>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.3rem,3vw,1.8rem)", color: acc, letterSpacing: "4px", margin: 0 }}>RESCUE GONE WRONG</h1>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginTop: "0.25rem" }}>THE RESCUE ATTEMPT FAILS — BOTH FALL</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <Sec title="CAPTIVE HEROINE (ALREADY HELD)" acc={acc} rgb={accRgb}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>{HEROINES.filter(h => h !== (customRescuer || rescuer)).map(h => pill(h, captive === h, () => { setCaptive(h); setCustomCaptive(""); }))}</div>
          <input value={customCaptive} onChange={e => { setCustomCaptive(e.target.value); setCaptive(""); }} placeholder="Or type a name…" style={inputStyle(accRgb)} />
        </Sec>
        <Sec title="RESCUER HEROINE (WHO FAILS)" acc={acc} rgb={accRgb}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>{HEROINES.filter(h => h !== (customCaptive || captive)).map(h => pill(h, rescuer === h, () => { setRescuer(h); setCustomRescuer(""); }))}</div>
          <input value={customRescuer} onChange={e => { setCustomRescuer(e.target.value); setRescuer(""); }} placeholder="Or type a name…" style={inputStyle(accRgb)} />
        </Sec>
      </div>
      <button onClick={() => { if (fCaptive && fRescuer) setStep(2); }} disabled={!fCaptive || !fRescuer} style={{ marginTop: "2rem", width: "100%", padding: "1rem", background: fCaptive && fRescuer ? `rgba(${accRgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${fCaptive && fRescuer ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: fCaptive && fRescuer ? acc : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: fCaptive && fRescuer ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" }}>
        SET THE TRAP →
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
const exportBtn = (rgb: string): React.CSSProperties => ({ background: "transparent", border: `1px solid rgba(${rgb},0.3)`, color: "rgba(200,195,225,0.6)", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px" });
const inputStyle = (rgb: string): React.CSSProperties => ({ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${rgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.6rem 0.85rem", outline: "none", boxSizing: "border-box" });
const textareaStyle = (rgb: string): React.CSSProperties => ({ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${rgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.82rem", padding: "0.75rem", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" });
