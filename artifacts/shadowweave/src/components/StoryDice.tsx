import { useState, useCallback, useRef } from "react";
import { saveStoryToArchive } from "../lib/archive";

const HEROINES = [
  "Black Widow","Captain Marvel","Storm","Jean Grey","Scarlet Witch","She-Hulk",
  "Spider-Woman","Rogue","Wonder Woman","Supergirl","Batgirl","Black Canary",
  "Starfire","Raven","Power Girl","Zatanna","Huntress","Catwoman","Psylocke",
  "Emma Frost","Ghost-Spider","Elektra","Silk","Magik","Polaris","Shadowcat",
  "Domino","X-23","Ironheart","Kate Bishop","Valkyrie","Gamora","Wasp",
  "Batwoman","Hawkgirl","Vixen","Stargirl","Donna Troy","Mera","Jessica Cruz",
  "Invisible Woman","Ms. Marvel","America Chavez","Yelena Belova","Mantis",
  "Sif","Spectrum","Mockingbird","Firestar","Black Cat","Silver Sable","Dazzler",
];
const VILLAINS = [
  "Red Skull","MODOK","Baron Zemo","Viper (HYDRA)","Taskmaster","Kingpin",
  "Lex Luthor","Deathstroke","Ra's al Ghul","Bane","Gorilla Grodd","Brainiac",
  "Ares","Thanos","Ultron","Magneto","Apocalypse","Mister Sinister","Sabretooth",
  "The Joker","Black Manta","Reverse-Flash","Zoom","Prometheus","Sinestro",
  "Homelander","Soldier Boy","The Deep","Black Noir","Queen Maeve (corrupted)",
  "The Boys (Vought Ops)","Shadow Moon","Butcher",
];
const LOCATIONS = [
  "Abandoned HYDRA research base deep underground",
  "Floating sky fortress above the clouds",
  "Submerged Atlantean detention facility",
  "Converted Victorian mansion with hidden sub-levels",
  "Corporate black site — unmarked, windowless",
  "Alien ship in low Earth orbit",
  "Jungle compound, no outside contact",
  "Urban penthouse turned hermetic prison",
  "Arctic research station, completely isolated",
  "Ancient dungeon beneath a modern city",
  "Moving freight train crossing hostile territory",
  "Offshore oil platform repurposed as a holding facility",
  "Interdimensional pocket space — no escape route exists",
  "Desert fortress, 200 miles from civilization",
  "Decommissioned nuclear submarine",
];
const TWISTS = [
  "A second heroine is already being held in an adjacent cell",
  "The villain has a personal history with this specific heroine",
  "One of the heroine's allies secretly enabled the capture",
  "The captor claims this was done for her own protection",
  "An outside party is watching but cannot or will not intervene — yet",
  "The heroine's powers are being systematically studied and drained",
  "A rival villain offers to free her — for a terrible price",
  "The captor is themselves under orders from someone even worse",
  "There is exactly one possible escape window — and it is closing",
  "The heroine has a piece of information the captor needs above all else",
  "A countdown is running — something catastrophic happens when it ends",
  "The location is about to be destroyed; the captor has no exit either",
  "Another version of this heroine exists in this world — and is complicit",
  "The capture was staged; the real trap is what comes next",
  "Someone the heroine loves is being used as the mechanism of control",
];

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

interface DieState { value: string; rolling: boolean; }
interface Props { onClose: () => void; }

const DIE_CONFIG = [
  { label: "HEROINE",  icon: "⚡", color: "#A855F7", rgb: "168,85,247",   pool: HEROINES  },
  { label: "VILLAIN",  icon: "☠",  color: "#EF4444", rgb: "239,68,68",    pool: VILLAINS  },
  { label: "LOCATION", icon: "🏚", color: "#3B82F6", rgb: "59,130,246",   pool: LOCATIONS },
  { label: "TWIST",    icon: "🌀", color: "#F59E0B", rgb: "245,158,11",   pool: TWISTS    },
];

async function streamRequest(
  endpoint: string,
  body: object,
  onChunk: (c: string) => void
): Promise<string> {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const res = await fetch(`${base}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let full = "", buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (!json) continue;
      try {
        const ev = JSON.parse(json);
        if (ev.chunk) { full += ev.chunk; onChunk(ev.chunk); }
        if (ev.error) throw new Error(ev.error);
        if (ev.done) return full;
      } catch {}
    }
  }
  return full;
}

export default function StoryDice({ onClose }: Props) {
  const [dice, setDice] = useState<DieState[]>(
    DIE_CONFIG.map(d => ({ value: rnd(d.pool), rolling: false }))
  );
  const [allRolling, setAllRolling] = useState(false);

  // Story generation state
  const [phase, setPhase] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [streamText, setStreamText] = useState("");
  const [fullStory, setFullStory] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const accumulated = useRef("");

  const rollDie = useCallback((idx: number) => {
    if (phase === "generating") return;
    setDice(prev => prev.map((d, i) => i === idx ? { ...d, rolling: true } : d));
    setTimeout(() => {
      setDice(prev => prev.map((d, i) =>
        i === idx ? { value: rnd(DIE_CONFIG[i].pool), rolling: false } : d
      ));
    }, 450);
  }, [phase]);

  const rollAll = useCallback(() => {
    if (phase === "generating") return;
    setAllRolling(true);
    setDice(prev => prev.map(d => ({ ...d, rolling: true })));
    setTimeout(() => {
      setDice(DIE_CONFIG.map(d => ({ value: rnd(d.pool), rolling: false })));
      setAllRolling(false);
      // reset story if dice re-rolled after generation
      setPhase("idle");
      setStreamText("");
      setFullStory("");
      setSavedId(null);
    }, 500);
  }, [phase]);

  async function startStory() {
    if (phase === "generating") return;
    setPhase("generating");
    setStreamText("");
    setFullStory("");
    setErrorMsg("");
    setSavedId(null);
    accumulated.current = "";

    // scroll to story panel
    setTimeout(() => storyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);

    try {
      const heroine = dice[0].value;
      const villain = dice[1].value;
      const location = dice[2].value;
      const twist = dice[3].value;

      const full = await streamRequest(
        "/api/story/superhero",
        {
          hero: heroine,
          villain,
          setting: location,
          stakes: twist,
          weapons: "standard powers",
          storyLength: "Standard",
        },
        (chunk) => {
          accumulated.current += chunk;
          setStreamText(accumulated.current);
          storyRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      );
      setFullStory(full);
      setStreamText("");
      setPhase("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Generation failed");
      setPhase("error");
    }
  }

  function saveToArchive() {
    if (!fullStory) return;
    const heroine = dice[0].value;
    const villain = dice[1].value;
    const id = saveStoryToArchive({
      title: `${villain} vs ${heroine} — Dice Roll`,
      universe: "Story Dice",
      tool: "Story Dice",
      characters: [heroine, villain],
      chapters: [fullStory],
    });
    setSavedId(id);
  }

  const isBusy = allRolling || phase === "generating";
  const displayParas = (t: string) => t.split(/\n+/).filter(Boolean);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)",
        zIndex: 9000, display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "2rem 1.5rem", backdropFilter: "blur(8px)",
        overflowY: "auto",
      }}
    >
      <style>{`
        @keyframes diceRoll {
          0%   { transform: rotateY(0deg) scale(1); opacity: 1; }
          25%  { transform: rotateY(90deg) scale(0.85); opacity: 0.4; }
          50%  { transform: rotateY(180deg) scale(0.7); opacity: 0.15; }
          75%  { transform: rotateY(270deg) scale(0.85); opacity: 0.4; }
          100% { transform: rotateY(360deg) scale(1); opacity: 1; }
        }
        @keyframes diceGlow {
          0%,100% { box-shadow: 0 0 20px rgba(168,85,247,0.15); }
          50%      { box-shadow: 0 0 40px rgba(168,85,247,0.4); }
        }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes cursorBlink { 0%,100% { opacity:1; } 50% { opacity:0.1; } }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "rgba(8,4,20,0.97)", border: "1px solid rgba(168,85,247,0.25)",
          borderRadius: "24px", padding: "2rem", maxWidth: "780px", width: "100%",
          boxShadow: "0 0 80px rgba(168,85,247,0.12)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.55rem", letterSpacing: "6px", color: "rgba(168,85,247,0.55)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Story Dice</div>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "#E9D5FF", margin: 0, fontWeight: 700, letterSpacing: "2px" }}>Roll Your Setup</h2>
          <p style={{ color: "rgba(200,195,240,0.35)", fontSize: "0.78rem", marginTop: "0.4rem", fontFamily: "'Raleway', sans-serif" }}>
            Roll the dice, then start your story — or re-roll any die individually
          </p>
        </div>

        {/* Dice grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          {DIE_CONFIG.map((cfg, i) => (
            <div
              key={cfg.label}
              onClick={() => !isBusy && rollDie(i)}
              style={{
                background: `rgba(${cfg.rgb},0.06)`,
                border: `1px solid rgba(${cfg.rgb},0.25)`,
                borderRadius: "16px", padding: "1.25rem 1rem",
                cursor: isBusy ? "default" : "pointer",
                transition: "all 0.25s", textAlign: "center",
                animation: "diceGlow 4s ease-in-out infinite",
                animationDelay: `${i * 0.8}s`,
                opacity: isBusy ? 0.75 : 1,
              }}
              onMouseEnter={e => {
                if (isBusy) return;
                (e.currentTarget as HTMLDivElement).style.background = `rgba(${cfg.rgb},0.14)`;
                (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(${cfg.rgb},0.55)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = `rgba(${cfg.rgb},0.06)`;
                (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(${cfg.rgb},0.25)`;
              }}
            >
              <div style={{ fontSize: "1.4rem", marginBottom: "0.4rem" }}>{cfg.icon}</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.5rem", letterSpacing: "3px", color: cfg.color, textTransform: "uppercase", marginBottom: "0.75rem", opacity: 0.8 }}>{cfg.label}</div>
              <div
                style={{
                  fontFamily: "'Crimson Text', serif", fontSize: "0.9rem",
                  color: "#F0EFF8", lineHeight: 1.5, minHeight: "3.5rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  animation: dice[i].rolling ? "diceRoll 0.45s ease-in-out" : "none",
                }}
              >
                {dice[i].value}
              </div>
              {!isBusy && (
                <div style={{ marginTop: "0.75rem", fontSize: "0.6rem", color: `rgba(${cfg.rgb},0.5)`, fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px" }}>
                  click to re-roll
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", marginBottom: phase !== "idle" ? "1.75rem" : 0 }}>
          <button
            onClick={rollAll}
            disabled={isBusy}
            style={{
              padding: "0.8rem 2.2rem", borderRadius: "50px",
              cursor: isBusy ? "not-allowed" : "pointer",
              background: "linear-gradient(135deg, rgba(109,40,217,0.5), rgba(147,51,234,0.5))",
              border: "1px solid rgba(168,85,247,0.55)", color: "#E9D5FF",
              fontFamily: "'Cinzel', serif", fontSize: "0.72rem", letterSpacing: "3px",
              textTransform: "uppercase", transition: "all 0.25s",
              boxShadow: "0 0 30px rgba(168,85,247,0.2)",
              opacity: isBusy ? 0.45 : 1,
            }}
          >
            {allRolling ? "Rolling…" : "⚄ Roll All Dice"}
          </button>

          {/* ── START STORY ── */}
          <button
            onClick={startStory}
            disabled={isBusy}
            style={{
              padding: "0.8rem 2.4rem", borderRadius: "50px",
              cursor: isBusy ? "not-allowed" : "pointer",
              background: phase === "generating"
                ? "linear-gradient(135deg, rgba(200,50,50,0.4), rgba(180,30,30,0.4))"
                : "linear-gradient(135deg, rgba(200,168,75,0.85), rgba(160,120,40,0.85))",
              border: phase === "generating"
                ? "1px solid rgba(200,80,80,0.5)"
                : "1px solid rgba(200,168,75,0.7)",
              color: phase === "generating" ? "rgba(255,200,180,0.8)" : "#0a0808",
              fontFamily: "'Cinzel', serif", fontSize: "0.72rem",
              fontWeight: 700, letterSpacing: "3px",
              textTransform: "uppercase", transition: "all 0.3s",
              boxShadow: phase === "generating"
                ? "0 0 30px rgba(200,80,80,0.15)"
                : "0 0 30px rgba(200,168,75,0.25)",
              opacity: isBusy && phase !== "generating" ? 0.45 : 1,
            }}
          >
            {phase === "generating" ? "Writing…" : phase === "done" ? "◈ Story Generated" : "▶ Start Story"}
          </button>

          <button
            onClick={onClose}
            style={{
              padding: "0.8rem 1.8rem", borderRadius: "50px", cursor: "pointer",
              background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(200,195,240,0.4)", fontFamily: "'Cinzel', serif",
              fontSize: "0.72rem", letterSpacing: "2px", textTransform: "uppercase", transition: "all 0.25s",
            }}
          >
            Close
          </button>
        </div>

        {/* Story output panel */}
        {phase !== "idle" && (
          <div ref={storyRef} style={{ animation: "fadeUp 0.35s ease both" }}>
            {/* Scenario brief */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
              {[
                { label: "HEROINE",  value: dice[0].value, color: "#A855F7" },
                { label: "VILLAIN",  value: dice[1].value, color: "#EF4444" },
                { label: "LOCATION", value: dice[2].value, color: "#3B82F6" },
                { label: "TWIST",    value: dice[3].value, color: "#F59E0B" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ padding: "0.6rem 1rem", background: "rgba(8,4,20,0.7)", border: "1px solid rgba(168,85,247,0.1)", borderRadius: "8px", flex: 1, minWidth: "130px" }}>
                  <div style={{ fontSize: "0.42rem", color: `${color}88`, letterSpacing: "3px", textTransform: "uppercase", fontFamily: "'Montserrat',sans-serif", marginBottom: "0.25rem" }}>{label}</div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.75rem", color, lineHeight: 1.4 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Story box */}
            <div style={{
              background: "rgba(4,2,12,0.9)", border: "1px solid rgba(168,85,247,0.12)",
              borderLeft: "3px solid rgba(168,85,247,0.4)", borderRadius: "12px",
              padding: "1.75rem 1.75rem 1.5rem", marginBottom: "1rem",
              minHeight: phase === "generating" && !streamText ? "120px" : undefined,
            }}>
              {phase === "generating" && !streamText && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "2rem 0" }}>
                  <div style={{ fontSize: "0.52rem", color: "rgba(168,85,247,0.5)", letterSpacing: "4px", fontFamily: "'Montserrat',sans-serif", textTransform: "uppercase" }}>
                    Weaving your story…
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "rgba(168,85,247,0.6)", animation: `cursorBlink 1.4s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}

              {phase === "error" && (
                <div style={{ color: "#FF6060", fontFamily: "'Montserrat',sans-serif", fontSize: "0.78rem", padding: "1rem", background: "rgba(200,0,0,0.08)", border: "1px solid rgba(200,0,0,0.2)", borderRadius: "8px" }}>
                  ✗ {errorMsg}
                </div>
              )}

              <div style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1.02rem", lineHeight: 1.88, color: "rgba(228,222,210,0.85)" }}>
                {displayParas(streamText || fullStory).map((p, i) => (
                  <p key={i} style={{ margin: "0 0 1.1em", textIndent: "1.5em" }}>{p}</p>
                ))}
                {phase === "generating" && streamText && (
                  <span style={{ display: "inline-block", width: "2px", height: "1em", background: "rgba(168,85,247,0.8)", verticalAlign: "middle", animation: "cursorBlink 1s ease-in-out infinite", marginLeft: "2px" }} />
                )}
              </div>
            </div>

            {/* Post-generation actions */}
            {phase === "done" && (
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.5rem", animation: "fadeUp 0.3s ease both" }}>
                {!savedId ? (
                  <button onClick={saveToArchive} style={{ padding: "0.55rem 1.4rem", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "8px", color: "rgba(200,170,255,0.8)", fontFamily: "'Cinzel',serif", fontSize: "0.68rem", cursor: "pointer", letterSpacing: "1.5px", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,85,247,0.2)"; e.currentTarget.style.borderColor = "rgba(168,85,247,0.55)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(168,85,247,0.1)"; e.currentTarget.style.borderColor = "rgba(168,85,247,0.3)"; }}>
                    ◈ Save to Archive
                  </button>
                ) : (
                  <div style={{ padding: "0.5rem 1rem", background: "rgba(0,100,200,0.08)", border: "1px solid rgba(0,100,200,0.2)", borderRadius: "8px", fontSize: "0.65rem", color: "rgba(100,180,255,0.7)", fontFamily: "'Montserrat',sans-serif" }}>
                    ✓ Saved to Archive
                  </div>
                )}
                <button onClick={rollAll} style={{ padding: "0.55rem 1.4rem", background: "rgba(100,0,200,0.08)", border: "1px solid rgba(100,0,200,0.2)", borderRadius: "8px", color: "rgba(150,100,255,0.7)", fontFamily: "'Cinzel',serif", fontSize: "0.68rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(100,0,200,0.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(100,0,200,0.08)"; }}>
                  ⚄ Re-roll & Play Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
