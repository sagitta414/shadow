import { useState, useRef, useEffect, useMemo } from "react";
import StoryLengthPicker, { type StoryLength } from "../components/StoryLengthPicker";
import HeroinePicker from "../components/HeroinePicker";
import VillainPicker from "../components/VillainPicker";
import PsycheMeter, { type PsycheEvent } from "../components/PsycheMeter";
import ReadingProgressBar from "../components/ReadingProgressBar";
import { getAiProvider } from "../lib/aiProvider";
import { saveStoryToArchive, updateArchiveStory } from "../lib/archive";

interface Props { onBack: () => void; }

const DREAM_ARCHETYPES = [
  "The house she grew up in — twisted, wrong",
  "Her training facility — but the exits are gone",
  "A city street she walks every day — empty and watching",
  "A mirrored room she cannot escape",
  "A version of him she once trusted",
  "Her own bedroom — but it's his",
  "A hospital — clinical, cold, and predatory",
  "Custom nightmare…",
];

const DEPTH_LABELS = ["", "Surface", "Fracturing", "Invaded", "The Deep", "Prison"];
const DEPTH_COLORS = ["", "#A78BFA", "#8B5CF6", "#7C3AED", "#6D28D9", "#4C1D95"];

const PHASE_PSYCHE = [
  { sanityDelta: -5,  resistanceDelta: -4,  event: "The familiar turned threatening — she cannot wake" },
  { sanityDelta: -11, resistanceDelta: -9,  event: "Dream-logic shatters her certainty — is anything real?" },
  { sanityDelta: -18, resistanceDelta: -14, event: "His voice lives inside her mind now — she cannot silence it" },
  { sanityDelta: -24, resistanceDelta: -20, event: "Her body responds to the dream as if it were real — shame and arousal fused" },
  { sanityDelta: -30, resistanceDelta: -26, event: "She knows it is a dream. She cannot wake. He is everywhere." },
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function DreamSequenceMode({ onBack }: Props) {
  const [step, setStep] = useState<1|2|3>(1);
  const [heroine, setHeroine] = useState("");
  const [customHeroine, setCustomHeroine] = useState("");
  const [villain, setVillain] = useState("");
  const [customVillain, setCustomVillain] = useState("");
  const [dreamArchetype, setDreamArchetype] = useState("");
  const [customArchetype, setCustomArchetype] = useState("");
  const [chapters, setChapters] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [continueDir, setContinueDir] = useState("");
  const [savedId, setSavedId] = useState<string|null>(null);
  const [error, setError] = useState("");
  const [storyLength, setStoryLength] = useState<StoryLength>("standard");
  const bottomRef = useRef<HTMLDivElement>(null);

  const finalHeroine = customHeroine || heroine;
  const finalVillain = customVillain || villain;
  const finalArchetype = dreamArchetype === "Custom nightmare…" ? customArchetype : dreamArchetype;
  const currentDepth = Math.min(chapters.length + 1, 5);
  const accent = DEPTH_COLORS[currentDepth] || "#A78BFA";

  const psycheLog: PsycheEvent[] = useMemo(() =>
    chapters.map((_, i) => ({ ...PHASE_PSYCHE[Math.min(i, PHASE_PSYCHE.length - 1)] })),
    [chapters]
  );
  const psycheSanity     = Math.max(0, 100 + psycheLog.reduce((s, e) => s + e.sanityDelta, 0));
  const psycheResistance = Math.max(0, 100 + psycheLog.reduce((s, e) => s + (e.resistanceDelta ?? 0), 0));

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  const canGenerate = finalHeroine && finalVillain && finalArchetype;

  async function generate(isFirst: boolean) {
    if (isFirst) { setLoading(true); setChapters([]); setSavedId(null); }
    else setContinuing(true);
    setStreamingText("");
    setError("");
    try {
      const resp = await fetch(`${BASE}/api/story/dream-sequence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: getAiProvider(), heroine: finalHeroine, villain: finalVillain,
          dreamArchetype: finalArchetype, depth: isFirst ? 1 : currentDepth,
          chapters: isFirst ? [] : chapters, continueDir, storyLength,
        }),
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
      setStreamingText("");
      setContinueDir("");
      if (isFirst) {
        const id = saveStoryToArchive({
          title: `${finalHeroine}'s Nightmare — ${finalVillain}`,
          universe: "Dream Sequence", tool: "Dream Sequence Mode",
          characters: [finalHeroine, finalVillain], storyLength, chapters: newChapters,
        });
        setSavedId(id);
      } else if (savedId) {
        updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally { setLoading(false); setContinuing(false); }
  }

  if (step === 3 && chapters.length > 0) {
    return (
      <div style={{ minHeight: "100vh", background: "#08060F", color: "#e2e8f0", fontFamily: "'EB Garamond', Georgia, serif", padding: "0 0 80px" }}>
        <ReadingProgressBar />
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 0" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(200,200,220,0.5)", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", padding: 0, marginBottom: 24 }}>← BACK</button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: "1.1rem", color: accent, letterSpacing: "3px", textTransform: "uppercase", fontFamily: "'Cinzel', serif", fontWeight: 700 }}>◈ DREAM SEQUENCE</span>
            <span style={{ background: `${accent}22`, border: `1px solid ${accent}55`, borderRadius: 20, padding: "2px 14px", fontSize: "0.68rem", color: accent, letterSpacing: "2px" }}>DEPTH {currentDepth - 1} — {DEPTH_LABELS[Math.max(1, currentDepth - 1)]}</span>
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(200,200,220,0.45)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 28 }}>{finalHeroine} &nbsp;·&nbsp; {finalVillain}</div>

          <PsycheMeter sanity={psycheSanity} resistance={psycheResistance} events={psycheLog} accentColor={accent} />

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 28 }}>
            {chapters.map((_, i) => {
              const dc = DEPTH_COLORS[i + 1] || accent;
              return <span key={i} style={{ background: `${dc}18`, border: `1px solid ${dc}44`, borderRadius: 4, padding: "3px 10px", fontSize: "0.65rem", color: dc, letterSpacing: "1px" }}>Depth {i + 1} — {DEPTH_LABELS[i + 1]}</span>;
            })}
            {streamingText && <span style={{ background: `${accent}22`, border: `1px solid ${accent}`, borderRadius: 4, padding: "3px 10px", fontSize: "0.65rem", color: accent, letterSpacing: "1px" }}>Depth {currentDepth} ▸</span>}
          </div>

          {chapters.map((ch, i) => {
            const dc = DEPTH_COLORS[i + 1] || accent;
            return (
              <div key={i} style={{ marginBottom: 40 }}>
                <div style={{ fontSize: "0.65rem", color: `${dc}88`, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16, borderBottom: `1px solid ${dc}20`, paddingBottom: 8 }}>Depth {i + 1} — {DEPTH_LABELS[i + 1]}</div>
                {ch.split("\n").filter(Boolean).map((p, j) => <p key={j} style={{ lineHeight: 1.88, marginBottom: "0.8em", fontSize: "1.05rem", textIndent: "1.5em" }}>{p}</p>)}
              </div>
            );
          })}

          {streamingText && (
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: "0.65rem", color: accent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16, borderBottom: `1px solid ${accent}55`, paddingBottom: 8 }}>Depth {currentDepth} — Descending…</div>
              {streamingText.split("\n").filter(Boolean).map((p, j) => <p key={j} style={{ lineHeight: 1.88, marginBottom: "0.8em", fontSize: "1.05rem", textIndent: "1.5em" }}>{p}</p>)}
            </div>
          )}

          {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, padding: "12px 16px", color: "#f87171", marginBottom: 24, fontSize: "0.85rem" }}>{error}</div>}

          {!streamingText && !loading && !continuing && currentDepth <= 5 && (
            <div style={{ marginTop: 32 }}>
              <textarea value={continueDir} onChange={e => setContinueDir(e.target.value)} placeholder="Direct the next descent (optional)…" rows={2} style={{ width: "100%", background: `${accent}08`, border: `1px solid ${accent}30`, borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontFamily: "inherit", fontSize: "0.9rem", resize: "vertical", outline: "none", marginBottom: 14, boxSizing: "border-box" }} />
              <button onClick={() => generate(false)} style={{ background: `linear-gradient(135deg, ${accent}25, ${accent}15)`, border: `1px solid ${accent}66`, borderRadius: 8, padding: "12px 28px", color: accent, cursor: "pointer", fontSize: "0.85rem", letterSpacing: "2px", fontFamily: "'Cinzel', serif", fontWeight: 700, textTransform: "uppercase" }}>
                ◈ DESCEND TO DEPTH {currentDepth}
              </button>
            </div>
          )}
          {(loading || continuing) && <div style={{ color: `${accent}99`, fontSize: "0.8rem", letterSpacing: "2px", textTransform: "uppercase", padding: "20px 0" }}>Descending to depth {currentDepth}…</div>}
          <div ref={bottomRef} />
        </div>
      </div>
    );
  }

  const displayAccent = "#A78BFA";
  return (
    <div style={{ minHeight: "100vh", background: "#08060F", color: "#e2e8f0", fontFamily: "'Montserrat', sans-serif", padding: "32px 20px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(200,200,220,0.5)", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", padding: 0, marginBottom: 32 }}>← BACK</button>
        <div style={{ marginBottom: 8, fontSize: "1.4rem", fontFamily: "'Cinzel', serif", fontWeight: 700, color: displayAccent, letterSpacing: "3px" }}>◈ DREAM SEQUENCE</div>
        <div style={{ fontSize: "0.72rem", color: "rgba(200,200,220,0.45)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 32 }}>Reality dissolves. Nightmare takes over. Five layers deep.</div>

        {step === 1 && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: "0.65rem", color: displayAccent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>Heroine</div>
              <HeroinePicker value={heroine} onChange={setHeroine} customValue={customHeroine} onCustomChange={setCustomHeroine} accentColor={displayAccent} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: "0.65rem", color: displayAccent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>The Presence in the Dream</div>
              <VillainPicker value={villain} onChange={setVillain} customValue={customVillain} onCustomChange={setCustomVillain} accentColor={displayAccent} />
            </div>
            <button onClick={() => setStep(2)} disabled={!finalHeroine || !finalVillain} style={{ background: finalHeroine && finalVillain ? `linear-gradient(135deg, rgba(167,139,250,0.25), rgba(167,139,250,0.15))` : "rgba(255,255,255,0.04)", border: `1px solid ${finalHeroine && finalVillain ? displayAccent : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "12px 28px", color: finalHeroine && finalVillain ? displayAccent : "rgba(200,200,220,0.3)", cursor: finalHeroine && finalVillain ? "pointer" : "not-allowed", fontSize: "0.8rem", letterSpacing: "2px", fontFamily: "'Cinzel', serif", fontWeight: 700, textTransform: "uppercase" }}>NEXT →</button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: "0.65rem", color: displayAccent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>Dream Archetype / Core Fear</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                {DREAM_ARCHETYPES.map(a => (
                  <button key={a} onClick={() => setDreamArchetype(a)} style={{ background: dreamArchetype === a ? "rgba(167,139,250,0.18)" : "rgba(255,255,255,0.03)", border: `1px solid ${dreamArchetype === a ? displayAccent : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "10px 12px", color: dreamArchetype === a ? displayAccent : "rgba(200,200,220,0.7)", cursor: "pointer", fontSize: "0.78rem", textAlign: "left", lineHeight: 1.4 }}>{a}</button>
                ))}
              </div>
              {dreamArchetype === "Custom nightmare…" && (
                <input value={customArchetype} onChange={e => setCustomArchetype(e.target.value)} placeholder="Describe her core nightmare…" style={{ width: "100%", background: "rgba(167,139,250,0.04)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontFamily: "inherit", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
              )}
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: "0.65rem", color: displayAccent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>Story Length</div>
              <StoryLengthPicker value={storyLength} onChange={setStoryLength} accentColor={displayAccent} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep(1)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 20px", color: "rgba(200,200,220,0.5)", cursor: "pointer", fontSize: "0.8rem", letterSpacing: "2px", textTransform: "uppercase" }}>← BACK</button>
              <button onClick={() => { setStep(3); generate(true); }} disabled={!canGenerate} style={{ background: canGenerate ? "linear-gradient(135deg, rgba(167,139,250,0.28), rgba(167,139,250,0.15))" : "rgba(255,255,255,0.04)", border: `1px solid ${canGenerate ? displayAccent : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "12px 28px", color: canGenerate ? displayAccent : "rgba(200,200,220,0.3)", cursor: canGenerate ? "pointer" : "not-allowed", fontSize: "0.8rem", letterSpacing: "2px", fontFamily: "'Cinzel', serif", fontWeight: 700, textTransform: "uppercase" }}>◈ ENTER THE DREAM</button>
            </div>
          </>
        )}

        {step === 3 && (loading || streamingText) && (
          <div style={{ padding: "60px 0" }}>
            <div style={{ fontSize: "0.8rem", color: displayAccent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>Descending into the surface dream…</div>
            {streamingText && <div style={{ lineHeight: 1.88, fontSize: "1rem", color: "rgba(200,200,220,0.85)" }}>{streamingText.split("\n").filter(Boolean).map((p, i) => <p key={i} style={{ marginBottom: "0.8em", textIndent: "1.5em" }}>{p}</p>)}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
