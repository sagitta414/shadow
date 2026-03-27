import { useState, useRef, useEffect } from "react";
import OutfitSelector, { outfitPromptLine } from "../components/OutfitSelector";
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
const DIRECTORS = [
  "Lex Luthor","The Collector","Kingpin","Doctor Doom","Norman Osborn",
  "Magneto","Mephisto","Ra's al Ghul","Baron Zemo","The Grandmaster","Joker","Thanos",
];
const OCCASIONS = [
  "A private villain gala — black-tie, exclusive",
  "An intimate dinner for selected criminal clients",
  "A live demonstration — she performs her submission publicly",
  "A victory celebration after her capture",
  "An intimidation display — shown to her former allies",
  "A charity auction precursor — showing off before the bidding",
  "A villain syndicate board meeting — she is the centrepiece",
];
const DIRECTIVES = [
  "Formal evening gown — chosen by him",
  "Her own costume — modified and defaced",
  "Minimal coverage only",
  "Collar and leash",
  "Hands bound behind her back throughout",
  "Heels — mobility restricted",
  "Posture corrections administered publicly",
  "Full presentation makeup — his choice",
  "Hair styled entirely by him",
  "No speaking permitted",
  "She introduces herself using his chosen title for her",
  "She thanks each guest for attending",
];
const AUDIENCES = [
  "A handful of senior villain figures",
  "A large crowd — 50+ criminals and associates",
  "A mixed group — allies, clients, rivals",
  "Two or three close confidants only",
  "An anonymous encrypted livestream audience",
  "Her former teammates — captured or coerced to attend",
];

const PHASES = ["The Preparation", "The Presentation", "The Inspection", "The Aftermath"];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const acc = "#E879F9";
const accRgb = "232,121,249";

export default function ShowcaseMode({ onBack }: Props) {
  const [step, setStep] = useState<1|2|3>(1);
  const [heroine, setHeroine] = useState("");
  const [customHeroine, setCustomHeroine] = useState("");
  const [director, setDirector] = useState("");
  const [customDirector, setCustomDirector] = useState("");
  const [occasion, setOccasion] = useState("");
  const [audience, setAudience] = useState("");
  const [directives, setDirectives] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [continueDir, setContinueDir] = useState("");
  const [savedId, setSavedId] = useState<string|null>(null);
  const [error, setError] = useState("");
  const [outfitId, setOutfitId] = useState("");
  const [outfitDamage, setOutfitDamage] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fH = customHeroine.trim() || heroine;
  const fD = customDirector.trim() || director;
  const canStep2 = !!fH;
  const canGen = fH && fD && occasion && audience;
  const phaseIdx = chapters.length;
  const nextPhase = PHASES[phaseIdx];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  function toggleDirective(d: string) {
    setDirectives(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  async function generate(isFirst: boolean) {
    if (isFirst) { setLoading(true); setChapters([]); setSavedId(null); }
    else setContinuing(true);
    setStreamingText(""); setError("");
    try {
      const resp = await fetch(`${BASE}/api/story/showcase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: getAiProvider(), outfitContext: outfitPromptLine(outfitId, outfitDamage), heroine: fH, director: fD, occasion, audience, directives, chapters: isFirst ? [] : chapters, phaseNumber: isFirst ? 1 : phaseIdx + 1, phaseName: isFirst ? PHASES[0] : PHASES[phaseIdx] ?? "Final Phase", continueDir }),
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
        const id = saveStoryToArchive({ title: `${fH} — ${fD}'s Showcase`, universe: "The Showcase", tool: "The Showcase", characters: [fH, fD], chapters: newChapters });
        setSavedId(id);
      } else if (savedId) {
        updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
      }
    } catch(e) { setError(String(e)); }
    finally { setLoading(false); setContinuing(false); }
  }

  function buildExport() {
    return { id: savedId ?? "tmp", title: `${fH} — ${fD}'s Showcase`, createdAt: Date.now(), universe: "The Showcase", tool: "The Showcase", characters: [fH, fD], chapters, tags: [], favourite: false, wordCount: chapters.join(" ").split(/\s+/).filter(Boolean).length };
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
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", color: acc, letterSpacing: "4px", animation: "pulse 2s ease-in-out infinite" }}>Preparing her for the showcase…</div>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.4)`, fontFamily: "'Raleway', sans-serif", letterSpacing: "2px" }}>The Preparation</div>
        </div>
      );
    }

    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <button onClick={() => { setStep(1); setChapters([]); }} style={backBtn}>← NEW SHOWCASE</button>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: acc, letterSpacing: "3px", margin: 0, flex: 1 }}>THE SHOWCASE</h1>
          <button onClick={() => exportStoryAsTXT(buildExport())} style={exportBtn}>TXT</button>
          <button onClick={() => exportStoryAsPDF(buildExport())} style={exportBtn}>PDF</button>
        </div>

        {/* Phase progress */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", alignItems: "center" }}>
          {PHASES.map((p, i) => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: i < chapters.length ? acc : "rgba(255,255,255,0.1)", border: i === chapters.length - 1 ? `2px solid ${acc}` : "1px solid rgba(255,255,255,0.1)" }} />
              <span style={{ fontSize: "0.55rem", color: i < chapters.length ? `rgba(${accRgb},0.7)` : "rgba(200,195,225,0.25)", fontFamily: "'Cinzel', serif", letterSpacing: "1px", whiteSpace: "nowrap" }}>{p.toUpperCase()}</span>
              {i < PHASES.length - 1 && <div style={{ width: "20px", height: "1px", background: "rgba(255,255,255,0.08)" }} />}
            </div>
          ))}
        </div>

        {/* Event brief */}
        <div style={{ background: `rgba(${accRgb},0.05)`, border: `1px solid rgba(${accRgb},0.15)`, borderRadius: "12px", padding: "0.875rem 1.25rem", marginBottom: "2rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <MetaItem label="SUBJECT" value={fH} rgb={accRgb} />
          <MetaItem label="DIRECTOR" value={fD} rgb={accRgb} />
          <MetaItem label="OCCASION" value={occasion} rgb={accRgb} />
          {directives.length > 0 && <MetaItem label="DIRECTIVES" value={directives.slice(0,3).join(", ") + (directives.length > 3 ? ` +${directives.length - 3}` : "")} rgb={accRgb} />}
        </div>

        {chapters.map((ch, i) => (
          <div key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0 1.25rem" }}>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", color: `rgba(${accRgb},0.55)`, letterSpacing: "3px" }}>{(PHASES[i] ?? `PHASE ${i+1}`).toUpperCase()}</span>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
            </div>
            <p style={prosestyle}>{ch}</p>
          </div>
        ))}
        {streamingText && <p style={{ ...prosestyle, opacity: 0.85 }}>{streamingText}</p>}
        <div ref={bottomRef} />

        {!loading && !continuing && chapters.length < 4 && (
          <div style={{ marginTop: "2rem", background: "rgba(0,0,0,0.4)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "12px", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.6)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.5rem" }}>
              NEXT — {nextPhase?.toUpperCase()}
            </div>
            <textarea value={continueDir} onChange={e => setContinueDir(e.target.value)} placeholder={`Steer ${nextPhase}… (optional)`} rows={2} style={taStyle} />
            <button onClick={() => generate(false)} disabled={continuing} style={continueBtn(accRgb, acc)}>
              {continuing ? "STAGING…" : `🎭 ${nextPhase?.toUpperCase()}`}
            </button>
          </div>
        )}
        {chapters.length >= 4 && <div style={endLabel(accRgb)}>— THE SHOWCASE ENDS. THE GUESTS DEPART. SHE REMAINS. —</div>}
        {continuing && <div style={loadLabel(accRgb)}>The scene shifts…</div>}

        <OutfitSelector
          outfitId={outfitId}
          damage={outfitDamage}
          onOutfitChange={setOutfitId}
          onDamageChange={setOutfitDamage}
          accentColor="#60A5FA"
          accentRgb="96,165,250"
        />
                {error && <div style={errStyle}>Error: {error}</div>}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "720px", margin: "0 auto" }}>
        <button onClick={() => setStep(1)} style={backBtn}>← BACK</button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", color: acc, letterSpacing: "3px", margin: "0 0 2rem" }}>CONFIGURE THE SHOWCASE</h1>

        <Section title="DIRECTING VILLAIN" rgb={accRgb}>
          <div style={pillRow}>{DIRECTORS.map(d => pill(d, director === d, () => { setDirector(d); setCustomDirector(""); }))}</div>
          <input value={customDirector} onChange={e => { setCustomDirector(e.target.value); setDirector(""); }} placeholder="Or type any villain…" style={inputStyle} />
        </Section>
        <Section title="OCCASION" rgb={accRgb}>
          <div style={pillRow}>{OCCASIONS.map(o => pill(o, occasion === o, () => setOccasion(o)))}</div>
        </Section>
        <Section title="AUDIENCE" rgb={accRgb}>
          <div style={pillRow}>{AUDIENCES.map(a => pill(a, audience === a, () => setAudience(a)))}</div>
        </Section>
        <Section title="STYLE DIRECTIVES" rgb={accRgb} subtitle="(optional — what he has decided she will wear, do, and say)">
          <div style={pillRow}>{DIRECTIVES.map(d => pill(d, directives.includes(d), () => toggleDirective(d)))}</div>
        </Section>

        {error && <div style={errStyle}>{error}</div>}
        <button onClick={() => { if (canGen) { setStep(3); generate(true); } }} disabled={!canGen} style={primBtn(canGen, accRgb, acc)}>
          {loading ? "STAGING…" : "🎭 BEGIN THE SHOWCASE"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
        <button onClick={onBack} style={backBtn}>← HOME</button>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.2rem,3vw,1.8rem)", color: acc, letterSpacing: "4px", margin: 0 }}>THE SHOWCASE</h1>
          <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginTop: "0.2rem" }}>HE DECIDES HOW SHE LOOKS. SHE HAS NO SAY.</div>
        </div>
      </div>
      <Section title="SELECT SUBJECT" rgb={accRgb}>
        <div style={pillRow}>{HEROINES.map(h => pill(h, heroine === h, () => { setHeroine(h); setCustomHeroine(""); }))}</div>
        <input value={customHeroine} onChange={e => { setCustomHeroine(e.target.value); setHeroine(""); }} placeholder="Or type a custom name…" style={inputStyle} />
      </Section>
      <button onClick={() => { if (canStep2) setStep(2); }} disabled={!canStep2} style={primBtn(canStep2, accRgb, acc)}>
        CONFIGURE THE SHOWCASE →
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
  return <div><div style={{ fontSize: "0.5rem", color: `rgba(${rgb},0.5)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.2rem" }}>{label}</div><div style={{ fontSize: "0.78rem", color: "#EEE", fontFamily: "'Raleway', sans-serif", maxWidth: "220px" }}>{value}</div></div>;
}

const prosestyle: React.CSSProperties = { fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1rem", color: "rgba(230,225,255,0.85)", lineHeight: 1.9 };
const inputStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(232,121,249,0.2)", borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.6rem 0.85rem", outline: "none", boxSizing: "border-box", marginTop: "0.5rem" };
const pillRow: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" };
const taStyle: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(232,121,249,0.2)", borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.82rem", padding: "0.75rem", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" };
const backBtn: React.CSSProperties = { background: "transparent", border: "1px solid rgba(232,121,249,0.3)", color: "#E879F9", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", marginBottom: "2rem" };
const exportBtn: React.CSSProperties = { background: "transparent", border: "1px solid rgba(232,121,249,0.3)", color: "rgba(200,195,225,0.6)", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif" };
const primBtn = (active: boolean, rgb: string, ac: string): React.CSSProperties => ({ width: "100%", padding: "1rem", background: active ? `rgba(${rgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${active ? `rgba(${rgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: active ? ac : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: active ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" });
const continueBtn = (rgb: string, ac: string): React.CSSProperties => ({ width: "100%", padding: "0.85rem", background: `rgba(${rgb},0.14)`, border: `1px solid rgba(${rgb},0.45)`, color: ac, borderRadius: "8px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" });
const endLabel = (rgb: string): React.CSSProperties => ({ marginTop: "2rem", textAlign: "center", fontFamily: "'Cinzel', serif", color: `rgba(${rgb},0.5)`, fontSize: "0.7rem", letterSpacing: "3px" });
const loadLabel = (rgb: string): React.CSSProperties => ({ textAlign: "center", padding: "1.5rem", color: `rgba(${rgb},0.5)`, fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" });
const errStyle: React.CSSProperties = { color: "#FF6060", fontSize: "0.75rem", marginTop: "1rem", fontFamily: "'Raleway', sans-serif" };
