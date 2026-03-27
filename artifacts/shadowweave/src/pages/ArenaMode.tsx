import { useState, useRef, useEffect } from "react";
import { getAiProvider } from "../lib/aiProvider";
import { saveStoryToArchive, updateArchiveStory, exportStoryAsTXT, exportStoryAsPDF } from "../lib/archive";

interface Props { onBack: () => void; }

const HEROINES = [
  "Wonder Woman","Black Widow","Supergirl","Scarlet Witch","Captain Marvel","Storm",
  "Black Canary","Zatanna","Batgirl","Jean Grey","Rogue","Psylocke","Emma Frost",
  "Starlight","Kimiko","Starfire","Raven","Huntress","She-Hulk","Invisible Woman",
  "Jessica Jones","Leia Organa","Ahsoka Tano","Black Cat","Spider-Woman","Valkyrie","Power Girl",
  "Catwoman","Tigra","Firestar","Hawkgirl","Silk Spectre",
];
const PROMOTERS = [
  "Kingpin","The Collector","Lex Luthor","The Grandmaster","Doctor Doom",
  "Darkseid","Ra's al Ghul","Mephisto","Apocalypse","Baron Zemo",
];
const CROWD_TYPES = [
  "Villain syndicate members and senior associates",
  "Anonymous underground gamblers — identities hidden",
  "Paying spectators from the criminal underworld",
  "A small exclusive group of high-value guests",
  "Encrypted live stream — viewers bet remotely",
  "Mixed crowd — rivals, clients, buyers, spectators",
];
const POWER_SUPPRESSION = [
  "Complete suppression — zero powers, fighting on pure physicality",
  "Partial — enhanced strength and speed only, no special abilities",
  "Staged withdrawal — powers cut mid-fight without warning",
  "Psychological suppression — compliance enforced through consequence",
];
const STAKES = [
  "The loser faces the promoter alone after the fight",
  "Winner earns one privilege; loser loses one",
  "The loser is handed to the crowd after",
  "Both continue regardless — no mercy rule, no end until the promoter decides",
  "The loser is passed to a waiting buyer",
  "Winner decides what happens to the loser",
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const acc = "#F97316";
const accRgb = "249,115,22";

export default function ArenaMode({ onBack }: Props) {
  const [step, setStep] = useState<1|2|3>(1);
  const [fighters, setFighters] = useState<string[]>([]);
  const [customFighter, setCustomFighter] = useState("");
  const [promoter, setPromoter] = useState("");
  const [crowdType, setCrowdType] = useState("");
  const [powerSuppression, setPowerSuppression] = useState("");
  const [stakes, setStakes] = useState("");
  const [matchRecord, setMatchRecord] = useState<string[]>([]);
  const [chapters, setChapters] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [continueDir, setContinueDir] = useState("");
  const [savedId, setSavedId] = useState<string|null>(null);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const allFighters = customFighter.trim() ? [...fighters, customFighter.trim()] : fighters;
  const canStep2 = allFighters.length >= 2;
  const canGen = allFighters.length >= 2 && promoter && crowdType && powerSuppression && stakes;
  const matchNum = chapters.length + 1;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  function toggleFighter(h: string) {
    setFighters(prev => prev.includes(h) ? prev.filter(x => x !== h) : prev.length < 4 ? [...prev, h] : prev);
  }

  async function generate(isFirst: boolean) {
    if (isFirst) { setLoading(true); setChapters([]); setMatchRecord([]); setSavedId(null); }
    else setContinuing(true);
    setStreamingText(""); setError("");
    try {
      const resp = await fetch(`${BASE}/api/story/arena-mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: getAiProvider(), fighters: allFighters, promoter, crowdType, powerSuppression, stakes, chapters: isFirst ? [] : chapters, matchNumber: isFirst ? 1 : matchNum, continueDir }),
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
      const newRecord = isFirst ? [`Match 1 — ${allFighters.join(" vs ")}`] : [...matchRecord, `Match ${matchNum}`];
      setChapters(newChapters); setMatchRecord(newRecord); setStreamingText(""); setContinueDir("");
      if (isFirst) {
        const id = saveStoryToArchive({ title: `${promoter}'s Arena — ${allFighters.join(", ")}`, universe: "Arena Mode", tool: "Arena Mode", characters: [...allFighters, promoter], chapters: newChapters });
        setSavedId(id);
      } else if (savedId) {
        updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
      }
    } catch(e) { setError(String(e)); }
    finally { setLoading(false); setContinuing(false); }
  }

  function buildExport() {
    return { id: savedId ?? "tmp", title: `${promoter}'s Arena — ${allFighters.join(", ")}`, createdAt: Date.now(), universe: "Arena Mode", tool: "Arena Mode", characters: [...allFighters, promoter], chapters, tags: [], favourite: false, wordCount: chapters.join(" ").split(/\s+/).filter(Boolean).length };
  }

  const pill = (label: string, active: boolean, onClick: () => void, disabled = false) => (
    <button key={label} onClick={onClick} disabled={disabled} style={{ padding: "0.4rem 0.85rem", borderRadius: "20px", border: `1px solid ${active ? acc : `rgba(${accRgb},0.2)`}`, background: active ? `rgba(${accRgb},0.18)` : "transparent", color: active ? acc : disabled ? "rgba(200,195,225,0.2)" : "rgba(200,195,225,0.5)", fontSize: "0.72rem", cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.2s", fontFamily: "'Raleway', sans-serif" }}>
      {label}
    </button>
  );

  if (step === 3) {
    if (loading && chapters.length === 0) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
          <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", color: acc, letterSpacing: "4px", animation: "pulse 2s ease-in-out infinite" }}>The crowd takes their seats…</div>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.4)`, fontFamily: "'Raleway', sans-serif", letterSpacing: "2px" }}>{allFighters.join(" vs ")}</div>
        </div>
      );
    }
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "920px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <button onClick={() => { setStep(1); setChapters([]); setMatchRecord([]); }} style={aB}>← NEW ARENA</button>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: acc, letterSpacing: "3px", margin: 0, flex: 1 }}>ARENA MODE</h1>
          <button onClick={() => exportStoryAsTXT(buildExport())} style={aE}>TXT</button>
          <button onClick={() => exportStoryAsPDF(buildExport())} style={aE}>PDF</button>
        </div>

        {/* Match record */}
        <div style={{ background: `rgba(${accRgb},0.06)`, border: `1px solid rgba(${accRgb},0.18)`, borderRadius: "12px", padding: "1rem 1.5rem", marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.5rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginBottom: "0.75rem" }}>MATCH RECORD — {promoter.toUpperCase()}'S ARENA</div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <div><div style={{ fontSize: "0.48rem", color: `rgba(${accRgb},0.45)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.15rem" }}>FIGHTERS</div><div style={{ fontSize: "0.75rem", color: "#EEE", fontFamily: "'Raleway', sans-serif" }}>{allFighters.join(" · ")}</div></div>
            <div><div style={{ fontSize: "0.48rem", color: `rgba(${accRgb},0.45)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.15rem" }}>MATCHES COMPLETED</div><div style={{ fontSize: "0.75rem", color: acc, fontFamily: "'Raleway', sans-serif" }}>{chapters.length}</div></div>
            <div><div style={{ fontSize: "0.48rem", color: `rgba(${accRgb},0.45)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.15rem" }}>STAKES</div><div style={{ fontSize: "0.7rem", color: "#DDD", fontFamily: "'Raleway', sans-serif", maxWidth: "220px" }}>{stakes}</div></div>
          </div>
        </div>

        {chapters.map((ch, i) => (
          <div key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0 1.25rem" }}>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", color: `rgba(${accRgb},0.55)`, letterSpacing: "3px" }}>MATCH {i+1}</span>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
            </div>
            <p style={aP}>{ch}</p>
          </div>
        ))}
        {streamingText && <p style={{ ...aP, opacity: 0.85 }}>{streamingText}</p>}
        <div ref={bottomRef} />
        {!loading && !continuing && chapters.length < 5 && (
          <div style={{ marginTop: "2rem", background: "rgba(0,0,0,0.4)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "12px", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.6)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.5rem" }}>MATCH {matchNum}</div>
            <textarea value={continueDir} onChange={e => setContinueDir(e.target.value)} placeholder="Steer this match… (optional — e.g. 'the crowd demands something specific', 'one fighter refuses to fight', 'the promoter intervenes')" rows={2} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.82rem", padding: "0.75rem", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" }} />
            <button onClick={() => generate(false)} disabled={continuing} style={{ width: "100%", padding: "0.85rem", background: `rgba(${accRgb},0.14)`, border: `1px solid rgba(${accRgb},0.45)`, color: acc, borderRadius: "8px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" }}>
              {continuing ? "MATCH IN PROGRESS…" : "🏟 NEXT MATCH"}
            </button>
          </div>
        )}
        {chapters.length >= 5 && <div style={{ marginTop: "2rem", textAlign: "center", fontFamily: "'Cinzel', serif", color: `rgba(${accRgb},0.5)`, fontSize: "0.7rem", letterSpacing: "3px" }}>— THE ARENA NEVER CLOSES. —</div>}
        {continuing && <div style={{ textAlign: "center", padding: "1.5rem", color: `rgba(${accRgb},0.5)`, fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" }}>The crowd waits…</div>}
        {error && <div style={{ color: "#FF6060", fontSize: "0.75rem", marginTop: "1rem" }}>Error: {error}</div>}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "720px", margin: "0 auto" }}>
        <button onClick={() => setStep(1)} style={aB}>← BACK</button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", color: acc, letterSpacing: "3px", margin: "0 0 2rem" }}>CONFIGURE THE ARENA</h1>
        <AS title="PROMOTER / OWNER" rgb={accRgb}>
          <div style={aR}>{PROMOTERS.map(p => pill(p, promoter === p, () => setPromoter(p)))}</div>
        </AS>
        <AS title="CROWD TYPE" rgb={accRgb}>
          <div style={aR}>{CROWD_TYPES.map(c => pill(c, crowdType === c, () => setCrowdType(c)))}</div>
        </AS>
        <AS title="POWER SUPPRESSION" rgb={accRgb}>
          <div style={aR}>{POWER_SUPPRESSION.map(p => pill(p, powerSuppression === p, () => setPowerSuppression(p)))}</div>
        </AS>
        <AS title="STAKES" rgb={accRgb}>
          <div style={aR}>{STAKES.map(s => pill(s, stakes === s, () => setStakes(s)))}</div>
        </AS>
        <button onClick={() => { if (canGen) { setStep(3); generate(true); } }} disabled={!canGen} style={{ width: "100%", padding: "1rem", background: canGen ? `rgba(${accRgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${canGen ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: canGen ? acc : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: canGen ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" }}>
          🏟 OPEN THE ARENA
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "820px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
        <button onClick={onBack} style={aB}>← HOME</button>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.2rem,3vw,1.8rem)", color: acc, letterSpacing: "4px", margin: 0 }}>ARENA MODE</h1>
          <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginTop: "0.2rem" }}>POWERS SUPPRESSED. CROWD WATCHING. NO MERCY RULE.</div>
        </div>
      </div>
      <AS title={`SELECT FIGHTERS — ${fighters.length}/4 CHOSEN (min. 2)`} rgb={accRgb}>
        <div style={aR}>{HEROINES.map(h => pill(h, fighters.includes(h), () => toggleFighter(h), !fighters.includes(h) && fighters.length >= 4))}</div>
        <input value={customFighter} onChange={e => setCustomFighter(e.target.value)} placeholder="Add a custom fighter…" style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.6rem 0.85rem", outline: "none", boxSizing: "border-box", marginTop: "0.5rem" }} />
      </AS>
      <button onClick={() => { if (canStep2) setStep(2); }} disabled={!canStep2} style={{ width: "100%", padding: "1rem", background: canStep2 ? `rgba(${accRgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${canStep2 ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: canStep2 ? acc : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: canStep2 ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" }}>
        CONFIGURE THE ARENA →
      </button>
    </div>
  );
}

function AS({ title, children, rgb }: { title: string; children: React.ReactNode; rgb: string }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ borderBottom: `1px solid rgba(${rgb},0.12)`, paddingBottom: "0.4rem", marginBottom: "0.875rem" }}>
        <div style={{ fontSize: "0.55rem", color: `rgba(${rgb},0.6)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif" }}>{title}</div>
      </div>
      {children}
    </div>
  );
}

const aP: React.CSSProperties = { fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1rem", color: "rgba(230,225,255,0.85)", lineHeight: 1.9 };
const aR: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" };
const aB: React.CSSProperties = { background: "transparent", border: "1px solid rgba(249,115,22,0.3)", color: "#F97316", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", marginBottom: "2rem" };
const aE: React.CSSProperties = { background: "transparent", border: "1px solid rgba(249,115,22,0.3)", color: "rgba(200,195,225,0.6)", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif" };
