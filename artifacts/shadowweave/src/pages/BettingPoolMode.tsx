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
  "Jessica Jones","Leia Organa","Ahsoka Tano","Black Cat","Spider-Woman",
  "Valkyrie","Power Girl","Catwoman","Poison Ivy","Silk Spectre",
];
const BETTERS_POOL = [
  "Joker","Red Skull","Baron Zemo","Loki","Deathstroke","Sinister","Homelander",
  "Darkseid","Magneto","Doctor Doom","Thanos","Green Goblin","Apocalypse","Carnage",
  "Kingpin","Maxwell Lord","Lex Luthor","Mephisto","Ra's al Ghul","Hela",
  "Crossbones","Ultron","Enchantress","Venom","Tombstone",
];
const BET_FORMATS = [
  "Time-based — who breaks her fastest wins the pot",
  "Method-based — each villain uses only their assigned technique",
  "Elimination — lowest-progress villain is removed each round",
  "Session limit — fixed turns each, highest progress wins",
  "Open competition — no rules, anything goes",
];
const SETTINGS = [
  "An underground viewing chamber — other villains watch from behind glass",
  "A purpose-built competition arena — scoreboard visible to all",
  "A shared facility — each villain has their own wing",
  "A remote compound — results reported by messenger each round",
  "A live stream — other villains bet remotely in real time",
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const acc = "#A78BFA";
const accRgb = "167,139,250";

function getResistance(chapCount: number) {
  return Math.max(3, 100 - chapCount * 16);
}

export default function BettingPoolMode({ onBack }: Props) {
  const [step, setStep] = useState<1|2|3>(1);
  const [heroine, setHeroine] = useState("");
  const [customHeroine, setCustomHeroine] = useState("");
  const [betters, setBetters] = useState<string[]>([]);
  const [betFormat, setBetFormat] = useState("");
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
  const [audienceType, setAudienceType] = useState("");
  const [commentaryTone, setCommentaryTone] = useState("");
  const [outfitDamage, setOutfitDamage] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fH = customHeroine.trim() || heroine;
  const canStep2 = !!fH;
  const canGen = fH && betters.length >= 2 && betFormat && setting;
  const currentVillain = betters.length > 0 ? betters[chapters.length % betters.length] : "";
  const resistance = getResistance(chapters.length);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  function toggleBetter(v: string) {
    setBetters(prev => prev.includes(v) ? prev.filter(x => x !== v) : prev.length < 6 ? [...prev, v] : prev);
  }

  async function generate(isFirst: boolean) {
    if (isFirst) { setLoading(true); setChapters([]); setSavedId(null); }
    else setContinuing(true);
    setStreamingText(""); setError("");
    try {
      const resp = await fetch(`${BASE}/api/story/betting-pool`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: getAiProvider(), outfitContext: outfitPromptLine(outfitId, outfitDamage), universalContext: universalPromptLines(universalConfig), modeContext: (() => { const _audienceTypeMap: Record<string,string> = {"private_syndicate":"Villain Syndicate","paying_spectators":"Paying Spectators","small_elite_group":"Small Elite Group","encrypted_stream":"Encrypted Live Stream","mixed_criminal":"Mixed Criminal Crowd"};
      const _commentaryToneMap: Record<string,string> = {"crude_betting":"Crude Betting Talk","clinical_scoring":"Clinical Scoring","excited_crowd":"Excited Crowd","silent_tension":"Tense Silence"}; return [audienceType ? `Audience Type: ${_audienceTypeMap[audienceType] ?? audienceType}` : "", commentaryTone ? `Commentary Tone: ${_commentaryToneMap[commentaryTone] ?? commentaryTone}` : ""].filter(Boolean).join("\n"); })(), audienceType, commentaryTone, heroine: fH, betters, betFormat, setting, chapters: isFirst ? [] : chapters, sessionNumber: isFirst ? 1 : chapters.length + 1, activeVillain: isFirst ? betters[0] : currentVillain, continueDir }),
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
        const id = saveStoryToArchive({ title: `${fH} — The Betting Pool`, universe: "Betting Pool", tool: "Betting Pool", characters: [fH, ...betters], chapters: newChapters });
        setSavedId(id);
      } else if (savedId) {
        updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
      }
    } catch(e) { setError(String(e)); }
    finally { setLoading(false); setContinuing(false); }
  }

  function buildExport() {
    return { id: savedId ?? "tmp", title: `${fH} — The Betting Pool`, createdAt: Date.now(), universe: "Betting Pool", tool: "Betting Pool", characters: [fH, ...betters], chapters, tags: [], favourite: false, wordCount: chapters.join(" ").split(/\s+/).filter(Boolean).length };
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
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", color: acc, letterSpacing: "4px", animation: "pulse 2s ease-in-out infinite" }}>The bets are placed…</div>
          <div style={{ fontSize: "0.65rem", color: `rgba(${accRgb},0.4)`, fontFamily: "'Raleway', sans-serif", letterSpacing: "2px" }}>Resistance: 100%</div>
        </div>
      );
    }
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "940px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <button onClick={() => { setStep(1); setChapters([]); }} style={backBtn(acc, accRgb)}>← NEW POOL</button>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color: acc, letterSpacing: "3px", margin: 0, flex: 1 }}>THE BETTING POOL</h1>
          <button onClick={() => exportStoryAsTXT(buildExport())} style={expBtn(acc, accRgb)}>TXT</button>
          <button onClick={() => exportStoryAsPDF(buildExport())} style={expBtn(acc, accRgb)}>PDF</button>
        </div>

        {/* Scoreboard */}
        <div style={{ background: `rgba(${accRgb},0.06)`, border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "12px", padding: "1.25rem 1.5rem", marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.5rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginBottom: "1rem" }}>COMPETITION STANDINGS — {fH.toUpperCase()}</div>
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
              <span style={{ fontSize: "0.55rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif" }}>RESISTANCE</span>
              <span style={{ fontSize: "0.7rem", color: resistance > 50 ? "#4ADE80" : resistance > 25 ? "#FBBF24" : "#EF4444", fontFamily: "'Raleway', sans-serif", fontWeight: 700 }}>{resistance}%</span>
            </div>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${resistance}%`, background: resistance > 50 ? "#4ADE80" : resistance > 25 ? "#FBBF24" : "#EF4444", borderRadius: "3px", transition: "width 0.8s ease" }} />
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {betters.map((v, i) => {
              const turns = chapters.filter((_, ci) => ci % betters.length === i).length;
              const isNext = chapters.length % betters.length === i;
              return (
                <div key={v} style={{ background: isNext && !loading && !continuing ? `rgba(${accRgb},0.12)` : "rgba(0,0,0,0.3)", border: `1px solid ${isNext && !loading && !continuing ? `rgba(${accRgb},0.4)` : "rgba(255,255,255,0.06)"}`, borderRadius: "8px", padding: "0.5rem 0.875rem" }}>
                  <div style={{ fontSize: "0.6rem", color: isNext && !loading && !continuing ? acc : "#AAA", fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>{v}</div>
                  <div style={{ fontSize: "0.5rem", color: "rgba(200,195,225,0.35)", fontFamily: "'Raleway', sans-serif", marginTop: "0.15rem" }}>{turns} session{turns !== 1 ? "s" : ""}{isNext && !loading && !continuing ? " ← NEXT" : ""}</div>
                </div>
              );
            })}
          </div>
        </div>

        {chapters.map((ch, i) => (
          <div key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0 1.25rem" }}>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", color: `rgba(${accRgb},0.55)`, letterSpacing: "3px" }}>SESSION {i+1} — {betters[i % betters.length]?.toUpperCase()}</span>
              <div style={{ flex: 1, height: "1px", background: `rgba(${accRgb},0.18)` }} />
            </div>
            <p style={prose}>{ch}</p>
          </div>
        ))}
        {streamingText && <p style={{ ...prose, opacity: 0.85 }}>{streamingText}</p>}
        <div ref={bottomRef} />

        {!loading && !continuing && chapters.length < 6 && (
          <div style={{ marginTop: "2rem", background: "rgba(0,0,0,0.4)", border: `1px solid rgba(${accRgb},0.2)`, borderRadius: "12px", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.6)`, letterSpacing: "2px", fontFamily: "'Cinzel', serif", marginBottom: "0.5rem" }}>
              SESSION {chapters.length + 1} — {currentVillain.toUpperCase()}'S TURN
            </div>
            <textarea value={continueDir} onChange={e => setContinueDir(e.target.value)} placeholder={`Steer ${currentVillain}'s session… (optional)`} rows={2} style={ta(accRgb)} />
            <button onClick={() => generate(false)} disabled={continuing} style={contBtn(acc, accRgb)}>
              {continuing ? "SESSION IN PROGRESS…" : `🎲 ${currentVillain.toUpperCase()}'S TURN`}
            </button>
          </div>
        )}
        {chapters.length >= 6 && <div style={endLbl(accRgb)}>— THE BETS ARE SETTLED. —</div>}
        {continuing && <div style={loadLbl(accRgb)}>The next session begins…</div>}

        <OutfitSelector
          outfitId={outfitId}
          damage={outfitDamage}
          onOutfitChange={setOutfitId}
          onDamageChange={setOutfitDamage}
          accentColor="#A78BFA"
          accentRgb="167,139,250"
        />
                {error && <div style={errStyle}>Error: {error}</div>}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "720px", margin: "0 auto" }}>
        <button onClick={() => setStep(1)} style={backBtn(acc, accRgb)}>← BACK</button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.3rem", color: acc, letterSpacing: "3px", margin: "0 0 2rem" }}>SET THE TERMS</h1>
        <Sec title="SELECT BETTERS" subtitle={`2–6 villains — ${betters.length} selected`} rgb={accRgb}>
          <div style={pillRow}>{BETTERS_POOL.map(v => pill(v, betters.includes(v), () => toggleBetter(v), !betters.includes(v) && betters.length >= 6))}</div>
        </Sec>
        <Sec title="BET FORMAT" rgb={accRgb}>
          <div style={pillRow}>{BET_FORMATS.map(f => pill(f, betFormat === f, () => setBetFormat(f)))}</div>
        </Sec>
        <Sec title="ARENA / SETTING" rgb={accRgb}>
          <div style={pillRow}>{SETTINGS.map(s => pill(s, setting === s, () => setSetting(s)))}</div>
        </Sec>
        {error && <div style={errStyle}>{error}</div>}
        <button onClick={() => { if (canGen) { setStep(3); generate(true); } }} disabled={!canGen} style={primBtn(canGen, accRgb, acc)}>
          🎲 PLACE THE BETS
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
        <button onClick={onBack} style={backBtn(acc, accRgb)}>← HOME</button>
        <div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.2rem,3vw,1.8rem)", color: acc, letterSpacing: "4px", margin: 0 }}>THE BETTING POOL</h1>
          <div style={{ fontSize: "0.6rem", color: `rgba(${accRgb},0.5)`, letterSpacing: "3px", fontFamily: "'Cinzel', serif", marginTop: "0.2rem" }}>WHO BREAKS HER FIRST — RESISTANCE TRACKED LIVE</div>
        </div>
      </div>
      <Sec title="SELECT SUBJECT" rgb={accRgb}>
        <div style={pillRow}>{HEROINES.map(h => pill(h, heroine === h, () => { setHeroine(h); setCustomHeroine(""); }))}</div>
        <input value={customHeroine} onChange={e => { setCustomHeroine(e.target.value); setHeroine(""); }} placeholder="Or type a custom name…" style={inp(accRgb)} />
      </Sec>
      <button onClick={() => { if (canStep2) setStep(2); }} disabled={!canStep2} style={primBtn(canStep2, accRgb, acc)}>CONFIGURE THE POOL →</button>
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

const prose: React.CSSProperties = { fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1rem", color: "rgba(230,225,255,0.85)", lineHeight: 1.9 };
const pillRow: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" };
const inp = (rgb: string): React.CSSProperties => ({ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${rgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", padding: "0.6rem 0.85rem", outline: "none", boxSizing: "border-box", marginTop: "0.5rem" });
const ta = (rgb: string): React.CSSProperties => ({ width: "100%", background: "rgba(255,255,255,0.03)", border: `1px solid rgba(${rgb},0.2)`, borderRadius: "8px", color: "rgba(220,215,245,0.85)", fontFamily: "'Raleway', sans-serif", fontSize: "0.82rem", padding: "0.75rem", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" });
const backBtn = (ac: string, rgb: string): React.CSSProperties => ({ background: "transparent", border: `1px solid rgba(${rgb},0.3)`, color: ac, borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "1px", marginBottom: "2rem" });
const expBtn = (ac: string, rgb: string): React.CSSProperties => ({ background: "transparent", border: `1px solid rgba(${rgb},0.3)`, color: "rgba(200,195,225,0.6)", borderRadius: "6px", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.65rem", fontFamily: "'Cinzel', serif" });
const primBtn = (active: boolean, rgb: string, ac: string): React.CSSProperties => ({ width: "100%", padding: "1rem", background: active ? `rgba(${rgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${active ? `rgba(${rgb},0.5)` : "rgba(255,255,255,0.08)"}`, color: active ? ac : "rgba(200,195,225,0.3)", borderRadius: "10px", cursor: active ? "pointer" : "not-allowed", fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "3px" });
const contBtn = (ac: string, rgb: string): React.CSSProperties => ({ width: "100%", padding: "0.85rem", background: `rgba(${rgb},0.14)`, border: `1px solid rgba(${rgb},0.45)`, color: ac, borderRadius: "8px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" });
const endLbl = (rgb: string): React.CSSProperties => ({ marginTop: "2rem", textAlign: "center", fontFamily: "'Cinzel', serif", color: `rgba(${rgb},0.5)`, fontSize: "0.7rem", letterSpacing: "3px" });
const loadLbl = (rgb: string): React.CSSProperties => ({ textAlign: "center", padding: "1.5rem", color: `rgba(${rgb},0.5)`, fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "2px" });
const errStyle: React.CSSProperties = { color: "#FF6060", fontSize: "0.75rem", marginTop: "1rem", fontFamily: "'Raleway', sans-serif" };
