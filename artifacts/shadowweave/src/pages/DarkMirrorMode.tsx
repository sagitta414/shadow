import { useState, useRef, useEffect } from "react";
import { getAiProvider } from "../lib/aiProvider";
import { saveStoryToArchive, updateArchiveStory, exportStoryAsTXT, exportStoryAsPDF } from "../lib/archive";

interface Props { onBack: () => void; }

const HEROINES = [
  "Wonder Woman","Black Widow","Supergirl","Scarlet Witch","Captain Marvel","Storm",
  "Black Canary","Zatanna","Batgirl","Jean Grey","Rogue","Psylocke","Emma Frost",
  "Starlight","Kimiko","Starfire","Raven","Huntress","She-Hulk","Invisible Woman",
  "Jessica Jones","Leia Organa","Ahsoka Tano","Black Cat","Spider-Woman","Valkyrie","Power Girl",
];
const VILLAINS = [
  "Lex Luthor","Sinister","Doctor Doom","Magneto","Loki","Mephisto","The Collector",
  "Norman Osborn","Baron Zemo","Maxwell Lord","Ra's al Ghul","Apocalypse",
];
const MISSIONS = [
  "Destroy her heroic reputation — make the public fear and hate her",
  "Assassinate her closest allies while wearing her face",
  "Sign surrenders and betrayal agreements on her behalf",
  "Commit public crimes that destroy her name permanently",
  "Seduce and betray her most important personal relationships",
  "Publicly renounce her identity, her team, and her cause",
  "Feed her enemies information disguised as her intelligence",
];
const CAPTIVE_SETTINGS = [
  "A sealed room — she watches live feeds of the duplicate",
  "A cell with a single screen — all she can do is watch",
  "A sensory isolation environment — only news of outside reaches her",
  "A comfortable prison — everything she needs except freedom or contact",
  "A moving location — she never stays still, always disoriented",
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const acc = "#818CF8";
const accRgb = "129,140,248";

export default function DarkMirrorMode({ onBack }: Props) {
  const [step, setStep] = useState<1|2|3>(1);
  const [heroine, setHeroine] = useState("");
  const [customHeroine, setCustomHeroine] = useState("");
  const [villain, setVillain] = useState("");
  const [customVillain, setCustomVillain] = useState("");
  const [mission, setMission] = useState("");
  const [captiveSetting, setCaptiveSetting] = useState("");
  const [chapters, setChapters] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [continueDir, setContinueDir] = useState("");
  const [savedId, setSavedId] = useState<string|null>(null);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const fH = customHeroine.trim() || heroine;
  const fV = customVillain.trim() || villain;
  const canStep2 = !!fH;
  const canGen = fH && fV && mission && captiveSetting;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  async function generate(isFirst: boolean) {
    if (isFirst) { setLoading(true); setChapters([]); setSavedId(null); }
    else setContinuing(true);
    setStreamingText(""); setError("");
    try {
      const resp = await fetch(`${BASE}/api/story/dark-mirror`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: getAiProvider(), heroine: fH, villain: fV, mission, captiveSetting, chapters: isFirst ? [] : chapters, chapterNumber: isFirst ? 1 : chapters.length + 1, continueDir }),
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
        const id = saveStoryToArchive({ title: `${fH} — Dark Mirror`, universe: "Dark Mirror", tool: "Dark Mirror", characters: [fH, fV], chapters: newChapters });
        setSavedId(id);
      } else if (savedId) {
        updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
      }
    } catch(e) { setError(String(e)); }
    finally { setLoading(false); setContinuing(false); }
  }

  function buildExport() {
    return { id: savedId ?? "tmp", title: `${fH} — Dark Mirror`, createdAt: Date.now(), universe: "Dark Mirror", tool: "Dark Mirror", characters: [fH, fV], chapters, tags: [], favourite: false, wordCount: chapters.join(" ").split(/\s+/).filter(Boolean).length };
  }

  const pill = (label: string, active: boolean, onClick: () => void) => (
    <button key={label} onClick={onClick} style={{ padding: "0.4rem 0.85rem", borderRadius: "20px", border: `1px solid ${active ? acc : `rgba(${accRgb},0.2)`}`, background: active ? `rgba(${accRgb},0.18)` : "transparent", color: active ? acc : "rgba(200,195,225,0.5)", fontSize: "0.72rem", cursor: "pointer", transition: "all 0.2s", fontFamily: "'Raleway', sans-serif" }}>
      {label}
    </button>
  );

  function renderChapter(text: string) {
    const sections = text.split(/\n(?=\[THE ORIGINAL\]|\[THE DUPLICATE\])/);
    return sections.map((sec, i) => {
      if (sec.startsWith("[THE ORIGINAL]")) {
        return (
          <div key={i} style={{ borderLeft: `3px solid rgba(${accRgb},0.5)`, paddingLeft: "1.25rem", marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.55rem", color: acc, letterSpacing: "2.5px", fontFamily: "'Cinzel', serif", marginBottom: "0.4rem" }}>THE ORIGINAL</div>
            <p style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1rem", color: "rgba(230,225,255,0.85)", lineHeight: 1.9, margin: 0 }}>{sec.replace("[THE ORIGINAL]", "").trim()}</p>
          </div>
        );
      }
      if (sec.startsWith("[THE DUPLICATE]")) {
        return (
          <div key={i} style={{ borderLeft: `3px solid rgba(${accRgb},0.2)`, paddingLeft: "1.25rem", marginBottom: "1.25rem", opacity: 0.85 }}>
            <div style={{ fontSize: "0.55rem", color: `rgba(${accRgb},0.55)`, letterSpacing: "2.5px", fontFamily: "'Cinzel', serif", marginBottom: "0.4rem" }}>THE DUPLICATE</div>
            <p style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1rem", color: "rgba(220,215,200,0.8)", lineHeight: 1.9, margin: 0, fontStyle: "italic" }}>{sec.replace("[THE DUPLICATE]", "").trim()}</p>
          </div>
        );
      }
      return <p key={i} style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1rem", color: "rgba(230,225,255,0.85)", lineHeight: 1.9, marginBottom: "1rem" }}>{sec}</p>;
    });
  }

  if (step === 3) {
    if (loading && chapters.length === 0) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
          <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", color: acc, letterSpacing: "4px", animation: "pulse 2s ease-in-out infinite" }}>The mirror is made…</div>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.4)`, fontFamily: "'Raleway', sans-serif", letterSpacing: "2px" }}>Two versions. One true.</div>
        </div>
      );
    }
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "920px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <button onClick={() => { setStep(1); setChapters([]); }} style={bSt}>← NEW</button>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: acc, letterSpacing: "3px", margin: 0, flex: 1 }}>DARK MIRROR</h1>
          <button onClick={() => exportStoryAsTXT(buildExport())} style={eSt}>TXT</button>
          <button onClick={() => exportStoryAsPDF(buildExport())} style={eSt}>PDF</button>
        </div>
        <div style={{ background: `rgba(${accRgb},0.06)`, border: `1px solid rgba(${accRgb},0.18)`, borderRadius: "12px", padding: "1rem 1.5rem", marginBottom: "2rem", display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "center" }}>
          <div><div style={{ fontSize: "0.48rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.15rem" }}>ORIGINAL (CAPTIVE)</div><div style={{ fontSize: "0.78rem", color: "#EEE" }}>{fH}</div></div>
          <div style={{ fontSize: "1rem", color: `rgba(${accRgb},0.3)` }}>🪞</div>
          <div><div style={{ fontSize: "0.48rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.15rem" }}>DUPLICATE'S MISSION</div><div style={{ fontSize: "0.72rem", color: "#DDD", maxWidth: "220px" }}>{mission}</div></div>
          <div><div style={{ fontSize: "0.48rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.15rem" }}>ARCHITECT</div><div style={{ fontSize: "0.78rem", color: "#EEE" }}>{fV}</div></div>
        </div>
        {chapters.map((ch, i) => (
          <div key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0 1.25rem" }}>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", color: `rgba(${accRgb},0.55)`, letterSpacing: "3px" }}>CHAPTER {i+1}</span>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
            </div>
            {renderChapter(ch)}
          </div>
        ))}
        {streamingText && <div style={{ opacity: 0.85 }}>{renderChapter(streamingText)}</div>}
        <div ref={bottomRef} />
        {!loading && !continuing && chapters.length < 6 && (
          <div style={{ marginTop: "2rem", background: "rgba(0,0,0,0.4)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "12px", padding: "1.5rem" }}>
            <textarea value={continueDir} onChange={e => setContinueDir(e.target.value)} placeholder="What does the duplicate do next? What does the original witness? (optional)" rows={2} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.82rem", padding: "0.75rem", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" }} />
            <button onClick={() => generate(false)} disabled={continuing} style={{ width: "100%", padding: "0.85rem", background: `rgba(${accRgb},0.14)`, border: `1px solid rgba(${accRgb},0.45)`, color: acc, borderRadius: "8px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" }}>
              {continuing ? "REFLECTING…" : "🪞 NEXT CHAPTER"}
            </button>
          </div>
        )}
        {chapters.length >= 6 && <div style={{ marginTop: "2rem", textAlign: "center", fontFamily: "'Cinzel', serif", color: `rgba(${accRgb},0.5)`, fontSize: "0.7rem", letterSpacing: "3px" }}>— TWO LIVES. ONE PRISONER. —</div>}
        {continuing && <div style={{ textAlign: "center", padding: "1.5rem", color: `rgba(${accRgb},0.5)`, fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" }}>The mirror moves…</div>}
        {error && <div style={{ color: "#FF6060", fontSize: "0.75rem", marginTop: "1rem" }}>Error: {error}</div>}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "720px", margin: "0 auto" }}>
        <button onClick={() => setStep(1)} style={bSt}>← BACK</button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", color: acc, letterSpacing: "3px", margin: "0 0 2rem" }}>CONFIGURE THE MIRROR</h1>
        <Sec3 title="VILLAIN / ARCHITECT" rgb={accRgb}>
          <div style={row}>{VILLAINS.map(v => pill(v, villain === v, () => { setVillain(v); setCustomVillain(""); }))}</div>
          <input value={customVillain} onChange={e => { setCustomVillain(e.target.value); setVillain(""); }} placeholder="Or type any villain…" style={iSt(accRgb)} />
        </Sec3>
        <Sec3 title="THE DUPLICATE'S MISSION" rgb={accRgb}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.5rem" }}>
            {MISSIONS.map(m => (
              <button key={m} onClick={() => setMission(m)} style={{ background: mission === m ? `rgba(${accRgb},0.16)` : "rgba(0,0,0,0.4)", border: `1px solid ${mission === m ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.06)"}`, borderRadius: "10px", padding: "0.75rem", cursor: "pointer", textAlign: "left", color: mission === m ? acc : "#CCC", fontFamily: "'Raleway', sans-serif", fontSize: "0.72rem" }}>{m}</button>
            ))}
          </div>
        </Sec3>
        <Sec3 title="WHERE THE ORIGINAL IS KEPT" rgb={accRgb}>
          <div style={row}>{CAPTIVE_SETTINGS.map(s => pill(s, captiveSetting === s, () => setCaptiveSetting(s)))}</div>
        </Sec3>
        {error && <div style={{ color: "#FF6060", fontSize: "0.75rem", marginBottom: "1rem" }}>{error}</div>}
        <button onClick={() => { if (canGen) { setStep(3); generate(true); } }} disabled={!canGen} style={pSt(canGen, accRgb, acc)}>
          🪞 CREATE THE MIRROR
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
        <button onClick={onBack} style={bSt}>← HOME</button>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.2rem,3vw,1.8rem)", color: acc, letterSpacing: "4px", margin: 0 }}>DARK MIRROR</h1>
          <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginTop: "0.2rem" }}>A DUPLICATE DESTROYS HER. THE ORIGINAL WATCHES.</div>
        </div>
      </div>
      <Sec3 title="SELECT SUBJECT" rgb={accRgb}>
        <div style={row}>{HEROINES.map(h => pill(h, heroine === h, () => { setHeroine(h); setCustomHeroine(""); }))}</div>
        <input value={customHeroine} onChange={e => { setCustomHeroine(e.target.value); setHeroine(""); }} placeholder="Or type a custom name…" style={iSt(accRgb)} />
      </Sec3>
      <button onClick={() => { if (canStep2) setStep(2); }} disabled={!canStep2} style={pSt(canStep2, accRgb, acc)}>CONFIGURE THE MIRROR →</button>
    </div>
  );
}

function Sec3({ title, children, rgb }: { title: string; children: React.ReactNode; rgb: string }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ borderBottom: `1px solid rgba(${rgb},0.12)`, paddingBottom: "0.4rem", marginBottom: "0.875rem" }}>
        <div style={{ fontSize: "0.55rem", color: `rgba(${rgb},0.6)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif" }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

const row: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" };
const iSt = (rgb: string): React.CSSProperties => ({ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${rgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.6rem 0.85rem", outline: "none", boxSizing: "border-box", marginTop: "0.5rem" });
const bSt: React.CSSProperties = { background: "transparent", border: "1px solid rgba(129,140,248,0.3)", color: "#818CF8", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", marginBottom: "2rem" };
const eSt: React.CSSProperties = { background: "transparent", border: "1px solid rgba(129,140,248,0.3)", color: "rgba(200,195,225,0.6)", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif" };
const pSt = (active: boolean, rgb: string, ac: string): React.CSSProperties => ({ width: "100%", padding: "1rem", background: active ? `rgba(${rgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${active ? `rgba(${rgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: active ? ac : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: active ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" });
