import { useState, useRef, useEffect } from "react";
import StoryLengthPicker, { type StoryLength } from "../components/StoryLengthPicker";
import ReadingProgressBar from "../components/ReadingProgressBar";
import { getAiProvider } from "../lib/aiProvider";
import { getArchive, saveStoryToArchive, type ArchivedStory } from "../lib/archive";

interface Props { onBack: () => void; }

const SEQUEL_DIRECTIONS = [
  "She escapes — but he finds her again",
  "A new threat forces them into an uneasy alliance",
  "Months later — she has never been the same",
  "She goes back. Voluntarily.",
  "He returns. She isn't who she was.",
  "A second captor enters the picture",
  "The roles reverse",
  "Custom direction…",
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const accent = "#F59E0B";

export default function SequelGenerator({ onBack }: Props) {
  const [archive, setArchive] = useState<ArchivedStory[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [sequelDirection, setSequelDirection] = useState("");
  const [customDirection, setCustomDirection] = useState("");
  const [chapters, setChapters] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [continueDir, setContinueDir] = useState("");
  const [savedId, setSavedId] = useState<string|null>(null);
  const [error, setError] = useState("");
  const [storyLength, setStoryLength] = useState<StoryLength>("standard");
  const [step, setStep] = useState<"pick"|"config"|"reading">("pick");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setArchive(getArchive()); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [streamingText, chapters]);

  const selected = archive.find(s => s.id === selectedId);
  const finalDirection = sequelDirection === "Custom direction…" ? customDirection : sequelDirection;

  async function generate(isFirst: boolean) {
    if (!selected) return;
    if (isFirst) { setLoading(true); setChapters([]); setSavedId(null); }
    else setContinuing(true);
    setStreamingText("");
    setError("");
    try {
      if (isFirst) {
        const lastChapter = selected.chapters[selected.chapters.length - 1] || "";
        const summary = lastChapter.slice(0, 1200);
        const resp = await fetch(`${BASE}/api/story/sequel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: getAiProvider(),
            title: selected.title, characters: selected.characters,
            universe: selected.universe, tool: selected.tool,
            lastChapterSummary: summary,
            sequelDirection: finalDirection || undefined,
            storyLength,
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
        const newChapters = [final];
        setChapters(newChapters);
        setStreamingText("");
        const id = saveStoryToArchive({
          title: `${selected.title} — Sequel`,
          universe: selected.universe, tool: "Sequel Generator",
          characters: selected.characters, storyLength, chapters: newChapters,
        });
        setSavedId(id);
      } else if (savedId) {
        const chapterNum = chapters.length + 1;
        const resp = await fetch(`${BASE}/api/story/continue-any`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: getAiProvider(),
            title: `${selected.title} — Sequel`,
            characters: selected.characters,
            universe: selected.universe, tool: "Sequel Generator",
            chapters, continueDir, storyLength,
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
        const newChapters = [...chapters, final];
        setChapters(newChapters);
        setStreamingText("");
        setContinueDir("");
        const { updateArchiveStory } = await import("../lib/archive");
        updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally { setLoading(false); setContinuing(false); }
  }

  if (step === "reading" && chapters.length > 0) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0800", color: "#e2e8f0", fontFamily: "'EB Garamond', Georgia, serif", padding: "0 0 80px" }}>
        <ReadingProgressBar />
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 0" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(200,200,220,0.5)", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", padding: 0, marginBottom: 24 }}>← BACK</button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: "1.1rem", color: accent, letterSpacing: "3px", textTransform: "uppercase", fontFamily: "'Cinzel', serif", fontWeight: 700 }}>⟴ SEQUEL</span>
            <span style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)", borderRadius: 20, padding: "2px 14px", fontSize: "0.68rem", color: accent, letterSpacing: "2px" }}>Chapter {chapters.length}</span>
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(200,200,220,0.45)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>Sequel to: {selected?.title}</div>
          <div style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.3)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 32 }}>{selected?.characters.join(" · ")}</div>

          {chapters.map((ch, i) => (
            <div key={i} style={{ marginBottom: 40 }}>
              {chapters.length > 1 && <div style={{ fontSize: "0.65rem", color: "rgba(245,158,11,0.5)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16, borderBottom: "1px solid rgba(245,158,11,0.15)", paddingBottom: 8 }}>Chapter {i + 1}</div>}
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

          {!streamingText && !loading && !continuing && (
            <div style={{ marginTop: 32 }}>
              <textarea value={continueDir} onChange={e => setContinueDir(e.target.value)} placeholder="Direction for next chapter (optional)…" rows={2} style={{ width: "100%", background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontFamily: "inherit", fontSize: "0.9rem", resize: "vertical", outline: "none", marginBottom: 14, boxSizing: "border-box" }} />
              <button onClick={() => generate(false)} style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.15))", border: "1px solid rgba(245,158,11,0.5)", borderRadius: 8, padding: "12px 28px", color: accent, cursor: "pointer", fontSize: "0.85rem", letterSpacing: "2px", fontFamily: "'Cinzel', serif", fontWeight: 700, textTransform: "uppercase" }}>
                ⟴ NEXT CHAPTER
              </button>
            </div>
          )}
          {(loading || continuing) && <div style={{ color: "rgba(245,158,11,0.6)", fontSize: "0.8rem", letterSpacing: "2px", textTransform: "uppercase", padding: "20px 0" }}>Generating chapter {chapters.length + 1}…</div>}
          <div ref={bottomRef} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0800", color: "#e2e8f0", fontFamily: "'Montserrat', sans-serif", padding: "32px 20px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(200,200,220,0.5)", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", padding: 0, marginBottom: 32 }}>← BACK</button>
        <div style={{ marginBottom: 8, fontSize: "1.4rem", fontFamily: "'Cinzel', serif", fontWeight: 700, color: accent, letterSpacing: "3px" }}>⟴ SEQUEL GENERATOR</div>
        <div style={{ fontSize: "0.72rem", color: "rgba(200,200,220,0.45)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 32 }}>Pick an archived story. Generate what comes next.</div>

        {step === "pick" && (
          <>
            {archive.length === 0 ? (
              <div style={{ color: "rgba(200,200,220,0.4)", fontSize: "0.9rem", padding: "40px 0", textAlign: "center" }}>No archived stories yet. Complete a story mode first to generate a sequel.</div>
            ) : (
              <>
                <div style={{ fontSize: "0.65rem", color: accent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>Select Original Story</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, maxHeight: 400, overflowY: "auto" }}>
                  {archive.map(s => (
                    <button key={s.id} onClick={() => setSelectedId(s.id)} style={{ background: selectedId === s.id ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.03)", border: `1px solid ${selectedId === s.id ? accent : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "12px 16px", textAlign: "left", cursor: "pointer" }}>
                      <div style={{ fontSize: "0.9rem", color: selectedId === s.id ? accent : "#e2e8f0", fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
                      <div style={{ fontSize: "0.72rem", color: "rgba(200,200,220,0.45)", letterSpacing: "1px" }}>{s.universe} · {s.characters.join(", ")} · {s.chapters.length} chapter{s.chapters.length !== 1 ? "s" : ""} · {s.wordCount.toLocaleString()} words</div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep("config")} disabled={!selectedId} style={{ background: selectedId ? "linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.15))" : "rgba(255,255,255,0.04)", border: `1px solid ${selectedId ? accent : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "12px 28px", color: selectedId ? accent : "rgba(200,200,220,0.3)", cursor: selectedId ? "pointer" : "not-allowed", fontSize: "0.8rem", letterSpacing: "2px", fontFamily: "'Cinzel', serif", fontWeight: 700, textTransform: "uppercase" }}>CONFIGURE SEQUEL →</button>
              </>
            )}
          </>
        )}

        {step === "config" && selected && (
          <>
            <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, padding: "12px 16px", marginBottom: 24 }}>
              <div style={{ fontSize: "0.65rem", color: "rgba(245,158,11,0.6)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 4 }}>Continuing</div>
              <div style={{ fontSize: "0.95rem", color: accent, fontWeight: 600 }}>{selected.title}</div>
              <div style={{ fontSize: "0.72rem", color: "rgba(200,200,220,0.45)", marginTop: 4 }}>{selected.characters.join(", ")}</div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: "0.65rem", color: accent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>Sequel Direction</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                {SEQUEL_DIRECTIONS.map(d => (
                  <button key={d} onClick={() => setSequelDirection(d)} style={{ background: sequelDirection === d ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${sequelDirection === d ? accent : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "10px 12px", color: sequelDirection === d ? accent : "rgba(200,200,220,0.7)", cursor: "pointer", fontSize: "0.78rem", textAlign: "left", lineHeight: 1.4 }}>{d}</button>
                ))}
              </div>
              {sequelDirection === "Custom direction…" && (
                <input value={customDirection} onChange={e => setCustomDirection(e.target.value)} placeholder="Describe the sequel's premise…" style={{ width: "100%", background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, padding: "10px 14px", color: "#e2e8f0", fontFamily: "inherit", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} />
              )}
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: "0.65rem", color: accent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>Story Length</div>
              <StoryLengthPicker value={storyLength} onChange={setStoryLength} accentColor={accent} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep("pick")} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 20px", color: "rgba(200,200,220,0.5)", cursor: "pointer", fontSize: "0.8rem", letterSpacing: "2px", textTransform: "uppercase" }}>← BACK</button>
              <button onClick={() => { setStep("reading"); generate(true); }} style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.28), rgba(245,158,11,0.15))", border: `1px solid ${accent}`, borderRadius: 8, padding: "12px 28px", color: accent, cursor: "pointer", fontSize: "0.8rem", letterSpacing: "2px", fontFamily: "'Cinzel', serif", fontWeight: 700, textTransform: "uppercase" }}>⟴ GENERATE SEQUEL</button>
            </div>
          </>
        )}

        {step === "reading" && (loading || streamingText) && (
          <div style={{ padding: "60px 0" }}>
            <div style={{ fontSize: "0.8rem", color: accent, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>Generating sequel…</div>
            {streamingText && <div style={{ lineHeight: 1.85, fontSize: "1rem", color: "rgba(200,200,220,0.85)", fontFamily: "'EB Garamond', Georgia, serif" }}>{streamingText.split("\n").filter(Boolean).map((p, i) => <p key={i} style={{ marginBottom: "0.8em", textIndent: "1.5em" }}>{p}</p>)}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
