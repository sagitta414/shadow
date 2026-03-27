import { useState, useRef, useEffect } from "react";
import { saveStoryToArchive, updateArchiveStory, exportStoryAsTXT, exportStoryAsPDF } from "../lib/archive";

interface Props { onBack: () => void; }

const HEROINES = [
  "Wonder Woman","Black Widow","Supergirl","Scarlet Witch","Captain Marvel","Storm",
  "Black Canary","Zatanna","Batgirl","Jean Grey","Rogue","Psylocke","Emma Frost",
  "Starlight","Kimiko","Starfire","Raven","Huntress","She-Hulk","Invisible Woman",
  "Jessica Jones","Leia Organa","Ahsoka Tano","Black Cat","Spider-Woman",
  "Valkyrie","Power Girl","Catwoman","Poison Ivy","Silk Spectre","Hawkgirl",
];
const VILLAINS = [
  "Lex Luthor","Joker","Red Skull","Baron Zemo","Loki","Thanos","Deathstroke","Ra's al Ghul",
  "Sinister","Magneto","Doctor Doom","Homelander","Darkseid","Kingpin","The Collector",
  "Mephisto","Apocalypse","Norman Osborn","Maxwell Lord","Green Goblin",
];
const DISPLAY_SETTINGS = [
  "A locked glass display case in his trophy room",
  "Restrained on a raised platform — centre of his private chambers",
  "Chained to the throne wall — visitors walk past her",
  "A rotating mechanical display mount — she cannot look away",
  "A velvet-lined presentation cage beneath spotlights",
  "Pinned to a board like a specimen — fully exposed",
];
const RESTRAINT_STYLES = [
  "Full restraints — no movement whatsoever",
  "Wrists and ankles only — small gestures remain",
  "Power-suppressed but physically free — nowhere to run",
  "On a mounted brace — forced upright, facing forward",
  "Minimal restraint — but collared and leashed",
];
const VISITOR_TYPES = [
  "Rival villains","Criminal clients","Collectors & buyers","Henchmen & staff",
  "Former allies (turned)","Journalists — paid for silence","Scientists studying her powers",
  "Underground fans","Bounty hunters","Arms dealers","Syndicate representatives",
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const acc = "#EF4444";
const accRgb = "239,68,68";

export default function TrophyDisplayMode({ onBack }: Props) {
  const [step, setStep] = useState<1|2|3>(1);
  const [heroine, setHeroine] = useState("");
  const [customHeroine, setCustomHeroine] = useState("");
  const [villain, setVillain] = useState("");
  const [customVillain, setCustomVillain] = useState("");
  const [displaySetting, setDisplaySetting] = useState("");
  const [restraintStyle, setRestraintStyle] = useState("");
  const [visitorTypes, setVisitorTypes] = useState<string[]>([]);
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
  const canGen = fH && fV && displaySetting && restraintStyle;
  const visitorNum = chapters.length + 1;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  function toggleVisitor(v: string) {
    setVisitorTypes(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  }

  async function generate(isFirst: boolean) {
    if (isFirst) { setLoading(true); setChapters([]); setSavedId(null); }
    else setContinuing(true);
    setStreamingText(""); setError("");
    try {
      const resp = await fetch(`${BASE}/api/story/trophy-display`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroine: fH, villain: fV, displaySetting, restraintStyle, visitorTypes, chapters: isFirst ? [] : chapters, visitorNumber: isFirst ? 1 : visitorNum, continueDir }),
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
        const id = saveStoryToArchive({ title: `${fH} — ${fV}'s Trophy`, universe: "Trophy Display", tool: "Trophy Display", characters: [fH, fV], chapters: newChapters });
        setSavedId(id);
      } else if (savedId) {
        updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
      }
    } catch(e) { setError(String(e)); }
    finally { setLoading(false); setContinuing(false); }
  }

  function buildExport() {
    return { id: savedId ?? "tmp", title: `${fH} — ${fV}'s Trophy`, createdAt: Date.now(), universe: "Trophy Display", tool: "Trophy Display", characters: [fH, fV], chapters, tags: [], favourite: false, wordCount: chapters.join(" ").split(/\s+/).filter(Boolean).length };
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
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", color: acc, letterSpacing: "4px", animation: "pulse 2s ease-in-out infinite" }}>Preparing the display…</div>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.4)`, fontFamily: "'Raleway', sans-serif", letterSpacing: "2px" }}>First Visitor Approaching</div>
        </div>
      );
    }

    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "880px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <button onClick={() => { setStep(1); setChapters([]); }} style={backBtn}> ← NEW DISPLAY </button>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: acc, letterSpacing: "3px", margin: 0, flex: 1 }}>TROPHY DISPLAY</h1>
          <button onClick={() => exportStoryAsTXT(buildExport())} style={exportBtn}>TXT</button>
          <button onClick={() => exportStoryAsPDF(buildExport())} style={exportBtn}>PDF</button>
        </div>

        <div style={{ background: `rgba(${accRgb},0.05)`, border: `1px solid rgba(${accRgb},0.15)`, borderRadius: "12px", padding: "0.875rem 1.25rem", marginBottom: "2rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <MetaItem label="EXHIBIT" value={fH} rgb={accRgb} />
          <MetaItem label="CURATOR" value={fV} rgb={accRgb} />
          <MetaItem label="VISITORS" value={`${chapters.length}`} rgb={accRgb} />
        </div>

        {chapters.map((ch, i) => (
          <div key={i}>
            <ChapterDivider label={`VISITOR ${i + 1}`} rgb={accRgb} />
            <p style={prosestyle}>{ch}</p>
          </div>
        ))}
        {streamingText && <p style={{ ...prosestyle, opacity: 0.85 }}>{streamingText}</p>}
        <div ref={bottomRef} />

        {!loading && !continuing && chapters.length < 6 && (
          <div style={{ marginTop: "2rem", background: "rgba(0,0,0,0.4)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "12px", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.6)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.5rem" }}>VISITOR {visitorNum} APPROACHES</div>
            <textarea value={continueDir} onChange={e => setContinueDir(e.target.value)} placeholder="Who is this visitor? What do they want? (optional — leave blank for AI to decide)" rows={2} style={taStyle} />
            <button onClick={() => generate(false)} disabled={continuing} style={continueBtn(accRgb, acc)}>
              {continuing ? "ARRIVING…" : "👁 NEXT VISITOR"}
            </button>
          </div>
        )}
        {chapters.length >= 6 && <div style={endLabel}>— THE DISPLAY CONTINUES. THE VISITORS KEEP COMING. —</div>}
        {continuing && <div style={loadingLabel(accRgb)}>Footsteps in the corridor…</div>}
        {error && <div style={errorStyle}>Error: {error}</div>}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "720px", margin: "0 auto" }}>
        <button onClick={() => setStep(1)} style={backBtn}>← BACK</button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", color: acc, letterSpacing: "3px", margin: "0 0 2rem" }}>CONFIGURE THE DISPLAY</h1>

        <Section title="CAPTOR VILLAIN" rgb={accRgb}>
          <div style={pillRow}>{VILLAINS.map(v => pill(v, villain === v, () => { setVillain(v); setCustomVillain(""); }))}</div>
          <input value={customVillain} onChange={e => { setCustomVillain(e.target.value); setVillain(""); }} placeholder="Or type any villain…" style={inputStyle} />
        </Section>
        <Section title="DISPLAY SETTING" rgb={accRgb}>
          <div style={pillRow}>{DISPLAY_SETTINGS.map(s => pill(s, displaySetting === s, () => setDisplaySetting(s)))}</div>
        </Section>
        <Section title="RESTRAINT STYLE" rgb={accRgb}>
          <div style={pillRow}>{RESTRAINT_STYLES.map(r => pill(r, restraintStyle === r, () => setRestraintStyle(r)))}</div>
        </Section>
        <Section title="VISITOR POOL" rgb={accRgb} subtitle="(optional — AI will cast visitors if none selected)">
          <div style={pillRow}>{VISITOR_TYPES.map(v => pill(v, visitorTypes.includes(v), () => toggleVisitor(v)))}</div>
        </Section>

        {error && <div style={errorStyle}>{error}</div>}
        <button onClick={() => { if (canGen) { setStep(3); generate(true); } }} disabled={!canGen} style={primaryBtn(canGen, accRgb, acc)}>
          {loading ? "MOUNTING HER…" : "👁 BEGIN THE DISPLAY"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
        <button onClick={onBack} style={backBtn}>← HOME</button>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.2rem,3vw,1.8rem)", color: acc, letterSpacing: "4px", margin: 0 }}>TROPHY DISPLAY</h1>
          <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginTop: "0.2rem" }}>PUT HER ON DISPLAY — VISITORS WELCOME</div>
        </div>
      </div>
      <Section title="SELECT HEROINE" rgb={accRgb}>
        <div style={pillRow}>{HEROINES.map(h => pill(h, heroine === h, () => { setHeroine(h); setCustomHeroine(""); }))}</div>
        <input value={customHeroine} onChange={e => { setCustomHeroine(e.target.value); setHeroine(""); }} placeholder="Or type a custom name…" style={inputStyle} />
      </Section>
      <button onClick={() => { if (canStep2) setStep(2); }} disabled={!canStep2} style={primaryBtn(canStep2, accRgb, acc)}>
        CONFIGURE THE DISPLAY →
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
  return <div><div style={{ fontSize: "0.5rem", color: `rgba(${rgb},0.5)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.2rem" }}>{label}</div><div style={{ fontSize: "0.82rem", color: "#EEE", fontFamily: "'Raleway', sans-serif" }}>{value}</div></div>;
}
function ChapterDivider({ label, rgb }: { label: string; rgb: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0 1.25rem" }}>
      <div style={{ flex: 1, height: "1px", background: `rgba(${rgb},0.18)` }} />
      <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", color: `rgba(${rgb},0.55)`, letterSpacing: "3px" }}>{label}</span>
      <div style={{ flex: 1, height: "1px", background: `rgba(${rgb},0.18)` }} />
    </div>
  );
}

const prosestyle: React.CSSProperties = { fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1rem", color: "rgba(230,225,255,0.85)", lineHeight: 1.9, marginBottom: "0.5rem" };
const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.6rem 0.85rem", outline: "none", boxSizing: "border-box", marginTop: "0.5rem" };
const pillRow: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" };
const taStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.82rem", padding: "0.75rem", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" };
const backBtn: React.CSSProperties = { background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", marginBottom: "2rem" };
const exportBtn: React.CSSProperties = { background: "transparent", border: "1px solid rgba(239,68,68,0.3)", color: "rgba(200,195,225,0.6)", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif" };
const primaryBtn = (active: boolean, rgb: string, ac: string): React.CSSProperties => ({ width: "100%", padding: "1rem", background: active ? `rgba(${rgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${active ? `rgba(${rgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: active ? ac : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: active ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" });
const continueBtn = (rgb: string, ac: string): React.CSSProperties => ({ width: "100%", padding: "0.85rem", background: `rgba(${rgb},0.14)`, border: `1px solid rgba(${rgb},0.45)`, color: ac, borderRadius: "8px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" });
const endLabel: React.CSSProperties = { marginTop: "2rem", textAlign: "center", fontFamily: "'Cinzel', serif", color: "rgba(239,68,68,0.5)", fontSize: "0.7rem", letterSpacing: "3px" };
const loadingLabel = (rgb: string): React.CSSProperties => ({ textAlign: "center", padding: "1.5rem", color: `rgba(${rgb},0.5)`, fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" });
const errorStyle: React.CSSProperties = { color: "#FF6060", fontSize: "0.75rem", marginTop: "1rem", fontFamily: "'Raleway', sans-serif" };
