import { useState, useEffect } from "react";
import { KEY_MILESTONES, getKeyState, getEarnedMilestones, getTotalUnspentValue, KEY_GLYPH, KEY_COLOR, type KeyKind } from "../lib/vaultKeys";
import { getAllMastery } from "../lib/modeMastery";
import { getAllPatrons } from "../lib/patrons";
import { getNightfallSummary, NIGHTFALL_MODES, isBloodMoonToday, nextBloodMoon } from "../lib/nightfall";
import { LOCKED_MODES, getUnlockStatus } from "../lib/modeUnlocks";

interface Props { onBack: () => void }

const PURPLE = "#C084FC";
const PANEL = "rgba(20,12,40,0.65)";
const BORDER = "rgba(168,85,247,0.18)";

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "20px 22px", marginBottom: "18px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "14px", borderBottom: `1px solid ${BORDER}`, paddingBottom: "10px" }}>
        <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "0.95rem", fontWeight: 800, color: PURPLE, letterSpacing: "3px", margin: 0 }}>{title}</h2>
        {sub && <div style={{ fontSize: "0.65rem", color: "rgba(192,132,252,0.55)", fontFamily: "'Cinzel', serif", letterSpacing: "1.5px" }}>{sub}</div>}
      </div>
      {children}
    </section>
  );
}

export default function VaultPage({ onBack }: Props) {
  const [, force] = useState(0);
  useEffect(() => { const id = setInterval(() => force(t => t + 1), 30000); return () => clearInterval(id); }, []);

  const earned = getEarnedMilestones();
  const earnedIds = new Set(earned.map(e => e.id));
  const keys = getKeyState();
  const value = getTotalUnspentValue();
  const mastery = getAllMastery();
  const patrons = getAllPatrons();
  const night = getNightfallSummary();
  const blood = isBloodMoonToday();
  const nextBlood = nextBloodMoon();

  const lockedModes = LOCKED_MODES.map(m => ({ cond: m, status: getUnlockStatus(m.modeTitle)! }));

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at top, #1a0826 0%, #04010c 45%, #02000a 100%)", color: "#E9E0FF", fontFamily: "'EB Garamond', serif" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "32px 24px" }}>

        <button onClick={onBack} style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: "8px", color: PURPLE, padding: "8px 16px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.7rem", letterSpacing: "2.5px", marginBottom: "24px" }}>← BACK</button>

        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "2.4rem", marginBottom: "6px" }}>🜏</div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "2rem", fontWeight: 900, color: PURPLE, letterSpacing: "8px", margin: "0 0 6px" }}>THE VAULT</h1>
          <div style={{ fontSize: "0.75rem", color: "rgba(192,132,252,0.6)", fontFamily: "'Cinzel', serif", letterSpacing: "3px" }}>KEYS · MASTERY · PATRONS · NIGHTFALL</div>
        </div>

        {/* KEYS SUMMARY */}
        <Section title="VAULT KEYS" sub={`${value} TOTAL VALUE`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "18px" }}>
            {(["bronze","silver","gold","obsidian"] as KeyKind[]).map(k => (
              <div key={k} style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${KEY_COLOR[k]}44`, borderRadius: "10px", padding: "14px 8px", textAlign: "center" }}>
                <div style={{ fontSize: "1.6rem", marginBottom: "4px", color: KEY_COLOR[k] }}>{KEY_GLYPH[k]}</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: KEY_COLOR[k], fontFamily: "'Cinzel', serif" }}>{keys[k]}</div>
                <div style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.4)", letterSpacing: "1.5px", fontFamily: "'Cinzel', serif", textTransform: "uppercase", marginTop: "2px" }}>{k}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "6px" }}>
            {KEY_MILESTONES.map(m => {
              const got = earnedIds.has(m.id);
              return (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 10px", background: got ? `${KEY_COLOR[m.kind]}11` : "rgba(0,0,0,0.25)", border: `1px solid ${got ? KEY_COLOR[m.kind] + "44" : "rgba(255,255,255,0.04)"}`, borderRadius: "6px", opacity: got ? 1 : 0.55 }}>
                  <div style={{ fontSize: "1rem", color: KEY_COLOR[m.kind], width: "20px", textAlign: "center" }}>{got ? KEY_GLYPH[m.kind] : "·"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: got ? "#F4F0FF" : "rgba(232,224,255,0.55)", fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>{m.label}</div>
                    <div style={{ fontSize: "0.7rem", color: "rgba(232,224,255,0.5)" }}>{m.description}</div>
                  </div>
                  <div style={{ fontSize: "0.55rem", color: KEY_COLOR[m.kind], fontFamily: "'Cinzel', serif", letterSpacing: "1.5px", textTransform: "uppercase" }}>{m.kind}</div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* LOCKED MODES + KEY BYPASS */}
        <Section title="LOCKED MODES" sub="Spend keys to bypass">
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
            {lockedModes.map(({ cond, status }) => {
              const canAfford = value >= status.keyCost;
              return (
                <div key={cond.modeTitle} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", background: status.locked ? "rgba(0,0,0,0.3)" : "rgba(168,85,247,0.08)", border: `1px solid ${status.locked ? "rgba(255,255,255,0.05)" : "rgba(192,132,252,0.3)"}`, borderRadius: "8px" }}>
                  <div style={{ fontSize: "1.1rem" }}>{status.locked ? "🔒" : "✓"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 800, color: status.locked ? "rgba(232,224,255,0.7)" : PURPLE, fontFamily: "'Cinzel', serif", letterSpacing: "1.5px" }}>{cond.modeTitle}</div>
                    <div style={{ fontSize: "0.68rem", color: "rgba(232,224,255,0.5)" }}>{status.bypassed ? "Unlocked via keys" : status.hint} · {status.current.toLocaleString()} / {status.threshold.toLocaleString()}</div>
                  </div>
                  {status.locked && !status.bypassed && (
                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        if (!confirm(`Spend ${status.keyCost} key value to unlock ${cond.modeTitle}?`)) return;
                        import("../lib/vaultKeys").then(({ spendKeysToUnlock }) => {
                          const r = spendKeysToUnlock(cond.modeTitle, status.keyCost);
                          if (!r.ok) alert(r.error || "Failed");
                          force(t => t + 1);
                        });
                      }}
                      style={{ background: canAfford ? "rgba(168,85,247,0.18)" : "rgba(255,255,255,0.04)", border: `1px solid ${canAfford ? PURPLE : "rgba(255,255,255,0.08)"}`, color: canAfford ? PURPLE : "rgba(255,255,255,0.3)", padding: "6px 12px", borderRadius: "6px", fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "2px", cursor: canAfford ? "pointer" : "not-allowed" }}>
                      USE {status.keyCost} 🔑
                    </button>
                  )}
                  {status.bypassed && <span style={{ fontSize: "0.55rem", color: PURPLE, fontFamily: "'Cinzel', serif", letterSpacing: "2px" }}>BYPASSED</span>}
                </div>
              );
            })}
          </div>
        </Section>

        {/* MASTERY */}
        <Section title="MODE MASTERY" sub={mastery.length === 0 ? "No XP yet" : `${mastery.length} MODES TRACKED`}>
          {mastery.length === 0 ? (
            <div style={{ fontSize: "0.78rem", color: "rgba(232,224,255,0.5)", fontStyle: "italic" }}>Save a story in any mode to begin earning XP. Each mode levels independently 1 → 10 with perks at every tier.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
              {mastery.map(({ modeTitle, state }) => (
                <div key={modeTitle} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(168,85,247,0.12)", borderRadius: "8px", padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 800, color: PURPLE, fontFamily: "'Cinzel', serif", letterSpacing: "1.5px" }}>{modeTitle}</div>
                    <div style={{ fontSize: "0.7rem", color: "rgba(232,224,255,0.7)", fontFamily: "'Cinzel', serif" }}>L{state.level} · {state.uses} uses</div>
                  </div>
                  <div style={{ height: "5px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden", marginBottom: "6px" }}>
                    <div style={{ height: "100%", background: `linear-gradient(90deg, ${PURPLE}cc, #F0ABFCcc)`, width: `${(state.xpInLevel / state.xpToLevel) * 100}%`, boxShadow: `0 0 6px ${PURPLE}66` }} />
                  </div>
                  {state.nextPerk && <div style={{ fontSize: "0.65rem", color: "rgba(232,224,255,0.55)", fontStyle: "italic" }}>Next (L{state.level + 1}): {state.nextPerk}</div>}
                  {!state.nextPerk && <div style={{ fontSize: "0.65rem", color: "#F0ABFC", fontWeight: 700, fontFamily: "'Cinzel', serif", letterSpacing: "1.5px" }}>ASCENDED</div>}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* PATRONS */}
        <Section title="PATRON VILLAINS" sub={patrons.length === 0 ? "None yet" : `${patrons.length} ELEVATED`}>
          {patrons.length === 0 ? (
            <div style={{ fontSize: "0.78rem", color: "rgba(232,224,255,0.5)", fontStyle: "italic" }}>Use the same villain across multiple stories to elevate them. 3 uses → Favored. 7 uses → Anointed. 15 uses → Consecrated.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
              {patrons.map(p => (
                <div key={p.villain} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(168,85,247,0.12)", borderRadius: "8px", padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 800, color: PURPLE, fontFamily: "'Cinzel', serif", letterSpacing: "1.5px" }}>{p.villain.replace(/^V:/, "")}</div>
                    <div style={{ fontSize: "0.6rem", color: "#F0ABFC", fontFamily: "'Cinzel', serif", letterSpacing: "2px", textTransform: "uppercase" }}>{p.tier} · {p.uses} uses</div>
                  </div>
                  {p.perk && <div style={{ fontSize: "0.7rem", color: "rgba(232,224,255,0.65)", fontStyle: "italic" }}>{p.perk}</div>}
                  {p.unlockedScenarios.length > 0 && (
                    <div style={{ marginTop: "6px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {p.unlockedScenarios.map(s => (
                        <span key={s} style={{ fontSize: "0.6rem", color: PURPLE, background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "4px", padding: "2px 8px", fontFamily: "'Cinzel', serif", letterSpacing: "1.5px" }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* NIGHTFALL */}
        <Section title="NIGHTFALL HOURS" sub={blood ? "🌑 BLOOD MOON" : `Next blood moon: ${nextBlood.toLocaleDateString()}`}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "6px" }}>
            {NIGHTFALL_MODES.map(w => {
              const isOpen = night.open.includes(w);
              const closedEntry = night.closed.find(c => c.window === w);
              return (
                <div key={w.modeTitle} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", background: isOpen ? "rgba(168,85,247,0.12)" : "rgba(0,0,0,0.3)", border: `1px solid ${isOpen ? "rgba(192,132,252,0.4)" : "rgba(255,255,255,0.05)"}`, borderRadius: "6px" }}>
                  <div style={{ fontSize: "1.1rem" }}>{isOpen ? "🌒" : "🌑"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 800, color: isOpen ? PURPLE : "rgba(232,224,255,0.6)", fontFamily: "'Cinzel', serif", letterSpacing: "1.5px" }}>{w.modeTitle}</div>
                    <div style={{ fontSize: "0.65rem", color: "rgba(232,224,255,0.5)" }}>{w.label} · {w.flavor}</div>
                  </div>
                  <div style={{ fontSize: "0.6rem", color: isOpen ? "#F0ABFC" : "rgba(232,224,255,0.4)", fontFamily: "'Cinzel', serif", letterSpacing: "1.5px", textTransform: "uppercase" }}>{isOpen ? "OPEN" : closedEntry?.nextOpen ?? "closed"}</div>
                </div>
              );
            })}
          </div>
        </Section>

      </div>
    </div>
  );
}
