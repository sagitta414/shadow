import { useState, useCallback } from "react";

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

interface DieState {
  value: string;
  rolling: boolean;
}

interface Props {
  onClose: () => void;
}

const DIE_CONFIG = [
  { label: "HEROINE", icon: "⚡", color: "#A855F7", rgb: "168,85,247", pool: HEROINES },
  { label: "VILLAIN", icon: "☠", color: "#EF4444", rgb: "239,68,68", pool: VILLAINS },
  { label: "LOCATION", icon: "🏚", color: "#3B82F6", rgb: "59,130,246", pool: LOCATIONS },
  { label: "TWIST", icon: "🌀", color: "#F59E0B", rgb: "245,158,11", pool: TWISTS },
];

export default function StoryDice({ onClose }: Props) {
  const [dice, setDice] = useState<DieState[]>(
    DIE_CONFIG.map(d => ({ value: rnd(d.pool), rolling: false }))
  );
  const [allRolling, setAllRolling] = useState(false);

  const rollDie = useCallback((idx: number) => {
    setDice(prev => prev.map((d, i) => i === idx ? { ...d, rolling: true } : d));
    setTimeout(() => {
      setDice(prev => prev.map((d, i) =>
        i === idx ? { value: rnd(DIE_CONFIG[i].pool), rolling: false } : d
      ));
    }, 450);
  }, []);

  const rollAll = useCallback(() => {
    setAllRolling(true);
    setDice(prev => prev.map(d => ({ ...d, rolling: true })));
    setTimeout(() => {
      setDice(DIE_CONFIG.map(d => ({ value: rnd(d.pool), rolling: false })));
      setAllRolling(false);
    }, 500);
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)",
        zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1.5rem", backdropFilter: "blur(8px)",
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
          50% { box-shadow: 0 0 40px rgba(168,85,247,0.4); }
        }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "rgba(8,4,20,0.97)", border: "1px solid rgba(168,85,247,0.25)",
          borderRadius: "24px", padding: "2rem", maxWidth: "760px", width: "100%",
          boxShadow: "0 0 80px rgba(168,85,247,0.12)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.55rem", letterSpacing: "6px", color: "rgba(168,85,247,0.55)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Story Dice</div>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.5rem", color: "#E9D5FF", margin: 0, fontWeight: 700, letterSpacing: "2px" }}>Roll Your Setup</h2>
          <p style={{ color: "rgba(200,195,240,0.35)", fontSize: "0.78rem", marginTop: "0.4rem", fontFamily: "'Raleway', sans-serif" }}>Pure inspiration — roll without committing to generation</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          {DIE_CONFIG.map((cfg, i) => (
            <div
              key={cfg.label}
              onClick={() => !allRolling && rollDie(i)}
              style={{
                background: `rgba(${cfg.rgb},0.06)`,
                border: `1px solid rgba(${cfg.rgb},0.25)`,
                borderRadius: "16px", padding: "1.25rem 1rem",
                cursor: "pointer", transition: "all 0.25s", textAlign: "center",
                animation: "diceGlow 4s ease-in-out infinite",
                animationDelay: `${i * 0.8}s`,
              }}
              onMouseEnter={e => {
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
              <div style={{ marginTop: "0.75rem", fontSize: "0.6rem", color: `rgba(${cfg.rgb},0.5)`, fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px" }}>
                click to re-roll
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={rollAll}
            disabled={allRolling}
            style={{
              padding: "0.8rem 2.2rem", borderRadius: "50px", cursor: allRolling ? "not-allowed" : "pointer",
              background: "linear-gradient(135deg, rgba(109,40,217,0.5), rgba(147,51,234,0.5))",
              border: "1px solid rgba(168,85,247,0.55)", color: "#E9D5FF",
              fontFamily: "'Cinzel', serif", fontSize: "0.72rem", letterSpacing: "3px",
              textTransform: "uppercase", transition: "all 0.25s",
              boxShadow: "0 0 30px rgba(168,85,247,0.2)",
            }}
          >
            {allRolling ? "Rolling…" : "⚄ Roll All Dice"}
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
      </div>
    </div>
  );
}
