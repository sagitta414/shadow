import { useState, useRef, useEffect } from "react";
import OutfitSelector, { outfitPromptLine } from "../components/OutfitSelector";
import UniversalOptions, { UNIVERSAL_DEFAULTS, universalPromptLines, type UniversalConfig } from "../components/UniversalOptions";
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
  "Lex Luthor","Joker","Red Skull","Baron Zemo","Loki","Thanos","Deathstroke","Ra's al Ghul",
  "Sinister","Magneto","Doctor Doom","Homelander","Darkseid","Kingpin","The Collector",
  "Mephisto","Apocalypse","Norman Osborn","Maxwell Lord","Green Goblin","Hela","Carnage",
];
const TENSIONS = [
  { id: "ownership", label: "One wants to own her — the other wants to break her" },
  { id: "purpose",   label: "One wants her for her powers — the other wants her personally" },
  { id: "ideology",  label: "They agree on having her but disagree on everything else" },
  { id: "timeline",  label: "One wants to be patient — the other wants results now" },
  { id: "jealousy",  label: "Both want her exclusively — neither will yield" },
  { id: "debt",      label: "She's the payment for a debt between them — terms disputed" },
];
const SETTINGS = [
  "A shared facility — each villain has their own wing",
  "A neutral location — neither's territory",
  "One villain's stronghold — the other is a reluctant guest",
  "An active conflict zone — cooperation driven by necessity",
  "A moving transport — they're stuck together until arrival",
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const acc = "#FB7185";
const accRgb = "251,113,133";

export default function VillainTeamUpMode({ onBack }: Props) {
  const [step, setStep] = useState<1|2|3>(1);
  const [heroine, setHeroine] = useState("");
  const [customHeroine, setCustomHeroine] = useState("");
  const [villain1, setVillain1] = useState("");
  const [villain2, setVillain2] = useState("");
  const [tension, setTension] = useState("");
  const [setting, setSetting] = useState("");
  const [chapters, setChapters] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [continueDir, setContinueDir] = useState("");
  const [savedId, setSavedId] = useState<string|null>(null);
  const [error, setError] = useState("");
  const [outfitId, setOutfitId] = useState("");
  const [universalConfig, setUniversalConfig] = useState<UniversalConfig>(UNIVERSAL_DEFAULTS);
  const [allianceStability, setAllianceStability] = useState("");
  const [allianceDominant, setAllianceDominant] = useState("");
  const [outfitDamage, setOutfitDamage] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fH = customHeroine.trim() || heroine;
  const canStep2 = !!fH;
  const canGen = fH && villain1 && villain2 && villain1 !== villain2 && tension && setting;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  async function generate(isFirst: boolean) {
    if (isFirst) { setLoading(true); setChapters([]); setSavedId(null); }
    else setContinuing(true);
    setStreamingText(""); setError("");
    try {
      const resp = await fetch(`${BASE}/api/story/villain-team-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: getAiProvider(), outfitContext: outfitPromptLine(outfitId, outfitDamage), universalContext: universalPromptLines(universalConfig), modeContext: (() => { const _allianceStabilityMap: Record<string,string> = {"fragile":"Fragile — About to Break","uneasy":"Uneasy — Constant Tension","coordinated":"Surprisingly Coordinated"};
      const _allianceDominantMap: Record<string,string> = {"villain1":"First Villain","villain2":"Second Villain","equal":"Genuinely Equal"}; return [allianceStability ? `Alliance Stability: ${_allianceStabilityMap[allianceStability] ?? allianceStability}` : "", allianceDominant ? `Upper Hand: ${_allianceDominantMap[allianceDominant] ?? allianceDominant}` : ""].filter(Boolean).join("\n"); })(), allianceStability, allianceDominant, heroine: fH, villain1, villain2, tension, setting, chapters: isFirst ? [] : chapters, chapterNumber: isFirst ? 1 : chapters.length + 1, continueDir }),
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
        const id = saveStoryToArchive({ title: `${fH} — ${villain1} & ${villain2}`, universe: "Villain Team-Up", tool: "Villain Team-Up", characters: [fH, villain1, villain2], chapters: newChapters });
        setSavedId(id);
      } else if (savedId) {
        updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
      }
    } catch(e) { setError(String(e)); }
    finally { setLoading(false); setContinuing(false); }
  }

  const pill = (label: string, active: boolean, onClick: () => void, disabled = false) => (
    <button key={label} onClick={onClick} disabled={disabled} style={{ padding: "0.4rem 0.85rem", borderRadius: "20px", border: `1px solid ${active ? acc : `rgba(${accRgb},0.2)`}`, background: active ? `rgba(${accRgb},0.18)` : "transparent", color: active ? acc : disabled ? "rgba(200,195,225,0.2)" : "rgba(200,195,225,0.5)", fontSize: "0.72rem", cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.2s", fontFamily: "'Raleway', sans-serif" }}>
      {label}
    </button>
  );

  function buildExport() {
    return { id: savedId ?? "tmp", title: `${fH} — ${villain1} & ${villain2}`, createdAt: Date.now(), universe: "Villain Team-Up", tool: "Villain Team-Up", characters: [fH, villain1, villain2], chapters, tags: [], favourite: false, wordCount: chapters.join(" ").split(/\s+/).filter(Boolean).length };
  }

  if (step === 3) {
    if (loading && chapters.length === 0) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
          <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", color: acc, letterSpacing: "4px", animation: "pulse 2s ease-in-out infinite" }}>An uneasy alliance forms…</div>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.4)`, fontFamily: "'Raleway', sans-serif", letterSpacing: "2px" }}>{villain1} & {villain2}</div>
        </div>
      );
    }
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <button onClick={() => { setStep(1); setChapters([]); }} style={bBtn(acc, accRgb)}>← NEW</button>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: acc, letterSpacing: "3px", margin: 0, flex: 1 }}>VILLAIN TEAM-UP</h1>
          <button onClick={() => exportStoryAsTXT(buildExport())} style={eBtn(accRgb)}>TXT</button>
          <button onClick={() => exportStoryAsPDF(buildExport())} style={eBtn(accRgb)}>PDF</button>
        </div>
        <div style={{ background: `rgba(${accRgb},0.06)`, border: `1px solid rgba(${accRgb},0.18)`, borderRadius: "12px", padding: "1rem 1.5rem", marginBottom: "2rem", display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "center" }}>
          <Mi label="SUBJECT" value={fH} rgb={accRgb} />
          <Mi label="PARTNER 1" value={villain1} rgb={accRgb} />
          <div style={{ fontSize: "1.2rem", color: `rgba(${accRgb},0.4)` }}>⚔</div>
          <Mi label="PARTNER 2" value={villain2} rgb={accRgb} />
          <Mi label="TENSION" value={TENSIONS.find(t => t.id === tension)?.label ?? tension} rgb={accRgb} />
        </div>
        {chapters.map((ch, i) => (
          <div key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0 1.25rem" }}>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", color: `rgba(${accRgb},0.55)`, letterSpacing: "3px" }}>CHAPTER {i+1}</span>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
            </div>
            <p style={prose}>{ch}</p>
          </div>
        ))}
        {streamingText && <p style={{ ...prose, opacity: 0.85 }}>{streamingText}</p>}
        <div ref={bottomRef} />
        {!loading && !continuing && chapters.length < 6 && (
          <div style={{ marginTop: "2rem", background: "rgba(0,0,0,0.4)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "12px", padding: "1.5rem" }}>
            <textarea value={continueDir} onChange={e => setContinueDir(e.target.value)} placeholder={`Steer chapter ${chapters.length + 1}… (e.g. "${villain1} and ${villain2} clash over her", "she tries to exploit the rift between them")`} rows={2} style={taS(accRgb)} />
            <button onClick={() => generate(false)} disabled={continuing} style={cBtn(acc, accRgb)}>{continuing ? "WRITING…" : "⚔ NEXT CHAPTER"}</button>
          </div>
        )}
        {chapters.length >= 6 && <div style={eL(accRgb)}>— THE ALLIANCE FRACTURES OR HOLDS. —</div>}
        {continuing && <div style={lL(accRgb)}>The negotiation continues…</div>}

        <OutfitSelector
          outfitId={outfitId}
          damage={outfitDamage}
          onOutfitChange={setOutfitId}
          onDamageChange={setOutfitDamage}
          accentColor="#FB7185"
          accentRgb="251,113,133"
        />
                {error && <div style={err}>Error: {error}</div>}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "720px", margin: "0 auto" }}>
        <button onClick={() => setStep(1)} style={bBtn(acc, accRgb)}>← BACK</button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", color: acc, letterSpacing: "3px", margin: "0 0 2rem" }}>CONFIGURE THE ALLIANCE</h1>
        <Sec title="PARTNER 1" rgb={accRgb}>
          <div style={pr}>{VILLAINS.map(v => pill(v, villain1 === v, () => setVillain1(v), villain2 === v))}</div>
        </Sec>
        <Sec title="PARTNER 2" rgb={accRgb} subtitle="(must be different from Partner 1)">
          <div style={pr}>{VILLAINS.map(v => pill(v, villain2 === v, () => setVillain2(v), villain1 === v))}</div>
        </Sec>
        <Sec title="CORE TENSION — WHAT THEY DISAGREE ON" rgb={accRgb}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {TENSIONS.map(t => (
              <button key={t.id} onClick={() => setTension(t.id)} style={{ background: tension === t.id ? `rgba(${accRgb},0.16)` : "rgba(0,0,0,0.4)", border: `1px solid ${tension === t.id ? `rgba(${accRgb},0.5)` : "rgba(255,255,255,0.06)"}`, borderRadius: "10px", padding: "0.75rem", cursor: "pointer", textAlign: "left", color: tension === t.id ? acc : "#CCC", fontFamily: "'Raleway', sans-serif", fontSize: "0.72rem" }}>
                {t.label}
              </button>
            ))}
          </div>
        </Sec>
        <Sec title="SETTING" rgb={accRgb}>
          <div style={pr}>{SETTINGS.map(s => pill(s, setting === s, () => setSetting(s)))}</div>
        </Sec>
        {!canGen && villain1 && villain2 && villain1 === villain2 && <div style={{ color: "#FBBF24", fontSize: "0.7rem", marginBottom: "1rem" }}>Partner 1 and Partner 2 must be different villains.</div>}
        <button onClick={() => { if (canGen) { setStep(3); generate(true); } }} disabled={!canGen} style={pBtn(canGen, accRgb, acc)}>
          ⚔ BEGIN THE ALLIANCE
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
        <button onClick={onBack} style={bBtn(acc, accRgb)}>← HOME</button>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.2rem,3vw,1.8rem)", color: acc, letterSpacing: "4px", margin: 0 }}>VILLAIN TEAM-UP</h1>
          <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginTop: "0.2rem" }}>TWO VILLAINS. ONE CAPTIVE. IRRECONCILABLE DIFFERENCES.</div>
        </div>
      </div>
      <Sec title="SELECT SUBJECT" rgb={accRgb}>
        <div style={pr}>{HEROINES.map(h => pill(h, heroine === h, () => { setHeroine(h); setCustomHeroine(""); }))}</div>
        <input value={customHeroine} onChange={e => { setCustomHeroine(e.target.value); setHeroine(""); }} placeholder="Or type a custom name…" style={inpS(accRgb)} />
      </Sec>
      <button onClick={() => { if (canStep2) setStep(2); }} disabled={!canStep2} style={pBtn(canStep2, accRgb, acc)}>CONFIGURE THE ALLIANCE →</button>
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
function Mi({ label, value, rgb }: { label: string; value: string; rgb: string }) {
  return <div><div style={{ fontSize: "0.48rem", color: `rgba(${rgb},0.5)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.15rem" }}>{label}</div><div style={{ fontSize: "0.78rem", color: "#EEE", fontFamily: "'Raleway', sans-serif", maxWidth: "200px" }}>{value}</div></div>;
}
const prose: React.CSSProperties = { fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1rem", color: "rgba(230,225,255,0.85)", lineHeight: 1.9 };
const pr: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" };
const inpS = (rgb: string): React.CSSProperties => ({ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${rgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.6rem 0.85rem", outline: "none", boxSizing: "border-box", marginTop: "0.5rem" });
const taS = (rgb: string): React.CSSProperties => ({ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${rgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.82rem", padding: "0.75rem", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" });
const bBtn = (ac: string, rgb: string): React.CSSProperties => ({ background: "transparent", border: `1px solid rgba(${rgb},0.3)`, color: ac, borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", marginBottom: "2rem" });
const eBtn = (rgb: string): React.CSSProperties => ({ background: "transparent", border: `1px solid rgba(${rgb},0.3)`, color: "rgba(200,195,225,0.6)", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif" });
const pBtn = (active: boolean, rgb: string, ac: string): React.CSSProperties => ({ width: "100%", padding: "1rem", background: active ? `rgba(${rgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${active ? `rgba(${rgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: active ? ac : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: active ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" });
const cBtn = (ac: string, rgb: string): React.CSSProperties => ({ width: "100%", padding: "0.85rem", background: `rgba(${rgb},0.14)`, border: `1px solid rgba(${rgb},0.45)`, color: ac, borderRadius: "8px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" });
const eL = (rgb: string): React.CSSProperties => ({ marginTop: "2rem", textAlign: "center", fontFamily: "'Cinzel', serif", color: `rgba(${rgb},0.5)`, fontSize: "0.7rem", letterSpacing: "3px" });
const lL = (rgb: string): React.CSSProperties => ({ textAlign: "center", padding: "1.5rem", color: `rgba(${rgb},0.5)`, fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" });
const err: React.CSSProperties = { color: "#FF6060", fontSize: "0.75rem", marginTop: "1rem", fontFamily: "'Raleway', sans-serif" };
