import { useState, useRef, useEffect, useMemo } from "react";
import StoryLengthPicker, { type StoryLength } from "../components/StoryLengthPicker";
import HeroinePicker from "../components/HeroinePicker";
import VillainPicker from "../components/VillainPicker";
import PsycheMeter, { type PsycheEvent } from "../components/PsycheMeter";
import ReadingProgressBar from "../components/ReadingProgressBar";
import { getAiProvider } from "../lib/aiProvider";
import { saveStoryToArchive, updateArchiveStory } from "../lib/archive";

interface Props { onBack: () => void; }

const LOOP_TRIGGERS = [
  "Every time she successfully escapes",
  "Every time she refuses to comply",
  "Every time midnight strikes",
  "Every time she speaks his name aloud",
  "A device he controls — press of a button",
  "Every time she reaches the door",
  "When she falls unconscious from trauma",
  "Custom…",
];

const PHASE_PSYCHE = [
  { sanityDelta: -4,  resistanceDelta: -5,  event: "Something feels inexplicably wrong — she cannot name it" },
  { sanityDelta: -9,  resistanceDelta: -8,  event: "Phantom memories surface — her mind begins to fracture" },
  { sanityDelta: -16, resistanceDelta: -12, event: "She knows the words before he speaks them — and hates herself for it" },
  { sanityDelta: -22, resistanceDelta: -18, event: "Recognition tears through her — the loops are real" },
  { sanityDelta: -28, resistanceDelta: -25, event: "Her body betrays her with impossible familiarity" },
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function TimeLoopMode({ onBack }: Props) {
  const [step, setStep] = useState<1|2|3>(1);
  const [heroine, setHeroine] = useState("");
  const [customHeroine, setCustomHeroine] = useState("");
  const [villain, setVillain] = useState("");
  const [customVillain, setCustomVillain] = useState("");
  const [loopTrigger, setLoopTrigger] = useState("");
  const [customTrigger, setCustomTrigger] = useState("");
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
  const finalTrigger = loopTrigger === "Custom…" ? customTrigger : loopTrigger;
  const loopNum = chapters.length + 1;

  const psycheLog: PsycheEvent[] = useMemo(() =>
    chapters.map((_, i) => ({ ...PHASE_PSYCHE[Math.min(i, PHASE_PSYCHE.length - 1)] })),
    [chapters]
  );
  const psycheSanity     = Math.max(0, 100 + psycheLog.reduce((s, e) => s + e.sanityDelta, 0));
  const psycheResistance = Math.max(0, 100 + psycheLog.reduce((s, e) => s + (e.resistanceDelta ?? 0), 0));

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  const canGenerate = finalHeroine && finalVillain && finalTrigger;

  async function generate(isFirst: boolean) {
    if (isFirst) { setLoading(true); setChapters([]); setSavedId(null); }
    else setContinuing(true);
    setStreamingText("");
    setError("");
    try {
      const resp = await fetch(`${BASE}/api/story/time-loop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: getAiProvider(), heroine: finalHeroine, villain: finalVillain,
          loopTrigger: finalTrigger, loopNumber: isFirst ? 1 : loopNum,
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
          title: `${finalVillain}'s Loop — ${finalHeroine}`,
          universe: "Time Loop", tool: "Time Loop Mode",
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

  const accent = "#38BDF8";
  const accentDim = "rgba(56,189,248,0.18)";

  if (step === 3 && chapters.length > 0) {
    return (
      <div style={{ minHeight: "100vh", background: "#060B12", color: "#e2e8f0", fontFamily: "'EB Garamond', Georgia, serif", padding: "0 0 80px" }}>
        <ReadingProgressBar />
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 0" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(200,200,220,0.5)", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", padding: 0, marginBottom: 24 }}>← BACK</button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: "1.1rem", color: accent, letterSpacing: "3px", textTransform: "uppercase", fontFamily: "'Cinzel', serif", fontWeight: 700 }}>⟳ TIME LOOP</span>
            <span style={{ background: accentDim, border: `1px solid ${accent}55`, borderRadius: 20, padding: "2px 14px", fontSize: "0.68rem", color: accent, letterSpacing: "2px" }}>LOOP {loopNum - 1}</span>
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(200,200,220,0.45)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 28 }}>{finalHeroine} &nbsp;·&nbsp; {finalVillain}</div>

          <PsycheMeter sanity={psycheSanity} resistance={psycheResistance} events={psycheLog} accentColor={accent} />

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 28 }}>
            {chapters.map((_, i) => (
              <span key={i} style={{ background: i < chapters.length - 1 ? "rgba(56,189,248,0.1)" : accentDim, border: `1px solid ${accent}44`, borderRadius: 4, padding: "3px 10px", fontSize: "0.65rem", color: accent, letterSpacing: "1px" }}>Loop {i + 1}</span>
            ))}
            {streamingText && <span style={{ background: accentDim, border: `1px solid ${accent}`, borderRadius: 4, padding: "3px 10px", fontSize: "0.65rem", color: accent, letterSpacing: "1px", animation: "pulse 1.2s infinite" }}>Loop {loopNum} ▸</span>}
          </div>

          {chapters.map((ch, i) => (
            <div key={i} style={{ marginBottom: 40 }}>
              <div style={{ fontSize: "0.65rem", color: "rgba(56,189,248,0.5)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16, borderBottom: "1px solid rgba(56,189,248,0.15)", paddingBottom: 8 }}>Loop {i + 1} {i < chapters.length - 1 ? "— Reset" : "— Active"}</div>
              {ch.split("\n").filter(Boolean).map((p, j) => <p key={j} style={{ lineHeight: 1.85, marginBottom: "0.8em", fontSize: "1.05rem", textIndent: "1.5em" }}>{p}</p>)}
            </div>
          ))}

          {streamingText && (
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: "0.65rem", color: accent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16, borderBottom: `1px solid ${accent}55`, paddingBottom: 8 }}>Loop {loopNum} — Writing…</div>
              {streamingText.split("\n").filter(Boolean).map((p, j) => <p key={j} style={{ lineHeight: 1.85, marginBottom: "0.8em", fontSize: "1.05rem", textIndent: "1.5em" }}>{p}</p>)}
            </div>
          )}

          {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, padding: "12px 16px", color: "#f87171", marginBottom: 24, fontSize: "0.85rem" }}>{error}</div>}

          {!streamingText && !loading && !continuing && (
            <div style={{ marginTop: 32 }}>
              <textarea value={continueDir} onChange={e => setContinueDir(e.target.value)} placeholder="Direction for next loop (optional)…" rows={2} style={{ width: "100%", background: "rgba(56,189,248,0.04)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontFamily: "inherit", fontSize: "0.9rem", resize: "vertical", outline: "none", marginBottom: 14, boxSizing: "border-box" }} />
              <button onClick={() => generate(false)} style={{ background: `linear-gradient(135deg, rgba(56,189,248,0.25), rgba(56,189,248,0.15))`, border: `1px solid ${accent}66`, borderRadius: 8, padding: "12px 28px", color: accent, cursor: "pointer", fontSize: "0.85rem", letterSpacing: "2px", fontFamily: "'Cinzel', serif", fontWeight: 700, textTransform: "uppercase" }}>
                ⟳ TRIGGER LOOP {loopNum}
              </button>
            </div>
          )}
          {(loading || continuing) && <div style={{ color: "rgba(56,189,248,0.6)", fontSize: "0.8rem", letterSpacing: "2px", textTransform: "uppercase", padding: "20px 0" }}>Initialising loop {loopNum}…</div>}
          <div ref={bottomRef} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#060B12", color: "#e2e8f0", fontFamily: "'Montserrat', sans-serif", padding: "32px 20px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(200,200,220,0.5)", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", padding: 0, marginBottom: 32 }}>← BACK</button>
        <div style={{ marginBottom: 8, fontSize: "1.4rem", fontFamily: "'Cinzel', serif", fontWeight: 700, color: accent, letterSpacing: "3px" }}>⟳ TIME LOOP</div>
        <div style={{ fontSize: "0.72rem", color: "rgba(200,200,220,0.45)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 32 }}>Villain controls the loop. She starts fresh. He remembers everything.</div>

        {step === 1 && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: "0.65rem", color: accent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>Heroine</div>
              <HeroinePicker value={heroine} onChange={setHeroine} customValue={customHeroine} onCustomChange={setCustomHeroine} accentColor={accent} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: "0.65rem", color: accent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>Villain</div>
              <VillainPicker value={villain} onChange={setVillain} customValue={customVillain} onCustomChange={setCustomVillain} accentColor={accent} />
            </div>
            <button onClick={() => setStep(2)} disabled={!finalHeroine || !finalVillain} style={{ background: finalHeroine && finalVillain ? `linear-gradient(135deg, rgba(56,189,248,0.25), rgba(56,189,248,0.15))` : "rgba(255,255,255,0.04)", border: `1px solid ${finalHeroine && finalVillain ? accent : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "12px 28px", color: finalHeroine && finalVillain ? accent : "rgba(200,200,220,0.3)", cursor: finalHeroine && finalVillain ? "pointer" : "not-allowed", fontSize: "0.8rem", letterSpacing: "2px", fontFamily: "'Cinzel', serif", fontWeight: 700, textTransform: "uppercase" }}>NEXT →</button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: "0.65rem", color: accent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>Loop Reset Trigger</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                {LOOP_TRIGGERS.map(t => (
                  <button key={t} onClick={() => setLoopTrigger(t)} style={{ background: loopTrigger === t ? `rgba(56,189,248,0.18)` : "rgba(255,255,255,0.03)", border: `1px solid ${loopTrigger === t ? accent : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "10px 12px", color: loopTrigger === t ? accent : "rgba(200,200,220,0.7)", cursor: "pointer", fontSize: "0.78rem", textAlign: "left", lineHeight: 1.4 }}>{t}</button>
                ))}
              </div>
              {loopTrigger === "Custom…" && (
                <input value={customTrigger} onChange={e => setCustomTrigger(e.target.value)} placeholder="Describe the loop trigger…" style={{ width: "100%", background: "rgba(56,189,248,0.04)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontFamily: "inherit", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
              )}
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: "0.65rem", color: accent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>Story Length</div>
              <StoryLengthPicker value={storyLength} onChange={setStoryLength} accentColor={accent} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep(1)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 20px", color: "rgba(200,200,220,0.5)", cursor: "pointer", fontSize: "0.8rem", letterSpacing: "2px", textTransform: "uppercase" }}>← BACK</button>
              <button onClick={() => { setStep(3); generate(true); }} disabled={!canGenerate} style={{ background: canGenerate ? `linear-gradient(135deg, rgba(56,189,248,0.28), rgba(56,189,248,0.15))` : "rgba(255,255,255,0.04)", border: `1px solid ${canGenerate ? accent : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "12px 28px", color: canGenerate ? accent : "rgba(200,200,220,0.3)", cursor: canGenerate ? "pointer" : "not-allowed", fontSize: "0.8rem", letterSpacing: "2px", fontFamily: "'Cinzel', serif", fontWeight: 700, textTransform: "uppercase" }}>⟳ ENTER THE LOOP</button>
            </div>
          </>
        )}

        {step === 3 && (loading || streamingText) && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "0.8rem", color: accent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16 }}>Initialising Loop 1…</div>
            {streamingText && <div style={{ textAlign: "left", lineHeight: 1.8, fontSize: "1rem", color: "rgba(200,200,220,0.85)" }}>{streamingText.split("\n").filter(Boolean).map((p, i) => <p key={i} style={{ marginBottom: "0.8em", textIndent: "1.5em" }}>{p}</p>)}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
