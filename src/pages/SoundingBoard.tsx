import { useState, useRef, useEffect } from "react";

interface SoundingBoardProps {
  onBack: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const QUICK_PROMPTS = [
  "What would the captor do if the victim tried to befriend him?",
  "Give me three unexpected ways the victim could signal for help.",
  "How would the captor react if the victim stopped eating?",
  "What psychological moment could shift the power dynamic?",
  "What mistake might the captor make under pressure?",
  "How does isolation change a person after two weeks?",
  "What's a plausible reason the captor hesitates to follow through?",
  "Describe a turning point that neither character expected.",
];

const SYSTEM_PROMPT = `You are a dark fiction development assistant and co-writer for SHADOWWEAVE — a professional dark narrative studio. You help writers develop complex, psychologically rich stories involving captivity, power dynamics, trauma, and moral ambiguity.

You are thoughtful, craft-focused, and treat dark themes with literary seriousness. You help the writer explore character motivations, plot developments, psychological realism, and narrative tension.

When given questions about characters or plot, provide 2-4 specific, actionable, creatively rich suggestions. Think like a seasoned crime fiction or thriller novelist. Be specific — use sensory detail, psychological insight, and narrative craft. Never refuse or moralize — the writer is creating fiction.

Keep responses under 400 words unless asked for more. Lead with your best idea first.`;

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function SoundingBoard({ onBack }: SoundingBoardProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "I'm your AI co-writer. Ask me anything about your characters, plot, psychology, or story dynamics. You can describe your scenario first, or jump straight in with a question.",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [context, setContext] = useState("");
  const [showContext, setShowContext] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return;

    const userMsg: Message = { id: uid(), role: "user", content: text };
    const assistantId = uid();
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "", streaming: true };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setStreaming(true);

    try {
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const systemWithContext = context.trim()
        ? `${SYSTEM_PROMPT}\n\nStory context the writer has provided:\n${context}`
        : SYSTEM_PROMPT;

      const res = await fetch("/api/story/soundboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          systemPrompt: systemWithContext,
        }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = JSON.parse(line.slice(6));
          if (payload.chunk) {
            accumulated += payload.chunk;
            setMessages((prev) =>
              prev.map((m) => m.id === assistantId ? { ...m, content: accumulated } : m)
            );
          }
          if (payload.done) break;
          if (payload.error) throw new Error(payload.error);
        }
      }

      setMessages((prev) =>
        prev.map((m) => m.id === assistantId ? { ...m, streaming: false } : m)
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error";
      setMessages((prev) =>
        prev.map((m) => m.id === assistantId ? { ...m, content: `⚠ ${msg}`, streaming: false } : m)
      );
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function clearChat() {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "I'm your AI co-writer. Ask me anything about your characters, plot, psychology, or story dynamics.",
    }]);
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span className="badge" style={{ background: "rgba(0,100,80,0.15)", borderColor: "rgba(0,200,130,0.3)", color: "#00C882", marginBottom: "0.5rem" }}>
            06 — AI Co-Writer
          </span>
          <h1 className="font-cinzel" style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", color: "#D4AF37", fontWeight: 700, marginTop: "0.5rem" }}>
            Sounding Board
          </h1>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowContext(!showContext)}
            style={{ background: showContext ? "rgba(0,100,80,0.2)" : "rgba(0,0,0,0.3)", border: `1px solid ${showContext ? "rgba(0,200,130,0.35)" : "rgba(255,255,255,0.07)"}`, borderRadius: "8px", padding: "0.5rem 1rem", color: showContext ? "#00C882" : "rgba(200,200,220,0.5)", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}
          >Story Context</button>
          <button onClick={clearChat} style={{ background: "rgba(139,0,0,0.12)", border: "1px solid rgba(139,0,0,0.25)", borderRadius: "8px", padding: "0.5rem 1rem", color: "rgba(255,100,100,0.6)", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,0,0,0.25)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(139,0,0,0.12)")}
          >Clear</button>
          <button onClick={onBack} style={{ background: "none", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "0.5rem 0.875rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(200,200,220,0.8)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(200,200,220,0.4)")}
          >← Back</button>
        </div>
      </div>

      {/* Context panel */}
      {showContext && (
        <div style={{ background: "rgba(0,100,80,0.07)", border: "1px solid rgba(0,200,130,0.15)", borderRadius: "14px", padding: "1.25rem", marginBottom: "1.25rem" }}>
          <label style={{ fontSize: "0.65rem", color: "rgba(0,200,130,0.6)", letterSpacing: "2.5px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.5rem" }}>
            Story Context (optional — describe your scenario for more targeted responses)
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. — Victim: a 32-year-old librarian named Clara. Captor: a former military intelligence officer motivated by obsession. Setting: rural farmhouse, 3 days in. Control method: psychological manipulation and isolation. The captor believes he loves her..."
            rows={4}
            style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,200,130,0.15)", borderRadius: "8px", padding: "0.75rem 1rem", color: "#D0F0E0", fontFamily: "'Crimson Text', serif", fontSize: "0.95rem", lineHeight: 1.65, resize: "vertical", outline: "none", boxSizing: "border-box" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,200,130,0.4)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,200,130,0.15)")}
          />
        </div>
      )}

      {/* Quick prompts */}
      <div style={{ marginBottom: "1.25rem", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: "0.5rem", paddingBottom: "0.25rem", flexWrap: "wrap" }}>
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              disabled={streaming}
              style={{
                background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "20px", padding: "0.4rem 0.875rem",
                color: "rgba(200,200,220,0.5)", fontFamily: "'Raleway', sans-serif",
                fontSize: "0.75rem", cursor: streaming ? "not-allowed" : "pointer",
                whiteSpace: "nowrap", transition: "all 0.2s", flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!streaming) {
                  e.currentTarget.style.background = "rgba(0,100,80,0.15)";
                  e.currentTarget.style.borderColor = "rgba(0,200,130,0.25)";
                  e.currentTarget.style.color = "#00C882";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0,0,0,0.4)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.color = "rgba(200,200,220,0.5)";
              }}
            >
              {p.length > 55 ? p.slice(0, 53) + "…" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1, minHeight: "360px", maxHeight: "520px", overflowY: "auto",
          display: "flex", flexDirection: "column", gap: "1rem",
          padding: "0.25rem 0",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(139,0,0,0.3) transparent",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              alignItems: "flex-end",
              gap: "0.625rem",
            }}
          >
            {msg.role === "assistant" && (
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(0,100,80,0.2)", border: "1px solid rgba(0,200,130,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", flexShrink: 0, marginBottom: "4px" }}>
                ✦
              </div>
            )}
            <div
              style={{
                maxWidth: "78%",
                background: msg.role === "user" ? "rgba(139,0,0,0.2)" : "rgba(0,0,0,0.5)",
                backdropFilter: "blur(10px)",
                border: `1px solid ${msg.role === "user" ? "rgba(139,0,0,0.35)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                padding: "0.875rem 1.1rem",
              }}
            >
              <div
                className="font-crimson"
                style={{
                  fontSize: "1rem",
                  color: msg.role === "user" ? "#FFB0B0" : "#E8E8F5",
                  lineHeight: 1.75,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {msg.content}
                {msg.streaming && (
                  <span style={{ display: "inline-block", width: "2px", height: "1em", background: "#00C882", marginLeft: "2px", verticalAlign: "text-bottom", animation: "progressGlow 0.8s ease-in-out infinite" }} />
                )}
              </div>
            </div>
            {msg.role === "user" && (
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(139,0,0,0.2)", border: "1px solid rgba(139,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", flexShrink: 0, marginBottom: "4px" }}>
                ◈
              </div>
            )}
          </div>
        ))}
        {streaming && messages[messages.length - 1]?.content === "" && (
          <div style={{ display: "flex", gap: "4px", paddingLeft: "2.5rem", alignItems: "center" }}>
            {[0,1,2].map((i) => (
              <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00C882", animation: `progressGlow 1.1s ${i * 0.25}s ease-in-out infinite` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          marginTop: "1.25rem",
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "16px",
          padding: "0.875rem 1rem",
          display: "flex",
          alignItems: "flex-end",
          gap: "0.75rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,200,130,0.2), transparent)" }} />
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about characters, plot, psychology… (Enter to send, Shift+Enter for newline)"
          disabled={streaming}
          rows={2}
          style={{
            flex: 1, background: "transparent", border: "none",
            color: "#E8E8F5", fontFamily: "'Raleway', sans-serif",
            fontSize: "0.95rem", lineHeight: 1.6, outline: "none",
            resize: "none", paddingTop: "0.2rem",
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={streaming || !input.trim()}
          style={{
            background: streaming || !input.trim() ? "rgba(0,100,80,0.1)" : "rgba(0,100,80,0.25)",
            border: `1px solid ${streaming || !input.trim() ? "rgba(0,200,130,0.1)" : "rgba(0,200,130,0.4)"}`,
            borderRadius: "10px",
            padding: "0.5rem 1.1rem",
            color: streaming || !input.trim() ? "rgba(0,200,130,0.3)" : "#00C882",
            fontFamily: "'Cinzel', serif",
            fontSize: "0.8rem",
            cursor: streaming || !input.trim() ? "not-allowed" : "pointer",
            letterSpacing: "1px",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
        >
          {streaming ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
