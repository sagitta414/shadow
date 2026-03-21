import { useState } from "react";

interface CaptorLogicProps {
  onBack: () => void;
}

interface ActionResult {
  action: string;
  reasoning: string;
  riskToCaptor: string;
  effect: string;
}

interface SimResult {
  assessment: string;
  actions: ActionResult[];
  warning: string;
  mindset: string;
}

const PRESET_RULES = [
  "Never reveal your real name or face",
  "Maintain total control over food and water",
  "Never leave marks that could be used as evidence",
  "Always speak in a calm, controlled voice",
  "Never make a promise you cannot keep",
  "Limit all outside contact completely",
  "Never act out of anger — only calculation",
];

const PRESET_GOALS = [
  "Break the victim's will within 30 days",
  "Create total psychological dependency",
  "Eliminate any hope of rescue or escape",
  "Make the victim believe no one is looking for them",
  "Establish a routine that creates compliance",
];

export default function CaptorLogic({ onBack }: CaptorLogicProps) {
  const [rules, setRules] = useState<string[]>(["", "", ""]);
  const [goals, setGoals] = useState<string[]>(["", ""]);
  const [captorProfile, setCaptorProfile] = useState("");
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimResult | null>(null);
  const [error, setError] = useState("");
  const [rawStream, setRawStream] = useState("");
  const [hoveredAction, setHoveredAction] = useState<number | null>(null);

  function setRule(i: number, val: string) {
    setRules((prev) => prev.map((r, idx) => idx === i ? val : r));
  }
  function setGoal(i: number, val: string) {
    setGoals((prev) => prev.map((g, idx) => idx === i ? val : g));
  }
  function addRule() {
    if (rules.length < 7) setRules((prev) => [...prev, ""]);
  }
  function removeRule(i: number) {
    if (rules.length > 1) setRules((prev) => prev.filter((_, idx) => idx !== i));
  }
  function addGoal() {
    if (goals.length < 5) setGoals((prev) => [...prev, ""]);
  }
  function removeGoal(i: number) {
    if (goals.length > 1) setGoals((prev) => prev.filter((_, idx) => idx !== i));
  }
  function injectPresetRule(r: string) {
    const empty = rules.findIndex((x) => !x.trim());
    if (empty >= 0) setRules((prev) => prev.map((x, i) => i === empty ? r : x));
    else if (rules.length < 7) setRules((prev) => [...prev, r]);
  }
  function injectPresetGoal(g: string) {
    const empty = goals.findIndex((x) => !x.trim());
    if (empty >= 0) setGoals((prev) => prev.map((x, i) => i === empty ? g : x));
    else if (goals.length < 5) setGoals((prev) => [...prev, g]);
  }

  async function runSimulation() {
    const filledRules = rules.filter((r) => r.trim());
    const filledGoals = goals.filter((g) => g.trim());
    if (filledRules.length === 0 || filledGoals.length === 0 || !situation.trim()) {
      setError("Please add at least one rule, one goal, and describe the current situation.");
      return;
    }
    setLoading(true);
    setResult(null);
    setError("");
    setRawStream("");

    try {
      const res = await fetch("/api/story/captor-logic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules: filledRules, goals: filledGoals, situation, captorProfile }),
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
            setRawStream(accumulated);
          }
          if (payload.done) {
            setResult(payload.result);
          }
          if (payload.error) throw new Error(payload.error);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setLoading(false);
      setRawStream("");
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "8px",
    padding: "0.65rem 1rem",
    color: "#E8E8F5",
    fontFamily: "'Raleway', sans-serif",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border-color 0.25s, box-shadow 0.25s",
    boxSizing: "border-box" as const,
    width: "100%",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "0.6rem",
    color: "rgba(200,200,220,0.3)",
    letterSpacing: "2.5px",
    textTransform: "uppercase" as const,
    fontFamily: "'Montserrat', sans-serif",
    display: "block",
    marginBottom: "0.5rem",
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span className="badge" style={{ background: "rgba(60,0,80,0.2)", borderColor: "rgba(160,0,200,0.35)", color: "#C060E0", marginBottom: "0.5rem" }}>
            07 — Behaviour Simulator
          </span>
          <h1 className="font-cinzel" style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)", color: "#D4AF37", fontWeight: 700, marginTop: "0.5rem" }}>
            Captor Logic Simulator
          </h1>
          <p className="font-crimson" style={{ fontSize: "0.95rem", color: "rgba(200,200,220,0.45)", fontStyle: "italic", marginTop: "0.25rem" }}>
            Define the captor's rules and goals. The AI engine suggests what they would do next — consistently.
          </p>
        </div>
        <button onClick={onBack} style={{ background: "none", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "0.5rem 1rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s", flexShrink: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(200,200,220,0.8)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(200,200,220,0.4)")}
        >← Back</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

        {/* ── Left: Config ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Captor Profile */}
          <div style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ width: "3px", height: "20px", background: "#C060E0", borderRadius: "2px", boxShadow: "0 0 8px rgba(192,96,224,0.5)" }} />
              <span className="font-cinzel" style={{ fontSize: "0.75rem", color: "#C060E0", letterSpacing: "2px", textTransform: "uppercase" }}>Captor Profile</span>
              <span style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.25)", fontFamily: "'Montserrat', sans-serif" }}>(optional)</span>
            </div>
            <textarea
              value={captorProfile}
              onChange={(e) => setCaptorProfile(e.target.value)}
              placeholder="Brief psychological sketch of the captor — e.g. 'Former military intelligence officer, obsessive, meticulous, believes he's protecting the victim from the outside world...'"
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(192,96,224,0.4)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
            />
          </div>

          {/* Rules */}
          <div style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "3px", height: "20px", background: "#8B0000", borderRadius: "2px", boxShadow: "0 0 8px rgba(139,0,0,0.5)" }} />
                <span className="font-cinzel" style={{ fontSize: "0.75rem", color: "#FF8888", letterSpacing: "2px", textTransform: "uppercase" }}>Inviolable Rules</span>
              </div>
              {rules.length < 7 && (
                <button onClick={addRule} style={{ background: "rgba(139,0,0,0.15)", border: "1px solid rgba(139,0,0,0.3)", borderRadius: "6px", padding: "0.3rem 0.75rem", color: "#FF8888", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", cursor: "pointer", letterSpacing: "1px" }}>+ Add Rule</button>
              )}
            </div>

            {/* Preset chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.875rem" }}>
              {PRESET_RULES.map((r) => (
                <button key={r} onClick={() => injectPresetRule(r)} style={{ background: "rgba(139,0,0,0.08)", border: "1px solid rgba(139,0,0,0.2)", borderRadius: "4px", padding: "0.2rem 0.5rem", color: "rgba(255,136,136,0.5)", fontFamily: "'Montserrat', sans-serif", fontSize: "0.62rem", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,0,0,0.2)"; e.currentTarget.style.color = "#FF8888"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(139,0,0,0.08)"; e.currentTarget.style.color = "rgba(255,136,136,0.5)"; }}
                  title="Add this preset rule"
                >{r.length > 36 ? r.slice(0, 34) + "…" : r}</button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {rules.map((rule, i) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span className="font-cinzel" style={{ fontSize: "0.65rem", color: "rgba(255,136,136,0.4)", minWidth: "18px" }}>R{i + 1}</span>
                  <input
                    value={rule}
                    onChange={(e) => setRule(i, e.target.value)}
                    placeholder={`Rule ${i + 1}…`}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(139,0,0,0.5)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
                  />
                  {rules.length > 1 && (
                    <button onClick={() => removeRule(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,100,100,0.3)", fontSize: "0.8rem", padding: "0.25rem", flexShrink: 0, transition: "color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#FF6666")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,100,100,0.3)")}
                    >✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "3px", height: "20px", background: "#B8860B", borderRadius: "2px", boxShadow: "0 0 8px rgba(184,134,11,0.5)" }} />
                <span className="font-cinzel" style={{ fontSize: "0.75rem", color: "#D4AF37", letterSpacing: "2px", textTransform: "uppercase" }}>Goals</span>
              </div>
              {goals.length < 5 && (
                <button onClick={addGoal} style={{ background: "rgba(184,134,11,0.15)", border: "1px solid rgba(184,134,11,0.3)", borderRadius: "6px", padding: "0.3rem 0.75rem", color: "#D4AF37", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", cursor: "pointer", letterSpacing: "1px" }}>+ Add Goal</button>
              )}
            </div>

            {/* Preset chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.875rem" }}>
              {PRESET_GOALS.map((g) => (
                <button key={g} onClick={() => injectPresetGoal(g)} style={{ background: "rgba(184,134,11,0.08)", border: "1px solid rgba(184,134,11,0.2)", borderRadius: "4px", padding: "0.2rem 0.5rem", color: "rgba(212,175,55,0.5)", fontFamily: "'Montserrat', sans-serif", fontSize: "0.62rem", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(184,134,11,0.2)"; e.currentTarget.style.color = "#D4AF37"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(184,134,11,0.08)"; e.currentTarget.style.color = "rgba(212,175,55,0.5)"; }}
                  title="Add this preset goal"
                >{g.length > 36 ? g.slice(0, 34) + "…" : g}</button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {goals.map((goal, i) => (
                <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span className="font-cinzel" style={{ fontSize: "0.65rem", color: "rgba(212,175,55,0.4)", minWidth: "18px" }}>G{i + 1}</span>
                  <input
                    value={goal}
                    onChange={(e) => setGoal(i, e.target.value)}
                    placeholder={`Goal ${i + 1}…`}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(184,134,11,0.5)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
                  />
                  {goals.length > 1 && (
                    <button onClick={() => removeGoal(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,100,100,0.3)", fontSize: "0.8rem", padding: "0.25rem", flexShrink: 0, transition: "color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#FF6666")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,100,100,0.3)")}
                    >✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Situation */}
          <div style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ width: "3px", height: "20px", background: "#2D5A8B", borderRadius: "2px", boxShadow: "0 0 8px rgba(45,90,139,0.5)" }} />
              <span className="font-cinzel" style={{ fontSize: "0.75rem", color: "#6AABDF", letterSpacing: "2px", textTransform: "uppercase" }}>Current Situation</span>
            </div>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Describe what is happening right now in the story — e.g. 'Day 8. The victim has stopped responding to the captor's questions and is refusing to eat. She found a loose nail under the mattress and hid it...'"
              rows={5}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(74,144,217,0.4)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
            />
          </div>

          {/* Run button */}
          {error && (
            <div style={{ background: "rgba(139,0,0,0.12)", border: "1px solid rgba(139,0,0,0.3)", borderRadius: "10px", padding: "0.75rem 1rem", color: "#FF8888", fontSize: "0.85rem", fontFamily: "'Montserrat', sans-serif" }}>
              ⚠ {error}
            </div>
          )}
          <button
            onClick={runSimulation}
            disabled={loading}
            style={{
              padding: "1.1rem",
              background: loading ? "rgba(60,0,80,0.15)" : "linear-gradient(135deg, rgba(60,0,80,0.4) 0%, rgba(100,0,120,0.5) 100%)",
              border: `1px solid ${loading ? "rgba(160,0,200,0.2)" : "rgba(192,96,224,0.45)"}`,
              borderRadius: "12px",
              color: loading ? "rgba(192,96,224,0.4)" : "#C060E0",
              fontFamily: "'Cinzel', serif",
              fontSize: "0.95rem",
              fontWeight: 700,
              letterSpacing: "3px",
              cursor: loading ? "not-allowed" : "pointer",
              textTransform: "uppercase",
              transition: "all 0.3s ease",
              boxShadow: loading ? "none" : "0 4px 20px rgba(192,96,224,0.2)",
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = "0 8px 30px rgba(192,96,224,0.35)"; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.boxShadow = "0 4px 20px rgba(192,96,224,0.2)"; }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
                <span style={{ display: "flex", gap: "4px" }}>
                  {[0,1,2].map((i) => <span key={i} style={{ display: "inline-block", width: "5px", height: "5px", borderRadius: "50%", background: "#C060E0", animation: `progressGlow 0.9s ${i * 0.2}s ease-in-out infinite` }} />)}
                </span>
                Simulating captor logic…
              </span>
            ) : "Run Simulation"}
          </button>
        </div>

        {/* ── Right: Results ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Empty state */}
          {!result && !loading && !rawStream && (
            <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "16px", padding: "3rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", flex: 1, minHeight: "400px" }}>
              <div style={{ fontSize: "3rem", opacity: 0.15, marginBottom: "1rem" }}>◈</div>
              <p className="font-cinzel" style={{ fontSize: "0.8rem", color: "rgba(200,200,220,0.25)", letterSpacing: "2px" }}>
                Simulation results will appear here
              </p>
              <p style={{ fontSize: "0.75rem", color: "rgba(200,200,220,0.15)", fontFamily: "'Montserrat', sans-serif", marginTop: "0.5rem" }}>
                Configure the captor's logic, then run the simulation
              </p>
            </div>
          )}

          {/* Streaming state */}
          {loading && rawStream && (
            <div style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(192,96,224,0.15)", borderRadius: "16px", padding: "1.5rem", flex: 1 }}>
              <div className="font-cinzel" style={{ fontSize: "0.65rem", color: "rgba(192,96,224,0.5)", letterSpacing: "2px", marginBottom: "1rem" }}>PROCESSING…</div>
              <div style={{ color: "rgba(200,200,220,0.4)", fontFamily: "'Courier New', monospace", fontSize: "0.75rem", lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {rawStream.slice(-600)}
                <span style={{ display: "inline-block", width: "6px", height: "0.85em", background: "#C060E0", verticalAlign: "text-bottom", animation: "progressGlow 0.8s ease-in-out infinite" }} />
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <>
              {/* Assessment */}
              <div style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(16px)", border: "1px solid rgba(192,96,224,0.2)", borderRadius: "16px", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, rgba(192,96,224,0.6), transparent)" }} />
                <div className="font-cinzel" style={{ fontSize: "0.65rem", color: "rgba(192,96,224,0.6)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "0.875rem" }}>Situation Assessment</div>
                <p className="font-crimson" style={{ fontSize: "1.05rem", color: "#E0D0F5", lineHeight: 1.8, fontStyle: "italic" }}>{result.assessment}</p>
              </div>

              {/* Mindset */}
              <div style={{ background: "rgba(30,0,40,0.4)", border: "1px solid rgba(192,96,224,0.12)", borderRadius: "12px", padding: "0.875rem 1.25rem", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <span style={{ fontSize: "0.7rem", color: "rgba(192,96,224,0.5)", letterSpacing: "2px", flexShrink: 0, paddingTop: "2px" }}>MINDSET</span>
                <p style={{ fontSize: "0.85rem", color: "rgba(200,200,220,0.6)", fontFamily: "'Crimson Text', serif", fontStyle: "italic", lineHeight: 1.6 }}>{result.mindset}</p>
              </div>

              {/* Actions */}
              <div>
                <div className="font-cinzel" style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.3)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.75rem" }}>Suggested Actions</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  {result.actions.map((action, i) => {
                    const isHov = hoveredAction === i;
                    const priority = i === 0 ? { color: "#FF8888", border: "rgba(139,0,0,0.35)", bg: "rgba(139,0,0,0.1)" }
                      : i === 1 ? { color: "#D4AF37", border: "rgba(184,134,11,0.3)", bg: "rgba(90,60,0,0.12)" }
                      : { color: "rgba(200,200,220,0.6)", border: "rgba(255,255,255,0.07)", bg: "rgba(0,0,0,0.35)" };
                    return (
                      <div
                        key={i}
                        onMouseEnter={() => setHoveredAction(i)}
                        onMouseLeave={() => setHoveredAction(null)}
                        style={{ background: isHov ? `${priority.bg}` : "rgba(0,0,0,0.45)", backdropFilter: "blur(10px)", border: `1px solid ${isHov ? priority.border : "rgba(255,255,255,0.05)"}`, borderRadius: "14px", padding: "1.25rem", transition: "all 0.25s ease", position: "relative", overflow: "hidden" }}
                      >
                        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "3px", background: priority.color, opacity: isHov ? 0.8 : 0.3, borderRadius: "14px 0 0 14px", boxShadow: `0 0 10px ${priority.color}` }} />

                        <div style={{ display: "flex", alignItems: "baseline", gap: "0.625rem", marginBottom: "0.625rem" }}>
                          <span className="font-cinzel" style={{ fontSize: "0.65rem", color: priority.color, letterSpacing: "2px" }}>
                            {i === 0 ? "PRIMARY" : i === 1 ? "SECONDARY" : "ALTERNATIVE"}
                          </span>
                        </div>

                        <p style={{ fontSize: "0.95rem", color: "#F0F0FF", fontFamily: "'Crimson Text', serif", fontWeight: 600, lineHeight: 1.5, marginBottom: "0.875rem" }}>
                          {action.action}
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                          <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "0.6rem 0.75rem" }}>
                            <div style={{ fontSize: "0.55rem", color: "rgba(200,200,220,0.3)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.25rem" }}>Reasoning</div>
                            <p style={{ fontSize: "0.8rem", color: "rgba(200,200,220,0.6)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.5 }}>{action.reasoning}</p>
                          </div>
                          <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "0.6rem 0.75rem" }}>
                            <div style={{ fontSize: "0.55rem", color: "rgba(200,200,220,0.3)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.25rem" }}>Expected Effect</div>
                            <p style={{ fontSize: "0.8rem", color: "rgba(200,200,220,0.6)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.5 }}>{action.effect}</p>
                          </div>
                        </div>

                        <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                          <span style={{ fontSize: "0.6rem", color: "rgba(139,0,0,0.6)", letterSpacing: "1px", fontFamily: "'Montserrat', sans-serif", flexShrink: 0, paddingTop: "1px" }}>RISK</span>
                          <p style={{ fontSize: "0.78rem", color: "rgba(200,80,80,0.5)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.5 }}>{action.riskToCaptor}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Warning */}
              <div style={{ background: "rgba(100,40,0,0.12)", border: "1px solid rgba(184,100,0,0.25)", borderRadius: "12px", padding: "0.875rem 1.25rem", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <span style={{ fontSize: "0.85rem", flexShrink: 0 }}>⚠</span>
                <div>
                  <div style={{ fontSize: "0.6rem", color: "rgba(200,130,50,0.6)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.25rem" }}>Critical Warning</div>
                  <p style={{ fontSize: "0.85rem", color: "rgba(220,160,80,0.7)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.55 }}>{result.warning}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .captor-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
