import { useState, useRef, useEffect } from "react";

interface HistoryEntry {
  scene: string;
  choice?: string;
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
): Promise<{ scene: string; choices: string[] }> {
  const res = await fetch(`/api/story/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ characterParams, history, chosenAction }),
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
      if (payload.done) return { scene: payload.scene, choices: payload.choices };
      if (payload.error) throw new Error(payload.error);
    }
  }
  throw new Error("Stream ended without completion");
}

export default function InteractiveStory({ characterAnswers, onBack }: InteractiveStoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentScene, setCurrentScene] = useState("");
  const [currentChoices, setCurrentChoices] = useState<string[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const [hoveredChoice, setHoveredChoice] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const characterParams: Record<string, string> = {};
  Object.entries(characterAnswers).forEach(([k, v]) => {
    characterParams[`Question ${k}`] = v;
  });

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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate story");
    } finally {
      setStreaming(false);
    }
  }

  async function makeChoice(choice: string) {
    const newHistory: HistoryEntry[] = [
      ...history,
      { scene: currentScene, choice },
    ];
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
  }

  function exportStory() {
    const fullText = [
      ...history.map((h, i) => `SCENE ${i + 1}\n\n${h.scene}${h.choice ? `\n\n[Chose: ${h.choice}]` : ""}`),
      currentScene ? `SCENE ${history.length + 1}\n\n${currentScene}` : "",
    ].filter(Boolean).join("\n\n" + "─".repeat(40) + "\n\n");

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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "1rem",
            marginBottom: "2.5rem",
            width: "100%",
            maxWidth: "500px",
          }}
        >
          {[
            { icon: "🤖", label: "AI-Generated", sub: "Prose & choices" },
            { icon: "🔀", label: "Branching", sub: "4 paths each scene" },
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

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="font-cinzel" style={{ fontSize: "1.6rem", color: "#D4AF37", fontWeight: 700 }}>
            SHADOWWEAVE
          </h1>
          <div style={{ fontSize: "0.75rem", color: "rgba(200,200,220,0.35)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>
            Interactive Story · Scene {sceneCount}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {sceneCount > 0 && (
            <button
              onClick={exportStory}
              style={{ background: "rgba(184,134,11,0.12)", border: "1px solid rgba(184,134,11,0.3)", borderRadius: "8px", padding: "0.5rem 1rem", color: "#D4AF37", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(184,134,11,0.25)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(184,134,11,0.12)")}
            >Export</button>
          )}
          <button
            onClick={restart}
            style={{ background: "rgba(45,27,105,0.3)", border: "1px solid rgba(45,27,105,0.5)", borderRadius: "8px", padding: "0.5rem 1rem", color: "rgba(200,200,220,0.7)", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(45,27,105,0.5)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(45,27,105,0.3)")}
          >Restart</button>
          <button
            onClick={onBack}
            style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "0.5rem 1rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(200,200,220,0.8)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(200,200,220,0.4)")}
          >← Back</button>
        </div>
      </div>

      {/* Story History */}
      {history.map((entry, i) => (
        <div key={i} style={{ marginBottom: "1.5rem", opacity: 0.5 }}>
          <div style={{ fontSize: "0.7rem", color: "rgba(184,134,11,0.5)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.75rem" }}>
            Scene {i + 1}
          </div>
          <div
            className="font-crimson"
            style={{ fontSize: "1.05rem", color: "rgba(220,220,240,0.65)", lineHeight: 1.85, whiteSpace: "pre-wrap" }}
          >
            {entry.scene}
          </div>
          {entry.choice && (
            <div style={{ marginTop: "0.875rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(45,27,105,0.25)", border: "1px solid rgba(45,27,105,0.4)", borderRadius: "8px", padding: "0.4rem 0.875rem" }}>
              <span style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.4)", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>Chose</span>
              <span className="font-crimson" style={{ fontSize: "0.9rem", color: "rgba(184,134,11,0.8)", fontStyle: "italic" }}>{entry.choice}</span>
            </div>
          )}
        </div>
      ))}

      {/* Current Scene */}
      {(currentScene || streamingText) && (
        <div
          style={{
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(139,0,0,0.3)",
            borderRadius: "20px",
            padding: "2rem 2.5rem",
            marginBottom: "2rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="progress-bar-gradient" style={{ position: "absolute", top: 0, left: 0, right: 0, borderRadius: "20px 20px 0 0" }} />
          <div style={{ fontSize: "0.7rem", color: "rgba(184,134,11,0.6)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "1rem" }}>
            Scene {sceneCount}
          </div>
          <div
            className="font-crimson"
            style={{ fontSize: "1.12rem", color: "#E8E8F5", lineHeight: 1.9, whiteSpace: "pre-wrap" }}
          >
            {currentScene || streamingText}
            {streaming && (
              <span
                style={{
                  display: "inline-block",
                  width: "2px",
                  height: "1.1em",
                  background: "#B8860B",
                  marginLeft: "2px",
                  verticalAlign: "text-bottom",
                  animation: "progressGlow 0.8s ease-in-out infinite",
                }}
              />
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
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: "3px",
                      background: "#8B0000",
                      opacity: isHovered ? 1 : 0,
                      transition: "opacity 0.25s ease",
                      boxShadow: "0 0 10px rgba(139,0,0,0.6)",
                    }}
                  />
                  <span
                    className="font-cinzel"
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: isHovered ? "#D4AF37" : "rgba(184,134,11,0.5)",
                      minWidth: "24px",
                      transition: "color 0.25s ease",
                      flexShrink: 0,
                    }}
                  >
                    {letters[i]}
                  </span>
                  <span
                    className="font-crimson"
                    style={{
                      fontSize: "1.05rem",
                      color: isHovered ? "#F0F0FF" : "rgba(220,220,240,0.75)",
                      lineHeight: 1.5,
                      fontStyle: "italic",
                      transition: "color 0.25s ease",
                    }}
                  >
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
