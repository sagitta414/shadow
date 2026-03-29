import { useState, useRef, useEffect } from "react";
import { saveStoryToArchive } from "../lib/archive";
import { useIsMobile } from "../hooks/useIsMobile";

interface Props { onBack: () => void; }
type Phase = "setup" | "active";

interface Beat { role: "action" | "result"; text: string; }

const QUICK_HEROINES = [
  "Black Widow", "Supergirl", "Wonder Woman", "Captain Marvel", "Starlight",
  "Batgirl / Oracle", "Jean Grey", "Scarlet Witch", "Power Girl", "Zatanna",
  "Raven", "Sara Lance", "Black Canary", "Storm", "Hawkgirl", "Huntress",
  "Lara Croft", "Jill Valentine", "Samus Aran", "Aloy", "Ellie (TLOU)",
  "Sydney Bristow", "Sarah Walker", "Ellen Ripley", "Sarah Connor",
];

const FACILITIES = [
  { id: "black_site",   label: "Black Site",         desc: "No oversight, no signals, no mercy — deep underground" },
  { id: "villain_hq",  label: "Villain Headquarters",desc: "A fortress of ego — every room designed to intimidate" },
  { id: "prison",      label: "Secure Prison",        desc: "Guards, locked cells, surveillance — built to hold the impossible" },
  { id: "compound",    label: "Remote Compound",      desc: "Isolated from civilisation — escape means surviving the wilderness too" },
  { id: "lab",         label: "Research Facility",    desc: "Sterile corridors, locked labs, guards who ask no questions" },
  { id: "mansion",     label: "Private Estate",       desc: "Luxury over brutalism — but the exits are just as sealed" },
];

const OPPORTUNITIES = [
  { id: "guard_error",  label: "Guard's Mistake",      desc: "A door left ajar, a key forgotten, a moment of inattention" },
  { id: "power_cut",    label: "Power Outage",          desc: "Darkness, backup systems failing, two minutes before the grid restores" },
  { id: "found_tool",   label: "Hidden Tool",           desc: "A pin, a shard, a wire — found and concealed before the last search" },
  { id: "distraction",  label: "Chaos Outside",         desc: "An alarm, a fight, a fire — something pulls the guards away" },
  { id: "ally_signal",  label: "Ally Contact",          desc: "A whispered code, a tapped signal — someone knows she's here" },
  { id: "own_power",    label: "Power Returning",       desc: "Whatever they used to suppress her — it's wearing off" },
];

const QUICK_VILLAINS = [
  "Thanos", "Doctor Doom", "Magneto", "Loki", "HYDRA Commander", "Red Skull",
  "Darkseid", "Lex Luthor", "Ra's al Ghul", "Granny Goodness", "Sinestro",
  "Deathstroke", "Homelander", "The Russian Operative", "The CIA Handler",
  "The Warden", "The Cartel Boss", "The Crime Lord", "The Mercenary",
  "Mephisto", "General Zod", "Zoom", "Damien Darhk",
];

export default function EscapeAttemptMode({ onBack }: Props) {
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<Phase>("setup");
  const [heroine, setHeroine] = useState("");
  const [villain, setVillain] = useState("");
  const [customVillain, setCustomVillain] = useState("");
  const [facility, setFacility] = useState("");
  const [opportunity, setOpportunity] = useState("");
  const [extraNotes, setExtraNotes] = useState("");
  const [beats, setBeats] = useState<Beat[]>([]);
  const [action, setAction] = useState("");
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [beatNum, setBeatNum] = useState(1);
  const [outcome, setOutcome] = useState<"escaped" | "recaptured" | null>(null);
  const [saved, setSaved] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [beats, streaming]);

  const villainLabel = villain || customVillain.trim();
  const facilityObj = FACILITIES.find(f => f.id === facility);
  const opportunityObj = OPPORTUNITIES.find(o => o.id === opportunity);
  const canBegin = heroine.trim() && villainLabel && facility && opportunity;

  async function stream(currentBeats: Beat[], userAction: string, isFinal: boolean) {
    setLoading(true);
    setStreaming("");
    setError("");
    let acc = "";
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
      const resp = await fetch(`${base}/api/story/escape-attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroine: heroine.trim(),
          villain: villainLabel,
          facility: facilityObj?.label ?? facility,
          opportunity: opportunityObj?.label ?? opportunity,
          extraNotes: extraNotes.trim() || undefined,
          beats: currentBeats,
          userAction: userAction.trim(),
          beatNum,
          isFinal,
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
      const resultBeat: Beat = { role: "result", text: acc };
      setBeats(prev => [...prev, resultBeat]);
      setStreaming("");
      setBeatNum(n => n + 1);
      if (isFinal || acc.toLowerCase().includes("escaped") || acc.toLowerCase().includes("free at last") || beatNum >= 8) {
        const escaped = acc.toLowerCase().includes("escape") && !acc.toLowerCase().includes("recaptur") && !acc.toLowerCase().includes("caught") && !acc.toLowerCase().includes("failed");
        setOutcome(escaped ? "escaped" : "recaptured");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function begin() {
    if (!canBegin) return;
    setPhase("active");
    setBeats([]);
    setBeatNum(1);
    setOutcome(null);
    setSaved(false);
    const openingAction = `She takes her shot — ${opportunityObj?.desc ?? opportunity}`;
    const openingBeat: Beat = { role: "action", text: openingAction };
    setBeats([openingBeat]);
    stream([openingBeat], openingAction, false);
  }

  function sendAction() {
    if (!action.trim() || loading || outcome) return;
    const newBeat: Beat = { role: "action", text: action.trim() };
    const updated = [...beats, newBeat];
    setBeats(updated);
    setAction("");
    const isFinal = beatNum >= 6;
    stream(updated, action.trim(), isFinal);
    setTimeout(() => textareaRef.current?.focus(), 100);
  }

  function saveToArchive() {
    const chapters = [beats.filter(b => b.role === "result").map(b => b.text).join("\n\n─────────────────\n\n")];
    saveStoryToArchive({ title: `Escape: ${heroine} vs. ${villainLabel}`, universe: "Action", characters: [heroine, villainLabel], chapters, tool: "escape-attempt" });
    setSaved(true);
  }

  const ACCENT = "#FB923C";

  if (phase === "setup") {
    return (
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: isMobile ? "1rem" : "2rem 1rem" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(200,200,220,0.4)", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "0.75rem", letterSpacing: "1.5px", marginBottom: "1.5rem", padding: 0 }}>← Back</button>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.6rem", color: "rgba(251,146,60,0.5)", letterSpacing: "4px", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.5rem" }}>STORY MODE</div>
          <h1 className="font-cinzel" style={{ fontSize: isMobile ? "1.5rem" : "2rem", color: ACCENT, fontWeight: 900, letterSpacing: "4px", textTransform: "uppercase", marginBottom: "0.5rem" }}>The Escape Attempt</h1>
          <p style={{ fontSize: "0.82rem", color: "rgba(200,200,220,0.45)", fontFamily: "'Montserrat', sans-serif", maxWidth: "520px", margin: "0 auto" }}>
            One shot. You choose every action. The AI plays out the consequences — succeeded or recaptured.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Heroine */}
          <div style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(251,146,60,0.2)", borderRadius: "14px", padding: "1.25rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.65rem", color: ACCENT, letterSpacing: "2.5px", marginBottom: "1rem" }}>THE HEROINE</div>
            <input value={heroine} onChange={e => setHeroine(e.target.value)} placeholder="Enter heroine name…" style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(251,146,60,0.25)", borderRadius: "8px", padding: "0.7rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", marginBottom: "0.75rem" }} onFocus={e => e.currentTarget.style.borderColor = "rgba(251,146,60,0.55)"} onBlur={e => e.currentTarget.style.borderColor = "rgba(251,146,60,0.25)"} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {QUICK_HEROINES.map(h => (
                <button key={h} onClick={() => setHeroine(h)} style={{ padding: "0.3rem 0.7rem", background: heroine === h ? "rgba(251,146,60,0.2)" : "rgba(0,0,0,0.4)", border: `1px solid ${heroine === h ? "rgba(251,146,60,0.5)" : "rgba(255,255,255,0.07)"}`, borderRadius: "20px", color: heroine === h ? ACCENT : "rgba(200,200,220,0.45)", fontFamily: "'Raleway', sans-serif", fontSize: "0.7rem", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>{h}</button>
              ))}
            </div>
          </div>

          {/* Villain / Keeper */}
          <div style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(200,60,60,0.2)", borderRadius: "14px", padding: "1.25rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.65rem", color: "#F87171", letterSpacing: "2.5px", marginBottom: "1rem" }}>THE KEEPER</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.75rem" }}>
              {QUICK_VILLAINS.map(v => (
                <button key={v} onClick={() => { setVillain(v); setCustomVillain(""); }} style={{ padding: "0.3rem 0.7rem", background: villain === v ? "rgba(200,60,60,0.2)" : "rgba(0,0,0,0.4)", border: `1px solid ${villain === v ? "rgba(200,60,60,0.5)" : "rgba(255,255,255,0.07)"}`, borderRadius: "20px", color: villain === v ? "#F87171" : "rgba(200,200,220,0.45)", fontFamily: "'Raleway', sans-serif", fontSize: "0.7rem", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>{v}</button>
              ))}
            </div>
            <input value={customVillain} onChange={e => { setCustomVillain(e.target.value); setVillain(""); }} placeholder="Or type a custom captor…" style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(200,60,60,0.18)", borderRadius: "8px", padding: "0.65rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }} onFocus={e => e.currentTarget.style.borderColor = "rgba(200,60,60,0.45)"} onBlur={e => e.currentTarget.style.borderColor = "rgba(200,60,60,0.18)"} />
          </div>

          {/* Facility */}
          <div style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(96,165,250,0.18)", borderRadius: "14px", padding: "1.25rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.65rem", color: "#60A5FA", letterSpacing: "2.5px", marginBottom: "1rem" }}>THE FACILITY</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "0.5rem" }}>
              {FACILITIES.map(f => (
                <button key={f.id} onClick={() => setFacility(f.id)} style={{ background: facility === f.id ? "rgba(96,165,250,0.12)" : "rgba(0,0,0,0.4)", border: `1px solid ${facility === f.id ? "rgba(96,165,250,0.45)" : "rgba(255,255,255,0.06)"}`, borderRadius: "10px", padding: "0.65rem 0.85rem", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                  <div className="font-cinzel" style={{ fontSize: "0.68rem", color: facility === f.id ? "#60A5FA" : "#E0E0F0", fontWeight: 700, marginBottom: "0.2rem" }}>{f.label}</div>
                  <div style={{ fontSize: "0.58rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Montserrat', sans-serif" }}>{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Opportunity */}
          <div style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(52,211,153,0.18)", borderRadius: "14px", padding: "1.25rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.65rem", color: "#34D399", letterSpacing: "2.5px", marginBottom: "1rem" }}>THE ONE SHOT</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "0.5rem" }}>
              {OPPORTUNITIES.map(o => (
                <button key={o.id} onClick={() => setOpportunity(o.id)} style={{ background: opportunity === o.id ? "rgba(52,211,153,0.1)" : "rgba(0,0,0,0.4)", border: `1px solid ${opportunity === o.id ? "rgba(52,211,153,0.45)" : "rgba(255,255,255,0.06)"}`, borderRadius: "10px", padding: "0.65rem 0.85rem", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                  <div className="font-cinzel" style={{ fontSize: "0.68rem", color: opportunity === o.id ? "#34D399" : "#E0E0F0", fontWeight: 700, marginBottom: "0.2rem" }}>{o.label}</div>
                  <div style={{ fontSize: "0.58rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Montserrat', sans-serif" }}>{o.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Extra notes */}
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "1.25rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.4)", letterSpacing: "2.5px", marginBottom: "0.75rem" }}>ADDITIONAL NOTES (Optional)</div>
            <textarea value={extraNotes} onChange={e => setExtraNotes(e.target.value)} placeholder="Powers suppressed? Ally nearby? Specific weakness to exploit?" rows={2} style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "0.65rem 0.875rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.85rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>

          <button onClick={begin} disabled={!canBegin} style={{ padding: "1rem 2rem", borderRadius: "12px", cursor: canBegin ? "pointer" : "not-allowed", fontSize: "0.85rem", fontFamily: "'Cinzel', serif", letterSpacing: "2.5px", fontWeight: 700, textTransform: "uppercase", transition: "all 0.2s", background: canBegin ? `rgba(251,146,60,0.18)` : "rgba(255,255,255,0.04)", border: `2px solid ${canBegin ? "rgba(251,146,60,0.55)" : "rgba(255,255,255,0.08)"}`, color: canBegin ? ACCENT : "rgba(200,200,220,0.3)" }}>
            Begin the Escape
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: isMobile ? "0.75rem" : "1.5rem 1rem", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <button onClick={() => { setPhase("setup"); setBeats([]); setOutcome(null); }} style={{ background: "none", border: "none", color: "rgba(200,200,220,0.4)", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "0.75rem", letterSpacing: "1.5px", padding: 0 }}>← Restart</button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <span className="font-cinzel" style={{ fontSize: "0.65rem", color: ACCENT, letterSpacing: "3px" }}>{heroine.toUpperCase()} · ESCAPE ATTEMPT · BEAT {Math.min(beatNum, 8)} / 8</span>
        </div>
      </div>

      <div style={{ flex: 1, background: "rgba(0,0,0,0.55)", border: "1px solid rgba(251,146,60,0.15)", borderRadius: "12px", padding: "1.25rem", marginBottom: "1rem", overflowY: "auto", maxHeight: "60vh", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {beats.map((b, i) => (
          <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            {b.role === "action" ? (
              <>
                <div style={{ fontSize: "0.7rem", color: ACCENT, fontFamily: "'Cinzel', serif", letterSpacing: "1px", flexShrink: 0, paddingTop: "0.15rem" }}>▶</div>
                <div style={{ flex: 1, fontSize: "0.85rem", color: "rgba(251,200,160,0.9)", fontFamily: "'Raleway', sans-serif", fontStyle: "italic", lineHeight: 1.6 }}>{b.text}</div>
              </>
            ) : (
              <div style={{ flex: 1, fontFamily: "'EB Garamond', Georgia, serif", fontSize: "0.95rem", lineHeight: 1.85, color: "rgba(220,210,200,0.9)" }}>
                {b.text.split("\n").filter(Boolean).map((p, j) => <p key={j} style={{ textIndent: "1.5em", marginBottom: "0.4em" }}>{p}</p>)}
              </div>
            )}
          </div>
        ))}
        {streaming && (
          <div style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: "0.95rem", lineHeight: 1.85, color: "rgba(220,210,200,0.9)" }}>
            {streaming.split("\n").filter(Boolean).map((p, j) => <p key={j} style={{ textIndent: "1.5em", marginBottom: "0.4em" }}>{p}</p>)}
            <span style={{ opacity: 0.5 }}>▌</span>
          </div>
        )}
        {error && <div style={{ color: "#F87171", fontSize: "0.8rem", fontFamily: "'Montserrat', sans-serif" }}>⚠ {error}</div>}
        {outcome && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem", textAlign: "center" }}>
            <div className="font-cinzel" style={{ fontSize: "1.1rem", color: outcome === "escaped" ? "#34D399" : "#F87171", letterSpacing: "4px", marginBottom: "0.5rem" }}>
              {outcome === "escaped" ? "✓ ESCAPED" : "✕ RECAPTURED"}
            </div>
            {!saved && (
              <button onClick={saveToArchive} style={{ padding: "0.55rem 1.2rem", borderRadius: "8px", background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.35)", color: ACCENT, fontFamily: "'Cinzel', serif", fontSize: "0.7rem", letterSpacing: "1.5px", cursor: "pointer" }}>
                ↓ Save to Archive
              </button>
            )}
            {saved && <span style={{ fontSize: "0.75rem", color: "#34D399", fontFamily: "'Cinzel', serif", letterSpacing: "1.5px" }}>✓ Saved</span>}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {!outcome && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <textarea
            ref={textareaRef}
            value={action}
            onChange={e => setAction(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAction(); } }}
            placeholder={loading ? "The AI is writing…" : "What does she do next? (Enter to send, Shift+Enter for new line)"}
            rows={isMobile ? 2 : 3}
            disabled={loading}
            style={{ width: "100%", background: "rgba(0,0,0,0.55)", border: `1px solid ${loading ? "rgba(251,146,60,0.1)" : "rgba(251,146,60,0.3)"}`, borderRadius: "10px", padding: "0.85rem 1rem", color: "#E8E8F5", fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1rem", outline: "none", resize: "none", boxSizing: "border-box", lineHeight: 1.6, transition: "border-color 0.2s" }}
          />
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.2)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px" }}>BEAT {beatNum} OF 8</span>
            <button onClick={sendAction} disabled={loading || !action.trim()} style={{ padding: "0.6rem 1.5rem", borderRadius: "8px", cursor: loading || !action.trim() ? "not-allowed" : "pointer", fontSize: "0.75rem", fontFamily: "'Cinzel', serif", letterSpacing: "2px", fontWeight: 700, transition: "all 0.2s", background: loading || !action.trim() ? "rgba(251,146,60,0.06)" : "rgba(251,146,60,0.18)", border: `1px solid ${loading || !action.trim() ? "rgba(251,146,60,0.1)" : "rgba(251,146,60,0.45)"}`, color: loading || !action.trim() ? "rgba(251,146,60,0.3)" : ACCENT }}>
              {loading ? "⟳ Writing…" : beatNum >= 6 ? "Final Move →" : "Next Beat →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
