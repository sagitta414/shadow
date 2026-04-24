import { useState, useEffect } from "react";
import { getWeeklyChallenges, evaluateChallenges, markChallengeComplete, RARITY_COLORS, type Challenge } from "../lib/bountyBoard";

interface Props { onBack: () => void; }

function msUntilNextWeek(): string {
  const now = Date.now();
  const weekMs = 7 * 24 * 3600 * 1000;
  const remaining = weekMs - (now % weekMs);
  const d = Math.floor(remaining / 86400000);
  const h = Math.floor((remaining % 86400000) / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  return `${d}d ${h}h ${m}m`;
}

export default function BountyBoard({ onBack }: Props) {
  const [results, setResults] = useState<{ challenge: Challenge; complete: boolean }[]>([]);
  const [timer, setTimer] = useState(msUntilNextWeek());

  function refresh() { setResults(evaluateChallenges()); }

  useEffect(() => {
    refresh();
    const iv = setInterval(() => setTimer(msUntilNextWeek()), 60000);
    return () => clearInterval(iv);
  }, []);

  function handleMarkDone(id: string) {
    markChallengeComplete(id);
    refresh();
  }

  const completed = results.filter(r => r.complete).length;
  const total = results.length;

  return (
    <div style={{ minHeight: "100vh", padding: "1.5rem 1rem", maxWidth: 780, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(200,200,220,0.4)", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "2px", fontFamily: "'Cinzel', serif", padding: 0, marginBottom: "1.75rem" }}>
        ← BACK
      </button>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.6rem", letterSpacing: "4px", color: "rgba(245,158,11,0.6)", marginBottom: "0.4rem" }}>WEEKLY BOUNTY BOARD</div>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.6rem,5vw,2.2rem)", fontWeight: 700, color: "#E8E0D0", margin: 0, marginBottom: "0.4rem" }}>
          Active Contracts
        </h1>
        <p style={{ fontSize: "0.78rem", color: "rgba(200,200,220,0.4)", letterSpacing: "0.5px", margin: 0 }}>
          Resets in <span style={{ color: "rgba(245,158,11,0.8)" }}>{timer}</span>
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.65rem", letterSpacing: "2px", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif" }}>
            COMPLETION
          </span>
          <span style={{ fontSize: "0.75rem", color: completed === total ? "#F59E0B" : "rgba(200,200,220,0.5)", fontFamily: "'Cinzel', serif", fontWeight: 600 }}>
            {completed} / {total}
          </span>
        </div>
        <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: "2px", transition: "width 0.6s ease",
            width: `${total > 0 ? (completed / total) * 100 : 0}%`,
            background: completed === total
              ? "linear-gradient(90deg, #F59E0B, #FBBF24)"
              : "linear-gradient(90deg, #7C3AED, #8B5CF6)",
          }} />
        </div>
        {completed === total && total > 0 && (
          <div style={{ marginTop: "0.75rem", fontSize: "0.72rem", color: "#F59E0B", fontFamily: "'Cinzel', serif", letterSpacing: "2px", textAlign: "center" }}>
            ★ ALL CONTRACTS FULFILLED — CHECK BACK NEXT WEEK ★
          </div>
        )}
      </div>

      {/* Challenge cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {results.map(({ challenge: c, complete }) => {
          const rc = RARITY_COLORS[c.rarity];
          return (
            <div key={c.id} style={{
              background: complete ? "rgba(52,211,153,0.05)" : rc.bg,
              border: `1px solid ${complete ? "rgba(52,211,153,0.35)" : rc.border}`,
              borderLeft: `3px solid ${complete ? "#34D399" : rc.text}`,
              borderRadius: "10px",
              padding: "1rem 1.1rem",
              display: "flex", alignItems: "center", gap: "1rem",
              transition: "all 0.2s",
              opacity: complete ? 0.85 : 1,
            }}>
              {/* Icon */}
              <div style={{ fontSize: "1.8rem", flexShrink: 0, lineHeight: 1 }}>{c.icon}</div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.9rem", fontWeight: 600, color: complete ? "#34D399" : "#E8E0D0" }}>
                    {c.title}
                  </span>
                  <span style={{
                    fontSize: "0.55rem", letterSpacing: "1.5px", padding: "0.15rem 0.5rem",
                    borderRadius: "20px", border: `1px solid ${rc.border}`,
                    color: rc.text, background: rc.bg,
                  }}>
                    {RARITY_COLORS[c.rarity].label}
                  </span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "rgba(200,200,220,0.55)", marginBottom: "0.35rem" }}>
                  {c.description}
                </div>
                <div style={{ fontSize: "0.62rem", color: complete ? "rgba(52,211,153,0.6)" : "rgba(200,200,220,0.3)", letterSpacing: "1px" }}>
                  REWARD: <span style={{ color: complete ? "#34D399" : rc.text }}>{c.reward}</span>
                </div>
              </div>

              {/* Status / Mark Done */}
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                {complete ? (
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.85rem", color: "#34D399",
                  }}>✓</div>
                ) : (
                  <>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "50%",
                      background: "rgba(255,255,255,0.03)", border: `1px solid ${rc.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.7rem", color: rc.text,
                    }}>○</div>
                    <button
                      onClick={() => handleMarkDone(c.id)}
                      title="Mark as manually completed"
                      style={{
                        background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
                        borderRadius: "6px", padding: "0.2rem 0.45rem", cursor: "pointer",
                        fontSize: "0.48rem", color: "rgba(245,158,11,0.75)", letterSpacing: "1px",
                        fontFamily: "'Cinzel', serif", whiteSpace: "nowrap", transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.2)"; (e.currentTarget as HTMLElement).style.color = "#F59E0B"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.1)"; (e.currentTarget as HTMLElement).style.color = "rgba(245,158,11,0.75)"; }}
                    >
                      MARK DONE
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div style={{ marginTop: "2rem", padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", textAlign: "center" }}>
        <div style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.3)", letterSpacing: "1px", lineHeight: 1.7 }}>
          Challenges auto-complete when your archive meets the criteria.<br />
          Use <span style={{ color: "rgba(245,158,11,0.5)" }}>MARK DONE</span> to manually claim any contract you've earned.
        </div>
      </div>
    </div>
  );
}
