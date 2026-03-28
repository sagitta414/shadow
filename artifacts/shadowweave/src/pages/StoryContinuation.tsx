import { useState, useRef, useEffect } from "react";
import StoryLengthPicker, { type StoryLength } from "../components/StoryLengthPicker";
import ReadingProgressBar from "../components/ReadingProgressBar";
import { getAiProvider } from "../lib/aiProvider";
import { getArchive, updateArchiveStory, type ArchivedStory } from "../lib/archive";

interface Props { onBack: () => void; }

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const accent = "#34D399";

export default function StoryContinuation({ onBack }: Props) {
  const [archive, setArchive] = useState<ArchivedStory[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [chapters, setChapters] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [continueDir, setContinueDir] = useState("");
  const [error, setError] = useState("");
  const [storyLength, setStoryLength] = useState<StoryLength>("standard");
  const [step, setStep] = useState<"pick"|"reading">("pick");
  const [showExisting, setShowExisting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setArchive(getArchive()); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  const selected = archive.find(s => s.id === selectedId);

  async function startContinuation() {
    if (!selected) return;
    setChapters(selected.chapters);
    setStep("reading");
    await generateChapter(selected, selected.chapters, "");
  }

  async function generateChapter(story: ArchivedStory, currentChapters: string[], dir: string) {
    setContinuing(true);
    setStreamingText("");
    setError("");
    try {
      const resp = await fetch(`${BASE}/api/story/continue-any`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: getAiProvider(),
          title: story.title, characters: story.characters,
          universe: story.universe, tool: story.tool,
          chapters: currentChapters, continueDir: dir || undefined, storyLength,
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
      const newChapters = [...currentChapters, final];
      setChapters(newChapters);
      setStreamingText("");
      setContinueDir("");
      updateArchiveStory(story.id, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
      setArchive(getArchive());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally { setLoading(false); setContinuing(false); }
  }

  async function addChapter() {
    if (!selected) return;
    await generateChapter(selected, chapters, continueDir);
  }

  if (step === "reading" && selected && chapters.length > 0) {
    return (
      <div style={{ minHeight: "100vh", background: "#040D08", color: "#e2e8f0", fontFamily: "'EB Garamond', Georgia, serif", padding: "0 0 80px" }}>
        <ReadingProgressBar />
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 0" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(200,200,220,0.5)", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", padding: 0, marginBottom: 24 }}>← BACK</button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: "1.1rem", color: accent, letterSpacing: "3px", textTransform: "uppercase", fontFamily: "'Cinzel', serif", fontWeight: 700 }}>▶ CONTINUATION</span>
            <span style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 20, padding: "2px 14px", fontSize: "0.68rem", color: accent, letterSpacing: "2px" }}>{chapters.length} Chapters</span>
            <span style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: 20, padding: "2px 14px", fontSize: "0.68rem", color: "rgba(52,211,153,0.6)", letterSpacing: "1px" }}>{selected.universe}</span>
          </div>
          <div style={{ fontSize: "0.9rem", color: accent, fontFamily: "'Cinzel', serif", fontWeight: 600, marginBottom: 4 }}>{selected.title}</div>
          <div style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.35)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 32 }}>{selected.characters.join(" · ")}</div>

          <button onClick={() => setShowExisting(!showExisting)} style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: 6, padding: "6px 14px", color: "rgba(52,211,153,0.6)", cursor: "pointer", fontSize: "0.68rem", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 24 }}>
            {showExisting ? "▲ HIDE ORIGINAL" : "▼ SHOW ORIGINAL CHAPTERS"}
          </button>

          {showExisting && selected.chapters.map((ch, i) => (
            <div key={i} style={{ marginBottom: 40, opacity: 0.7 }}>
              <div style={{ fontSize: "0.65rem", color: "rgba(52,211,153,0.35)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16, borderBottom: "1px solid rgba(52,211,153,0.08)", paddingBottom: 8 }}>Chapter {i + 1} — Original</div>
              {ch.split("\n").filter(Boolean).map((p, j) => <p key={j} style={{ lineHeight: 1.85, marginBottom: "0.8em", fontSize: "1.05rem", textIndent: "1.5em" }}>{p}</p>)}
            </div>
          ))}

          {chapters.slice(selected.chapters.length).map((ch, i) => (
            <div key={i} style={{ marginBottom: 40 }}>
              <div style={{ fontSize: "0.65rem", color: "rgba(52,211,153,0.6)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16, borderBottom: "1px solid rgba(52,211,153,0.2)", paddingBottom: 8 }}>Chapter {selected.chapters.length + i + 1} — New</div>
              {ch.split("\n").filter(Boolean).map((p, j) => <p key={j} style={{ lineHeight: 1.85, marginBottom: "0.8em", fontSize: "1.05rem", textIndent: "1.5em" }}>{p}</p>)}
            </div>
          ))}

          {streamingText && (
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: "0.65rem", color: accent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16, borderBottom: `1px solid ${accent}55`, paddingBottom: 8 }}>Chapter {chapters.length + 1} — Writing…</div>
              {streamingText.split("\n").filter(Boolean).map((p, j) => <p key={j} style={{ lineHeight: 1.85, marginBottom: "0.8em", fontSize: "1.05rem", textIndent: "1.5em" }}>{p}</p>)}
            </div>
          )}

          {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, padding: "12px 16px", color: "#f87171", marginBottom: 24, fontSize: "0.85rem" }}>{error}</div>}

          {!streamingText && !continuing && !loading && (
            <div style={{ marginTop: 32 }}>
              <textarea value={continueDir} onChange={e => setContinueDir(e.target.value)} placeholder="Direction for next chapter (optional) — a twist, an escalation, a new character…" rows={2} style={{ width: "100%", background: "rgba(52,211,153,0.04)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontFamily: "inherit", fontSize: "0.9rem", resize: "vertical", outline: "none", marginBottom: 14, boxSizing: "border-box" }} />
              <button onClick={addChapter} style={{ background: "linear-gradient(135deg, rgba(52,211,153,0.22), rgba(52,211,153,0.12))", border: "1px solid rgba(52,211,153,0.5)", borderRadius: 8, padding: "12px 28px", color: accent, cursor: "pointer", fontSize: "0.85rem", letterSpacing: "2px", fontFamily: "'Cinzel', serif", fontWeight: 700, textTransform: "uppercase" }}>
                ▶ CHAPTER {chapters.length + 1}
              </button>
            </div>
          )}
          {continuing && <div style={{ color: "rgba(52,211,153,0.6)", fontSize: "0.8rem", letterSpacing: "2px", textTransform: "uppercase", padding: "20px 0" }}>Writing chapter {chapters.length + 1}…</div>}
          <div ref={bottomRef} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#040D08", color: "#e2e8f0", fontFamily: "'Montserrat', sans-serif", padding: "32px 20px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(200,200,220,0.5)", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", padding: 0, marginBottom: 32 }}>← BACK</button>
        <div style={{ marginBottom: 8, fontSize: "1.4rem", fontFamily: "'Cinzel', serif", fontWeight: 700, color: accent, letterSpacing: "3px" }}>▶ STORY CONTINUATION</div>
        <div style={{ fontSize: "0.72rem", color: "rgba(200,200,220,0.45)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 32 }}>Pick any archived story. Add new chapters. Save back to archive.</div>

        {archive.length === 0 ? (
          <div style={{ color: "rgba(200,200,220,0.4)", fontSize: "0.9rem", padding: "40px 0", textAlign: "center" }}>No archived stories yet. Complete a story mode first.</div>
        ) : (
          <>
            <div style={{ fontSize: "0.65rem", color: accent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>Select Story to Continue</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, maxHeight: 420, overflowY: "auto" }}>
              {archive.map(s => (
                <button key={s.id} onClick={() => setSelectedId(s.id)} style={{ background: selectedId === s.id ? "rgba(52,211,153,0.10)" : "rgba(255,255,255,0.03)", border: `1px solid ${selectedId === s.id ? accent : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "12px 16px", textAlign: "left", cursor: "pointer" }}>
                  <div style={{ fontSize: "0.9rem", color: selectedId === s.id ? accent : "#e2e8f0", fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(200,200,220,0.45)", letterSpacing: "1px" }}>
                    {s.universe} · {s.tool} · {s.chapters.length} chapter{s.chapters.length !== 1 ? "s" : ""} · {s.wordCount.toLocaleString()} words
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "rgba(200,200,220,0.3)", marginTop: 4 }}>{s.characters.join(", ")}</div>
                </button>
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: "0.65rem", color: accent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>Chapter Length</div>
              <StoryLengthPicker value={storyLength} onChange={setStoryLength} accentColor={accent} />
            </div>
            <button onClick={startContinuation} disabled={!selectedId} style={{ background: selectedId ? "linear-gradient(135deg, rgba(52,211,153,0.22), rgba(52,211,153,0.12))" : "rgba(255,255,255,0.04)", border: `1px solid ${selectedId ? accent : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "12px 28px", color: selectedId ? accent : "rgba(200,200,220,0.3)", cursor: selectedId ? "pointer" : "not-allowed", fontSize: "0.8rem", letterSpacing: "2px", fontFamily: "'Cinzel', serif", fontWeight: 700, textTransform: "uppercase" }}>▶ CONTINUE THIS STORY</button>
          </>
        )}

        {step === "reading" && (loading || streamingText) && (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
            <div style={{ fontSize: "0.8rem", color: accent, letterSpacing: "3px", textTransform: "uppercase" }}>Writing next chapter…</div>
          </div>
        )}
      </div>
    </div>
  );
}
