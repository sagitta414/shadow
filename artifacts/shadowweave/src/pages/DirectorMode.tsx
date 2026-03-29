import { useState, useRef, useCallback } from "react";

interface Props {
  onBack: () => void;
}

interface SceneEntry {
  prompt: string;
  output: string;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function DirectorMode({ onBack }: Props) {
  const [heroine, setHeroine] = useState("");
  const [villain, setVillain] = useState("");
  const [setting, setSetting] = useState("");
  const [explicitMode, setExplicitMode] = useState(false);
  const [setupDone, setSetupDone] = useState(false);

  const [scenes, setScenes] = useState<SceneEntry[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: "smooth" });
    }, 80);
  }, []);

  async function sendPrompt() {
    const prompt = currentPrompt.trim();
    if (!prompt || streaming) return;

    setStreaming(true);
    setStreamText("");
    setCurrentPrompt("");

    const chapters = scenes.map((s) => s.output);

    abortRef.current = new AbortController();

    try {
      const res = await fetch(`${BASE}/api/story/director`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          heroine,
          villain: villain || undefined,
          setting: setting || undefined,
          userPrompt: prompt,
          explicitMode,
          chapters,
        }),
      });

      if (!res.ok || !res.body) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.chunk) {
              full += parsed.chunk;
              setStreamText(full);
              scrollToBottom();
            }
          } catch {}
        }
      }

      setScenes((prev) => [...prev, { prompt, output: full }]);
      setStreamText("");
      scrollToBottom();
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setStreamText("[Error generating scene. Please try again.]");
      }
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendPrompt();
    }
  }

  const accent = explicitMode ? "#C084FC" : "#34D399";
  const accentDim = explicitMode ? "rgba(192,132,252,0.15)" : "rgba(52,211,153,0.12)";
  const accentBorder = explicitMode ? "rgba(192,132,252,0.35)" : "rgba(52,211,153,0.3)";

  if (!setupDone) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 20% 20%, rgba(30,10,60,0.9) 0%, rgba(8,8,16,1) 70%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{
          width: "100%",
          maxWidth: "520px",
          background: "rgba(12,12,20,0.95)",
          border: "1px solid rgba(52,211,153,0.2)",
          borderRadius: "16px",
          padding: "40px 36px",
          boxShadow: "0 0 60px rgba(52,211,153,0.08)",
        }}>
          <button
            onClick={onBack}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "2px", marginBottom: "28px", padding: 0 }}
          >
            ← BACK
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <span style={{ fontSize: "1.6rem" }}>🎬</span>
            <h1 style={{ margin: 0, fontSize: "1.4rem", fontFamily: "'Cinzel', serif", color: "#fff", letterSpacing: "3px" }}>DIRECTOR MODE</h1>
          </div>
          <p style={{ margin: "0 0 32px", color: "rgba(255,255,255,0.45)", fontSize: "0.78rem", letterSpacing: "1px" }}>
            You control every scene. The AI follows your instructions exactly.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", color: "rgba(52,211,153,0.8)", fontSize: "0.65rem", letterSpacing: "2px", marginBottom: "6px" }}>PROTAGONIST *</label>
              <input
                value={heroine}
                onChange={(e) => setHeroine(e.target.value)}
                placeholder="e.g. Black Widow, Wonder Woman, your OC…"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(52,211,153,0.2)",
                  borderRadius: "8px", color: "#fff", padding: "12px 14px",
                  fontSize: "0.9rem", outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", letterSpacing: "2px", marginBottom: "6px" }}>ANTAGONIST (optional)</label>
              <input
                value={villain}
                onChange={(e) => setVillain(e.target.value)}
                placeholder="e.g. Hydra agent, a mysterious captor…"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px", color: "#fff", padding: "12px 14px",
                  fontSize: "0.9rem", outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", letterSpacing: "2px", marginBottom: "6px" }}>SETTING (optional)</label>
              <input
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                placeholder="e.g. abandoned warehouse, remote facility…"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px", color: "#fff", padding: "12px 14px",
                  fontSize: "0.9rem", outline: "none",
                }}
              />
            </div>

            <div style={{ marginTop: "8px" }}>
              <label style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", letterSpacing: "2px", marginBottom: "10px" }}>DEFAULT MODE</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setExplicitMode(false)}
                  style={{
                    flex: 1, padding: "10px",
                    borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "1.5px",
                    border: !explicitMode ? "1px solid rgba(52,211,153,0.6)" : "1px solid rgba(255,255,255,0.1)",
                    background: !explicitMode ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.03)",
                    color: !explicitMode ? "#34D399" : "rgba(255,255,255,0.4)",
                    transition: "all 0.2s",
                  }}
                >
                  ◉ NON-SEXUAL
                </button>
                <button
                  onClick={() => setExplicitMode(true)}
                  style={{
                    flex: 1, padding: "10px",
                    borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "1.5px",
                    border: explicitMode ? "1px solid rgba(192,132,252,0.6)" : "1px solid rgba(255,255,255,0.1)",
                    background: explicitMode ? "rgba(192,132,252,0.12)" : "rgba(255,255,255,0.03)",
                    color: explicitMode ? "#C084FC" : "rgba(255,255,255,0.4)",
                    transition: "all 0.2s",
                  }}
                >
                  ◈ EXPLICIT
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => { if (heroine.trim()) setSetupDone(true); }}
            disabled={!heroine.trim()}
            style={{
              marginTop: "28px", width: "100%", padding: "14px",
              background: heroine.trim() ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${heroine.trim() ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: "8px", color: heroine.trim() ? "#34D399" : "rgba(255,255,255,0.25)",
              cursor: heroine.trim() ? "pointer" : "not-allowed",
              fontSize: "0.8rem", letterSpacing: "2px", fontFamily: "'Cinzel', serif",
              transition: "all 0.2s",
            }}
          >
            BEGIN DIRECTING →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 20% 20%, rgba(30,10,60,0.9) 0%, rgba(8,8,16,1) 70%)",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Header bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(8,8,16,0.96)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${accentBorder}`,
        padding: "12px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={onBack}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: "0.7rem", letterSpacing: "2px", padding: 0 }}
          >
            ← BACK
          </button>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "2px" }}>🎬 DIRECTOR MODE</span>
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.65rem" }}>— {heroine}{villain ? ` / ${villain}` : ""}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {scenes.length > 0 && (
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", letterSpacing: "1px" }}>
              {scenes.length} scene{scenes.length !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={() => setExplicitMode((e) => !e)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: `1px solid ${accentBorder}`,
              background: accentDim,
              color: accent,
              cursor: "pointer",
              fontSize: "0.65rem",
              letterSpacing: "1.5px",
              transition: "all 0.25s",
              whiteSpace: "nowrap",
            }}
          >
            {explicitMode ? "◈ EXPLICIT ON" : "◉ NON-SEXUAL"}
          </button>
        </div>
      </div>

      {/* Story output */}
      <div
        ref={outputRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 20px",
          maxWidth: "760px",
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {scenes.length === 0 && !streaming && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "rgba(255,255,255,0.2)",
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>🎬</div>
            <div style={{ fontSize: "0.85rem", letterSpacing: "1px", marginBottom: "8px" }}>Your story begins with your first instruction.</div>
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.15)" }}>
              Type your scene direction below. The AI will execute it exactly.
            </div>
          </div>
        )}

        {scenes.map((scene, idx) => (
          <div key={idx} style={{ marginBottom: "36px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: accentDim,
              border: `1px solid ${accentBorder}`,
              borderRadius: "20px",
              padding: "4px 14px",
              marginBottom: "14px",
              maxWidth: "90%",
            }}>
              <span style={{ color: accent, fontSize: "0.55rem", letterSpacing: "1.5px" }}>YOUR DIRECTION</span>
            </div>
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${accentBorder}`,
              borderRadius: "8px",
              padding: "12px 16px",
              color: "rgba(255,255,255,0.55)",
              fontSize: "0.82rem",
              lineHeight: "1.5",
              marginBottom: "16px",
              fontStyle: "italic",
            }}>
              {scene.prompt}
            </div>
            <div style={{
              color: "rgba(255,255,255,0.88)",
              fontSize: "0.95rem",
              lineHeight: "1.85",
              letterSpacing: "0.01em",
              whiteSpace: "pre-wrap",
            }}>
              {scene.output}
            </div>
            {idx < scenes.length - 1 && (
              <div style={{
                margin: "32px 0 0",
                height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 50%, transparent)",
              }} />
            )}
          </div>
        ))}

        {streaming && (
          <div style={{ marginBottom: "36px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: accentDim,
              border: `1px solid ${accentBorder}`,
              borderRadius: "20px",
              padding: "4px 14px",
              marginBottom: "14px",
            }}>
              <span style={{ color: accent, fontSize: "0.55rem", letterSpacing: "1.5px" }}>WRITING…</span>
              <span style={{
                display: "inline-block", width: "6px", height: "6px",
                borderRadius: "50%", background: accent,
                animation: "pulse 1s ease-in-out infinite",
              }} />
            </div>
            <div style={{
              color: "rgba(255,255,255,0.88)",
              fontSize: "0.95rem",
              lineHeight: "1.85",
              whiteSpace: "pre-wrap",
            }}>
              {streamText}
              <span style={{
                display: "inline-block", width: "2px", height: "1em",
                background: accent, marginLeft: "2px", verticalAlign: "text-bottom",
                animation: "blink 0.9s step-end infinite",
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Input panel */}
      <div style={{
        position: "sticky", bottom: 0,
        background: "rgba(8,8,16,0.97)",
        backdropFilter: "blur(16px)",
        borderTop: `1px solid ${accentBorder}`,
        padding: "16px 20px",
      }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          {!explicitMode && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              marginBottom: "10px",
              color: "rgba(52,211,153,0.5)",
              fontSize: "0.62rem", letterSpacing: "1.5px",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34D399", display: "inline-block" }} />
              NON-SEXUAL MODE — AI follows your prompts literally, no sexual content
            </div>
          )}
          {explicitMode && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              marginBottom: "10px",
              color: "rgba(192,132,252,0.5)",
              fontSize: "0.62rem", letterSpacing: "1.5px",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C084FC", display: "inline-block" }} />
              EXPLICIT MODE — Full uncensored content active
            </div>
          )}
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <textarea
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={streaming}
              placeholder={`Type your scene direction… (Ctrl+Enter to send)\n\nExamples:\n• He drags her into the room and ties her hands behind her back\n• She tries to reason with him — he ignores every word\n• He steps closer, eyes moving over the restraints`}
              rows={4}
              style={{
                flex: 1, resize: "none",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${streaming ? "rgba(255,255,255,0.06)" : accentBorder}`,
                borderRadius: "10px", color: "#fff",
                padding: "12px 14px", fontSize: "0.88rem",
                lineHeight: "1.6", outline: "none",
                fontFamily: "'Inter', sans-serif",
                transition: "border-color 0.2s",
                opacity: streaming ? 0.5 : 1,
              }}
            />
            <button
              onClick={sendPrompt}
              disabled={streaming || !currentPrompt.trim()}
              style={{
                padding: "12px 22px",
                borderRadius: "10px",
                border: `1px solid ${accentBorder}`,
                background: (streaming || !currentPrompt.trim()) ? "rgba(255,255,255,0.03)" : accentDim,
                color: (streaming || !currentPrompt.trim()) ? "rgba(255,255,255,0.2)" : accent,
                cursor: (streaming || !currentPrompt.trim()) ? "not-allowed" : "pointer",
                fontSize: "0.75rem", letterSpacing: "1.5px",
                fontFamily: "'Cinzel', serif",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                alignSelf: "flex-end",
                height: "44px",
              }}
            >
              {streaming ? "…" : "DIRECT →"}
            </button>
          </div>
          <div style={{ marginTop: "8px", color: "rgba(255,255,255,0.15)", fontSize: "0.6rem", letterSpacing: "1px", textAlign: "right" }}>
            Ctrl+Enter to send · Toggle explicit mode in header
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}
