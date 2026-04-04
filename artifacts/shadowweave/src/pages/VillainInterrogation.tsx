import { useState, useRef, useEffect } from "react";
import PsychBreakdownTracker, { type BreakdownEvent, type BreakdownState } from "../components/PsychBreakdownTracker";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Props { onBack: () => void; }

interface Exchange { role: "villain" | "heroine"; text: string; timestamp: number; }

const HEROINES = [
  "Black Widow","Captain Marvel","Storm","Jean Grey","Scarlet Witch","Wonder Woman",
  "Supergirl","Batgirl","Black Canary","Starfire","Raven","Power Girl","Zatanna",
  "Silk","X-23","Magik","Shadowcat","Psylocke","Emma Frost","Ghost-Spider","Rogue",
  "Hawkgirl","Catwoman","Huntress","Sara Lance","Starlight","Queen Maeve","She-Hulk",
];

const SETTINGS = [
  "A black-site interrogation chamber", "Abandoned warehouse, single light overhead",
  "His private estate — no witnesses", "Underground bunker, no way out",
  "The lab where she was captured", "A luxurious penthouse, gilded cage",
  "A moving vehicle — nowhere to run", "Her own lair, now his",
];

const ACCENT = "#DC2626";
const GOLD   = "#F5D67A";

export default function VillainInterrogation({ onBack }: Props) {
  const [phase, setPhase] = useState<"setup" | "active">("setup");

  const [heroineName, setHeroineName] = useState("");
  const [villainName, setVillainName] = useState("");
  const [setting, setSetting] = useState("");
  const [extractionTarget, setExtractionTarget] = useState("");
  const [heroineSearch, setHeroineSearch] = useState("");

  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");
  const [round, setRound] = useState(0);

  const [psych, setPsych] = useState<BreakdownState>({ resistance: 100, fear: 10, defiance: 90, compliance: 0 });
  const [psychLog, setPsychLog] = useState<BreakdownEvent[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const psychRef  = useRef(psych);
  useEffect(() => { psychRef.current = psych; }, [psych]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [exchanges, streamText]);

  const filteredHeroines = HEROINES.filter(h => !heroineSearch || h.toLowerCase().includes(heroineSearch.toLowerCase()));

  const canBegin = heroineName.trim().length > 0 && villainName.trim().length > 0;

  async function streamHeroine(allExchanges: Exchange[], villainLine?: string) {
    setStreaming(true); setStreamText(""); setError("");
    let acc = "";
    try {
      const res = await fetch(`${BASE}/api/story/interrogation-heroine`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroineName, villainName: villainName.trim(),
          setting: setting.trim() || undefined,
          exchanges: allExchanges.map(e => ({ role: e.role, text: e.text })),
          heroineState: psychRef.current,
        }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = JSON.parse(line.slice(5).trim());
          if (payload.chunk) { acc += payload.chunk; setStreamText(acc); }
          if (payload.error) throw new Error(payload.error);
        }
      }
      const heroineLine = acc.trim();
      const newExchange: Exchange = { role: "heroine", text: heroineLine, timestamp: Date.now() };
      setExchanges(prev => [...prev, newExchange]);
      setStreamText("");

      if (villainLine) {
        await evaluateBreakdown(villainLine, heroineLine, allExchanges.length / 2 + 1);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  async function evaluateBreakdown(villainLine: string, heroineLine: string, rnd: number) {
    setEvaluating(true);
    try {
      const res = await fetch(`${BASE}/api/story/breakdown-eval`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroineName, villainLine, heroineLine,
          currentState: psychRef.current,
          exchangeCount: rnd,
        }),
      });
      const data = await res.json();
      if (data.resistanceDelta !== undefined) {
        const newPsych: BreakdownState = {
          resistance:  Math.max(0, Math.min(100, psychRef.current.resistance  + data.resistanceDelta)),
          fear:        Math.max(0, Math.min(100, psychRef.current.fear        + data.fearDelta)),
          defiance:    Math.max(0, Math.min(100, psychRef.current.defiance    + data.defianceDelta)),
          compliance:  Math.max(0, Math.min(100, psychRef.current.compliance  + data.complianceDelta)),
        };
        setPsych(newPsych);
        setPsychLog(prev => [...prev, {
          resistanceDelta: data.resistanceDelta,
          fearDelta:       data.fearDelta,
          defianceDelta:   data.defianceDelta,
          complianceDelta: data.complianceDelta,
          event:           data.event,
          round:           rnd,
        }]);
      }
    } catch {}
    setEvaluating(false);
  }

  function handleBegin() {
    if (!canBegin) return;
    setPhase("active");
    setExchanges([]);
    setPsych({ resistance: 100, fear: 10, defiance: 90, compliance: 0 });
    setPsychLog([]);
    setRound(0);
    streamHeroine([]);
  }

  function handleSend() {
    if (!draft.trim() || streaming) return;
    const line = draft.trim();
    setDraft("");
    const newExchange: Exchange = { role: "villain", text: line, timestamp: Date.now() };
    const updated = [...exchanges, newExchange];
    setExchanges(updated);
    setRound(r => r + 1);
    streamHeroine(updated, line);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  if (phase === "setup") {
    return (
      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "1.5rem 1rem" }}>
        <style>{`@keyframes vi-rise { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }`}</style>

        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(200,200,220,0.35)", cursor: "pointer", fontFamily: "'Montserrat',sans-serif", fontSize: "0.72rem", letterSpacing: "1.5px", marginBottom: "1.75rem", padding: 0 }}>← BACK</button>

        <div style={{ textAlign: "center", marginBottom: "2.5rem", animation: "vi-rise 0.5s ease both" }}>
          <div style={{ fontSize: "0.52rem", color: "rgba(220,38,38,0.5)", letterSpacing: "5px", textTransform: "uppercase", fontFamily: "'Montserrat',sans-serif", marginBottom: "0.5rem" }}>LIVE DIALOGUE</div>
          <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: "2.1rem", color: ACCENT, fontWeight: 900, letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 0.6rem" }}>The Interrogation Room</h1>
          <p style={{ fontSize: "0.75rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Raleway',sans-serif", maxWidth: "440px", margin: "0 auto", lineHeight: 1.6 }}>
            You are the villain. Type what you say or do. The AI plays the heroine — afraid, defiant, cracking. Watch her psyche break in real time.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", animation: "vi-rise 0.5s 0.1s ease both" }}>

          {/* Heroine */}
          <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(245,214,122,0.18)", borderRadius: "16px", padding: "1.5rem" }}>
            <div style={{ fontSize: "0.62rem", fontFamily: "'Cinzel',serif", color: GOLD, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "1rem" }}>Target — Captured Heroine</div>
            <input value={heroineName} onChange={e => setHeroineName(e.target.value)} placeholder="Heroine name…" style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(245,214,122,0.2)", borderRadius: "10px", padding: "0.75rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway',sans-serif", fontSize: "0.88rem", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" }} onFocus={e => e.currentTarget.style.borderColor = "rgba(245,214,122,0.5)"} onBlur={e => e.currentTarget.style.borderColor = "rgba(245,214,122,0.2)"} />
            <input value={heroineSearch} onChange={e => setHeroineSearch(e.target.value)} placeholder="Search quick-pick…" style={{ width: "100%", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "0.5rem 0.85rem", color: "#E8E8F5", fontFamily: "'Raleway',sans-serif", fontSize: "0.78rem", outline: "none", boxSizing: "border-box", marginBottom: "0.65rem" }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", maxHeight: "100px", overflowY: "auto" }}>
              {filteredHeroines.map(h => (
                <button key={h} onClick={() => setHeroineName(h)} style={{ padding: "0.3rem 0.7rem", background: heroineName === h ? "rgba(245,214,122,0.2)" : "rgba(0,0,0,0.4)", border: `1px solid ${heroineName === h ? "rgba(245,214,122,0.5)" : "rgba(255,255,255,0.07)"}`, borderRadius: "20px", color: heroineName === h ? GOLD : "rgba(200,200,220,0.4)", fontFamily: "'Raleway',sans-serif", fontSize: "0.7rem", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>{h}</button>
              ))}
            </div>
          </div>

          {/* Villain + Setting */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(220,38,38,0.18)", borderRadius: "16px", padding: "1.5rem" }}>
              <div style={{ fontSize: "0.62rem", fontFamily: "'Cinzel',serif", color: ACCENT, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "0.85rem" }}>You — The Villain</div>
              <input value={villainName} onChange={e => setVillainName(e.target.value)} placeholder="Your villain name…" style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "10px", padding: "0.75rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway',sans-serif", fontSize: "0.88rem", outline: "none", boxSizing: "border-box" }} onFocus={e => e.currentTarget.style.borderColor = "rgba(220,38,38,0.5)"} onBlur={e => e.currentTarget.style.borderColor = "rgba(220,38,38,0.2)"} />
            </div>

            <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem" }}>
              <div style={{ fontSize: "0.62rem", fontFamily: "'Cinzel',serif", color: "rgba(200,200,220,0.4)", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "0.85rem" }}>Setting</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {SETTINGS.map(s => (
                  <button key={s} onClick={() => setSetting(s)} style={{ padding: "0.4rem 0.75rem", background: setting === s ? "rgba(220,38,38,0.15)" : "rgba(0,0,0,0.35)", border: `1px solid ${setting === s ? "rgba(220,38,38,0.4)" : "rgba(255,255,255,0.05)"}`, borderRadius: "8px", color: setting === s ? ACCENT : "rgba(200,200,220,0.35)", fontFamily: "'Raleway',sans-serif", fontSize: "0.65rem", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>{s}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Extraction target (optional) */}
          <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.25rem" }}>
            <div style={{ fontSize: "0.58rem", fontFamily: "'Cinzel',serif", color: "rgba(200,200,220,0.3)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "0.6rem" }}>What You Want From Her (optional)</div>
            <input value={extractionTarget} onChange={e => setExtractionTarget(e.target.value)} placeholder="e.g. Safe house locations, her team's plan, a confession, her submission…" style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "0.7rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway',sans-serif", fontSize: "0.82rem", outline: "none", boxSizing: "border-box" }} />
          </div>

          <button onClick={handleBegin} disabled={!canBegin} style={{ width: "100%", padding: "1rem", background: canBegin ? `linear-gradient(135deg, ${ACCENT}cc, #7f1d1d)` : "rgba(80,0,0,0.2)", border: `1px solid ${canBegin ? ACCENT : "rgba(220,38,38,0.15)"}`, borderRadius: "14px", color: canBegin ? "#FFF5F5" : "rgba(200,180,180,0.25)", fontFamily: "'Cinzel',serif", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "3px", cursor: canBegin ? "pointer" : "not-allowed", transition: "all 0.2s", boxShadow: canBegin ? `0 8px 32px ${ACCENT}33` : "none" }}>
            ENTER THE ROOM
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#050008", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes vi-appear { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes vi-stream { from{opacity:0.6} to{opacity:1} }
        @keyframes vi-cursor { 0%,100%{opacity:1} 50%{opacity:0} }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(220,38,38,0.2); border-radius: 2px; }
      `}</style>

      {/* TOP BAR */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0 1.25rem", height: "52px", background: "rgba(5,0,8,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(220,38,38,0.12)", flexShrink: 0 }}>
        <button onClick={() => { setPhase("setup"); setExchanges([]); }} style={{ background: "none", border: "none", color: "rgba(200,195,215,0.3)", cursor: "pointer", fontFamily: "'Montserrat',sans-serif", fontSize: "0.65rem", letterSpacing: "1.5px", padding: 0 }}>← EXIT</button>
        <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.05)" }} />
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.7rem", fontWeight: 900, letterSpacing: "3px", color: ACCENT }}>THE INTERROGATION ROOM</span>
        <span style={{ fontSize: "0.52rem", fontFamily: "'Raleway',sans-serif", color: "rgba(200,195,215,0.25)" }}>{villainName.trim()} vs {heroineName}</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {setting && <span style={{ fontSize: "0.5rem", fontFamily: "'Raleway',sans-serif", color: "rgba(200,195,215,0.18)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{setting}</span>}
          <span style={{ padding: "0.18rem 0.6rem", borderRadius: "6px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.25)", fontSize: "0.48rem", fontFamily: "'Montserrat',sans-serif", color: ACCENT, letterSpacing: "1.5px" }}>ROUND {round}</span>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* CHAT PANEL */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>

            {exchanges.length === 0 && !streaming && (
              <div style={{ margin: "auto", textAlign: "center", opacity: 0.25 }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚔</div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.65rem", letterSpacing: "3px", color: "rgba(200,195,215,0.5)" }}>AWAITING OPENING RESPONSE</div>
              </div>
            )}

            {exchanges.map((ex, i) => {
              const isVillain = ex.role === "villain";
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: isVillain ? "flex-end" : "flex-start", animation: "vi-appear 0.3s ease both" }}>
                  <div style={{ fontSize: "0.42rem", fontFamily: "'Montserrat',sans-serif", color: isVillain ? `${ACCENT}88` : "rgba(200,195,215,0.2)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                    {isVillain ? villainName.trim() || "YOU" : heroineName}
                  </div>
                  <div style={{ maxWidth: "72%", padding: "0.85rem 1.1rem", borderRadius: isVillain ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: isVillain ? `linear-gradient(135deg, rgba(127,29,29,0.7), rgba(185,28,28,0.4))` : "rgba(16,8,28,0.9)", border: isVillain ? `1px solid ${ACCENT}44` : "1px solid rgba(255,255,255,0.07)", boxShadow: isVillain ? `0 4px 20px ${ACCENT}18` : "none" }}>
                    <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.82rem", color: isVillain ? "#FFF0F0" : "rgba(210,205,235,0.75)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{ex.text}</div>
                  </div>
                </div>
              );
            })}

            {/* Streaming heroine response */}
            {streaming && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", animation: "vi-stream 0.2s ease both" }}>
                <div style={{ fontSize: "0.42rem", fontFamily: "'Montserrat',sans-serif", color: "rgba(200,195,215,0.2)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "0.3rem" }}>{heroineName}</div>
                <div style={{ maxWidth: "72%", padding: "0.85rem 1.1rem", borderRadius: "16px 16px 16px 4px", background: "rgba(16,8,28,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: "0.82rem", color: "rgba(210,205,235,0.75)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {streamText || <span style={{ animation: "vi-cursor 0.9s infinite", color: "rgba(200,195,215,0.4)" }}>▌</span>}
                    {streamText && <span style={{ animation: "vi-cursor 0.9s infinite", color: "rgba(200,195,215,0.4)" }}>▌</span>}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div style={{ padding: "0.6rem 1rem", background: "rgba(80,0,0,0.4)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "10px", fontSize: "0.7rem", color: "#F87171", fontFamily: "'Raleway',sans-serif" }}>⚠ {error}</div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* INPUT BAR */}
          <div style={{ padding: "1rem 1.5rem 1.25rem", background: "rgba(5,0,8,0.95)", borderTop: "1px solid rgba(220,38,38,0.1)", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <div style={{ fontSize: "0.42rem", fontFamily: "'Montserrat',sans-serif", color: `${ACCENT}88`, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "0.4rem" }}>{villainName.trim() || "YOU"} — your line</div>
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={streaming}
                  placeholder={streaming ? "She is responding…" : `What do you say or do? (Enter to send, Shift+Enter for new line)`}
                  rows={2}
                  style={{ width: "100%", background: "rgba(30,10,10,0.7)", border: `1px solid ${draft.trim() ? `${ACCENT}55` : "rgba(220,38,38,0.18)"}`, borderRadius: "12px", padding: "0.8rem 1rem", color: "#FFF0F0", fontFamily: "'Raleway',sans-serif", fontSize: "0.88rem", outline: "none", resize: "none", boxSizing: "border-box", caretColor: ACCENT, lineHeight: 1.5, transition: "border-color 0.2s", opacity: streaming ? 0.5 : 1 }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!draft.trim() || streaming}
                style={{ flexShrink: 0, padding: "0.85rem 1.25rem", background: draft.trim() && !streaming ? `linear-gradient(135deg, ${ACCENT}, #7f1d1d)` : "rgba(80,0,0,0.2)", border: `1px solid ${draft.trim() && !streaming ? ACCENT : "rgba(220,38,38,0.15)"}`, borderRadius: "12px", color: draft.trim() && !streaming ? "#FFF5F5" : "rgba(200,180,180,0.25)", fontFamily: "'Cinzel',serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "2px", cursor: draft.trim() && !streaming ? "pointer" : "not-allowed", transition: "all 0.2s", whiteSpace: "nowrap", boxShadow: draft.trim() && !streaming ? `0 4px 20px ${ACCENT}33` : "none" }}
              >
                {streaming ? "…" : "SEND ↵"}
              </button>
            </div>
            <div style={{ marginTop: "0.5rem", fontSize: "0.48rem", fontFamily: "'Raleway',sans-serif", color: "rgba(200,195,215,0.18)" }}>
              You are the villain. {extractionTarget ? `Objective: ${extractionTarget}` : "Push her. Break her."} The AI plays {heroineName}.
            </div>
          </div>
        </div>

        {/* BREAKDOWN TRACKER SIDEBAR */}
        <div style={{ width: "260px", flexShrink: 0, borderLeft: "1px solid rgba(220,38,38,0.1)", background: "rgba(4,0,10,0.8)", overflowY: "auto", padding: "1rem" }}>
          <PsychBreakdownTracker
            state={psych}
            log={psychLog}
            heroineName={heroineName}
            heroineColor={ACCENT}
            loading={evaluating}
          />

          {/* Exchange count */}
          {exchanges.length > 0 && (
            <div style={{ marginTop: "0.75rem", padding: "0.65rem 0.85rem", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px" }}>
              <div style={{ fontSize: "0.45rem", fontFamily: "'Montserrat',sans-serif", letterSpacing: "2px", color: "rgba(200,195,215,0.2)", textTransform: "uppercase", marginBottom: "0.3rem" }}>SESSION</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div><div style={{ fontFamily: "'Cinzel',serif", fontSize: "1.1rem", color: ACCENT, fontWeight: 700 }}>{Math.ceil(exchanges.length / 2)}</div><div style={{ fontSize: "0.48rem", color: "rgba(200,195,215,0.25)", fontFamily: "'Montserrat',sans-serif", letterSpacing: "1px" }}>EXCHANGES</div></div>
                <div style={{ textAlign: "right" }}><div style={{ fontFamily: "'Cinzel',serif", fontSize: "1.1rem", color: "rgba(200,195,215,0.4)", fontWeight: 700 }}>{psychLog.length}</div><div style={{ fontSize: "0.48rem", color: "rgba(200,195,215,0.25)", fontFamily: "'Montserrat',sans-serif", letterSpacing: "1px" }}>PSYCH READS</div></div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div style={{ marginTop: "0.75rem", padding: "0.7rem", background: "rgba(0,0,0,0.25)", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.42rem", fontFamily: "'Montserrat',sans-serif", letterSpacing: "1.5px", color: "rgba(200,195,215,0.15)", textTransform: "uppercase", marginBottom: "0.5rem" }}>TACTICS</div>
            {["Use her name — it unsettles her.", "Silence can be more threatening than words.", "False sympathy is the sharpest blade.", "Describe what you can see she's feeling.", "Make her prove her defiance. It costs her."].map(t => (
              <div key={t} style={{ fontSize: "0.58rem", fontFamily: "'Raleway',sans-serif", color: "rgba(200,195,215,0.22)", lineHeight: 1.5, marginBottom: "0.3rem", paddingLeft: "0.5rem", borderLeft: "1px solid rgba(220,38,38,0.15)" }}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
