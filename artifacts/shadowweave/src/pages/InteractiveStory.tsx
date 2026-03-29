import { useState, useRef, useEffect } from "react";
import { getAiProvider } from "../lib/aiProvider";

interface HistoryEntry {
  scene: string;
  choice?: string;
  psyche?: PsycheEvent;
}

interface PsycheEvent {
  sanityDelta: number;
  hopeDelta: number;
  event: string;
}

interface InteractiveStoryProps {
  characterAnswers: Record<number, string>;
  onBack: () => void;
}

async function generateScene(
  characterParams: Record<string, string>,
  history: HistoryEntry[],
  chosenAction: string | undefined,
  onChunk: (chunk: string) => void
): Promise<{ scene: string; choices: string[]; psyche?: PsycheEvent }> {
  const res = await fetch(`/api/story/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: getAiProvider(), characterParams, history, chosenAction }),
  });

  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = JSON.parse(line.slice(6));
      if (payload.chunk) onChunk(payload.chunk);
      if (payload.done) return { scene: payload.scene, choices: payload.choices, psyche: payload.psyche };
      if (payload.error) throw new Error(payload.error);
    }
  }
  throw new Error("Stream ended without completion");
}

// ── Psyche Meter Component ───────────────────────────────────
function PsycheMeter({
  sanity,
  hope,
  log,
}: {
  sanity: number;
  hope: number;
  log: { event: string; sanityDelta: number; hopeDelta: number }[];
}) {
  const [expanded, setExpanded] = useState(true);

  function meterColor(val: number): string {
    if (val >= 70) return "#22cc66";
    if (val >= 45) return "#ccaa22";
    if (val >= 25) return "#cc6622";
    return "#cc2222";
  }

  function sanityLabel(val: number): string {
    if (val >= 80) return "Composed";
    if (val >= 60) return "Strained";
    if (val >= 40) return "Fractured";
    if (val >= 20) return "Unraveling";
    return "Broken";
  }

  function hopeLabel(val: number): string {
    if (val >= 75) return "Resolute";
    if (val >= 50) return "Flickering";
    if (val >= 30) return "Dimming";
    if (val >= 15) return "Fading";
    return "Extinguished";
  }

  function deltaStr(n: number) {
    return n >= 0 ? `+${n}` : `${n}`;
  }

  const last = log[log.length - 1];

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "16px",
        marginBottom: "1.5rem",
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1.25rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "inherit",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flex: 1 }}>
          <span className="font-cinzel" style={{ fontSize: "0.6rem", color: "rgba(184,134,11,0.7)", letterSpacing: "3px", textTransform: "uppercase", flexShrink: 0 }}>
            Psychological State
          </span>

          {/* Compact inline meters for collapsed view */}
          <div style={{ display: "flex", gap: "1rem", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
              <span style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px", flexShrink: 0 }}>SANITY</span>
              <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden", maxWidth: "100px" }}>
                <div style={{ width: `${sanity}%`, height: "100%", background: meterColor(sanity), borderRadius: "2px", transition: "width 0.6s ease, background 0.6s ease", boxShadow: `0 0 6px ${meterColor(sanity)}` }} />
              </div>
              <span style={{ fontSize: "0.7rem", color: meterColor(sanity), fontFamily: "'Cinzel', serif", fontWeight: 700, flexShrink: 0, minWidth: "28px" }}>{sanity}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
              <span style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px", flexShrink: 0 }}>HOPE</span>
              <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden", maxWidth: "100px" }}>
                <div style={{ width: `${hope}%`, height: "100%", background: "#4a90d9", borderRadius: "2px", transition: "width 0.6s ease", boxShadow: "0 0 6px rgba(74,144,217,0.6)" }} />
              </div>
              <span style={{ fontSize: "0.7rem", color: "#4a90d9", fontFamily: "'Cinzel', serif", fontWeight: 700, flexShrink: 0, minWidth: "28px" }}>{hope}</span>
            </div>
          </div>
        </div>
        <span style={{ fontSize: "0.6rem", color: "rgba(200,200,220,0.25)", flexShrink: 0 }}>{expanded ? "▲" : "▼"}</span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "0 1.25rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", paddingTop: "1rem" }}>
            {/* Sanity */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                <span className="font-cinzel" style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.4)", letterSpacing: "2px" }}>SANITY</span>
                <span style={{ fontSize: "0.65rem", color: meterColor(sanity), fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>{sanityLabel(sanity)}</span>
              </div>
              <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden", marginBottom: "0.35rem" }}>
                <div style={{
                  width: `${Math.max(0, Math.min(100, sanity))}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, #cc2222, ${meterColor(sanity)})`,
                  borderRadius: "4px",
                  transition: "width 0.8s cubic-bezier(0.23,1,0.32,1)",
                  boxShadow: `0 0 10px ${meterColor(sanity)}66`,
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.2)", fontFamily: "'Montserrat', sans-serif" }}>Breaking</span>
                <span style={{ fontSize: "0.75rem", color: meterColor(sanity), fontFamily: "'Cinzel', serif", fontWeight: 700 }}>{Math.max(0, Math.min(100, sanity))}/100</span>
                <span style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.2)", fontFamily: "'Montserrat', sans-serif" }}>Stable</span>
              </div>
            </div>

            {/* Hope */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                <span className="font-cinzel" style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.4)", letterSpacing: "2px" }}>HOPE</span>
                <span style={{ fontSize: "0.65rem", color: "#4a90d9", fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>{hopeLabel(hope)}</span>
              </div>
              <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden", marginBottom: "0.35rem" }}>
                <div style={{
                  width: `${Math.max(0, Math.min(100, hope))}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #1a2a4a, #4a90d9)",
                  borderRadius: "4px",
                  transition: "width 0.8s cubic-bezier(0.23,1,0.32,1)",
                  boxShadow: "0 0 10px rgba(74,144,217,0.4)",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.2)", fontFamily: "'Montserrat', sans-serif" }}>Despair</span>
                <span style={{ fontSize: "0.75rem", color: "#4a90d9", fontFamily: "'Cinzel', serif", fontWeight: 700 }}>{Math.max(0, Math.min(100, hope))}/100</span>
                <span style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.2)", fontFamily: "'Montserrat', sans-serif" }}>Resolute</span>
              </div>
            </div>
          </div>

          {/* Event log */}
          {log.length > 0 && (
            <div style={{ marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "0.875rem" }}>
              <div className="font-cinzel" style={{ fontSize: "0.58rem", color: "rgba(200,200,220,0.25)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "0.5rem" }}>Recent Events</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                {log.slice(-4).reverse().map((entry, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", opacity: 1 - i * 0.2 }}>
                    <span style={{ fontSize: "0.72rem", color: "rgba(200,200,220,0.5)", fontFamily: "'Montserrat', sans-serif", flex: 1, letterSpacing: "0.3px" }}>
                      {entry.event}
                    </span>
                    <span style={{ fontSize: "0.65rem", color: entry.sanityDelta >= 0 ? "#22cc66" : "#cc4444", fontFamily: "'Cinzel', serif", fontWeight: 700, flexShrink: 0 }}>
                      {entry.sanityDelta >= 0 ? "+" : ""}{entry.sanityDelta}S
                    </span>
                    <span style={{ fontSize: "0.65rem", color: entry.hopeDelta >= 0 ? "#4a90d9" : "#886644", fontFamily: "'Cinzel', serif", fontWeight: 700, flexShrink: 0 }}>
                      {entry.hopeDelta >= 0 ? "+" : ""}{entry.hopeDelta}H
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crisis warning */}
          {(sanity < 25 || hope < 15) && (
            <div style={{ marginTop: "0.875rem", padding: "0.6rem 0.875rem", background: "rgba(139,0,0,0.15)", border: "1px solid rgba(139,0,0,0.3)", borderRadius: "8px" }}>
              <span style={{ fontSize: "0.72rem", color: "#FF6666", fontFamily: "'Montserrat', sans-serif" }}>
                ⚠ {sanity < 25 && hope < 15 ? "Critical state — complete psychological collapse imminent" : sanity < 25 ? "Sanity critical — the character is losing their grip on reality" : "Hope extinguished — despair is consuming all resistance"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────
export default function InteractiveStory({ characterAnswers, onBack }: InteractiveStoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentScene, setCurrentScene] = useState("");
  const [currentChoices, setCurrentChoices] = useState<string[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const [hoveredChoice, setHoveredChoice] = useState<number | null>(null);

  // Psyche state
  const [sanity, setSanity] = useState(75);
  const [hope, setHope] = useState(45);
  const [psycheLog, setPsycheLog] = useState<{ event: string; sanityDelta: number; hopeDelta: number }[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);

  const characterParams: Record<string, string> = {};
  Object.entries(characterAnswers).forEach(([k, v]) => {
    characterParams[`Question ${k}`] = v;
  });

  function applyPsyche(psyche?: PsycheEvent) {
    if (!psyche) return;
    setSanity((prev) => Math.max(0, Math.min(100, prev + psyche.sanityDelta)));
    setHope((prev) => Math.max(0, Math.min(100, prev + psyche.hopeDelta)));
    setPsycheLog((prev) => [...prev, { event: psyche.event, sanityDelta: psyche.sanityDelta, hopeDelta: psyche.hopeDelta }]);
  }

  async function startStory() {
    setStarted(true);
    setError("");
    setStreaming(true);
    setStreamingText("");
    try {
      let accumulated = "";
      const result = await generateScene(characterParams, [], undefined, (chunk) => {
        accumulated += chunk;
        setStreamingText(accumulated);
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      });
      setCurrentScene(result.scene);
      setCurrentChoices(result.choices);
      setStreamingText("");
      applyPsyche(result.psyche);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate story");
    } finally {
      setStreaming(false);
    }
  }

  async function makeChoice(choice: string) {
    const newHistory: HistoryEntry[] = [...history, { scene: currentScene, choice }];
    setHistory(newHistory);
    setCurrentScene("");
    setCurrentChoices([]);
    setError("");
    setStreaming(true);
    setStreamingText("");
    try {
      let accumulated = "";
      const result = await generateScene(characterParams, newHistory, choice, (chunk) => {
        accumulated += chunk;
        setStreamingText(accumulated);
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      });
      setCurrentScene(result.scene);
      setCurrentChoices(result.choices);
      setStreamingText("");
      applyPsyche(result.psyche);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to continue story");
    } finally {
      setStreaming(false);
    }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  function restart() {
    setHistory([]);
    setCurrentScene("");
    setCurrentChoices([]);
    setStreamingText("");
    setStreaming(false);
    setStarted(false);
    setError("");
    setSanity(75);
    setHope(45);
    setPsycheLog([]);
  }

  function exportStory() {
    const psycheSummary = psycheLog.length > 0
      ? `\n\nPSYCHOLOGICAL LOG:\n${psycheLog.map((e, i) => `  Scene ${i + 1}: ${e.event} (Sanity ${e.sanityDelta >= 0 ? "+" : ""}${e.sanityDelta}, Hope ${e.hopeDelta >= 0 ? "+" : ""}${e.hopeDelta})`).join("\n")}\n\nFINAL STATE: Sanity ${sanity}/100 · Hope ${hope}/100`
      : "";
    const fullText = [
      ...history.map((h, i) => `SCENE ${i + 1}\n\n${h.scene}${h.choice ? `\n\n[Chose: ${h.choice}]` : ""}`),
      currentScene ? `SCENE ${history.length + 1}\n\n${currentScene}` : "",
    ].filter(Boolean).join("\n\n" + "─".repeat(40) + "\n\n") + psycheSummary;

    const blob = new Blob([fullText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shadowweave_story_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const sceneCount = history.length + (currentScene ? 1 : 0);

  // ── Start Screen ─────────────────────────────────────────
  if (!started) {
    return (
      <div
        className="fade-in"
        style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 2rem", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}
      >
        <span className="badge badge-crimson" style={{ marginBottom: "1.5rem" }}>AI Story Engine</span>
        <h1 className="font-cinzel" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#D4AF37", marginBottom: "1rem", fontWeight: 700 }}>
          Your Story Awaits
        </h1>
        <p className="font-crimson" style={{ fontSize: "1.2rem", color: "rgba(200,200,220,0.7)", fontStyle: "italic", marginBottom: "0.75rem", lineHeight: 1.7 }}>
          The AI will generate an opening scene from your character profile, then present 4 choices that shape where the story goes next.
        </p>

        <div className="divider" style={{ maxWidth: "300px", margin: "1.5rem auto" }}>
          <span className="divider-symbol">✦</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2.5rem", width: "100%", maxWidth: "560px" }}>
          {[
            { icon: "🤖", label: "AI-Generated", sub: "Prose & choices" },
            { icon: "🔀", label: "Branching", sub: "4 paths each scene" },
            { icon: "🧠", label: "Psych Tracker", sub: "Sanity & Hope meters" },
            { icon: "📖", label: "Exportable", sub: "Save your story" },
          ].map((f) => (
            <div key={f.label} style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.25rem 1rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>{f.icon}</div>
              <div className="font-cinzel" style={{ fontSize: "0.85rem", color: "#D4AF37", marginBottom: "0.2rem" }}>{f.label}</div>
              <div style={{ fontSize: "0.75rem", color: "rgba(200,200,220,0.4)" }}>{f.sub}</div>
            </div>
          ))}
        </div>

        <button className="enter-button" onClick={startStory} style={{ fontSize: "1.1rem" }}>
          Begin the Story
        </button>
        <button onClick={onBack} style={{ marginTop: "1rem", background: "none", border: "none", color: "rgba(200,200,220,0.4)", cursor: "pointer", fontSize: "0.9rem", transition: "color 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(200,200,220,0.8)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(200,200,220,0.4)")}
        >← Back to Character Builder</button>
      </div>
    );
  }

  // ── Story Screen ─────────────────────────────────────────
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="font-cinzel" style={{ fontSize: "1.6rem", color: "#D4AF37", fontWeight: 700 }}>
            SHADOWWEAVE
          </h1>
          <div style={{ fontSize: "0.75rem", color: "rgba(200,200,220,0.35)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>
            Interactive Story · Scene {sceneCount}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {sceneCount > 0 && (
            <button onClick={exportStory} style={{ background: "rgba(184,134,11,0.12)", border: "1px solid rgba(184,134,11,0.3)", borderRadius: "8px", padding: "0.5rem 1rem", color: "#D4AF37", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(184,134,11,0.25)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(184,134,11,0.12)")}
            >Export</button>
          )}
          <button onClick={restart} style={{ background: "rgba(45,27,105,0.3)", border: "1px solid rgba(45,27,105,0.5)", borderRadius: "8px", padding: "0.5rem 1rem", color: "rgba(200,200,220,0.7)", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(45,27,105,0.5)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(45,27,105,0.3)")}
          >Restart</button>
          <button onClick={onBack} style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "0.5rem 1rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(200,200,220,0.8)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(200,200,220,0.4)")}
          >← Back</button>
        </div>
      </div>

      {/* ── Psyche Meter ── */}
      {(sceneCount > 0 || streaming) && (
        <PsycheMeter sanity={sanity} hope={hope} log={psycheLog} />
      )}

      {/* Story History */}
      {history.map((entry, i) => (
        <div key={i} style={{ marginBottom: "1.5rem", opacity: 0.5 }}>
          <div style={{ fontSize: "0.7rem", color: "rgba(184,134,11,0.5)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.75rem" }}>
            Scene {i + 1}
          </div>
          <div className="font-crimson" style={{ fontSize: "1.05rem", color: "rgba(220,220,240,0.65)", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>
            {entry.scene}
          </div>
          {entry.choice && (
            <div style={{ marginTop: "0.875rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(45,27,105,0.25)", border: "1px solid rgba(45,27,105,0.4)", borderRadius: "8px", padding: "0.4rem 0.875rem" }}>
              <span style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.4)", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>Chose</span>
              <span className="font-crimson" style={{ fontSize: "0.9rem", color: "rgba(184,134,11,0.8)", fontStyle: "italic" }}>{entry.choice}</span>
            </div>
          )}
          {entry.psyche && (
            <div style={{ marginTop: "0.4rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.62rem", color: entry.psyche.sanityDelta >= 0 ? "rgba(34,204,102,0.6)" : "rgba(204,68,68,0.6)", fontFamily: "'Cinzel', serif" }}>
                {entry.psyche.sanityDelta >= 0 ? "+" : ""}{entry.psyche.sanityDelta}S
              </span>
              <span style={{ fontSize: "0.62rem", color: entry.psyche.hopeDelta >= 0 ? "rgba(74,144,217,0.6)" : "rgba(136,100,68,0.6)", fontFamily: "'Cinzel', serif" }}>
                {entry.psyche.hopeDelta >= 0 ? "+" : ""}{entry.psyche.hopeDelta}H
              </span>
              <span style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.3)", fontFamily: "'Montserrat', sans-serif" }}>— {entry.psyche.event}</span>
            </div>
          )}
        </div>
      ))}

      {/* Current Scene */}
      {(currentScene || streamingText) && (
        <div style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(20px)", border: "1px solid rgba(139,0,0,0.3)", borderRadius: "20px", padding: "2rem 2.5rem", marginBottom: "2rem", position: "relative", overflow: "hidden" }}>
          <div className="progress-bar-gradient" style={{ position: "absolute", top: 0, left: 0, right: 0, borderRadius: "20px 20px 0 0" }} />
          <div style={{ fontSize: "0.7rem", color: "rgba(184,134,11,0.6)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "1rem" }}>
            Scene {sceneCount}
          </div>
          <div className="font-crimson" style={{ fontSize: "1.12rem", color: "#E8E8F5", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
            {currentScene || streamingText}
            {streaming && (
              <span style={{ display: "inline-block", width: "2px", height: "1.1em", background: "#B8860B", marginLeft: "2px", verticalAlign: "text-bottom", animation: "progressGlow 0.8s ease-in-out infinite" }} />
            )}
          </div>
        </div>
      )}

      {/* Streaming indicator */}
      {streaming && !streamingText && (
        <div className="fade-in" style={{ textAlign: "center", padding: "2rem" }}>
          <div className="font-crimson" style={{ fontSize: "1.1rem", color: "rgba(184,134,11,0.6)", fontStyle: "italic", marginBottom: "0.5rem" }}>
            The story unfolds...
          </div>
          <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8B0000", animation: `progressGlow 1.2s ease-in-out ${i * 0.3}s infinite` }} />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: "rgba(139,0,0,0.15)", border: "1px solid rgba(139,0,0,0.4)", borderRadius: "12px", padding: "1rem 1.5rem", marginBottom: "1.5rem", color: "#FF6666", fontSize: "0.9rem" }}>
          ⚠ {error}
          <button onClick={() => setError("")} style={{ marginLeft: "1rem", background: "none", border: "none", color: "rgba(255,100,100,0.6)", cursor: "pointer", fontSize: "0.85rem" }}>Dismiss</button>
        </div>
      )}

      {/* Choices */}
      {currentChoices.length > 0 && !streaming && (
        <div className="slide-in">
          <div style={{ fontSize: "0.7rem", color: "rgba(200,200,220,0.35)", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "1rem", textAlign: "center" }}>
            What happens next?
          </div>
          <div style={{ display: "grid", gap: "0.875rem" }}>
            {currentChoices.map((choice, i) => {
              const letters = ["A", "B", "C", "D"];
              const isHovered = hoveredChoice === i;
              return (
                <button
                  key={i}
                  onClick={() => makeChoice(choice)}
                  onMouseEnter={() => setHoveredChoice(i)}
                  onMouseLeave={() => setHoveredChoice(null)}
                  style={{
                    background: isHovered ? "rgba(139,0,0,0.2)" : "rgba(0,0,0,0.45)",
                    backdropFilter: "blur(10px)",
                    border: `1px solid ${isHovered ? "rgba(184,134,11,0.55)" : "rgba(139,0,0,0.25)"}`,
                    borderRadius: "14px",
                    padding: "1.25rem 1.5rem",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.25s cubic-bezier(0.23,1,0.32,1)",
                    transform: isHovered ? "translateX(6px)" : "none",
                    boxShadow: isHovered ? "0 8px 25px rgba(0,0,0,0.4), -4px 0 15px rgba(139,0,0,0.15)" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "1.25rem",
                    color: "inherit",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: "#8B0000", opacity: isHovered ? 1 : 0, transition: "opacity 0.25s ease", boxShadow: "0 0 10px rgba(139,0,0,0.6)" }} />
                  <span className="font-cinzel" style={{ fontSize: "0.9rem", fontWeight: 700, color: isHovered ? "#D4AF37" : "rgba(184,134,11,0.5)", minWidth: "24px", transition: "color 0.25s ease", flexShrink: 0 }}>
                    {letters[i]}
                  </span>
                  <span className="font-crimson" style={{ fontSize: "1.05rem", color: isHovered ? "#F0F0FF" : "rgba(220,220,240,0.75)", lineHeight: 1.5, fontStyle: "italic", transition: "color 0.25s ease" }}>
                    {choice.replace(/^Choice [A-D]:\s*/i, "")}
                  </span>
                  <span style={{ marginLeft: "auto", opacity: isHovered ? 1 : 0, color: "#B8860B", transition: "opacity 0.25s ease", flexShrink: 0 }}>→</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
