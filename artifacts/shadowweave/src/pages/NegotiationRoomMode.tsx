import { useState, useRef, useEffect } from "react";
import { saveStoryToArchive } from "../lib/archive";
import { useIsMobile } from "../hooks/useIsMobile";

interface Props { onBack: () => void; }
type Phase = "setup" | "active";
interface Message { role: "villain" | "heroine"; text: string; }

const QUICK_HEROINES = [
  "Black Widow", "Supergirl", "Wonder Woman", "Captain Marvel", "Starlight",
  "Batgirl / Oracle", "Jean Grey", "Scarlet Witch", "Power Girl", "Zatanna",
  "Raven", "Sara Lance", "Black Canary", "Storm", "Hawkgirl", "Huntress",
  "Sydney Bristow", "Sarah Walker", "Aloy", "Ellie (TLOU)", "Ada Wong",
  "Ellen Ripley", "Lara Croft", "Eve Polastri", "Ilsa Faust",
];

const QUICK_VILLAINS = [
  { name: "Thanos",            style: "Cosmic inevitability — he frames it as a gift, not a demand" },
  { name: "Doctor Doom",       style: "Surgical precision — he offers a choice as a courtesy, not a necessity" },
  { name: "Magneto",           style: "Philosophical seduction — he genuinely believes she'll agree if she thinks" },
  { name: "Loki",              style: "Charming misdirection — every word has a second purpose" },
  { name: "Lex Luthor",        style: "Corporate logic — everything reduced to exchange of value" },
  { name: "Ra's al Ghul",      style: "Moral framing — he positions her refusal as the true evil" },
  { name: "Amanda Waller",     style: "Cold leverage — the file on her desk is thicker than she realises" },
  { name: "Mephisto",          style: "Infernal contract — the offer is perfect because the price is hidden" },
  { name: "Darkseid",          style: "Patient inevitability — he offers because he enjoys watching the struggle" },
  { name: "Granny Goodness",   style: "Maternal cruelty — she frames compliance as love" },
  { name: "The Senator",       style: "Institutional pressure — everything is on the record until it isn't" },
  { name: "The Tech Mogul",    style: "Data-driven inevitability — he already knows her answer before she does" },
  { name: "The Cult Leader",   style: "Belief erosion — he doesn't ask for agreement, he waits for revelation" },
  { name: "The Billionaire",   style: "Economic gravity — he makes refusal feel irrational" },
  { name: "The Russian Spymaster", style: "Professional respect — he acknowledges her skill before dismantling her options" },
];

const DEMANDS = [
  { id: "intel",      label: "Reveal classified intelligence",     desc: "She knows something. He needs to know she'll tell him." },
  { id: "alliance",   label: "Work for him",                       desc: "Not surrender — partnership. On his terms." },
  { id: "identity",   label: "Unmask her allies",                  desc: "Names. Locations. Safe houses. Everything she's protected." },
  { id: "statement",  label: "Issue a public statement",           desc: "Her voice, his words. Her credibility, his message." },
  { id: "abandon",    label: "Abandon her mission",                desc: "Stand down. Walk away. Let it happen." },
  { id: "asset",      label: "Hand over a critical asset",         desc: "A weapon, a code, a formula — something irreplaceable." },
  { id: "loyalty",    label: "Pledge her loyalty",                 desc: "Not just cooperation — allegiance. Permanent." },
  { id: "submission", label: "Submit to him personally",           desc: "Everything else was prologue. This is what he always wanted." },
];

const LEVERAGE_TYPES = [
  { id: "blackmail",    label: "Blackmail",          desc: "Something she's done that the world can never know" },
  { id: "hostage",      label: "Hostage",             desc: "Someone she loves is already in his hands" },
  { id: "exposure",     label: "Public Exposure",     desc: "Her identity, her mission, her secrets — broadcast unless she agrees" },
  { id: "temptation",   label: "Genuine Temptation",  desc: "What he's offering is something she actually wants" },
  { id: "exhaustion",   label: "Psychological Wear",  desc: "Hours in the room, relentless pressure — she's beginning to crack" },
  { id: "logic",        label: "Rational Argument",   desc: "He makes the case so perfectly that refusing feels like the mistake" },
];

export default function NegotiationRoomMode({ onBack }: Props) {
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<Phase>("setup");
  const [heroine, setHeroine] = useState("");
  const [selectedVillain, setSelectedVillain] = useState<typeof QUICK_VILLAINS[0] | null>(null);
  const [customVillain, setCustomVillain] = useState("");
  const [demand, setDemand] = useState("");
  const [leverage, setLeverage] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [response, setResponse] = useState("");
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [round, setRound] = useState(1);
  const [resolved, setResolved] = useState<"agreed" | "refused" | null>(null);
  const [saved, setSaved] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streaming]);

  const villainLabel = selectedVillain ? selectedVillain.name : customVillain.trim();
  const villainStyle = selectedVillain ? selectedVillain.style : "";
  const demandObj = DEMANDS.find(d => d.id === demand);
  const leverageObj = LEVERAGE_TYPES.find(l => l.id === leverage);
  const canBegin = heroine.trim() && villainLabel && demand && leverage;

  async function streamVillain(msgs: Message[]) {
    setLoading(true);
    setStreaming("");
    setError("");
    let acc = "";
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
      const resp = await fetch(`${base}/api/story/negotiation-room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroine: heroine.trim(),
          villain: villainLabel,
          villainStyle,
          demand: demandObj?.label ?? demand,
          demandDesc: demandObj?.desc ?? "",
          leverage: leverageObj?.label ?? leverage,
          leverageDesc: leverageObj?.desc ?? "",
          additionalContext: additionalContext.trim() || undefined,
          messages: msgs,
          round,
        }),
      });
      if (!resp.ok || !resp.body) throw new Error(`HTTP ${resp.status}`);
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = JSON.parse(line.slice(6));
          if (payload.chunk) { acc += payload.chunk; setStreaming(acc); }
          if (payload.error) throw new Error(payload.error);
        }
      }
      setMessages(prev => [...prev, { role: "villain", text: acc }]);
      setStreaming("");
      setRound(r => r + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function begin() {
    if (!canBegin) return;
    setPhase("active");
    setMessages([]);
    setRound(1);
    setResolved(null);
    setSaved(false);
    streamVillain([]);
  }

  function sendResponse() {
    if (!response.trim() || loading || resolved) return;
    const newMsg: Message = { role: "heroine", text: response.trim() };
    const updated = [...messages, newMsg];
    setMessages(updated);
    setResponse("");
    streamVillain(updated);
    setTimeout(() => textareaRef.current?.focus(), 100);
  }

  function resolveNegotiation(outcome: "agreed" | "refused") {
    setResolved(outcome);
  }

  function saveToArchive() {
    const allText = messages.map(m => `[${m.role === "villain" ? villainLabel : heroine}]\n${m.text}`).join("\n\n─────────────────\n\n");
    saveStoryToArchive({ title: `Negotiation: ${heroine} vs. ${villainLabel}`, universe: "Psychological", characters: [heroine, villainLabel], chapters: [allText], tool: "negotiation-room" });
    setSaved(true);
  }

  const ACCENT = "#38BDF8";

  if (phase === "setup") {
    return (
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: isMobile ? "1rem" : "2rem 1rem" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(200,200,220,0.4)", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "0.75rem", letterSpacing: "1.5px", marginBottom: "1.5rem", padding: 0 }}>← Back</button>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.6rem", color: "rgba(56,189,248,0.5)", letterSpacing: "4px", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.5rem" }}>STORY MODE</div>
          <h1 className="font-cinzel" style={{ fontSize: isMobile ? "1.5rem" : "2rem", color: ACCENT, fontWeight: 900, letterSpacing: "4px", textTransform: "uppercase", marginBottom: "0.5rem" }}>The Negotiation Room</h1>
          <p style={{ fontSize: "0.82rem", color: "rgba(200,200,220,0.45)", fontFamily: "'Montserrat', sans-serif", maxWidth: "520px", margin: "0 auto" }}>
            No restraints. Just words. The villain wants something — and he's very good at getting it.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Heroine */}
          <div style={{ background: "rgba(0,0,0,0.45)", border: `1px solid rgba(56,189,248,0.2)`, borderRadius: "14px", padding: "1.25rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.65rem", color: ACCENT, letterSpacing: "2.5px", marginBottom: "1rem" }}>THE HEROINE</div>
            <input value={heroine} onChange={e => setHeroine(e.target.value)} placeholder="Enter heroine name…" style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: `1px solid rgba(56,189,248,0.25)`, borderRadius: "8px", padding: "0.7rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" }} onFocus={e => e.currentTarget.style.borderColor = "rgba(56,189,248,0.55)"} onBlur={e => e.currentTarget.style.borderColor = "rgba(56,189,248,0.25)"} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {QUICK_HEROINES.map(h => (
                <button key={h} onClick={() => setHeroine(h)} style={{ padding: "0.3rem 0.7rem", background: heroine === h ? "rgba(56,189,248,0.15)" : "rgba(0,0,0,0.4)", border: `1px solid ${heroine === h ? "rgba(56,189,248,0.5)" : "rgba(255,255,255,0.07)"}`, borderRadius: "20px", color: heroine === h ? ACCENT : "rgba(200,200,220,0.45)", fontFamily: "'Raleway', sans-serif", fontSize: "0.7rem", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>{h}</button>
              ))}
            </div>
          </div>

          {/* Villain */}
          <div style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(200,60,60,0.2)", borderRadius: "14px", padding: "1.25rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.65rem", color: "#F87171", letterSpacing: "2.5px", marginBottom: "1rem" }}>THE NEGOTIATOR</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "0.45rem", marginBottom: "0.75rem" }}>
              {QUICK_VILLAINS.map(v => {
                const sel = selectedVillain?.name === v.name;
                return (
                  <button key={v.name} onClick={() => { setSelectedVillain(v); setCustomVillain(""); }} style={{ background: sel ? "rgba(200,60,60,0.15)" : "rgba(0,0,0,0.4)", border: `1px solid ${sel ? "rgba(200,60,60,0.5)" : "rgba(255,255,255,0.06)"}`, borderRadius: "10px", padding: "0.55rem 0.75rem", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                    <div className="font-cinzel" style={{ fontSize: "0.67rem", color: sel ? "#F87171" : "#E0E0F0", fontWeight: 700, marginBottom: "0.2rem" }}>{v.name}</div>
                    <div style={{ fontSize: "0.55rem", color: "rgba(200,200,220,0.35)", fontFamily: "'Montserrat', sans-serif", lineHeight: 1.4 }}>{v.style}</div>
                  </button>
                );
              })}
            </div>
            <input value={customVillain} onChange={e => { setCustomVillain(e.target.value); setSelectedVillain(null); }} placeholder="Or type a custom negotiator…" style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(200,60,60,0.18)", borderRadius: "8px", padding: "0.65rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }} onFocus={e => e.currentTarget.style.borderColor = "rgba(200,60,60,0.45)"} onBlur={e => e.currentTarget.style.borderColor = "rgba(200,60,60,0.18)"} />
          </div>

          {/* What he wants */}
          <div style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(168,85,247,0.18)", borderRadius: "14px", padding: "1.25rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.65rem", color: "#A855F7", letterSpacing: "2.5px", marginBottom: "1rem" }}>WHAT HE WANTS</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "0.5rem" }}>
              {DEMANDS.map(d => (
                <button key={d.id} onClick={() => setDemand(d.id)} style={{ background: demand === d.id ? "rgba(168,85,247,0.12)" : "rgba(0,0,0,0.4)", border: `1px solid ${demand === d.id ? "rgba(168,85,247,0.45)" : "rgba(255,255,255,0.06)"}`, borderRadius: "10px", padding: "0.65rem 0.85rem", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                  <div className="font-cinzel" style={{ fontSize: "0.68rem", color: demand === d.id ? "#A855F7" : "#E0E0F0", fontWeight: 700, marginBottom: "0.2rem" }}>{d.label}</div>
                  <div style={{ fontSize: "0.58rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Montserrat', sans-serif" }}>{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Leverage */}
          <div style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(251,146,60,0.18)", borderRadius: "14px", padding: "1.25rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.65rem", color: "#FB923C", letterSpacing: "2.5px", marginBottom: "1rem" }}>HIS LEVERAGE</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "0.5rem" }}>
              {LEVERAGE_TYPES.map(l => (
                <button key={l.id} onClick={() => setLeverage(l.id)} style={{ background: leverage === l.id ? "rgba(251,146,60,0.1)" : "rgba(0,0,0,0.4)", border: `1px solid ${leverage === l.id ? "rgba(251,146,60,0.45)" : "rgba(255,255,255,0.06)"}`, borderRadius: "10px", padding: "0.65rem 0.85rem", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                  <div className="font-cinzel" style={{ fontSize: "0.68rem", color: leverage === l.id ? "#FB923C" : "#E0E0F0", fontWeight: 700, marginBottom: "0.2rem" }}>{l.label}</div>
                  <div style={{ fontSize: "0.58rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Montserrat', sans-serif" }}>{l.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Context */}
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "1.25rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.4)", letterSpacing: "2.5px", marginBottom: "0.75rem" }}>ADDITIONAL CONTEXT (Optional)</div>
            <textarea value={additionalContext} onChange={e => setAdditionalContext(e.target.value)} placeholder="Location, tone, history between them, what makes her particularly vulnerable…" rows={2} style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "0.65rem 0.875rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.85rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>

          <button onClick={begin} disabled={!canBegin} style={{ padding: "1rem 2rem", borderRadius: "12px", cursor: canBegin ? "pointer" : "not-allowed", fontSize: "0.85rem", fontFamily: "'Cinzel', serif", letterSpacing: "2.5px", fontWeight: 700, textTransform: "uppercase", transition: "all 0.2s", background: canBegin ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.04)", border: `2px solid ${canBegin ? "rgba(56,189,248,0.5)" : "rgba(255,255,255,0.08)"}`, color: canBegin ? ACCENT : "rgba(200,200,220,0.3)" }}>
            Enter the Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: isMobile ? "0.75rem" : "1.5rem 1rem", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <button onClick={() => { setPhase("setup"); setMessages([]); setResolved(null); }} style={{ background: "none", border: "none", color: "rgba(200,200,220,0.4)", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "0.75rem", letterSpacing: "1.5px", padding: 0 }}>← Restart</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <span className="font-cinzel" style={{ fontSize: "0.62rem", color: ACCENT, letterSpacing: "2.5px" }}>
            {heroine.toUpperCase()} vs. {villainLabel.toUpperCase()} · ROUND {round}
          </span>
        </div>
      </div>

      {/* Demand banner */}
      <div style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: "8px", padding: "0.6rem 1rem", marginBottom: "0.75rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", letterSpacing: "1.5px" }}>DEMAND: <span style={{ color: ACCENT }}>{demandObj?.label}</span></span>
        <span style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", letterSpacing: "1.5px" }}>LEVERAGE: <span style={{ color: "#FB923C" }}>{leverageObj?.label}</span></span>
      </div>

      <div style={{ flex: 1, background: "rgba(0,0,0,0.55)", border: "1px solid rgba(56,189,248,0.12)", borderRadius: "12px", padding: "1.25rem", marginBottom: "1rem", overflowY: "auto", maxHeight: "55vh", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: m.role === "heroine" ? "flex-end" : "flex-start", maxWidth: "90%" }}>
            <div style={{ fontSize: "0.55rem", color: m.role === "villain" ? "#F87171" : ACCENT, fontFamily: "'Cinzel', serif", letterSpacing: "1.5px", alignSelf: m.role === "heroine" ? "flex-end" : "flex-start" }}>
              {m.role === "villain" ? villainLabel.toUpperCase() : heroine.toUpperCase()}
            </div>
            <div style={{
              background: m.role === "villain" ? "rgba(200,60,60,0.08)" : "rgba(56,189,248,0.08)",
              border: `1px solid ${m.role === "villain" ? "rgba(200,60,60,0.2)" : "rgba(56,189,248,0.2)"}`,
              borderRadius: m.role === "villain" ? "0 12px 12px 12px" : "12px 0 12px 12px",
              padding: "0.75rem 1rem",
              fontFamily: "'EB Garamond', Georgia, serif",
              fontSize: "0.95rem", lineHeight: 1.8,
              color: "rgba(220,210,200,0.92)",
            }}>
              {m.text.split("\n").filter(Boolean).map((p, j) => <p key={j} style={{ marginBottom: "0.35em" }}>{p}</p>)}
            </div>
          </div>
        ))}
        {streaming && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "flex-start", maxWidth: "90%" }}>
            <div style={{ fontSize: "0.55rem", color: "#F87171", fontFamily: "'Cinzel', serif", letterSpacing: "1.5px" }}>{villainLabel.toUpperCase()}</div>
            <div style={{ background: "rgba(200,60,60,0.08)", border: "1px solid rgba(200,60,60,0.2)", borderRadius: "0 12px 12px 12px", padding: "0.75rem 1rem", fontFamily: "'EB Garamond', Georgia, serif", fontSize: "0.95rem", lineHeight: 1.8, color: "rgba(220,210,200,0.92)" }}>
              {streaming.split("\n").filter(Boolean).map((p, j) => <p key={j} style={{ marginBottom: "0.35em" }}>{p}</p>)}
              <span style={{ opacity: 0.5 }}>▌</span>
            </div>
          </div>
        )}
        {error && <div style={{ color: "#F87171", fontSize: "0.8rem", fontFamily: "'Montserrat', sans-serif" }}>⚠ {error}</div>}
        {resolved && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem", textAlign: "center" }}>
            <div className="font-cinzel" style={{ fontSize: "1.1rem", color: resolved === "refused" ? "#34D399" : "#F87171", letterSpacing: "4px", marginBottom: "0.5rem" }}>
              {resolved === "refused" ? "✓ SHE REFUSED" : "✕ SHE AGREED"}
            </div>
            {!saved && (
              <button onClick={saveToArchive} style={{ padding: "0.55rem 1.2rem", borderRadius: "8px", background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.3)", color: ACCENT, fontFamily: "'Cinzel', serif", fontSize: "0.7rem", letterSpacing: "1.5px", cursor: "pointer" }}>
                ↓ Save to Archive
              </button>
            )}
            {saved && <span style={{ fontSize: "0.75rem", color: "#34D399", fontFamily: "'Cinzel', serif", letterSpacing: "1.5px" }}>✓ Saved</span>}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {!resolved && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <textarea
              ref={textareaRef}
              value={response}
              onChange={e => setResponse(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendResponse(); } }}
              placeholder={loading ? `${villainLabel} is speaking…` : "How does she respond? (Enter to send)"}
              rows={isMobile ? 2 : 3}
              disabled={loading}
              style={{ width: "100%", background: "rgba(0,0,0,0.55)", border: `1px solid ${loading ? "rgba(56,189,248,0.1)" : "rgba(56,189,248,0.3)"}`, borderRadius: "10px", padding: "0.85rem 1rem", color: "#E8E8F5", fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1rem", outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.6, transition: "border-color 0.2s" }}
            />
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => resolveNegotiation("refused")} style={{ padding: "0.5rem 1rem", borderRadius: "7px", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.3)", color: "#34D399", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "1.5px", cursor: "pointer" }}>
                  ✓ She Refuses — End
                </button>
                <button onClick={() => resolveNegotiation("agreed")} style={{ padding: "0.5rem 1rem", borderRadius: "7px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", color: "#F87171", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "1.5px", cursor: "pointer" }}>
                  ✕ She Agrees — End
                </button>
              </div>
              <button onClick={sendResponse} disabled={loading || !response.trim()} style={{ padding: "0.6rem 1.5rem", borderRadius: "8px", cursor: loading || !response.trim() ? "not-allowed" : "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "2px", fontWeight: 700, transition: "all 0.2s", background: loading || !response.trim() ? "rgba(56,189,248,0.06)" : "rgba(56,189,248,0.15)", border: `1px solid ${loading || !response.trim() ? "rgba(56,189,248,0.1)" : "rgba(56,189,248,0.45)"}`, color: loading || !response.trim() ? "rgba(56,189,248,0.3)" : ACCENT }}>
                {loading ? "⟳ Speaking…" : "Respond →"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
